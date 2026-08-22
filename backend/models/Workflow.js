import mongoose from "mongoose";


const stateSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    order: { type: Number, required: true }, 
    isInitial: { type: Boolean, default: false }, 
    isFinal: { type: Boolean, default: false }, 
  },
  { _id: false }
);


const workflowSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    workItemType: { type: String, default: "General" }, 
    states: {
      type: [stateSchema],
      validate: {
        validator: (states) => states.length >= 2,
        message: "A workflow needs at least 2 states",
      },
    },
    isDefault: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.model("Workflow", workflowSchema);
