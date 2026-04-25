import { Request, Response } from "express";
import Asset from "../models/asset.model";

// GET ALL ASSETS
export const getAssets = async (_req: Request, res: Response) => {
    try {
        const assets = await Asset.find().sort({ symbol: 1 });
        res.json(assets);
    } catch {
        res.status(500).json({ message: "Failed to fetch assets" });
    }
};

// CREATE (ADMIN)
export const createAsset = async (req: Request, res: Response) => {
    try {
        const asset = await Asset.create(req.body);
        res.status(201).json(asset);
    } catch {
        res.status(500).json({ message: "Failed to create asset" });
    }
};