import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["org_admin", "manager", "agent", "requester"],
      default: "requester",
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Same email can exist across different organizations, but must be unique within one org
userSchema.index({ organizationId: 1, email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  // _skipPasswordHash is set when creating a User from an already-approved JoinRequest,
  // whose password was hashed once already at application time - hashing it again would break login.
  if (!this.isModified("password") || this._skipPasswordHash) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    organizationId: this.organizationId,
    name: this.name,
    email: this.email,
    role: this.role,
    teamId: this.teamId,
  };
};

export default mongoose.model("User", userSchema);
