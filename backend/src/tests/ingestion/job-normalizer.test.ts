import { describe, it, expect } from "vitest";
import { normalizeJob, detectRemoteType } from "../../ingestion/job-normalizer";
import { RemoteType } from "@prisma/client";

describe("normalizeJob", () => {
    const baseRawJob = {
        id: "123",
        title: "Software Engineer",
        description: "This is a software engineering job at Tech Co.",
        created: "2024-01-01T00:00:00Z",
        company: { display_name: "Tech Co" },
        salary_min: 50000,
        salary_max: 100000,
    }

    it ("maps fields correctly", () => {
        const normalized = normalizeJob(baseRawJob, "US");
        expect(normalized.externalId).toBe("123");
        expect(normalized.role).toBe("Software Engineer");
        expect(normalized.description).toBe("This is a software engineering job at Tech Co.");
        expect(normalized.company).toBe("Tech Co");
        expect(normalized.salaryMin).toBe(50000);
        expect(normalized.salaryMax).toBe(100000);
        expect(normalized.remoteType).toBe(RemoteType.ONSITE);
        expect(normalized.postedAt).toEqual(new Date("2024-01-01T00:00:00Z"));
        expect(normalized.countryCode).toBe("US");
    })

    it("detects remote type", () => {
        expect(detectRemoteType("This is a remote job")).toBe(RemoteType.REMOTE);
    })

    it("detects hybrid type", () => {
        expect(detectRemoteType("This is a hybrid job")).toBe(RemoteType.HYBRID);
    })

    it("defaults to onsite if no keywords", () => {
        expect(detectRemoteType("This is a regular job")).toBe(RemoteType.ONSITE);
    })

    it("handles missing optional fields", () => {
        const minimalJob = normalizeJob({ ...baseRawJob, company: undefined, salary_min: undefined, salary_max: undefined, description: undefined }, "US");
        expect(minimalJob.externalId).toEqual("123");
        expect(minimalJob.role).toEqual("Software Engineer");
        expect(minimalJob.description).toBeUndefined();
        expect(minimalJob.company).toBeUndefined();
        expect(minimalJob.salaryMin).toBeNull();
        expect(minimalJob.salaryMax).toBeNull();
        expect(minimalJob.remoteType).toBe(RemoteType.ONSITE);
        expect(minimalJob.postedAt).toEqual(new Date("2024-01-01T00:00:00Z"));
        expect(minimalJob.countryCode).toBe("US");
    })
});