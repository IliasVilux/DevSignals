import { Request, Response } from "express";
import { MarketService } from "./market.service";
import { JobsRepository } from "../jobs/jobs.repository";
import { MarketOverviewFilters } from "./market.types";

export class MarketController {
    private marketService: MarketService;

    constructor() {
        this.marketService = new MarketService(new JobsRepository());
    }

    async getOverview(req: Request, res: Response) {
        try {
            const filters = this.parseFilters(req);
            const overviewData = await this.marketService.getMarketOverview(filters);
            
            res.json(overviewData);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch market overview" });
        }
    }

    private parseFilters(req: Request): MarketOverviewFilters {
        const { countryCode, role } = req.query;

        if (countryCode !== undefined && typeof countryCode !== "string") throw new Error("Invalid country code");
        if (role !== undefined && typeof role !== "string") throw new Error("Invalid role");

        return {
            countryCode,
            role,
        }
    }
}