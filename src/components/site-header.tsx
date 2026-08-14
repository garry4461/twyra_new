import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SERVICES = [
  { label: "Vector Artwork", to: "/services/vector-art" as const },
  { label: "Digitizing Embroidery Services", to: "/services/digitizing" as const },
];

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Portfolio", to: "/portfolio" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

const PROMO = "Sign up offer · Get 10 free credits";

export function PromoTicker() {
  const items = Array.from({ length: 12 });
  return (
    <div className="relative overflow-hidden bg-ink py-2 text-white">
      <div className="flex w-max animate-marquee items-center gap-6 whitespace-nowrap">
        {items.map((_, i) => (
          <span key={i} className="flex items-center gap-3 text-xs font-semibold sm:text-sm">
            {PROMO}
            <Zap className="h-3.5 w-3.5 text-highlight" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <PromoTicker />
      <header
        id="top"
        className="border-b border-border/60 bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="ArtworkGuru">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-11 w-auto sm:h-14" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm font-medium text-foreground" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none">
                Services <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {SERVICES.map((s) => (
                  <DropdownMenuItem key={s.to} asChild>
                    <Link to={s.to}>{s.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <a
              href="/#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            {NAV.filter((n) => n.label !== "Home").map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-sm font-medium text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="/#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </nav>

          <div className="hidden gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "signup" as const }}>
                Sign up
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth">Client Dashboard</Link>
            </Button>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border lg:hidden"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-4 bg-foreground" />
              <span className="block h-0.5 w-4 bg-foreground" />
            </div>
          </button>
        </div>

        {open && (
          <div className="border-t border-border lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
              <p className="px-3 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Services
              </p>
              {SERVICES.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {s.label}
                </Link>
              ))}
              <Link to="/auth" search={{ mode: "signup" as const }} onClick={() => setOpen(false)}>
                <Button variant="outline" className="mt-2 w-full">
                  Sign up
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button className="mt-2 w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  Client Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
