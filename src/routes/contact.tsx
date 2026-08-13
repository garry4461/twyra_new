import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { PageHero, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

const TITLE = "Contact ArtworkGuru · Talk to our artwork team";
const DESCRIPTION =
  "Call 0330 320 3451 or email hello@artworkguru.co.uk. ArtworkGuru, 113-119 Market Street, South Normanton, DE55 2AA.";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
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

function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="Contact Us"
        subtitle="Questions about plans, credits, turnaround or a tricky job? Our team is happy to help."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <a
            href="tel:03303203451"
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand"
          >
            <Phone className="h-6 w-6 text-brand" />
            <h2 className="mt-4 text-base font-bold">Phone</h2>
            <p className="mt-2 text-sm text-muted-foreground">0330 320 3451</p>
          </a>

          <a
            href="mailto:hello@artworkguru.co.uk"
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand"
          >
            <Mail className="h-6 w-6 text-brand" />
            <h2 className="mt-4 text-base font-bold">Email</h2>
            <p className="mt-2 break-all text-sm text-muted-foreground">hello@artworkguru.co.uk</p>
          </a>

          <div className="rounded-2xl border border-border bg-card p-6">
            <MapPin className="h-6 w-6 text-brand" />
            <h2 className="mt-4 text-base font-bold">Address</h2>
            <address className="mt-2 text-sm not-italic leading-relaxed text-muted-foreground">
              113-119 Market Street
              <br />
              South Normanton
              <br />
              DE55 2AA
            </address>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface-muted p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <h2 className="text-base font-bold">Response times</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Emails are answered within one working day, and jobs already in the portal are
                tracked on their own 12–24 hour turnaround. Existing customers can also raise
                questions directly on a job page, or use the chat widget in the corner of the site.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Already a customer?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Sign in to submit a job, track progress and download completed files.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/auth">Client dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "signup" as const }}>
                Create an account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
