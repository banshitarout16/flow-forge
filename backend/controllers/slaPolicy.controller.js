import SLAPolicy from "../models/SLAPolicy.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

export const getSLAPolicies = asyncHandler(async (req, res) => {
  const policies = await SLAPolicy.find({ organizationId: req.organizationId }).sort({ priority: 1 });
  res.json(policies);
});

export const updateSLAPolicy = asyncHandler(async (req, res) => {
  const { hours } = req.body;
  const { priority } = req.params;

  const numericHours = Number(hours);
  if (hours === undefined || hours === null || hours === "" || !Number.isFinite(numericHours) || numericHours <= 0) {
    res.status(400);
    throw new Error("Please enter a valid number of hours greater than 0");
  }

  const policy = await SLAPolicy.findOneAndUpdate(
    { organizationId: req.organizationId, priority },
    { hours: numericHours },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(policy);
});
