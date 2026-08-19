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

// Very simple Phase-1 dashboard summary. Analytics (Phase 4) will expand this a lot.
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const filter = { organizationId: req.organizationId };

  const [total, open, inProgress, resolved] = await Promise.all([
    WorkItem.countDocuments(filter),
    WorkItem.countDocuments({ ...filter, status: "New" }),
    WorkItem.countDocuments({ ...filter, status: "In Progress" }),
    WorkItem.countDocuments({ ...filter, status: { $in: ["Resolved", "Closed"] } }),
  ]);

  const byPriority = await WorkItem.aggregate([
    { $match: filter },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  res.json({
    total,
    open,
    inProgress,
    resolved,
    byPriority: byPriority.map((p) => ({ priority: p._id, count: p.count })),
  });
});
