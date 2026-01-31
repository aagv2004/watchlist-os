import express from "express";
import { searchContent } from "../controllers/tmdbController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchContent);

export default router;
