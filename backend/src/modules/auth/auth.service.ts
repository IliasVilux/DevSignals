import crypto from "crypto";
import { env } from "../../config/env";
import type { AuthUser } from "./auth.types";

interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

interface GithubProfile {
  id: string;
  displayName: string;
  username?: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

const STATE_TTL_MS = 5 * 60 * 1000;

export function normalizeGoogleProfile(profile: GoogleProfile): AuthUser {
  return {
    provider: "google",
    providerAccountId: profile.id,
    email: profile.emails?.[0]?.value ?? "",
    name: profile.displayName,
    picture: profile.photos?.[0]?.value ?? null,
  };
}

export function normalizeGithubProfile(profile: GithubProfile): AuthUser {
  return {
    provider: "github",
    providerAccountId: profile.id,
    email: profile.emails?.[0]?.value ?? "",
    name: profile.displayName || profile.username || "",
    picture: profile.photos?.[0]?.value ?? null,
  };
}

export function generateSignedState(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(8).toString("hex");
  const data = `${timestamp}.${nonce}`;
  const hmac = crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(data)
    .digest("hex");

  return Buffer.from(`${data}.${hmac}`).toString("base64url");
}

export function verifySignedState(state: string): boolean {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return false;

    const data = decoded.slice(0, lastDot);
    const receivedHmac = decoded.slice(lastDot + 1);
    const [timestamp] = data.split(".");

    if (!timestamp || !receivedHmac) return false;

    const expectedHmac = crypto
      .createHmac("sha256", env.JWT_SECRET)
      .update(data)
      .digest("hex");

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(receivedHmac, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
    if (!isValidSignature) return false;

    const issuedAt = parseInt(timestamp, 10);
    if (isNaN(issuedAt)) return false;
    if (Date.now() - issuedAt > STATE_TTL_MS) return false;

    return true;
  } catch {
    return false;
  }
}
