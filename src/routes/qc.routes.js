import { Router } from "express";
import { inspect, listPendingQC } from "../controllers/qc.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.post("/inspect", allow("QC"), inspect);
router.get("/pending", allow("QC"), listPendingQC);

export default router;
