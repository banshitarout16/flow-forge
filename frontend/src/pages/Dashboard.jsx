import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useSocket } from "../context/SocketContext";

const priorityColor = {
  Critical: colors.red,
  High: "#C77700",
  Medium: "#2B6CB0",
  Low: colors.slate,
};

const StatCard = ({ label, value, accent, sub }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" sx={{ color: colors.slate, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ color: accent || colors.ink }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: colors.slate }}>
          {sub}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const { socket } = useSocket() || {};

  const load = () => api.get("/organizations/dashboard-summary").then(({ data }) => setSummary(data));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("workItem:created", refresh);
    socket.on("workItem:statusChanged", refresh);
    socket.on("notification", refresh);
    return () => {
      socket.off("workItem:created", refresh);
      socket.off("workItem:statusChanged", refresh);
      socket.off("notification", refresh);
    };
  }, [socket]);

  return (
    <Layout title="Operations Overview">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total work items" value={summary?.total ?? "–"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Open" value={summary?.open ?? "–"} accent={colors.red} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="In progress" value={summary?.inProgress ?? "–"} accent="#2B6CB0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Resolved" value={summary?.resolved ?? "–"} accent="#1E8E5A" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="SLA compliance"
            value={summary?.slaCompliance != null ? `${summary.slaCompliance}%` : "–"}
            accent="#1E8E5A"
            sub="Of resolved items"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Avg resolution time"
            value={summary?.avgResolutionHours != null ? `${summary.avgResolutionHours}h` : "–"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="SLA at risk / breached" value={`${summary?.slaAtRiskOpen ?? 0} / ${summary?.slaBreachedOpen ?? 0}`} accent="#C77700" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Hard to resolve" value={summary?.hardToResolve ?? "–"} accent={colors.red} sub="Reopened 1+ times" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                By priority
              </Typography>
              {summary?.byPriority?.length ? (
                <PieChart
                  series={[
                    {
                      data: summary.byPriority.map((p) => ({
                        id: p.priority,
                        value: p.count,
                        label: p.priority,
                        color: priorityColor[p.priority] || colors.slate,
                      })),
                      innerRadius: 40,
                    },
                  ]}
                  height={220}
                />
              ) : (
                <Typography variant="body2" sx={{ color: colors.slate }}>
                  No work items yet — create one to see the breakdown here.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                By category
              </Typography>
              {summary?.byCategory?.length ? (
                <BarChart
                  xAxis={[{ scaleType: "band", data: summary.byCategory.map((c) => c.category) }]}
                  series={[{ data: summary.byCategory.map((c) => c.count), color: colors.red }]}
                  height={220}
                />
              ) : (
                <Typography variant="body2" sx={{ color: colors.slate }}>
                  No categories to show yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                By team
              </Typography>
              {summary?.byTeam?.length ? (
                <BarChart
                  xAxis={[{ scaleType: "band", data: summary.byTeam.map((t) => t.name) }]}
                  series={[{ data: summary.byTeam.map((t) => t.count), color: colors.ink }]}
                  height={220}
                />
              ) : (
                <Typography variant="body2" sx={{ color: colors.slate }}>
                  No work items assigned to teams yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Getting started
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {[
                  "Create teams for the groups who'll resolve work",
                  "Invite users and assign them roles",
                  "Set SLA policies and automation rules",
                  "Log your first work item",
                  "Assign it, track it, watch it move through your workflow",
                ].map((step, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      size="small"
                      label={i + 1}
                      sx={{ bgcolor: colors.redSoft, color: colors.red, fontWeight: 700, minWidth: 28 }}
                    />
                    <Typography variant="body2">{step}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
