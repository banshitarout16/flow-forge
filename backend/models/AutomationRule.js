import mongoose from "mongoose";

const automationRuleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["critical_unassigned_escalation", "sla_at_risk_notify", "resolved_feedback_request"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    thresholdMinutes: { type: Number, default: 30 },
    slaRemainingPercent: { type: Number, default: 20 },
  },
  { timestamps: true }
);

automationRuleSchema.index({ organizationId: 1, type: 1 }, { unique: true });

export default mongoose.model("AutomationRule", automationRuleSchema);
