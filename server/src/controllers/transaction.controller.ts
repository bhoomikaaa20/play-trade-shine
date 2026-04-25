import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import Transaction from "../models/transaction.model";
import Asset from "../models/asset.model";

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const txs = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(200);

        // attach asset symbol
        const assets = await Asset.find();
        const map: any = {};
        assets.forEach(a => map[a._id.toString()] = a.symbol);

        const formatted = txs.map(t => ({
            id: t._id,
            symbol: map[t.assetId.toString()],
            side: t.type,
            quantity: t.quantity,
            price: t.price,
            total: t.quantity * t.price,
            created_at: t.createdAt
        }));

        res.json(formatted);

    } catch {
        res.status(500).json({ message: "Failed to load transactions" });
    }
};