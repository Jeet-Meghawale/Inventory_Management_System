import { Router } from "express";
import { createOrder } from "../controllers/production.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.use(auth);
router.post("/", allow("PRODUCTION"), createOrder);
router.get("/", allow("PRODUCTION", "INBOUND", "MANAGER"), listOrders);

export default router;
