import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import MockInterview from "./pages/MockInterview";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ResumeAnalysis from "./pages/ResumeAnalysis";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

import { AppLayout } from "./components/layout/AppLayout";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected SaaS Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/resume-analysis" 
            element={
              <ProtectedRoute>
                <ResumeAnalysis />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mock-interview" 
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
