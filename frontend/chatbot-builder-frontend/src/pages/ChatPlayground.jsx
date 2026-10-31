import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSendMessage from "../hooks/useSendMessage";
import useConversationMessages from "../hooks/useConversationMessages";
import useBot from "../hooks/useBot";
import { useQuickReplies } from "@/hooks/useQuickReplies";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import {
  FileText,
  Globe,
  FileSpreadsheet,
  FileCode2,
  Play,
  ArrowLeft,
  History,
  Send,
} from "lucide-react";
import ConversationsSidebar from "@/components/ConversationsSidebar";

function ChatPlayground() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: bot } = useBot(id);
  const storageKey = `conversation_${id}`;

  const [conversationId, setConversationId] = useState(() =>
    localStorage.getItem(storageKey),
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const sendMutation = useSendMessage(id);
  const scrollRef = useRef(null);

  const { data: quickReplies } = useQuickReplies(id);

  const primaryColor = bot?.primary_color || "#4f46e5";

  const sourceIcons = {
    pdf: FileText,
    url: Globe,
    youtube: Play,
    docx: FileText,
    csv: FileSpreadsheet,
    text: FileCode2,
  };

  const { data: historyData, isLoading: historyLoading } =
    useConversationMessages(id, conversationId);

  useEffect(() => {
    if (historyData?.data) {
      setMessages(historyData.data);
    }
  }, [historyData]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  useEffect(() => {
    if (!conversationId && bot?.greeting_message && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          sender: "bot",
          content: bot.greeting_message,
          citations: [],
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [bot, conversationId]);

  const handleSend = (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || sendMutation.isPending) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
      confidence_score: null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    sendMutation.mutate(
      { message: trimmed, conversation_id: conversationId },
      {
        onSuccess: (data) => {
          setConversationId(data.conversation_id);
          localStorage.setItem(storageKey, data.conversation_id);
          setMessages((prev) => [
            ...prev,
            {
              id: `temp-bot-${Date.now()}`,
              sender: "bot",
              content: data.answer,
              citations: data.citations || [],
              created_at: new Date().toISOString(),
              confidence_score: null,
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `temp-error-${Date.now()}`,
              sender: "bot",
              content:
                bot?.fallback_message ||
                "Sorry, I encountered an issue. Please try again in a moment.",
              citations: [],
              created_at: new Date().toISOString(),
              confidence_score: null,
            },
          ]);
        },
      },
    );
  };

  const handleNewChat = () => {
    localStorage.removeItem(storageKey);
    setConversationId(null);
    setMessages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <ConversationsSidebar
        botId={id}
        activeConversationId={conversationId}
        onSelect={(convId) => {
          setConversationId(convId);
          localStorage.setItem(storageKey, convId);
        }}
        onNewChat={handleNewChat}
        isMobileOpen={isMobileHistoryOpen}
        onCloseMobile={() => setIsMobileHistoryOpen(false)}
      />

      <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 min-w-0">
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/bots/${id}`)}
              className="h-8 w-8 text-muted-foreground shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {bot?.avatar ? (
              <img
                src={bot.avatar}
                alt={bot.name}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted shrink-0" />
            )}
            <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              {bot?.name || "Chat Playground"}
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-1.5 h-8 px-2.5 text-xs shrink-0"
            onClick={() => setIsMobileHistoryOpen(true)}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-muted/20 p-3 sm:p-4">
          {historyLoading && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Loading conversation…
            </p>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[72%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm ${
                    msg.sender === "user"
                      ? "text-white"
                      : "border bg-card text-foreground"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { backgroundColor: primaryColor }
                      : undefined
                  }
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.sender === "bot" && msg.citations?.length > 0 && (
                    <div className="mt-3 border-t pt-2.5">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((citation) => {
                          const Icon = sourceIcons[citation.type] || FileText;
                          return (
                            <span
                              key={citation.id}
                              className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-0.5 text-[11px]"
                              title={citation.name}
                            >
                              <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[120px] sm:max-w-[180px]">{citation.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <span className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {sendMutation.isPending && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Thinking…
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {messages.length <= 1 && quickReplies?.results?.length > 0 && (
          <div className="my-2.5 flex flex-wrap gap-1.5 sm:gap-2">
            {quickReplies.results.map((qr) => (
              <Button
                key={qr.id}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2.5 rounded-full"
                onClick={() => handleSend(qr.text)}
              >
                {qr.text}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-xl border bg-card p-2 sm:p-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={() => handleSend()}
            disabled={sendMutation.isPending || !input.trim()}
            style={{ backgroundColor: primaryColor }}
            className="rounded-full px-3.5 sm:px-4 h-9 text-white hover:opacity-90 flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPlayground;
