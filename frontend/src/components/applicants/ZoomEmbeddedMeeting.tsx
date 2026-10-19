import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2, VideoOff, X } from "lucide-react";
import { interviewsApi } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* ZoomEmbeddedMeeting — real Zoom meeting inside the HRMS popup        */
/* (Meeting SDK Component View: meeting + toolbar rendered into        */
/* #zoom-embed-root, no Zoom app needed).                              */
/*                                                                     */
/* Behaviour:                                                          */
/*  - dbId missing          -> fallback notice (interview not on DB)   */
/*  - signature 428/501     -> "SDK not configured" notice: HR uses    */
/*                              the Join-link button (mock links).      */
/*  - signature ok          -> lazy-loads @zoom/meetingsdk, embeds the */
/*                              live meeting in this box.              */
/*                                                                     */
/* Parent <-> embed bridge (same-origin postMessage):                   */
/*  - The room's control bar sends zoom-command messages (mute, video, */
/*    open-audio, chat-send, chat-history, request-state) and the      */
/*    embed page answers with zoomSelfState / zoomChatMessage /        */
/*    zoomChatHistory / zoomChatError events.                          */
/*  - The SDK lays itself out for a ~500px-tall room; when the pane is */
/*    shorter the iframe is scaled down so Zoom's own toolbar (mic,    */
/*    camera, participants, chat, leave) stays visible instead of      */
/*    being clipped below the video.                                   */
/* ------------------------------------------------------------------ */

export type ZoomEmbedState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "live" }
  | { status: "fallback"; reason: string };

/** In-meeting chat message surfaced by the embed page. */
export type ZoomChatEntry = {
  id: string;
  sender: string;
  userId: number | null;
  text: string;
  /** Epoch milliseconds. */
  time: number;
  /** True for messages sent from this room. */
  self?: boolean;
};

/** Imperative device/chat controls the room's control bar drives. */
export type ZoomEmbeddedMeetingHandle = {
  setMuted: (mute: boolean) => void;
  setVideo: (on: boolean) => void;
  openAudioSettings: () => void;
  sendChat: (text: string) => void;
  requestChatHistory: () => void;
  requestState: () => void;
};

/** The SDK sizes its meeting window for at least this height (video +
 *  toolbar). Shorter panes get scaled down instead of clipped. */
const MIN_MEETING_HEIGHT = 500;

export const ZoomEmbeddedMeeting = forwardRef<
  ZoomEmbeddedMeetingHandle,
  {
    interviewDbId?: number | null;
    joinUrl?: string | null;
    /** Display name shown on the video tile (defaults to the interviewer). */
    userName?: string | null;
    /** Start the local camera right after joining so HR sees themselves
     *  instantly instead of a black stage + "No video yet" pill. */
    autoStartVideo?: boolean;
    onStateChange?: (s: ZoomEmbedState) => void;
    /** Chat message received in the meeting (also echoes our own sends). */
    onChatMessage?: (m: ZoomChatEntry) => void;
    /** Buffered chat history from the embed page (sent on request). */
    onChatHistory?: (m: ZoomChatEntry[]) => void;
    /** Chat command failed (e.g. in-meeting chat disabled). */
    onChatError?: (message: string) => void;
    /** Non-fatal notice from the meeting controls (shown as a toast). */
    onNotice?: (message: string) => void;
    /** Mute / camera state reported by the SDK (keeps the bar in sync). */
    onSelfState?: (s: { muted?: boolean; videoOn?: boolean }) => void;
    /** Stretch to the parent instead of a fixed height (used by the Zoom room). */
    fill?: boolean;
  }
