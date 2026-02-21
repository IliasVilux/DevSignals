import { env } from "../config/env";

interface AdLocation {
  display_name?: string;
  area?: string[];
}

interface AdCategory {
  tag: string;
  label: string;
}

interface AdCompany {
  display_name?: string;
  canonical_name?: string;
  count?: number;
  avarage_salary?: number;
}

export interface AdzunaJobRaw {
    id: string;
    title: string;
    description: string;
    created: string;
    redirect_url?: string;
    adref?: string;
    latitude?: number;
    longitude?: number;
    location?: AdLocation;
    category?: AdCategory;
    company?: AdCompany;
    salary_min?: number;
    salary_max?: number;
    salary_is_predicted?: string // "0" or "1"
    contract_time?: string;
    contract_type?: string;
}

const BASE_URL = "http://api.adzuna.com/v1/api/jobs"

export async function fetchJobsFromAdzuna(countryCode: string, page = 1): Promise<AdzunaJobRaw[]> {
  // const url = `${BASE_URL}/${countryCode.toLowerCase()}/search/${page}?app_id=${env.ADZUNA_APP_ID}&app_key=${env.ADZUNA_API_KEY}&category=it-jobs&results_per_page=20&content-type=application/json`
  const url = new URL(`${BASE_URL}/${countryCode.toLowerCase()}/search/${page}`)
  url.searchParams.set("app_id", env.ADZUNA_APP_ID)
  url.searchParams.set("app_key", env.ADZUNA_API_KEY)
  url.searchParams.set("category", "it-jobs")
  url.searchParams.set("results_per_page", "20")
  url.searchParams.set("content-type", "application/json")

  const response = await fetch(url)

  if (!response.ok) throw new Error(`Adzuna API error: ${response.status}`)
  
  const data = await response.json()
  return data.results as AdzunaJobRaw[]
}