import { Router } from "express";
import { issueMaterial } from "../controllers/issue.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.post("/", allow("INBOUND"), issueMaterial);
router.post("/auto", allow("INBOUND"), autoIssueMaterial);


export default router;
