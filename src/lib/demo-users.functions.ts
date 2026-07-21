import { createServerFn } from "@tanstack/react-start";

export const DEMO_PASSWORD = "Demo1234!";
export const DEMO_USERS = [
  { key: "admin", email: "admin@demo.artworkguru.app", full_name: "Ada Admin", company: "ArtworkGuru", role: "admin" as const, plan: "unlimited_monthly" as const, credits: 0 },
  { key: "customer", email: "customer@demo.artworkguru.app", full_name: "Casey Customer", company: "MerchWorks", role: "customer" as const, plan: "credit" as const, credits: 50 },
  { key: "designer", email: "designer@demo.artworkguru.app", full_name: "Dana Designer", company: "ArtworkGuru", role: "production" as const, plan: "none" as const, credits: 0 },
];

export const ensureDemoUsers = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Get existing users (list first page — enough for demo scope)
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw new Error(listErr.message);
  const existingByEmail = new Map(list.users.map((u) => [u.email?.toLowerCase() ?? "", u]));

  for (const d of DEMO_USERS) {
    let userId: string | undefined = existingByEmail.get(d.email)?.id;

    if (!userId) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: d.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: d.full_name, company: d.company },
      });
      if (createErr) throw new Error(`create ${d.email}: ${createErr.message}`);
      userId = created.user?.id;
    } else {
      // Ensure known password so the login buttons always work.
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD, email_confirm: true });
    }
    if (!userId) throw new Error(`no user id for ${d.email}`);

    // Upsert profile with plan / credits
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: d.email,
      full_name: d.full_name,
      company: d.company,
      plan_type: d.plan,
      credits_balance: d.credits,
    }, { onConflict: "id" });

    // Ensure role is set (add if missing, and add admin role if demo user is admin)
    if (d.role) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: d.role },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    }
  }

  return { ok: true, users: DEMO_USERS.map(({ key, email, role }) => ({ key, email, role })) };
});
