import WorkItem from "../models/WorkItem.js";
import Workflow from "../models/Workflow.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";
import { generateWorkItemCode } from "../utils/generateWorkItemCode.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const resolveWorkflow = async (organizationId, workflowId) => {
  if (workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, organizationId });
    if (!workflow) {
      const err = new Error("Workflow not found");
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }
  const defaultWorkflow = await Workflow.findOne({ organizationId, isDefault: true });
  if (!defaultWorkflow) {
    const err = new Error("No default workflow configured for this organization");
    err.statusCode = 400;
    throw err;
  }
  return defaultWorkflow;
};

export const createWorkItem = asyncHandler(async (req, res) => {
  const { title, description, category, priority, assignedTeam, assignedTo, workflowId } = req.body;

  const workflow = await resolveWorkflow(req.organizationId, workflowId);
  const initialState = workflow.states.find((s) => s.isInitial) || workflow.states[0];
  const code = await generateWorkItemCode(req.organizationId);

  const workItem = await WorkItem.create({
    organizationId: req.organizationId,
    workflowId: workflow._id,
    code,
    title,
    description,
    category,
    priority,
    assignedTeam: assignedTeam || null,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    status: initialState.label,
    activityLog: [{ action: "Created", performedBy: req.user._id }],
  });

  const populated = await workItem.populate([
    { path: "createdBy", select: "name email" },
    { path: "assignedTeam", select: "name" },
    { path: "assignedTo", select: "name email" },
    { path: "workflowId", select: "name states" },
  ]);

  req.io?.to(req.organizationId.toString()).emit("workItem:created", populated);

  res.status(201).json(populated);
});

export const getWorkItems = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, assignedTeam, search } = req.query;

  const filter = { organizationId: req.organizationId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (assignedTeam) filter.assignedTeam = assignedTeam;
  if (search) filter.title = { $regex: search, $options: "i" };

  if (req.user.role === "requester") {
    filter.createdBy = req.user._id;
  }

  const workItems = await WorkItem.find(filter)
    .populate("createdBy", "name email")
    .populate("assignedTeam", "name")
    .populate("assignedTo", "name email")
    .populate("workflowId", "name states")
    .sort({ createdAt: -1 });

  res.json(workItems);
});

export const getWorkItemById = asyncHandler(async (req, res) => {
  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId })
    .populate("createdBy", "name email")
    .populate("assignedTeam", "name")
    .populate("assignedTo", "name email")
    .populate("workflowId", "name states")
    .populate("comments.author", "name email")
    .populate("activityLog.performedBy", "name email")
    .populate("attachments.uploadedBy", "name email");

  if (!workItem) {
    res.status(404);
    throw new Error("Work item not found");
  }

  if (req.user.role === "requester" && String(workItem.createdBy._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You do not have access to this work item");
  }

  res.json(workItem);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!workItem) {
    res.status(404);
    throw new Error("Work item not found");
  }

  const workflow = await Workflow.findOne({ _id: workItem.workflowId, organizationId: req.organizationId });
  if (!workflow) {
    res.status(404);
    throw new Error("Workflow for this work item not found");
  }

  const targetState = workflow.states.find((s) => s.label === status);
  if (!targetState) {
    res.status(400);
    throw new Error(`"${status}" is not a valid status for this work item's workflow`);
  }

  const currentState = workflow.states.find((s) => s.label === workItem.status);
  const wasFinal = currentState?.isFinal;
  const isReopening = wasFinal && !targetState.isFinal;
  if (isReopening) workItem.reopenCount += 1;

  workItem.status = status;
  workItem.activityLog.push({ action: `Status changed to ${status}`, performedBy: req.user._id });
  await workItem.save();

  req.io?.to(req.organizationId.toString()).emit("workItem:statusChanged", { id: workItem._id, status });

  res.json(workItem);
});

export const assignWorkItem = asyncHandler(async (req, res) => {
  const { assignedTeam, assignedTo } = req.body;
  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId });

  if (!workItem) {
    res.status(404);
    throw new Error("Work item not found");
  }

  if (assignedTeam !== undefined) workItem.assignedTeam = assignedTeam || null;
  if (assignedTo !== undefined) workItem.assignedTo = assignedTo || null;

  workItem.activityLog.push({ action: "Assignment updated", performedBy: req.user._id });
  await workItem.save();

  req.io?.to(req.organizationId.toString()).emit("workItem:assigned", { id: workItem._id, assignedTo, assignedTeam });

  res.json(workItem);
});

export const addComment = asyncHandler(async (req, res) => {
  const { text, isInternal } = req.body;
  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId });

  if (!workItem) {
    res.status(404);
    throw new Error("Work item not found");
  }

  workItem.comments.push({ text, author: req.user._id, isInternal: !!isInternal });
  workItem.activityLog.push({ action: "Comment added", performedBy: req.user._id });
  await workItem.save();

  req.io?.to(req.organizationId.toString()).emit("workItem:commented", { id: workItem._id });

  res.status(201).json(workItem);
});

export const uploadAttachment = asyncHandler(async (req, res) => {
  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!workItem) {
    res.status(404);
    throw new Error("Work item not found");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, `flowforge/${req.organizationId}`);

  workItem.attachments.push({
    url: result.secure_url,
    publicId: result.public_id,
    filename: req.file.originalname,
    uploadedBy: req.user._id,
  });
  workItem.activityLog.push({ action: `Attachment added: ${req.file.originalname}`, performedBy: req.user._id });
  await workItem.save();

  req.io?.to(req.organizationId.toString()).emit("workItem:attachmentAdded", { id: workItem._id });

  res.status(201).json(workItem);
});
