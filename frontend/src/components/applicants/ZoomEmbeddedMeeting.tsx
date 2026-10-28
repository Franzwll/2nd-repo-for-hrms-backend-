import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
/*  - signature ok          -> joins as HOST (role 1) so the meeting   */
/*                              starts immediately; if Zoom refuses    */
/*                              that seat ("Already has other meetings */
/*                              in progress") or the join hangs, it     */
/*                              retries once as a PARTICIPANT (role 0) */
/*                              instead of dead-ending.                */
/*  - leaving the room      -> the embed is asked to leave the meeting */
/*                              before its iframe is dropped, so a     */
/*                              stale session can't block the next     */
/*                              interview.                             */
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
  /** Ask the SDK to leave the meeting and wait briefly for confirmation.
   *  Closing the popup without this leaves a phantom host session behind,
   *  which makes the NEXT join fail with "Already has other meetings in
   *  progress". */
  leave: () => Promise<void>;
};

/** The SDK sizes its meeting window for at least this height (video +
 *  toolbar). Shorter panes get scaled down instead of clipped. */
const MIN_MEETING_HEIGHT = 500;

/** Zoom's rejection when the signed-in account is already hosting a
 *  meeting, e.g. "Fail to join the meeting. Already has other meetings in
 *  progress." (a leftover embedded room, the desktop app, or a second
 *  interview being hosted at the same time). */
const HOST_BUSY_RE =
  /other meetings? in progress|already (?:has|in|inside|joined) (?:a |an |another |other )?meeting|already be inside another/i;

/** Zoom's rejection when the meeting cannot start without a host (an old
 *  meeting created without join-before-host): "The meeting has not started"
 *  / "Please wait for the host to start this meeting". */
const HOST_REQUIRED_RE =
  /has not started|not started the meeting|wait(?:ing)? for the host|host has not started|meeting (?:is )?not open/i;

/** The stored meeting id no longer exists on Zoom (e.g. it was deleted in
 *  the Zoom portal, or a reschedule retired it). */
const MISSING_MEETING_RE =
  /meeting (?:does not exist|has been deleted|is invalid|not found)|invalid meeting|meeting not exist|not a valid meeting/i;

type ZoomJoinError = Error & {
  kind?:
    | "host_busy"
    | "host_required"
    | "missing_meeting"
    | "join_timeout"
    | "load_timeout"
    | "cancelled"
    | "signature";
};

function tagError(error: unknown, kind: NonNullable<ZoomJoinError["kind"]>): ZoomJoinError {
  const err: ZoomJoinError =
    error instanceof Error ? error : new Error(String(error ?? "unknown error"));
  err.kind = kind;
  return err;
}

/** A removed <iframe> is destroyed without firing its unload hooks, so the
 *  Meeting SDK never calls leaveMeeting and Zoom keeps the account "inside"
 *  that room. Park the document off-screen for a moment and ask it to leave
 *  before dropping it. */
