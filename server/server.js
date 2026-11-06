import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query("SELECT 1");

        app.listen(PORT, () => {
            console.log(`LinkTrack server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to database:", error.message);
        process.exit(1);
    }
};

startServer();