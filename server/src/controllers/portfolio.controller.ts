import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import Holding from "../models/holding.model";
import Asset from "../models/asset.model";
import User from "../models/User";

export const getPortfolio = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const holdings = await Holding.find({ userId });
        const assets = await Asset.find();

        const assetMap: any = {};
        assets.forEach(a => {
            assetMap[a._id.toString()] = a;
        });

        const rows = holdings.map(h => {
            const asset = assetMap[h.assetId.toString()];
            if (!asset) return null;

            return {
                asset_id: asset._id,
                quantity: h.quantity,
                avg_cost: asset.current_price,
                assets: {
                    _id: asset._id,
                    symbol: asset.symbol,
                    name: asset.name,
                    current_price: asset.current_price
                }
            };
        }).filter(Boolean);

        const user = await User.findById(userId);

        res.json({
            rows,
            cash: user?.balance || 0
        });

    } catch {
        res.status(500).json({ message: "Failed to load portfolio" });
    }
};