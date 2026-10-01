import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createPortalAccount, type PortalAccountInput } from "@/lib/admin-users.functions";
import { useSession, isStaff } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { STATUS_LABEL, STATUS_COLOR, jobTypeLabel, CREDIT_PLAN_NAMES, MONTHLY_PLAN_NAMES } from "@/lib/domain";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
});

interface JobRow {
  id: string; job_reference: string | null; job_type: number; status: string;
  created_at: string; customer_id: string; credits_used: number; notify_email: string;
}
interface UserRow { id: string; email: string | null; full_name: string | null; plan_type: string; credits_balance: number; phone: string | null; plan_name: string | null; created_at: string; }

const blankPortalAccount: PortalAccountInput = {
  fullName: "", company: "", email: "", phone: "+44", address1: "", address2: "",
  city: "", postcode: "", country: "United Kingdom", password: "", role: "customer",
};

const callingCodes = [
  ["United Kingdom", "+44"], ["United States / Canada", "+1"], ["Australia", "+61"],
  ["India", "+91"], ["Ireland", "+353"], ["New Zealand", "+64"], ["South Africa", "+27"],
  ["United Arab Emirates", "+971"], ["Pakistan", "+92"], ["Bangladesh", "+880"],
  ["France", "+33"], ["Germany", "+49"], ["Spain", "+34"], ["Italy", "+39"],
  ["Netherlands", "+31"], ["Nigeria", "+234"], ["Philippines", "+63"], ["Singapore", "+65"],
] as const;

const countryOptions = [
  "Australia", "Bangladesh", "Canada", "France", "Germany", "India", "Ireland", "Italy",
  "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Philippines", "Singapore",
  "South Africa", "Spain", "United Arab Emirates", "United Kingdom", "United States", "Other",
];

