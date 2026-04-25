import express from "express";
import { getPortfolio } from "../controllers/portfolio.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protect, getPortfolio);

export default router;