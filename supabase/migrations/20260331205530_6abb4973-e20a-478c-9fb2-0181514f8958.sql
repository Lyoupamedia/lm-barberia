
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_name text NOT NULL DEFAULT '',
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_name text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_by jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view notifications
CREATE POLICY "Authenticated can view notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (true);

-- All authenticated users can insert notifications
CREATE POLICY "Authenticated can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Admin can delete old notifications
CREATE POLICY "Admin can delete notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated can update (to mark as read)
CREATE POLICY "Authenticated can update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
