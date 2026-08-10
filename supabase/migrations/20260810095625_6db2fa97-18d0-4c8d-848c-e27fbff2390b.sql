
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postcode text,
  ADD COLUMN IF NOT EXISTS country text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_is_first BOOLEAN;
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

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO v_is_first;
  IF v_is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    UPDATE public.profiles SET plan_type = 'unlimited_monthly' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END; $function$;

-- submit_job_v2 gains optional on-behalf-of customer for admins
CREATE OR REPLACE FUNCTION public.submit_job_v2(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_actor UUID := auth.uid();
  v_user UUID;
  v_plan public.plan_type;
  v_balance INTEGER;
  v_cost INTEGER;
  v_credits_used INTEGER := 0;
  v_category TEXT := COALESCE(p_payload->>'job_category', 'vector');
  v_type INTEGER := COALESCE((p_payload->>'job_type')::int, 1);
  v_job_id UUID;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  v_user := v_actor;
  IF (p_payload ? 'customer_id') AND NULLIF(p_payload->>'customer_id','') IS NOT NULL THEN
    IF NOT public.has_role(v_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
    v_user := (p_payload->>'customer_id')::uuid;
  END IF;

  SELECT plan_type, credits_balance INTO v_plan, v_balance FROM public.profiles WHERE id = v_user;
  IF v_plan IS NULL THEN RAISE EXCEPTION 'no profile'; END IF;

  IF v_category = 'digitizing' THEN
    v_cost := CASE v_type WHEN 1 THEN 2 ELSE 4 END;
  ELSE
    v_cost := CASE v_type WHEN 1 THEN 1 WHEN 2 THEN 2 ELSE 4 END;
  END IF;

  IF v_plan = 'credit' THEN
    IF v_balance < v_cost THEN RAISE EXCEPTION 'insufficient credits'; END IF;
    v_credits_used := v_cost;
    UPDATE public.profiles SET credits_balance = credits_balance - v_cost WHERE id = v_user;
  END IF;

  INSERT INTO public.jobs (
    customer_id, job_category, job_reference, po_number, notify_email, job_type, service,
    need_quote, authorize_extra, color_scheme, additional_bw, color_separations,
    output_vector, output_raster, output_other, instructions, credits_used,
    primary_output_formats, product, garment_type, max_stitch_count, logo_location,
    design_width, design_height, design_units, color_requirement, need_sew_out
  ) VALUES (
    v_user, v_category, p_payload->>'job_reference', p_payload->>'po_number',
    p_payload->>'notify_email', v_type, p_payload->>'service',
    COALESCE((p_payload->>'need_quote')::boolean, false),
    COALESCE((p_payload->>'authorize_extra')::boolean, false),
    p_payload->>'color_scheme',
    COALESCE((p_payload->>'additional_bw')::boolean, false),
    COALESCE((p_payload->>'color_separations')::boolean, false),
    p_payload->>'output_vector', p_payload->>'output_raster', p_payload->>'output_other',
    p_payload->>'instructions', v_credits_used,
    CASE WHEN p_payload ? 'primary_output_formats'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'primary_output_formats')) END,
    p_payload->>'product', p_payload->>'garment_type', p_payload->>'max_stitch_count',
    p_payload->>'logo_location', p_payload->>'design_width', p_payload->>'design_height',
    p_payload->>'design_units', p_payload->>'color_requirement',
    COALESCE((p_payload->>'need_sew_out')::boolean, false)
  ) RETURNING id INTO v_job_id;

  IF v_credits_used > 0 THEN
    INSERT INTO public.credit_transactions (user_id, amount, reason, job_id)
    VALUES (v_user, -v_credits_used, 'Job submission', v_job_id);
  END IF;

  RETURN v_job_id;
END; $function$;

-- Security hardening: no anonymous execution of SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_job_v2(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_plan(uuid, public.plan_type) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_job(text, text, text, integer, text, boolean, boolean, text, boolean, boolean, text, text, text, text, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_job_v2(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) TO authenticated;
