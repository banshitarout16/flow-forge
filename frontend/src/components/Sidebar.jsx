import { Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { colors } from "../theme/theme";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Work Items", path: "/work-items", icon: <AssignmentRoundedIcon /> },
  { label: "Teams", path: "/teams", icon: <GroupsRoundedIcon /> },
  { label: "Users", path: "/users", icon: <PeopleAltRoundedIcon /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Avatar sx={{ bgcolor: colors.red, width: 34, height: 34, fontFamily: "Poppins", fontWeight: 700 }}>
          F
        </Avatar>
        <Typography variant="h6" sx={{ letterSpacing: -0.5 }}>
          FlowForge
        </Typography>
      </Box>

      <List sx={{ px: 1.5 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 999,
                mb: 0.5,
                color: active ? colors.red : colors.ink,
                "&.Mui-selected": {
                  backgroundColor: colors.redSoft,
                  "&:hover": { backgroundColor: colors.redSoft },
                },
              }}
            >
              <ListItemIcon sx={{ color: active ? colors.red : colors.slate, minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
