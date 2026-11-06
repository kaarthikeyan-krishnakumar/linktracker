import express from "express";

import {
    getSummary,
    getUrlAnalytics
} from "../controllers/analyticsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authMiddleware, getSummary);
router.get("/:id", authMiddleware, getUrlAnalytics);

export default router;