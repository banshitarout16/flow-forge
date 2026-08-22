import Workflow from "../models/Workflow.js";
import WorkItem from "../models/WorkItem.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";


export const createWorkflow = asyncHandler(async (req, res) => {
  const { name, workItemType, states, isDefault } = req.body;

  if (!name || !Array.isArray(states) || states.length < 2) {
    res.status(400);
    throw new Error("A workflow needs a name and at least 2 states");
  }

  if (!states.some((s) => s.isInitial)) {
    res.status(400);
    throw new Error("At least one state must be marked as the initial state");
  }
  if (!states.some((s) => s.isFinal)) {
    res.status(400);
    throw new Error("At least one state must be marked as a final state");
  }


  if (isDefault) {
    await Workflow.updateMany({ organizationId: req.organizationId }, { isDefault: false });
  }

  const workflow = await Workflow.create({
    organizationId: req.organizationId,
    name,
    workItemType: workItemType || "General",
    states: states.map((s, i) => ({ ...s, order: i + 1 })),
    isDefault: !!isDefault,
  });

  res.status(201).json(workflow);
});


export const getWorkflows = asyncHandler(async (req, res) => {
  const workflows = await Workflow.find({ organizationId: req.organizationId }).sort({ createdAt: -1 });
  res.json(workflows);
});

export const getWorkflowById = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!workflow) {
    res.status(404);
    throw new Error("Workflow not found");
  }
  res.json(workflow);
});


export const updateWorkflow = asyncHandler(async (req, res) => {
  const { name, workItemType, states, isDefault } = req.body;

  const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!workflow) {
    res.status(404);
    throw new Error("Workflow not found");
  }

  if (states) {
    if (!Array.isArray(states) || states.length < 2) {
      res.status(400);
      throw new Error("A workflow needs at least 2 states");
    }
    if (!states.some((s) => s.isInitial) || !states.some((s) => s.isFinal)) {
      res.status(400);
      throw new Error("Workflow must have at least one initial state and one final state");
    }
    workflow.states = states.map((s, i) => ({ ...s, order: i + 1 }));
  }

  if (name) workflow.name = name;
  if (workItemType) workflow.workItemType = workItemType;

  if (isDefault) {
    await Workflow.updateMany(
      { organizationId: req.organizationId, _id: { $ne: workflow._id } },
      { isDefault: false }
    );
    workflow.isDefault = true;
  }

  await workflow.save();
  res.json(workflow);
});


export const deleteWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
  if (!workflow) {
    res.status(404);
    throw new Error("Workflow not found");
  }

  const inUse = await WorkItem.countDocuments({ organizationId: req.organizationId, workflowId: workflow._id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete - ${inUse} work item(s) still use this workflow`);
  }
  if (workflow.isDefault) {
    res.status(400);
    throw new Error("Cannot delete the default workflow - set another workflow as default first");
  }

  await workflow.deleteOne();
  res.json({ message: "Workflow deleted" });
});
