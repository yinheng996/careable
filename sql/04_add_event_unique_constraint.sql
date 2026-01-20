-- Add unique constraint to events to allow for clean upserts from calendar extraction
ALTER TABLE public.events ADD CONSTRAINT events_title_start_time_key UNIQUE (title, start_time);
