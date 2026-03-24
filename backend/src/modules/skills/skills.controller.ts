import { Request, Response } from "express";
import { ISkillsRepository } from "./skills.repository";

export class SkillsController {
  constructor(private skillsRepository: ISkillsRepository) {}

  async getAllSkills(_req: Request, res: Response) {
    try {
      const skills = await this.skillsRepository.findAll();
      res.json(skills);
    } catch {
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  }
}
