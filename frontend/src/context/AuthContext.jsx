import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("flowforge_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [organization, setOrganization] = useState(() => {
    const stored = localStorage.getItem("flowforge_org");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = ({ user, organization, accessToken, refreshToken }) => {
    localStorage.setItem("flowforge_access_token", accessToken);
    localStorage.setItem("flowforge_refresh_token", refreshToken);
    localStorage.setItem("flowforge_user", JSON.stringify(user));
    localStorage.setItem("flowforge_org", JSON.stringify(organization));
    setUser(user);
    setOrganization(organization);
  };

  const login = async ({ orgSlug, email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { orgSlug, email, password });
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerOrganization = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register-organization", payload);
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Public complaint form creates the account + first work item in one step,
  // then logs the requester straight in - no separate login round-trip needed.
  const raiseComplaint = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/public/raise-complaint", payload);
      persistSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("flowforge_access_token");
    localStorage.removeItem("flowforge_refresh_token");
    localStorage.removeItem("flowforge_user");
    localStorage.removeItem("flowforge_org");
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, registerOrganization, raiseComplaint, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
