import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret-that-is-long-enough-for-testing-purposes",
  },
}));

import { signToken, verifyToken } from "../../lib/jwt";
import type { TokenData } from "../../modules/auth/auth.types";

const testUser: TokenData = {
  sub: "cuid_abc123",
  provider: "google",
  email: "test@example.com",
  name: "Test User",
  picture: "https://example.com/avatar.jpg",
};

afterEach(() => {
  vi.useRealTimers();
});

describe("jwt", () => {
  describe("signToken + verifyToken roundtrip", () => {
    it("returns the same payload after sign and verify", () => {
      const token = signToken(testUser);
      const payload = verifyToken(token);

      expect(payload.sub).toBe(testUser.sub);
      expect(payload.provider).toBe(testUser.provider);
      expect(payload.email).toBe(testUser.email);
      expect(payload.name).toBe(testUser.name);
      expect(payload.picture).toBe(testUser.picture);
    });

    it("payload includes numeric iat and exp fields", () => {
      const token = signToken(testUser);
      const payload = verifyToken(token);

      expect(typeof payload.iat).toBe("number");
      expect(typeof payload.exp).toBe("number");
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });
  });

  describe("verifyToken rejects invalid tokens", () => {
    it("throws when the signature has been tampered", () => {
      const token = signToken(testUser);
      // Replace the last segment (signature) with garbage
      const [header, payload] = token.split(".");
      const tampered = `${header}.${payload}.invalidsignature`;
      expect(() => verifyToken(tampered)).toThrow();
    });

    it("throws on a malformed token string", () => {
      expect(() => verifyToken("not.a.valid.jwt")).toThrow();
    });

    it("throws on an expired token", () => {
      vi.useFakeTimers();

      const token = signToken(testUser);

      // Advance 8 days — beyond the 7-day TTL hardcoded in jwt.ts
      vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

      expect(() => verifyToken(token)).toThrow();
    });
  });
});
