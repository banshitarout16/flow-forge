import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "Created", "Assigned to Maintenance", "Status changed to Resolved"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isInternal: { type: Boolean, default: false }, // internal note vs requester-visible
    createdAt: { type: Date, default: Date.now },
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
    code: { type: String, required: true }, // e.g. FF-10294, generated per org
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
      default: "New", // Phase 2 will make this driven by a configurable Workflow
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reopenCount: { type: Number, default: 0 },
    activityLog: [activityLogSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

workItemSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export default mongoose.model("WorkItem", workItemSchema);
