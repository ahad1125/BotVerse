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
              id: `err-${Date.now()}`,
              sender: "bot",
              content: "Something went wrong. Please try again.",
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
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/bots/${id}`)}
              className="text-muted-foreground"
            >
              ←
            </Button>
            {bot?.avatar ? (
              <img
                src={bot.avatar}
                alt={bot.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted" />
            )}
            <h1 className="text-lg font-semibold tracking-tight">
              {bot?.name || "Chat Playground"}
            </h1>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-muted/20 p-4">
          {historyLoading && (
            <p className="text-sm text-muted-foreground">
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
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
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
                  <p className="text-sm">{msg.content}</p>

                  {msg.sender === "bot" && msg.citations?.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((citation) => {
                          const Icon = sourceIcons[citation.type] || FileText;
                          return (
                            <span
                              key={citation.id}
                              className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs"
                              title={citation.name}
                            >
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate">{citation.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <span className="mt-1 text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {sendMutation.isPending && (
            <p className="text-sm text-muted-foreground">Thinking…</p>
          )}

          <div ref={scrollRef} />
        </div>

        {messages.length <= 1 && quickReplies?.results?.length > 0 && (
          <div className="my-3 flex flex-wrap gap-2">
            {quickReplies.results.map((qr) => (
              <Button
                key={qr.id}
                variant="outline"
                size="sm"
                onClick={() => handleSend(qr.text)}
              >
                {qr.text}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={() => handleSend()}
            disabled={sendMutation.isPending || !input.trim()}
            style={{ backgroundColor: primaryColor }}
            className="rounded-full px-4 text-white hover:opacity-90"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPlayground;
