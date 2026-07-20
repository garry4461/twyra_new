import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/account")({
  component: Account,
});

interface Tx { id: string; amount: number; reason: string; created_at: string; }

function Account() {
  const session = useSession();
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    if (!session.user) return;
    supabase.from("credit_transactions").select("*").eq("user_id", session.user.id)
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
  }, [session.user]);

  const isUnlimited = session.profile?.plan_type === "unlimited_monthly";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">Your plan and credit history.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Current plan</div>
            {isUnlimited ? (
              <>
                <div className="text-xl font-bold">Unlimited Monthly</div>
                <p className="text-sm text-muted-foreground mt-1">You're on the Unlimited Monthly plan — submit as many jobs as you like across all types.</p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold">Credit Pack — {session.profile?.credits_balance ?? 0} credits available</div>
                <p className="text-sm text-muted-foreground mt-1">Type 1 = 5 · Type 2 = 7 · Type 3 = 10 · Type 4 = 15</p>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b"><h2 className="font-semibold">Credit history</h2></div>
        {txs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No transactions yet.</div>
        ) : (
          <div className="divide-y">
            {txs.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{t.reason}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(t.created_at), "PPp")}</div>
                </div>
                <div className={`font-semibold ${t.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-xs text-muted-foreground uppercase">Name</div>{session.profile?.full_name ?? "—"}</div>
          <div><div className="text-xs text-muted-foreground uppercase">Company</div>{session.profile?.company ?? "—"}</div>
          <div><div className="text-xs text-muted-foreground uppercase">Email</div>{session.profile?.email ?? session.user?.email}</div>
          <div><div className="text-xs text-muted-foreground uppercase">Roles</div>{session.roles.join(", ")}</div>
        </div>
      </Card>
    </div>
  );
}
