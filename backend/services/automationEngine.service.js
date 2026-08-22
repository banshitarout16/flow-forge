import AutomationRule from "../models/AutomationRule.js";
import Workflow from "../models/Workflow.js";
import WorkItem from "../models/WorkItem.js";
import User from "../models/User.js";

export const evaluateCriticalUnassignedEscalation = async (io) => {
  const now = new Date();

  const rules = await AutomationRule.find({
    type: "critical_unassigned_escalation",
    isActive: true,
  });

  if (rules.length === 0) return;

  for (const rule of rules) {
    const cutoff = new Date(now.getTime() - rule.thresholdMinutes * 60 * 1000);

    const candidates = await WorkItem.find({
      organizationId: rule.organizationId,
      priority: "Critical",
      assignedTo: null,
      escalated: false,
      resolvedAt: null,
      createdAt: { $lte: cutoff },
    });

    if (candidates.length === 0) continue;

    let manager = await User.findOne({
      organizationId: rule.organizationId,
      role: "manager",
      isActive: true,
    });
    if (!manager) {
      manager = await User.findOne({
        organizationId: rule.organizationId,
        role: "org_admin",
        isActive: true,
      });
    }
    if (!manager) continue;

    for (const item of candidates) {
      item.assignedTo = manager._id;
      item.escalated = true;
      item.activityLog.push({
        action: `Auto-escalated to ${manager.name} - unassigned for over ${rule.thresholdMinutes} minutes`,
      });
      await item.save();

      io?.to(rule.organizationId.toString()).emit("notification", {
        type: "escalation",
        message: `${item.code} auto-escalated to ${manager.name}`,
        workItemId: item._id,
        timestamp: new Date(),
      });
    }
  }
};

export const maybeAddFeedbackRequest = async (workItem) => {
  const rule = await AutomationRule.findOne({
    organizationId: workItem.organizationId,
    type: "resolved_feedback_request",
    isActive: true,
  });
  if (!rule) return;

  workItem.comments.push({
    text: "Thanks for reporting this — could you share quick feedback on how the resolution went?",
    isInternal: false,
  });
};
