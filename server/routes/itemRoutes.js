import express from "express";
const router = express.Router();
import * as itemController from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";

// Definimos los caminos o endpoints
// Cuando alguien haga un POST a /api/items, se ejecuta createItem
router.post("/", protect, itemController.createItem);

// Cuando alguien haga un GET a /api/items, se ejecuta getItems
router.get("/", protect, itemController.getItems);

// Cuando alguien haga un PUT a /api/items, se ejecuta updateItem
router.put("/:id", protect, itemController.updateItem);

// Cuando alguien haga un DELETE a /api/items, se ejecuta deleteItem
router.delete("/:id", protect, itemController.deleteItem);

export default router;
