import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "LinkTrack API is running"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/", redirectRoutes);
app.use("/api/analytics",analyticsRoutes);

// Unknown route (nothing above matched)
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Central error handler 
app.use((err, req, res, next) => {
    // Malformed JSON in the request body
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON in request body"
        });
    }

    console.error(err);

    return res.status(500).json({
        message: "Server error"
    });
});

export default app;