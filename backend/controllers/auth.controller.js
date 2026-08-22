import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";
import SLAPolicy from "../models/SLAPolicy.js";
import AutomationRule from "../models/AutomationRule.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const defaultWorkflowStates = [
  { label: "New", order: 1, isInitial: true, isFinal: false },
  { label: "In Progress", order: 2, isInitial: false, isFinal: false },
  { label: "Resolved", order: 3, isInitial: false, isFinal: true },
  { label: "Closed", order: 4, isInitial: false, isFinal: true },
];

const defaultSLAHours = { Critical: 2, High: 6, Medium: 24, Low: 72 };

export const registerOrganization = asyncHandler(async (req, res) => {
  const { orgName, domainType, adminName, adminEmail, password } = req.body;

  if (!orgName || !adminName || !adminEmail || !password) {
    res.status(400);
    throw new Error("orgName, adminName, adminEmail and password are required");
  }

  const slug = orgName.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");

  const existingOrg = await Organization.findOne({ slug });
  if (existingOrg) {
    res.status(400);
    throw new Error("An organization with a similar name already exists");
  }

  const organization = await Organization.create({ name: orgName, slug, domainType });

  const adminUser = await User.create({
    organizationId: organization._id,
    name: adminName,
    email: adminEmail,
    password,
    role: "org_admin",
  });

  organization.createdBy = adminUser._id;
  await organization.save();

  await Workflow.create({
    organizationId: organization._id,
    name: "Default Workflow",
    workItemType: "General",
    states: defaultWorkflowStates,
    isDefault: true,
  });

  await SLAPolicy.insertMany(
    Object.entries(defaultSLAHours).map(([priority, hours]) => ({
      organizationId: organization._id,
      priority,
      hours,
    }))
  );

  await AutomationRule.insertMany([
    { organizationId: organization._id, type: "critical_unassigned_escalation", isActive: true, thresholdMinutes: 30 },
    { organizationId: organization._id, type: "sla_at_risk_notify", isActive: true, slaRemainingPercent: 20 },
    { organizationId: organization._id, type: "resolved_feedback_request", isActive: true },
  ]);

  const accessToken = generateAccessToken(adminUser);
  const refreshToken = generateRefreshToken(adminUser);

  res.status(201).json({
    user: adminUser.toSafeObject(),
    organization: { id: organization._id, name: organization.name, slug: organization.slug },
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { orgSlug, email, password } = req.body;

  if (!orgSlug || !email || !password) {
    res.status(400);
    throw new Error("orgSlug, email and password are required");
  }

  const organization = await Organization.findOne({ slug: orgSlug.toLowerCase().trim() });
  if (!organization) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const user = await User.findOne({ organizationId: organization._id, email: email.toLowerCase().trim() });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid organization, email, or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    user: user.toSafeObject(),
    organization: { id: organization._id, name: organization.name, slug: organization.slug },
    accessToken,
    refreshToken,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Refresh token invalid or expired, please log in again");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Refresh token invalid or expired, please log in again");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken: newRefreshToken });
});
