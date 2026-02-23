import { RemoteType } from "@prisma/client";
import { AdzunaJobRaw } from "./adzuna.client";
import { NormalizedJob } from "../modules/jobs/jobs.types";

export function detectRemoteType(description: string): RemoteType {
  const lower = description.toLowerCase();

  if (lower.includes("hybrid")) return RemoteType.HYBRID;
  if (lower.includes("remote")) return RemoteType.REMOTE;

  return RemoteType.ONSITE;
}

export function normalizeJob(raw: AdzunaJobRaw, countryCode: string): NormalizedJob {
    return {
        externalId: raw.id,
        role: raw.title,
        description: raw.description,
        company: raw.company?.display_name,
        salaryMin: raw.salary_min ?? null,
        salaryMax: raw.salary_max ?? null,
        remoteType: detectRemoteType(raw.description ?? ""),
        postedAt: new Date(raw.created),
        countryCode,
    }
}