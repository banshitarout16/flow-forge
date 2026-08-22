import Organization from "../models/Organization.js";
import User from "../models/User.js";
import WorkItem from "../models/WorkItem.js";
import Workflow from "../models/Workflow.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { generateWorkItemCode } from "../utils/generateWorkItemCode.js";
import { computeSLADeadline } from "../services/slaEngine.service.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

export const raiseComplaint = asyncHandler(async (req, res) => {
  const { orgSlug, name, email, password, title, description, category, priority } = req.body;

  if (!orgSlug || !name || !email || !password || !title) {
    res.status(400);
    throw new Error("orgSlug, name, email, password and title are required");
  }

  const organization = await Organization.findOne({ slug: orgSlug.toLowerCase().trim() });
  if (!organization) {
    res.status(404);
    throw new Error("Organization not found. Check the organization link you were given.");
  }

  const defaultWorkflow = await Workflow.findOne({ organizationId: organization._id, isDefault: true });
  if (!defaultWorkflow) {
    res.status(400);
    throw new Error("This organization hasn't configured a workflow yet");
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ organizationId: organization._id, email: normalizedEmail });

  if (user) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error(
        "An account with this email already exists. Use your existing password, or log in and raise the request from your dashboard."
      );
    }
  } else {
    user = await User.create({
      organizationId: organization._id,
      name,
      email: normalizedEmail,
      password,
      role: "requester",
    });
  }

  const initialState = defaultWorkflow.states.find((s) => s.isInitial) || defaultWorkflow.states[0];
  const code = await generateWorkItemCode(organization._id);
  const finalPriority = priority || "Medium";
  const createdAt = new Date();
  const slaDeadline = await computeSLADeadline(organization._id, finalPriority, createdAt);

  const workItem = await WorkItem.create({
    organizationId: organization._id,
    workflowId: defaultWorkflow._id,
    code,
    title,
    description,
    category: category || "General",
    priority: finalPriority,
    createdBy: user._id,
    status: initialState.label,
    slaDeadline,
    slaStatus: slaDeadline ? "on_track" : "not_tracked",
    activityLog: [{ action: "Created via public request form", performedBy: user._id }],
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  req.io?.to(organization._id.toString()).emit("workItem:created", workItem);

  res.status(201).json({
    message: "Your request has been submitted and sent to the team.",
    user: user.toSafeObject(),
    organization: { id: organization._id, name: organization.name, slug: organization.slug },
    workItem,
    accessToken,
    refreshToken,
  });
});
