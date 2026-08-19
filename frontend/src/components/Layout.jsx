import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ title, children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        <Topbar title={title} />
        <Toolbar /> {/* spacer for fixed AppBar */}
        <Box sx={{ p: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
