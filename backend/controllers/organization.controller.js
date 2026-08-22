import Organization from "../models/Organization.js";
import WorkItem from "../models/WorkItem.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

export const getMyOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.organizationId);
  if (!organization) {
    res.status(404);
    throw new Error("Organization not found");
  }
  res.json(organization);
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const filter = { organizationId: req.organizationId };

  const [total, open, inProgress, resolved, hardToResolve, slaBreachedOpen, slaAtRiskOpen] = await Promise.all([
    WorkItem.countDocuments(filter),
    WorkItem.countDocuments({ ...filter, resolvedAt: null }),
    WorkItem.countDocuments({ ...filter, status: "In Progress" }),
    WorkItem.countDocuments({ ...filter, resolvedAt: { $ne: null } }),
    WorkItem.countDocuments({ ...filter, reopenCount: { $gte: 1 } }),
    WorkItem.countDocuments({ ...filter, resolvedAt: null, slaStatus: "breached" }),
    WorkItem.countDocuments({ ...filter, resolvedAt: null, slaStatus: "at_risk" }),
  ]);

  const byPriority = await WorkItem.aggregate([
    { $match: filter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  const byCategory = await WorkItem.aggregate([
    { $match: filter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const byTeam = await WorkItem.aggregate([
    { $match: { ...filter, assignedTeam: { $ne: null } } },
    { $group: { _id: "$assignedTeam", count: { $sum: 1 } } },
    { $lookup: { from: "teams", localField: "_id", foreignField: "_id", as: "team" } },
    { $unwind: "$team" },
    { $project: { _id: 0, teamId: "$_id", name: "$team.name", count: 1 } },
  ]);

  const slaEligible = await WorkItem.countDocuments({ ...filter, resolvedAt: { $ne: null }, slaDeadline: { $ne: null } });
  const slaMet = await WorkItem.countDocuments({
    ...filter,
    resolvedAt: { $ne: null },
    slaDeadline: { $ne: null },
    slaStatus: { $ne: "breached" },
  });
  const slaCompliance = slaEligible > 0 ? Math.round((slaMet / slaEligible) * 1000) / 10 : null;

  const resolutionTimes = await WorkItem.aggregate([
    { $match: { ...filter, resolvedAt: { $ne: null } } },
    {
      $project: {
        hours: { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60] },
      },
    },
    { $group: { _id: null, avgHours: { $avg: "$hours" } } },
  ]);
  const avgResolutionHours = resolutionTimes[0]?.avgHours ? Math.round(resolutionTimes[0].avgHours * 10) / 10 : null;

  res.json({
    total,
    open,
    inProgress,
    resolved,
    hardToResolve,
    slaBreachedOpen,
    slaAtRiskOpen,
    slaCompliance,
    avgResolutionHours,
    byPriority: byPriority.map((p) => ({ priority: p._id, count: p.count })),
    byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    byTeam,
  });
});
