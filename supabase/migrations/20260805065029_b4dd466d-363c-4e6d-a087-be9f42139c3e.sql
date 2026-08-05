ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_name text;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS job_category text NOT NULL DEFAULT 'vector',
  ADD COLUMN IF NOT EXISTS primary_output_formats text[],
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS garment_type text,
  ADD COLUMN IF NOT EXISTS max_stitch_count text,
  ADD COLUMN IF NOT EXISTS logo_location text,
  ADD COLUMN IF NOT EXISTS design_width text,
  ADD COLUMN IF NOT EXISTS design_height text,
  ADD COLUMN IF NOT EXISTS design_units text,
  ADD COLUMN IF NOT EXISTS color_requirement text,
  ADD COLUMN IF NOT EXISTS need_sew_out boolean NOT NULL DEFAULT false;

ALTER TABLE public.jobs
  ALTER COLUMN color_scheme DROP NOT NULL,
  ALTER COLUMN output_vector DROP NOT NULL,
  ALTER COLUMN output_raster DROP NOT NULL,
  ALTER COLUMN output_other DROP NOT NULL,
  ALTER COLUMN service DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.submit_job_v2(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_plan public.plan_type;
  v_balance INTEGER;
  v_cost INTEGER;
  v_credits_used INTEGER := 0;
  v_category TEXT := COALESCE(p_payload->>'job_category', 'vector');
  v_type INTEGER := COALESCE((p_payload->>'job_type')::int, 1);
  v_job_id UUID;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
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
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_plan(p_user uuid, p_plan plan_type, p_plan_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles
    SET plan_type = p_plan,
        plan_name = COALESCE(p_plan_name, plan_name)
  WHERE id = p_user;
END; $$;