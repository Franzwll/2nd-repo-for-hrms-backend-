import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Sparkles,
  Heart,
  Flame,
  Star,
  Send,
  Search,
  Users,
  Building2,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Trophy,
  ExternalLink,
  Plus,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { essApi } from "@/lib/api";

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
  userReactions: string[];
  shares?: number;
  // Facebook-Style Shared Post Attributes
  isShared?: boolean;
  sharedBy?: string;
  sharedByRole?: string;
  sharedByInitials?: string;
  sharedComment?: string;
  originalPost?: {
    id: string;
    senderName: string;
    senderRole: string;
    senderInitials: string;
    recipientName: string;
    recipientRole: string;
    recipientInitials: string;
    coreValue: string;
    message: string;
    timestamp: string;
  };
}

export const COLLEAGUES = [
  { name: "Maria Santos", role: "Guest Relations Officer · Front Office", initials: "MS" },
  { name: "Kevin Dela Cruz", role: "Kitchen Line Staff · F&B", initials: "KD" },
  { name: "Chef Marco Rossi", role: "Executive Chef · F&B", initials: "MR" },
  { name: "Ricardo Gomez", role: "Senior Room Attendant · Housekeeping", initials: "RG" },
  { name: "Elena Torres", role: "Housekeeping Supervisor · Housekeeping", initials: "ET" },
  { name: "Paolo Cruz", role: "Payroll Officer · HR", initials: "PC" },
  { name: "Chef Marco D. Santos", role: "Executive Sous Chef · Kitchen", initials: "MS" },
  { name: "Anna Bautista", role: "Front Desk Agent · Front Office", initials: "AB" },
];

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
    shares: 6,
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
    shares: 11,
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
    shares: 4,
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
    shares: 3,
  },
];

const STORAGE_KEY = "oxford_social_recognitions";

