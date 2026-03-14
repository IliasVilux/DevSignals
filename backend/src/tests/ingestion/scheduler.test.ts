import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanupOldJobs,
  startScheduler,
} from "../../../src/ingestion/scheduler";

const mockDeleteMany = vi.fn();

vi.mock("../../../src/lib/prisma", () => ({
  prisma: {
    job: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

const mockSchedule = vi.fn();
vi.mock("node-cron", () => ({
  schedule: (...args: unknown[]) => mockSchedule(...args),
}));

describe("cleanupOldJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMany.mockResolvedValue({ count: 0 });
  });

  it("deletes jobs older than 30 days", async () => {
    const before = new Date();
    await cleanupOldJobs();
    const after = new Date();

    expect(mockDeleteMany).toHaveBeenCalledOnce();

    const { where } = mockDeleteMany.mock.calls[0][0];
    const cutoff: Date = where.postedAt.lt;

    const expectedCutoffMin = new Date(before);
    expectedCutoffMin.setDate(expectedCutoffMin.getDate() - 30);
    const expectedCutoffMax = new Date(after);
    expectedCutoffMax.setDate(expectedCutoffMax.getDate() - 30);

    expect(cutoff.getTime()).toBeGreaterThanOrEqual(
      expectedCutoffMin.getTime()
    );
    expect(cutoff.getTime()).toBeLessThanOrEqual(expectedCutoffMax.getTime());
  });

  it("logs the number of deleted jobs", async () => {
    mockDeleteMany.mockResolvedValue({ count: 42 });
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await cleanupOldJobs();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("42"));

    consoleSpy.mockRestore();
  });
});

describe("startScheduler", () => {
  it("registers two cron jobs on startup", () => {
    vi.clearAllMocks();
    startScheduler();

    expect(mockSchedule).toHaveBeenCalledTimes(2);
    expect(mockSchedule.mock.calls[0][0]).toBe("0 3 * * *");
    expect(mockSchedule.mock.calls[1][0]).toBe("0 4 * * 0");
  });
});
