import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileController } from "../../../modules/profile/profile.controller";
import type { IUsersRepository } from "../../../modules/users/users.repository";
import type { Request, Response } from "express";
import type { JwtPayload } from "../../../modules/auth/auth.types";
import type { SkillWithLevel } from "../../../modules/users/users.types";

const mockUser: JwtPayload = {
  sub: "cuid_abc123",
  provider: "google",
  email: "test@example.com",
  name: "Test User",
  picture: null,
  iat: 0,
  exp: 9999999999,
};

const mockRepository = (): IUsersRepository => ({
  upsert: vi.fn(),
  getUserSkills: vi.fn(),
  replaceUserSkills: vi.fn(),
});

const mockRes = () => {
  const res = {} as Response;
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({ user: mockUser, body: {}, ...overrides }) as unknown as Request;

describe("ProfileController", () => {
  let repo: IUsersRepository;
  let controller: ProfileController;

  beforeEach(() => {
    repo = mockRepository();
    controller = new ProfileController(repo);
    vi.clearAllMocks();
  });

  describe("getProfileSkills", () => {
    it("returns skills for the authenticated user", async () => {
      const skills: SkillWithLevel[] = [
        { skillId: "skill1", level: "BASIC" },
        { skillId: "skill2", level: "INTERMEDIATE" },
      ];
      vi.mocked(repo.getUserSkills).mockResolvedValue(skills);

      const req = mockReq();
      const res = mockRes();

      await controller.getProfileSkills(req, res);

      expect(repo.getUserSkills).toHaveBeenCalledWith("cuid_abc123");
      expect(res.json).toHaveBeenCalledWith({ skills });
    });

    it("returns empty array when user has no skills", async () => {
      vi.mocked(repo.getUserSkills).mockResolvedValue([]);

      const req = mockReq();
      const res = mockRes();

      await controller.getProfileSkills(req, res);

      expect(res.json).toHaveBeenCalledWith({ skills: [] });
    });

    it("returns 500 when repository throws", async () => {
      vi.mocked(repo.getUserSkills).mockRejectedValue(new Error("DB error"));

      const req = mockReq();
      const res = mockRes();

      await controller.getProfileSkills(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch profile skills",
      });
    });
  });

  describe("updateProfileSkills", () => {
    it("replaces user skills and returns success message", async () => {
      vi.mocked(repo.replaceUserSkills).mockResolvedValue(undefined);

      const skills: SkillWithLevel[] = [
        { skillId: "skill1", level: "BASIC" },
        { skillId: "skill2", level: "ADVANCED" },
      ];
      const req = mockReq({ body: { skills } });
      const res = mockRes();

      await controller.updateProfileSkills(req, res);

      expect(repo.replaceUserSkills).toHaveBeenCalledWith(
        "cuid_abc123",
        skills
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Skills updated" });
    });

    it("replaces user skills with empty array (clears all skills)", async () => {
      vi.mocked(repo.replaceUserSkills).mockResolvedValue(undefined);

      const req = mockReq({ body: { skills: [] } });
      const res = mockRes();

      await controller.updateProfileSkills(req, res);

      expect(repo.replaceUserSkills).toHaveBeenCalledWith("cuid_abc123", []);
      expect(res.json).toHaveBeenCalledWith({ message: "Skills updated" });
    });

    it("returns 500 when repository throws", async () => {
      vi.mocked(repo.replaceUserSkills).mockRejectedValue(
        new Error("DB error")
      );

      const req = mockReq({
        body: { skills: [{ skillId: "skill1", level: "BASIC" }] },
      });
      const res = mockRes();

      await controller.updateProfileSkills(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update profile skills",
      });
    });
  });
});
