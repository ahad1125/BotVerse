import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVerifyOTP } from "../hooks/useVerifyOTP";
import { useResendOTP } from "../hooks/useResendOTP";
import { toast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const verifyMutation = useVerifyOTP();
  const resendMutation = useResendOTP();

  const handleVerify = (e) => {
    e.preventDefault();
    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          toast.add({ title: "Email verified." });
          navigate("/dashboard");
        },
      },
    );
  };

  const handleResend = () => {
    setResendMsg("");
    resendMutation.mutate(email, {
      onSuccess: (data) => setResendMsg(data.message || "Code resent."),
      onError: (err) =>
        setResendMsg(err.response?.data?.message || "Failed to resend."),
    });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-muted/40 p-10 lg:flex">
        <span className="text-lg font-semibold tracking-tight">BotVerse</span>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-sm"
        >
          <h2 className="text-2xl font-semibold tracking-tight">
            One quick step before you start.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifying your email keeps your account secure. You can always do
            this later from your dashboard.
          </p>
        </motion.div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BotVerse
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border bg-card">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit code sent to {email}.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              placeholder="123456"
            />
            {verifyMutation.isError && (
              <p className="text-sm text-destructive">
                {verifyMutation.error?.response?.data?.message ||
                  "Verification failed."}
              </p>
            )}
            <Button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full"
            >
              Verify
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Button variant="link" onClick={handleResend} className="px-0">
              Resend code
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>

          {resendMsg && (
            <p className="mt-2 text-sm text-muted-foreground">{resendMsg}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default VerifyOTP;
