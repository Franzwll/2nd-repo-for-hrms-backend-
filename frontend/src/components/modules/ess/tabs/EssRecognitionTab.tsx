import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Sparkles,
  Heart,
  Flame,
  Star,
  Send,
  Search,
  Filter,
  Users,
  Building2,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Smile,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { myProfile } from "@/data/ess";

export interface RecognitionPost {
  id: string;
  senderName: string;
  senderRole: string;
  senderInitials: string;
  recipientName: string;
  recipientRole: string;
  recipientInitials: string;
  coreValue: "Guest Delight" | "Teamwork & Malasakit" | "Going the Extra Mile" | "Operational Excellence" | "Integrity & Trust";
  message: string;
  timestamp: string;
  isoDate: string;
  reactions: {
    clap: number;
    heart: number;
    star: number;
    fire: number;
  };
  userReactions: string[]; // ['clap', 'heart', etc.]
}

const CORE_VALUES = [
  {
    id: "Guest Delight",
    label: "Guest Delight",
    icon: Star,
    color: "bg-primary/10 text-primary border-primary/20",
    activeColor: "bg-primary text-primary-foreground shadow-xs",
    desc: "Exceeding guest expectations with warmth and prompt hospitality.",
  },
  {
    id: "Teamwork & Malasakit",
    label: "Teamwork & Malasakit",
    icon: Users,
    color: "bg-primary/10 text-primary border-primary/20",
    activeColor: "bg-primary text-primary-foreground shadow-xs",
    desc: "Cross-departmental care, collaboration, and supporting teammates.",
  },
  {
    id: "Going the Extra Mile",
    label: "Going the Extra Mile",
    icon: Sparkles,
    color: "bg-primary/10 text-primary border-primary/20",
    activeColor: "bg-primary text-primary-foreground shadow-xs",
    desc: "Taking initiative beyond duty to resolve urgent guest or operational needs.",
  },
  {
    id: "Operational Excellence",
    label: "Operational Excellence",
    icon: TrendingUp,
    color: "bg-primary/10 text-primary border-primary/20",
    activeColor: "bg-primary text-primary-foreground shadow-xs",
    desc: "Flawless standards in cleanliness, kitchen prep, and hotel safety.",
  },
  {
    id: "Integrity & Trust",
    label: "Integrity & Trust",
    icon: ShieldCheck,
    color: "bg-primary/10 text-primary border-primary/20",
    activeColor: "bg-primary text-primary-foreground shadow-xs",
    desc: "Honesty, punctuality, and unwavering professionalism in hotel service.",
  },
] as const;

const COLLEAGUES = [
  { name: "Maria Santos", role: "Guest Relations Officer · Front Office", initials: "MS" },
  { name: "Chef Marco Rossi", role: "Executive Chef · Kitchen & F&B", initials: "MR" },
  { name: "Paolo Cruz", role: "Payroll & HR Specialist · HR", initials: "PC" },
  { name: "Ricardo Gomez", role: "Senior Room Attendant · Housekeeping", initials: "RG" },
  { name: "Elena Torres", role: "Housekeeping Supervisor · Housekeeping", initials: "ET" },
  { name: "Ana Bautista", role: "Banquet Sales Coordinator · Sales & Events", initials: "AB" },
  { name: "Kevin Dela Cruz", role: "Kitchen Line Staff · Food & Beverage", initials: "KD" },
];

