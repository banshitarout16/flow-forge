import express from "express";
import { getAutomationRules, updateAutomationRule } from "../controllers/automationRule.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.get("/", getAutomationRules);
router.patch("/:type", roleCheck("org_admin"), updateAutomationRule);

export default router;
