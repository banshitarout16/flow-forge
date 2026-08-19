import express from "express";
import { getMyOrganization, getDashboardSummary } from "../controllers/organization.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";

const router = express.Router();

router.get("/me", protect, tenantScope, getMyOrganization);
router.get("/dashboard-summary", protect, tenantScope, getDashboardSummary);

export default router;
