import mongoose, { Document } from "mongoose";

export interface IAsset extends Document {
    symbol: string;
    name: string;
    sector?: string;
    current_price: number;
    previous_close: number;
}

const assetSchema = new mongoose.Schema<IAsset>({
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    sector: { type: String },
    current_price: { type: Number, required: true },
    previous_close: { type: Number, required: true }
});

export default mongoose.model<IAsset>("Asset", assetSchema);