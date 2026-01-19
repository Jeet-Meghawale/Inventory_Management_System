import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allow } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
    "/login",
    login
);


router.post(
    "/register",
    auth,
    allow("MANAGER"),
    register
);

export default router;
