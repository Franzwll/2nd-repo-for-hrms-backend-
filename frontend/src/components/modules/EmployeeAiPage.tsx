import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Plus,
  MessageSquare,
  BookOpen,
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { renderRichText } from "@/lib/rich-text";
import { myProfile, myPayroll } from "@/data/ess";
import {
  chatbotApi,
  chatbotFaqApi,
  essApi,
  type ApiChatbotSource,
  type ApiEssOverview,
} from "@/lib/api";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    description: string;
    buttonText: string;
    linkTo?: string;
    category?: string;
  };
  /** DB id of the stored exchange (bot replies) — used for thumbs feedback. */
  serverId?: number | null;
  sources?: ApiChatbotSource[];
  feedback?: 1 | -1 | null;
}

const STORAGE_KEY = "oxford_ess_ai_fullpage_history";

const SUGGESTED_PROMPTS = [
  {
    icon: Calendar,
    title: "Leave Credits",
    desc: "How many vacation and sick leave days do I have left?",
    color: "text-emerald-600 bg-emerald-500/10",
    query: "What is my remaining leave balance?",
  },
  {
    icon: FileText,
    title: "Payroll & Payday",
    desc: "When is the next 15th/30th payroll payout date?",
    color: "text-primary bg-primary/10",
    query: "When is the next payday?",
  },
  {
    icon: Building2,
    title: "Request a COE",
    desc: "How do I request an official Certificate of Employment?",
    color: "text-blue-600 bg-blue-500/10",
    query: "How do I request a Certificate of Employment (COE)?",
  },
  {
    icon: ShieldCheck,
    title: "HMO & Medical",
    desc: "What does my Maxicare healthcare coverage include?",
    color: "text-purple-600 bg-purple-500/10",
    query: "What does my HMO healthcare cover?",
  },
];

const PRESET_TOPICS = [
  { label: "Leave Entitlements", query: "What is my remaining leave balance?" },
  { label: "Payroll Schedule", query: "When is the next payday?" },
  { label: "COE & Certificates", query: "How do I request a Certificate of Employment (COE)?" },
  { label: "Attendance & Shifts", query: "What are the standard hotel shift hours and DTR rules?" },
  { label: "HMO & Medical", query: "What does my HMO healthcare cover?" },
  { label: "Social Recognition", query: "How does Social Recognition and Wall of Fame work?" },
];

