-- Migration 08: Enhanced Schema for Caregiver Relationships and Attendance Tracking
-- Author: Careable Team
-- Date: January 2026
-- Dependencies: Migrations 01-07
-- Description: Adds caregiver-participant relationships, enhanced attendance tracking,
--              event metadata, and analytics views

BEGIN;

-- ============================================================================
-- PART 1: CAREGIVER-PARTICIPANT RELATIONSHIPS
-- ============================================================================

-- 1.1: Add participant metadata to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS participant_full_name TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' 
  CHECK (language_preference IN ('en', 'zh', 'ms')),
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

COMMENT ON COLUMN public.profiles.participant_full_name 
  IS 'Full name of participant (used when caregiver registers on their behalf)';
COMMENT ON COLUMN public.profiles.language_preference 
  IS 'UI language preference: en (English), zh (Chinese), ms (Malay)';
COMMENT ON COLUMN public.profiles.special_needs 
  IS 'Accessibility requirements or special needs notes';
COMMENT ON COLUMN public.profiles.emergency_contact 
  IS 'Emergency contact information for participants';

-- 1.2: Create caregiver-participant relationship table
CREATE TABLE IF NOT EXISTS public.caregiver_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL 
    CHECK (relationship IN ('parent', 'guardian', 'sibling', 'relative', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_caregiver_participants_caregiver 
  ON public.caregiver_participants(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_participants_participant 
  ON public.caregiver_participants(participant_id);

COMMENT ON TABLE public.caregiver_participants 
  IS 'Links caregivers to the participants they manage (e.g., parents to children)';

-- 1.3: RLS policies for caregiver_participants
ALTER TABLE public.caregiver_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their managed participants"
ON public.caregiver_participants FOR SELECT
USING (
  caregiver_id = requesting_user_id() 
  OR requesting_user_role() IN ('admin', 'staff')
);

CREATE POLICY "Caregivers can add managed participants"
ON public.caregiver_participants FOR INSERT
WITH CHECK (caregiver_id = requesting_user_id());

CREATE POLICY "Caregivers can update their relationships"
ON public.caregiver_participants FOR UPDATE
USING (caregiver_id = requesting_user_id())
WITH CHECK (caregiver_id = requesting_user_id());

CREATE POLICY "Caregivers can remove their relationships"
ON public.caregiver_participants FOR DELETE
USING (caregiver_id = requesting_user_id());

-- 1.4: Update profile RLS to allow caregivers to view managed participants
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (
  requesting_user_id() = id 
  OR managed_by = requesting_user_id()
  OR id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
  OR requesting_user_role() IN ('admin', 'staff')
);

-- 1.5: Update registration INSERT policy for caregiver registrations
DROP POLICY IF EXISTS "Users can register for events" ON public.registrations;
CREATE POLICY "Users can register for events"
ON public.registrations FOR INSERT
WITH CHECK (
  requesting_user_id() = user_id
  OR user_id IN (
    SELECT participant_id FROM public.caregiver_participants 
    WHERE caregiver_id = requesting_user_id()
  )
  OR requesting_user_role() IN ('admin', 'staff')
);

-- ============================================================================
-- PART 2: ENHANCED ATTENDANCE TRACKING
-- ============================================================================

-- 2.1: Add attendance tracking fields
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS checked_in_by TEXT REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS attendance_notes TEXT,
ADD COLUMN IF NOT EXISTS registration_source TEXT DEFAULT 'self' 
  CHECK (registration_source IN ('self', 'caregiver', 'staff'));

COMMENT ON COLUMN public.registrations.checked_in_by 
  IS 'Staff member who scanned the QR code and verified attendance';
COMMENT ON COLUMN public.registrations.attendance_notes 
  IS 'Optional notes from staff during check-in (e.g., late arrival, early departure)';
COMMENT ON COLUMN public.registrations.registration_source 
  IS 'Who registered: self (participant), caregiver, or staff';

-- 2.2: Add performance indexes for check-in queries
CREATE INDEX IF NOT EXISTS idx_registrations_check_in 
ON public.registrations(event_id, check_in_at) 
WHERE check_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_checked_in_by 
ON public.registrations(checked_in_by) 
WHERE checked_in_by IS NOT NULL;

-- ============================================================================
-- PART 3: ENHANCED EVENT MODEL
-- ============================================================================

-- 3.1: Add event metadata
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'both' 
  CHECK (target_audience IN ('participants', 'volunteers', 'both')),
ADD COLUMN IF NOT EXISTS min_age INTEGER CHECK (min_age >= 0),
ADD COLUMN IF NOT EXISTS max_age INTEGER CHECK (max_age >= min_age),
ADD COLUMN IF NOT EXISTS requires_guardian BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.events.image_url 
  IS 'Optional event banner/poster image URL (from storage)';
COMMENT ON COLUMN public.events.target_audience 
  IS 'Whether event is for participants, volunteers, or both';
COMMENT ON COLUMN public.events.min_age 
  IS 'Minimum age requirement (null = no restriction)';
COMMENT ON COLUMN public.events.max_age 
  IS 'Maximum age requirement (null = no restriction)';
COMMENT ON COLUMN public.events.requires_guardian 
  IS 'Whether event requires guardian/caregiver accompaniment';

-- ============================================================================
-- PART 4: ANALYTICS HELPER VIEWS (Read-only, Staff/Admin only)
-- ============================================================================

-- 4.1: Attendance summary view
CREATE OR REPLACE VIEW public.event_attendance_summary AS
SELECT 
  e.id AS event_id,
  e.title,
  e.start_time,
  e.location,
  e.capacity,
  e.status,
  COUNT(r.id) AS total_registrations,
  COUNT(r.check_in_at) AS total_attended,
  ROUND(
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN (COUNT(r.check_in_at)::decimal / COUNT(r.id)::decimal) * 100 
      ELSE 0 
    END, 
    2
  ) AS attendance_rate_percent,
  e.created_by,
  p.full_name AS created_by_name
FROM public.events e
LEFT JOIN public.registrations r ON e.id = r.event_id
LEFT JOIN public.profiles p ON e.created_by = p.id
GROUP BY e.id, e.title, e.start_time, e.location, e.capacity, e.status, e.created_by, p.full_name;

COMMENT ON VIEW public.event_attendance_summary 
  IS 'Analytics view for event attendance metrics (staff/admin only)';

-- 4.2: User engagement view
CREATE OR REPLACE VIEW public.user_engagement_summary AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  COUNT(r.id) AS total_registrations,
  COUNT(r.check_in_at) AS total_attended,
  ROUND(
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN (COUNT(r.check_in_at)::decimal / COUNT(r.id)::decimal) * 100 
      ELSE 0 
    END, 
    2
  ) AS attendance_rate_percent,
  MAX(r.check_in_at) AS last_attended_at
FROM public.profiles p
LEFT JOIN public.registrations r ON p.id = r.user_id
WHERE p.role IN ('participant', 'volunteer')
GROUP BY p.id, p.full_name, p.email, p.role;

COMMENT ON VIEW public.user_engagement_summary 
  IS 'Analytics view for user engagement metrics (staff/admin only)';

-- 4.3: Staff productivity view
CREATE OR REPLACE VIEW public.staff_productivity_summary AS
SELECT 
  p.id AS staff_id,
  p.full_name AS staff_name,
  COUNT(DISTINCT e.id) AS events_created,
  COUNT(DISTINCT r.id) AS check_ins_performed,
  SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_events
FROM public.profiles p
LEFT JOIN public.events e ON p.id = e.created_by
LEFT JOIN public.registrations r ON p.id = r.checked_in_by
WHERE p.role IN ('staff', 'admin')
GROUP BY p.id, p.full_name;

COMMENT ON VIEW public.staff_productivity_summary 
  IS 'Analytics view for staff productivity metrics (admin only)';

-- ============================================================================
-- PART 5: HELPER FUNCTIONS AND TRIGGERS
-- ============================================================================

-- 5.1: Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.2: Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5.3: Apply updated_at trigger to caregiver_participants
DROP TRIGGER IF EXISTS update_caregiver_participants_updated_at ON public.caregiver_participants;
CREATE TRIGGER update_caregiver_participants_updated_at
BEFORE UPDATE ON public.caregiver_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migration to verify success:
--
-- 1. Check new columns exist:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'events', 'registrations', 'caregiver_participants')
-- ORDER BY table_name, ordinal_position;
--
-- 2. Check new policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- 3. Check indexes created:
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('registrations', 'caregiver_participants')
-- ORDER BY tablename, indexname;
--
-- 4. Check views created:
-- SELECT table_name, view_definition 
-- FROM information_schema.views 
-- WHERE table_schema = 'public';
--
-- 5. Verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
