import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Brush, Layers, Megaphone, Package, Palette, PenTool, Printer, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: "Portfolio · ArtworkGuru" },
      {
        name: "description",
        content:
          "Browse ArtworkGuru's portfolio of vector art, embroidery digitizing, mockups, branding, packaging, and illustration work — organized by complexity from simple to custom.",
      },
      { property: "og:title", content: "Portfolio · ArtworkGuru" },
      { property: "og:description", content: "Vector art, digitizing, and design samples across complexity tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Tone = "raster" | "vector" | "print" | "sep" | "ink" | "brand" | "soft";
type Tier = "Simple" | "Medium" | "Custom" | "Complex";

const CATEGORIES = [
  { id: "artwork", label: "Artwork", icon: Palette },
  { id: "merch", label: "Merch", icon: Shirt },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "branding", label: "Branding", icon: PenTool },
  { id: "print", label: "Print", icon: Printer },
  { id: "packaging", label: "Packaging", icon: Package },
  { id: "illustration", label: "Illustration", icon: Brush },
] as const;

const TIERS: Tier[] = ["Simple", "Medium", "Custom", "Complex"];

const TONES: Tone[] = ["vector", "brand", "sep", "ink", "raster", "print", "soft"];

function samplesFor(_cat: string): { tier: Tier; label: string; tone: Tone }[] {
  return TIERS.flatMap((tier, ti) =>
    Array.from({ length: 3 }).map((_, i) => ({
      tier,
      label: `${tier} · Sample ${i + 1}`,
      tone: TONES[(ti * 3 + i) % TONES.length]!,
    })),
  );
}

function Tile({ label, tone }: { label: string; tone: Tone }) {
  const bg: Record<Tone, string> = {
    raster: "linear-gradient(135deg, oklch(0.9 0.08 60), oklch(0.75 0.15 40))",
    vector: "linear-gradient(135deg, oklch(0.55 0.20 258), oklch(0.4 0.18 265))",
    print: "linear-gradient(135deg, oklch(0.2 0.05 260), oklch(0.35 0.1 260))",
    sep: "linear-gradient(135deg, oklch(0.88 0.17 95), oklch(0.75 0.15 60))",
    ink: "linear-gradient(135deg, oklch(0.14 0.03 260), oklch(0.28 0.05 260))",
    brand: "linear-gradient(135deg, oklch(0.6 0.18 250), oklch(0.75 0.12 220))",
    soft: "linear-gradient(135deg, oklch(0.96 0.03 258), oklch(0.85 0.06 258))",
  };
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
      <div className="absolute inset-0" style={{ background: bg[tone] }} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <p className="text-sm font-semibold text-white">{label}</p>
      </div>
    </div>
  );
}

function PortfolioPage() {
  const [activeTier, setActiveTier] = useState<Tier | "All">("All");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-11 w-auto sm:h-14" />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Portfolio</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Work that ships every day
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore samples by category and complexity — from simple vector redraws to fully custom illustration.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {(["All", ...TIERS] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                activeTier === t
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <Tabs defaultValue={CATEGORIES[0].id} className="w-full">
            <TabsList className="mx-auto flex h-auto w-full max-w-4xl flex-wrap justify-center gap-2 rounded-2xl bg-surface-muted p-1.5">
              {CATEGORIES.map((c) => (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-foreground"
                >
                  <c.icon className="mr-2 h-4 w-4" />
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((c) => {
              const items = samplesFor(c.id).filter(
                (s) => activeTier === "All" || s.tier === activeTier,
              );
              return (
                <TabsContent key={c.id} value={c.id} className="mt-10">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((it, i) => (
                      <Tile key={i} label={it.label} tone={it.tone} />
                    ))}
                  </div>
                  {items.length === 0 && (
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      No samples in this tier yet.
                    </p>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface-muted p-8 text-center sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to see your artwork here?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Start with 10 free credits on your first order — no card required.
          </p>
          <Button asChild size="lg" className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/">Get 10 Free Credits</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
