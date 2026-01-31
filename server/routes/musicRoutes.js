import express from "express";
import {
  searchMusicContent,
  getMusicTracks,
  getTrackLyrics,
} from "../controllers/musicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchMusicContent);
router.get("/album/:id", protect, getMusicTracks);
router.get("/lyrics", protect, getTrackLyrics);

export default router;
