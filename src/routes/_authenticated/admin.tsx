import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession, isStaff } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABEL, STATUS_COLOR, jobTypeLabel } from "@/lib/domain";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
});

interface JobRow {
  id: string; job_reference: string | null; job_type: number; status: string;
  created_at: string; customer_id: string; credits_used: number; notify_email: string;
}
interface UserRow { id: string; email: string | null; full_name: string | null; plan_type: string; credits_balance: number; }

function Admin() {
  const session = useSession();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantRole, setGrantRole] = useState("production");
  const [selectedUser, setSelectedUser] = useState("");
  const [newPlan, setNewPlan] = useState("credit");

  const staff = isStaff(session.roles);
  const isAdmin = session.roles.includes("admin");

  const load = async () => {
    const [{ data: js }, { data: us }] = await Promise.all([
      supabase.from("jobs").select("id, job_reference, job_type, job_category, status, created_at, customer_id, credits_used, notify_email").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id, email, full_name, plan_type, credits_balance").order("created_at", { ascending: false }),
    ]);
    setJobs((js ?? []) as JobRow[]);
    setUsers((us ?? []) as UserRow[]);
  };
  useEffect(() => { if (staff) load(); }, [staff]);

  if (!session.loading && !staff) {
    return <div className="text-center py-12">You don't have access to this area.</div>;
  }

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  async function adjustCredits() {
    const user = users.find((u) => u.email === grantEmail);
    if (!user) { toast.error("User not found"); return; }
    const { error } = await supabase.rpc("admin_adjust_credits", {
      p_user: user.id, p_amount: Number(grantAmount), p_reason: "Admin adjustment",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Credits updated");
    setGrantEmail(""); setGrantAmount("");
    load();
  }

  async function grantRoleFn() {
    const user = users.find((u) => u.email === grantEmail);
    if (!user) { toast.error("User not found"); return; }
    const { error } = await supabase.rpc("admin_grant_role", { p_user: user.id, p_role: grantRole as "admin"|"production"|"qa"|"customer" });
    if (error) { toast.error(error.message); return; }
    toast.success("Role granted");
  }

  async function updatePlan() {
    if (!selectedUser) return;
    const { error } = await supabase.rpc("admin_set_plan", { p_user: selectedUser, p_plan: newPlan as "credit"|"unlimited_monthly"|"none" });
    if (error) { toast.error(error.message); return; }
    toast.success("Plan updated");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isAdmin ? "Admin console" : "Jobs queue"}</h1>
        <p className="text-muted-foreground">{isAdmin ? "Manage jobs, users and credits." : "Pick up jobs, update status and upload completed files."}</p>
      </div>

      <Card>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold">All jobs</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="divide-y">
          {filtered.map((j) => {
            const user = users.find((u) => u.id === j.customer_id);
            return (
              <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center p-4 hover:bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">{j.job_reference || `Job ${j.id.slice(0, 8)}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.full_name || user?.email || "Unknown"} · {jobTypeLabel(j.job_type, (j as { job_category?: string }).job_category)} · {format(new Date(j.created_at), "PP")}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mr-4">{j.credits_used} cr</div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLOR[j.status]}`}>{STATUS_LABEL[j.status]}</span>
              </Link>
            );
          })}
          {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">No jobs match this filter.</div>}
        </div>
      </Card>

      {isAdmin && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Adjust credits / Grant role</h3>
            <div>
              <Label>Customer email</Label>
              <Input value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="customer@example.com" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Credit amount (+/-)</Label>
                <Input type="number" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} />
              </div>
              <Button className="self-end" onClick={adjustCredits}>Apply</Button>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <div className="flex-1">
                <Label>Grant role</Label>
                <Select value={grantRole} onValueChange={setGrantRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="production">Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="self-end" onClick={grantRoleFn} variant="outline">Grant</Button>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Set customer plan</h3>
            <div>
              <Label>Customer</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.email || u.full_name || u.id.slice(0,8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit Pack</SelectItem>
                  <SelectItem value="unlimited_monthly">Unlimited Monthly</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updatePlan}>Update plan</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
