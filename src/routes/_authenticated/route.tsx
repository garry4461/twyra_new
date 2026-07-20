import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Palette, LogOut, LayoutDashboard, FileUp, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, isStaff } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const session = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (session.loading) {
    return (
      <div className="min-h-screen p-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const staff = isStaff(session.roles);
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/submit", label: "Submit Job", icon: FileUp },
    { to: "/account", label: "Account", icon: UserIcon },
    ...(staff ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <Palette className="h-5 w-5 text-primary" /> ArtworkGuru
          </Link>
          <nav className="flex items-center gap-1 flex-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to}>
                  <Button variant={active ? "secondary" : "ghost"} size="sm">
                    <Icon className="h-4 w-4 mr-1.5" /> {n.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {session.profile?.plan_type === "unlimited_monthly" ? (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Unlimited</span>
            ) : (
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{session.profile?.credits_balance ?? 0}</span> credits
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
