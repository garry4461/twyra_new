CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_free_credits INTEGER := 10;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, phone, address_line1, address_line2, city, postcode, country, plan_type, plan_name, credits_balance)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address_line1',
    NEW.raw_user_meta_data->>'address_line2',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postcode',
    NEW.raw_user_meta_data->>'country',
    'credit', 'Trial Pack', v_free_credits);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');

  INSERT INTO public.credit_transactions (user_id, amount, reason)
  VALUES (NEW.id, v_free_credits, 'Welcome trial pack — 10 free credits');

  RETURN NEW;
END; $function$;