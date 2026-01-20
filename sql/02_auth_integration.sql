-- 1. Helper Functions to extract Clerk JWT Claims
-- These functions allow Postgres to understand who is making the request via the Clerk JWT.

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS TEXT AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text;
$$ LANGUAGE sql STABLE;

-- 2. Drop existing policies to replace them with JWT-based logic
-- (Referencing policies from 01_supabase_schema.sql)

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Staff and Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Staff can update registration status" ON public.registrations;

-- 3. New RLS Policies using JWT Claims

-- PROFILES
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (
    requesting_user_id() = id::text 
    OR managed_by::text = requesting_user_id()
);

CREATE POLICY "Staff and Admins can view all profiles"
ON public.profiles FOR SELECT
USING (requesting_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (requesting_user_id() = id::text);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (requesting_user_id() = id::text)
WITH CHECK (requesting_user_id() = id::text);

-- EVENTS
CREATE POLICY "Anyone can view events" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Staff can manage events"
ON public.events FOR ALL
USING (requesting_user_role() IN ('admin', 'staff'))
WITH CHECK (requesting_user_role() IN ('admin', 'staff'));

-- REGISTRATIONS
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
USING (
    requesting_user_id() = user_id::text 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id::text = registrations.user_id::text 
        AND managed_by::text = requesting_user_id()
    )
);

CREATE POLICY "Staff can manage registrations"
ON public.registrations FOR ALL
USING (requesting_user_role() IN ('admin', 'staff'))
WITH CHECK (requesting_user_role() IN ('admin', 'staff'));

-- 4. Update Security Definer Function (if still used, though JWT is now preferred)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN requesting_user_role() IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
