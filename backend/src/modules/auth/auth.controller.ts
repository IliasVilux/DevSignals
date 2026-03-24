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
import { signToken } from "../../lib/jwt";
import type { AuthUser } from "./auth.types";
import { IUsersRepository } from "../users/users.repository";

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.CALLBACK_BASE_URL}/auth/google/callback`,
    },
    (_accessToken, _refreshToken, profile, done) => {
      try {
        done(null, normalizeGoogleProfile(profile) as unknown as Express.User);
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
      callbackURL: `${env.CALLBACK_BASE_URL}/auth/github/callback`,
      scope: ["user:email"],
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: object,
      done: (err: Error | null, user?: Express.User) => void
    ) => {
      try {
        const user = normalizeGithubProfile(
          profile as Parameters<typeof normalizeGithubProfile>[0]
        );
        done(null, user as unknown as Express.User);
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

export class AuthController {
  constructor(private usersRepository: IUsersRepository) {}

  initiateGoogle(req: Request, res: Response, next: NextFunction): void {
    const state = generateSignedState();
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state,
      session: false,
    })(req, res, next);
  }

  initiateGithub(req: Request, res: Response, next: NextFunction): void {
    const state = generateSignedState();
    passport.authenticate("github", {
      scope: ["user:email"],
      state,
      session: false,
    })(req, res, next);
  }

  handleOAuthCallback(provider: "google" | "github") {
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
        async (err: Error | null, user: AuthUser | false) => {
          if (err || !user) {
            res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
            return;
          }

          try {
            const dbUser = await this.usersRepository.upsert(user);

            const token = signToken({
              sub: dbUser.id,
              provider: dbUser.provider,
              email: dbUser.email,
              name: dbUser.name,
              picture: dbUser.picture,
            });

            setCookie(res, token);
            res.redirect(`${env.FRONTEND_URL}/auth/callback?success=true`);
          } catch {
            res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
          }
        }
      )(req, res, next);
    };
  }

  getMe(req: Request, res: Response): void {
    const { iat: _iat, exp: _exp, ...user } = req.user!;
    res.json(user);
  }

  logout(_req: Request, res: Response): void {
    clearCookie(res);
    res.json({ success: true });
  }
}
