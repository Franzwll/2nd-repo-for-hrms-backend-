import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Bot, History, Plus, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { renderRichText } from "@/lib/rich-text";
import { chatbotApi, type ApiChatbotSource, type ChatbotRole } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Role } from "@/lib/nav";

type Msg = {
  from: "bot" | "user";
  text: string;
  id?: number | null;
  sources?: ApiChatbotSource[];
};

const STORAGE_KEY = "hrms-internal-ai-history";
const SESSION_KEY = "hrms-internal-ai-session";

const STARTERS: Record<string, string[]> = {
  employee: [
    "How do I file leave?",
    "How do I request a promotion?",
    "Where is my payslip?",
  ],
  admin: [
    "How do I approve a promotion?",
    "How do I export a report?",
    "How do requisitions work?",
  ],
  superadmin: [
    "How do I approve a promotion?",
    "How do I export a report?",
    "How do requisitions work?",
  ],
};

function roleForPortal(role: Role): ChatbotRole {
  if (role === "superadmin") return "superadmin";
  if (role === "admin") return "admin";
  return "employee";
}

function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `portal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Internal AI concierge — small floating circle (bottom-right) inside the
 * authenticated portal. Role-aware answers + server-backed chat history.
 */
export function AiConciergeWidget({ role }: { role: Role }) {
  const chatRole = roleForPortal(role);
  const starters = STARTERS[chatRole] ?? STARTERS["employee"]!;
  const greeting: Msg = {
    from: "bot",
    text:
      chatRole === "employee"
        ? "Hi! I'm your HR assistant. Ask me about leaves, payroll, COE requests, or promotions."
        : "Hi! I'm your HR operations assistant. Ask me about approvals, reports, requisitions, or HR3 evaluations.",
  };

  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = loadMessages();
    return saved.length ? saved : [greeting];
  });
  const [typing, setTyping] = useState(false);
  const [sessions, setSessions] = useState<{ session_id: string; last_at: string; exchanges: number }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const viewportRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null);
  const sessionRef = useRef<string>("");

  useEffect(() => {
    sessionRef.current = getSessionId();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const loadSessions = async () => {
    setHistoryLoading(true);
    try {
      const res = await chatbotApi.sessions();
      setSessions(res.data ?? []);
    } catch {
      setSessions([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (open && showHistory) loadSessions();
  }, [open, showHistory]);

  const openSession = async (sessionId: string) => {
    setHistoryLoading(true);
    try {
      const res = await chatbotApi.sessionMessages(sessionId);
      const flat: Msg[] = [];
      for (const m of res.data ?? []) {
        flat.push({ from: "user", text: m.message });
        flat.push({ from: "bot", text: m.reply, id: m.id });
      }
      if (flat.length) setMessages(flat);
      try {
        localStorage.setItem(SESSION_KEY, sessionId);
      } catch {
        /* ignore */
      }
      sessionRef.current = sessionId;
      setShowHistory(false);
    } catch {
      /* keep current thread */
    } finally {
      setHistoryLoading(false);
    }
  };

  const newChat = () => {
    const id = `portal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      localStorage.setItem(SESSION_KEY, id);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    sessionRef.current = id;
    setMessages([greeting]);
    setShowHistory(false);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    const user = getUser();
    const next: Msg[] = [...messages, { from: "user", text: q }];
    setMessages(next);
    setInput("");
    setTyping(true);
    try {
      const history = next.slice(-11, -1).map((m) => ({
        role: (m.from === "bot" ? "model" : "user") as "user" | "model",
        text: m.text.slice(0, 1000),
      }));
      const res = await chatbotApi.chat({
        message: q,
        session_id: sessionRef.current || null,
        role: user?.role
          ? (String(user.role).toLowerCase() as ChatbotRole)
          : chatRole,
        history,
      });
      setMessages((m) => [
        ...m,
        { from: "bot", text: res.reply, id: res.message_id ?? null, sources: res.sources ?? [] },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Sorry, I couldn't reach the server right now. Please try again in a moment." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[30rem] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">HR Assistant</span>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[0.65rem] font-medium capitalize">
                {chatRole}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory((v) => !v)}
                aria-label="Chat history"
                title="Chat history"
                className={cn(
                  "rounded p-1 transition-colors hover:bg-primary-foreground/20",
                  showHistory && "bg-primary-foreground/20",
                )}
              >
                <History className="h-4 w-4" />
              </button>
              <button
                onClick={newChat}
                aria-label="New conversation"
                title="New conversation"
                className="rounded p-1 transition-colors hover:bg-primary-foreground/20"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent conversations
              </p>
              {historyLoading && (
                <p className="p-4 text-center text-xs text-muted-foreground">Loading history…</p>
              )}
              {!historyLoading && sessions.length === 0 && (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  No past conversations yet. They'll appear here once you chat.
                </p>
              )}
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <button
                    key={s.session_id}
                    onClick={() => openSession(s.session_id)}
                    className="w-full rounded-md border border-border/60 p-2.5 text-left transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {s.session_id}
                    </p>
                    <p className="text-xs">
                      {s.exchanges} message{s.exchanges !== 1 ? "s" : ""} ·{" "}
                      {new Date(s.last_at).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
              <ScrollAreaPrimitive.Viewport
                ref={viewportRef}
                className="h-full w-full rounded-[inherit]"
              >
                <div className="space-y-3 p-3">
                  {messages.map((m, i) => (
                    <div key={i} className="space-y-1.5">
                      <div
                        className={cn(
                          "max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm",
                          m.from === "bot"
                            ? "bg-muted text-foreground"
                            : "ml-auto bg-primary text-primary-foreground",
                        )}
                      >
                        {renderRichText(m.text)}
                      </div>
                      {m.from === "bot" && m.sources && m.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.sources.map((s) => (
                            <span
                              key={s.faq_id}
                              title={`Based on FAQ: ${s.question}`}
                              className="max-w-full truncate rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[0.65rem] text-muted-foreground"
                            >
                              Based on: {s.question}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.from === "bot" && i === 0 && messages.length === 1 && (
                        <div className="flex flex-wrap gap-1.5">
                          {starters.map((s) => (
                            <button
                              key={s}
                              onClick={() => send(s)}
                              className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-primary"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {typing && (
                    <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                      <span className="animate-pulse">…</span>
                    </div>
                  )}
                </div>
              </ScrollAreaPrimitive.Viewport>
              <ScrollBar />
              <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>
          )}

          {!showHistory && (
            <form
              className="flex items-center gap-2 border-t border-border p-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask HR anything…"
                className="h-9"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={typing}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open HR assistant"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>
    </>
  );
}
