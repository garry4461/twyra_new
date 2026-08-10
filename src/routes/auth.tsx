import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ShieldCheck, User as UserIcon, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ensureDemoUsers, DEMO_PASSWORD, DEMO_USERS } from "@/lib/demo-users.functions";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

const ROLE_META: Record<string, { label: string; desc: string; icon: typeof ShieldCheck }> = {
  admin: { label: "Admin", desc: "See every job, every customer, adjust credits & roles.", icon: ShieldCheck },
  customer: { label: "Customer", desc: "Submit jobs, track credits, request revisions.", icon: UserIcon },
  designer: { label: "Designer", desc: "Pick up jobs, upload final files, move status.", icon: Palette },
};

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName, company } },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin(key: "admin" | "customer" | "designer") {
    setDemoLoading(key);
    try {
      const user = DEMO_USERS.find((u) => u.key === key)!;
      // First attempt — assumes users already seeded
      let { error } = await supabase.auth.signInWithPassword({ email: user.email, password: DEMO_PASSWORD });
      if (error) {
        toast.message("Preparing demo accounts…");
        await ensureDemoUsers();
        ({ error } = await supabase.auth.signInWithPassword({ email: user.email, password: DEMO_PASSWORD }));
        if (error) throw error;
      }
      toast.success(`Signed in as ${ROLE_META[key].label}`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(`Demo login failed: ${(err as Error).message}`);
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <Card className="p-8">
          <Link to="/" className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-16 w-auto" />
          </Link>

          <h1 className="text-2xl font-bold mb-1">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin" ? "Access your artwork portal" : "Start submitting jobs today"}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </Card>

        <Card className="p-8 bg-ink text-white border-transparent">
          <p className="text-xs font-bold uppercase tracking-widest text-highlight">Try the demo</p>
          <h2 className="mt-2 text-2xl font-extrabold">Three roles, one click</h2>
          <p className="mt-2 text-sm text-white/70">
            Skip sign-up and log in as any role to test the full workflow. Sample accounts are provisioned automatically the first time you click.
          </p>
          <div className="mt-6 space-y-3">
            {(["admin", "customer", "designer"] as const).map((key) => {
              const meta = ROLE_META[key];
              const user = DEMO_USERS.find((u) => u.key === key)!;
              const Icon = meta.icon;
              return (
                <button
                  key={key}
                  onClick={() => demoLogin(key)}
                  disabled={demoLoading !== null}
                  className="group w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-highlight text-highlight-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{meta.label}</p>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                          {user.email}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/70">{meta.desc}</p>
                    </div>
                    <span className="text-xs font-semibold text-highlight">
                      {demoLoading === key ? "Signing in…" : "Log in →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-white/50">
            Password for every demo account: <span className="font-mono text-white/80">{DEMO_PASSWORD}</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
