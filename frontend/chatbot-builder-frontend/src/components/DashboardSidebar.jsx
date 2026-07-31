import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Settings, LogOut, MessageSquareText } from "lucide-react";
import logo from "../assets/logo.png";

function DashboardSidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r bg-card px-4 py-6 shadow-xs">
      <div>
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <img src={logo} alt="BotVerse Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold tracking-tight text-lg">BotVerse</span>
        </div>

        <nav className="space-y-1">
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 font-medium transition-all ${
              isActive("/dashboard")
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutGrid className="h-4 w-4" />
            Dashboard
          </Button>
        </nav>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium transition-all"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