const INITIAL_POSTS: RecognitionPost[] = [
  {
    id: "rec-1",
    senderName: "Chef Marco Rossi",
    senderRole: "Executive Chef · F&B",
    senderInitials: "MR",
    recipientName: "Kevin Dela Cruz",
    recipientRole: "Kitchen Line Staff · F&B",
    recipientInitials: "KD",
    coreValue: "Teamwork & Malasakit",
    message: "Stepped up during the 200-guest executive banquet dinner rush and ensured flawless plating and zero delays!",
    timestamp: "2 hours ago",
    isoDate: "2026-08-21T09:30:00Z",
    reactions: { clap: 14, heart: 8, star: 6, fire: 5 },
    userReactions: ["clap", "star"],
  },
  {
    id: "rec-2",
    senderName: "Paolo Cruz",
    senderRole: "Payroll Officer · HR",
    senderInitials: "PC",
    recipientName: "Maria Santos",
    recipientRole: "Guest Relations Officer · Front Office",
    recipientInitials: "MS",
    coreValue: "Guest Delight",
    message: "Received a glowing 5-star TripAdvisor review from our corporate VIP praising your warmth, attentiveness, and swift check-in!",
    timestamp: "Yesterday",
    isoDate: "2026-08-20T14:15:00Z",
    reactions: { clap: 19, heart: 12, star: 10, fire: 4 },
    userReactions: ["heart"],
  },
  {
    id: "rec-3",
    senderName: "Kevin Dela Cruz",
    senderRole: "Kitchen Line Staff · F&B",
    senderInitials: "KD",
    recipientName: "Chef Marco Rossi",
    recipientRole: "Executive Chef · F&B",
    recipientInitials: "MR",
    coreValue: "Going the Extra Mile",
    message: "Thank you for mentoring the team through the new seasonal tasting menu prep and always looking out for kitchen crew welfare!",
    timestamp: "Aug 19, 2026",
    isoDate: "2026-08-19T17:00:00Z",
    reactions: { clap: 11, heart: 7, star: 5, fire: 2 },
    userReactions: [],
  },
  {
    id: "rec-4",
    senderName: "Elena Torres",
    senderRole: "Housekeeping Supervisor · Housekeeping",
    senderInitials: "ET",
    recipientName: "Ricardo Gomez",
    recipientRole: "Senior Room Attendant · Housekeeping",
    recipientInitials: "RG",
    coreValue: "Operational Excellence",
    message: "Maintained a 100% spotless inspection pass rate across all 30 deluxe executive suites on Floor 8 with zero guest callbacks.",
    timestamp: "Aug 18, 2026",
    isoDate: "2026-08-18T11:20:00Z",
    reactions: { clap: 9, heart: 5, star: 8, fire: 3 },
    userReactions: ["fire"],
  },
];

import { newHiresApi, essApi, type ApiRecognitionItem } from "@/lib/api";

const STORAGE_KEY = "oxford_social_recognitions";

