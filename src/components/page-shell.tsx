import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Vector Art", to: "/services/vector-art" },
  { label: "Digitizing", to: "/services/digitizing" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="ArtworkGuru">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-11 w-auto sm:h-14" />
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-sm font-medium text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "signup" as const }}>
                Sign up
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth">Client Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="border-b border-border bg-surface-muted">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
