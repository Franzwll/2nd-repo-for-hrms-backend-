import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { company } from "@/data/company";

export const Route = createFileRoute("/contact")({
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
  const details = [
    { icon: Phone, label: "Phone", value: company.phone },
    { icon: Mail, label: "Email", value: company.email },
    { icon: Clock, label: "Front Desk", value: company.hours },
  ];

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <p className="eyebrow">Get in touch</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">Contact Us</h1>
        <div className="gold-rule my-6" />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {/* Map embed */}
            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="eyebrow text-[0.65rem]">Address</p>
                  <p className="text-xs text-muted-foreground">{company.address}</p>
                </div>
              </div>
              <iframe
                title="Oxford Suites Makati location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.8943978994714!2d121.0287!3d14.5547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90264a56993%3A0x2a1a5d8e1b1b1b1b!2s528%20P.%20Burgos%20St%2C%20Makati%2C%20Metro%20Manila%2C%20Philippines!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Other contact details */}
            {details.map((d) => (
              <div key={d.label} className="flex gap-3 rounded-md border border-border bg-card p-5">
                <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="eyebrow">{d.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Send an inquiry</h2>
              <form
                className="mt-5 space-y-4"
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
                    <Input id="cname" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cemail">Email</Label>
                    <Input id="cemail" type="email" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="csubject">Subject</Label>
                  <Input id="csubject" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cmessage">Message</Label>
                  <Textarea id="cmessage" rows={6} required />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}
