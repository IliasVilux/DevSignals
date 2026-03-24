import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret-that-is-long-enough-for-hmac-testing",
  },
}));

import {
  normalizeGoogleProfile,
  normalizeGithubProfile,
  generateSignedState,
  verifySignedState,
} from "../../../modules/auth/auth.service";

afterEach(() => {
  vi.useRealTimers();
});

describe("auth.service", () => {
  describe("normalizeGoogleProfile", () => {
    it("maps id, displayName, email and photo correctly", () => {
      const profile = {
        id: "109876543210",
        displayName: "Jane Doe",
        emails: [{ value: "jane@gmail.com" }],
        photos: [{ value: "https://example.com/photo.jpg" }],
      };

      const user = normalizeGoogleProfile(profile);

      expect(user.providerAccountId).toBe("109876543210");
      expect(user.provider).toBe("google");
      expect(user.email).toBe("jane@gmail.com");
      expect(user.name).toBe("Jane Doe");
      expect(user.picture).toBe("https://example.com/photo.jpg");
    });

    it("returns null picture when photos array is missing", () => {
      const profile = {
        id: "123",
        displayName: "No Photo",
        emails: [{ value: "nophoto@gmail.com" }],
      };

      const user = normalizeGoogleProfile(profile);
      expect(user.picture).toBeNull();
    });

    it("returns empty string email when emails array is missing", () => {
      const profile = { id: "123", displayName: "No Email" };
      const user = normalizeGoogleProfile(profile);
      expect(user.email).toBe("");
    });
  });

  describe("normalizeGithubProfile", () => {
    it("maps id, displayName, email and photo correctly", () => {
      const profile = {
        id: "98765",
        displayName: "John Dev",
        username: "johndev",
        emails: [{ value: "john@github.com" }],
        photos: [{ value: "https://avatars.githubusercontent.com/u/98765" }],
      };

      const user = normalizeGithubProfile(profile);

      expect(user.providerAccountId).toBe("98765");
      expect(user.provider).toBe("github");
      expect(user.email).toBe("john@github.com");
      expect(user.name).toBe("John Dev");
    });

    it("falls back to username when displayName is empty", () => {
      const profile = {
        id: "555",
        displayName: "",
        username: "fallback-user",
        emails: [{ value: "fb@github.com" }],
      };

      const user = normalizeGithubProfile(profile);
      expect(user.name).toBe("fallback-user");
    });
  });

  describe("generateSignedState + verifySignedState", () => {
    it("a freshly generated state is valid", () => {
      const state = generateSignedState();
      expect(verifySignedState(state)).toBe(true);
    });

    it("returns false for a tampered state", () => {
      const state = generateSignedState();
      // Decode, flip a character in the HMAC, re-encode
      const decoded = Buffer.from(state, "base64url").toString("utf8");
      const flipped =
        decoded.slice(0, -1) + (decoded.endsWith("a") ? "b" : "a");
      const tampered = Buffer.from(flipped).toString("base64url");
      expect(verifySignedState(tampered)).toBe(false);
    });

    it("returns false for an empty string", () => {
      expect(verifySignedState("")).toBe(false);
    });

    it("returns false for a random string", () => {
      expect(verifySignedState("totally-invalid")).toBe(false);
    });

    it("returns false for a state older than 5 minutes", () => {
      vi.useFakeTimers();

      const state = generateSignedState();

      vi.advanceTimersByTime(6 * 60 * 1000);

      expect(verifySignedState(state)).toBe(false);
    });

    it("generates unique states on each call", () => {
      const state1 = generateSignedState();
      const state2 = generateSignedState();
      expect(state1).not.toBe(state2);
    });
  });
});
