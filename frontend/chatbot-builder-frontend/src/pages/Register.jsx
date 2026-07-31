import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { register } from "../api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import logo from "../assets/logo.png";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password != confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        email,
        password,
        password2: confirmPassword,
        full_name: fullName,
      });

      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      const respData = error.response?.data;
      let errMsg = "Something went wrong.";
      if (respData?.errors) {
        // Extract the first error message from the dictionary
        const firstErrorKey = Object.keys(respData.errors)[0];
        if (firstErrorKey) errMsg = respData.errors[firstErrorKey][0] || respData.errors[firstErrorKey];
      } else if (respData?.message) {
        errMsg = respData.message;
      } else if (respData?.detail) {
        errMsg = respData.detail;
      }
      setError(errMsg);
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
                Do you accept insurance cards?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                We accept most major providers. Want the full list?
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Set up your first bot in the time it takes to make chai.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a PDF, paste a URL, or drop a YouTube link — BotVerse handles
            the rest.
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
            <img
              src={logo}
              alt="BotVerse Logo"
              className="h-5 w-5 object-contain"
            />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start building your first bot in minutes
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Abdul Ahad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground hover:underline"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
