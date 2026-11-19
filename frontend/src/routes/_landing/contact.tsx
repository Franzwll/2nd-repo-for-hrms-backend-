import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";

export const Route = createFileRoute("/_landing/contact")({
  head: () => ({
    meta: [
      { title: "Contact HR — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "Contact the Oxford Suites Makati HR and recruitment team by phone, email, or the online inquiry form.",
      },
      { property: "og:title", content: "Contact HR — Oxford Suites Makati" },
      {
        property: "og:description",
        content: "Reach our HR and recruitment team in Makati City.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { company } = useCompany();

  useLightOnly();

  const details = [
    { icon: Phone, label: "Phone", value: company.phone, href: `tel:${company.phone.replace(/[^\d+]/g, "")}` },
    { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
    { icon: Clock, label: "Front Desk", value: company.hours },
  ];

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <header className="max-w-2xl">
          <p className="eyebrow">Get in touch</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Contact Us
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Have a question about an open role or your application status? Reach our recruitment
            team directly or send us a note below.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          {/* Left Column: Unified Location & Contact Card */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <iframe
              title="Oxford Suites Makati location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.8943978994714!2d121.0287!3d14.5547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90264a56993%3A0x2a1a5d8e1b1b1b1b!2s528%20P.%20Burgos%20St%2C%20Makati%2C%20Metro%20Manila%2C%20Philippines!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
              width="100%"
              height="250"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="divide-y divide-border p-6">
              <div className="flex items-start gap-3.5 pb-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-1 text-sm text-foreground">{company.address}</p>
                </div>
              </div>

              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3.5 py-4 last:pb-0">
                  <d.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="mt-1 block text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{d.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Inquiry Form */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">Send an inquiry</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Our HR team typically responds within 1–2 working days.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent", {
                  description: "Our HR team replies within 1–2 working days.",
                });
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Full Name</Label>
                  <Input id="cname" placeholder="Juan Dela Cruz" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cemail">Email</Label>
                  <Input id="cemail" type="email" placeholder="juan@email.com" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="csubject">Subject</Label>
                <Input id="csubject" placeholder="Application follow-up or general inquiry" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cmessage">Message</Label>
                <Textarea
                  id="cmessage"
                  rows={5}
                  placeholder="How can our recruitment team help you?"
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}