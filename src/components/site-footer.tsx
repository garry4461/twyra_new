import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SERVICES: { label: string; to: string }[] = [
  { label: "Artwork Services", to: "/services/vector-art" },
  { label: "Digitising Embroidery", to: "/services/digitizing" },
];

const COMPANY: { label: string; to: string }[] = [
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Contact", to: "/contact" },
];

function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          toast.error("Please enter a valid email address.");
          return;
        }
        setEmail("");
        toast.success("You're subscribed — thanks for joining the ArtworkGuru newsletter.");
      }}
    >
      <p className="text-sm font-bold">Newsletter</p>
      <p className="mt-4 text-sm text-muted-foreground">
        Artwork tips, turnaround updates and occasional offers. No spam.
      </p>
      <div className="mt-3 flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.co.uk"
          aria-label="Email address"
        />
        <Button type="submit" size="icon" aria-label="Subscribe">
          <Mail className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2" aria-label="ArtworkGuru">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-11 w-auto sm:h-14" />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Vector art and embroidery digitizing on unlimited monthly plans or FlexCredits.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold">Services</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SERVICES.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Newsletter />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ArtworkGuru. All rights reserved.</p>
          <p>Made for print, merch, and embroidery brands worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
