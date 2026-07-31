import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, Sparkles, AlertCircle } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api/v1";

function PublicChat() {
  const { id } = useParams();
  const [bot, setBot] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/bots/${id}/public-quick-replies/`).then((res) => {
      setQuickReplies(res.data);
    });
  }, [id]);

  useEffect(() => {
    axios.get(`${API_BASE}/bots/${id}/public-info/`).then((res) => {
      setBot(res.data);
      if (res.data.greeting_message) {
        setMessages([
          {
            id: "greeting",
            sender: "bot",
            content: res.data.greeting_message,
            citations: [],
            created_at: new Date().toISOString(),
          },
        ]);
      }
    });
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const primaryColor = bot?.primary_color || "#4f46e5";

  const handleSend = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      },
    ]);
    setInput("");
    setSending(true);

    try {
      const { data } = await axios.post(`${API_BASE}/bots/${id}/chat/`, {
        message: trimmed,
        conversation_id: conversationId,
      });
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          content: data.answer,
          citations: data.citations || [],
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          content: "Sorry, something went wrong. Please check back in a moment.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-muted/5 text-foreground justify-center items-center p-0 sm:p-4">
      <div className="flex h-full w-full max-w-2xl bg-card border shadow-xl flex-col sm:rounded-2xl overflow-hidden">
        {/* Widget Header */}
        <header
          className="px-6 py-4 flex items-center gap-3 border-b text-white shrink-0 shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          {bot?.avatar ? (
            <img
              src={bot.avatar}
              alt={bot.name}
              className="h-10 w-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/10 shrink-0">
              {bot?.name?.[0]?.toUpperCase() || <Bot className="h-5 w-5" />}
            </div>
          )}
          
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate leading-none">
              {bot?.name || "AI Assistant"}
            </h1>
            <p className="text-xs text-white/80 truncate mt-1">
              {bot?.business_name || "Customer Support"} &bull; Online
            </p>
          </div>
        </header>

        {/* Conversation Message Thread */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isError = msg.id.startsWith("error-");
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-semibold ${
                    isUser
                      ? "bg-card text-foreground"
                      : isError
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-primary text-primary-foreground border-primary"
                  }`}
                  style={!isUser && !isError ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                  >
                    {isUser ? <User className="h-3.5 w-3.5 text-muted-foreground" /> : isError ? <AlertCircle className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? "text-white"
                          : isError
                            ? "bg-destructive/5 border border-destructive/20 text-destructive"
                            : "border bg-card text-foreground"
                      }`}
                      style={
                        isUser
                          ? { backgroundColor: primaryColor }
                          : undefined
                      }
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Sources */}
                      {!isUser && msg.citations?.length > 0 && (
                        <div className="mt-3 border-t border-border pt-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                            Sources
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.citations.map((c) => (
                              <span
                                key={c.id}
                                className="rounded-full border bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground truncate max-w-[150px]"
                                title={c.name}
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div
                className="h-8 w-8 rounded-full text-primary-foreground flex items-center justify-center border shrink-0"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="border bg-card rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Suggestions & Send Input */}
        <footer className="border-t bg-card px-6 py-4 shrink-0 shadow-lg">
          <div className="space-y-4">
            {messages.length <= 1 && quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => handleSend(qr.text)}
                    className="rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-muted-foreground/35 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    {qr.text}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2.5 rounded-2xl border bg-muted/20 px-4 py-2 hover:bg-muted/30 focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                disabled={sending}
              />
              <button
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                className="rounded-full h-9 w-9 p-0 flex items-center justify-center text-white hover:opacity-90 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default PublicChat;
