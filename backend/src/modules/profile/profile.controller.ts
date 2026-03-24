import { Request, Response } from "express";
import { IUsersRepository } from "../users/users.repository";
import { UpdateSkillsBody } from "./profile.types";

export class ProfileController {
  constructor(private usersRepository: IUsersRepository) {}

  async getProfileSkills(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.sub;
      const skillIds = await this.usersRepository.getUserSkillIds(userId);
      res.json({ skillIds });
    } catch {
      res.status(500).json({ error: "Failed to fetch profile skills" });
    }
  }

  async updateProfileSkills(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { skillIds } = req.body as UpdateSkillsBody;
      await this.usersRepository.replaceUserSkills(userId, skillIds);
      res.json({ message: "Skills updated" });
    } catch {
      res.status(500).json({ error: "Failed to update profile skills" });
    }
  }
}
