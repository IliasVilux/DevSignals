import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret-that-is-long-enough-for-testing-purposes",
    JWT_EXPIRES_IN: "1h",
  },
}));

import { requireAuth } from "../../middleware/requireAuth";
import { signToken } from "../../lib/jwt";
import type { AuthUser } from "../../modules/auth/auth.types";

const testUser: AuthUser = {
  sub: "google:123",
  provider: "google",
  email: "test@example.com",
  name: "Test User",
  picture: null,
};

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function mockReq(cookies: Record<string, string> = {}) {
  return { cookies } as unknown as Request;
}

describe("requireAuth middleware", () => {
  it("calls next() and sets req.user when cookie is valid", () => {
    const token = signToken(testUser);
    const req = mockReq({ ds_auth: token });
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.sub).toBe(testUser.sub);
    expect(req.user?.provider).toBe(testUser.provider);
    expect(req.user?.email).toBe(testUser.email);
  });

  it("returns 401 when ds_auth cookie is missing", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is malformed", () => {
    const req = mockReq({ ds_auth: "not.a.real.token" });
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token expired or invalid",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is signed with wrong secret", () => {
    const fakePayload = Buffer.from(JSON.stringify({ sub: "evil" })).toString(
      "base64url"
    );
    const fakeToken = `eyJhbGciOiJIUzI1NiJ9.${fakePayload}.wrongsignature`;
    const req = mockReq({ ds_auth: fakeToken });
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
