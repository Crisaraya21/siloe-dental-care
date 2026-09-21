CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot_idx
ON public.appointments (preferred_date, preferred_time)
WHERE status IN ('pendiente', 'confirmada', 'reprogramada_propuesta');