export function EssRecognitionTab() {
  const user = getUser();
  const currentUserName = user?.full_name || myProfile.name;

  const [posts, setPosts] = useState<RecognitionPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_POSTS;
  });

  const [colleaguesList, setColleaguesList] = useState(COLLEAGUES);
  const [activeFilter, setActiveFilter] = useState<"all" | "received" | "given">("all");
  const [selectedValueFilter, setSelectedValueFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [recipient, setRecipient] = useState<string>("");
  const [selectedCoreValue, setSelectedCoreValue] = useState<RecognitionPost["coreValue"]>("Guest Delight");
  const [message, setMessage] = useState("");

  // Fetch from backend
  useEffect(() => {
    essApi
      .recognitions()
      .then((res) => {
        if (res.recognitions && res.recognitions.length > 0) {
          const apiMapped: RecognitionPost[] = res.recognitions.map((r) => ({
            id: r.id,
            senderName: r.sender,
            senderRole: r.senderRole || "Oxford Staff",
            senderInitials: r.senderAvatar || r.sender.slice(0, 2).toUpperCase(),
            recipientName: r.recipient,
            recipientRole: r.recipientRole || "Oxford Staff",
            recipientInitials: r.recipientAvatar || r.recipient.slice(0, 2).toUpperCase(),
            coreValue: (r.badge as RecognitionPost["coreValue"]) || "Guest Delight",
            message: r.message,
            timestamp: r.timeAgo || "Today",
            isoDate: r.createdAt || new Date().toISOString(),
            reactions: r.reactions || { clap: 1, heart: 0, star: 0, fire: 0 },
            userReactions: [],
          }));
          setPosts(apiMapped);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live new hires / employees from backend to populate colleague dropdown dynamically
  useEffect(() => {
    newHiresApi
      .list({ per_page: 50 })
      .then((res) => {
        if (res?.data?.length) {
          const apiColleagues = res.data.map((h) => ({
            name: h.name,
            role: `${h.position || "Staff"} · ${h.department || "Oxford Suites"}`,
            initials: h.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          }));

          // Merge without duplicates
          setColleaguesList((prev) => {
            const names = new Set(prev.map((c) => c.name.toLowerCase()));
            const newOnes = apiColleagues.filter((c) => !names.has(c.name.toLowerCase()));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage and notify other components
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      window.dispatchEvent(new Event("recognition_updated"));
    } catch {
      // ignore
    }
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Scope filter
      if (activeFilter === "received" && !p.recipientName.toLowerCase().includes(currentUserName.toLowerCase())) {
        return false;
      }
      if (activeFilter === "given" && !p.senderName.toLowerCase().includes(currentUserName.toLowerCase())) {
        return false;
      }
      // Value filter
      if (selectedValueFilter !== "all" && p.coreValue !== selectedValueFilter) {
        return false;
      }
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matched =
          p.recipientName.toLowerCase().includes(query) ||
          p.senderName.toLowerCase().includes(query) ||
          p.message.toLowerCase().includes(query) ||
          p.coreValue.toLowerCase().includes(query);
        if (!matched) return false;
      }
      return true;
    });
  }, [posts, activeFilter, selectedValueFilter, searchTerm, currentUserName]);

  // Personal Stats
  const myReceivedCount = posts.filter((p) =>
    p.recipientName.toLowerCase().includes(currentUserName.toLowerCase())
  ).length;
  const myGivenCount = posts.filter((p) =>
    p.senderName.toLowerCase().includes(currentUserName.toLowerCase())
  ).length;

  const handleToggleReaction = async (postId: string, reactionType: "clap" | "heart" | "star" | "fire") => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const hasReacted = post.userReactions.includes(reactionType);
        const nextUserReactions = hasReacted
          ? post.userReactions.filter((r) => r !== reactionType)
          : [...post.userReactions, reactionType];

        const nextCount = post.reactions[reactionType] + (hasReacted ? -1 : 1);

        return {
          ...post,
          reactions: {
            ...post.reactions,
            [reactionType]: Math.max(0, nextCount),
          },
          userReactions: nextUserReactions,
        };
      })
    );

    try {
      await essApi.reactKudos(postId, reactionType);
    } catch {
      // ignore
    }
  };

  const handleSendRecognition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      toast.error("Please select a colleague to recognize.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write a short recognition message.");
      return;
    }

    const recipientObj = colleaguesList.find((c) => c.name === recipient) || {
      name: recipient,
      role: "Oxford Suites Makati Team Member",
      initials: recipient.slice(0, 2).toUpperCase(),
    };

    const newPost: RecognitionPost = {
      id: `rec-${Date.now()}`,
      senderName: currentUserName,
      senderRole: `${user?.department_name || myProfile.department} Staff`,
      senderInitials: currentUserName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      recipientName: recipientObj.name,
      recipientRole: recipientObj.role,
      recipientInitials: recipientObj.initials,
      coreValue: selectedCoreValue,
      message: message.trim(),
      timestamp: "Just now",
      isoDate: new Date().toISOString(),
      reactions: { clap: 1, heart: 0, star: 0, fire: 0 },
      userReactions: ["clap"],
    };

    setPosts([newPost, ...posts]);
    toast.success(`Recognition sent to ${recipientObj.name}! 🎉`);
    setRecipient("");
    setMessage("");

    try {
      await essApi.sendKudos({
        recipient: recipientObj.name,
        badge: selectedCoreValue,
        message: message.trim(),
      });
    } catch {
      // optimistic state retained
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview - Oxford Red & White Theme */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 shadow-xs bg-card hover:border-primary/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Kudos Received</p>
              <p className="mt-1 text-3xl font-bold font-display text-primary">
                {myReceivedCount} <span className="text-xs font-normal text-muted-foreground">shout-outs</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Top: ⭐ Guest Delight</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs bg-card hover:border-primary/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Kudos Given</p>
              <p className="mt-1 text-3xl font-bold font-display text-primary">
                {myGivenCount} <span className="text-xs font-normal text-muted-foreground">sent</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Fostering hotel excellence</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20">
              <Heart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs bg-card hover:border-primary/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Oxford Service Values</p>
              <p className="mt-1 text-2xl font-bold font-display text-foreground">
                5 Core Pillars
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Recognizing hotel hospitality</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Feed & Give Form */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Recognition Wall Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Wall of Fame &amp; Peer Recognitions
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live stream of praise tied to Oxford Suites Makati service values.
                  </p>
                </div>

                {/* Scope Filter Pills */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto border border-border/60">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Wall
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("received")}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeFilter === "received"
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Received ({myReceivedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("given")}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeFilter === "given"
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Given ({myGivenCount})
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60 mt-3">
                <div className="relative flex-1 min-w-[140px]">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search kudos or colleagues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs focus:border-primary"
                  />
                </div>
                <Select value={selectedValueFilter} onValueChange={setSelectedValueFilter}>
                  <SelectTrigger className="h-8 text-xs w-[160px] focus:border-primary">
                    <SelectValue placeholder="All Core Values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Core Values</SelectItem>
                    {CORE_VALUES.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {filteredPosts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
                  <Award className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>No recognitions matching your filter.</p>
                  <Button variant="outline" size="sm" onClick={() => { setActiveFilter("all"); setSelectedValueFilter("all"); setSearchTerm(""); }}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const coreValueMeta = CORE_VALUES.find((v) => v.id === post.coreValue) || CORE_VALUES[0];
                  const Icon = coreValueMeta.icon;

                  return (
                    <div
                      key={post.id}
                      className="rounded-xl border border-border/70 p-4 space-y-3 bg-card hover:border-primary/40 transition-all shadow-2xs"
                    >
                      {/* Sender & Recipient Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex items-center">
                            <Avatar className="h-9 w-9 border border-border/80 bg-muted">
                              <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">
                                {post.senderInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="mx-1.5 text-xs text-primary font-bold">→</span>
                            <Avatar className="h-9 w-9 border border-primary/40 ring-2 ring-primary/20 bg-primary/10">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {post.recipientInitials}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              <span className="text-foreground font-bold">{post.senderName}</span> recognized{" "}
                              <span className="text-primary font-bold">{post.recipientName}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground">{post.recipientRole} · {post.timestamp}</p>
                          </div>
                        </div>

                        {/* Core Value Badge */}
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                          <Icon className="h-3 w-3" />
                          <span>{post.coreValue}</span>
                        </Badge>
                      </div>

                      {/* Recognition Message Box */}
                      <div className="rounded-xl bg-muted/20 border border-border/60 p-3.5 text-xs sm:text-sm text-foreground leading-relaxed">
                        "{post.message}"
                      </div>

                      {/* Emoji Reactions Bar */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleReaction(post.id, "clap")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            post.userReactions.includes("clap")
                              ? "bg-primary/15 border-primary/50 text-primary shadow-2xs"
                              : "bg-background border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span>👏</span>
                          <span>{post.reactions.clap}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReaction(post.id, "heart")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            post.userReactions.includes("heart")
                              ? "bg-primary/15 border-primary/50 text-primary shadow-2xs"
                              : "bg-background border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span>❤️</span>
                          <span>{post.reactions.heart}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReaction(post.id, "star")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            post.userReactions.includes("star")
                              ? "bg-primary/15 border-primary/50 text-primary shadow-2xs"
                              : "bg-background border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span>⭐</span>
                          <span>{post.reactions.star}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReaction(post.id, "fire")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            post.userReactions.includes("fire")
                              ? "bg-primary/15 border-primary/50 text-primary shadow-2xs"
                              : "bg-background border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span>🔥</span>
                          <span>{post.reactions.fire}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Give Recognition Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Give Social Recognition
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Publicly praise a colleague for demonstrating hotel values.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendRecognition} className="space-y-4">
                {/* 1. Recipient Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Recognize Colleague</Label>
                  <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger className="h-9 text-xs focus:border-primary">
                      <SelectValue placeholder="Select team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colleaguesList.map((c) => (
                        <SelectItem key={c.name} value={c.name} className="text-xs">
                          {c.name} — <span className="text-muted-foreground">{c.role}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Core Value Tag Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Service Core Value</Label>
                  <div className="grid gap-2">
                    {CORE_VALUES.map((cv) => {
                      const isSelected = selectedCoreValue === cv.id;
                      const Icon = cv.icon;
                      return (
                        <button
                          key={cv.id}
                          type="button"
                          onClick={() => setSelectedCoreValue(cv.id as any)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                              : "border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 text-foreground"
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold">{cv.label}</p>
                            <p className={`text-[11px] line-clamp-1 ${isSelected ? "text-white/90" : "text-muted-foreground"}`}>
                              {cv.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Short Message with 200 Char Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Recognition Message</Label>
                    <span className={`text-[10px] font-mono ${message.length > 200 ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                      {message.length} / 200 chars
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    maxLength={200}
                    placeholder="Write sincere praise on how they went above and beyond..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="text-xs focus:border-primary"
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-1.5 shadow-xs font-semibold text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="h-4 w-4" /> Post Recognition to Wall
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Oxford Core Values Guide Card */}
          <Card className="border-border/70 shadow-xs bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Oxford Suites Service Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 pt-0">
              <p>
                Recognitions earned feed into monthly <strong>Employee of the Month</strong> nominations and annual performance appraisals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
