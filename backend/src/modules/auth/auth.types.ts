export interface AuthUser {
  sub: string;
  provider: "google" | "github";
  email: string;
  name: string;
  picture: string | null;
}

export interface JwtPayload extends AuthUser {
  iat: number;
  exp: number;
}
