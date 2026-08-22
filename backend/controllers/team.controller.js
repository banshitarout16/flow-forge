import Team from "../models/Team.js";
import User from "../models/User.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

export const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const team = await Team.create({
    organizationId: req.organizationId,
    name,
    description,
  });
  res.status(201).json(team);
});

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ organizationId: req.organizationId }).populate("members", "name email role");
  res.json(teams);
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate(
    "members",
    "name email role"
  );
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }
  res.json(team);
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }
  res.json(team);
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }
  await User.updateMany({ organizationId: req.organizationId, teamId: team._id }, { teamId: null });
  res.json({ message: "Team deleted" });
});

export const addTeamMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const team = await Team.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  const user = await User.findOne({ _id: userId, organizationId: req.organizationId });
  if (!user) {
    res.status(404);
    throw new Error("User not found in this organization");
  }

  if (team.members.some((m) => m.toString() === userId)) {
    res.status(400);
    throw new Error("This user is already a member of the team");
  }

  team.members.push(user._id);
  await team.save();

  user.teamId = team._id;
  await user.save();

  const populated = await team.populate("members", "name email role");
  res.json(populated);
});

export const removeTeamMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const team = await Team.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  team.members = team.members.filter((m) => m.toString() !== userId);
  await team.save();

  const user = await User.findOne({ _id: userId, organizationId: req.organizationId });
  if (user && user.teamId?.toString() === team._id.toString()) {
    user.teamId = null;
    await user.save();
  }

  const populated = await team.populate("members", "name email role");
  res.json(populated);
});
