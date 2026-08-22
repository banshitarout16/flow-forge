import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// A pending application from someone who wants to join an organization as
// staff (agent or manager). Requesters don't go through this - they enter
// directly via the public complaint form, since customers shouldn't need
// hiring approval just to report an issue.
const joinRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: [6, "Password must be at least 6 characters"] },
    requestedRole: { type: String, enum: ["agent", "manager"], required: true },
    department: { type: String, default: "" },
    experience: { type: String, default: "" }, // skills / past experience / why they're applying
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

joinRequestSchema.index({ organizationId: 1, email: 1, status: 1 });

joinRequestSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("JoinRequest", joinRequestSchema);
