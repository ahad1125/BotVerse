import { useState } from "react";

import "./App.css";
import Login from "./pages/Login";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import useAuthInitialization from "./hooks/useAuthInitialization";
import BotDetail from "./pages/BotDetail";
import ChatPlayground from "./pages/ChatPlayground";
import Analytics from "./pages/Analytics";
import PublicChat from "./pages/PublicChat";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";

function App() {
  useAuthInitialization();

  return (
    <Routes>
      {/* Public Routes */}

      <Route element={<PublicRoute />}>
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/chat/:id" element={<PublicChat />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/" element={<Home />} />
      {/* Protected Routes */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bots/:id" element={<BotDetail />} />
        <Route path="bots/:id/chat" element={<ChatPlayground />} />
        <Route path="bots/:id/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
