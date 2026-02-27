import { RemoteType } from "@prisma/client";

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
}

export interface TopRoles {
    role: string;
    count: number;
}