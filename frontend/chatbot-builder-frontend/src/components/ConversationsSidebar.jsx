import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, Loader2, X } from "lucide-react";

function ConversationsSidebar({
  botId,
  activeConversationId,
  onSelect,
  onNewChat,
  isMobileOpen,
  onCloseMobile,
}) {
  const { data, isLoading } = useConversations(botId);
  const conversations = data?.data || [];

  const handleSelect = (convId) => {
    onSelect(convId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNewChat = () => {
    onNewChat();
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="p-4 flex items-center gap-2">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="flex-1 justify-center gap-2 font-medium hover:bg-muted/80 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 shrink-0 text-muted-foreground"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="opacity-60" />

      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          History
        </span>
        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold">
          {conversations.length}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 pb-4 space-y-1">
          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Loading history...
            </div>
          )}
          {!isLoading && conversations.length === 0 && (
            <div className="text-center py-10 px-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground/45 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">No conversations yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Start chatting to see history here.</p>
            </div>
          )}

          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`w-full rounded-xl px-3.5 py-3 text-left transition-all duration-200 flex flex-col gap-1 border border-transparent cursor-pointer ${
                  isActive
                    ? "bg-card border-border shadow-xs scale-[1.01]"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`truncate text-xs font-semibold leading-none ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {conv.last_message || "Active chat..."}
                  </p>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse mt-0.5" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/70">
                  {new Date(conv.started_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop view */}
      <aside className="hidden md:flex w-68 h-full shrink-0 border-r bg-muted/20 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default ConversationsSidebar;
