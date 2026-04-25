import express from "express";
import { buyAsset, sellAsset } from "../controllers/trade.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/buy", protect, buyAsset);
router.post("/sell", protect, sellAsset);

export default router;