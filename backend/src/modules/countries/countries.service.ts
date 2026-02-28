import { ICountriesRepository } from "./countries.repository";
import { Country } from "./countries.types";

export class CountriesService {
    constructor(private countriesRepository: ICountriesRepository) {}

    async getAllCountries(): Promise<Country[]> {
        return await this.countriesRepository.getAllCountries();
    }

    async getCountryByCode(code: string): Promise<Country | null> {
        return await this.countriesRepository.findByCode(code);
    }
}