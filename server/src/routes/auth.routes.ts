import express from "express";
import {
    register,
    login,
    getCurrentUser
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);   // ✅ matches controller
router.post("/login", login);         // ✅ matches controller
router.get("/me", protect, getCurrentUser);

export default router;