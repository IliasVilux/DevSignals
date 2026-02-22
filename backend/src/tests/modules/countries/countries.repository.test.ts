import { describe, it, expect, vi, beforeEach } from "vitest"
import { CountriesRepository } from "../../../modules/countries/countries.repository"
import { prisma } from "../../../lib/prisma"
import { Country } from "../../../modules/countries/countries.types"

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    country: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

describe("CountriesRepository", () => {
    const repo = new CountriesRepository();

    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("returns all countries", async () => {
        const mockCountries = [
            { id: "1", code: "US", name: "United States" },
            { id: "2", code: "CA", name: "Canada" },
        ] as Country[];

        vi.mocked(prisma.country.findMany).mockResolvedValue(mockCountries);

        const result = await repo.getAllCountries();

        expect(prisma.country.findMany).toHaveBeenCalled();
        expect(result).toEqual(mockCountries);
    })

    it("returns country by code", async () => {
        const mockCountry = { id: "1", code: "US", name: "United States" } as Country;

        vi.mocked(prisma.country.findUnique).mockResolvedValue(mockCountry);

        const result = await repo.findByCode("US");

        expect(prisma.country.findUnique).toHaveBeenCalledWith({ where: { code: "US" } });
        expect(result).toEqual(mockCountry);
    })

    it("returns null if country code not found", async () => {
        vi.mocked(prisma.country.findUnique).mockResolvedValue(null);

        const result = await repo.findByCode("XX");

        expect(result).toBeNull();
    })
})