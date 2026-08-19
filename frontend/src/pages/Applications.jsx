import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Chip, Button, Divider, TextField, Stack,
} from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const roleColor = {
  agent: { bg: "#E7F0FB", fg: "#2B6CB0" },
  manager: { bg: colors.redSoft, fg: colors.red },
};

const Applications = () => {
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState({});

  const load = () => api.get("/join-requests?status=pending").then(({ data }) => setRequests(data));

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (id, action) => {
    await api.patch(`/join-requests/${id}/review`, { action, reviewNote: notes[id] || "" });
    load();
  };

  return (
    <Layout title="Applications">
      <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
        Pending applications for staff roles. Approving creates their account instantly using the
        password they set — no credentials to hand out.
      </Typography>

      <Stack spacing={2}>
        {requests.map((r) => (
          <Card key={r._id}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                  <Typography variant="body2" sx={{ color: colors.slate }}>{r.email}</Typography>
                </Box>
                <Chip
                  size="small"
                  label={r.requestedRole}
                  sx={{ bgcolor: roleColor[r.requestedRole]?.bg, color: roleColor[r.requestedRole]?.fg }}
                />
              </Box>

              {r.department && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Department:</strong> {r.department}
                </Typography>
              )}
              {r.experience && (
                <Typography variant="body2" sx={{ color: colors.ink, mb: 1.5 }}>
                  {r.experience}
                </Typography>
              )}

              <Divider sx={{ my: 1.5 }} />

              <TextField
                size="small"
                fullWidth
                placeholder="Optional note (visible in review history)"
                value={notes[r._id] || ""}
                onChange={(e) => setNotes({ ...notes, [r._id]: e.target.value })}
                sx={{ mb: 1.5 }}
              />

              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button variant="contained" color="primary" onClick={() => handleReview(r._id, "approve")}>
                  Approve
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => handleReview(r._id, "reject")}>
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Typography variant="body2" sx={{ color: colors.slate }}>
            No pending applications right now.
          </Typography>
        )}
      </Stack>
    </Layout>
  );
};

export default Applications;
