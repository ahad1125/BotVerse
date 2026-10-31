import { useBots } from "../hooks/useBots";
import BotCard from "../components/BotCard";
import CreateBotModal from "../components/CreateBotModal";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardStats from "../components/DashboardStats";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAuthStore from "../store/authStore";
import useCurrentUser from "../hooks/useCurrentUser";
import queryClient from "../lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/theme-toggle";
import logo from "../assets/logo.png";

function Dashboard() {
  const { data, isLoading, error } = useBots();
  const { data: userData } = useCurrentUser();
  const authUser = useAuthStore((state) => state.user);
  const user = userData?.data || authUser;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [search, setSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const bots = data?.results || [];

  const filteredBots = bots.filter((bot) =>
    bot.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const logoutMutation = useLogout();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.logout);

  const handleEdit = (bot) => {
    setSelectedBot(bot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBot(null);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate(refreshToken, {
      onSettled: () => {
        toast.add({ description: "Logged out successfully." });
        queryClient.clear();
        clearAuth();
        navigate("/", { replace: true });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">
          {error.message || "Something went wrong."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex md:hidden items-center justify-between border-b bg-card px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-1 text-muted-foreground"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img src={logo} alt="BotVerse Logo" className="h-6 w-6 object-contain" />
            <span className="font-bold tracking-tight text-base">BotVerse</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              + Bot
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-10">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  {user?.full_name
                    ? `Welcome back, ${user.full_name}`
                    : "Dashboard"}
                </h1>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Here's what's happening across your bots.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={() => setIsModalOpen(true)}>+ Create Bot</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 sm:mb-10">
            <DashboardStats bots={bots} />
          </div>

          {/* Bots Section */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">Your Bots</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search bots…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>

            {filteredBots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-xl border border-dashed p-8 sm:p-12 text-center"
              >
                {bots.length === 0 ? (
                  <>
                    <h3 className="text-base sm:text-lg font-medium">No bots created yet</h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      Create your first AI chatbot to get started.
                    </p>
                    <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
                      Create Your First Bot
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No bots match "{search}".
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredBots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </section>

          <CreateBotModal
            isOpen={isModalOpen}
            isClose={handleCloseModal}
            bot={selectedBot}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
