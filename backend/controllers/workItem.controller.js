import WorkItem from "../models/WorkItem.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";
import { generateWorkItemCode } from "../utils/generateWorkItemCode.js";

// @route POST /api/work-items
export const createWorkItem = asyncHandler(async (req, res) => {
  const { title, description, category, priority, assignedTeam, assignedTo } = req.body;

  const code = await generateWorkItemCode(req.organizationId);

  const workItem = await WorkItem.create({
    organizationId: req.organizationId,
    code,
    title,
    description,
    category,
    priority,
    assignedTeam: assignedTeam || null,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    status: "New",
    activityLog: [{ action: "Created", performedBy: req.user._id }],
  });

  const populated = await workItem.populate([
    { path: "createdBy", select: "name email" },
    { path: "assignedTeam", select: "name" },
    { path: "assignedTo", select: "name email" },
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
    .sort({ createdAt: -1 });

  res.json(workItems);
});


export const getWorkItemById = asyncHandler(async (req, res) => {
  const workItem = await WorkItem.findOne({ _id: req.params.id, organizationId: req.organizationId })
    .populate("createdBy", "name email")
    .populate("assignedTeam", "name")
    .populate("assignedTo", "name email")
    .populate("comments.author", "name email")
    .populate("activityLog.performedBy", "name email");

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

  const wasResolved = ["Resolved", "Closed"].includes(workItem.status);
  const isReopening = wasResolved && !["Resolved", "Closed"].includes(status);
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
