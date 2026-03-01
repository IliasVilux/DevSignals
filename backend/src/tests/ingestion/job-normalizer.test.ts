import { describe, it, expect } from "vitest";
import { normalizeJob } from "../../ingestion/job-normalizer";
import { classifyRemoteType } from "../../ingestion/remote-classifier/remote-classifier";
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
    };

    it("maps fields correctly", () => {
        const normalized = normalizeJob(baseRawJob, "US");

        expect(normalized.externalId).toBe("123");
        expect(normalized.role).toBe("Software Engineer");
        expect(normalized.description).toBe(
            "This is a software engineering job at Tech Co."
        );
        expect(normalized.company).toBe("Tech Co");
        expect(normalized.salaryMin).toBe(50000);
        expect(normalized.salaryMax).toBe(100000);
        expect(normalized.remoteType).toBe(RemoteType.ONSITE);
        expect(normalized.postedAt).toEqual(
            new Date("2024-01-01T00:00:00Z")
        );
        expect(normalized.countryCode).toBe("US");
    });

    it("detects remote from description", () => {
        expect(classifyRemoteType("This is a remote job")).toBe(
            RemoteType.REMOTE
        );
    });

    it("detects hybrid from description", () => {
        expect(classifyRemoteType("This is a hybrid job")).toBe(
            RemoteType.HYBRID
        );
    });

    it("detects spanish remote", () => {
        expect(classifyRemoteType("Trabajo 100% remoto")).toBe(
            RemoteType.REMOTE
        );
    });

    it("detects french hybrid", () => {
        expect(classifyRemoteType("Poste en mode hybride")).toBe(
            RemoteType.HYBRID
        );
    });

    it("is case insensitive", () => {
        expect(classifyRemoteType("REMOTE POSITION")).toBe(
            RemoteType.REMOTE
        );
    });

    it("hybrid has priority over remote", () => {
        expect(
            classifyRemoteType("Hybrid remote position")
        ).toBe(RemoteType.HYBRID);
    });

    it("defaults to onsite if no keywords", () => {
        expect(classifyRemoteType("Regular office job")).toBe(
            RemoteType.ONSITE
        );
    });

    it("handles empty string", () => {
        expect(classifyRemoteType("")).toBe(
            RemoteType.ONSITE
        );
    });

    it("detects remote from title when description missing", () => {
        const jobWithRemoteTitle = {
            ...baseRawJob,
            title: "Remote Software Engineer",
            description: undefined,
        };

        const normalized = normalizeJob(jobWithRemoteTitle, "US");

        expect(normalized.remoteType).toBe(RemoteType.REMOTE);
    });

    it("handles missing optional fields", () => {
        const minimalJob = normalizeJob(
            {
                ...baseRawJob,
                company: undefined,
                salary_min: undefined,
                salary_max: undefined,
                description: undefined,
            },
            "US"
        );

        expect(minimalJob.externalId).toEqual("123");
        expect(minimalJob.role).toEqual("Software Engineer");
        expect(minimalJob.description).toBeUndefined();
        expect(minimalJob.company).toBeUndefined();
        expect(minimalJob.salaryMin).toBeNull();
        expect(minimalJob.salaryMax).toBeNull();
        expect(minimalJob.remoteType).toBe(RemoteType.ONSITE);
        expect(minimalJob.postedAt).toEqual(
            new Date("2024-01-01T00:00:00Z")
        );
        expect(minimalJob.countryCode).toBe("US");
    });

    it("detects flexible hybrid work", () => {
        expect(classifyRemoteType("Flexible hybrid working model"))
            .toBe(RemoteType.HYBRID);
    });

    it("detects telework remote", () => {
        expect(classifyRemoteType("Possibility of telework"))
            .toBe(RemoteType.REMOTE);
    });

    it("detects french remote", () => {
        expect(classifyRemoteType("Travail à distance possible"))
            .toBe(RemoteType.REMOTE);
    });
});