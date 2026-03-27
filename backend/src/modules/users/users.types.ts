import { SkillLevel } from "../../../generated/prisma/client";

export interface UpsertUserData {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface SkillWithLevel {
  skillId: string;
  level: SkillLevel;
}
