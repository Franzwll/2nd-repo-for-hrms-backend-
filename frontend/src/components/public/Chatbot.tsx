import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Bot, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatbotApi } from "@/lib/api";

type Msg = { from: "bot" | "user"; text: string; replies?: string[] };

const MIN_DELAY = 450;
const STARTERS = [
  "What jobs are open?",
  "How do I apply?",
  "What documents do I need?",
  "How long is the hiring process?",
];

const GREETING: Msg = {
  from: "bot",
  text: "Hello! I'm the Oxford Suites Makati careers assistant. I pull live updates straight from our job board — ask me about openings, pay, requirements, or how to apply.",
  replies: STARTERS,
};

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "hrms-chatbot-history";
const SESSION_KEY = "hrms-chatbot-session";

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

function saveMessages(messages: Msg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* storage unavailable — ignore */
  }
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `cbt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = loadMessages();
    return saved.length ? saved : [GREETING];
  });
  const [typing, setTyping] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [unread, setUnread] = useState(() => {
    const saved = loadMessages();
    const last = saved[saved.length - 1];
    return saved.length > 1 && last?.from === "bot";
  });
  const viewportRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null);
  const sessionRef = useRef<string>("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    sessionRef.current = getSessionId();
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(false);
  }, [open]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    try {
      const [res] = await Promise.all([
        chatbotApi.chat({
          message: q,
          session_id: sessionRef.current || null,
          topic,
        }),
        new Promise((r) => setTimeout(r, MIN_DELAY)),
      ]);
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: res.reply,
          ...(res.quick_replies?.length ? { replies: res.quick_replies } : {}),
        },
      ]);
      setTopic(res.topic ?? null);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Sorry, I couldn't reach the server right now. Please try again in a moment.",
          replies: STARTERS,
        },
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
              <span className="text-sm font-medium">Careers Assistant</span>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[0.65rem] font-medium">
                Live
              </span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

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
                      {m.text}
                    </div>
                    {m.from === "bot" && m.replies && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.replies.map((s) => (
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
              placeholder="Type your question…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={typing}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open careers assistant"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
        {!open && mounted && unread && (
          <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>
    </>
  );
}
