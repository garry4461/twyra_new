import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Upload, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, isStaff } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABEL, STATUS_COLOR, JOB_TYPES } from "@/lib/domain";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/jobs/$id")({
  component: JobDetail,
});

interface JobRow {
  id: string; customer_id: string; job_reference: string | null; po_number: string | null;
  notify_email: string; job_type: number; service: string; color_scheme: string;
  additional_bw: boolean; color_separations: boolean; output_vector: string; output_raster: string;
  output_other: string; instructions: string | null; credits_used: number; status: string;
  admin_notes: string | null; created_at: string; completed_at: string | null;
  need_quote: boolean; authorize_extra: boolean;
}
interface FileRow { id: string; storage_path: string; file_name: string; kind: string; size_bytes: number | null; }
interface RevisionRow { id: string; message: string; created_at: string; requested_by: string; }

function JobDetail() {
  const { id } = Route.useParams();
  const session = useSession();
  const [job, setJob] = useState<JobRow | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [revMsg, setRevMsg] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState<File[]>([]);

  const staff = isStaff(session.roles);

  const load = async () => {
    const [{ data: j }, { data: fs }, { data: rs }] = await Promise.all([
      supabase.from("jobs").select("*").eq("id", id).maybeSingle(),
      supabase.from("job_files").select("*").eq("job_id", id).order("created_at"),
      supabase.from("revisions").select("*").eq("job_id", id).order("created_at", { ascending: false }),
    ]);
    setJob(j as JobRow);
    setFiles((fs ?? []) as FileRow[]);
    setRevisions((rs ?? []) as RevisionRow[]);
    setNotes((j as JobRow)?.admin_notes ?? "");
    setNewStatus((j as JobRow)?.status ?? "");
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function download(path: string, name: string) {
    const { data, error } = await supabase.storage.from("job-files").createSignedUrl(path, 60);
    if (error) { toast.error(error.message); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = name; a.click();
  }

  async function requestRevision() {
    if (!revMsg.trim() || !session.user) return;
    const { error } = await supabase.from("revisions").insert({
      job_id: id, requested_by: session.user.id, message: revMsg,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("jobs").update({ status: "revision_requested" }).eq("id", id);
    setRevMsg("");
    toast.success("Revision requested");
    load();
  }

  async function saveStaff() {
    const { error } = await supabase.from("jobs").update({
      status: newStatus as JobRow["status"], admin_notes: notes,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    // Upload outputs
    for (const f of output) {
      const path = `${id}/output/${Date.now()}-${f.name}`;
      const { error: upErr } = await supabase.storage.from("job-files").upload(path, f);
      if (upErr) { toast.error(upErr.message); continue; }
      await supabase.from("job_files").insert({
        job_id: id, storage_path: path, file_name: f.name,
        size_bytes: f.size, kind: "output", uploaded_by: session.user!.id,
      });
    }
    setOutput([]);
    toast.success("Job updated");
    load();
  }

  if (loading) return <div>Loading…</div>;
  if (!job) return <div>Job not found</div>;

  const inputs = files.filter((f) => f.kind === "input");
  const outputs = files.filter((f) => f.kind === "output");
  const canRevise = job.status === "completed" && job.customer_id === session.user?.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{job.job_reference || `Job ${job.id.slice(0, 8)}`}</h1>
          <p className="text-muted-foreground">{JOB_TYPES.find(t => t.id === job.job_type)?.label} · Submitted {format(new Date(job.created_at), "PP")}</p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full border ${STATUS_COLOR[job.status]}`}>{STATUS_LABEL[job.status]}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 space-y-4">
          <h2 className="font-semibold">Job details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="PO Number" value={job.po_number || "—"} />
            <Field label="Notify Email" value={job.notify_email} />
            <Field label="Service" value={job.service.replace("_", " ")} />
            <Field label="Color Scheme" value={job.color_scheme} />
            <Field label="Vector Output" value={job.output_vector} />
            <Field label="Raster Output" value={job.output_raster} />
            <Field label="Other Output" value={job.output_other.replace("_", " ")} />
            <Field label="Credits Used" value={String(job.credits_used)} />
            <Field label="Additional B&W" value={job.additional_bw ? "Yes" : "No"} />
            <Field label="Color Separations" value={job.color_separations ? "Yes" : "No"} />
            <Field label="Need Quote" value={job.need_quote ? "Yes" : "No"} />
            <Field label="Authorized Extra" value={job.authorize_extra ? "Yes" : "No"} />
          </div>
          {job.instructions && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Instructions</div>
              <div className="text-sm bg-muted rounded p-3 whitespace-pre-wrap">{job.instructions}</div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Input Files</h3>
            <div className="space-y-2">
              {inputs.map((f) => (
                <button key={f.id} onClick={() => download(f.storage_path, f.file_name)} className="flex items-center justify-between w-full text-sm hover:bg-muted rounded px-2 py-1.5 text-left">
                  <span className="truncate">{f.file_name}</span>
                  <Download className="h-3.5 w-3.5 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Output Files</h3>
            {outputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not yet available.</p>
            ) : (
              <div className="space-y-2">
                {outputs.map((f) => (
                  <button key={f.id} onClick={() => download(f.storage_path, f.file_name)} className="flex items-center justify-between w-full text-sm hover:bg-muted rounded px-2 py-1.5 text-left">
                    <span className="truncate">{f.file_name}</span>
                    <Download className="h-3.5 w-3.5 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {canRevise && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Request a revision</h3>
          <Textarea value={revMsg} onChange={(e) => setRevMsg(e.target.value)} placeholder="Describe what needs to change…" />
          <Button className="mt-3" onClick={requestRevision} disabled={!revMsg.trim()}>Submit revision request</Button>
        </Card>
      )}

      {revisions.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Revision history</h3>
          <div className="space-y-3">
            {revisions.map((r) => (
              <div key={r.id} className="border-l-2 border-primary pl-3">
                <div className="text-xs text-muted-foreground">{format(new Date(r.created_at), "PPp")}</div>
                <div className="text-sm whitespace-pre-wrap">{r.message}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {staff && (
        <Card className="p-6 space-y-4 border-primary/30">
          <h3 className="font-semibold text-primary">Staff controls</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Change status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Flow: Submitted → Under Production → QA Review → Ready for Review
              </div>
            </div>
            <div>
              <Label>Upload output files</Label>
              <Input type="file" multiple onChange={(e) => setOutput(Array.from(e.target.files ?? []))} />
              {output.length > 0 && <div className="text-xs mt-1 text-muted-foreground">{output.length} file(s) selected</div>}
            </div>
          </div>
          <div>
            <Label>Internal notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <Button onClick={saveStaff}><Upload className="h-4 w-4 mr-2" /> Save changes</Button>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}
