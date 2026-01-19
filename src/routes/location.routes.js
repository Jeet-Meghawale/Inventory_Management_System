import { Router } from "express";
import { createLocation, listLocations } from "../controllers/location.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.get("/", listLocations);
router.post("/", allow("MANAGER"), createLocation);

export default router;
