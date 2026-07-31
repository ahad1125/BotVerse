import React from "react";
import useAuthStore from "../store/authStore";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
