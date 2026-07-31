import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

function PublicRoute() {
  const accessTokens = useAuthStore((state) => state.accessToken);

  if (accessTokens) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
