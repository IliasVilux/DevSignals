import { RemoteType } from "@prisma/client";
import { AdzunaJobRaw } from "./adzuna.client";

export interface NormalizedJob {
    externalId: string;
    role: string;
    company?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    remoteType: RemoteType;
    postedAt: Date;
    countryCode: string;
}

function detectRemoteType(description: string): RemoteType {
  const lower = description.toLowerCase();

  if (lower.includes("remote")) return RemoteType.REMOTE;
  if (lower.includes("hybrid")) return RemoteType.HYBRID;

  return RemoteType.ONSITE;
}

export function normalizeJob(raw: AdzunaJobRaw, countryCode: string): NormalizedJob {
    return {
        externalId: raw.id,
        role: raw.title,
        company: raw.company?.display_name,
        salaryMin: raw.salary_min ?? null,
        salaryMax: raw.salary_max ?? null,
        remoteType: detectRemoteType(raw.description),
        postedAt: new Date(raw.created),
        countryCode,
    }
}