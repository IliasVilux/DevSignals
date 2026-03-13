import { RemoteType } from "../../../generated/prisma/client";
import { ExtractedSkill } from "../../ingestion/skill-extractor/skill-extractor";

export interface NormalizedJob {
  externalId: string;
  role: string;
  description?: string | null;
  company?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  remoteType: RemoteType;
  postedAt: Date;
  countryCode: string;
  skills: ExtractedSkill[];
}

export interface TopRoles {
  role: string;
  count: number;
}
