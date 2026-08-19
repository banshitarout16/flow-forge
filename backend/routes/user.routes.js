import express from "express";
import { createUser, getUsers, updateUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.route("/")
  .get(getUsers)
  .post(roleCheck("org_admin", "manager"), createUser);

router.patch("/:id", roleCheck("org_admin", "manager"), updateUser);

export default router;
