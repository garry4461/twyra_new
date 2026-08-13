import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileImage, Layers, Palette, ShieldCheck, Sparkles } from "lucide-react";

import { PageHero, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const TITLE = "Vector Art & Artwork Redraws · ArtworkGuru";
const DESCRIPTION =
  "Hand-redrawn vector artwork for print, merch and signage. Crisp, scalable AI, EPS, PDF and SVG files delivered in 12–24 hours on unlimited monthly plans or FlexCredits.";

export const Route = createFileRoute("/services/vector-art")({
  component: VectorArtPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Redrawn, never auto-traced",
    body: "Every logo is rebuilt by a designer using clean paths and true curves — no lumpy auto-trace edges, no stray anchor points.",
  },
  {
    icon: Palette,
    title: "Print-ready colour",
    body: "Black & white, greyscale gradients, spot colours or CMYK — separated properly and named so your press or RIP just works.",
  },
  {
    icon: Layers,
    title: "Type matched or outlined",
    body: "We match fonts where we can and outline text so your file opens identically on any machine.",
  },
  {
    icon: Clock,
    title: "12–24 hour turnaround",
    body: "Standard jobs come back the next working day. Complex and fully custom artwork is quoted at 2–3 days.",
  },
  {
    icon: ShieldCheck,
    title: "Checked before it ships",
    body: "Each job passes through review and QA before it lands in your dashboard, so what you download is production ready.",
  },
  {
    icon: FileImage,
    title: "Any source file",
    body: "Send a JPG, PNG, PDF, a faded scan, a screenshot or even a photo of a garment — we work from whatever you have.",
  },
];

const USE_CASES = [
  "Screen printing and DTG separations",
  "Signage, vehicle wraps and large format",
  "Embroidery-ready line art",
  "Promotional products and engraving",
  "Packaging and label artwork",
  "Brand refreshes and logo clean-ups",
];

const STEPS = [
  {
    title: "1. Submit your file",
    body: "Upload up to 10 reference files in the portal, pick your job type, colour scheme and output formats, and add any notes.",
  },
  {
    title: "2. We redraw it",
    body: "A designer rebuilds the artwork in vector, matching colours, type and proportions to your reference.",
  },
  {
    title: "3. Review & QA",
    body: "The job moves through internal review and QA. You are notified as soon as it's ready to look at.",
  },
  {
    title: "4. Download or request a revision",
    body: "Grab your files in the formats you chose. Not quite right? Raise a revision request straight from the job page.",
  },
];

const FORMATS = ["AI", "EPS", "PDF", "SVG", "CDR", "PSD", "TIFF", "JPG", "GIF", "BMP"];

function VectorArtPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Vector Art"
        title="Artwork redraws that hold up at any size"
        subtitle="Send us a low-resolution logo, a scan or a photo. We hand-redraw it into clean, scalable vector artwork that's ready for print, embroidery, signage and merch."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <b.icon className="h-6 w-6 text-brand" />
              <h2 className="mt-4 text-base font-bold">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">What we redraw</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Logos, badges, crests, mascots, typography lock-ups, patterns and full layouts — from a
              single-colour text mark right through to complex illustrated artwork.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {USE_CASES.map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">File formats you can request</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
            <h3 className="mt-8 text-base font-bold">Colour schemes</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Black &amp; White</li>
              <li>Black &amp; White with gradients</li>
              <li>Spot colours (with or without gradients)</li>
              <li>CMYK four colour</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">How a redraw runs</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-bold text-brand">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Two simple ways to buy</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Use FlexCredits and pay only for the jobs you send, or move to the Unlimited Monthly plan
            once your volume makes it the better value. No per-file surprises either way.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth" search={{ mode: "signup" as const }}>
                Start a redraw
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Talk to the team</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
