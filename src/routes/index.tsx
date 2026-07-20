import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Zap, Palette, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JOB_TYPES } from "@/lib/domain";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Palette className="h-5 w-5 text-primary" />
            ArtworkGuru
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/auth" search={{ mode: "signup" }}><Button>Get started</Button></Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-6">
          <Sparkles className="h-3 w-3" /> Vector art, delivered fast
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto">
          Professional artwork services on your terms
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Submit logos, layouts and complex artwork. Track credits, follow production status, and download production-ready files — all from one portal.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }}><Button size="lg">Create account</Button></Link>
          <a href="#plans"><Button size="lg" variant="outline">See plans</Button></a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Job types & credit costs</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {JOB_TYPES.map((jt) => (
            <Card key={jt.id} className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Job Type {jt.id}</span>
              </div>
              <h3 className="font-semibold">{jt.label.replace(/^Job Type \d+ \(/, "").replace(/\)$/, "")}</h3>
              <div className="mt-4 text-3xl font-bold text-primary">{jt.credits}</div>
              <div className="text-xs text-muted-foreground">credits per job</div>
              <div className="mt-3 text-xs text-muted-foreground">TAT: {jt.tat}</div>
            </Card>
          ))}
        </div>
      </section>

      <section id="plans" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Choose your plan</h2>
        <p className="text-center text-muted-foreground mb-10">Two ways to work with us.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Credit Pack</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Pay per job. Perfect for occasional needs.</p>
            <ul className="space-y-2 text-sm">
              {["Buy credits in bulk", "Type 1 = 5 credits, Type 4 = 15 credits", "Track balance & usage", "No monthly commitment"].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-8 border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">Unlimited Monthly</h3>
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Unlimited submissions. Ideal for high-volume teams.</p>
            <ul className="space-y-2 text-sm">
              {["Unlimited job submissions", "All job types included", "Priority production queue", "Dedicated QA review"].map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ArtworkGuru
        </div>
      </footer>
    </div>
  );
}
