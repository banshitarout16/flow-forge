import express from "express";
import {
  createWorkItem,
  getWorkItems,
  getWorkItemById,
  updateStatus,
  assignWorkItem,
  addComment,
  uploadAttachment,
} from "../controllers/workItem.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantScope } from "../middlewares/tenantScope.middleware.js";
import { roleCheck } from "../middlewares/roleCheck.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect, tenantScope);

router.route("/")
  .get(getWorkItems)
  .post(createWorkItem);

router.get("/:id", getWorkItemById);
router.patch("/:id/status", updateStatus);
router.patch("/:id/assign", roleCheck("org_admin", "manager"), assignWorkItem);
router.post("/:id/comments", addComment);
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

export default router;