export function EmployeeAiPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const user = mounted ? getUser() : null;
  const userName = user?.full_name || myProfile.name;
  const firstName = userName.split(" ")[0] || "there";
  const userDept = user?.department_name || myProfile.department;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, mounted]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  /**
   * Live AI answer via backend Gemini proxy (role=employee, HRMS-scoped).
   * Falls back to a local greeting/leave summary when the server is
   * unreachable so the concierge never goes blank.
   */
  const actionCardFor = (
    query: string,
  ): Message["actionCard"] | undefined => {
    const q = query.toLowerCase();
    if (q.includes("leave") || q.includes("vacation") || q.includes("sick"))
      return {
        title: "File a Leave Request",
        description: "Submit vacation, sick, or emergency leave for supervisor review.",
        buttonText: "Go to Leave Application →",
        category: "Attendance",
      };
    if (q.includes("pay") || q.includes("salary") || q.includes("payslip"))
      return {
        title: "View Payslips & Breakdown",
        description: "Inspect net earnings, allowances, and statutory deductions.",
        buttonText: "View Payslips in ESS →",
        category: "Payroll",
      };
    if (q.includes("coe") || q.includes("certificate") || q.includes("document") || q.includes("2316"))
      return {
        title: "Request Official Document / COE",
        description: "Submit a signed document request to HR Administration.",
        buttonText: "Open Document Requests in ESS →",
        category: "Documents",
      };
    if (q.includes("promotion"))
      return {
        title: "Request a Promotion",
        description: "File a promotion request for HR review in Core HCM.",
        buttonText: "Open Promotion Requests →",
        category: "Promotion",
      };
    if (q.includes("attendance") || q.includes("clock") || q.includes("shift") || q.includes("dtr"))
      return {
        title: "Attendance & Web Clocking",
        description: "View daily logs, biometrics history, and submit punch corrections.",
        buttonText: "Open Web Clocking in ESS →",
        category: "Attendance",
      };
    if (q.includes("recognition") || q.includes("kudos") || q.includes("wall"))
      return {
        title: "Social Recognition Wall of Fame",
        description: "Recognize a fellow teammate or view recent department shoutouts.",
        buttonText: "Open Recognition Wall in ESS →",
        category: "Recognition",
      };
    return undefined;
  };

  const fallbackAnswer = (query: string): Message => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const balances = overview?.leave_balances?.length
      ? overview.leave_balances
          .map((b) => `• ${b.type}: ${b.available} days remaining`)
          .join("\n")
      : "• Vacation Leave: 12 days remaining\n• Sick Leave: 10 days remaining";
    const card = actionCardFor(query);
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: `I'm offline right now, but here's what I can share:\n\n${balances}\n\nPlease try again in a moment for full AI answers about "${query}".`,
      timestamp: timeStr,
      ...(card ? { actionCard: card } : {}),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isThinking) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: timeStr,
    };

    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setIsThinking(true);

    try {
      const history = next.slice(-11, -1).map((m) => ({
        role: (m.sender === "bot" ? "model" : "user") as "user" | "model",
        text: m.text.slice(0, 1000),
      }));
      const res = await chatbotApi.chat({
        message: messageText,
        role: "employee",
        history,
      });
      const card = actionCardFor(messageText);
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        serverId: res.message_id ?? null,
        sources: res.sources ?? [],
        feedback: null,
        ...(card ? { actionCard: card } : {}),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      setMessages((prev) => [...prev, fallbackAnswer(messageText)]);
    } finally {
      setIsThinking(false);
    }
  };

  const vote = (msg: Message, value: 1 | -1) => {
    if (msg.serverId == null) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, feedback: m.feedback === value ? null : value }
          : m,
      ),
    );
    // Optimistic — the stored vote is only used for quality analytics.
    chatbotFaqApi
      .messageFeedback(msg.serverId, msg.feedback === value ? 0 : value)
      .catch(() => {});
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Conversation cleared");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Employee Concierge"
        title="HR AI Assistant"
        description="Your 24/7 personal HR assistant for policy guidance, leave balances, payroll cut-offs, and request shortcuts."
      />

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
        {/* Left Side Navigation & Quick Topics Drawer */}
        <Card className="border-border/70 overflow-hidden space-y-4">
          <CardContent className="p-4 space-y-4">
            {/* New Chat Button */}
            <Button
              onClick={handleClearHistory}
              variant="outline"
              className="w-full justify-start gap-2 h-10 rounded-xl font-semibold border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground shadow-2xs"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>New Conversation</span>
            </Button>

            {/* Quick Topic Shortcuts */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                Knowledge Topics
              </p>
              <div className="space-y-1">
                {PRESET_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(topic.query)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <span className="truncate group-hover:font-medium">{topic.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* System Info Badge */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified HR Knowledge
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Trained on Oxford Suites Makati HR policies, statutory DOLE labor standards, and benefits.
              </p>
            </div>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear History
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Main AI Workspace Canvas */}
        <Card className="border-border/70 min-h-[640px] flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Canvas Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/60 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold flex items-center gap-1.5 py-0.5">
                <Bot className="h-3.5 w-3.5" /> Oxford HR AI Concierge
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">· Live Context for {firstName}</span>
            </div>

            <Badge variant="outline" className="text-[11px] bg-muted/60 text-muted-foreground">
              {userDept}
            </Badge>
          </div>

          {/* Canvas Body: Hero State vs. Chat Stream */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
            {messages.length === 0 ? (
              /* HERO STATE (Claude/Modern Style Layout) */
              <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-7 py-8">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                    How can I help you today, {firstName}?
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Ask me about your leave balances, payroll schedules, hotel timekeeping, HMO benefits, or submit an official request.
                  </p>
                </div>

                {/* Central Large Prompt Box */}
                <div className="w-full rounded-2xl border border-border/80 bg-card p-3.5 shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all text-left space-y-3">
                  <Textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask anything about Oxford Suites HR policies, leaves, pay, or benefits..."
                    className="w-full resize-none border-0 bg-transparent p-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                  />

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Press Enter to send
                    </span>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="hidden sm:inline-flex text-[11px] bg-primary/5 text-primary border-primary/20 py-0.5 font-medium">
                        Oxford HR v2.4
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim()}
                        className="h-8 px-4 rounded-lg font-semibold gap-1.5 shadow-xs"
                      >
                        <span>Ask AI</span>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Suggested Topics 2x2 Grid */}
                <div className="w-full space-y-2.5 text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Suggested topics
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SUGGESTED_PROMPTS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item.query)}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group shadow-2xs cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg ${item.color} shrink-0 mt-0.5`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                              <span>{item.title}</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE CHAT THREAD */
              <div className="space-y-5 max-w-3xl mx-auto pb-4">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar className={`h-8 w-8 shrink-0 border ${isUser ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
                        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground font-bold text-xs" : "bg-amber-500/15 text-amber-600 font-bold text-xs"}>
                          {isUser ? (firstName || "ME").slice(0, 2).toUpperCase() : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                        <div
                          className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isUser
                              ? "bg-primary text-primary-foreground rounded-tr-xs"
                              : "bg-card border border-border/80 text-foreground rounded-tl-xs whitespace-pre-line"
                          }`}
                        >
                          {renderRichText(msg.text)}
                        </div>

                        {/* Embedded Action Shortcut Card */}
                        {msg.actionCard && (
                          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2 text-left shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                <Bot className="h-3.5 w-3.5 text-primary" />
                                {msg.actionCard.title}
                              </span>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                Quick Action
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {msg.actionCard.description}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (msg.actionCard?.category) {
                                  navigate({
                                    to: "/employee/ess",
                                    search: { category: msg.actionCard.category },
                                  });
                                }
                              }}
                              className="w-full text-xs h-8 font-semibold gap-1.5 shadow-2xs mt-1 cursor-pointer"
                            >
                              <span>{msg.actionCard.buttonText}</span>
                            </Button>
                          </div>
                        )}

                        {/* FAQ citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((s) => (
                              <span
                                key={s.faq_id}
                                title={`Based on FAQ: ${s.question}`}
                                className="max-w-full truncate rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                              >
                                Based on: {s.question}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className={`text-[10px] text-muted-foreground ${isUser ? "text-right" : "text-left"} px-1 flex items-center gap-2`}>
                          <span>{msg.timestamp}</span>
                          {!isUser && msg.serverId != null && (
                            <span className="flex items-center gap-1">
                              <button
                                aria-label="Helpful"
                                onClick={() => vote(msg, 1)}
                                className={`grid h-5 w-5 place-items-center rounded-full hover:bg-muted ${msg.feedback === 1 ? "text-primary" : "text-muted-foreground"}`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                aria-label="Not helpful"
                                onClick={() => vote(msg, -1)}
                                className={`grid h-5 w-5 place-items-center rounded-full hover:bg-muted ${msg.feedback === -1 ? "text-destructive" : "text-muted-foreground"}`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Bot Thinking Bubble */}
                {isThinking && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0 bg-muted border border-border">
                      <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-xs">
                        <Bot className="h-4 w-4 animate-spin" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl p-3.5 bg-card border border-border/80 shadow-xs flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Fixed Bottom Input Bar (when chat is active) */}
          {messages.length > 0 && (
            <div className="p-4 border-t border-border/60 bg-card/80 backdrop-blur-md">
              <div className="max-w-3xl mx-auto flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask a follow-up question..."
                    className="h-11 text-xs sm:text-sm pl-4 pr-12 rounded-xl"
                    disabled={isThinking}
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isThinking}
                    className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg shadow-xs cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
