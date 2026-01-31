import express from "express";
import { searchContent } from "../controllers/tmdbController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchContent);
router.get(
  "/series/:id/season/:season",
  protect,
  import("../controllers/tmdbController.js").then(
    (m) => m.getSeasonDetailsController,
  ),
);

export default router;
