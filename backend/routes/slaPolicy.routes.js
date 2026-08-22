import express from "express";
import { getSLAPolicies, updateSLAPolicy } from "../controllers/slaPolicy.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.get("/", getSLAPolicies);
router.patch("/:priority", roleCheck("org_admin"), updateSLAPolicy);

export default router;
