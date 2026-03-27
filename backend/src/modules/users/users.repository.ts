import { User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { UpsertUserData, SkillWithLevel } from "./users.types";

export interface IUsersRepository {
  upsert(data: UpsertUserData): Promise<User>;
  getUserSkills(userId: string): Promise<SkillWithLevel[]>;
  replaceUserSkills(userId: string, skills: SkillWithLevel[]): Promise<void>;
}

export class UsersRepository implements IUsersRepository {
  async upsert(data: UpsertUserData): Promise<User> {
    return prisma.user.upsert({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
      create: {
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        email: data.email,
        name: data.name,
        picture: data.picture,
      },
      update: {
        email: data.email,
        name: data.name,
        picture: data.picture,
      },
    });
  }

  async getUserSkills(userId: string): Promise<SkillWithLevel[]> {
    const rows = await prisma.userSkill.findMany({
      where: { userId },
      select: { skillId: true, level: true },
    });

    return rows.map((r) => ({ skillId: r.skillId, level: r.level }));
  }

  async replaceUserSkills(
    userId: string,
    skills: SkillWithLevel[]
  ): Promise<void> {
    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userSkill.createMany({
        data: skills.map((skill) => ({
          userId,
          skillId: skill.skillId,
          level: skill.level,
        })),
      }),
    ]);
  }
}
