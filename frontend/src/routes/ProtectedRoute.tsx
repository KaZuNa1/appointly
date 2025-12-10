import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Уншиж байна...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === "PROVIDER") {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
