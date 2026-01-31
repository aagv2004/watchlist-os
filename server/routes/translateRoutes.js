import express from "express";
import { translateLyrics } from "../controllers/translateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, translateLyrics);

export default router;
