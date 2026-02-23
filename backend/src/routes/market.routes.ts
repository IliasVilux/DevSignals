import { Router } from "express";
import { MarketController } from "../modules/market/market.controller";

const router = Router();
const marketController = new MarketController();

router.get("/overview", (req, res) => marketController.getOverview(req, res));

export default router;