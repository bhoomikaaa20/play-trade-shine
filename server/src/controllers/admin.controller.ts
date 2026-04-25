import { Request, Response } from "express";
import Asset from "../models/asset.model";

// ➕ Add Asset
export const addAsset = async (req: Request, res: Response) => {
    try {
        const { symbol, name, sector, current_price } = req.body;

        const asset = await Asset.create({
            symbol,
            name,
            sector,
            current_price,
            previous_close: current_price
        });

        res.json(asset);
    } catch {
        res.status(500).json({ message: "Failed to add asset" });
    }
};

// ✏️ Update Price
export const updatePrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        const asset = await Asset.findById(id);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        asset.previous_close = asset.current_price;
        asset.current_price = price;

        await asset.save();

        res.json(asset);
    } catch {
        res.status(500).json({ message: "Failed to update price" });
    }
};

// ❌ Delete Asset
export const deleteAsset = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await Asset.findByIdAndDelete(id);

        res.json({ message: "Deleted" });
    } catch {
        res.status(500).json({ message: "Failed to delete" });
    }
};