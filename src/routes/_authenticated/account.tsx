import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { STATUS_LABEL, STATUS_COLOR, jobTypeLabel, planLabel } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/account")({
  component: Account,
});

interface Tx { id: string; amount: number; reason: string; created_at: string; }
interface QueueJob { id: string; job_reference: string | null; job_type: number; status: string; created_at: string; }

function Account() {
  const session = useSession();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [queue, setQueue] = useState<QueueJob[]>([]);

  const isAdmin = session.roles.includes("admin");
  const isDesigner = !isAdmin && (session.roles.includes("production") || session.roles.includes("qa"));
  const isCustomer = !isAdmin && !isDesigner;

  useEffect(() => {
    if (!session.user) return;
    if (isDesigner) {
      supabase.from("jobs")
        .select("id, job_reference, job_type, status, created_at")
        .in("status", ["submitted", "under_production", "in_review"])
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => setQueue((data ?? []) as QueueJob[]));
      return;
    }
    supabase.from("credit_transactions").select("*").eq("user_id", session.user.id)
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
  }, [session.user, isDesigner]);

  const isUnlimited = session.profile?.plan_type === "unlimited_monthly";

  const activeQueue = queue.filter((j) => j.status === "submitted" || j.status === "under_production");
  const reviewQueue = queue.filter((j) => j.status === "in_review");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          {isDesigner ? "Your assigned jobs and profile." : "Your plan and credit history."}
        </p>
      </div>

      {isDesigner ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10"><Palette className="h-6 w-6 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">In production queue</div>
                  <div className="text-2xl font-bold">{activeQueue.length}</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10"><Palette className="h-6 w-6 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Awaiting review</div>
                  <div className="text-2xl font-bold">{reviewQueue.length}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-semibold">Jobs assigned to designers</h2>
              <Link to="/admin"><Button size="sm" variant="outline">Open full queue</Button></Link>
            </div>
            {queue.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No open jobs in the queue.</div>
            ) : (
              <div className="divide-y">
                {queue.slice(0, 10).map((j) => (
                  <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center p-4 hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium">{j.job_reference || `Job ${j.id.slice(0, 8)}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {jobTypeLabel(j.job_type, (j as { job_category?: string }).job_category)} · {formatDistanceToNow(new Date(j.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLOR[j.status]}`}>{STATUS_LABEL[j.status]}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Current plan</div>
                {isUnlimited ? (
                  <>
                    <div className="text-xl font-bold">{planLabel(session.profile?.plan_type, session.profile?.plan_name)}</div>
                    <p className="text-sm text-muted-foreground mt-1">Unlimited monthly — submit as many jobs as you like across all types.</p>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold">
                      {planLabel(session.profile?.plan_type, session.profile?.plan_name, session.profile?.credits_balance ?? 0)} — {session.profile?.credits_balance ?? 0} credits available
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Simple Vector = 1 · Medium Vector = 2 · Complex/Custom Vector = up to 4 · Simple Digitizing = 2 · Complex Digitizing = up to 4</p>
                  </>
                )}

              </div>
            </div>
          </Card>

          {isCustomer && (
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
          )}
        </>
      )}

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

