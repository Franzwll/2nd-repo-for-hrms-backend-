import { useEffect, useState } from "react";
import { announcementsApi, notificationsApi, type ApiNotification } from "@/lib/api";

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

const seed: State = {
  announcements: [],
  notifications: [],
  loading: true,
};

function mapNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    detail: n.detail,
    time: n.time,
    read: n.read,
    tone: (n.tone as Notification["tone"]) ?? "info",
  };
}

let state: State = {
  announcements: [],
  notifications: [],
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

async function loadNotifications() {
  try {
    const res = await notificationsApi.list();
    set({ notifications: (res.data ?? []).map(mapNotification) });
  } catch {
    // keep empty list on failure
  }
}

function ensureLoaded() {
  if (!loaded) {
    loaded = true;
    loadAnnouncements();
    loadNotifications();
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
    markAllRead: async () => {
      const next = state.notifications.map((n) => ({ ...n, read: true }));
      set({ notifications: next });
      try {
        await notificationsApi.markAllRead();
      } catch {
        // optimistic update already applied
      }
    },
    markRead: async (id: string) => {
      const next = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      set({ notifications: next });
      try {
        await notificationsApi.markRead(id);
      } catch {
        // optimistic update already applied
      }
    },
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