import { prisma } from "../../lib/prisma";
import { Country } from "./countries.types";

export interface ICountriesRepository {
    getAllCountries(): Promise<Country[]>;
    findByCode(code: string): Promise<Country | null>;
}

export class CountriesRepository {
    async getAllCountries() {
        return prisma.country.findMany();
    }

    async findByCode(code: string) {
        return prisma.country.findUnique({
            where: { code }
        })
    }
}