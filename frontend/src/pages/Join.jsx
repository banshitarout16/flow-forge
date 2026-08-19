import { Box, Paper, Typography, Avatar, Card, CardActionArea, CardContent, Link as MLink } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import { colors } from "../theme/theme";

const options = [
  {
    icon: <WorkRoundedIcon fontSize="large" />,
    title: "Apply as an Agent",
    desc: "Join a team to get assigned work and resolve issues.",
    path: "/apply/agent",
  },
  {
    icon: <SupervisorAccountRoundedIcon fontSize="large" />,
    title: "Apply as a Manager",
    desc: "Assign work, oversee a team, and monitor SLAs.",
    path: "/apply/manager",
  },
  {
    icon: <ReportProblemRoundedIcon fontSize="large" />,
    title: "Raise a Request or Complaint",
    desc: "Report an issue and track it — no approval needed.",
    path: "/raise-request",
  },
];

const Join = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.canvas, display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
      <Paper elevation={0} sx={{ p: 5, width: 620, border: `1px solid ${colors.line}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
          <Avatar sx={{ bgcolor: colors.red, fontFamily: "Poppins", fontWeight: 700 }}>F</Avatar>
          <Typography variant="h5">FlowForge</Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 0.5 }}>
          How would you like to get started?
        </Typography>
        <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
          Applications for staff roles are reviewed by an admin. Requests and complaints go straight through.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {options.map((opt) => (
            <Card key={opt.path}>
              <CardActionArea onClick={() => navigate(opt.path)} sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ color: colors.red }}>{opt.icon}</Box>
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {opt.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.slate }}>
                      {opt.desc}
                    </Typography>
                  </CardContent>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: colors.slate }}>
          Already have an account? <MLink component={Link} to="/login" sx={{ color: colors.red, fontWeight: 600 }}>Sign in</MLink>
          {" · "}
          Setting up a new organization? <MLink component={Link} to="/register" sx={{ color: colors.red, fontWeight: 600 }}>Create one</MLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Join;
