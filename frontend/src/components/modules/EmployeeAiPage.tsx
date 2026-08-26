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
import { myProfile, myPayroll } from "@/data/ess";
import { essApi, type ApiEssOverview } from "@/lib/api";

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
  const user = getUser();
  const userName = user?.full_name || myProfile.name;
  const firstName = userName.split(" ")[0] || "there";
  const userDept = user?.department_name || myProfile.department;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [isThinking, setIsThinking] = useState(false);
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const generateAnswer = (query: string): Message => {
    const q = query.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // 1. LEAVE & BALANCES
    if (q.includes("leave") || q.includes("vacation") || q.includes("sick") || q.includes("vl") || q.includes("sl") || q.includes("credit")) {
      const balances = overview?.leave_balances?.length
        ? overview.leave_balances.map((b) => `• **${b.type}**: ${b.available} days remaining (out of ${b.total} days)`).join("\n")
        : `• **Vacation Leave (VL)**: 12 days remaining\n• **Sick Leave (SL)**: 10 days remaining\n• **Emergency Leave**: 3 days remaining`;

      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Here is your current leave entitlement breakdown for Oxford Suites Makati:\n\n${balances}\n\n**Filing Policy:**\n• **Vacation Leave (VL)**: Must be filed at least 3 days in advance.\n• **Sick Leave (SL)**: A medical certificate is required for leaves exceeding 2 consecutive days.`,
        timestamp: timeStr,
        actionCard: {
          title: "File a Leave Request",
          description: "Submit vacation, sick, or emergency leave for supervisor review.",
          buttonText: "Go to Leave Application →",
          category: "Attendance",
        },
      };
    }

    // 2. PAYROLL & PAYDAY
    if (q.includes("pay") || q.includes("salary") || q.includes("payslip") || q.includes("payout") || q.includes("cut off") || q.includes("dispute") || q.includes("13th")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Oxford Suites Makati Payroll Schedule & Guidelines:**\n\n• **Payout Dates**: 15th and 30th/31st of each month.\n• **Cut-off Periods**:\n  - 1st–15th: Paid on the 30th.\n  - 16th–end of month: Paid on the 15th of the following month.\n• **Next Upcoming Payout**: **${overview?.payroll_summary?.next_payout || "August 30, 2026"}**.\n• **Night Differential**: 10% premium for hotel shifts rendered between 10:00 PM and 6:00 AM.\n• **13th Month Pay**: Disbursed on or before December 15 annually.`,
        timestamp: timeStr,
        actionCard: {
          title: "View Payslips & Breakdown",
          description: "Inspect net earnings, allowances, and statutory deductions.",
          buttonText: "View Payslips in ESS →",
          category: "Payroll",
        },
      };
    }

    // 3. COE & CERTIFICATES & DOCUMENTS
    if (q.includes("coe") || q.includes("certificate") || q.includes("document") || q.includes("2316") || q.includes("clearance") || q.includes("employment certificate")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `You can request official company certificates and documents directly through the **Company Documents** section:\n\n• **Certificate of Employment (COE)**: Available with or without compensation breakdown (Turnaround: 2–3 business days).\n• **BIR Form 2316**: Certificate of Compensation Payment & Tax Withheld (Issued annually every January).\n• **HR Clearances & Approvals**: Processed upon departmental verification.`,
        timestamp: timeStr,
        actionCard: {
          title: "Request Official Document / COE",
          description: "Submit a signed document request to HR Administration.",
          buttonText: "Open Document Requests in ESS →",
          category: "Documents",
        },
      };
    }

    // 4. ATTENDANCE, SHIFTS, TIME IN / DTR
    if (q.includes("attendance") || q.includes("time in") || q.includes("time out") || q.includes("clock") || q.includes("dtr") || q.includes("late") || q.includes("shift") || q.includes("schedule")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Hotel Work Schedule & Timekeeping Guidelines:**\n\n• **Standard Hotel Shifts**:\n  - Morning: 07:00 AM – 04:00 PM (1 hr meal break)\n  - Mid Shift: 02:00 PM – 11:00 PM\n  - Night Audit: 10:00 PM – 07:00 AM\n• **Grace Period**: 15 minutes for biometrics time-in.\n• **DTR Corrections**: If you missed a punch-in or punch-out, file an Attendance Correction under the Web Clocking tab within 48 hours for supervisor sign-off.`,
        timestamp: timeStr,
        actionCard: {
          title: "Attendance & Web Clocking",
          description: "View daily logs, biometrics history, and submit punch corrections.",
          buttonText: "Open Web Clocking in ESS →",
          category: "Attendance",
        },
      };
    }

    // 5. BENEFITS, HMO, LOANS & SSS
    if (q.includes("hmo") || q.includes("benefit") || q.includes("loan") || q.includes("sss") || q.includes("philhealth") || q.includes("pag-ibig") || q.includes("insurance") || q.includes("hospital") || q.includes("clinic")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Employee Benefits & Statutory Support:**\n\n• **HMO Healthcare (Maxicare)**:\n  - Comprehensive Inpatient & Outpatient medical coverage.\n  - Annual Physical Examination (APE) scheduled every Q1.\n  - Dependent enrollment window is open during regularization or annual renewal.\n• **Statutory Government Contributions**:\n  - SSS, PhilHealth, and Pag-IBIG are automatically computed and remitted.\n• **Salary & Calamity Loans**:\n  - Apply directly on Member SSS / Virtual Pag-IBIG portals; HR verifies billing statements within 3 working days.`,
        timestamp: timeStr,
      };
    }

    // 6. SOCIAL RECOGNITION & KUDOS
    if (q.includes("recognition") || q.includes("kudos") || q.includes("shoutout") || q.includes("wall") || q.includes("praise") || q.includes("award") || q.includes("values")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Oxford Suites Social Recognition:**\n\nCelebrate your colleagues by sending kudos on the **Public Wall of Fame** tied to our 5 Service Values:\n1. ⭐ **Guest Delight** (Exceeding guest expectations)\n2. 🤝 **Teamwork & Malasakit** (Cross-department care)\n3. 🚀 **Going the Extra Mile** (Initiative & urgency)\n4. ⚙️ **Operational Excellence** (Safety & quality)\n5. 🛡️ **Integrity & Trust** (Accountability)\n\nRecognitions directly count toward monthly **Employee of the Month** awards!`,
        timestamp: timeStr,
        actionCard: {
          title: "Social Recognition Wall of Fame",
          description: "Recognize a fellow teammate or view recent department shoutouts.",
          buttonText: "Open Recognition Wall in ESS →",
          category: "Recognition",
        },
      };
    }

    // 7. GREETINGS
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good morning") || q.includes("good afternoon") || q.includes("good day")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Hello ${firstName}! 👋 I am your Oxford Suites Makati HR AI Concierge.\n\nI can help you with:\n• Leave requests & remaining balances\n• Payroll cut-offs & payslip copies\n• Official COE & BIR 2316 requests\n• HMO insurance & government statutory benefits\n• Hotel policies, shifts & biometrics timekeeping\n\nWhat would you like to explore today?`,
        timestamp: timeStr,
      };
    }

    // DEFAULT FALLBACK
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: `I understand you are asking about *"query"*. \n\nHere are some of the most common topics I can help with:\n• **Leaves & Balances**: Check VL/SL credits or file a leave.\n• **Payroll & Payslips**: Payout dates, net pay, and salary queries.\n• **Certificates & COE**: Certificate of Employment requests.\n• **Benefits & HMO**: Medical insurance and SSS/Pag-IBIG loan filing.\n\nFeel free to select one of the suggested topics on the left or type a specific question!`.replace("query", query),
      timestamp: timeStr,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const botResponse = generateAnswer(messageText);
      setMessages((prev) => [...prev, botResponse]);
      setIsThinking(false);
    }, 600);
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
                          {msg.text}
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

                        <p className={`text-[10px] text-muted-foreground ${isUser ? "text-right" : "text-left"} px-1`}>
                          {msg.timestamp}
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
