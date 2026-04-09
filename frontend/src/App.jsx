import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import MockInterview from "./pages/MockInterview";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import { AppLayout } from "./components/layout/AppLayout";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><div className="animate-pulse text-indigo-400 font-black tracking-widest">LOADING.SYSTEM_KERNEL</div></div>;
  if (!user) return <Navigate to="/login" />;
  
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function DashboardDecider() {
  const { user } = useAuth();
  if (user?.role === "admin" || user?.role === "org_owner") {
    return <AdminDashboard />;
  }
  return <Dashboard />;
}

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
                <DashboardDecider />
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
