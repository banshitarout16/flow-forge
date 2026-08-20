import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.middleware.js";
import { registerSocketHandlers } from "./sockets/socketHandlers.js";

import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import teamRoutes from "./routes/team.routes.js";
import userRoutes from "./routes/user.routes.js";
import workItemRoutes from "./routes/workItem.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import joinRequestRoutes from "./routes/joinRequest.routes.js";
import publicRoutes from "./routes/public.routes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
});
registerSocketHandlers(io);


app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "FlowForge API" }));

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/work-items", workItemRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FlowForge API running on port ${PORT}`));
