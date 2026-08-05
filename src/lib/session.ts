import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "admin" | "production" | "qa";

export interface SessionState {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  profile: {
    id: string;
    full_name: string | null;
    company: string | null;
    email: string | null;
    plan_type: "credit" | "unlimited_monthly" | "none";
    plan_name: string | null;
    credits_balance: number;
  } | null;

}

export function useSession(): SessionState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<SessionState>({
    user: null,
    loading: true,
    roles: [],
    profile: null,
  });

  const load = async (user: User | null) => {
    if (!user) {
      setState({ user: null, loading: false, roles: [], profile: null });
      return;
    }
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    setState({
      user,
      loading: false,
      roles: (roles ?? []).map((r) => r.role as AppRole),
      profile: (profile as SessionState["profile"]) ?? null,
    });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session?.user ?? null);
  };

  return { ...state, refresh };
}

export function isStaff(roles: AppRole[]): boolean {
  return roles.some((r) => r === "admin" || r === "production" || r === "qa");
}
