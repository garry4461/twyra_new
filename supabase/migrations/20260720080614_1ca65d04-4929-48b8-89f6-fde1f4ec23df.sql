
-- Fix search_path on tg_updated_at
CREATE OR REPLACE FUNCTION public.tg_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Restrict execute on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Storage policies on job-files bucket. Path = {job_id}/{filename}
CREATE POLICY "job-files read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'job-files' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = split_part(name, '/', 1)
      AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))
  )
);
CREATE POLICY "job-files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'job-files' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id::text = split_part(name, '/', 1)
      AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))
  )
);
