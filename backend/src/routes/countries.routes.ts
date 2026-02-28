import { Router } from "express";
import { CountriesController } from "../modules/countries/countries.controller";

const router = Router();
const countriesController = new CountriesController();

router.get("/", (req, res) => countriesController.getAllCountries(req, res));
router.get("/:code", (req, res) => countriesController.getCountryByCode(req, res));

export default router;