function retireFrame(frame: HTMLIFrameElement | null) {
  if (!frame) return;
  try {
    if (frame.parentNode && frame.parentNode !== document.body) {
      frame.style.display = "none";
      document.body.appendChild(frame);
    }
    frame.contentWindow?.postMessage({ type: "zoom-leave", end: true }, "*");
  } catch {
    /* frame already torn down — nothing left to leave */
  }
  window.setTimeout(() => {
    try {
      frame.remove();
    } catch {
      /* ignore */
    }
  }, 8000);
}

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
  const joinedRef = useRef(false);
  const [state, setState] = useState<ZoomEmbedState>({ status: "idle" });
  /** Serial bumps to re-run the join effect (Retry button). */
  const [retryToken, setRetryToken] = useState(0);
  /** True while the host join was refused and we are rejoining as a guest. */
  const [retrying, setRetrying] = useState(false);
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

  /** Leave the meeting inside the live iframe (not just remove it), and give
   *  the SDK a moment to confirm. Without this the Zoom account stays
   *  "in" the room and every later join is refused. */
  const leave = useCallback((): Promise<void> => {
    const win = frameRef.current?.contentWindow;
    if (!win) {
      joinedRef.current = false;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      let done = false;
      let timer = 0;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        window.removeEventListener("message", onLeft);
        joinedRef.current = false;
        resolve();
      };
      const onLeft = (ev: MessageEvent) => {
        if (ev.source !== win) return;
        const data = ev.data as { zoomLeft?: boolean };
        if (data && data.zoomLeft) finish();
      };
      timer = window.setTimeout(finish, 2500);
      window.addEventListener("message", onLeft);
      try {
        win.postMessage({ type: "zoom-leave", end: true }, "*");
      } catch {
        finish();
      }
    });
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
      leave,
    }),
    [post, leave],
  );

  // Long-lived bridge listener: chat + device state arrive for the whole
  // life of the room, not just during the join handshake.
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      // Ignore a retired iframe (previous attempt / previous meeting) so its
      // late messages cannot flip the live room's state.
      if (ev.source && ev.source !== frameRef.current?.contentWindow) return;
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
    let frame: HTMLIFrameElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let abortJoin: (() => void) | null = null;

    if (!interviewDbId) {
      set({
        status: "fallback",
        reason: "Interview is not saved on the server yet — use the Join link below.",
      });
      return;
    }
    set({ status: "loading" });
    setRetrying(false);
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

    /** Release this attempt's iframe and stop its listeners. The iframe is
     *  parked (not just deleted) so the SDK can leave the meeting. */
    const teardown = () => {
      abortJoin?.();
      abortJoin = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      retireFrame(frame);
      frame = null;
      frameRef.current = null;
      joinedRef.current = false;
    };

    /** Mint a signature (role 1 = host, 0 = participant), boot a fresh embed
     *  iframe and wait until the SDK reports it is inside the meeting. */
    const attemptJoin = async (role: 0 | 1) => {
      let sig: {
        meeting_number: string;
        password: string | null;
        sdk_key: string;
        signature: string;
        user_name: string;
      };
      try {
        sig = await interviewsApi.zoomSignature(interviewDbId, role);
      } catch (e) {
        throw tagError(e, "signature");
      }
      if (cancelled) throw tagError(new Error("cancelled"), "cancelled");

      // Pre-flight: the embed page must be served before the iframe can boot.
      // Without this, a missing page degrades to a silent timeout.
      try {
        const head = await fetch(`/zoom-embed.html?t=${Date.now()}`, {
          method: "HEAD",
        });
        if (!head.ok) {
          throw new Error(`HTTP ${head.status}`);
        }
      } catch (e) {
        throw tagError(
          new Error(
            `embed page not served (${e instanceof Error ? e.message : String(e)}) — restart the dev server so it picks up public/zoom-embed.html`,
          ),
          "load_timeout",
        );
      }

      // 2) Boot the SDK inside a same-origin <iframe> (plain document, no
      // React) — the package's ESM entry pulls its own React copy, which
      // crashes on our React 19 app ("ReactCurrentOwner" undefined).
      // The popup stays in-system; only the video box is an iframe.
      // The iframe loads /zoom-embed.html (public/, React-free) and we pass
      // join params via postMessage after load.
      const root = rootRef.current;
      if (!root) throw tagError(new Error("cancelled"), "cancelled");
      const el = window.document.createElement("iframe");
      el.title = "Zoom meeting";
      el.allow = "camera; microphone; display-capture; autoplay; clipboard-write";
      el.style.border = "0";
      el.style.background = "#000";
      root.replaceChildren(el);
      frame = el;
      frameRef.current = el;
      fitFrameToPane();
      resizeObserver = new ResizeObserver(fitFrameToPane);
      resizeObserver.observe(root);

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
        let timer = 0;
        const finish = (err?: ZoomJoinError) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          window.removeEventListener("message", onMsg);
          abortJoin = null;
          if (err) reject(err);
          else resolve();
        };
        abortJoin = () => finish(tagError(new Error("cancelled"), "cancelled"));
        timer = window.setTimeout(() => {
          finish(
            tagError(
              new Error(
                phase === "load"
                  ? "Timed out loading Zoom embed page (/zoom-embed.html never signalled ready — hard-refresh, then open F12 Console for the [zoom-embed] error)"
                  : "Timed out joining the Zoom meeting — the account may already be inside another Zoom room, or the network is slow.",
              ),
              phase === "load" ? "load_timeout" : "join_timeout",
            ),
          );
        }, 30000);
        const onMsg = (ev: MessageEvent) => {
          // Accept only this attempt's iframe: a retired frame can still post
          // its late "joined"/"error" from a previous meeting.
          if (ev.source && ev.source !== el.contentWindow) return;
          const data = ev.data as {
            zoomEmbedReady?: boolean;
            zoomEmbedJoined?: boolean;
            zoomEmbedError?: string;
          };
          if (!data || typeof data !== "object") return;
          if (data.zoomEmbedReady) {
            // Superseded run (a remount raced us) — never join from here.
            if (cancelled) return;
            phase = "join";
            fitFrameToPane();
            try {
              // Post to the iframe's actual origin ("*" is safe here: the
              // payload is a single-use join signature for this meeting).
              el.contentWindow?.postMessage(joinParams, "*");
            } catch (e) {
              finish(tagError(e, "join_timeout"));
            }
          } else if (data.zoomEmbedJoined) {
            finish();
          } else if (typeof data.zoomEmbedError === "string") {
            const kind = HOST_BUSY_RE.test(data.zoomEmbedError)
              ? "host_busy"
              : HOST_REQUIRED_RE.test(data.zoomEmbedError)
                ? "host_required"
                : MISSING_MEETING_RE.test(data.zoomEmbedError)
                  ? "missing_meeting"
                  : "join_timeout";
            finish(tagError(new Error(data.zoomEmbedError), kind));
          }
        };
        window.addEventListener("message", onMsg);
        // Same-origin iframe: relative URL keeps origin identical so the
        // embed page's origin check passes. Add a cache-buster so a stale
        // copy of zoom-embed.html (old UMD script tags) can't linger.
        el.src = `/zoom-embed.html?t=${Date.now()}`;
      });

      if (cancelled) throw tagError(new Error("cancelled"), "cancelled");
      fitFrameToPane();
      joinedRef.current = true;
    };

    /** Turn a join failure into something HR can act on. */
    const failureReason = (err: ZoomJoinError) => {
      const detail = String(
        (err as { reason?: unknown; message?: unknown; errorCode?: unknown }).reason ??
          err?.message ??
          "unknown error",
      )
        .replace(/\s*[—–-]\s*use the Join link below\.?$/i, "")
        .slice(0, 300);
      switch (err.kind) {
        case "host_busy":
          return "Zoom refused the host seat because this account already has a meeting in progress. The room could not rejoin as a participant either — end the other Zoom meeting (desktop app, web, or another interview room), then Retry — or use the Join link below.";
        case "host_required":
          return "Zoom would not start this meeting without a host. Ask IT to re-create the interview's Zoom link (it must allow join-before-host), then Retry — or use the Join link below.";
        case "join_timeout":
          return "Zoom did not finish joining in time. The account is usually still inside another Zoom room (desktop app or an interview room left open) — close it, then Retry, or use the Join link below.";
        case "missing_meeting":
          return "The Zoom meeting saved for this interview no longer exists on Zoom. Retry to generate a fresh meeting (the server recreates it automatically) — or use the Join link below if it still works.";
        case "load_timeout":
          return `The Zoom embed page could not load (${detail}) — hard-refresh (Ctrl+F5) and Retry, or use the Join link below.`;
        case "signature":
          return /not configured|501/i.test(detail)
            ? "Real-time Zoom preview is not configured yet — ask IT to add ZOOM_SDK_KEY / ZOOM_SDK_SECRET, or use the Join link below."
            : "Could not start the embedded meeting — use the Join link below.";
        default:
          return `Embedded Zoom could not start in this browser (${detail}) — use the Join link below.`;
      }
    };

    (async () => {
      try {
        // Role 1 = host: the interviewer STARTS the meeting on join, so the
        // embedded room goes live immediately instead of sitting at
        // "The meeting has not started" waiting for a host that never comes
        // (the applicant joins as a guest from their emailed link).
        try {
          await attemptJoin(1);
        } catch (e) {
          const err = e as ZoomJoinError;
          if (cancelled || err.kind === "cancelled") return;
          // The host seat is refused (or the join hangs) when this Zoom
          // account is already hosting something — a leftover embedded room
          // from a previous attempt, the desktop/web app, or another
          // interview being hosted at the same time. Retire that attempt and
          // rejoin as a PARTICIPANT: meetings are created with
          // join-before-host, so HR still gets into the same meeting without
          // claiming a second host slot.
          if (err.kind === "host_busy" || err.kind === "join_timeout") {
            console.warn("Zoom host join unavailable, retrying as participant:", err.message);
            setRetrying(true);
            teardown();
            await new Promise((resolve) => window.setTimeout(resolve, 700));
            if (cancelled) return;
            await attemptJoin(0);
          } else {
            throw err;
          }
        }
        if (cancelled) return;
        setRetrying(false);
        set({ status: "live" });
      } catch (e) {
        if (cancelled) return;
        const err = e as ZoomJoinError;
        console.warn("Zoom embedded join failed:", err);
        // Release the iframe BEFORE the fallback UI replaces it: a
        // half-joined session left behind is what makes the next attempt
        // fail with the same message.
        teardown();
        set({ status: "fallback", reason: failureReason(err) });
      }
    })();

    return () => {
      cancelled = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewDbId, retryToken]);

  if (state.status === "fallback") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 bg-muted/40 px-4 py-8 text-center">
        <VideoOff className="h-6 w-6 text-muted-foreground" />
        <p className="max-w-md text-xs text-muted-foreground">{state.reason}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <button
            type="button"
            className="text-xs font-semibold text-primary underline"
            onClick={() => {
              // Re-render the meeting pane BEFORE the retry effect runs so it
              // has a mount point for the new iframe.
              set({ status: "loading" });
              setRetryToken((t) => t + 1);
            }}
          >
            Retry embedded Zoom
          </button>
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
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={rootRef}
        id="zoom-embed-root"
        className={fill ? "h-full w-full" : "h-[420px] w-full lg:h-[560px]"}
      />
      {state.status !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-xs">
            {retrying
              ? "Another Zoom meeting is using this account — joining as a participant…"
              : "Connecting to Zoom meeting…"}
          </p>
          <p className="text-[0.65rem] text-white/70">Camera + mic permission may be requested.</p>
        </div>
      )}
      {state.status === "live" && !videoOn && !hintDismissed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-4">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-black/75 py-1.5 pl-3 pr-1.5 text-[0.7rem] text-white shadow-lg backdrop-blur">
            <VideoOff className="h-3 w-3 shrink-0" />
            <span className="max-w-[420px] truncate" title={videoHint ?? undefined}>
              {videoHint ??
                "Starting camera… if this stays black, click Start Video in the toolbar"}
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
