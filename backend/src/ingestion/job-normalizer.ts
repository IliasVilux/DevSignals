import { AdzunaJobRaw } from "./adzuna.client";
import { NormalizedJob } from "../modules/jobs/jobs.types";
import { classifyRemoteType } from "./remote-classifier/remote-classifier";

export function normalizeJob(raw: AdzunaJobRaw, countryCode: string): NormalizedJob {
    const searchableText = `${raw.title ?? ""} ${raw.description ?? ""}`

    return {
        externalId: raw.id,
        role: raw.title,
        description: raw.description,
        company: raw.company?.display_name,
        salaryMin: raw.salary_min ?? null,
        salaryMax: raw.salary_max ?? null,
        remoteType: classifyRemoteType(searchableText),
        postedAt: new Date(raw.created),
        countryCode,
    }
}