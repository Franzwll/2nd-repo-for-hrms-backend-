import { useState } from "react";
import { Bot, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Msg = { from: "bot" | "user"; text: string };

const suggestions = [
  "What jobs are open?",
  "How do I apply?",
  "What documents do I need?",
  "How is my resume screened?",
  "How long is the hiring process?",
];

function answer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("job") || t.includes("open") || t.includes("vacan"))
    return "We currently have openings for Front Desk Receptionist, Line Cook, Housekeeping Attendant, Restaurant Server, and Bartender. Head to Find Jobs to see salaries and requirements.";
  if (t.includes("apply") || t.includes("form"))
    return "Open any job, then fill out the application form on the right — full name, email, phone number, location, and your resume file (PDF, DOC, DOCX up to 5MB). No account needed.";
  if (t.includes("document") || t.includes("requirement"))
    return "Prepare an updated resume, valid government ID, NBI clearance, and role-specific certificates such as TESDA NC II, food handler, or bartending licenses.";
  if (t.includes("resume") || t.includes("screen") || t.includes("nlp") || t.includes("ner"))
    return "Your resume is parsed with spaCy-based NLP. Named Entity Recognition extracts your skills, work history, education, and certifications, then scores your match against the criteria HR set for that role.";
  if (t.includes("long") || t.includes("process") || t.includes("interview"))
    return "Shortlisted applicants are contacted within 3–5 working days. The complete process — screening, interview, practical assessment, and verification — usually takes two to three weeks.";
  if (t.includes("salary") || t.includes("pay"))
    return "Salaries range from ₱14,000 to ₱25,000 per month depending on role, plus service charge, meal allowance, and HMO after regularization.";
  if (t.includes("experience"))
    return "Yes — Housekeeping and Food & Beverage roles accept entry-level applicants with paid on-the-job training.";
  if (t.includes("contact") || t.includes("hr"))
    return "You can reach HR at hr@oxfordsuites.com.ph or +63 2 8888 8688, or visit us at 528 P. Burgos Street, Makati City.";
  return "I can help with job openings, how to apply, required documents, resume screening, and the hiring timeline. Try one of the suggestions below.";
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hello! I'm the Oxford Suites Makati careers assistant. Ask me anything about our job openings or the application process.",
    },
  ]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "user", text: q }, { from: "bot", text: answer(q) }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">Careers Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.from === "bot"
                      ? "bg-muted text-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
            {suggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
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
      </button>
    </>
  );
}
