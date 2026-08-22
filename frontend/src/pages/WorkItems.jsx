import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";
import { useSocket } from "../context/SocketContext";

const priorityColor = {
  Critical: { bg: colors.redSoft, fg: colors.red },
  High: { bg: "#FFF1DE", fg: "#C77700" },
  Medium: { bg: "#E7F0FB", fg: "#2B6CB0" },
  Low: { bg: "#F1F1F1", fg: colors.slate },
};

const statusColor = {
  New: { bg: colors.redSoft, fg: colors.red },
  "In Progress": { bg: "#E7F0FB", fg: "#2B6CB0" },
  Resolved: { bg: "#E7F7EE", fg: "#1E8E5A" },
  Closed: { bg: "#F1F1F1", fg: colors.slate },
};

const emptyForm = { title: "", description: "", category: "General", priority: "Medium", workflowId: "" };

const WorkItems = () => {
  const [items, setItems] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();
  const { socket } = useSocket() || {};

  const load = () => api.get("/work-items").then(({ data }) => setItems(data));
  const loadWorkflows = () =>
    api.get("/workflows").then(({ data }) => {
      setWorkflows(data);
      const defaultWf = data.find((w) => w.isDefault);
      if (defaultWf) setForm((f) => ({ ...f, workflowId: defaultWf._id }));
    });

  useEffect(() => {
    load();
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("workItem:created", refresh);
    socket.on("workItem:statusChanged", refresh);
    socket.on("workItem:assigned", refresh);
    return () => {
      socket.off("workItem:created", refresh);
      socket.off("workItem:statusChanged", refresh);
      socket.off("workItem:assigned", refresh);
    };
  }, [socket]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/work-items", form);
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  return (
    <Layout title="Work Items">
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          New work item
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned to</TableCell>
                <TableCell>SLA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item._id}
                  hover
                  onClick={() => navigate(`/work-items/${item._id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{item.code}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.priority}
                      sx={{ bgcolor: priorityColor[item.priority]?.bg, color: priorityColor[item.priority]?.fg }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.status}
                      sx={{ bgcolor: statusColor[item.status]?.bg, color: statusColor[item.status]?.fg }}
                    />
                  </TableCell>
                  <TableCell>{item.assignedTo?.name || "—"}</TableCell>
                  <TableCell>
                    {item.slaStatus && item.slaStatus !== "not_tracked" && (
                      <Chip
                        size="small"
                        label={item.slaStatus === "on_track" ? "On track" : item.slaStatus === "at_risk" ? "At risk" : "Breached"}
                        sx={{
                          bgcolor: item.slaStatus === "breached" ? colors.redSoft : item.slaStatus === "at_risk" ? "#FFF1DE" : "#E7F7EE",
                          color: item.slaStatus === "breached" ? colors.red : item.slaStatus === "at_risk" ? "#C77700" : "#1E8E5A",
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" sx={{ color: colors.slate, py: 3, textAlign: "center" }}>
                      No work items yet. Create your first one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreate}>
          <DialogTitle>New work item</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              fullWidth
            >
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Workflow"
              value={form.workflowId}
              onChange={(e) => setForm({ ...form, workflowId: e.target.value })}
              fullWidth
              helperText="Determines what status chain this item follows"
            >
              {workflows.map((w) => (
                <MenuItem key={w._id} value={w._id}>
                  {w.name}{w.isDefault ? " (default)" : ""}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default WorkItems;
