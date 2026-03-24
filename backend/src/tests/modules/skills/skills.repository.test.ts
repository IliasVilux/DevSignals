import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillsRepository } from "../../../modules/skills/skills.repository";
import { prisma } from "../../../lib/prisma";
import { Skill, SkillCategory } from "../../../../generated/prisma/client";

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    skill: {
      findMany: vi.fn(),
    },
  },
}));

describe("SkillsRepository", () => {
  const repo = new SkillsRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all skills ordered by category then name", async () => {
    const mockSkills: Skill[] = [
      { id: "s1", name: "PostgreSQL", category: SkillCategory.DATABASE },
      { id: "s2", name: "React", category: SkillCategory.FRAMEWORK },
      { id: "s3", name: "TypeScript", category: SkillCategory.LANGUAGE },
    ];

    vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

    const result = await repo.findAll();

    expect(prisma.skill.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    expect(result).toEqual(mockSkills);
  });

  it("returns empty array when no skills exist", async () => {
    vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

    const result = await repo.findAll();

    expect(result).toEqual([]);
  });
});
