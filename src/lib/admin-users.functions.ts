import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const portalAccountSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(32).regex(/^\+?[\d\s().-]+$/),
  address1: z.string().trim().min(1).max(160),
  address2: z.string().trim().max(160),
  city: z.string().trim().min(1).max(80),
  postcode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(128),
  role: z.enum(["customer", "designer"]),
});

export type PortalAccountInput = z.infer<typeof portalAccountSchema>;

export const createPortalAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PortalAccountInput) => portalAccountSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: permissionError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (permissionError || !isAdmin) {
      throw new Error("Only admins can create portal accounts.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        company: data.company,
        phone: data.phone,
        address_line1: data.address1,
        address_line2: data.address2,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
      },
    });

    if (createError || !created.user) {
      throw new Error(createError?.message ?? "The account could not be created.");
    }

    if (data.role === "designer") {
      const userId = created.user.id;
      const [{ error: roleError }, { error: profileError }, { error: creditsError }] = await Promise.all([
        supabaseAdmin.from("user_roles").delete().eq("user_id", userId)
          .then(async ({ error }) => error ? { error } : supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "production" })),
        supabaseAdmin.from("profiles").update({ plan_type: "none", plan_name: null, credits_balance: 0 }).eq("id", userId),
        supabaseAdmin.from("credit_transactions").delete().eq("user_id", userId)
          .eq("reason", "Welcome trial pack — 10 free credits"),
      ]);

      if (roleError || profileError || creditsError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error("The designer account could not be fully set up, so it was removed. Please try again.");
      }
    }

    return { id: created.user.id, email, role: data.role };
  });