import React from "react";
import { logout } from "../api/auth";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logoutStore();
      navigate("/login");
    }
  };
  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export default LogoutButton;
