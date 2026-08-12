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
  announcements: [
    {
      id: "ANN-002",
      title: "Company town hall — Aug 8",
      body:
        "All department heads and staff are invited to the quarterly town hall at the Grand Ballroom, 3:00 PM. Attendance will be logged.",
      audience: "All",
      author: "Bullseur Santiago",
      createdAt: "2026-08-01 09:15",
    },
    {
      id: "ANN-001",
      title: "Payroll cut-off moved to Aug 5",
      body:
        "Due to the holiday, the payroll cut-off for the first half of August moves to Aug 5. Please file overtime and leave requests before then.",
      audience: "All",
      author: "Juan Dela Cruz",
      createdAt: "2026-07-30 16:40",
    },
  ],
  notifications: [
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
  ],
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
