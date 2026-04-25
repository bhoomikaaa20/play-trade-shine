import express from "express";
import { getTransactions } from "../controllers/transaction.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protect, getTransactions);

export default router;