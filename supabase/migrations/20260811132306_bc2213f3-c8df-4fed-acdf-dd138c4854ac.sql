-- 1. Remove "first signup becomes admin" self-escalation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, phone, address_line1, address_line2, city, postcode, country)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address_line1',
    NEW.raw_user_meta_data->>'address_line2',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postcode',
    NEW.raw_user_meta_data->>'country');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END; $function$;

-- 2. Trigger-only functions must not be callable through the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_updated_at() FROM PUBLIC, anon, authenticated;

-- 3. Privileged / definer functions: no anonymous execution
REVOKE ALL ON FUNCTION public.admin_adjust_credits(uuid, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_grant_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_job_v2(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;

-- Signed-in users still need the entry points and the RLS helpers
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_job_v2(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;