function Admin() {
  const session = useSession();
  const createAccount = useServerFn(createPortalAccount);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantRole, setGrantRole] = useState("production");
  const [selectedUser, setSelectedUser] = useState("");
  const [newPlan, setNewPlan] = useState("credit");
  const [planName, setPlanName] = useState("");
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [showInitialPassword, setShowInitialPassword] = useState(false);
  const [newAccount, setNewAccount] = useState<PortalAccountInput>({ ...blankPortalAccount });


  const staff = isStaff(session.roles);
  const isAdmin = session.roles.includes("admin");

  const load = async () => {
    const [{ data: js }, { data: us }] = await Promise.all([
      supabase.from("jobs").select("id, job_reference, job_type, job_category, status, created_at, customer_id, credits_used, notify_email").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id, email, full_name, plan_type, credits_balance, phone, plan_name, created_at").order("created_at", { ascending: false }),
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
    if (!selectedUser) { toast.error("Select a customer"); return; }
    if (newPlan !== "none" && !planName) { toast.error("Select a plan"); return; }
    const { error } = await supabase.rpc("admin_set_plan", {
      p_user: selectedUser,
      p_plan: newPlan as "credit" | "unlimited_monthly" | "none",
      p_plan_name: newPlan === "none" ? undefined : planName,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Plan updated");
    load();
  }

  function updateNewAccount(field: keyof PortalAccountInput, value: string) {
    setNewAccount((current) => ({ ...current, [field]: value }));
  }

  async function submitNewAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingAccount(true);
    try {
      const result = await createAccount({ data: newAccount });
      toast.success(`${result.role === "customer" ? "Customer" : "Designer"} account created for ${result.email}.`);
      setNewAccount({ ...blankPortalAccount });
      setShowInitialPassword(false);
      setAddAccountOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The account could not be created.");
    } finally {
      setAddingAccount(false);
    }
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
        <Card>
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold">Customers</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{users.length} sign-ups</span>
              <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Add Customer</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add portal account</DialogTitle>
                    <DialogDescription>Create a customer or designer account. Customers start with the 10-credit Trial Pack.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={submitNewAccount} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="new-full-name">Full name *</Label>
                        <Input id="new-full-name" autoComplete="name" value={newAccount.fullName} onChange={(event) => updateNewAccount("fullName", event.target.value)} required minLength={2} maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="new-company">Company *</Label>
                        <Input id="new-company" autoComplete="organization" value={newAccount.company} onChange={(event) => updateNewAccount("company", event.target.value)} required maxLength={120} />
                      </div>
                      <div>
                        <Label htmlFor="new-email">Email *</Label>
                        <Input id="new-email" type="email" autoComplete="email" value={newAccount.email} onChange={(event) => updateNewAccount("email", event.target.value)} required maxLength={255} />
                      </div>
                      <div>
                        <Label htmlFor="new-phone">Mobile number *</Label>
                        <div className="flex gap-2">
                          <Select value={callingCodes.find(([, code]) => newAccount.phone.startsWith(code))?.[1] ?? "+44"} onValueChange={(code) => {
                            const priorCode = callingCodes.find(([, value]) => newAccount.phone.startsWith(value))?.[1] ?? "+44";
                            updateNewAccount("phone", `${code}${newAccount.phone.slice(priorCode.length)}`);
                          }}>
                            <SelectTrigger aria-label="Country calling code" className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                            <SelectContent>{callingCodes.map(([label, code]) => <SelectItem key={label} value={code}>{label} ({code})</SelectItem>)}</SelectContent>
                          </Select>
                          <Input id="new-phone" type="tel" inputMode="tel" autoComplete="tel" value={newAccount.phone.replace(/^\+\d{1,3}/, "")} onChange={(event) => {
                            const code = callingCodes.find(([, value]) => newAccount.phone.startsWith(value))?.[1] ?? "+44";
                            const digits = event.target.value.replace(/\D/g, "").slice(0, 15);
                            updateNewAccount("phone", `${code}${digits}`);
                          }} required minLength={7} maxLength={18} pattern="[0-9]{7,15}" aria-describedby="new-phone-hint" />
                        </div>
                        <p id="new-phone-hint" className="mt-1 text-xs text-muted-foreground">Choose the calling code, then enter 7–15 digits.</p>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="new-address1">Address line 1 *</Label>
                        <Input id="new-address1" autoComplete="address-line1" value={newAccount.address1} onChange={(event) => updateNewAccount("address1", event.target.value)} required maxLength={160} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="new-address2">Address line 2</Label>
                        <Input id="new-address2" autoComplete="address-line2" value={newAccount.address2} onChange={(event) => updateNewAccount("address2", event.target.value)} maxLength={160} />
                      </div>
                      <div>
                        <Label htmlFor="new-city">Town / city *</Label>
                        <Input id="new-city" autoComplete="address-level2" value={newAccount.city} onChange={(event) => updateNewAccount("city", event.target.value)} required maxLength={80} />
                      </div>
                      <div>
                        <Label htmlFor="new-postcode">Postcode *</Label>
                        <Input id="new-postcode" autoComplete="postal-code" value={newAccount.postcode} onChange={(event) => updateNewAccount("postcode", event.target.value)} required maxLength={20} />
                      </div>
                      <div>
                        <Label htmlFor="new-country">Country *</Label>
                        <Select value={newAccount.country} onValueChange={(value) => updateNewAccount("country", value)}>
                          <SelectTrigger id="new-country"><SelectValue placeholder="Choose a country" /></SelectTrigger>
                          <SelectContent>{countryOptions.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-role">Account type *</Label>
                        <Select value={newAccount.role} onValueChange={(value) => updateNewAccount("role", value)}>
                          <SelectTrigger id="new-role"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="new-password">Initial password *</Label>
                        <div className="relative">
                          <Input id="new-password" type={showInitialPassword ? "text" : "password"} autoComplete="new-password" value={newAccount.password} onChange={(event) => updateNewAccount("password", event.target.value)} required minLength={8} maxLength={128} className="pr-11" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowInitialPassword((visible) => !visible)} aria-label={showInitialPassword ? "Hide initial password" : "Show initial password"} aria-pressed={showInitialPassword}>
                            {showInitialPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">At least 8 characters. Share it with the account holder securely.</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                      <Button type="button" variant="outline" onClick={() => setAddAccountOpen(false)} disabled={addingAccount}>Cancel</Button>
                      <Button type="submit" disabled={addingAccount}>{addingAccount ? "Creating account…" : "Create account"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Credits</th>
                  <th className="px-6 py-3 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/50">
                    <td className="px-6 py-3 font-medium">{u.full_name || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{u.email || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-6 py-3">
                      {u.plan_type === "unlimited_monthly"
                        ? `${u.plan_name || "Monthly"} · Unlimited`
                        : u.plan_name || (u.plan_type === "credit" ? "FlexCredits" : "No plan")}
                    </td>
                    <td className="px-6 py-3">{u.plan_type === "unlimited_monthly" ? "∞" : u.credits_balance}</td>
                    <td className="px-6 py-3 text-muted-foreground">{format(new Date(u.created_at), "PP")}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-6 text-muted-foreground">No customers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
              <Label>Engagement mode</Label>
              <Select value={newPlan} onValueChange={(v) => { setNewPlan(v); setPlanName(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit pack (FlexCredits)</SelectItem>
                  <SelectItem value="unlimited_monthly">Monthly unlimited</SelectItem>
                  <SelectItem value="none">No active plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newPlan !== "none" && (
              <div>
                <Label>Plan</Label>
                <Select value={planName} onValueChange={setPlanName}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {(newPlan === "credit" ? CREDIT_PLAN_NAMES : MONTHLY_PLAN_NAMES).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {newPlan === "unlimited_monthly"
                ? "Monthly unlimited plans submit unlimited jobs — credits are not deducted."
                : newPlan === "credit"
                  ? "Credit packs deduct credits per job (Simple Vector 1 · Medium 2 · Complex/Custom up to 4 · Digitizing 2–4)."
                  : "Customer cannot submit jobs until a plan is set."}
            </p>
            <Button onClick={updatePlan}>Update plan</Button>

          </Card>
        </div>
      )}
    </div>
  );
}
