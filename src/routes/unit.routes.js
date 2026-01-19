import { Router } from "express";
import { createUnit, listUnits } from "../controllers/unit.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.get("/", listUnits);
router.post("/", allow("MANAGER"), createUnit);

export default router;
