import Team from "../models/Team.js";
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
  res.json({ message: "Team deleted" });
});
