import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import assetRoutes from "./routes/asset.routes";
import tradeRoutes from "./routes/trade.routes";
import transactionRoutes from "./routes/transaction.routes";
import portfolioRoutes from "./routes/portfolio.routes";
import adminRoutes from "./routes/admin.routes";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/assets", assetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);


export default app;