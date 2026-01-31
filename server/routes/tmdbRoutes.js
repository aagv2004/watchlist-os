import express from "express";
import {
  searchContent,
  getSeasonDetailsController,
} from "../controllers/tmdbController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchContent);
router.get("/series/:id/season/:season", protect, getSeasonDetailsController);

export default router;
