import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Send,
  Bot,
  Calendar,
  FileText,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
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
import { myProfile } from "@/data/ess";
import { cn } from "@/lib/utils";
import {
  chatbotApi,
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
  serverId?: number | null;
  sources?: ApiChatbotSource[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_KEY = "oxford_ess_ai_fullpage_history";
const SESSIONS_STORAGE_KEY = "oxford_ess_ai_chat_sessions";
const ACTIVE_SESSION_KEY = "oxford_ess_ai_active_session_id";

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

export function EmployeeAiPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const user = mounted ? getUser() : null;
  const userName = user?.full_name || myProfile.name;
  const firstName = userName.split(" ")[0] || "there";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and migrate sessions
  useEffect(() => {
    setMounted(true);
    try {
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        setSessions(parsed);
        if (savedActiveId && parsed.some((s) => s.id === savedActiveId)) {
          setActiveSessionId(savedActiveId);
          const activeSess = parsed.find((s) => s.id === savedActiveId);
          if (activeSess) setMessages(activeSess.messages);
        } else if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
        }
      } else {
        // Fallback migration for legacy single-thread history
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          const parsedMsgs: Message[] = JSON.parse(legacy);
          if (parsedMsgs.length > 0) {
            const firstUser = parsedMsgs.find((m) => m.sender === "user");
            const newSession: ChatSession = {
              id: `session-${Date.now()}`,
              title: firstUser?.text.slice(0, 28) || "HR Inquiry",
              createdAt: "Earlier today",
              updatedAt: Date.now(),
              messages: parsedMsgs,
            };
            setSessions([newSession]);
            setActiveSessionId(newSession.id);
            setMessages(parsedMsgs);
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([newSession]));
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  // Auto-scroll on new message or thinking status change
  useEffect(() => {
    if (messages.length > 0 || isThinking) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

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

    let targetSessionId = activeSessionId;
    let targetSessions = [...sessions];

    // If starting a fresh chat or no active session, create a session
    if (!targetSessionId || !targetSessions.some((s) => s.id === targetSessionId)) {
      targetSessionId = `session-${Date.now()}`;
      const title = messageText.length > 30 ? messageText.slice(0, 30) + "..." : messageText;
      const newSession: ChatSession = {
        id: targetSessionId,
        title,
        createdAt: "Today",
        updatedAt: Date.now(),
        messages: [userMessage],
      };
      targetSessions = [newSession, ...targetSessions];
      setSessions(targetSessions);
      setActiveSessionId(targetSessionId);
    }

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
        ...(card ? { actionCard: card } : {}),
      };

      const finalMessages = [...next, botResponse];
      setMessages(finalMessages);

      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: finalMessages, updatedAt: Date.now() }
            : s,
        );
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
          if (targetSessionId) localStorage.setItem(ACTIVE_SESSION_KEY, targetSessionId);
        } catch {}
        return updated;
      });
    } catch {
      const fallback = fallbackAnswer(messageText);
      const finalMessages = [...next, fallback];
      setMessages(finalMessages);
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: finalMessages, updatedAt: Date.now() }
            : s,
        );
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
          if (targetSessionId) localStorage.setItem(ACTIVE_SESSION_KEY, targetSessionId);
        } catch {}
        return updated;
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectSession = (sess: ChatSession) => {
    setActiveSessionId(sess.id);
    setMessages(sess.messages);
    setInput("");
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, sess.id);
    } catch {}
  };

  const handleNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {}
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0]);
      } else {
        handleNewConversation();
      }
    }
    toast.success("Chat removed from history");
  };

  const handleClearAllHistory = () => {
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    toast.success("All chat history cleared");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Employee Concierge"
        title="HR AI Assistant"
        description="Your 24/7 personal HR assistant for policy guidance, leave balances, payroll cut-offs, and request shortcuts."
      />

      {/* Main Workspace Layout (Unified Aligned Container) */}
      <Card className="border-border/70 min-h-[660px] h-[750px] max-h-[85vh] flex flex-col lg:flex-row overflow-hidden shadow-sm">
        {/* Left Side Navigation & Chat History Drawer */}
        <div
          className={cn(
            "flex flex-col justify-between bg-card shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out border-border/60",
            sidebarOpen
              ? "w-full lg:w-[280px] opacity-100 lg:border-r border-b lg:border-b-0 translate-x-0"
              : "w-0 max-w-0 opacity-0 -translate-x-full lg:border-r-0 border-b-0 pointer-events-none"
          )}
        >
          {/* Header with Title and Close Tab Button */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/10 min-h-[44px] h-[44px] shrink-0">
            <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Chat History</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0 transition-transform duration-200 active:scale-95 group"
              title="Close sidebar tab"
              aria-label="Close sidebar tab"
            >
              <PanelLeftClose className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </Button>
          </div>

            {/* Sidebar Content */}
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
              <div className="space-y-3">
                {/* New Conversation Button */}
                <Button
                  onClick={handleNewConversation}
                  variant="outline"
                  className="w-full justify-start gap-2 h-9 rounded-xl font-semibold border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground shadow-2xs cursor-pointer text-xs"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>New Conversation</span>
                </Button>

                {/* Chat History Sessions List */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Previous Chats
                    </p>
                    {sessions.length > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono text-muted-foreground">
                        {sessions.length}
                      </Badge>
                    )}
                  </div>

                  {sessions.length === 0 ? (
                    <div className="py-6 px-3 text-center rounded-xl border border-dashed border-border/70 bg-muted/20">
                      <MessageSquare className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground font-medium">No chat history yet</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">Send a message to save your conversation.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-0.5">
                      {sessions.map((sess) => {
                        const isActive = sess.id === activeSessionId;
                        return (
                          <div
                            key={sess.id}
                            onClick={() => handleSelectSession(sess)}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left transition-all cursor-pointer group",
                              isActive
                                ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-2xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                              <MessageSquare className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                              <span className="truncate group-hover:font-medium">{sess.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(sess.id);
                              }}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 cursor-pointer transition-opacity"
                              title="Delete conversation"
                              aria-label={`Delete ${sess.title}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* System Info Badge */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified HR Knowledge
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Trained on Oxford Suites Makati HR policies, statutory DOLE labor standards, and benefits.
                  </p>
                </div>

                {sessions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllHistory}
                    className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 h-7 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear All History
                  </Button>
                )}
              </div>
            </div>
          </div>

        {/* Right Main AI Workspace Canvas */}
        <div className="flex-1 flex flex-col justify-between bg-card min-w-0 h-full">
          {/* Canvas Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border/60 bg-muted/10 min-h-[44px] h-[44px]">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden flex items-center",
                  !sidebarOpen
                    ? "opacity-100 max-w-[160px] translate-x-0"
                    : "opacity-0 max-w-0 -translate-x-3 pointer-events-none"
                )}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="h-7 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-muted font-medium cursor-pointer shadow-2xs whitespace-nowrap transition-transform duration-200 active:scale-95 group"
                  title="Open Chat History"
                >
                  <PanelLeftOpen className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Chat History</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="Start a new chat"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </Button>
            </div>
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
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim()}
                        className="h-8 px-4 rounded-lg font-semibold gap-1.5 shadow-xs cursor-pointer"
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

                        {/* Message timestamp (thumbs up/down removed) */}
                        <p className={`text-[10px] text-muted-foreground ${isUser ? "text-right" : "text-left"} px-1`}>
                          <span>{msg.timestamp}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Bot Typing / Thinking Animation with Three Dots */}
                {isThinking && (
                  <div className="flex items-start gap-3.5 animate-in fade-in-50 duration-200">
                    <Avatar className="h-8 w-8 shrink-0 border bg-muted border-border">
                      <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-xs">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border/80 shadow-xs flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "0ms", animationDuration: "900ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "150ms", animationDuration: "900ms" }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "300ms", animationDuration: "900ms" }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium select-none">
                        AI is thinking...
                      </span>
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
        </div>
      </Card>
    </div>
  );
}
