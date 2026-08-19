import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, TextField, Button, MenuItem, Divider, Avatar,
} from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const statuses = ["New", "In Progress", "Resolved", "Closed"];

const WorkItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");

  const load = () => api.get(`/work-items/${id}`).then(({ data }) => setItem(data));

  useEffect(() => {
    load();
  }, [id]);

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

  if (!item) {
    return (
      <Layout title="Work item">
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  return (
    <Layout title={`${item.code} · ${item.title}`}>
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 2, minWidth: 340, display: "flex", flexDirection: "column", gap: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="overline" sx={{ color: colors.slate }}>
                    {item.code}
                  </Typography>
                  <Typography variant="h5">{item.title}</Typography>
                </Box>
                <TextField select size="small" label="Status" value={item.status} onChange={handleStatusChange} sx={{ minWidth: 160 }}>
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: colors.ink }}>
                {item.description || "No description provided."}
              </Typography>

              {item.reopenCount > 0 && (
                <Chip
                  size="small"
                  label={`Reopened ${item.reopenCount}×`}
                  sx={{ mt: 2, bgcolor: colors.redSoft, color: colors.red }}
                />
              )}
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
                        {c.author?.name || "Unknown"}
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
                <Typography variant="body2">{item.assignedTeam?.name || "Unassigned"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.slate }}>
                  Assigned to
                </Typography>
                <Typography variant="body2">{item.assignedTo?.name || "Unassigned"}</Typography>
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
