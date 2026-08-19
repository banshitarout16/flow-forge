import Organization from "../models/Organization.js";
import JoinRequest from "../models/JoinRequest.js";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

// @desc  Public application to join an org as an agent or manager. Sits pending
//        until an org_admin reviews it - the applicant sets their own password now,
//        so approval only needs to flip a status, no credential handoff required.
// @route POST /api/join-requests/apply
export const applyForRole = asyncHandler(async (req, res) => {
  const { orgSlug, name, email, password, requestedRole, department, experience } = req.body;

  if (!orgSlug || !name || !email || !password || !requestedRole) {
    res.status(400);
    throw new Error("orgSlug, name, email, password and requestedRole are required");
  }

  if (!["agent", "manager"].includes(requestedRole)) {
    res.status(400);
    throw new Error("requestedRole must be 'agent' or 'manager'");
  }

  const organization = await Organization.findOne({ slug: orgSlug.toLowerCase().trim() });
  if (!organization) {
    res.status(404);
    throw new Error("Organization not found. Check the organization link you were given.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ organizationId: organization._id, email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error("An account with this email already exists in this organization.");
  }

  const existingPending = await JoinRequest.findOne({
    organizationId: organization._id,
    email: normalizedEmail,
    status: "pending",
  });
  if (existingPending) {
    res.status(400);
    throw new Error("You already have a pending application with this organization.");
  }

  await JoinRequest.create({
    organizationId: organization._id,
    name,
    email: normalizedEmail,
    password,
    requestedRole,
    department,
    experience,
  });

  res.status(201).json({
    message: "Your application has been submitted. The hiring manager will review it soon.",
  });
});


export const getJoinRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { organizationId: req.organizationId, status: status || "pending" };
  const requests = await JoinRequest.find(filter).sort({ createdAt: -1 });
  res.json(requests);
});


export const reviewJoinRequest = asyncHandler(async (req, res) => {
  const { action, reviewNote } = req.body; 

  const joinRequest = await JoinRequest.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!joinRequest) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (joinRequest.status !== "pending") {
    res.status(400);
    throw new Error("This application has already been reviewed");
  }

  if (action === "approve") {
    const user = new User({
      organizationId: joinRequest.organizationId,
      name: joinRequest.name,
      email: joinRequest.email,
      password: joinRequest.password, 
      role: joinRequest.requestedRole,
    });
    user._skipPasswordHash = true;
    await user.save();
    joinRequest.status = "approved";
  } else if (action === "reject") {
    joinRequest.status = "rejected";
  } else {
    res.status(400);
    throw new Error("action must be 'approve' or 'reject'");
  }

  joinRequest.reviewedBy = req.user._id;
  joinRequest.reviewedAt = new Date();
  joinRequest.reviewNote = reviewNote || "";
  await joinRequest.save();

  res.json({ message: `Application ${joinRequest.status}`, joinRequest });
});
