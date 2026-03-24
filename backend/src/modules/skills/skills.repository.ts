import { Skill } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export interface ISkillsRepository {
  findAll(): Promise<Skill[]>;
}

export class SkillsRepository implements ISkillsRepository {
  async findAll(): Promise<Skill[]> {
    return prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }
}
