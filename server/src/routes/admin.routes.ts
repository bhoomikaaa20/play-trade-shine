import express from "express";
import { addAsset, updatePrice, deleteAsset } from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const router = express.Router();

router.post("/asset", protect, isAdmin, addAsset);
router.put("/asset/:id", protect, isAdmin, updatePrice);
router.delete("/asset/:id", protect, isAdmin, deleteAsset);

export default router;