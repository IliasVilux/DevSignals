import { RemoteType } from "@prisma/client";

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