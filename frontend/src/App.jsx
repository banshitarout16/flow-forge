import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Join from "./pages/Join";
import Apply from "./pages/Apply";
import RaiseRequest from "./pages/RaiseRequest";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import WorkItems from "./pages/WorkItems";
import WorkItemDetail from "./pages/WorkItemDetail";
import Teams from "./pages/Teams";
import Users from "./pages/Users";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<Join />} />
          <Route path="/apply/:role" element={<Apply />} />
          <Route path="/raise-request" element={<RaiseRequest />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/work-items" element={<ProtectedRoute><WorkItems /></ProtectedRoute>} />
          <Route path="/work-items/:id" element={<ProtectedRoute><WorkItemDetail /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
