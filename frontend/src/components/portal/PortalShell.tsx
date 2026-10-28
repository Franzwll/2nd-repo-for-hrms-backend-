import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {

  Bell,

  Plus,

  Trash2,

  BellOff,

  CheckCheck,

  ChevronDown,

  ChevronRight,

  Clock3,

  LogOut,

  Megaphone,

  Menu,

  Moon,

  PanelLeftClose,

  Settings as SettingsIcon,

  Sun,

  UserCircle,

} from "lucide-react";



import { Logo } from "@/components/brand/Logo";

import { AnnouncementDialog } from "@/components/portal/AnnouncementDialog";

import { AiConciergeWidget } from "@/components/portal/AiConciergeWidget";

import { GlobalSearch } from "@/components/portal/GlobalSearch";

import { useSessionTimeout } from "@/hooks/useSessionTimeout";

import { isVisibleTo, usePortalState } from "@/components/portal/portal-state";

import { AnnouncementsModal } from "@/components/portal/AnnouncementsModal";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getStoredPresetAvatar } from "@/lib/profile-avatar";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuLabel,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ScrollArea } from "@/components/ui/scroll-area";

import {

  Sheet,

  SheetContent,

  SheetDescription,

  SheetHeader,

  SheetTitle,

} from "@/components/ui/sheet";

import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";

import { navForRole, roleMeta, type Role } from "@/lib/nav";

import { authApi } from "@/lib/api";

import { clearSession, getUser } from "@/lib/auth";

import { usePreferences } from "@/lib/preferences";

import { applyInitialTheme, applyTheme, type ThemeChoice } from "@/lib/theme";

import type { Notification } from "@/components/portal/portal-state";



/** Map a notification's target to an in-app route for the current role. */

function notificationTarget(

  n: Pick<Notification, "targetType" | "targetId" | "title" | "detail">,

  role: Role,

): string | null {

  const rawType = (n.targetType ?? "").toLowerCase();

  const targetId = n.targetId ?? null;

  const base = roleMeta[role].base;

  const text = `${n.title ?? ""} ${n.detail ?? ""}`.toLowerCase();

  const hl = targetId ? `?highlight=${encodeURIComponent(targetId)}` : "";



  const applicantRoute = `${base}/applicants${hl ? `${hl}&tab=ranking` : ""}`;

  const interviewRoute = `${base}/applicants${hl ? `${hl}&tab=scheduling` : "?tab=scheduling"}`;



  // Hiring notifications created via NotificationService (Applicant / Interview /

  // Assessment / Practical / Final Evaluation). All land on Applicant Management;

  // interviews also hint the interview tab via query params.

  if (

    rawType === "applicant" ||

    rawType === "applicants" ||

    rawType === "assessment" ||

    rawType === "assessment test" ||

    rawType === "assessment_test" ||

    rawType === "practical test" ||

    rawType === "practical_test" ||

    rawType === "final evaluation" ||

    rawType === "final_evaluation" ||

    text.includes("applicant") ||

    text.includes("interview") ||

    text.includes("assessment") ||

    text.includes("final evaluation")

  ) {

    if (role === "employee") return null;

    if (rawType === "interview" || rawType === "interviews" || text.includes("interview")) {

      return interviewRoute;

    }

    return applicantRoute;

  }



  switch (rawType) {

    case "interview":

    case "interviews":

      return role === "employee" ? null : interviewRoute;

    case "announcement":

    case "announcements":

      // Announcements open in the modal via the detail popup (View announcement).

      return "announcement-modal";

    case "employee":

    case "employees":

      return role === "employee" ? null : `${base}/employees${hl}`;

    case "department":

    case "departments":

    case "position":

    case "positions":

    case "salary-grade":

    case "salary grade":

    case "salary_grades":

      return role === "employee" ? null : `${base}/dept-pos${hl}`;

    case "user":

    case "system_users":

    case "system user":

      return role === "superadmin" ? `${base}/users` : role === "employee" ? `${base}/profile` : `${base}/settings`;

    case "role":

    case "system_roles":

      return `${base}/settings`;

    case "hr3_recommendation":

    case "hr3 recommendation":

      return role === "employee" ? `${base}/ess` : `${base}/my-ess?category=Performance`;

    case "faq":

    case "chatbot_faqs":

    case "chatbot faq":

      return role === "employee" ? null : `${base}/settings`;

    default:

      return null;

  }

}



