import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  JOB_TYPES, SERVICES, COLOR_SCHEMES, OUTPUT_VECTOR, OUTPUT_RASTER, OUTPUT_OTHER, creditsFor,
} from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/submit")({
  component: SubmitJob,
});

function SubmitJob() {
  const session = useSession();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const isStaffUser = session.roles.some((r) => r === "admin" || r === "production" || r === "qa");
  if (!session.loading && isStaffUser) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Not available for your role</h2>
        <p className="text-muted-foreground">Only customers can submit jobs. Switch to a customer account to submit artwork requests.</p>
      </Card>
    );
  }

  const [jobType, setJobType] = useState<number>(1);
  const [service, setService] = useState<string>("");
  const [needQuote, setNeedQuote] = useState(false);
  const [authorizeExtra, setAuthorizeExtra] = useState(false);
  const [jobReference, setJobReference] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(session.profile?.email ?? "");
  const [colorScheme, setColorScheme] = useState("");
  const [additionalBw, setAdditionalBw] = useState(false);
  const [colorSeparations, setColorSeparations] = useState(false);
  const [outputVector, setOutputVector] = useState("ai");
  const [outputRaster, setOutputRaster] = useState("jpg");
  const [outputOther, setOutputOther] = useState("not_required");
  const [instructions, setInstructions] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const isUnlimited = session.profile?.plan_type === "unlimited_monthly";
  const credits = creditsFor(jobType);
  const insufficient = !isUnlimited && (session.profile?.credits_balance ?? 0) < credits;

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= 10) break;
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 20MB`);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session.user) return;
    if (!notifyEmail || !colorScheme || !service) {
      toast.error("Please fill required fields");
      return;
    }
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }
    if (insufficient) {
      toast.error("Not enough credits — top up your account");
      return;
    }
    setSubmitting(true);
    try {
      const { data: jobId, error } = await supabase.rpc("submit_job", {
        p_job_reference: jobReference || "",
        p_po_number: poNumber || "",
        p_notify_email: notifyEmail,
        p_job_type: jobType,
        p_service: service,
        p_need_quote: needQuote,
        p_authorize_extra: authorizeExtra,
        p_color_scheme: colorScheme,
        p_additional_bw: additionalBw,
        p_color_separations: colorSeparations,
        p_output_vector: outputVector,
        p_output_raster: outputRaster,
        p_output_other: outputOther,
        p_instructions: instructions || "",
        p_credits_cost: credits,
      });
      if (error) throw error;

      // Upload files under {jobId}/input/...
      for (const file of files) {
        const path = `${jobId}/input/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("job-files").upload(path, file);
        if (upErr) throw upErr;
        await supabase.from("job_files").insert({
          job_id: jobId as string,
          storage_path: path,
          file_name: file.name,
          size_bytes: file.size,
          kind: "input",
          uploaded_by: session.user.id,
        });
      }
      toast.success("Job submitted");
      navigate({ to: "/jobs/$id", params: { id: jobId as string } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit a job</h1>
        <p className="text-muted-foreground">Provide details and upload your files.</p>
      </div>

      <div className="rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 px-4 py-2 text-sm font-semibold text-center flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" /> UPLOADING INCORRECT JOB TYPE MAY CAUSE DELAYS
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Job Type *</Label>
              <Select value={String(jobType)} onValueChange={(v) => setJobType(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt.id} value={String(jt.id)}>{jt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 text-xs text-muted-foreground">
                Cost: <span className="font-semibold text-foreground">{isUnlimited ? "Included (Unlimited plan)" : `${credits} credits`}</span> · TAT: {JOB_TYPES.find(t=>t.id===jobType)?.tat}
              </div>
            </div>
            <div>
              <Label>Service *</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger><SelectValue placeholder="- Select Service -" /></SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="mb-2 block">Need a Quote First?</Label>
              <RadioGroup value={needQuote ? "yes" : "no"} onValueChange={(v) => setNeedQuote(v === "yes")} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="quote-yes" /><Label htmlFor="quote-yes">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="quote-no" /><Label htmlFor="quote-no">No</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label className="mb-2 block">I authorize an additional charge of up to £10 if needed</Label>
              <RadioGroup value={authorizeExtra ? "yes" : "no"} onValueChange={(v) => setAuthorizeExtra(v === "yes")} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="auth-yes" /><Label htmlFor="auth-yes">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="auth-no" /><Label htmlFor="auth-no">No</Label></div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b pb-2">Job Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ref">Job Reference</Label>
              <Input id="ref" value={jobReference} onChange={(e) => setJobReference(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="po">Your company PO#</Label>
              <Input id="po" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="email">Email address to receive all mails for this Job *</Label>
              <Input id="email" type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} required />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div>
              <Label>Color Scheme *</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger><SelectValue placeholder="Please Select" /></SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEMES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Additional Versions at £10 each</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={additionalBw} onCheckedChange={(v) => setAdditionalBw(!!v)} />
                  Additional Black &amp; White Version
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={colorSeparations} onCheckedChange={(v) => setColorSeparations(!!v)} />
                  Color Separations
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label>Output / Return File format *</Label>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              <Select value={outputVector} onValueChange={setOutputVector}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTPUT_VECTOR.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={outputRaster} onValueChange={setOutputRaster}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTPUT_RASTER.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={outputOther} onValueChange={setOutputOther}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTPUT_OTHER.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Upload Files <span className="text-muted-foreground text-xs">(Max. size 20MB/file, up to 10 files)</span></Label>
            <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to choose files or drop them here</span>
              <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted rounded px-3 py-2">
                    <span className="truncate">{f.name} <span className="text-muted-foreground">({(f.size/1024).toFixed(0)} KB)</span></span>
                    <button type="button" onClick={() => setFiles(files.filter((_,j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="instr">Instructions / Comments</Label>
            <Textarea id="instr" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} />
          </div>
        </Card>

        {insufficient && (
          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-3 text-sm">
            You need {credits} credits to submit this job but have {session.profile?.credits_balance ?? 0}. Contact admin to top up.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" size="lg" disabled={submitting || insufficient}>
            {submitting ? "Submitting…" : "Submit Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
