import pool from "../config/db.js";

const DAYS = 30;

// Same helper as in urlController.js: turns ":id" into a positive integer or null
const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// DASHBOARD SUMMARY (all URLs of the logged-in user)
export const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const [totals, today, topLinks, daily] = await Promise.all([
            pool.query(
                `SELECT COUNT(*)::int AS total_urls,
                        COALESCE(SUM(click_count), 0)::int AS total_clicks
                 FROM urls
                 WHERE user_id = $1`,
                [userId]
            ),

            pool.query(
                `SELECT COUNT(*)::int AS clicks_today
                 FROM click_events ce
                 JOIN urls u ON u.id = ce.url_id
                 WHERE u.user_id = $1
                   AND ce.clicked_at::date = CURRENT_DATE`,
                [userId]
            ),

            pool.query(
                `SELECT id, short_code, original_url, click_count
                 FROM urls
                 WHERE user_id = $1
                 ORDER BY click_count DESC, created_at DESC
                 LIMIT 5`,
                [userId]
            ),

            // generate_series creates one row per day, so days with
            // zero clicks still appear (charts need that)
            pool.query(
                `SELECT to_char(day, 'YYYY-MM-DD') AS date,
                        COUNT(ce.id)::int AS clicks
                 FROM generate_series(
                        (CURRENT_DATE - ($2::int - 1))::timestamp,
                        CURRENT_DATE::timestamp,
                        interval '1 day'
                      ) AS day
                 LEFT JOIN click_events ce
                   ON ce.clicked_at::date = day::date
                  AND ce.url_id IN (SELECT id FROM urls WHERE user_id = $1)
                 GROUP BY day
                 ORDER BY day`,
                [userId, DAYS]
            )
        ]);

        return res.status(200).json({
            data: {
                totalUrls: totals.rows[0].total_urls,
                totalClicks: totals.rows[0].total_clicks,
                clicksToday: today.rows[0].clicks_today,
                topLinks: topLinks.rows,
                dailyClicks: daily.rows
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ANALYTICS FOR ONE URL
export const getUrlAnalytics = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Invalid URL id"
            });
        }

        // Ownership check first
        const urlResult = await pool.query(
            `SELECT id, original_url, short_code, click_count, created_at
             FROM urls
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (urlResult.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found"
            });
        }

        const [daily, referrers] = await Promise.all([
            pool.query(
                `SELECT to_char(day, 'YYYY-MM-DD') AS date,
                        COUNT(ce.id)::int AS clicks
                 FROM generate_series(
                        (CURRENT_DATE - ($2::int - 1))::timestamp,
                        CURRENT_DATE::timestamp,
                        interval '1 day'
                      ) AS day
                 LEFT JOIN click_events ce
                   ON ce.clicked_at::date = day::date
                  AND ce.url_id = $1
                 GROUP BY day
                 ORDER BY day`,
                [id, DAYS]
            ),

            pool.query(
                `SELECT COALESCE(referrer, 'Direct') AS referrer,
                        COUNT(*)::int AS clicks
                 FROM click_events
                 WHERE url_id = $1
                 GROUP BY 1
                 ORDER BY clicks DESC
                 LIMIT 5`,
                [id]
            )
        ]);

        return res.status(200).json({
            data: {
                url: urlResult.rows[0],
                totalClicks: urlResult.rows[0].click_count,
                dailyClicks: daily.rows,
                topReferrers: referrers.rows
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};