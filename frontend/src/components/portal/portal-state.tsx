import { useEffect, useState } from "react";
import { announcementsApi } from "@/lib/api";

export type Audience = "All" | "Employee" | "Admin" | "Super Admin";

export const audienceOptions: { value: Audience; label: string }[] = [
  { value: "All", label: "All audiences" },
  { value: "Employee", label: "Employees" },
  { value: "Admin", label: "Admins" },
  { value: "Super Admin", label: "Super Admins" },
];

/** Whether a portal role should see an announcement with this audience. */
export function isVisibleTo(audience: Audience, role: "superadmin" | "admin" | "employee") {
  if (audience === "All") return true;
  if (audience === "Employee") return role === "employee";
  if (audience === "Admin") return role === "admin";
  return role === "superadmin";
}

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  author: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  tone: "info" | "success" | "warning";
};

type State = {
  announcements: Announcement[];
  notifications: Notification[];
  loading: boolean;
};

const seedNotifications: Notification[] = [
  {
    id: "NTF-005",
    title: "3 new applicants for Front Desk Receptionist",
    detail: "Resume screening finished — 2 ranked as Perfect for the job.",
    time: "8 min ago",
    read: false,
    tone: "info",
  },
  {
    id: "NTF-004",
    title: "Leave request awaiting approval",
    detail: "Rosa Aquino filed a 2-day vacation leave starting Aug 6.",
    time: "1 hr ago",
    read: false,
    tone: "warning",
  },
  {
    id: "NTF-003",
    title: "Onboarding checklist completed",
    detail: "Kevin Dela Cruz finished all pre-onboarding requirements.",
    time: "3 hrs ago",
    read: false,
    tone: "success",
  },
  {
    id: "NTF-002",
    title: "Job post published",
    detail: "'Line Cook' is now live on Indeed and Facebook.",
    time: "Yesterday",
    read: true,
    tone: "info",
  },
  {
    id: "NTF-001",
    title: "Account suspended",
    detail: "mdevera was suspended after 3 failed login attempts.",
    time: "2 days ago",
    read: true,
    tone: "warning",
  },
];

let state: State = {
  announcements: [],
  notifications: seedNotifications,
  loading: true,
};
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

let loaded = false;

async function loadAnnouncements() {
  try {
    const res = await announcementsApi.list();
    set({
      announcements: (res.data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        audience: a.audience as Audience,
        author: a.author ?? "System",
        createdAt: a.created_at ?? a.published_date ?? "",
      })),
      loading: false,
    });
  } catch {
    set({ loading: false });
  }
}

function ensureLoaded() {
  if (!loaded) {
    loaded = true;
    loadAnnouncements();
  }
}

export function usePortalState() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    ensureLoaded();
    const listener = () => setSnapshot(state);
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    announcements: snapshot.announcements,
    notifications: snapshot.notifications,
    loading: snapshot.loading,
    unreadCount: snapshot.notifications.filter((n) => !n.read).length,
    markAllRead: () =>
      set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }),
    markRead: (id: string) =>
      set({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }),
    addAnnouncement: async (input: {
      title: string;
      body: string;
      audience: Announcement["audience"];
      author: string;
    }) => {
      const res = await announcementsApi.create({
        title: input.title,
        body: input.body,
        audience: input.audience,
      });
      set({
        announcements: [
          {
            id: res.data.id,
            title: res.data.title,
            body: res.data.body,
            audience: res.data.audience as Audience,
            author: res.data.author ?? input.author,
            createdAt: res.data.created_at ?? new Date().toISOString(),
          },
          ...state.announcements,
        ],
        notifications: [
          {
            id: `NTF-${Date.now()}`,
            title: `New announcement: ${input.title}`,
            detail: `Posted to ${input.audience} by ${input.author}.`,
            time: "Just now",
            read: false,
            tone: "info",
          },
          ...state.notifications,
        ],
      });
    },
    removeAnnouncement: async (id: string) => {
      await announcementsApi.remove(id);
      set({ announcements: state.announcements.filter((a) => a.id !== id) });
    },
    refreshAnnouncements: loadAnnouncements,
  };
}