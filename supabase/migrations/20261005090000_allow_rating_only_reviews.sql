ALTER TABLE public.reviews
  ALTER COLUMN name SET DEFAULT 'Paciente',
  ALTER COLUMN text DROP NOT NULL;

ALTER TABLE public.reviews
  DROP CONSTRAINT reviews_text_check;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_text_check
  CHECK (text IS NULL OR char_length(text) BETWEEN 3 AND 2000);