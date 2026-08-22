import cron from "node-cron";
import { evaluateSLABreaches } from "./slaEngine.service.js";
import { evaluateCriticalUnassignedEscalation } from "./automationEngine.service.js";

export const startCronJobs = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      await evaluateSLABreaches(io);
      await evaluateCriticalUnassignedEscalation(io);
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });
};
