CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  business_name text NOT NULL DEFAULT 'LM Barberia',
  business_address text DEFAULT '',
  business_phone text DEFAULT '',
  business_email text DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  currency text NOT NULL DEFAULT 'USD',
  currency_symbol text NOT NULL DEFAULT '$',
  visible_sections jsonb NOT NULL DEFAULT '{"income":true,"expenses":true,"clients":true,"appointments":true,"invoices":true,"team":true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
ON public.settings FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
ON public.settings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
ON public.settings FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();