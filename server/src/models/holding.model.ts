import mongoose, { Document } from "mongoose";

export interface IHolding extends Document {
    userId: string;
    assetId: string;
    quantity: number;
}

const holdingSchema = new mongoose.Schema<IHolding>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    quantity: { type: Number, default: 0 }
});

export default mongoose.model<IHolding>("Holding", holdingSchema);