>(function ZoomEmbeddedMeeting(
  {
    interviewDbId,
    joinUrl,
    userName,
    autoStartVideo = true,
    onStateChange,
    onChatMessage,
    onChatHistory,
    onChatError,
    onNotice,
    onSelfState,
    fill = false,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const clientRef = useRef<{ leaveMeeting: () => Promise<void> } | null>(null);
  const joinedRef = useRef(false);
  const [state, setState] = useState<ZoomEmbedState>({ status: "idle" });
  // True once any participant turns their camera on (reported by the embed
  // page via user-added/user-updated). While live with no video, the stage
  // is black — the pill below tells HR why instead of looking broken.
  const [videoOn, setVideoOn] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  // Exact camera failure from the embed page (e.g. startVideo rejected) —
  // shown in the pill so HR gets an action instead of a generic nudge.
  const [videoHint, setVideoHint] = useState<string | null>(null);

  const set = useCallback(
    (s: ZoomEmbedState) => {
      setState(s);
      onStateChange?.(s);
    },
    [onStateChange],
  );

  /** Forward a control command to the embed page. */
  const post = useCallback((payload: Record<string, unknown>) => {
    try {
      frameRef.current?.contentWindow?.postMessage(payload, "*");
    } catch {
      /* iframe gone — the room is closing anyway */
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setMuted: (mute: boolean) => post({ type: "zoom-command", command: "mute", value: mute }),
      setVideo: (on: boolean) => post({ type: "zoom-command", command: "video", value: on }),
      openAudioSettings: () => post({ type: "zoom-command", command: "open-audio" }),
      sendChat: (text: string) => post({ type: "zoom-command", command: "chat-send", text }),
      requestChatHistory: () => post({ type: "zoom-command", command: "chat-history" }),
      requestState: () => post({ type: "zoom-command", command: "request-state" }),
    }),
    [post],
  );

  // Long-lived bridge listener: chat + device state arrive for the whole
  // life of the room, not just during the join handshake.
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const data = ev.data as {
        zoomChatMessage?: ZoomChatEntry;
        zoomChatHistory?: ZoomChatEntry[];
        zoomChatError?: string;
        zoomNotice?: string;
        zoomSelfState?: { muted?: boolean; videoOn?: boolean };
        zoomVideoOn?: boolean;
        zoomVideoHint?: string;
      };
      if (!data || typeof data !== "object") return;
      if (data.zoomChatMessage) onChatMessage?.(data.zoomChatMessage);
      if (Array.isArray(data.zoomChatHistory)) onChatHistory?.(data.zoomChatHistory);
      if (typeof data.zoomChatError === "string" && data.zoomChatError) {
        onChatError?.(data.zoomChatError);
      }
      if (typeof data.zoomNotice === "string" && data.zoomNotice) {
        onNotice?.(data.zoomNotice);
      }
      if (data.zoomSelfState && typeof data.zoomSelfState === "object") {
        onSelfState?.(data.zoomSelfState);
      }
      if (typeof data.zoomVideoOn === "boolean") {
        setVideoOn(data.zoomVideoOn);
        if (data.zoomVideoOn) setVideoHint(null);
      }
      if (typeof data.zoomVideoHint === "string" && data.zoomVideoHint) {
        setVideoHint(data.zoomVideoHint);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [onChatMessage, onChatHistory, onChatError, onNotice, onSelfState]);

  useEffect(() => {
    let cancelled = false;
    if (!interviewDbId) {
      set({
        status: "fallback",
        reason: "Interview is not saved on the server yet — use the Join link below.",
      });
      return;
    }
    set({ status: "loading" });
    setVideoOn(false);
    setVideoHint(null);
    setHintDismissed(false);

    /** Size the iframe so the SDK's full window (video + its own toolbar)
     *  fits the pane. The SDK always lays out for >= MIN_MEETING_HEIGHT,
     *  so a short pane would crop the toolbar; when that happens the
     *  iframe is made taller/wider and scaled back down with a CSS
     *  transform (hit-testing follows the transform, so the toolbar
     *  stays clickable). */
    const fitFrameToPane = () => {
      const el = frameRef.current;
      const root = rootRef.current;
      if (!el || !root) return;
      const box = root.getBoundingClientRect();
      if (box.width < 40 || box.height < 40) return;
      const scale = Math.min(1, box.height / MIN_MEETING_HEIGHT);
      const innerW = Math.round(box.width / scale);
      const innerH = Math.round(box.height / scale);
      el.style.transformOrigin = "top left";
      el.style.transform = scale < 1 ? `scale(${scale})` : "none";
      el.style.width = `${innerW}px`;
      el.style.height = `${innerH}px`;
    };

    (async () => {
      // 1) Mint a join signature from the backend (secret never leaves server).
      // Role 1 = host: the interviewer STARTS the meeting on join, so the
      // embedded room goes live immediately instead of sitting at
      // "The meeting has not started" waiting for a host that never comes
      // (the applicant joins as a guest from their emailed link).
      let sig: {
        meeting_number: string;
        password: string | null;
        sdk_key: string;
        signature: string;
        user_name: string;
      };
      try {
        sig = await interviewsApi.zoomSignature(interviewDbId, 1);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "";
          set({
            status: "fallback",
            reason: /not configured|501/i.test(msg)
              ? "Real-time Zoom preview is not configured yet — ask IT to add ZOOM_SDK_KEY / ZOOM_SDK_SECRET, or use the Join link below."
              : "Could not start the embedded meeting — use the Join link below.",
          });
        }
        return;
      }

      // A remount (dev hot-reloads included) can retire this effect run while
      // the signature request is in flight. Bail before booting an iframe:
      // a discarded run's embed would otherwise join invisibly and claim the
      // host slot, making the instance actually on screen fail with Zoom's
      // "Already has other meetings in progress".
      if (cancelled) return;

      // 2) Boot the SDK inside a same-origin <iframe> (plain document, no
      // React) — the package's ESM entry pulls its own React copy, which
      // crashes on our React 19 app ("ReactCurrentOwner" undefined).
      // The popup stays in-system; only the video box is an iframe.
      // The iframe loads /zoom-embed.html (public/, React-free) and we pass
      // join params via postMessage after load.
      try {
        const root = rootRef.current;
        if (!root) return;
        // Pre-flight: the embed page must be served before the iframe can boot.
        // Without this, a missing page degrades to a 45s silent timeout.
        // (The page itself verifies React/SDK globals and reports exactly
        // which one is absent, so one check here is enough.)
        try {
          const head = await fetch(`/zoom-embed.html?t=${Date.now()}`, {
            method: "HEAD",
          });
          if (!head.ok) {
            throw new Error(`HTTP ${head.status}`);
          }
        } catch (e) {
          throw new Error(
            `embed page not served (${e instanceof Error ? e.message : String(e)}) — restart the dev server so it picks up public/zoom-embed.html`,
          );
        }
        const frame = window.document.createElement("iframe");
        frame.title = "Zoom meeting";
        frame.allow = "camera; microphone; display-capture; autoplay; clipboard-write";
        frame.style.border = "0";
        frame.style.background = "#000";
        root.replaceChildren(frame);
        frameRef.current = frame;
        fitFrameToPane();
        const resizeObserver = new ResizeObserver(fitFrameToPane);
        resizeObserver.observe(root);
        clientRef.current = {
          leaveMeeting: async () => {
            try {
              resizeObserver.disconnect();
              frame.src = "about:blank";
            } catch {
              /* ignore */
            }
          },
        };
        const joinParams = {
          type: "zoom-join",
          sdkKey: sig.sdk_key,
          signature: sig.signature,
          meetingNumber: sig.meeting_number,
          password: sig.password ?? "",
          userName: userName || sig.user_name || "HR Interviewer",
          // Ask the embed page to publish the local camera right after join.
          startVideo: autoStartVideo,
        };
        await new Promise<void>((resolve, reject) => {
          let settled = false;
          // One deadline covers two distinct phases; the failure message must
          // say which one ran out — "ready never arrived" (embed page/SDK
          // problem) versus "join never finished" (e.g. the Zoom account is
          // already inside another meeting and refuses a second one).
          let phase: "load" | "join" = "load";
          const timer = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            window.removeEventListener("message", onMsg);
            reject(
              new Error(
                phase === "load"
                  ? "Timed out loading Zoom embed page (/zoom-embed.html never signalled ready — hard-refresh, then open F12 Console for the [zoom-embed] error)"
                  : "Timed out joining the Zoom meeting — the account may already be inside another Zoom room (close any other open interview rooms) or the network is slow. Retry, or use the Join link below.",
              ),
            );
          }, 45000);
          const onMsg = (ev: MessageEvent) => {
            // Accept ready from the iframe even if origin differs (file:// edge).
            const data = ev.data as {
              zoomEmbedReady?: boolean;
              zoomEmbedJoined?: boolean;
              zoomEmbedError?: string;
            };
            if (!data || typeof data !== "object") return;
            if (data.zoomEmbedReady) {
              // Superseded run (a remount raced us) — never join from here.
              // A discarded instance's join makes the on-screen instance
              // fail with "Already has other meetings in progress".
              if (cancelled) return;
              phase = "join";
              fitFrameToPane();
              try {
                // Post to the iframe's actual origin ("*" is safe here: the
                // payload is a single-use join signature for this meeting).
                frame.contentWindow?.postMessage(joinParams, "*");
              } catch (e) {
                if (!settled) {
                  settled = true;
                  window.clearTimeout(timer);
                  window.removeEventListener("message", onMsg);
                  reject(e instanceof Error ? e : new Error(String(e)));
                }
              }
            } else if (data.zoomEmbedJoined) {
              if (settled) return;
              settled = true;
              window.clearTimeout(timer);
              window.removeEventListener("message", onMsg);
              resolve();
            } else if (typeof data.zoomEmbedError === "string") {
              if (settled) return;
              settled = true;
              window.clearTimeout(timer);
              window.removeEventListener("message", onMsg);
              reject(new Error(data.zoomEmbedError));
            }
          };
          window.addEventListener("message", onMsg);
          // Same-origin iframe: relative URL keeps origin identical so the
          // embed page's origin check passes. Add a cache-buster so a stale
          // copy of zoom-embed.html (old UMD script tags) can't linger.
          frame.src = `/zoom-embed.html?t=${Date.now()}`;
        });
        if (cancelled) return;
        fitFrameToPane();
        joinedRef.current = true;
        set({ status: "live" });
      } catch (e) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn("Zoom embedded join failed:", e);
          const raw =
            (e as { reason?: unknown; message?: unknown; errorCode?: unknown }) ?? {};
          const detail = String(
            raw.reason ?? raw.message ?? raw.errorCode ?? "unknown error",
          ).slice(0, 300);
          set({
            status: "fallback",
            reason: `Embedded Zoom could not start in this browser (${detail}) — use the Join link below.`,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      frameRef.current = null;
      if (joinedRef.current) {
        joinedRef.current = false;
        try {
          void clientRef.current?.leaveMeeting()?.catch(() => undefined);
        } catch {
          /* ignore */
        }
        clientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewDbId]);

  if (state.status === "fallback") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 bg-muted/40 px-4 py-8 text-center">
        <VideoOff className="h-6 w-6 text-muted-foreground" />
        <p className="max-w-md text-xs text-muted-foreground">{state.reason}</p>
        {joinUrl && (
          <a
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary underline"
          >
            Open Zoom meeting link
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={rootRef}
        id="zoom-embed-root"
        className={
          fill ? "h-full w-full" : "h-[420px] w-full lg:h-[560px]"
        }
      />
      {state.status !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xs">Connecting to Zoom meeting…</p>
          <p className="text-[0.65rem] text-white/70">Camera + mic permission may be requested.</p>
        </div>
      )}
      {state.status === "live" && !videoOn && !hintDismissed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-4">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-black/75 py-1.5 pl-3 pr-1.5 text-[0.7rem] text-white shadow-lg backdrop-blur">
            <VideoOff className="h-3 w-3 shrink-0" />
            <span className="max-w-[420px] truncate" title={videoHint ?? undefined}>
              {videoHint ?? "Starting camera… if this stays black, click Start Video in the toolbar"}
            </span>
            <button
              type="button"
              aria-label="Dismiss camera hint"
              className="shrink-0 rounded-full p-0.5 hover:bg-white/20"
              onClick={() => setHintDismissed(true)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
