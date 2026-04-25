import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    balance: number;
    role: "user" | "admin";
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 10000 },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});

export default mongoose.model<IUser>("User", userSchema);