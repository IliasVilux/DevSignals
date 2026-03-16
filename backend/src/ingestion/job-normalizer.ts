import { AdzunaJobRaw } from "./adzuna.client";
import { NormalizedJob } from "../modules/jobs/jobs.types";
import { classifyRemoteType } from "./remote-classifier/remote-classifier";
import { extractSkills } from "./skill-extractor/skill-extractor";

export function normalizeRole(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, "") // remove (parenthetical content)
    .replace(/\s+[-–—]\s+.+$/u, "") // remove trailing qualifiers after -, – or —
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim();
}

export function normalizeJob(
  raw: AdzunaJobRaw,
  countryCode: string
): NormalizedJob {
  const searchableText = `${raw.title ?? ""} ${raw.description ?? ""}`;

  return {
    externalId: raw.id,
    role: normalizeRole(raw.title),
    description: raw.description,
    company: raw.company?.display_name,
    salaryMin: raw.salary_min ?? null,
    salaryMax: raw.salary_max ?? null,
    remoteType: classifyRemoteType(searchableText),
    postedAt: new Date(raw.created),
    countryCode,
    skills: extractSkills(raw.title, raw.description),
  };
}
