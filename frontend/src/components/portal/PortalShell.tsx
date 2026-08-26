import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Plus,
  Trash2,
  BellOff,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Megaphone,
  Menu,
  PanelLeftClose,
  Settings as SettingsIcon,
  UserCircle,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { AnnouncementDialog } from "@/components/portal/AnnouncementDialog";
import { isVisibleTo, usePortalState } from "@/components/portal/portal-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { navForRole, roleMeta, type Role } from "@/lib/nav";
import { authApi } from "@/lib/api";
import { clearSession, getUser } from "@/lib/auth";

export function PortalShell({ role, children }: { role: Role; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const meta = roleMeta[role];
  const user = getUser();
  const displayName = user?.full_name || meta.user;
  const nav = navForRole(role);
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const searchStr = location.searchStr || "";
  const [expanded, setExpanded] = useState<string[]>(() =>
    nav.filter((i) => i.children?.length).map((i) => i.label),
  );
  const [announceOpen, setAnnounceOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // token already invalid — still clear the local session
    }
    clearSession();
    navigate({ to: "/login" });
  };
  const { notifications, unreadCount, markAllRead, markRead, announcements, removeAnnouncement } =
    usePortalState();
  const visibleAnnouncements = announcements.filter((a) => isVisibleTo(a.audience, role));
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

  // Auto-expand the group that contains the active route.
  useEffect(() => {
    const owner = nav.find((i) =>
      i.children?.some((c) => {
        const [cPath] = (c.to ?? "").split("?");
        return cPath ? pathname === cPath || pathname.startsWith(cPath) : false;
      }),
    );
    if (owner) setExpanded((prev) => (prev.includes(owner.label) ? prev : [...prev, owner.label]));
  }, [pathname, nav]);

  return (
    <div className="flex min-h-screen w-full bg-background">
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
            {nav.map((item) => {
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
                      title={item.label}
                      aria-expanded={isOpen}
                      onClick={() => {
                        if (!open) setOpen(true);
                        setExpanded((prev) =>
                          prev.includes(item.label)
                            ? prev.filter((l) => l !== item.label)
                            : [...prev, item.label],
                        );
                      }}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && (
                        <>
                          <span className="truncate">{item.label}</span>
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
                    <Link to={item.to} className={baseCls} title={item.label}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span className="truncate">{item.label}</span>}
                    </Link>
                  )}

                  {open && hasChildren && isOpen && (
                    <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                      {item.children!.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={cn(
                            "block rounded-md px-3 py-2 text-[0.8rem] transition-colors",
                            isChildActive(child.to)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
            title="My Profile"
          >
            <UserCircle className="h-4 w-4 shrink-0" />
            {open && <span>My Profile</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/85 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {open ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="md:hidden">
              <Logo variant="mark" mark="white" tone="invert" />
            </div>
            <div className="hidden sm:block">
              <p className="eyebrow">Oxford Suites Makati HRMS</p>
              <p className="text-sm font-medium">{meta.label} Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Announcements" className="relative">
                  <Megaphone className="h-5 w-5" />
                  {visibleAnnouncements.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-primary-foreground">
                      {visibleAnnouncements.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[22rem] p-0">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <p className="font-display text-lg font-semibold">Announcements</p>
                  {canAnnounce && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8 text-primary"
                      aria-label="New announcement"
                      title="New announcement"
                      onClick={() => setAnnounceOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <ScrollArea className="max-h-80">
                  <div className="divide-y divide-border">
                    {visibleAnnouncements.length === 0 && (
                      <p className="p-8 text-center text-sm text-muted-foreground">
                        No announcements yet.
                      </p>
                    )}
                    {visibleAnnouncements.map((a) => (
                      <div key={a.id} className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 text-sm font-medium">{a.title}</p>
                          <Badge variant="outline" className="ml-auto shrink-0 text-[0.6rem]">
                            {a.audience}
                          </Badge>
                          {role === "superadmin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 text-muted-foreground"
                              aria-label={`Remove announcement ${a.title}`}
                              onClick={() => removeAnnouncement(a.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          {a.author} · {a.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[22rem] p-0">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <p className="font-display text-lg font-semibold">Notifications</p>
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
                      aria-label="Mark all as read"
                      title="Mark all as read"
                      onClick={markAllRead}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    {canAnnounce && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        aria-label="Add announcement"
                        title="Add announcement"
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
                        <BellOff className="h-4 w-4" /> No notifications
                      </p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
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
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{n.title}</span>
                          <span className="block text-xs text-muted-foreground">{n.detail}</span>
                          <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                            {n.time}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-[0.7rem] text-primary-foreground">
                      {meta.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">
                    Welcome, <span className="font-medium">{meta.user.split(" ")[0]}</span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs font-normal text-muted-foreground">{meta.label}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`${meta.base}/profile` as "/admin/profile"}>
                    <UserCircle className="mr-2 h-4 w-4" /> View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${meta.base}/settings` as "/admin/settings"}>
                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-primary">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                isActive(item.to)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <AnnouncementDialog open={announceOpen} onOpenChange={setAnnounceOpen} author={meta.user} />
    </div>
  );
}
