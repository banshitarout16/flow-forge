import express from "express";
import { createTeam, getTeams, getTeamById, updateTeam, deleteTeam } from "../controllers/team.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.route("/")
  .get(getTeams)
  .post(roleCheck("org_admin", "manager"), createTeam);

router.route("/:id")
  .get(getTeamById)
  .patch(roleCheck("org_admin", "manager"), updateTeam)
  .delete(roleCheck("org_admin"), deleteTeam);

export default router;
