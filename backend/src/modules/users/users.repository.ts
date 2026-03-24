import { User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { UpsertUserData } from "./users.types";

export interface IUsersRepository {
  upsert(data: UpsertUserData): Promise<User>;
  getUserSkillIds(userId: string): Promise<string[]>;
  replaceUserSkills(userId: string, skillIds: string[]): Promise<void>;
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

  async getUserSkillIds(userId: string): Promise<string[]> {
    const rows = await prisma.userSkill.findMany({
      where: { userId },
      select: { skillId: true },
    });

    return rows.map((r) => r.skillId);
  }

  async replaceUserSkills(userId: string, skillIds: string[]): Promise<void> {
    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
      }),
    ]);
  }
}
