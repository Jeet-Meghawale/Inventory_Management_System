import { Router } from "express";
import { createPallet, movePallet } from "../controllers/pallet.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.post("/", allow("INBOUND"), createPallet);
router.post("/move", allow("INBOUND"), movePallet);
router.get("/", allow("INBOUND", "MANAGER"), listPallets);

export default router;
