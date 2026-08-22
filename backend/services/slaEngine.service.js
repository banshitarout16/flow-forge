import SLAPolicy from "../models/SLAPolicy.js";
import AutomationRule from "../models/AutomationRule.js";
import WorkItem from "../models/WorkItem.js";

export const computeSLADeadline = async (organizationId, priority, fromDate) => {
  const policy = await SLAPolicy.findOne({ organizationId, priority });
  if (!policy) return null;
  return new Date(fromDate.getTime() + policy.hours * 60 * 60 * 1000);
};

export const evaluateSLABreaches = async (io) => {
  const now = new Date();

  const openItems = await WorkItem.find({
    resolvedAt: null,
    slaDeadline: { $ne: null },
    slaStatus: { $in: ["on_track", "at_risk"] },
  });

  if (openItems.length === 0) return;

  const orgIds = [...new Set(openItems.map((i) => i.organizationId.toString()))];
  const rules = await AutomationRule.find({
    organizationId: { $in: orgIds },
    type: "sla_at_risk_notify",
  });
  const ruleByOrg = new Map(rules.map((r) => [r.organizationId.toString(), r]));

  for (const item of openItems) {
    const orgId = item.organizationId.toString();
    const rule = ruleByOrg.get(orgId);
    const totalWindow = item.slaDeadline.getTime() - item.createdAt.getTime();
    const remaining = item.slaDeadline.getTime() - now.getTime();
    const remainingPercent = totalWindow > 0 ? (remaining / totalWindow) * 100 : 0;

    if (remaining <= 0 && item.slaStatus !== "breached") {
      item.slaStatus = "breached";
      item.activityLog.push({ action: "SLA breached" });
      await item.save();
      io?.to(orgId).emit("notification", {
        type: "sla_breach",
        message: `${item.code} breached its SLA deadline`,
        workItemId: item._id,
        timestamp: new Date(),
      });
    } else if (
      remaining > 0 &&
      item.slaStatus === "on_track" &&
      rule?.isActive &&
      remainingPercent <= rule.slaRemainingPercent
    ) {
      item.slaStatus = "at_risk";
      item.activityLog.push({ action: "SLA at risk" });
      await item.save();
      io?.to(orgId).emit("notification", {
        type: "sla_at_risk",
        message: `${item.code} is at risk of breaching its SLA`,
        workItemId: item._id,
        timestamp: new Date(),
      });
    }
  }
};
