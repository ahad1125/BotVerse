import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const setTokens = useAuthStore((state) => state.setTokens);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await login({
        email,
        password,
      });
      setTokens(response.data.access, response.data.refresh);
      toast.add({ description: "Logged in successfully." });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: branding panel */}
      <div className="relative hidden flex-col justify-between bg-muted/40 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src={logo} alt="BotVerse Logo" className="h-6 w-6 object-contain" />
          <span className="text-lg font-semibold tracking-tight">BotVerse</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-sm"
        >
          <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 text-xs text-muted-foreground">
              Al Shifa Clinic — assistant
            </div>
            <div className="mb-2 flex">
              <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                Do you have appointments on Sunday?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                Yes — Sundays 10am to 2pm. Want me to note your name for a slot?
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Your knowledge, answering customers 24/7.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Train a bot on your docs and deploy it in minutes — no code
            required.
          </p>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BotVerse
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 flex justify-center items-center gap-2 lg:hidden hover:opacity-90 transition-opacity">
            <img src={logo} alt="BotVerse Logo" className="h-6 w-6 object-contain" />
            <span className="text-lg font-semibold tracking-tight">
              BotVerse
            </span>
          </Link>

          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              ← Back to home
            </Link>
          </div>

          <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border bg-card">
            <img src={logo} alt="BotVerse Logo" className="h-5 w-5 object-contain" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log in to manage your bots
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
