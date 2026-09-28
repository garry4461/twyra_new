export const JOB_TYPES = [
  { id: 1, label: "Job Type 1 (Simple Vector)", credits: 1, tat: "Next Day / Same Day" },
  { id: 2, label: "Job Type 2 (Medium Vector)", credits: 2, tat: "Next Day / Same Day" },
  { id: 3, label: "Job Type 3 (Complex Vector)", credits: 4, tat: "2-3 Business Days" },
  { id: 4, label: "Job Type 4 (Custom Vector)", credits: 4, tat: "2-3 Business Days" },
] as const;

export const DIGITIZING_TYPES = [
  { id: 1, label: "Simple Digitizing (up to 10k stitches)", credits: 2, tat: "Next Day / Same Day" },
  { id: 2, label: "Complex Digitizing (10k+ stitches / detailed)", credits: 4, tat: "2-3 Business Days" },
] as const;

export const DIGITIZING_FORMATS = [".dst", ".emb", ".Taji", ".exp", ".pxf", "Other"] as const;

export const DIGITIZING_PRODUCTS = [
  "Cap / Hat",
  "Polo Shirt",
  "T-Shirt",
  "Jacket",
  "Bag",
  "Towel",
  "Patch",
  "Other",
] as const;

export const SERVICES = [
  { id: "next_day", label: "Next Day" },
  { id: "same_day", label: "Same Day" },
  { id: "standard", label: "Standard (2-3 Business Days)" },
] as const;


export const COLOR_SCHEMES = [
  "Black & White",
  "Black & White with Gradients",
  "Spot Colors with Gradients",
  "Spot Colors no Gradients",
  "CMYK - 4 Color Process",
] as const;

export const OUTPUT_VECTOR = [
  { id: "ai", label: "Adobe Illustrator (ai)" },
  { id: "eps", label: "EPS - Vector File (eps)" },
  { id: "cdr", label: "Corel (cdr)" },
] as const;

export const OUTPUT_RASTER = [
  { id: "jpg", label: "Jpeg Image (jpg)" },
  { id: "gif", label: "Gif Image (gif)" },
  { id: "bmp", label: "Bitmap Image (bmp)" },
] as const;

export const OUTPUT_OTHER = [
  { id: "not_required", label: "Not Required" },
  { id: "psd", label: "Photoshop Image (psd)" },
  { id: "pdf", label: "PDF Document (pdf)" },
  { id: "tiff", label: "Tiff (tiff)" },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_production: "Under Production",
  in_review: "QA Review",
  completed: "Ready for Review",
  revision_requested: "Revision Requested",
};

export const STATUS_COLOR: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  under_production: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  in_review: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  revision_requested: "bg-red-500/10 text-red-600 border-red-500/20",
};

export type JobCategory = "vector" | "digitizing";

export function creditsFor(jobType: number, category: JobCategory = "vector"): number {
  const list = category === "digitizing" ? DIGITIZING_TYPES : JOB_TYPES;
  return (list as readonly { id: number; credits: number }[]).find((j) => j.id === jobType)?.credits ?? 0;
}

export function typesFor(category: JobCategory) {
  return category === "digitizing" ? DIGITIZING_TYPES : JOB_TYPES;
}

export function jobTypeLabel(jobType: number, category?: string | null): string {
  const list = category === "digitizing" ? DIGITIZING_TYPES : JOB_TYPES;
  return (list as readonly { id: number; label: string }[]).find((t) => t.id === jobType)?.label ?? "Job";
}


/** Display name of the customer's plan. */
export function planLabel(
  planType: "credit" | "unlimited_monthly" | "none" | undefined,
  planName: string | null | undefined,
  creditsBalance = 0,
): string {
  if (planName) return planName;
  if (planType === "unlimited_monthly") return "Essential Plan";
  if (planType === "none") return "No active plan";
  if (creditsBalance > 50) return "Enterprise Credits";
  if (creditsBalance > 10) return "Growth Pack";
  return "Starter Pack";
}

export const CREDIT_PLAN_NAMES = ["Trial Pack", "Starter Pack", "Growth Pack"] as const;
export const MONTHLY_PLAN_NAMES = ["Essential Plan", "Enterprise Plan", "Enterprise PRO Plan"] as const;