export function EssRecognitionTab() {
  const user = getUser();
  const currentUserName = user?.full_name || myProfile.name;
  const currentUserRole = (user as any)?.position || myProfile.position || "Oxford Staff";

  const currentUserInitials = useMemo(() => {
    const parts = currentUserName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return currentUserName.slice(0, 2).toUpperCase() || "KD";
  }, [currentUserName]);

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

  const [activeFilter, setActiveFilter] = useState<"all" | "received">("all");
  const [selectedValueFilter, setSelectedValueFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Facebook-Style Create Post Modal State
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(COLLEAGUES[0].name);
  const [selectedCoreValue, setSelectedCoreValue] = useState<RecognitionPost["coreValue"]>("Guest Delight");
  const [praiseMessage, setPraiseMessage] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Facebook-Style Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState<RecognitionPost | null>(null);
  const [shareComment, setShareComment] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedValueFilter, searchTerm]);

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
            userReactions: (r as any).userReactions || [],
            shares: 4,
          }));
          setPosts(apiMapped);
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

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  // Personal Stats
  const myReceivedCount = posts.filter((p) =>
    p.recipientName.toLowerCase().includes(currentUserName.toLowerCase())
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

  // Facebook-Style Create Post Handler
  const handleCreatePost = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!praiseMessage.trim()) {
      toast.error("Please enter a praise message!");
      return;
    }
    setIsSubmittingPost(true);
    const recipient = COLLEAGUES.find((c) => c.name === selectedRecipient) || {
      name: selectedRecipient,
      role: "Oxford Suites Staff",
      initials: selectedRecipient.slice(0, 2).toUpperCase(),
    };

    const newPost: RecognitionPost = {
      id: `rec-${Date.now()}`,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderInitials: currentUserInitials,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      recipientInitials: recipient.initials,
      coreValue: selectedCoreValue,
      message: praiseMessage.trim(),
      timestamp: "Just now",
      isoDate: new Date().toISOString(),
      reactions: { clap: 1, heart: 0, star: 0, fire: 0 },
      userReactions: ["clap"],
      shares: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
    setPraiseMessage("");
    setIsSubmittingPost(false);
    setCreatePostOpen(false);
    toast.success(`Recognition posted for ${recipient.name}! 🎉`);
  };

  // Facebook-Style Share Modal Handlers
  const handleOpenShareModal = (post: RecognitionPost) => {
    const targetPost = post.originalPost
      ? {
          ...post,
          id: post.originalPost.id,
          senderName: post.originalPost.senderName,
          senderRole: post.originalPost.senderRole,
          senderInitials: post.originalPost.senderInitials,
          recipientName: post.originalPost.recipientName,
          recipientRole: post.originalPost.recipientRole,
          recipientInitials: post.originalPost.recipientInitials,
          coreValue: post.originalPost.coreValue as RecognitionPost["coreValue"],
          message: post.originalPost.message,
          timestamp: post.originalPost.timestamp,
        }
      : post;

    setSelectedSharePost(targetPost);
    setCopiedLink(false);
    setCopiedQuote(false);
    setShareComment("");
    setShareModalOpen(true);
  };

  const handleCopyLink = () => {
    if (!selectedSharePost) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const url = `${origin}${pathname}?category=Recognition&post=${selectedSharePost.id}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        toast.success("Recognition link copied to clipboard! 📋");
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(() => {
        toast.info(`Recognition URL: ${url}`);
      });
    } else {
      toast.info(`Recognition URL: ${url}`);
    }
  };

  const handleCopyQuote = () => {
    if (!selectedSharePost) return;
    const citation = `⭐ [${selectedSharePost.coreValue}] ${selectedSharePost.recipientName} recognized by ${selectedSharePost.senderName}: "${selectedSharePost.message}" — Oxford Suites Wall of Fame`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(citation).then(() => {
        setCopiedQuote(true);
        toast.success("Praise citation copied! Ready to paste into Slack or Teams. 💬");
        setTimeout(() => setCopiedQuote(false), 2000);
      }).catch(() => {
        toast.info(citation);
      });
    } else {
      toast.info(citation);
    }
  };

  const handleShareToFeed = () => {
    if (!selectedSharePost) return;
    setIsSharing(true);

    const sharedPost: RecognitionPost = {
      id: `share-${Date.now()}`,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderInitials: currentUserInitials,
      recipientName: selectedSharePost.recipientName,
      recipientRole: selectedSharePost.recipientRole,
      recipientInitials: selectedSharePost.recipientInitials,
      coreValue: selectedSharePost.coreValue,
      message: shareComment.trim() || `Shared ${selectedSharePost.recipientName}'s recognition`,
      timestamp: "Just now",
      isoDate: new Date().toISOString(),
      reactions: { clap: 1, heart: 1, star: 0, fire: 0 },
      userReactions: ["clap"],
      shares: 0,
      isShared: true,
      sharedBy: currentUserName,
      sharedByRole: currentUserRole,
      sharedByInitials: currentUserInitials,
      sharedComment: shareComment.trim(),
      originalPost: {
        id: selectedSharePost.id,
        senderName: selectedSharePost.senderName,
        senderRole: selectedSharePost.senderRole,
        senderInitials: selectedSharePost.senderInitials,
        recipientName: selectedSharePost.recipientName,
        recipientRole: selectedSharePost.recipientRole,
        recipientInitials: selectedSharePost.recipientInitials,
        coreValue: selectedSharePost.coreValue,
        message: selectedSharePost.message,
        timestamp: selectedSharePost.timestamp,
      },
    };

    setPosts((prev) => [
      sharedPost,
      ...prev.map((p) =>
        p.id === selectedSharePost.id ? { ...p, shares: (p.shares || 0) + 1 } : p
      ),
    ]);

    setIsSharing(false);
    setShareModalOpen(false);
    setShareComment("");
    toast.success("Recognition shared to Wall of Fame feed! 🚀");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
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
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">HR3 Commendations</p>
              <p className="mt-1 text-3xl font-bold font-display text-primary">
                {posts.length} <span className="text-xs font-normal text-muted-foreground">published</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Governed by Team 3 (HR3)</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20">
              <ShieldCheck className="h-6 w-6" />
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
              <p className="text-xs text-muted-foreground mt-0.5">Hotel hospitality standards</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Recognition Social Feed (Facebook Style) */}
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Facebook-style "Create Post" Composer Box */}
        <Card className="border-border/70 shadow-xs bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border/80 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {currentUserInitials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setCreatePostOpen(true)}
                className="flex-1 text-left bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs sm:text-sm px-4 py-2.5 rounded-full border border-border/70 transition-all cursor-pointer shadow-2xs"
              >
                Recognize a colleague or share praise with Oxford Suites...
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setCreatePostOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Give Kudos</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatePostOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                <Star className="h-4 w-4 text-primary" />
                <span>Core Values</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatePostOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Peer Shoutout</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Wall of Fame Feed Card */}
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

              {/* Action Buttons & Scope Filter Pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      activeFilter === "received"
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    My Received ({myReceivedCount})
                  </button>
                </div>

                <Button
                  size="sm"
                  onClick={() => setCreatePostOpen(true)}
                  className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold shadow-2xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Recognize</span>
                </Button>
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
              <>
                <ScrollArea className="max-h-[500px] sm:max-h-[540px] pr-3" type="always">
                  <div className="space-y-3.5 pb-2 pr-1">
                    {paginatedPosts.map((post) => {
                    const coreValueMeta = CORE_VALUES.find((v) => v.id === post.coreValue) || CORE_VALUES[0];
                    const Icon = coreValueMeta.icon;

                    return (
                      <div
                        key={post.id}
                        className="rounded-xl border border-border/70 p-4 space-y-3 bg-card hover:border-primary/40 transition-all shadow-2xs"
                      >
                        {/* Facebook-Style Shared Post vs Standard Post Header */}
                        {post.isShared && post.originalPost ? (
                          <div className="space-y-3">
                            {/* Shared Header Banner */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1 border-b border-border/40">
                              <Share2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-6 w-6 border border-border/80 bg-primary/10">
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                    {post.sharedByInitials || "OS"}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="truncate">
                                  <span className="font-bold text-foreground">{post.sharedBy}</span> shared a recognition
                                </p>
                                <span className="text-[10px] text-muted-foreground">· {post.timestamp}</span>
                              </div>
                            </div>

                            {/* User Commentary */}
                            {post.sharedComment && (
                              <p className="text-xs sm:text-sm text-foreground font-medium px-1">
                                {post.sharedComment}
                              </p>
                            )}

                            {/* Embedded Quoted Post Card */}
                            <div className="rounded-xl border border-border/70 p-3.5 space-y-2.5 bg-muted/20">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative flex items-center">
                                    <Avatar className="h-8 w-8 border border-border/80 bg-muted">
                                      <AvatarFallback className="bg-muted text-foreground font-semibold text-[10px]">
                                        {post.originalPost.senderInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="mx-1 text-xs text-primary font-bold">→</span>
                                    <Avatar className="h-8 w-8 border border-primary/40 ring-1 ring-primary/20 bg-primary/10">
                                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                        {post.originalPost.recipientInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-foreground">
                                      <span className="font-bold">{post.originalPost.senderName}</span> recognized{" "}
                                      <span className="font-bold text-primary">{post.originalPost.recipientName}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {post.originalPost.recipientRole} · {post.originalPost.timestamp}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-semibold shrink-0">
                                  {post.originalPost.coreValue}
                                </Badge>
                              </div>

                              <div className="rounded-lg bg-background/80 border border-border/50 p-3 text-xs text-foreground italic leading-relaxed">
                                "{post.originalPost.message}"
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Standard Post Sender & Recipient Header */}
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
                          </>
                        )}

                        {/* Action Bar: Reactions & Facebook-style Share */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleReaction(post.id, "clap")}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
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
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                post.userReactions.includes("fire")
                                  ? "bg-primary/15 border-primary/50 text-primary shadow-2xs"
                                  : "bg-background border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              }`}
                            >
                              <span>🔥</span>
                              <span>{post.reactions.fire}</span>
                            </button>
                          </div>

                          {/* Facebook-Style Share Action Pill */}
                          <button
                            type="button"
                            onClick={() => handleOpenShareModal(post)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/40 hover:bg-muted hover:text-foreground border border-border/70 hover:border-primary/40 transition-all cursor-pointer active:scale-95"
                            title="Share this recognition post"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="font-semibold">Share</span>
                            {(post.shares ?? 0) > 0 && (
                              <span className="text-[11px] text-muted-foreground font-mono font-medium">({post.shares})</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </ScrollArea>

                {/* Pagination Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/70 mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-foreground">
                        {Math.min(currentPage * pageSize, filteredPosts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {filteredPosts.length}
                      </span>{" "}
                      recognitions
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-xs border-border/70 hover:border-primary hover:text-primary disabled:opacity-40"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        title="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs font-semibold ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90"
                              : "border-border/70 hover:border-primary hover:text-primary"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-xs border-border/70 hover:border-primary hover:text-primary disabled:opacity-40"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        title="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[95px] text-xs border-border/70 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3" className="text-xs">3 / page</SelectItem>
                        <SelectItem value="5" className="text-xs">5 / page</SelectItem>
                        <SelectItem value="10" className="text-xs">10 / page</SelectItem>
                        <SelectItem value="20" className="text-xs">20 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facebook-Style Create Recognition Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="max-w-lg p-6 bg-card border-border/80">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Recognition Post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Public praise published live to Oxford Suites Wall of Fame.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="space-y-4 pt-1">
            {/* User identity & Audience (Facebook style) */}
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 border border-border/80 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {currentUserInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-bold text-foreground">{currentUserName}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60 w-fit mt-0.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span>Public · Oxford Suites Feed</span>
                </div>
              </div>
            </div>

            {/* Recipient Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Who are you recognizing?</Label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger className="h-9 text-xs focus:border-primary">
                  <SelectValue placeholder="Select a colleague..." />
                </SelectTrigger>
                <SelectContent>
                  {COLLEAGUES.map((c) => (
                    <SelectItem key={c.name} value={c.name} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground">({c.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Core Value Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Service Pillar / Core Value</Label>
              <Select
                value={selectedCoreValue}
                onValueChange={(val) => setSelectedCoreValue(val as RecognitionPost["coreValue"])}
              >
                <SelectTrigger className="h-9 text-xs focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORE_VALUES.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id} className="text-xs">
                      {cv.label} — {cv.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Praise message */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Recognition Message</Label>
              <Textarea
                rows={4}
                required
                placeholder="Describe what your colleague did and why it embodies Oxford Suites hospitality standards..."
                value={praiseMessage}
                onChange={(e) => setPraiseMessage(e.target.value)}
                className="text-xs focus:border-primary resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreatePostOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingPost || !praiseMessage.trim()}
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmittingPost ? "Posting..." : "Post to Wall of Fame"}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Facebook-Style Share Dialog */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-lg p-6 bg-card border-border/80">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
              <Share2 className="h-5 w-5 text-primary" />
              Share Post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share this recognition to your Wall of Fame feed or copy citation.
            </DialogDescription>
          </DialogHeader>

          {selectedSharePost && (
            <div className="space-y-4 pt-1">
              {/* User Profile & Audience badge */}
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 border border-border/80 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {currentUserInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-foreground">{currentUserName}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60 w-fit mt-0.5">
                    <Globe className="h-3 w-3 text-primary" />
                    <span>Public · Wall of Fame Feed</span>
                  </div>
                </div>
              </div>

              {/* Share caption textarea */}
              <div className="space-y-1.5">
                <Textarea
                  rows={2}
                  placeholder="Say something about this recognition (optional)..."
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  className="text-xs focus:border-primary resize-none"
                />
              </div>

              {/* Facebook-Style Embedded Quoted Post Preview */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center">
                      <Avatar className="h-7 w-7 border border-border/80 bg-muted">
                        <AvatarFallback className="bg-muted text-foreground font-semibold text-[10px]">
                          {selectedSharePost.senderInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="mx-1 text-[10px] text-primary font-bold">→</span>
                      <Avatar className="h-7 w-7 border border-primary/40 ring-1 ring-primary/20 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                          {selectedSharePost.recipientInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {selectedSharePost.senderName} recognized {selectedSharePost.recipientName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedSharePost.recipientRole} · {selectedSharePost.timestamp}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-medium shrink-0">
                    {selectedSharePost.coreValue}
                  </Badge>
                </div>
                <div className="rounded-lg bg-background/80 p-2.5 text-xs text-foreground italic border border-border/50">
                  "{selectedSharePost.message}"
                </div>
              </div>

              {/* Quick Actions & Share Now */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-7 px-2.5 text-xs border-border/80 hover:border-primary gap-1 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[11px]">Copy Link</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyQuote}
                    className="h-7 px-2.5 text-xs border-border/80 hover:border-primary gap-1 cursor-pointer"
                  >
                    {copiedQuote ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium text-[11px]">Copied Citation</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-[11px]">Copy Citation</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShareModalOpen(false)}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleShareToFeed}
                    disabled={isSharing}
                    className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{isSharing ? "Sharing..." : "Share Now"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
