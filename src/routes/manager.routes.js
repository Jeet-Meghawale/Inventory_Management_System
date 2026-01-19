import { Router } from "express";
import { editEntity, managerOverview } from "../controllers/manager.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.put("/edit", allow("MANAGER"), editEntity);
router.get("/overview", allow("MANAGER"), managerOverview);

export default router;
