import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload, TokenData } from "../modules/auth/auth.types";

const JWT_TTL_SECONDS = 60 * 60 * 24 * 7;

export function signToken(data: TokenData): string {
  return jwt.sign(data, env.JWT_SECRET, { expiresIn: JWT_TTL_SECONDS });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
