import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller";
import { UsersRepository } from "../modules/users/users.repository";

const router = Router();
const authController = new AuthController(new UsersRepository());

router.get("/google", (req, res, next) =>
  authController.initiateGoogle(req, res, next)
);
router.get("/google/callback", authController.handleOAuthCallback("google"));
router.get("/github", (req, res, next) =>
  authController.initiateGithub(req, res, next)
);
router.get("/github/callback", authController.handleOAuthCallback("github"));
router.get("/me", (req, res) => authController.getMe(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
