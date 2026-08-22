import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, TextField, Button, MenuItem, Divider, Avatar, Link as MLink,
} from "@mui/material";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

const WorkItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const fileInputRef = useRef(null);

  const canAssign = user?.role === "org_admin" || user?.role === "manager";

  const load = () => api.get(`/work-items/${id}`).then(({ data }) => setItem(data));

  useEffect(() => {
    load();
    if (canAssign) {
      api.get("/teams").then(({ data }) => setTeams(data));
      api.get("/users").then(({ data }) => setUsers(data));
    }
  }, [id]);

  const handleAssignChange = async (field, value) => {
    await api.patch(`/work-items/${id}/assign`, { [field]: value || null });
    load();
  };

  const handleStatusChange = async (e) => {
    await api.patch(`/work-items/${id}/status`, { status: e.target.value });
    load();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/work-items/${id}/comments`, { text: comment });
    setComment("");
    load();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/work-items/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!item) {
    return (
      <Layout title="Work item">
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  const workflowStates = (item.workflowId?.states || []).slice().sort((a, b) => a.order - b.order);

  return (
    <Layout title={`${item.code} · ${item.title}`}>
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 2, minWidth: 340, display: "flex", flexDirection: "column", gap: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="overline" sx={{ color: colors.slate }}>
                    {item.code}{item.workflowId?.name ? ` · ${item.workflowId.name}` : ""}
                  </Typography>
                  <Typography variant="h5">{item.title}</Typography>
                </Box>
                <TextField select size="small" label="Status" value={item.status} onChange={handleStatusChange} sx={{ minWidth: 180 }}>
                  {workflowStates.map((s) => (
                    <MenuItem key={s.label} value={s.label}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: colors.ink }}>
                {item.description || "No description provided."}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                {item.reopenCount > 0 && (
                  <Chip size="small" label={`Reopened ${item.reopenCount}×`} sx={{ bgcolor: colors.redSoft, color: colors.red }} />
                )}
                {item.slaStatus && item.slaStatus !== "not_tracked" && (
                  <Chip
                    size="small"
                    label={
                      item.slaStatus === "breached"
                        ? "SLA breached"
                        : item.slaStatus === "at_risk"
                        ? "SLA at risk"
                        : `SLA due ${new Date(item.slaDeadline).toLocaleString()}`
                    }
                    sx={{
                      bgcolor: item.slaStatus === "breached" ? colors.redSoft : item.slaStatus === "at_risk" ? "#FFF1DE" : "#E7F7EE",
                      color: item.slaStatus === "breached" ? colors.red : item.slaStatus === "at_risk" ? "#C77700" : "#1E8E5A",
                    }}
                  />
                )}
                {item.escalated && (
                  <Chip size="small" label="Auto-escalated" sx={{ bgcolor: "#E7F0FB", color: "#2B6CB0" }} />
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activity timeline
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {item.activityLog?.map((log, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors.red, mt: 0.7, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2">{log.action}</Typography>
                      <Typography variant="caption" sx={{ color: colors.slate }}>
                        {log.performedBy?.name || "System"} · {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Attachments</Typography>
                <Button
                  size="small"
                  startIcon={<AttachFileRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Add file"}
                </Button>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {item.attachments?.map((a, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <InsertDriveFileRoundedIcon fontSize="small" sx={{ color: colors.slate }} />
                    <MLink href={a.url} target="_blank" rel="noopener noreferrer" sx={{ color: colors.red }}>
                      {a.filename || "Attachment"}
                    </MLink>
                    <Typography variant="caption" sx={{ color: colors.slate }}>
                      · {a.uploadedBy?.name || "Unknown"}
                    </Typography>
                  </Box>
                ))}
                {(!item.attachments || item.attachments.length === 0) && (
                  <Typography variant="body2" sx={{ color: colors.slate }}>
                    No attachments yet.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Comments
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                {item.comments?.map((c, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: colors.ink }}>
                      {c.author?.name?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.author?.name || "FlowForge"}
                      </Typography>
                      <Typography variant="body2">{c.text}</Typography>
                    </Box>
                  </Box>
                ))}
                {(!item.comments || item.comments.length === 0) && (
                  <Typography variant="body2" sx={{ color: colors.slate }}>
                    No comments yet.
                  </Typography>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box component="form" onSubmit={handleAddComment} sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button type="submit" variant="contained">
                  Post
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6">Details</Typography>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Priority
                </Typography>
                <Typography variant="body2">{item.priority}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Category
                </Typography>
                <Typography variant="body2">{item.category}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Created by
                </Typography>
                <Typography variant="body2">{item.createdBy?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Assigned team
                </Typography>
                {canAssign ? (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={item.assignedTeam?._id || ""}
                    onChange={(e) => handleAssignChange("assignedTeam", e.target.value)}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t._id} value={t._id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Typography variant="body2">{item.assignedTeam?.name || "Unassigned"}</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Assigned to
                </Typography>
                {canAssign ? (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={item.assignedTo?._id || ""}
                    onChange={(e) => handleAssignChange("assignedTo", e.target.value)}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users
                      .filter((u) => u.role === "agent" || u.role === "manager")
                      .map((u) => (
                        <MenuItem key={u.id || u._id} value={u.id || u._id}>
                          {u.name} · {u.role}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : (
                  <Typography variant="body2">{item.assignedTo?.name || "Unassigned"}</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Created
                </Typography>
                <Typography variant="body2">{new Date(item.createdAt).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
};

export default WorkItemDetail;
