import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import User from "../models/User";
import Asset from "../models/asset.model";
import Holding from "../models/holding.model";
import Transaction from "../models/transaction.model";

// BUY
export const buyAsset = async (req: AuthRequest, res: Response) => {
    try {
        const { asset_id, quantity } = req.body;

        const user = await User.findById(req.user.id);
        const asset = await Asset.findById(asset_id);

        if (!user || !asset) {
            return res.status(404).json({ error: "User or Asset not found" });
        }

        const total = asset.current_price * quantity;

        if (user.balance < total) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        user.balance -= total;
        await user.save();

        let holding = await Holding.findOne({
            userId: user._id,
            assetId: asset_id
        });

        if (!holding) {
            holding = await Holding.create({
                userId: user._id,
                assetId: asset_id,
                quantity
            });
        } else {
            holding.quantity += quantity;
            await holding.save();
        }

        await Transaction.create({
            userId: user._id,
            assetId: asset_id,
            type: "buy",
            quantity,
            price: asset.current_price
        });

        res.json({ success: true });

    } catch {
        res.status(500).json({ error: "Buy failed" });
    }
};

// SELL
export const sellAsset = async (req: AuthRequest, res: Response) => {
    try {
        const { asset_id, quantity } = req.body;

        const user = await User.findById(req.user.id);
        const asset = await Asset.findById(asset_id);

        const holding = await Holding.findOne({
            userId: user?._id,
            assetId: asset_id
        });

        if (!user || !asset || !holding || holding.quantity < quantity) {
            return res.status(400).json({ error: "Not enough holdings" });
        }

        const total = asset.current_price * quantity;

        user.balance += total;
        await user.save();

        holding.quantity -= quantity;
        await holding.save();

        await Transaction.create({
            userId: user._id,
            assetId: asset_id,
            type: "sell",
            quantity,
            price: asset.current_price
        });

        res.json({ success: true });

    } catch {
        res.status(500).json({ error: "Sell failed" });
    }
};