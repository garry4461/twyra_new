-- job_files: explicit staff-only update/delete with job ownership join
CREATE POLICY "job_files update staff" ON public.job_files
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_files.job_id AND public.is_staff(auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_files.job_id AND public.is_staff(auth.uid())));

CREATE POLICY "job_files delete staff" ON public.job_files
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_files.job_id AND public.is_staff(auth.uid())));

-- storage objects for job-files bucket: staff-only update/delete, ownership verified via jobs
CREATE POLICY "job-files update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'job-files' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = split_part(objects.name, '/', 1) AND public.is_staff(auth.uid())))
  WITH CHECK (bucket_id = 'job-files' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = split_part(objects.name, '/', 1) AND public.is_staff(auth.uid())));

CREATE POLICY "job-files delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'job-files' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = split_part(objects.name, '/', 1) AND public.is_staff(auth.uid())));

-- credit_transactions: explicit deny of all direct writes (ledger written only by SECURITY DEFINER functions)
CREATE POLICY "ct no direct insert" ON public.credit_transactions
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "ct no direct update" ON public.credit_transactions
  FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "ct no direct delete" ON public.credit_transactions
  FOR DELETE TO authenticated, anon USING (false);
REVOKE INSERT, UPDATE, DELETE ON public.credit_transactions FROM authenticated, anon;

-- support_leads: server-only inserts (service role), explicitly denied to clients
CREATE POLICY "support_leads no client insert" ON public.support_leads
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "support_leads no client delete" ON public.support_leads
  FOR DELETE TO authenticated, anon USING (false);
REVOKE INSERT, DELETE ON public.support_leads FROM authenticated, anon;
GRANT ALL ON public.support_leads TO service_role;

-- SECURITY DEFINER exposure: drop unused legacy function and revoke helper execution from clients
DROP FUNCTION IF EXISTS public.submit_job(text, text, text, integer, text, boolean, boolean, text, boolean, boolean, text, text, text, text, integer);
DROP FUNCTION IF EXISTS public.admin_set_plan(uuid, public.plan_type);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_adjust_credits(uuid, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_grant_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_job_v2(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(uuid, public.plan_type, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_job_v2(jsonb) TO authenticated;