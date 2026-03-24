import { Router } from "express";
import { SkillsController } from "../modules/skills/skills.controller";
import { SkillsRepository } from "../modules/skills/skills.repository";

const router = Router();
const skillsController = new SkillsController(new SkillsRepository());

router.get("/", (req, res) => skillsController.getAllSkills(req, res));

export default router;
