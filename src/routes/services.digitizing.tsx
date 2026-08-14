import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Layers, Ruler, Scissors, ShieldCheck, Shirt } from "lucide-react";

import { PageHero, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const TITLE = "Embroidery Digitizing · ArtworkGuru";
const DESCRIPTION =
  "Hand-punched embroidery digitizing with clean stitch paths, correct pull compensation and tidy trims. DST, PES, EMB, JEF and more, delivered in 12–24 hours.";

export const Route = createFileRoute("/services/digitizing")({
  component: DigitizingPage,
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
    icon: Scissors,
    title: "Hand-punched, not converted",
    body: "Digitizers build every stitch path by hand — no one-click conversion that runs the machine ragged and shreds the fabric.",
  },
  {
    icon: Ruler,
    title: "Set up for your fabric",
    body: "Underlay, density and pull compensation are set for the garment you're running: polo piqué, fleece, cap fronts, towelling or performance wear.",
  },
  {
    icon: Layers,
    title: "Efficient stitch counts",
    body: "Sensible sequencing and minimal jumps keep run times and thread breaks down, so production stays predictable.",
  },
  {
    icon: Shirt,
    title: "Small text that reads",
    body: "Lettering is drawn to stay legible at size, with the right column widths rather than blobs of thread.",
  },
  {
    icon: Clock,
    title: "12–24 hour turnaround",
    body: "Standard designs come back next working day. Complex and custom pieces are quoted at 2–3 days.",
  },
  {
    icon: ShieldCheck,
    title: "Sewn-out checks",
    body: "Every file goes through review and QA before release, and revisions are free to raise from the job page.",
  },
];

const PLACEMENTS = [
  "Left chest and pocket logos",
  "Cap fronts, sides and backs",
  "Jacket backs and large panels",
  "Sleeves and cuffs",
  "Bags, towels and workwear",
  "3D puff and appliqué",
];

const FORMATS = ["DST", "PES", "EMB", "JEF", "EXP", "VP3", "XXX", "HUS", "PDF preview"];

const BRIEF = [
  "Design size (width × height) and placement",
  "Garment or fabric type",
  "Thread brand and colour references, if you have them",
  "Any text that must stay legible",
  "3D puff, appliqué or standard flat stitch",
];

function DigitizingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Embroidery Digitizing"
        title="Stitch files that run clean"
        subtitle="We turn your logo or artwork into a hand-punched embroidery file, built around your fabric, size and machine — so it sews smoothly instead of fighting the hoop."
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
            <h2 className="text-2xl font-extrabold sm:text-3xl">Placements we digitize</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A design is digitized for a specific size and position. Tell us where it's going and we
              build the file around it — resizing later is never a straight swap.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {PLACEMENTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Machine formats</h2>
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
            <h3 className="mt-8 text-base font-bold">What to include in your brief</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {BRIEF.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Priced on the same two plans</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Digitizing uses the same FlexCredits balance as vector work, or is included in the Unlimited
          Monthly plan. Track every job and credit from your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/auth" search={{ mode: "signup" as const }}>
              Send a digitizing job
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Talk to the team</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
