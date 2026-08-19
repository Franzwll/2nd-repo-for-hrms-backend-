import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Bot, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  peso,
  useCompany,
  useLandingJobs,
  type CompanyInfo,
  type LandingJob,
} from "@/lib/landing"

type Msg = { from: "bot" | "user"; text: string; replies?: string[] }
type Reply = { text: string; replies?: string[]; topic?: LandingJob | null }

const START_TIME = 450
const MAX_REPLIES = 4

/* ------------------------------------------------------------------ */
/* Trainable knowledge: add synonyms to keywords, tune the replies.    */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "am", "do", "does", "did",
  "i", "me", "my", "we", "you", "your", "for", "about", "tell", "please",
  "can", "could", "to", "of", "in", "on", "at", "and", "or", "it", "with",
  "like", "looking", "want", "any", "there", "where", "when", "who", "which",
  "as", "some", "what", "how", "has", "have", "help", "share",
])

const INTENTS: { id: string; keywords: string[] }[] = [
  { id: "open_jobs", keywords: ["job", "open", "vacan", "hiring", "opening", "available"] },
  { id: "apply", keywords: ["apply", "application", "form", "submit", "sign up", "register"] },
  { id: "documents", keywords: ["document", "requirement", "paper", "id", "certificate", "clearance", "prepar", "need to bring"] },
  { id: "resume", keywords: ["resume", "cv", "screen", "nlp", "ner", "parse", "spacy", "match", "score"] },
  { id: "timeline", keywords: ["long", "process", "how soon", "when", "interview", "step", "day", "week", "timeline", "shortlist", "hear back", "notified"] },
  { id: "salary", keywords: ["salary", "pay", "compensation", "wage", "rate", "earn", "income", "money"] },
  { id: "benefits", keywords: ["benefit", "hmo", "allowance", "meal", "perk", "insurance", "leave", "dependents"] },
  { id: "experience", keywords: ["experience", "entry", "no experience", "fresh", "trainee", "beginner", "ojt", "newbie"] },
  { id: "contact", keywords: ["contact", "hr", "phone", "email", "address", "location", "visit", "reach", "walk in", "hotline"] },
  { id: "about", keywords: ["about", "company", "hotel", "mission", "vision", "values", "who are", "what is oxford"] },
  { id: "hours", keywords: ["hours", "schedule", "shift", "time of day", "when open"] },
  { id: "greeting", keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "good day"] },
  { id: "thanks", keywords: ["thank", "thanks", "appreciate"] },
  { id: "bye", keywords: ["bye", "goodbye", "see you"] },
]

const STARTERS = [
  "What jobs are open?",
  "How do I apply?",
  "What documents do I need?",
  "How long is the hiring process?",
]