function getInitials(name: string) {

  return name

    .split(" ")

    .filter(Boolean)

    .slice(0, 2)

    .map((p) => p[0]?.toUpperCase() ?? "")

    .join("");

}



export function PortalShell({ role, children }: { role: Role; children: ReactNode }) {

  const [open, setOpen] = useState(true);

  /** Off-canvas drawer used below the `md` breakpoint, where the <aside> sidebar is hidden. */

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const [mounted, setMounted] = useState(false);



  const [authName, setAuthName] = useState<string | null>(null);



  const [authDept, setAuthDept] = useState<string | null>(null);
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);

  const [time, setTime] = useState<Date | null>(null);

  useSessionTimeout();

  const { t, formatTime, formatWeekdayDate } = usePreferences();



  useEffect(() => {

    setMounted(true);



    try {

      const u = getUser();

      if (u?.full_name) setAuthName(u.full_name);

      if (u?.department_name) setAuthDept(u.department_name);

      setHeaderAvatar(u?.profile_photo_url || getStoredPresetAvatar(u?.email));

    } catch {}

    applyInitialTheme();

    setTime(new Date());

    const timer = setInterval(() => setTime(new Date()), 1000);

    const refreshAvatar = () => {
      try {
        const current = getUser();
        setHeaderAvatar(current?.profile_photo_url || getStoredPresetAvatar(current?.email));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("hrms-avatar-changed", refreshAvatar);
    window.addEventListener("storage", refreshAvatar);

    return () => {
      clearInterval(timer);
      window.removeEventListener("hrms-avatar-changed", refreshAvatar);
      window.removeEventListener("storage", refreshAvatar);
    };

  }, []);



  const timeString = mounted && time

    ? formatTime(time, true)

    : "--:--:--";



  const dateString = mounted && time

    ? formatWeekdayDate(time)

    : "Loading...";



  const navigate = useNavigate();

  const meta = roleMeta[role];

  const displayName = mounted && authName ? authName : meta.user;



  const displayDept = mounted && authDept ? authDept : meta.label;

  const nav = useMemo(() => navForRole(role), [role]);

  const location = useRouterState({ select: (s) => s.location });

  const pathname = location.pathname;

  const searchStr = location.searchStr || "";

  const [expanded, setExpanded] = useState<string[]>(() =>

    nav.filter((i) => i.children?.length).map((i) => i.label),

  );

  const [announceOpen, setAnnounceOpen] = useState(false);

  const [announcementViewId, setAnnouncementViewId] = useState<string | null>(null);

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  const lastActiveGroupRef = useRef<string | null>(null);



  const handleLogout = async () => {

    try {

      await authApi.logout();

    } catch {

      // token already invalid â€” still clear the local session

    }

    clearSession();

    navigate({ to: "/login" });

  };



  // Theme toggle for the Welcome dropdown â€” mirrors the Settings â†’ Preferences theme.

  const [isDark, setIsDark] = useState(

    () =>

      typeof document !== "undefined" &&

      document.documentElement.classList.contains("dark"),

  );



  // Keep the toggle in sync if the theme is changed elsewhere (e.g. Settings page).

  useEffect(() => {

    if (typeof document === "undefined") return;

    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {

      setIsDark(document.documentElement.classList.contains("dark"));

    });

    observer.observe(document.documentElement, {

      attributes: true,

      attributeFilter: ["class"],

    });

    return () => observer.disconnect();

  }, []);



  const toggleTheme = () => {

    const next: ThemeChoice = isDark ? "Light" : "Dark";

    applyTheme(next);

    setIsDark(next === "Dark");

  };

  const {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    announcements,
    removeAnnouncement,
    readAnnouncementIds,
    markAnnouncementRead,
    markAnnouncementsRead,
  } = usePortalState();

  const visibleAnnouncements = announcements.filter((a) => isVisibleTo(a.audience, role));

  const unreadAnnouncements = visibleAnnouncements.filter(
    (a) => !readAnnouncementIds.has(String(a.id)),
  );

  const canAnnounce = role === "superadmin";



  const isActive = (to: string) => (to === meta.base ? pathname === to : pathname.startsWith(to));



  const isChildActive = (childTo: string) => {

    const [childPath, childQuery] = childTo.split("?");

    if (pathname !== childPath) return false;

    if (!childQuery) {

      return !searchStr || searchStr === "?" || !searchStr.includes("category=");

    }

    return searchStr.includes(childQuery);

  };



  // Auto-expand the group that contains the active route, but respect manual collapse.

  // Previously `nav` was recreated every render, so the effect fired on every render

  // and immediately re-added the active group after the user collapsed it.

  // Now `nav` is memoized and we only auto-expand when the active *group* changes,

  // so closing "Recruitment & Onboarding" while on "/superadmin/onboarding" stays closed.

  useEffect(() => {

    const owner = nav.find((i) =>

      i.children?.some((c) => {

        const [cPath] = (c.to ?? "").split("?");

        return cPath ? pathname === cPath || pathname.startsWith(cPath) : false;

      }),

    );

    const ownerLabel = owner?.label ?? null;

    if (ownerLabel && lastActiveGroupRef.current !== ownerLabel) {

      setExpanded((prev) => (prev.includes(ownerLabel) ? prev : [...prev, ownerLabel]));

    }

    lastActiveGroupRef.current = ownerLabel;

  }, [pathname, nav]);



  // Dismiss the mobile drawer whenever navigation happens, so tapping a link in it

  // reveals the destination page instead of leaving the menu covering it.

  useEffect(() => {

    setMobileNavOpen(false);

  }, [pathname, searchStr]);



  /** Shared nav tree for both the desktop sidebar and the mobile drawer. */

  const renderNavItems = ({

    showLabels,

    onNavigate,

  }: {

    showLabels: boolean;

    onNavigate?: () => void;

  }) =>

    nav.map((item) => {

      const hasChildren = !!item.children?.length;

      const groupActive = hasChildren

        ? item.children!.some((c) => {

            const [cPath] = (c.to ?? "").split("?");

            return cPath ? pathname === cPath || pathname.startsWith(cPath) : false;

          })

        : isActive(item.to);

      const isOpen = expanded.includes(item.label);



      const baseCls = cn(

        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",

        groupActive

          ? "bg-sidebar-primary text-sidebar-primary-foreground"

          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",

      );



      return (

        <div key={item.label}>

          {hasChildren ? (

            <button

              type="button"

              className={baseCls}

              title={t(item.label)}

              aria-expanded={isOpen}

              onClick={() => {

                if (!showLabels) setOpen(true);

                setExpanded((prev) =>

                  prev.includes(item.label)

                    ? prev.filter((l) => l !== item.label)

                    : [...prev, item.label],

                );

              }}

            >

              <item.icon className="h-4 w-4 shrink-0" />

              {showLabels && (

                <>

                  <span className="truncate">{t(item.label)}</span>

                  <ChevronRight

                    className={cn(

                      "ml-auto h-4 w-4 shrink-0 transition-transform",

                      isOpen && "rotate-90",

                    )}

                  />

                </>

              )}

            </button>

          ) : (

            <Link to={item.to} className={baseCls} title={t(item.label)} onClick={onNavigate}>

              <item.icon className="h-4 w-4 shrink-0" />

              {showLabels && <span className="truncate">{t(item.label)}</span>}

            </Link>

          )}



          {showLabels && hasChildren && isOpen && (

            <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">

              {item.children!.map((child) => {

                // Child targets may carry a query string (e.g.
                // `/employee/ess?category=Payroll`). Split it into `to` +
                // `search` so the link stays a client-side navigation.
                const [childPath, childQuery] = child.to.split("?");

                const childSearch = childQuery
                  ? Object.fromEntries(new URLSearchParams(childQuery))
                  : undefined;

                return (
                  <Link

                    key={child.to}

                    to={childPath as never}

                    search={childSearch as never}

                    onClick={onNavigate}

                    className={cn(

                      "block rounded-md px-3 py-2 text-[0.8rem] transition-colors",

                      isChildActive(child.to)

                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"

                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",

                    )}

                  >

                    {t(child.label)}

                  </Link>
                );
              })}

            </div>

          )}

        </div>

      );

    });



  return (

    <div className="flex min-h-screen w-full overflow-x-clip bg-background">

      <aside

        className={cn(

          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",

          open ? "w-64" : "w-[68px]",

        )}

      >

        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">

          <Logo variant={open ? "full" : "mark"} mark="white" tone="invert" />

        </div>



        <ScrollArea className="flex-1">

          <nav className="space-y-1 p-2">

            {renderNavItems({ showLabels: open })}

          </nav>

        </ScrollArea>



        <div className="space-y-1 border-t border-sidebar-border p-2">

          <Link

            to={`${meta.base}/profile` as "/admin/profile"}

            className={cn(

              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",

              pathname === `${meta.base}/profile`

                ? "bg-sidebar-primary text-sidebar-primary-foreground"

                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",

            )}

            title={t("My Profile")}

          >

            <UserCircle className="h-4 w-4 shrink-0" />

            {open && <span>{t("My Profile")}</span>}

          </Link>

          <button

            type="button"

            onClick={handleLogout}

            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

          >

            <LogOut className="h-4 w-4 shrink-0" />

            {open && <span>{t("Logout")}</span>}

          </button>

        </div>

      </aside>



      {/* Mobile drawer: the full nav tree, including nested groups, My Profile and Logout.

          The <aside> above is `hidden` below `md`, so without this the only mobile

          navigation was a flat chip strip that dropped every nested sub-page. */}

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>

        <SheetContent

          side="left"

          className="flex w-[17rem] max-w-[85vw] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-[17rem]"

        >

          <SheetHeader className="flex h-16 shrink-0 flex-row items-center border-b border-sidebar-border px-4 pr-10">

            <SheetTitle className="sr-only">{meta.label} Portal navigation</SheetTitle>

            <SheetDescription className="sr-only">

              Navigate between modules of the {meta.label} Portal.

            </SheetDescription>

            {/* Mirrors the desktop sidebar header so the drawer reads as the same nav. */}

            <Logo variant="full" mark="white" tone="invert" />

          </SheetHeader>

          <ScrollArea className="flex-1">

            <nav className="space-y-1 p-2">

              {renderNavItems({ showLabels: true, onNavigate: closeMobileNav })}

            </nav>

          </ScrollArea>

          <div className="space-y-1 border-t border-sidebar-border p-2">

            <Link

              to={`${meta.base}/profile` as "/admin/profile"}

              onClick={closeMobileNav}

              className={cn(

                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",

                pathname === `${meta.base}/profile`

                  ? "bg-sidebar-primary text-sidebar-primary-foreground"

                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",

              )}

            >

              <UserCircle className="h-4 w-4 shrink-0" />

              <span>{t("My Profile")}</span>

            </Link>

            <button

              type="button"

              onClick={handleLogout}

              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

            >

              <LogOut className="h-4 w-4 shrink-0" />

              <span>{t("Logout")}</span>

            </button>

          </div>

        </SheetContent>

      </Sheet>



      <div className="flex min-w-0 flex-1 flex-col">

        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-2 border-b border-border bg-card/85 px-3 backdrop-blur sm:gap-4 sm:px-4 md:px-6">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            <Button

              variant="ghost"

              size="icon"

              className="md:hidden"

              onClick={() => setMobileNavOpen(true)}

              aria-label={t("Open navigation menu")}

            >

              <Menu className="h-5 w-5" />

            </Button>

            <Button

              variant="ghost"

              size="icon"

              className="hidden md:inline-flex"

              onClick={() => setOpen((v) => !v)}

              aria-label={t("Toggle sidebar")}

            >

              {open ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

            </Button>

            <div className="shrink-0">

              <p className="text-sm font-medium">{t(`${meta.label} Portal`)}</p>

            </div>

          </div>



          <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">

            <GlobalSearch base={meta.base} />

            {/* Live Digital Clock & Date â€” minimal, no border */}

            <div className="hidden items-center gap-2.5 min-[500px]:flex">

              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">

                <Clock3 className="h-4 w-4 text-primary" />

              </div>

              <div className="flex flex-col items-end leading-none sm:items-start">

                <span

                  className="font-mono text-sm font-semibold tabular-nums tracking-tight"

                  suppressHydrationWarning

                >

                  {timeString}

                </span>

                <span

                  className="text-[10px] font-medium tracking-wider text-muted-foreground sm:text-[11px] mt-1"

                  suppressHydrationWarning

                >

                  {dateString}

                </span>

              </div>

            </div>



            <div className="flex items-center gap-2">

            <Popover>

              <PopoverTrigger asChild>

                <Button variant="ghost" size="icon" aria-label={t("Announcements")} className="relative">

                  <Megaphone className="h-5 w-5" />

                  {unreadAnnouncements.length > 0 && (

                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-primary-foreground">

                      {unreadAnnouncements.length}

                    </span>

                  )}

                </Button>

              </PopoverTrigger>

              <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-[22rem] p-0">

                <div className="flex items-center gap-2 border-b border-border px-4 py-3">

                  <p className="font-display text-lg font-semibold">{t("Announcements")}</p>

                  {unreadAnnouncements.length > 0 && (

                    <Badge variant="outline" className="text-[0.65rem]">

                      {unreadAnnouncements.length} new

                    </Badge>

                  )}

                  <div className="ml-auto flex items-center gap-1">

                    <Button

                      variant="ghost"

                      size="icon"

                      className="h-8 w-8"

                      aria-label={t("Mark all announcements as read")}

                      title={t("Mark all as read")}

                      disabled={unreadAnnouncements.length === 0}

                      onClick={() =>
                        void markAnnouncementsRead(
                          visibleAnnouncements.map((a) => String(a.id)),
                        )
                      }

                    >

                      <CheckCheck className="h-4 w-4" />

                    </Button>

                    {canAnnounce && (

                      <Button

                        variant="ghost"

                        size="icon"

                        className="h-8 w-8 text-primary"

                        aria-label={t("New announcement")}

                        title={t("New announcement")}

                        onClick={() => setAnnounceOpen(true)}

                      >

                        <Plus className="h-4 w-4" />

                      </Button>

                    )}

                  </div>

                </div>

                <ScrollArea className="max-h-80">

                  <div className="divide-y divide-border">

                    {visibleAnnouncements.length === 0 && (

                      <p className="p-8 text-center text-sm text-muted-foreground">

                        {t("No announcements yet.")}

                      </p>

                    )}

                    {visibleAnnouncements.map((a) => (

                      <button

                        key={a.id}

                        type="button"

                        onClick={() => {

                          void markAnnouncementRead(String(a.id));

                          setAnnouncementViewId(String(a.id));

                          setAnnouncementModalOpen(true);

                        }}

                        className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/60 cursor-pointer group"

                      >

                        <div className="flex items-start gap-2">

                          <p className="min-w-0 text-sm font-medium group-hover:text-primary transition-colors">{a.title}</p>

                          <Badge variant="outline" className="ml-auto shrink-0 text-[0.6rem]">

                            {a.audience}

                          </Badge>

                          {role === "superadmin" && (

                            <span

                              role="button"

                              tabIndex={0}

                              aria-label={`Remove announcement ${a.title}`}

                              onClick={(e) => {

                                e.stopPropagation();

                                removeAnnouncement(a.id);

                              }}

                              onKeyDown={(e) => {

                                if (e.key === "Enter" || e.key === " ") {

                                  e.preventDefault();

                                  e.stopPropagation();

                                  removeAnnouncement(a.id);

                                }

                              }}

                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"

                            >

                              <Trash2 className="h-3.5 w-3.5" />

                            </span>

                          )}

                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

                        </div>

                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.body}</p>

                        <p className="mt-1 text-[0.7rem] text-muted-foreground">

                          {a.author} · {a.createdAt}

                        </p>

                      </button>

                    ))}

                  </div>

                </ScrollArea>

              </PopoverContent>

            </Popover>



            <Popover>

              <PopoverTrigger asChild>

                <Button variant="ghost" size="icon" aria-label={t("Notifications")} className="relative">

                  <Bell className="h-5 w-5" />

                  {unreadCount > 0 && (

                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">

                      {unreadCount}

                    </span>

                  )}

                </Button>

              </PopoverTrigger>

              <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-[22rem] p-0">

                <div className="flex items-center gap-2 border-b border-border px-4 py-3">

                  <p className="font-display text-lg font-semibold">{t("Notifications")}</p>

                  {unreadCount > 0 && (

                    <Badge variant="outline" className="text-[0.65rem]">

                      {unreadCount} new

                    </Badge>

                  )}

                  <div className="ml-auto flex items-center gap-1">

                    <Button

                      variant="ghost"

                      size="icon"

                      className="h-8 w-8"

                      aria-label={t("Mark all as read")}

                      title={t("Mark all as read")}

                      onClick={markAllRead}

                    >

                      <CheckCheck className="h-4 w-4" />

                    </Button>

                    {canAnnounce && (

                      <Button

                        variant="ghost"

                        size="icon"

                        className="h-8 w-8 text-primary"

                        aria-label={t("Add announcement")}

                        title={t("Add announcement")}

                        onClick={() => setAnnounceOpen(true)}

                      >

                        <Megaphone className="h-4 w-4" />

                      </Button>

                    )}

                  </div>

                </div>

                <ScrollArea className="max-h-80">

                  <div className="divide-y divide-border">

                    {notifications.length === 0 && (

                      <p className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">

                        <BellOff className="h-4 w-4" /> {t("No notifications")}

                      </p>

                    )}

                    {notifications.map((n) => {

                      const target = notificationTarget(n, role);

                      // A click is a command, not a preview: take the user
                      // straight to the record the notification is about.
                      // Announcements are the one non-route target â€” they open
                      // the modal already focused on that single post.
                      const goToTarget = () => {

                        markRead(n.id);

                        if (!target) return;

                        if (target === "announcement-modal") {

                          if (n.targetId) void markAnnouncementRead(String(n.targetId));

                          setAnnouncementViewId(n.targetId ? String(n.targetId) : null);

                          setAnnouncementModalOpen(true);

                          return;

                        }

                        navigate({ to: target });

                      };

                      return (

                        <button

                          key={n.id}

                          type="button"

                          onClick={goToTarget}

                          aria-label={
                            target
                              ? `${n.title} â€” open where this belongs`
                              : n.title
                          }

                          className={cn(

                            "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",

                            target
                              ? "cursor-pointer hover:bg-muted/60"
                              : "cursor-default",

                            !n.read && "bg-primary/5",

                          )}

                        >

                          <span

                            className={cn(

                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",

                              n.tone === "success"

                                ? "bg-success"

                                : n.tone === "warning"

                                  ? "bg-gold"

                                  : "bg-primary",

                              n.read && "opacity-30",

                            )}

                          />

                          <span className="min-w-0 flex-1">

                            <span className="block text-sm font-medium">{n.title}</span>

                            <span className="block text-xs text-muted-foreground">{n.detail}</span>

                            <span className="mt-1 block text-[0.7rem] text-muted-foreground">

                              {n.time}

                            </span>

                          </span>

                          {target && (

                            <span

                              className="mt-0.5 flex shrink-0 items-center gap-0.5 self-center rounded-full border border-border/70 bg-background/70 px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"

                              aria-hidden="true"

                            >

                              {target === "announcement-modal" ? "Read" : "Go"}

                              <ChevronRight className="h-3 w-3" />

                            </span>

                          )}

                        </button>

                      );

                    })}

                  </div>

                </ScrollArea>

              </PopoverContent>

            </Popover>



            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <button

                  type="button"

                  className="flex min-w-0 items-center gap-1.5 rounded-full sm:gap-2 border border-border bg-background py-1 pl-1 pr-3 transition-colors hover:bg-muted"

                >

                  <Avatar className="h-7 w-7 overflow-hidden">
                    {headerAvatar ? (
                      <AvatarImage
                        src={headerAvatar}
                        alt={displayName}
                        className="bg-gradient-to-br from-primary via-primary to-sidebar"
                      />
                    ) : null}

                    <AvatarFallback

                      suppressHydrationWarning

                      className="bg-primary text-[0.7rem] text-primary-foreground font-semibold"

                    >

                      {getInitials(displayName) || meta.initials}

                    </AvatarFallback>

                  </Avatar>

                  <span suppressHydrationWarning className="hidden truncate text-sm min-[900px]:inline max-w-[130px]">

                    {t("Welcome")}, <span className="font-medium">{displayName.split(" ")[0]}</span>

                  </span>

                  <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground min-[900px]:inline" />

                </button>

              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">

                <DropdownMenuLabel>

                  <p className="text-sm font-medium truncate">{displayName}</p>

                  <p className="text-xs font-normal text-muted-foreground truncate">{displayDept}</p>

                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>

                  <Link to={`${meta.base}/profile` as "/admin/profile"}>

                    <UserCircle className="mr-2 h-4 w-4" /> {t("View Profile")}

                  </Link>

                </DropdownMenuItem>

                <DropdownMenuItem asChild>

                  <Link to={`${meta.base}/settings` as "/admin/settings"}>

                    <SettingsIcon className="mr-2 h-4 w-4" /> {t("Settings")}

                  </Link>

                </DropdownMenuItem>

                <DropdownMenuItem

                  onSelect={(e) => {

                    // Keep the menu open so the user sees the theme change instantly.

                    e.preventDefault();

                    toggleTheme();

                  }}

                  className="flex cursor-pointer items-center gap-2"

                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}

                >

                  {isDark ? (

                    <Moon className="mr-2 h-4 w-4 shrink-0" />

                  ) : (

                    <Sun className="mr-2 h-4 w-4 shrink-0" />

                  )}

                  <span className="flex-1">{t(isDark ? "Dark mode" : "Light mode")}</span>

                  <Switch

                    aria-label={t("Toggle dark mode")}

                    checked={isDark}

                    onCheckedChange={toggleTheme}

                    onClick={(e) => e.stopPropagation()}

                    className="ml-auto"

                  />

                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={handleLogout} className="text-primary">

                  <LogOut className="mr-2 h-4 w-4" /> {t("Logout")}

                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </div>

        </div>

        </header>



        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">

          {children}

        </main>

      </div>



      <AnnouncementDialog open={announceOpen} onOpenChange={setAnnounceOpen} author={meta.user} />



      <AnnouncementsModal

        open={announcementModalOpen}

        onOpenChange={(isOpen) => {

          setAnnouncementModalOpen(isOpen);

          if (!isOpen) setAnnouncementViewId(null);

        }}

        initialSelectedId={announcementViewId}

        role={role}

      />


    </div>

  );

}

