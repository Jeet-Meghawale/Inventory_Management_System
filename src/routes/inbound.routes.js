import { Router } from "express";
import { createInbound, listInbound } from "../controllers/inbound.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.post("/", allow("INBOUND"), createInbound);
router.get("/", listInbound);

export default router;
