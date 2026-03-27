import { Request, Response } from "express";
import { IUsersRepository } from "../users/users.repository";
import { UpdateSkillsBody } from "./profile.types";

export class ProfileController {
  constructor(private usersRepository: IUsersRepository) {}

  async getProfileSkills(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.sub;
      const skills = await this.usersRepository.getUserSkills(userId);
      res.json({ skills });
    } catch {
      res.status(500).json({ error: "Failed to fetch profile skills" });
    }
  }

  async updateProfileSkills(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { skills } = req.body as UpdateSkillsBody;
      await this.usersRepository.replaceUserSkills(userId, skills);
      res.json({ message: "Skills updated" });
    } catch {
      res.status(500).json({ error: "Failed to update profile skills" });
    }
  }
}
