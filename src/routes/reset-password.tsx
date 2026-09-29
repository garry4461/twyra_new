import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | ArtworkGuru" },
      { name: "description", content: "Choose a new password for your ArtworkGuru account." },
      { property: "og:title", content: "Set a new password | ArtworkGuru" },
      { property: "og:description", content: "Choose a new password for your ArtworkGuru account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The recovery link lands here with a session; confirm it is a valid session.
    supabase.auth.getSession().then(({ data }) => {
      setRecovery(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // End the recovery session so the user signs in fresh with the new password.
      await supabase.auth.signOut();
      toast.success("Password updated — please sign in with your new password.");
      navigate({ to: "/auth" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <Link to="/" className="flex items-center justify-center mb-6">
            <img src="/logo.svg" alt="ArtworkGuru" className="h-16 w-auto" />
          </Link>

          {checking ? (
            <p className="text-sm text-muted-foreground text-center">Checking your reset link…</p>
          ) : recovery ? (
            <>
              <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Choose a new password for your account.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      maxLength={128}
                      className="pr-11"
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={loading}>
                  {loading ? "Please wait..." : "Update password"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Link expired</h1>
              <p className="text-sm text-muted-foreground mb-6">
                This password reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link to="/auth" className="text-sm text-brand hover:underline">
                Back to sign in
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
