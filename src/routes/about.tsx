import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Globe2, HeartHandshake, Target, Users } from "lucide-react";

import { PageHero, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const TITLE = "About ArtworkGuru · Artwork Studio for Print & Merch";
const DESCRIPTION =
  "ArtworkGuru is an outsourced artwork studio for print, merch and embroidery businesses — vector redraws and digitizing handled by designers, tracked in one portal.";

export const Route = createFileRoute("/about")({
  component: AboutPage,
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

const VALUES = [
  {
    icon: Target,
    title: "Production-first thinking",
    body: "Everything we make is judged by one question: will it run cleanly on the press or the machine?",
  },
  {
    icon: Clock,
    title: "Turnaround you can quote on",
    body: "Standard jobs return in 12–24 hours so you can promise your own customers a date with confidence.",
  },
  {
    icon: Users,
    title: "A studio, not a marketplace",
    body: "The same designers work on your account, so your house style and preferences stick between jobs.",
  },
  {
    icon: HeartHandshake,
    title: "Straightforward pricing",
    body: "Unlimited monthly or FlexCredits that never expire. No per-file add-ons, no surprise invoices.",
  },
  {
    icon: Globe2,
    title: "Built for busy shops",
    body: "Submit, track, review and download from one portal — no email threads hunting for the latest file.",
  },
];

const STATS = [
  { value: "12–24h", label: "Standard turnaround" },
  { value: "4-stage", label: "Production, review, QA, release" },
  { value: "Unlimited", label: "Revisions on live jobs" },
];

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About"
        title="Your artwork department, without the overhead"
        subtitle="ArtworkGuru exists so print, merch and embroidery businesses can say yes to every job that lands — without hiring a studio or losing evenings to redraws."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            Most artwork problems arrive the same way: a customer sends a logo pulled off a website,
            a photo of an old garment, or a PDF nobody can edit — and it's needed on press tomorrow.
            Somebody in your team ends up redrawing it between quotes and production runs.
          </p>
          <p>
            We take that work off your desk. Send us whatever you've got and our designers rebuild it
            properly: clean vector paths for print and signage, or hand-punched stitch files set up
            for the fabric you're actually running. Every job passes through review and QA before it
            reaches you, so you're not the one catching mistakes.
          </p>
          <p>
            The portal keeps it all in one place. Submit a job with your colour scheme, output formats
            and reference files, watch it move from production to review to completed, then download
            or raise a revision from the job page. Your credits and plan are visible from your
            dashboard, so you always know where you stand.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p className="text-2xl font-extrabold text-brand">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold sm:text-3xl">What we care about</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                <v.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-4 text-base font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">See the work first</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Browse recent vector and embroidery samples, or get in touch and we'll talk through your
          volume and the plan that fits.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/portfolio">View our work</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
