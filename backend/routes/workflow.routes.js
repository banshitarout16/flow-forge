import express from "express";
import {
  createWorkflow, getWorkflows, getWorkflowById, updateWorkflow, deleteWorkflow,
} from "../controllers/workflow.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.route("/")
  .get(getWorkflows)
  .post(roleCheck("org_admin"), createWorkflow);

router.route("/:id")
  .get(getWorkflowById)
  .patch(roleCheck("org_admin"), updateWorkflow)
  .delete(roleCheck("org_admin"), deleteWorkflow);

export default router;
