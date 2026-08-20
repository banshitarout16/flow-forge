import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";


export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamId } = req.body;

  const existing = await User.findOne({ organizationId: req.organizationId, email });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists in your organization");
  }

  const user = await User.create({
    organizationId: req.organizationId,
    name,
    email,
    password,
    role: role || "requester",
    teamId: teamId || null,
  });

  res.status(201).json(user.toSafeObject());
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ organizationId: req.organizationId }).select("-password");
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, role, teamId, isActive } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    { name, role, teamId, isActive },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});
