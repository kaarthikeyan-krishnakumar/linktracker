import express from "express";

import {
    createShortUrl,
    getUserUrls,
    getUrlById,
    deleteUrl
} from "../controllers/urlController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createShortUrl);
router.get("/",authMiddleware,getUserUrls);
router.get("/:id",authMiddleware,getUrlById);
router.delete("/:id",authMiddleware,deleteUrl);

export default router;