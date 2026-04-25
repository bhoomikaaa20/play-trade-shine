import express from "express";
import { getAssets, createAsset } from "../controllers/asset.controller";

const router = express.Router();

router.get("/", getAssets);
router.post("/", createAsset);

export default router;