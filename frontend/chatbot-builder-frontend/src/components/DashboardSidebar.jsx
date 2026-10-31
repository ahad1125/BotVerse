import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LogOut, X } from "lucide-react";
import logo from "../assets/logo.png";

function DashboardSidebar({ onLogout, isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const content = (
    <>
      <div>
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="BotVerse Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold tracking-tight text-lg">BotVerse</span>
          </div>
          {onCloseMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={onCloseMobile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="space-y-1">
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2.5 font-medium transition-all ${
              isActive("/dashboard")
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              navigate("/dashboard");
              if (onCloseMobile) onCloseMobile();
            }}
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
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col justify-between border-r bg-card px-4 py-6 shadow-xs">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col justify-between border-r bg-card px-5 py-6 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
