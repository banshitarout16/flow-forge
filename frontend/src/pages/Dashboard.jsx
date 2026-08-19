import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";
import { PieChart } from "@mui/x-charts/PieChart";

const priorityColor = {
  Critical: colors.red,
  High: "#C77700",
  Medium: "#2B6CB0",
  Low: colors.slate,
};

const StatCard = ({ label, value, accent }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" sx={{ color: colors.slate, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ color: accent || colors.ink }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/organizations/dashboard-summary").then(({ data }) => setSummary(data));
  }, []);

  return (
    <Layout title="Operations Overview">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total work items" value={summary?.total ?? "–"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="New" value={summary?.open ?? "–"} accent={colors.red} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="In progress" value={summary?.inProgress ?? "–"} accent="#2B6CB0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Resolved / closed" value={summary?.resolved ?? "–"} accent="#1E8E5A" />
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
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Getting started
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {[
                  "Create teams for the groups who'll resolve work",
                  "Invite users and assign them roles",
                  "Log your first work item",
                  "Assign it to a team or person",
                  "Track it through to Resolved",
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
