import { Router } from "express";
import {
  initiateGoogle,
  googleCallback,
  initiateGithub,
  githubCallback,
  getMe,
  logout,
} from "../modules/auth/auth.controller";

const router = Router();

router.get("/google", initiateGoogle);
router.get("/google/callback", googleCallback);
router.get("/github", initiateGithub);
router.get("/github/callback", githubCallback);
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
