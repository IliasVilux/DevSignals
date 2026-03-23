import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import type { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";
import {
  normalizeGoogleProfile,
  normalizeGithubProfile,
  generateSignedState,
  verifySignedState,
} from "./auth.service";
import { signToken, verifyToken } from "../../lib/jwt";
import type { AuthUser } from "./auth.types";

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    (_accessToken, _refreshToken, profile, done) => {
      try {
        done(null, normalizeGoogleProfile(profile));
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

passport.use(
  "github",
  new GithubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      proxy: true,
      scope: ["user:email"],
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: object,
      done: (err: Error | null, user?: AuthUser) => void
    ) => {
      try {
        done(
          null,
          normalizeGithubProfile(
            profile as Parameters<typeof normalizeGithubProfile>[0]
          )
        );
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

function setCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("ds_auth", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("ds_auth", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export function initiateGoogle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const state = generateSignedState();
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
    session: false,
  })(req, res, next);
}

export function initiateGithub(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const state = generateSignedState();
  passport.authenticate("github", {
    scope: ["user:email"],
    state,
    session: false,
  })(req, res, next);
}

function handleOAuthCallback(provider: "google" | "github") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const state = req.query.state as string;

    if (!state || !verifySignedState(state)) {
      res.redirect(`${env.FRONTEND_URL}/login?error=invalid_state`);
      return;
    }

    passport.authenticate(
      provider,
      {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed`,
      },
      (err: Error | null, user: AuthUser | false) => {
        if (err || !user) {
          res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
          return;
        }

        const token = signToken(user);
        setCookie(res, token);
        res.redirect(`${env.FRONTEND_URL}/auth/callback?success=true`);
      }
    )(req, res, next);
  };
}

export const googleCallback = handleOAuthCallback("google");
export const githubCallback = handleOAuthCallback("github");

export function getMe(req: Request, res: Response): void {
  const token = req.cookies?.["ds_auth"];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { iat: _iat, exp: _exp, ...user } = verifyToken(token);
    res.json(user);
  } catch {
    res.status(401).json({ error: "Token expired or invalid" });
  }
}

export function logout(_req: Request, res: Response): void {
  clearCookie(res);
  res.json({ success: true });
}
