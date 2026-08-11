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
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
              company,
              phone,
              address_line1: address1,
              address_line2: address2,
              city,
              postcode,
              country,
            },
          },

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
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="company">Company name *</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="phone">Mobile number *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={25} />
                </div>
                <div>
                  <Label htmlFor="address1">Address line 1 *</Label>
                  <Input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="address2">Address line 2</Label>
                  <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} maxLength={160} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">Town / City *</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required maxLength={80} />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Area / Post code *</Label>
                    <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required maxLength={20} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required maxLength={60} />
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

      </div>
    </div>
  );
}
