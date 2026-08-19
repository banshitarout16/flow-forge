import express from "express";
import { applyForRole, getJoinRequests, reviewJoinRequest } from "../controllers/joinRequest.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.post("/apply", applyForRole); // public - no auth

router.get("/", protect, tenantScope, roleCheck("org_admin"), getJoinRequests);
router.patch("/:id/review", protect, tenantScope, roleCheck("org_admin"), reviewJoinRequest);

export default router;
