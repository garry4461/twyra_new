import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Plus, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, STATUS_COLOR, JOB_TYPES } from "@/lib/domain";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Job {
  id: string;
  job_reference: string | null;
  job_type: number;
  status: string;
  credits_used: number;
  created_at: string;
}

function Dashboard() {
  const session = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.user) return;
    supabase
      .from("jobs")
      .select("id, job_reference, job_type, status, credits_used, created_at")
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setJobs((data ?? []) as Job[]);
        setLoading(false);
      });
  }, [session.user]);

  const isUnlimited = session.profile?.plan_type === "unlimited_monthly";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back{session.profile?.full_name ? `, ${session.profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="text-muted-foreground">Manage your artwork jobs and credits.</p>
        </div>
        <Link to="/submit"><Button size="lg"><Plus className="h-4 w-4 mr-2" /> New job</Button></Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Plan</div>
          {isUnlimited ? (
            <>
              <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Unlimited Monthly
              </div>
              <div className="text-sm text-muted-foreground mt-2">Submit unlimited jobs across all types.</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold mt-1">{session.profile?.credits_balance ?? 0} credits</div>
              <div className="text-sm text-muted-foreground mt-2">Type 1 = 5 · Type 2 = 7 · Type 3 = 10 · Type 4 = 15</div>
            </>
          )}
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Jobs submitted</div>
          <div className="text-2xl font-bold mt-1">{jobs.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">In progress</div>
          <div className="text-2xl font-bold mt-1">
            {jobs.filter((j) => j.status === "submitted" || j.status === "under_production" || j.status === "in_review").length}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Recent jobs</h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No jobs yet.</p>
            <Link to="/submit"><Button>Submit your first job</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {jobs.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center p-4 hover:bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">{j.job_reference || `Job ${j.id.slice(0, 8)}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {JOB_TYPES.find((t) => t.id === j.job_type)?.label} · {formatDistanceToNow(new Date(j.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mr-4">{j.credits_used} cr</div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLOR[j.status]}`}>{STATUS_LABEL[j.status]}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
