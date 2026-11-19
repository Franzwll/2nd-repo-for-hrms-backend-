import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {
  ArrowUp,
  Check,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { renderRichText } from "@/lib/rich-text";
import { chatbotApi, chatbotFaqApi, type ApiChatbotSource } from "@/lib/api";

type Msg = {
  from: "bot" | "user";
  text: string;
  replies?: string[];
  id?: number | null;
  sources?: ApiChatbotSource[];
  feedback?: 1 | -1 | null;
  timestamp?: string;
};

const MIN_DELAY = 450;

const STARTERS = [
  "Current job openings",
  "How to apply",
  "Required documents",
  "Hiring timeline",
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createGreeting(): Msg {
  return {
    from: "bot",
    text: "Welcome to **Oxford Suites Makati** Careers. Ask me anything about open roles, benefits, requirements, or our hiring process.",
    replies: STARTERS,
    timestamp: formatTime(),
  };
}

function newSessionId(): string {
  return `cbt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const LEGACY_STORAGE_KEY = "hrms-chatbot-history";
const LEGACY_SESSION_KEY = "hrms-chatbot-session";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => [createGreeting()]);
  const [typing, setTyping] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [reducedMode, setReducedMode] = useState(false);
  const [unread, setUnread] = useState(false);
  const [mounted, setMounted] = useState(false);

  const viewportRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    sessionRef.current = newSessionId();
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const resetChat = () => {
    if (typing) return;
    sessionRef.current = newSessionId();
    setTopic(null);
    setReducedMode(false);
    setMessages([createGreeting()]);
  };

  const vote = (messageId: number, value: 1 | -1) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, feedback: m.feedback === value ? null : value }
          : m,
      ),
    );
    const current = messages.find((m) => m.id === messageId)?.feedback ?? null;
    chatbotFaqApi
      .messageFeedback(messageId, current === value ? 0 : value, sessionRef.current || null)
      .catch(() => {});
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;

    const userMsg: Msg = {
      from: "user",
      text: q,
      timestamp: formatTime(),
    };

    const nextMessages: Msg[] = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const history = nextMessages.slice(-11, -1).map((m) => ({
        role: (m.from === "bot" ? "model" : "user") as "user" | "model",
        text: m.text.slice(0, 1000),
      }));

      const [res] = await Promise.all([
        chatbotApi.chat({
          message: q,
          session_id: sessionRef.current || null,
          topic,
          role: "applicant",
          history,
        }),
        new Promise((r) => setTimeout(r, MIN_DELAY)),
      ]);

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: res.reply,
          ...(res.quick_replies?.length ? { replies: res.quick_replies } : {}),
          id: res.message_id ?? null,
          sources: res.sources ?? [],
          feedback: null,
          timestamp: formatTime(),
        },
      ]);
      setReducedMode(res.reduced === true);
      setTopic(res.topic ?? null);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "We're having trouble connecting right now. Please try again in a moment.",
          replies: STARTERS,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Oxford Suites Careers Concierge"
          className="fixed bottom-24 right-4 z-50 flex h-[33rem] w-[min(24.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Minimalist Hospitality Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-semibold tracking-wider text-primary-foreground shadow-sm">
                OS
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                    reducedMode ? "bg-amber-500" : "bg-emerald-500",
                  )}
                />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    Careers Desk
                  </span>
                </div>
                <p className="text-[0.7rem] text-muted-foreground">
                  {reducedMode ? "Limited FAQ mode" : "Oxford Suites Makati"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={resetChat}
                  title="Start new conversation"
                  aria-label="Start new conversation"
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden bg-muted/20">
            <ScrollAreaPrimitive.Viewport
              ref={viewportRef}
              className="h-full w-full rounded-[inherit]"
            >
              <div className="space-y-4 px-4 py-4">
                {messages.map((m, i) => {
                  const isBot = m.from === "bot";
                  const isLastMessage = i === messages.length - 1;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col space-y-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200",
                        isBot ? "items-start" : "items-end",
                      )}
                    >
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "max-w-[84%] whitespace-pre-line px-3.5 py-2.5 text-[0.84rem] leading-relaxed shadow-xs",
                          isBot
                            ? "rounded-2xl rounded-bl-sm border border-border/60 bg-card text-foreground"
                            : "rounded-2xl rounded-br-sm bg-primary text-primary-foreground",
                        )}
                      >
                        {renderRichText(m.text)}

                        {/* Subtle inline FAQ citation */}
                        {isBot && m.sources && m.sources.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1 border-t border-border/50 pt-2">
                            {m.sources.map((s) => (
                              <span
                                key={s.faq_id}
                                title={s.question}
                                className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-muted/70 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground"
                              >
                                <Check className="h-2.5 w-2.5 shrink-0 text-primary" />
                                <span className="truncate">{s.question}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Feedback Row */}
                      <div
                        className={cn(
                          "flex items-center gap-2 px-1 text-[0.65rem] text-muted-foreground/80",
                          !isBot && "flex-row-reverse",
                        )}
                      >
                        {m.timestamp && <span>{m.timestamp}</span>}

                        {isBot && m.id != null && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              aria-label="Helpful"
                              onClick={() => vote(m.id!, 1)}
                              className={cn(
                                "grid h-5 w-5 place-items-center rounded-md transition-colors hover:bg-muted hover:text-foreground",
                                m.feedback === 1 && "bg-primary/15 text-primary",
                              )}
                            >
                              <ThumbsUp className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Not helpful"
                              onClick={() => vote(m.id!, -1)}
                              className={cn(
                                "grid h-5 w-5 place-items-center rounded-md transition-colors hover:bg-muted hover:text-destructive",
                                m.feedback === -1 && "bg-destructive/15 text-destructive",
                              )}
                            >
                              <ThumbsDown className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Suggested Prompts (only shown on the latest bot turn to keep history clean) */}
                      {isBot && isLastMessage && m.replies && m.replies.length > 0 && !typing && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.replies.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => send(s)}
                              className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground/85 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:translate-y-0"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Three-Dot Staggered Typing Indicator */}
                {typing && (
                  <div className="flex items-start animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/60 bg-card px-4 py-3 shadow-2xs">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar />
            <ScrollAreaPrimitive.Corner />
          </ScrollAreaPrimitive.Root>

          {/* Unified Pill Composer */}
          <div className="border-t border-border/60 bg-background/90 p-3 backdrop-blur-md">
            <form
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 pl-3.5 pr-1.5 py-1 transition-colors focus-within:border-primary/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/15"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about roles, pay, or applying..."
                className="h-8 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/75 focus:outline-none"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                aria-label="Send message"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-35"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Pill / Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close careers assistant" : "Open careers assistant"}
        className={cn(
          "fixed bottom-6 right-4 z-50 flex items-center justify-center bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]",
          open
            ? "h-12 w-12 rounded-full"
            : "h-12 gap-2.5 rounded-full px-4 sm:px-5",
        )}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageSquareText className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium tracking-tight">Ask Careers</span>
          </>
        )}

        {!open && mounted && unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>
    </>
  );
}