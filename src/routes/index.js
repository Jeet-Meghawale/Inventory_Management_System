import { Router } from "express";

import authRoutes from "./auth.routes.js";
import unitRoutes from "./unit.routes.js";
import inboundRoutes from "./inbound.routes.js";
import qcRoutes from "./qc.routes.js";
import palletRoutes from "./pallet.routes.js";
import locationRoutes from "./location.routes.js";
import productionRoutes from "./production.routes.js";
import issueRoutes from "./issue.routes.js";
import managerRoutes from "./manager.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/units", unitRoutes);
router.use("/inbound", inboundRoutes);
router.use("/qc", qcRoutes);
router.use("/pallets", palletRoutes);
router.use("/locations", locationRoutes);
router.use("/production-orders", productionRoutes);
router.use("/issue", issueRoutes);
router.use("/manager", managerRoutes);

export default router;
