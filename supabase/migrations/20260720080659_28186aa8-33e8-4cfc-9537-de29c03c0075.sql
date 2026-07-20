
CREATE OR REPLACE FUNCTION public.submit_job(
  p_job_reference TEXT,
  p_po_number TEXT,
  p_notify_email TEXT,
  p_job_type INTEGER,
  p_service TEXT,
  p_need_quote BOOLEAN,
  p_authorize_extra BOOLEAN,
  p_color_scheme TEXT,
  p_additional_bw BOOLEAN,
  p_color_separations BOOLEAN,
  p_output_vector TEXT,
  p_output_raster TEXT,
  p_output_other TEXT,
  p_instructions TEXT,
  p_credits_cost INTEGER
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_plan public.plan_type;
  v_balance INTEGER;
  v_credits_used INTEGER := 0;
  v_job_id UUID;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT plan_type, credits_balance INTO v_plan, v_balance FROM public.profiles WHERE id = v_user;
  IF v_plan IS NULL THEN RAISE EXCEPTION 'no profile'; END IF;

  IF v_plan = 'credit' THEN
    IF v_balance < p_credits_cost THEN RAISE EXCEPTION 'insufficient credits'; END IF;
    v_credits_used := p_credits_cost;
    UPDATE public.profiles SET credits_balance = credits_balance - p_credits_cost WHERE id = v_user;
  END IF;

  INSERT INTO public.jobs (
    customer_id, job_reference, po_number, notify_email, job_type, service,
    need_quote, authorize_extra, color_scheme, additional_bw, color_separations,
    output_vector, output_raster, output_other, instructions, credits_used
  ) VALUES (
    v_user, p_job_reference, p_po_number, p_notify_email, p_job_type, p_service,
    p_need_quote, p_authorize_extra, p_color_scheme, p_additional_bw, p_color_separations,
    p_output_vector, p_output_raster, p_output_other, p_instructions, v_credits_used
  ) RETURNING id INTO v_job_id;

  IF v_credits_used > 0 THEN
    INSERT INTO public.credit_transactions (user_id, amount, reason, job_id)
    VALUES (v_user, -v_credits_used, 'Job submission', v_job_id);
  END IF;

  RETURN v_job_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.submit_job(TEXT,TEXT,TEXT,INTEGER,TEXT,BOOLEAN,BOOLEAN,TEXT,BOOLEAN,BOOLEAN,TEXT,TEXT,TEXT,TEXT,INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_job(TEXT,TEXT,TEXT,INTEGER,TEXT,BOOLEAN,BOOLEAN,TEXT,BOOLEAN,BOOLEAN,TEXT,TEXT,TEXT,TEXT,INTEGER) TO authenticated;

-- Admin helper: grant credits / change plan
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(p_user UUID, p_amount INTEGER, p_reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET credits_balance = credits_balance + p_amount WHERE id = p_user;
  INSERT INTO public.credit_transactions (user_id, amount, reason) VALUES (p_user, p_amount, p_reason);
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(UUID, INTEGER, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_plan(p_user UUID, p_plan public.plan_type)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET plan_type = p_plan WHERE id = p_user;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_plan(UUID, public.plan_type) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(UUID, public.plan_type) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_role(p_user UUID, p_role public.app_role)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user, p_role) ON CONFLICT DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_grant_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(UUID, public.app_role) TO authenticated;
