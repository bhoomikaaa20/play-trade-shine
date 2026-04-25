import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
    userId: string;
    assetId: string;
    type: "buy" | "sell";
    quantity: number;
    price: number;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    type: { type: String, enum: ["buy", "sell"] },
    quantity: Number,
    price: Number
}, { timestamps: true });

export default mongoose.model<ITransaction>("Transaction", transactionSchema);