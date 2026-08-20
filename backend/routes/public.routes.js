import express from "express";
import { raiseComplaint } from "../controllers/publicComplaint.controller.js";

const router = express.Router();

router.post("/raise-complaint", raiseComplaint); 

export default router;
