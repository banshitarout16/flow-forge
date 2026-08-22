import express from "express";
import { registerOrganization, login, getMe, refreshAccessToken } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register-organization", registerOrganization);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.get("/me", protect, getMe);

export default router;
