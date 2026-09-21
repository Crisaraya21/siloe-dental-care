ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS action_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS appointments_action_token_idx
  ON public.appointments (action_token);
