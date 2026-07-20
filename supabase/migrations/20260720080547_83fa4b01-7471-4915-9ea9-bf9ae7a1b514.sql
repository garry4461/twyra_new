
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('customer', 'admin', 'production', 'qa');
CREATE TYPE public.plan_type AS ENUM ('credit', 'unlimited_monthly', 'none');
CREATE TYPE public.job_status AS ENUM ('submitted','under_production','in_review','completed','revision_requested');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  email TEXT,
  plan_type public.plan_type NOT NULL DEFAULT 'credit',
  credits_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','production','qa')) $$;

-- RLS policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_staff(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- Auto profile+role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_reference TEXT,
  po_number TEXT,
  notify_email TEXT NOT NULL,
  job_type INTEGER NOT NULL CHECK (job_type BETWEEN 1 AND 4),
  service TEXT NOT NULL, -- 'next_day' | 'same_day'
  need_quote BOOLEAN NOT NULL DEFAULT false,
  authorize_extra BOOLEAN NOT NULL DEFAULT false,
  color_scheme TEXT NOT NULL,
  additional_bw BOOLEAN NOT NULL DEFAULT false,
  color_separations BOOLEAN NOT NULL DEFAULT false,
  output_vector TEXT NOT NULL,   -- ai/eps/cdr
  output_raster TEXT NOT NULL,   -- jpg/gif/bmp
  output_other TEXT NOT NULL,    -- not_required/psd/pdf/tiff
  instructions TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  status public.job_status NOT NULL DEFAULT 'submitted',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs read own or staff" ON public.jobs FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "jobs insert own" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());
CREATE POLICY "jobs update own or staff" ON public.jobs FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (customer_id = auth.uid() OR public.is_staff(auth.uid()));

-- Job files (uploads + outputs)
CREATE TABLE public.job_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  size_bytes BIGINT,
  kind TEXT NOT NULL DEFAULT 'input', -- input | output
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.job_files TO authenticated;
GRANT ALL ON public.job_files TO service_role;
ALTER TABLE public.job_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_files read" ON public.job_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "job_files insert" ON public.job_files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))));

-- Credit transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- negative debit, positive credit
  reason TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct read own or staff" ON public.credit_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- Revisions
CREATE TABLE public.revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.revisions TO authenticated;
GRANT ALL ON public.revisions TO service_role;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rev read" ON public.revisions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "rev insert" ON public.revisions FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (j.customer_id = auth.uid() OR public.is_staff(auth.uid()))));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.tg_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();
CREATE TRIGGER trg_jobs_upd BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Storage policies for a private bucket 'job-files'
