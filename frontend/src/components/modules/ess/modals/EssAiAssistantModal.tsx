import { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  RotateCcw,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  ChevronDown,
  Mic,
  Plus,
  ArrowUpRight,
  HelpCircle,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { myProfile, myPayroll, myAttendance } from "@/data/ess";
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
    actionType?: "leave" | "payslip" | "coe" | "attendance" | "recognition";
  };
}

interface EssAiAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateCategory?: (category: string) => void;
}

const STORAGE_KEY = "oxford_ess_ai_chat_history";

export function EssAiAssistantModal({
  open,
  onOpenChange,
  onNavigateCategory,
}: EssAiAssistantModalProps) {
  const user = getUser();
  const userName = user?.full_name || myProfile.name;
  const firstName = userName.split(" ")[0];
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      essApi.overview().then(setOverview).catch(() => {});
    }
  }, [open]);

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

  const handleActionClick = (actionType?: string, linkTo?: string) => {
    onOpenChange(false);
    if (actionType) {
      if (actionType === "leave") onNavigateCategory?.("Attendance");
      else if (actionType === "payslip") onNavigateCategory?.("Payroll");
      else if (actionType === "coe") onNavigateCategory?.("Documents");
      else if (actionType === "attendance") onNavigateCategory?.("Attendance");
      else if (actionType === "recognition") onNavigateCategory?.("Recognition");
    } else if (linkTo) {
      window.location.href = linkTo;
    }
  };

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
          buttonText: "Open Leave Application →",
          actionType: "leave",
        },
      };
    }

    // 2. PAYROLL & PAYDAY
    if (q.includes("pay") || q.includes("salary") || q.includes("payslip") || q.includes("payout") || q.includes("cut off") || q.includes("dispute") || q.includes("13th")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Oxford Suites Makati Payroll Schedule & Guidelines:**\n\n• **Payout Dates**: 15th and 30th/31st of each month.\n• **Cut-off Periods**:\n  - 1st–15th: Paid on the 30th.\n  - 16th–end of month: Paid on the 15th of the following month.\n• **Next Upcoming Payout**: **${myPayroll.nextPayout || "August 30, 2026"}**.\n• **Night Differential**: 10% premium for hotel shifts rendered between 10:00 PM and 6:00 AM.\n• **13th Month Pay**: Disbursed on or before December 15 annually.`,
        timestamp: timeStr,
        actionCard: {
          title: "View Payslips & Breakdown",
          description: "Inspect net earnings, allowances, and statutory deductions.",
          buttonText: "View Latest Payslip →",
          actionType: "payslip",
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
          buttonText: "Request Document Now →",
          actionType: "coe",
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
          buttonText: "Go to Web Clocking →",
          actionType: "attendance",
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
          buttonText: "Open Recognition Wall →",
          actionType: "recognition",
        },
      };
    }

    // 7. PROBATION & PERFORMANCE
    if (q.includes("probation") || q.includes("regularization") || q.includes("performance") || q.includes("review") || q.includes("appraisal") || q.includes("milestone") || q.includes("lms")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `**Probationary Milestones & Performance Evaluation:**\n\n• **Week 1**: Orientation, biometrics setup, and tooling.\n• **Day 30**: 30-Day Check-in & initial performance sync with your supervisor.\n• **Day 90**: Mid-Probationary Performance Review & KPI milestone check.\n• **Day 180**: Final regularization appraisal for regular employment status.\n• **LMS Training**: Access assigned hotel service courses under the Performance tab.`,
        timestamp: timeStr,
      };
    }

    // 8. GREETINGS
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good morning") || q.includes("good afternoon") || q.includes("good day")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Hello ${firstName}! 👋 I am your Oxford Suites Makati HR AI Concierge.\n\nI can help you with:\n• Leave requests & remaining balances\n• Payroll cut-offs & payslip copies\n• Official COE & BIR 2316 requests\n• HMO insurance & government statutory benefits\n• Hotel policies, shifts & biometrics timekeeping\n\nWhat would you like to know today?`,
        timestamp: timeStr,
      };
    }

    // DEFAULT FALLBACK
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: `I understand you are asking about *"query"*. \n\nHere are some of the most common topics I can help with:\n• **Leaves & Balances**: Check VL/SL credits or file a leave.\n• **Payroll & Payslips**: Payout dates, net pay, and salary queries.\n• **Certificates & COE**: Certificate of Employment requests.\n• **Benefits & HMO**: Medical insurance and SSS/Pag-IBIG loan filing.\n\nFeel free to select one of the suggested buttons below or ask a specific question!`.replace("query", query),
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

    // Simulate smart AI response timing
    setTimeout(() => {
      const botResponse = generateAnswer(messageText);
      setMessages((prev) => [...prev, botResponse]);
      setIsThinking(false);
    }, 600);
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat session reset");
  };

  const SUGGESTED_PROMPTS = [
    {
      icon: Calendar,
      title: "Leave Credits",
      desc: "How many leave days do I have left?",
      color: "text-emerald-600 bg-emerald-500/10",
      query: "What is my remaining leave balance?",
    },
    {
      icon: FileText,
      title: "Payroll & Payday",
      desc: "When is the next payroll payout date?",
      color: "text-primary bg-primary/10",
      query: "When is the next payday?",
    },
    {
      icon: Building2,
      title: "Request a COE",
      desc: "How to request an employment certificate?",
      color: "text-blue-600 bg-blue-500/10",
      query: "How do I request a Certificate of Employment (COE)?",
    },
    {
      icon: ShieldCheck,
      title: "HMO & Medical",
      desc: "What does my Maxicare HMO cover?",
      color: "text-purple-600 bg-purple-500/10",
      query: "What does my HMO healthcare cover?",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[95vw] h-[85vh] max-h-[720px] p-0 gap-0 overflow-hidden bg-background border-border/80 shadow-2xl flex flex-col rounded-2xl [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Oxford Suites HR AI Concierge</DialogTitle>
        {/* Top Minimalist Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold flex items-center gap-1 py-0.5">
              <Sparkles className="h-3 w-3" /> Oxford HR AI Concierge
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">· Connected to Employee Portal</span>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body: Switch between Hero State & Active Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
          {messages.length === 0 ? (
            /* HERO SCREEN (Claude/Modern Style Layout) */
            <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-6 py-6">
              {/* Badge & Star Icon */}
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-amber-500/20 to-primary/10 text-primary shadow-xs border border-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  How can I help you today, {firstName}?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Ask me anything about your leave balances, payroll cut-offs, hotel policies, HMO benefits, or document requests.
                </p>
              </div>

              {/* Large Central Prompt Box (Matching Screenshot UI) */}
              <div className="w-full rounded-2xl border border-border/80 bg-card p-3 shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all text-left space-y-3">
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
                  placeholder="Ask anything about Oxford Suites HR, leaves, pay, or policies..."
                  className="w-full resize-none border-0 bg-transparent p-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[11px] bg-muted/60 text-muted-foreground border-border/60 py-0.5">
                      {userDept}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="hidden sm:inline-flex text-[11px] bg-primary/5 text-primary border-primary/20 py-0.5 font-medium">
                      Oxford HR v2.4
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim()}
                      className="h-8 px-3 rounded-lg font-semibold gap-1.5 shadow-xs"
                    >
                      <span>Ask AI</span>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Suggested Questions Grid */}
              <div className="w-full space-y-2 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Suggested topics
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.query)}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group shadow-2xs"
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
            <div className="space-y-4 max-w-2xl mx-auto pb-4">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className={`h-8 w-8 shrink-0 border ${isUser ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
                      <AvatarFallback className={isUser ? "bg-primary text-primary-foreground font-bold text-xs" : "bg-amber-500/15 text-amber-600 font-bold text-xs"}>
                        {isUser ? (firstName || "ME").slice(0, 2).toUpperCase() : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`space-y-2 max-w-[82%] sm:max-w-[75%]`}>
                      <div
                        className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-card border border-border/80 text-foreground rounded-tl-xs whitespace-pre-line"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Embedded Interactive Action Card */}
                      {msg.actionCard && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 text-left shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
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
                            onClick={() => handleActionClick(msg.actionCard?.actionType, msg.actionCard?.linkTo)}
                            className="w-full text-xs h-8 font-semibold gap-1.5 shadow-2xs mt-1"
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

              {/* Bot Thinking Animation */}
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
          <div className="p-4 border-t border-border/60 bg-card/60 backdrop-blur-md shrink-0">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
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
                  className="h-10 text-xs sm:text-sm pl-3 pr-10 rounded-xl"
                  disabled={isThinking}
                />
                <Button
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isThinking}
                  className="absolute right-1 top-1 h-8 w-8 rounded-lg shadow-xs"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
