import dotenv from "dotenv";
import app from "./app";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});