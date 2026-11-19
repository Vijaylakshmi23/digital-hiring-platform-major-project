
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRole?: "WORKER" | "EMPLOYER";
}

export default function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Redirect users who are not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users with the wrong role
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
