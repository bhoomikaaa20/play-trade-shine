import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import User from "../models/User";

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin only access" });
    }

    next();
};