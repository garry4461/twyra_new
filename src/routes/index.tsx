import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ComponentType } from "react";
import {
  ArrowRight,
  Brush,
  Check,
  CheckCircle2,
  Clock,
  Megaphone,
  MessageSquare,
  Package,
  Palette,
  PenTool,
  Printer,
  Rocket,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteHeader />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <ServicesTabs />
        <Pricing />
        <CreditModel />
        <Testimonials />
        <FAQ />
        <ClientDashboardCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------------- Header -------------------------- */

function Logo({ variant = "default" }: { variant?: "default" | "onDark" }) {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="ArtworkGuru">
      <img
        src="/logo.svg"
        alt="ArtworkGuru"
        className={`h-11 w-auto sm:h-14 ${variant === "onDark" ? "brightness-0 invert" : ""}`}
      />
    </a>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const nav = [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header
      id="top"
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden gap-2 md:flex">
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm">
              Client Dashboard
            </Button>
          </Link>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-md border border-border md:hidden"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-4 bg-foreground" />
            <span className="block h-0.5 w-4 bg-foreground" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full bg-brand text-brand-foreground hover:bg-brand/90">
                Client Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------------- Hero -------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-highlight" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--color-brand) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-6 rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold text-brand hover:bg-brand-soft">
            Trusted by 1,200+ merch & print brands
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Scalable Vector Art &{" "}
            <span className="text-brand">Embroidery Digitizing</span>{" "}
            For Your Business.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Speed, accuracy, and hassle-free handoffs for merchandise businesses,
            e-commerce stores, suppliers, and distributors. Buy credits, submit jobs,
            get production-ready files back — fast.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-[var(--shadow-pop)]"
            >
              <a href="#pricing">
                View Monthly Plans <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-background hover:bg-muted"
            >
              <a href="#credits">Try FlexCredits</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> 100% vector guaranteed
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand" /> 4–24hr turnaround
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" /> Unlimited revisions
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const logos = ["PrintCo","MerchWorks","StitchLab","BrandForge","TeeHouse","PatchPro","InkHaus","ThreadLine","PixelPress","FoldCraft"];
  const loop = [...logos, ...logos];
  return (
    <div className="border-y border-border bg-surface-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Powering artwork for
        </span>
        <div
          className="relative w-full overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap will-change-transform">
            {loop.map((l, i) => (
              <span key={`${l}-${i}`} className="text-sm font-bold tracking-tight text-muted-foreground/70">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Features -------------------------- */

function Features() {
  const features = [
    { icon: Palette, title: "Pixel-Perfect Vector Art", desc: "Clean, scalable SVG/AI/EPS files ready for print, screens, and embroidery." },
    { icon: Zap, title: "Fast Turnaround", desc: "Most jobs delivered in under 24 hours — with 4-hour rush available." },
    { icon: Users, title: "Dedicated Designers", desc: "A specialist assigned to your brand's queue for consistent quality." },
    { icon: MessageSquare, title: "Direct Chat", desc: "Message your designer in-app. No email threads, no back-and-forth." },
    { icon: Sparkles, title: "Unlimited Revisions", desc: "We iterate until it's perfect. Credits only charge on final approval." },
    { icon: Clock, title: "Always Available", desc: "Global team means your queue keeps moving while you sleep." },
  ];
  return (
    <section className="bg-surface-muted py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Everything you need"
          title="A design partner built for print & merch"
          subtitle="One workflow for vector art, digitizing, and mockups — priced in transparent credits."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Credit Model -------------------------- */

const CREDIT_RATES = { vector: 1, simple: 2, complex: 4 } as const;

function CreditModel() {
  const [vector, setVector] = useState(4);
  const [simple, setSimple] = useState(2);
  const [complex, setComplex] = useState(1);

  const totalCredits = useMemo(
    () => vector * CREDIT_RATES.vector + simple * CREDIT_RATES.simple + complex * CREDIT_RATES.complex,
    [vector, simple, complex],
  );

  const suggested = useMemo(() => {
    if (totalCredits <= 10) return { name: "Starter Pack", credits: 10, price: 99 };
    if (totalCredits <= 50) return { name: "Growth Pack", credits: 50, price: 449 };
    return { name: "Enterprise Pack", credits: 200, price: 1499 };
  }, [totalCredits]);

  const pricePerCredit = suggested.price / suggested.credits;
  const estimate = Math.round(totalCredits * pricePerCredit);

  return (
    <section id="credits" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FlexCredits · Pay as you go"
          title="Monthly plan not for you? Try FlexCredits instead."
          subtitle="A lower-risk way to start. Buy a credit pack, submit jobs, and only pay for what you use — no subscription, no expirations."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ol className="space-y-4">
              {[
                { n: 1, t: "Buy Credits", d: "Pick a pack that fits your monthly volume — pay once, use anytime." },
                { n: 2, t: "Submit a Job", d: "Upload artwork, choose service type, and add notes for your designer." },
                { n: 3, t: "Deduct on Delivery", d: "Credits only get deducted when you approve the final file." },
              ].map((s) => (
                <li key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-highlight font-bold text-highlight-foreground">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold">{s.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full"
                style={{
                  background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-brand) 25%, transparent), transparent)",
                }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand">Credit Calculator</p>
                  <h3 className="mt-1 text-xl font-bold">Estimate your monthly credits</h3>
                </div>
                <Badge className="rounded-full bg-highlight text-highlight-foreground hover:bg-highlight">Live</Badge>
              </div>

              <div className="mt-6 space-y-6">
                <CalcRow label="Vector Redraws" hint="1 credit each" value={vector} onChange={setVector} max={30} />
                <CalcRow label="Simple Digitizing" hint="2 credits each" value={simple} onChange={setSimple} max={20} />
                <CalcRow label="Complex Digitizing" hint="3–4 credits each" value={complex} onChange={setComplex} max={15} />
              </div>

              <div className="mt-8 grid gap-4 rounded-2xl bg-surface-muted p-5 sm:grid-cols-3">
                <Stat label="Total Credits" value={`${totalCredits}`} />
                <Stat label="Recommended" value={suggested.name} />
                <Stat label="Est. Price" value={`$${estimate}`} accent />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Get started with our{" "}
                <span className="font-semibold text-foreground">{suggested.credits} Credits {suggested.name}</span>{" "}
                for only <span className="font-semibold text-foreground">${suggested.price}</span>.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                  <a href="#pricing">
                    Buy {suggested.name} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#dashboard">Talk to sales</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalcRow({ label, hint, value, onChange, max }: { label: string; hint: string; value: number; onChange: (v: number) => void; max: number; }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="rounded-md bg-brand-soft px-2.5 py-1 text-sm font-bold text-brand tabular-nums">{value}</span>
      </div>
      <Slider value={[value]} min={0} max={max} step={1} onValueChange={(v) => onChange(v[0] ?? 0)} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${accent ? "text-brand" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

/* -------------------------- How It Works -------------------------- */

function HowItWorks() {
  const steps = [
    { n: 1, icon: Rocket, title: "Start a Request", desc: "Upload your artwork, choose the service, and let us know your deadline." },
    { n: 2, icon: Palette, title: "Designer Assigned", desc: "Your dedicated specialist begins work — you can chat directly with them." },
    { n: 3, icon: CheckCircle2, title: "Approve & Deploy", desc: "Receive production-ready files. Credits only deduct on approval." },
  ];
  return (
    <section id="how" className="border-y border-border bg-surface-muted py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="How It Works" title="Three simple steps from brief to production" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-highlight text-sm font-extrabold text-highlight-foreground">{s.n}</span>
                <s.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Services Tabs -------------------------- */

type Tone = "raster" | "vector" | "print" | "sep" | "ink" | "brand" | "soft";
type PortfolioCategory = { id: string; label: string; icon: ComponentType<{ className?: string }>; title: string; bullets: string[]; tiles: { label: string; tone: Tone }[]; };

const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { id: "artwork", label: "Artwork", icon: Palette, title: "Vector Artwork & Redraws",
    bullets: ["Clean re-draws from any raster source (PNG, JPG, sketch)","Delivered in AI, EPS, SVG, and PDF","Print-ready color separations available","1 credit per redraw"],
    tiles: [{label:"Sports Crest",tone:"vector"},{label:"Vintage Badge",tone:"raster"},{label:"Line Art",tone:"print"},{label:"Color Sep",tone:"sep"}] },
  { id: "merch", label: "Merch", icon: Shirt, title: "Merchandise & Apparel",
    bullets: ["T-shirts, hoodies, caps, bags, and accessories","Screen-print and DTG-ready separations","Embroidery digitizing for left-chest to full-back","Multi-color and multi-placement variants"],
    tiles: [{label:"T-Shirt Front",tone:"raster"},{label:"Hoodie Back",tone:"ink"},{label:"Cap Front",tone:"brand"},{label:"Tote Bag",tone:"soft"}] },
  { id: "marketing", label: "Marketing", icon: Megaphone, title: "Marketing Collateral",
    bullets: ["Social banners, ads, and email headers","Presentation decks and pitch templates","Landing-page hero graphics and icons","On-brand and campaign-ready"],
    tiles: [{label:"Social Ad",tone:"brand"},{label:"Email Header",tone:"soft"},{label:"Web Banner",tone:"vector"},{label:"Story Post",tone:"sep"}] },
  { id: "branding", label: "Branding", icon: PenTool, title: "Brand Identity & Logos",
    bullets: ["Logo redraw, cleanup, and refresh","Full brand mark suites and lockups","Color palette and typography systems","Style guides and usage sheets"],
    tiles: [{label:"Primary Mark",tone:"ink"},{label:"Wordmark",tone:"vector"},{label:"Monogram",tone:"brand"},{label:"Style Guide",tone:"soft"}] },
  { id: "print", label: "Print", icon: Printer, title: "Print Production Files",
    bullets: ["Business cards, flyers, posters, and signage","CMYK setup with bleed and trim marks","Screen-print separations & spot-color prep","Pre-flight checked, printer-ready PDFs"],
    tiles: [{label:"Business Card",tone:"print"},{label:"Flyer A5",tone:"raster"},{label:"Poster",tone:"vector"},{label:"Signage",tone:"ink"}] },
  { id: "packaging", label: "Packaging", icon: Package, title: "Packaging & Labels",
    bullets: ["Dielines, mockups, and unwrap views","Boxes, pouches, jars, and shipping mailers","Barcode, nutrition, and compliance layout","Photorealistic packaging renders"],
    tiles: [{label:"Box Dieline",tone:"soft"},{label:"Pouch",tone:"brand"},{label:"Bottle Label",tone:"sep"},{label:"Mailer",tone:"ink"}] },
  { id: "illustration", label: "Illustration", icon: Brush, title: "Custom Illustration",
    bullets: ["Character, mascot, and product illustration","Editorial and storytelling artwork","Line, flat, and fully painted styles","Multi-scene and consistent series work"],
    tiles: [{label:"Mascot",tone:"brand"},{label:"Editorial",tone:"raster"},{label:"Line Art",tone:"print"},{label:"Scene",tone:"sep"}] },
];

function ServicesTabs() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Portfolio" title="Every category of design our team ships" subtitle="Click a category to explore recent work from our studio." />
        <div className="mt-12">
          <Tabs defaultValue={PORTFOLIO_CATEGORIES[0]!.id} className="w-full">
            <TabsList className="mx-auto flex h-auto w-full max-w-4xl flex-wrap justify-center gap-2 rounded-2xl bg-surface-muted p-1.5">
              {PORTFOLIO_CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="rounded-xl data-[state=active]:bg-brand data-[state=active]:text-brand-foreground">
                  <c.icon className="mr-2 h-4 w-4" />
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {PORTFOLIO_CATEGORIES.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-10">
                <ServicePanel title={c.title} bullets={c.bullets} tiles={c.tiles} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function ServicePanel({ title, bullets, tiles }: { title: string; bullets: string[]; tiles: { label: string; tone: Tone }[]; }) {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <ul className="mt-5 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-muted-foreground">{b}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-7 bg-brand text-brand-foreground hover:bg-brand/90" asChild>
          <a href="#pricing">View Pricing <ArrowRight className="ml-2 h-4 w-4" /></a>
        </Button>
      </div>
      <div className="lg:col-span-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <PortfolioTile key={t.label} label={t.label} tone={t.tone} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioTile({ label, tone }: { label: string; tone: Tone }) {
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
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 0.5px, transparent 1px), radial-gradient(circle at 70% 70%, white 0.5px, transparent 1px)",
          backgroundSize: "18px 18px, 22px 22px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <p className="text-sm font-semibold text-white">{label}</p>
      </div>
    </div>
  );
}

/* -------------------------- Pricing -------------------------- */

type Plan = { name: string; price: string; priceSuffix?: string; meta: string; desc: string; features: string[]; cta: string; highlight?: boolean; };

const CREDIT_PLANS: Plan[] = [
  { name: "Starter Credits", price: "$99", priceSuffix: "one-time", meta: "10 credits · ~5–7 designs",
    desc: "The lowest-risk way to try us. No subscription, no commitment.",
    features: ["10 credits, never expire","Covers ~5–7 designs (mix of vector & digitizing)","24-hour standard turnaround","Unlimited revisions","Email & chat support"],
    cta: "Buy 10 Credits" },
  { name: "Growth Credits", price: "$449", priceSuffix: "one-time", meta: "50 credits · ~25–35 designs",
    desc: "Best value pay-as-you-go pack for scaling brands.",
    features: ["50 credits — save 10%","Priority 12-hour turnaround","Unlimited revisions","Direct designer chat","Dedicated account manager"],
    cta: "Buy 50 Credits", highlight: true },
  { name: "Enterprise Credits", price: "Custom", meta: "200+ credits",
    desc: "High-volume allocation for teams, suppliers & distributors.",
    features: ["Custom credit allocation","4-hour rush lane","White-label file delivery","API + Shopify integration","SLAs & onboarding"],
    cta: "Contact Sales" },
];

const MONTHLY_PLANS: Plan[] = [
  { name: "Essential Plan", price: "£699", priceSuffix: "/month", meta: "Truly unlimited · no catch",
    desc: "Experience unlimited design. Our base package with an easy dashboard to submit your jobs — a great start.",
    features: ["Unlimited Jobs","Unlimited Revisions","Source Files Included","Unlimited Brands","Customer Support","1 Active Request","1 Rush Job included"],
    cta: "Get Started" },
  { name: "Enterprise Plan", price: "£1,399", priceSuffix: "/month", meta: "Everything in Essential",
    desc: "More active requests, more rush jobs. Essentials plan plus a dedicated designer and account manager.",
    features: ["Everything in Essential","Dedicated Designer","Account Manager","24×5 Customer Support","3 Active Requests","4 Rush Jobs Per Month","Unlimited Jobs & Revisions"],
    cta: "Get Started", highlight: true },
  { name: "Enterprise PRO Plan", price: "£1,750", priceSuffix: "/month", meta: "Full design team + assistance",
    desc: "Our most successful and versatile plan. A full design team with additional assistance, working inside your team.",
    features: ["Email Management & Assistance","Connect via Chat (UK hours)","No More Dashboard — hand it off","Cloud Storage — 2TB included","Scalable team on demand","Everything in Enterprise"],
    cta: "Get Started" },
];

function Pricing() {
  const [mode, setMode] = useState<"credits" | "monthly">("monthly");
  const plans = mode === "credits" ? CREDIT_PLANS : MONTHLY_PLANS;

  return (
    <section id="pricing" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Unlimited monthly plans — with FlexCredits as a low-risk starter"
          subtitle="Most teams choose a monthly plan for truly unlimited output. Not ready to commit? Skip below to FlexCredits and start with just $99."
        />

        <div className="mt-8 flex justify-center">
          <div role="tablist" aria-label="Pricing mode" className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow-card)]">
            <PricingToggle active={mode === "monthly"} onClick={() => setMode("monthly")} label="Monthly Plans" hint="Truly unlimited" />
            <PricingToggle active={mode === "credits"} onClick={() => setMode("credits")} label="FlexCredits" hint="Pay-as-you-go" />
          </div>
        </div>

        {mode === "credits" && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">10 credits = ~5–7 designs.</span>{" "}
            1 vector redraw = 1 credit · simple digitizing = 2 · complex digitizing = 3–4.
          </p>
        )}
        {mode === "monthly" && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Truly unlimited</span> — unlimited jobs, unlimited revisions, source files included. No credit caps, no catch. Cancel anytime.
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-3xl border p-8 transition ${p.highlight ? "border-transparent bg-ink text-white shadow-[var(--shadow-pop)] lg:-translate-y-2" : "border-border bg-card shadow-[var(--shadow-card)]"}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">Most Popular</span>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest ${p.highlight ? "text-highlight" : "text-brand"}`}>{p.meta}</p>
              <h3 className="mt-2 text-2xl font-extrabold">{p.name}</h3>
              <p className={`mt-2 text-sm ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                {p.priceSuffix && (
                  <span className={`text-sm ${p.highlight ? "text-white/60" : "text-muted-foreground"}`}>{p.priceSuffix}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.highlight ? "bg-highlight text-highlight-foreground" : "bg-brand-soft text-brand"}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className={p.highlight ? "text-white/85" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${p.highlight ? "bg-highlight text-highlight-foreground hover:bg-highlight/90" : "bg-brand text-brand-foreground hover:bg-brand/90"}`}
                onClick={() => toast.success(`${p.name} selected`, { description: "Sign in to purchase." })}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Not ready for a subscription? Explore{" "}
          <a href="#credits" className="font-semibold text-brand underline-offset-4 hover:underline">FlexCredits below</a>{" "}
          — start with 10 credits for $99 and upgrade to a monthly plan anytime.
        </p>
      </div>
    </section>
  );
}

function PricingToggle({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string; }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-left transition sm:px-5 ${active ? "bg-brand text-brand-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={`block text-[11px] ${active ? "text-brand-foreground/80" : "text-muted-foreground"}`}>{hint}</span>
    </button>
  );
}

/* -------------------------- Testimonials -------------------------- */

function Testimonials() {
  const items = [
    { quote: "ArtworkGuru's credit model changed how we run production. We batch jobs and the turnaround is unreal.", name: "Alexis Moreno", role: "Owner, TeeHouse Co." },
    { quote: "The digitizing quality is the best we've used. Sew-outs come out clean on the first run every time.", name: "Priya Shah", role: "Ops Lead, StitchLab" },
    { quote: "We ship 400+ SKUs a month. Their mockups keep our Shopify store looking premium without effort.", name: "Jamal Rivera", role: "Founder, MerchWorks" },
  ];
  return (
    <section className="bg-brand py-20 text-brand-foreground sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-highlight">Loved by print companies</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">The workflow print teams stick with</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-highlight text-highlight" />))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/90">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold">{t.name.charAt(0)}</span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- FAQ -------------------------- */

function FAQ() {
  const faqs = [
    { q: "Do credits expire?", a: "No. Credits you purchase stay on your account until you use them." },
    { q: "How quickly can I expect artwork back?", a: "Most jobs are delivered within 24 hours. Growth and Enterprise plans include priority queues (12h / 4h)." },
    { q: "What file formats do you deliver?", a: "Vector: AI, EPS, SVG, PDF. Digitizing: DST, PES, EMB, JEF. Mockups: PNG, JPG, PSD." },
    { q: "Do you offer unlimited revisions?", a: "Yes. Credits are only deducted when you approve the final file." },
    { q: "Can I switch packages later?", a: "Absolutely. Top up whenever, upgrade whenever — unused credits carry over." },
    { q: "What if I don't love a design?", a: "We'll iterate until it's right, or refund the credit on genuine misses." },
  ];
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" subtitle="Can't find what you're looking for? Reach out and we'll help." />
        <div className="mt-10 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="px-4 text-left text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="px-4 text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Client Dashboard CTA -------------------------- */

function ClientDashboardCTA() {
  const [form, setForm] = useState({ name: "", email: "", company: "", brief: "" });
  const navigate = useNavigate();
  return (
    <section id="dashboard" className="pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-[var(--shadow-pop)] sm:p-12">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-brand) 45%, transparent), transparent)" }} />
          <div aria-hidden className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full"
            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-highlight) 35%, transparent), transparent)" }} />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-highlight">Client Dashboard</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Ready to scale your <span className="text-highlight">design capacity?</span></h2>
              <p className="mt-4 max-w-md text-white/80">Create your account, get 5 bonus credits, and start shipping artwork the same day.</p>
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                {["Free onboarding & 5 bonus credits","Real-time job status & designer chat","Team seats & shared credit balance"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-highlight" />{x}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/auth" search={{ mode: "signup" }}>
                  <Button className="bg-highlight text-highlight-foreground hover:bg-highlight/90">Open Client Dashboard</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">Sign in</Button>
                </Link>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.email || !form.name) { toast.error("Please add your name and email."); return; }
                toast.success("You're in!", { description: "Redirecting to your dashboard…" });
                navigate({ to: "/auth", search: { mode: "signup" } });
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <CTAField id="name" label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <CTAField id="email" label="Work email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <div className="sm:col-span-2">
                  <CTAField id="company" label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="brief" className="text-white/80">What do you need designed?</Label>
                  <Textarea id="brief" value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })}
                    placeholder="e.g. 15 vector redraws + 10 embroidery digitizing / month"
                    className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-highlight" />
                </div>
              </div>
              <Button type="submit" className="mt-5 w-full bg-highlight text-highlight-foreground hover:bg-highlight/90">Start for free</Button>
              <p className="mt-3 text-center text-xs text-white/60">No credit card required.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTAField({ id, label, value, onChange, type = "text" }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return (
    <div>
      <Label htmlFor={id} className="text-white/80">{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-highlight" />
    </div>
  );
}

/* -------------------------- Footer -------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Vector art, embroidery digitizing, and mockups on a flexible credit model.
          </p>
        </div>
        <FooterCol title="Services" links={["Vector Art", "Digitizing", "Mockups", "Patches"]} />
        <FooterCol title="Company" links={["About", "Portfolio", "Contact", "Careers"]} />
        <FooterCol title="Support" links={["Help Center", "Privacy", "Terms", "Status"]} />
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

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (<li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>))}
      </ul>
    </div>
  );
}

/* -------------------------- Shared -------------------------- */

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string; }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (<p className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</p>)}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && (<p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>)}
    </div>
  );
}
