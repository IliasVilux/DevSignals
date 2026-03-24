export interface AuthUser {
  provider: "google" | "github";
  providerAccountId: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface TokenData {
  sub: string;
  provider: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface JwtPayload extends TokenData {
  iat: number;
  exp: number;
}
