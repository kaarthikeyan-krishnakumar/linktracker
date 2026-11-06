import express from "express";

import { redirectToOriginalUrl } from "../controllers/urlController.js";

const router = express.Router();

router.get("/:shortCode", redirectToOriginalUrl);

export default router;