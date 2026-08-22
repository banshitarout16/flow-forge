import AutomationRule from "../models/AutomationRule.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

export const getAutomationRules = asyncHandler(async (req, res) => {
  const rules = await AutomationRule.find({ organizationId: req.organizationId });
  res.json(rules);
});

export const updateAutomationRule = asyncHandler(async (req, res) => {
  const { isActive, thresholdMinutes, slaRemainingPercent } = req.body;
  const { type } = req.params;

  const update = {};
  if (isActive !== undefined) update.isActive = isActive;
  if (thresholdMinutes !== undefined) update.thresholdMinutes = thresholdMinutes;
  if (slaRemainingPercent !== undefined) update.slaRemainingPercent = slaRemainingPercent;

  const rule = await AutomationRule.findOneAndUpdate(
    { organizationId: req.organizationId, type },
    update,
    { new: true, upsert: true, runValidators: true }
  );

  res.json(rule);
});
