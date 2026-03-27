import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersRepository } from "../../../modules/users/users.repository";
import { prisma } from "../../../lib/prisma";
import { User } from "../../../../generated/prisma/client";
import { UpsertUserData } from "../../../modules/users/users.types";

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
    userSkill: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("UsersRepository", () => {
  const repo = new UsersRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upsert", () => {
    const userData: UpsertUserData = {
      provider: "google",
      providerAccountId: "114116138",
      email: "ilias@example.com",
      name: "Ilias",
      picture: "https://photo.example.com/ilias.jpg",
    };

    it("creates a new user when none exists", async () => {
      const createdUser: User = {
        id: "cuid_abc123",
        ...userData,
        createdAt: new Date("2026-03-24T10:00:00Z"),
        updatedAt: new Date("2026-03-24T10:00:00Z"),
      };

      vi.mocked(prisma.user.upsert).mockResolvedValue(createdUser);

      const result = await repo.upsert(userData);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: "114116138",
          },
        },
        create: {
          provider: "google",
          providerAccountId: "114116138",
          email: "ilias@example.com",
          name: "Ilias",
          picture: "https://photo.example.com/ilias.jpg",
        },
        update: {
          email: "ilias@example.com",
          name: "Ilias",
          picture: "https://photo.example.com/ilias.jpg",
        },
      });
      expect(result).toEqual(createdUser);
    });

    it("updates an existing user's profile data", async () => {
      const updatedData: UpsertUserData = {
        provider: "github",
        providerAccountId: "987654",
        email: "new-email@example.com",
        name: "Updated Name",
        picture: null,
      };

      const updatedUser: User = {
        id: "cuid_existing",
        ...updatedData,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-03-24T12:00:00Z"),
      };

      vi.mocked(prisma.user.upsert).mockResolvedValue(updatedUser);

      const result = await repo.upsert(updatedData);

      expect(result.id).toBe("cuid_existing");
      expect(result.name).toBe("Updated Name");
      expect(result.picture).toBeNull();
    });
  });

  describe("getUserSkills", () => {
    it("returns skills with levels for a user", async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId: "user1", skillId: "skill_ts", level: "BASIC" },
        { userId: "user1", skillId: "skill_react", level: "INTERMEDIATE" },
      ]);

      const result = await repo.getUserSkills("user1");

      expect(prisma.userSkill.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        select: { skillId: true, level: true },
      });
      expect(result).toEqual([
        { skillId: "skill_ts", level: "BASIC" },
        { skillId: "skill_react", level: "INTERMEDIATE" },
      ]);
    });

    it("returns empty array when user has no skills", async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);

      const result = await repo.getUserSkills("user_no_skills");

      expect(result).toEqual([]);
    });
  });

  describe("replaceUserSkills", () => {
    it("deletes existing skills and creates new ones with levels in a transaction", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        { count: 2 },
        { count: 3 },
      ]);

      await repo.replaceUserSkills("user1", [
        { skillId: "skill_ts", level: "BASIC" },
        { skillId: "skill_react", level: "INTERMEDIATE" },
        { skillId: "skill_node", level: "ADVANCED" },
      ]);

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.userSkill.deleteMany({ where: { userId: "user1" } }),
        prisma.userSkill.createMany({
          data: [
            { userId: "user1", skillId: "skill_ts", level: "BASIC" },
            { userId: "user1", skillId: "skill_react", level: "INTERMEDIATE" },
            { userId: "user1", skillId: "skill_node", level: "ADVANCED" },
          ],
        }),
      ]);
    });

    it("handles replacing with an empty skill set", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        { count: 3 },
        { count: 0 },
      ]);

      await repo.replaceUserSkills("user1", []);

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.userSkill.deleteMany({ where: { userId: "user1" } }),
        prisma.userSkill.createMany({ data: [] }),
      ]);
    });
  });
});
