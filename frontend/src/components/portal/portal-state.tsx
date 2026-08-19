import { useEffect, useState } from "react";

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
};

const seed: State = {
  announcements: [],
  notifications: [],
};

let state: State = seed;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function usePortalState() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
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
    unreadCount: snapshot.notifications.filter((n) => !n.read).length,
    markAllRead: () =>
      set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }),
    markRead: (id: string) =>
      set({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }),
    addAnnouncement: (input: {
      title: string;
      body: string;
      audience: Announcement["audience"];
      author: string;
    }) => {
      const now = new Date();
      const stamp = `${now.toISOString().slice(0, 10)} ${now
        .toTimeString()
        .slice(0, 5)}`;
      const announcement: Announcement = {
        id: `ANN-${String(state.announcements.length + 1).padStart(3, "0")}-${now.getTime()}`,
        ...input,
        createdAt: stamp,
      };
      set({
        announcements: [announcement, ...state.announcements],
        notifications: [
          {
            id: `NTF-${now.getTime()}`,
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
    removeAnnouncement: (id: string) =>
      set({ announcements: state.announcements.filter((a) => a.id !== id) }),
  };
}