const GREETING: Msg = {
  from: "bot",
  text: "Hello! I'm the Oxford Suites Makati careers assistant. I pull live updates straight from our job board — ask me about openings, pay, requirements, or how to apply.",
  replies: STARTERS,
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "hrms-chatbot-history"

function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveMessages(messages: Msg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    /* storage unavailable — ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim()
}

function queryTokens(text: string): string[] {
  return normalize(text).split(" ").filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

function hasAny(text: string, keywords: string[]): boolean {
  const t = normalize(text)
  return keywords.some((k) => t.includes(k))
}

function roleTokens(job: LandingJob): string[] {
  return normalize(`${job.title} ${job.department} ${job.skills.join(" ")}`).split(" ")
}

function findRole(text: string, jobs: LandingJob[]): LandingJob | null {
  const tokens = queryTokens(text)
  if (!tokens.length) return null
  let best: LandingJob | null = null
  let bestScore = 0
  for (const job of jobs) {
    const rt = roleTokens(job)
    const score = tokens.reduce((acc, w) => acc + (rt.includes(w) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = job
    }
  }
  if (!best) return null
  const confident = bestScore >= 2 || (bestScore >= 1 && tokens.length <= 2)
  return confident ? best : null
}

function salaryText(job: LandingJob): string {
  const lo = Number(job.salaryMin) || 0
  const hi = Number(job.salaryMax) || 0
  if (lo && hi) return `${peso(lo)} – ${peso(hi)}/month`
  if (lo) return `from ${peso(lo)}/month`
  return "competitive (discussed at interview)"
}

function salaryRangeText(jobs: LandingJob[]): string {
  const mins = jobs.map((j) => Number(j.salaryMin) || 0).filter((n) => n > 0)
  const maxs = jobs.map((j) => Number(j.salaryMax) || 0).filter((n) => n > 0)
  if (!mins.length) return "Salaries vary by role and are discussed at interview."
  return `From ${peso(Math.min(...mins))} to ${peso(Math.max(...maxs))} per month, depending on the role.`
}

/* ------------------------------------------------------------------ */
/* Reply engine                                                        */
/* ------------------------------------------------------------------ */

function roleDetails(job: LandingJob): Reply {
  const lines = [
    `${job.title} · ${job.department || "Various"}`,
    `Employment: ${job.employmentType}${job.schedule ? ` · ${job.schedule}` : ""}`,
    `Salary: ${salaryText(job)}`,
    `Vacancies: ${job.vacancies} open${job.filled ? ` (${job.filled} filled)` : ""}`,
  ]
  if (job.experience) lines.push(`Experience: ${job.experience}`)
  if (job.education) lines.push(`Education: ${job.education}`)
  if (job.summary) lines.push(`About: ${job.summary}`)
  if (job.qualifications.length) {
    lines.push("Key requirements:")
    job.qualifications.slice(0, 3).forEach((q) => lines.push(`• ${q}`))
  }
  if (job.benefits.length) lines.push(`Benefits: ${job.benefits.join(", ")}`)

  return {
    text: lines.join("\n"),
    replies: [
      "How do I apply?",
      "What documents do I need?",
      "What does the job pay?",
    ],
    topic: job,
  }
}

function openJobsReply(jobs: LandingJob[], company: CompanyInfo): Reply {
  if (!jobs.length) {
    return {
      text: `We don't have any open positions right now — but check back soon, or email your resume to ${company.email} and we'll keep it on file for future openings.`,
      replies: ["How do I apply?", "Contact HR"],
    }
  }
  const shown = jobs.slice(0, 6)
  const lines = jobs.length
    ? "We're currently hiring:\n" + shown.map((j) => `• ${j.title} (${j.department || "Various"}) — ${salaryText(j)}`).join("\n")
    : ""
  const tail = jobs.length > shown.length ? `\n…and ${jobs.length - shown.length} more.` : ""
  return {
    text: `${lines}${tail}\nTap a role below to learn more.`,
    replies: jobs.slice(0, MAX_REPLIES).map((j) => `Tell me about ${j.title}`),
  }
}

function applyReply(job: LandingJob | null): Reply {
  const base =
    "Head to the Find Jobs section, open the position you like, and fill in the application form on that page — full name, email, phone, location, and your resume file (PDF, DOC, or DOCX, up to 5MB). No account or sign-up needed."
  return {
    text: job ? `To apply for ${job.title}: ${base}` : base,
    replies: ["What documents do I need?", "How long is the hiring process?"],
  }
}

function documentsReply(job: LandingJob | null): Reply {
  const general =
    "Prepare an updated resume, a valid government ID, NBI clearance, and role-specific certificates (such as TESDA NC II, food handler, or bartending licenses if required)."
  const extra =
    job && job.qualifications.length
      ? `\n\nFor ${job.title} specifically, we ask for: ${job.qualifications.slice(0, 3).join("; ")}.`
      : ""
  return { text: `${general}${extra}`, replies: ["How do I apply?"] }
}

function salaryReply(job: LandingJob | null, jobs: LandingJob[]): Reply {
  if (job) {
    return {
      text: `${job.title} pays ${salaryText(job)}. ${job.benefits.length ? `Benefits include: ${job.benefits.join(", ")}.` : ""}`,
      replies: ["What documents do I need?", "How do I apply?"],
      topic: job,
    }
  }
  return {
    text: `${salaryRangeText(jobs)} Ask me about a specific role for its exact range.`,
    replies: jobs.slice(0, MAX_REPLIES).map((j) => `Tell me about ${j.title}`),
  }
}

function buildReply(
  q: string,
  jobs: LandingJob[],
  company: CompanyInfo,
  topic: LandingJob | null,
): Reply {
  const role = findRole(q, jobs)

  if (role) return roleDetails(role)

  if (hasAny(q, INTENTS.find((i) => i.id === "thanks")!.keywords)) {
    return { text: "You're welcome! Is there anything else I can help with?", replies: STARTERS }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "bye")!.keywords)) {
    return {
      text: "Goodbye! Best of luck with your application — feel free to come back anytime.",
      replies: ["What jobs are open?"],
    }
  }

  if (hasAny(q, INTENTS.find((i) => i.id === "open_jobs")!.keywords)) {
    return openJobsReply(jobs, company)
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "salary")!.keywords)) {
    return salaryReply(role ?? topic, jobs)
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "documents")!.keywords)) {
    return documentsReply(role ?? topic)
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "apply")!.keywords)) {
    return applyReply(role ?? topic)
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "resume")!.keywords)) {
    return {
      text: "Your resume is parsed with spaCy-based NLP. Named Entity Recognition extracts your skills, work history, education, and certifications, then scores your match against the criteria HR set for that role — no manual screening of each resume.",
      replies: ["How long is the hiring process?", "What jobs are open?"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "timeline")!.keywords)) {
    return {
      text: "Shortlisted applicants are usually contacted within 3–5 working days. The full process — resume screening, interview, practical assessment, and verification — typically takes two to three weeks.",
      replies: ["How is my resume screened?", "Contact HR"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "benefits")!.keywords)) {
    const base =
      "Teammates enjoy service charge, meal allowance, and HMO coverage after regularization, plus paid on-the-job training when you start."
    const extra =
      topic && topic.benefits.length ? `\n\n${topic.title} specifically lists: ${topic.benefits.join(", ")}.` : ""
    return { text: `${base}${extra}`, replies: ["What jobs are open?", "How do I apply?"] }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "experience")!.keywords)) {
    return {
      text: "Yes — Housekeeping and Food & Beverage roles accept entry-level applicants, and we provide paid on-the-job training. Fresh graduates are welcome to apply.",
      replies: ["What jobs are open?", "How do I apply?"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "contact")!.keywords)) {
    return {
      text: `You can reach HR at ${company.email} or ${company.phone}${company.hours ? ` (${company.hours})` : ""}. You can also visit us at ${company.address}.`,
      replies: ["What jobs are open?", "How do I apply?"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "about")!.keywords)) {
    return {
      text: `${company.overview}\n\nMission: ${company.mission}\nVision: ${company.vision}\nValues: ${company.values.join(", ")}.`,
      replies: ["What jobs are open?", "How long is the hiring process?"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "hours")!.keywords)) {
    return {
      text: `Our HR team is available ${company.hours || "during office hours"} — but the chat is open around the clock. Want the full list of open roles?`,
      replies: ["What jobs are open?", "Contact HR"],
    }
  }
  if (hasAny(q, INTENTS.find((i) => i.id === "greeting")!.keywords)) {
    return {
      text: "Hi there! I can help with open jobs, pay, required documents, the hiring timeline, and how to apply. What would you like to know?",
      replies: STARTERS,
    }
  }

  return {
    text: `I'm still learning! I can help with open jobs, how to apply, required documents, resume screening, the hiring timeline, salary & benefits, and contact info. For anything else, email ${company.email}.`,
    replies: STARTERS,
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Chatbot() {
  const { jobs } = useLandingJobs()
  const { company } = useCompany()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = loadMessages()
    return saved.length ? saved : [GREETING]
  })
  const [typing, setTyping] = useState(false)
  const [topic, setTopic] = useState<LandingJob | null>(null)
  const [unread, setUnread] = useState(() => {
    const saved = loadMessages()
    const last = saved[saved.length - 1]
    return saved.length > 1 && last?.from === "bot"
  })
  const viewportRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    if (open) setUnread(false)
  }, [open])

  useEffect(() => {
    const vp = viewportRef.current
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" })
  }, [messages, typing, open])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    const reply = buildReply(q, jobs, company, topic)
    setMessages((m) => [...m, { from: "user", text: q }])
    setInput("")
    setTyping(true)
    const delay = START_TIME + Math.min(reply.text.length * 3, 700)
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: reply.text,
          ...(reply.replies ? { replies: reply.replies } : {}),
        },
      ])
      setTopic(reply.topic ?? null)
      setTyping(false)
    }, delay)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[30rem] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">Careers Assistant</span>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[0.65rem] font-medium">
                Live
              </span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden">
            <ScrollAreaPrimitive.Viewport
              ref={viewportRef}
              className="h-full w-full rounded-[inherit]"
            >
              <div className="space-y-3 p-3">
                {messages.map((m, i) => (
                  <div key={i} className="space-y-1.5">
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm",
                        m.from === "bot"
                          ? "bg-muted text-foreground"
                          : "ml-auto bg-primary text-primary-foreground",
                      )}
                    >
                      {m.text}
                    </div>
                    {m.from === "bot" && m.replies && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.replies.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <span className="animate-pulse">…</span>
                  </div>
                )}
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar />
            <ScrollAreaPrimitive.Corner />
          </ScrollAreaPrimitive.Root>

          <form
            className="flex items-center gap-2 border-t border-border p-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={typing}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open careers assistant"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
        {!open && unread && (
          <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>
    </>
  )
}