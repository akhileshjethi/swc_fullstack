import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute – blocks access based on role
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard
    const dashboardMap = { customer: "/customer/dashboard", owner: "/owner/dashboard", admin: "/admin/dashboard" };
    return <Navigate to={dashboardMap[user?.role] || "/login"} replace />;
  }

  return children;
}

// GuestRoute – redirects authenticated users to their dashboard
export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const dashboardMap = { customer: "/customer/dashboard", owner: "/owner/dashboard", admin: "/admin/dashboard" };
    return <Navigate to={dashboardMap[user?.role] || "/customer/dashboard"} replace />;
  }

  return children;
}
