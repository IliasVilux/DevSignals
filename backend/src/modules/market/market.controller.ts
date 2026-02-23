import { Request, Response } from "express";
import { MarketService } from "./market.service";
import { JobsRepository } from "../jobs/jobs.repository";

export class MarketController {
    private marketService: MarketService;

    constructor() {
        this.marketService = new MarketService(new JobsRepository());
    }

    async getOverview(req: Request, res: Response) {
        try {
            const overviewData = await this.marketService.getMarketOverview(req.query);
            res.json(overviewData);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch market overview" });
        }
    }
}