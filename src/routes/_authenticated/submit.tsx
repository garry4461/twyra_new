import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, X, AlertTriangle, PenTool, Scissors, ArrowLeft } from "lucide-react";
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
  JOB_TYPES, DIGITIZING_TYPES, DIGITIZING_FORMATS, DIGITIZING_PRODUCTS,
  SERVICES, COLOR_SCHEMES, OUTPUT_VECTOR, OUTPUT_RASTER, OUTPUT_OTHER, creditsFor,
  type JobCategory,
} from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/submit")({
  component: SubmitJob,
});

interface CustomerOption {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  plan_type: "credit" | "unlimited_monthly" | "none";
  plan_name: string | null;
  credits_balance: number;
}

function SubmitJob() {
  const session = useSession();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [onBehalfOf, setOnBehalfOf] = useState("");


  // shared
  const [jobType, setJobType] = useState<number>(1);
  const [service, setService] = useState<string>("");
  const [needQuote, setNeedQuote] = useState(false);
  const [authorizeExtra, setAuthorizeExtra] = useState(false);
  const [jobReference, setJobReference] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(session.profile?.email ?? "");
  const [instructions, setInstructions] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // vector
  const [colorScheme, setColorScheme] = useState("");
  const [additionalBw, setAdditionalBw] = useState(false);
  const [colorSeparations, setColorSeparations] = useState(false);
  const [outputVector, setOutputVector] = useState("ai");
  const [outputRaster, setOutputRaster] = useState("jpg");
  const [outputOther, setOutputOther] = useState("not_required");

  // digitizing
  const [formats, setFormats] = useState<string[]>([]);
  const [product, setProduct] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [maxStitch, setMaxStitch] = useState("");
  const [logoLocation, setLogoLocation] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [units, setUnits] = useState("inches");
  const [colorRequirement, setColorRequirement] = useState("");
  const [needSewOut, setNeedSewOut] = useState(false);

  const isAdmin = session.roles.includes("admin");
  const isDesigner = session.roles.some((r) => r === "production" || r === "qa") && !isAdmin;

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("profiles")
      .select("id, email, full_name, company, plan_type, plan_name, credits_balance")
      .order("created_at", { ascending: false })
      .then(({ data }) => setCustomers((data ?? []) as CustomerOption[]));
  }, [isAdmin]);

  const targetCustomer = isAdmin ? customers.find((c) => c.id === onBehalfOf) ?? null : null;
  const activePlanType = isAdmin ? targetCustomer?.plan_type : session.profile?.plan_type;
  const activeCredits = isAdmin ? targetCustomer?.credits_balance ?? 0 : session.profile?.credits_balance ?? 0;
  const isUnlimited = activePlanType === "unlimited_monthly";
  const types = category === "digitizing" ? DIGITIZING_TYPES : JOB_TYPES;
  const credits = creditsFor(jobType, category ?? "vector");
  const insufficient = !isUnlimited && activeCredits < credits;
  const tat = (types as readonly { id: number; tat: string }[]).find((t) => t.id === jobType)?.tat;
  const serviceOptions =
    category === "vector" && (jobType === 3 || jobType === 4)
      ? SERVICES.filter((s) => s.id === "standard")
      : SERVICES.filter((s) => s.id !== "standard");

  if (!session.loading && isDesigner) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Not available for your role</h2>
        <p className="text-muted-foreground">Designers pick up jobs from the jobs queue — they don't submit new requests.</p>
      </Card>
    );
  }


  const pick = (c: JobCategory) => {
    setCategory(c);
    setJobType(1);
    setService("");
  };

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
    if (!session.user || !category) return;
    if (isAdmin && !onBehalfOf) {
      toast.error("Select the customer this job is for");
      return;
    }
    if (!notifyEmail || !service) {
      toast.error("Please fill required fields");
      return;
    }

    if (category === "vector" && !colorScheme) {
      toast.error("Please choose a colour scheme");
      return;
    }
    if (category === "digitizing" && (formats.length === 0 || !product || !width || !height)) {
      toast.error("Please complete output format, product and design size");
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
      const payload =
        category === "vector"
          ? {
              job_category: "vector",
              job_type: jobType,
              service,
              job_reference: jobReference,
              po_number: poNumber,
              notify_email: notifyEmail,
              need_quote: needQuote,
              authorize_extra: authorizeExtra,
              color_scheme: colorScheme,
              additional_bw: additionalBw,
              color_separations: colorSeparations,
              output_vector: outputVector,
              output_raster: outputRaster,
              output_other: outputOther,
              instructions,
            }
          : {
              job_category: "digitizing",
              job_type: jobType,
              service,
              job_reference: jobReference,
              po_number: poNumber,
              notify_email: notifyEmail,
              need_quote: needQuote,
              authorize_extra: authorizeExtra,
              primary_output_formats: formats,
              product,
              garment_type: garmentType,
              max_stitch_count: maxStitch,
              logo_location: logoLocation,
              design_width: width,
              design_height: height,
              design_units: units,
              color_requirement: colorRequirement,
              need_sew_out: needSewOut,
              instructions,
            };

      const { data: jobId, error } = await supabase.rpc("submit_job_v2", {
        p_payload: isAdmin ? { ...payload, customer_id: onBehalfOf } : payload,
      });

      if (error) throw error;

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

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New job request</h1>
          <p className="text-muted-foreground">What kind of job would you like to place?</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <button type="button" onClick={() => pick("vector")} className="text-left">
            <Card className="p-6 h-full hover:border-primary transition-colors">
              <div className="p-3 rounded-lg bg-primary/10 w-fit"><PenTool className="h-6 w-6 text-primary" /></div>
              <h2 className="mt-4 text-lg font-bold">Vector Art</h2>
              <p className="text-sm text-muted-foreground mt-1">Logo redraws, design layouts and print-ready vector files.</p>
              <p className="text-xs text-muted-foreground mt-3">From 1 credit</p>
            </Card>
          </button>
          <button type="button" onClick={() => pick("digitizing")} className="text-left">
            <Card className="p-6 h-full hover:border-primary transition-colors">
              <div className="p-3 rounded-lg bg-primary/10 w-fit"><Scissors className="h-6 w-6 text-primary" /></div>
              <h2 className="mt-4 text-lg font-bold">Embroidery Digitizing</h2>
              <p className="text-sm text-muted-foreground mt-1">Machine-ready stitch files for caps, garments and patches.</p>
              <p className="text-xs text-muted-foreground mt-3">From 2 credits</p>
            </Card>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{category === "vector" ? "Vector art job request" : "Digitizing job request"}</h1>
          <p className="text-muted-foreground">Provide details and upload your files.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCategory(null)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Change type
        </Button>
      </div>

      <div className="rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 px-4 py-2 text-sm font-semibold text-center flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" /> UPLOADING INCORRECT JOB TYPE MAY CAUSE DELAYS
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{category === "vector" ? "Job Type *" : "Service Type / Estimated Stitch Count *"}</Label>
              <Select value={String(jobType)} onValueChange={(v) => { setJobType(Number(v)); setService(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((jt) => (
                    <SelectItem key={jt.id} value={String(jt.id)}>{jt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 text-xs text-muted-foreground">
                Cost: <span className="font-semibold text-foreground">{isUnlimited ? "Included (Unlimited plan)" : `${credits} credit${credits === 1 ? "" : "s"}`}</span> · TAT: {tat}
              </div>
            </div>
            <div>
              <Label>Service *</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger><SelectValue placeholder="- Select Service -" /></SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="mb-2 block">Need a Quote First?</Label>
              <RadioGroup value={needQuote ? "yes" : "no"} onValueChange={(v) => setNeedQuote(v === "yes")} className="flex gap-6">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="quote-yes" /><Label htmlFor="quote-yes" className="cursor-pointer">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="quote-no" /><Label htmlFor="quote-no" className="cursor-pointer">No</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label className="mb-2 block">
                {category === "vector"
                  ? "I authorize an additional charge of up to £10 if needed"
                  : "If stitch count exceeds above selection, I authorize an additional charge of up to £20"}
              </Label>
              <RadioGroup value={authorizeExtra ? "yes" : "no"} onValueChange={(v) => setAuthorizeExtra(v === "yes")} className="flex gap-6">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="auth-yes" /><Label htmlFor="auth-yes" className="cursor-pointer">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="auth-no" /><Label htmlFor="auth-no" className="cursor-pointer">No</Label></div>
              </RadioGroup>
            </div>
            {category === "digitizing" && (
              <div className="md:col-span-2">
                <Label className="mb-2 block">Need a Real Sew Out image to verify colors? (additional charge may apply)</Label>
                <RadioGroup value={needSewOut ? "yes" : "no"} onValueChange={(v) => setNeedSewOut(v === "yes")} className="flex gap-6">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="sew-yes" /><Label htmlFor="sew-yes" className="cursor-pointer">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="sew-no" /><Label htmlFor="sew-no" className="cursor-pointer">No</Label></div>
                </RadioGroup>
              </div>
            )}
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

          {category === "vector" ? (
            <>
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
            </>
          ) : (
            <>
              <div>
                <Label>Primary Output Format *</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {DIGITIZING_FORMATS.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={formats.includes(f)}
                        onCheckedChange={(v) =>
                          setFormats(v ? [...formats, f] : formats.filter((x) => x !== f))
                        }
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Product this design will be stitched on *</Label>
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger><SelectValue placeholder="Select One" /></SelectTrigger>
                    <SelectContent>
                      {DIGITIZING_PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Garment Type</Label>
                  <RadioGroup value={garmentType} onValueChange={setGarmentType} className="flex gap-6">
                    <div className="flex items-center gap-2"><RadioGroupItem value="flats" id="g-flats" /><Label htmlFor="g-flats" className="cursor-pointer">Flats</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="caps" id="g-caps" /><Label htmlFor="g-caps" className="cursor-pointer">Caps</Label></div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="stitch">Maximum stitch count</Label>
                  <Input id="stitch" value={maxStitch} onChange={(e) => setMaxStitch(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="loc">Location / Size of logo</Label>
                  <Input id="loc" placeholder='e.g. Left chest - 4" W' value={logoLocation} onChange={(e) => setLogoLocation(e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Design Size *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
                    <Input placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Units</Label>
                  <RadioGroup value={units} onValueChange={setUnits} className="flex gap-6">
                    <div className="flex items-center gap-2"><RadioGroupItem value="inches" id="u-in" /><Label htmlFor="u-in" className="cursor-pointer">inches</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="centimeters" id="u-cm" /><Label htmlFor="u-cm" className="cursor-pointer">centimeters</Label></div>
                  </RadioGroup>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="colreq">Any Specific Color Requirement</Label>
                  <Input id="colreq" value={colorRequirement} onChange={(e) => setColorRequirement(e.target.value)} />
                </div>
              </div>
            </>
          )}

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
