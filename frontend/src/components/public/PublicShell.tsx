import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Chatbot } from "@/components/public/Chatbot";
import { Button } from "@/components/ui/button";
import { company } from "@/data/company";

const links = [
  { label: "Home", to: "/" },
  { label: "Find Jobs", to: "/jobs" },
  { label: "About Us", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <Logo mark="maroon" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                activeProps={{ className: "text-primary font-medium" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile: Login + Burger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link to="/login">Login</Link>
            </Button>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile burger dropdown */}
        {menuOpen && (
          <div className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
          <div className="md:col-span-2">
            <Logo mark="maroon" />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">{company.overview}</p>
          </div>

          <div>
            <p className="eyebrow mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Contact</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {company.address}
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                {company.phone}
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                {company.email}
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {company.socials.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border">
          <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground md:px-8">
            © {new Date().getFullYear()} {company.name}. Recruitment Management prototype with
            spaCy-based NLP and Named Entity Recognition applicant screening.
          </p>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
