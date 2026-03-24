import { Router } from "express";
import { ProfileController } from "../modules/profile/profile.controller";
import { UsersRepository } from "../modules/users/users.repository";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
const profileController = new ProfileController(new UsersRepository());

router.get("/skills", requireAuth, (req, res) =>
  profileController.getProfileSkills(req, res)
);
router.put("/skills", requireAuth, (req, res) =>
  profileController.updateProfileSkills(req, res)
);

export default router;
