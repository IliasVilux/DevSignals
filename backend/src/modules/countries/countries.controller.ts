import { Request, Response } from "express";
import { CountriesRepository } from "./countries.repository";
import { CountriesService } from "./countries.service";

export class CountriesController {
    private countriesService: CountriesService;

    constructor() {
        this.countriesService = new CountriesService(new CountriesRepository());
    }

    async getAllCountries(req: Request, res: Response) {
        try {
            const countries = await this.countriesService.getAllCountries();

            res.json(countries);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch countries" });
        }
    }

    async getCountryByCode(req: Request<{ code: string }>, res: Response) {
        try {
            const { code } = req.params;
            const country = await this.countriesService.getCountryByCode(code.toUpperCase());

            if (!country) {
                return res.status(404).json({ error: "Country not found" });
            }

            res.json(country);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch country" });
        }
    }
}
