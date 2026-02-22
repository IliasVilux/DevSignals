import { prisma } from "../../lib/prisma";

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