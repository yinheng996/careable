-- Fix RLS policies for QR code generation and verification
-- This allows users to update their own registration's ticket_code when generating QR codes

-- 1. Allow users to UPDATE their own registrations (specifically ticket_code)
DROP POLICY IF EXISTS "Users can update own registrations" ON public.registrations;
CREATE POLICY "Users can update own registrations"
ON public.registrations FOR UPDATE
USING (requesting_user_id() = user_id)
WITH CHECK (requesting_user_id() = user_id);

-- 2. Ensure staff can still update any registration for check-in
-- (This should already exist, but let's make sure it's comprehensive)
DROP POLICY IF EXISTS "Staff can update all registrations" ON public.registrations;
CREATE POLICY "Staff can update all registrations"
ON public.registrations FOR UPDATE
USING (requesting_user_role() IN ('admin', 'staff'))
WITH CHECK (requesting_user_role() IN ('admin', 'staff'));

-- 3. Allow caregivers to update registrations for participants they manage
DROP POLICY IF EXISTS "Caregivers can update managed registrations" ON public.registrations;
CREATE POLICY "Caregivers can update managed registrations"
ON public.registrations FOR UPDATE
USING (
  requesting_user_role() = 'caregiver' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = registrations.user_id
    AND profiles.managed_by = requesting_user_id()
  )
)
WITH CHECK (
  requesting_user_role() = 'caregiver' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = registrations.user_id
    AND profiles.managed_by = requesting_user_id()
  )
);
