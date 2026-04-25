import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "7d"
    });
};
export const getMe = async (req: any, res: Response) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};
// REGISTER
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        res.status(201).json({
            token: generateToken(user._id.toString()),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            token: generateToken(user._id.toString()),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
};

export const getCurrentUser = async (req: any, res: Response) => {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance   // ✅ IMPORTANT
    });
};