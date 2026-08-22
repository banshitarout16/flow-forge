import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, 
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isInternal: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, 
    filename: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workItemSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    code: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
    },
    slaDeadline: { type: Date, default: null },
    slaStatus: {
      type: String,
      enum: ["not_tracked", "on_track", "at_risk", "breached"],
      default: "not_tracked",
    },
    escalated: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reopenCount: { type: Number, default: 0 },
    activityLog: [activityLogSchema],
    comments: [commentSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

workItemSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export default mongoose.model("WorkItem", workItemSchema);
