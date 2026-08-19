import WorkItem from "../models/WorkItem.js";

export const generateWorkItemCode = async (organizationId) => {
  const count = await WorkItem.countDocuments({ organizationId });
  return `FF-${1000 + count + 1}`;
};
