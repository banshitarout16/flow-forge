import mongoose from "mongoose";

const slaPolicySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },
    hours: { type: Number, required: true, min: 0.5 },
  },
  { timestamps: true }
);

slaPolicySchema.index({ organizationId: 1, priority: 1 }, { unique: true });

export default mongoose.model("SLAPolicy", slaPolicySchema);
