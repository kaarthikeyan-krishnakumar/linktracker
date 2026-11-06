import pool from "../config/db.js";
import generateShortCode from "../utils/generateShortCode.js";
import validator from "validator";

// CREATE SHORT URL
export const createShortUrl = async (req, res) => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl || !validator.isURL(originalUrl, {
            protocols: ["http", "https"],
            require_protocol: true
        })) {
            return res.status(400).json({
                message: "Please provide a valid HTTP or HTTPS URL"
            });
        }

        let result;
        let attempts = 0;

        // Retry if a short code collision occurs
        while (attempts < 3) {
            const shortCode = generateShortCode();

            try {
                result = await pool.query(
                    `INSERT INTO urls
                    (user_id, original_url, short_code)
                    VALUES ($1, $2, $3)
                    RETURNING id, original_url, short_code, created_at`,
                    [req.user.id, originalUrl, shortCode]
                );

                break;

            } catch (error) {
                if (error.code === "23505") {
                    attempts++;
                    continue;
                }

                throw error;
            }
        }

        if (!result) {
            return res.status(500).json({
                message: "Could not generate a unique short URL"
            });
        }

        const shortUrl =
            `${process.env.BASE_URL}/${result.rows[0].short_code}`;

        return res.status(201).json({
            message: "Short URL created successfully",
            data: {
                ...result.rows[0],
                shortUrl
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// Records one click: saves a click event AND increments the counter.
// Both queries run in a transaction, so either both succeed or neither does.
const recordClick = async (urlId, referrer) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO click_events (url_id, clicked_at, referrer)
             VALUES ($1, NOW(), $2)`,
            [urlId, referrer]
        );

        await client.query(
            "UPDATE urls SET click_count = click_count + 1 WHERE id = $1",
            [urlId]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// REDIRECT TO ORIGINAL URL
export const redirectToOriginalUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const result = await pool.query(
            `SELECT id, original_url, expires_at
             FROM urls
             WHERE short_code = $1`,
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Short URL not found"
            });
        }

        const url = result.rows[0];

        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            return res.status(410).json({
                message: "This link has expired"
            });
        }

        // The browser header is spelled "Referer" (a historic typo in the HTTP spec)
        const referrer = req.get("Referer") || null;

        // A tracking failure should never stop the visitor from reaching the site
        try {
            await recordClick(url.id, referrer);
        } catch (trackingError) {
            console.error("Click tracking failed:", trackingError);
        }

        return res.redirect(302, url.original_url);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// GET all the url of a particular user
export const getUserUrls = async (req, res) => {
    try {
        const { search } = req.query;

        // Build a pattern for ILIKE. Escape % and _ so they are treated as
        // normal characters (short codes can contain "_").
        const pattern = search
            ? `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`
            : null;

        const result = await pool.query(
            `SELECT id, original_url, short_code, click_count,
                    expires_at, created_at
             FROM urls
             WHERE user_id = $1
               AND ($2::text IS NULL
                    OR original_url ILIKE $2
                    OR short_code ILIKE $2)
             ORDER BY created_at DESC`,
            [req.user.id, pattern]
        );

        const urls = result.rows.map((row) => ({
            ...row,
            shortUrl: `${process.env.BASE_URL}/${row.short_code}`
        }));

        return res.status(200).json({
            count: urls.length,
            data: urls
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// Converts the :id from the URL into a positive integer, or null if invalid.
// Without this, /api/urls/abc would make PostgreSQL throw an error (500).
const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// GET ONE URL (only if it belongs to the logged-in user)
export const getUrlById = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Invalid URL id"
            });
        }

        const result = await pool.query(
            `SELECT id, original_url, short_code, click_count,
                    expires_at, created_at
             FROM urls
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found"
            });
        }

        const row = result.rows[0];

        return res.status(200).json({
            data: {
                ...row,
                shortUrl: `${process.env.BASE_URL}/${row.short_code}`
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// DELETE A URL (and its click events)
export const deleteUrl = async (req, res) => {
    const id = parseId(req.params.id);

    if (!id) {
        return res.status(400).json({
            message: "Invalid URL id"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Ownership check: the URL must exist AND belong to this user
        const owned = await client.query(
            "SELECT id FROM urls WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (owned.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "URL not found"
            });
        }

        // Child rows first, then the parent row cause of foreign key (safety even on delete cascade)
        await client.query(
            "DELETE FROM click_events WHERE url_id = $1",
            [id]
        );
        await client.query(
            "DELETE FROM urls WHERE id = $1",
            [id]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "URL deleted successfully"
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    } finally {
        client.release();
    }
};