BEGIN;

-- 1. Dynamically drop EVERY policy on the affected tables
-- This ensures no hidden or misnamed policies block the column type change.
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'events', 'registrations'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Disable RLS to further ensure dependencies are cleared
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;

-- 3. Drop foreign key constraints
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_managed_by_fkey;

-- 4. Change column types to TEXT (Casting UUID to TEXT)
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.profiles ALTER COLUMN managed_by TYPE TEXT USING managed_by::text;
ALTER TABLE public.events ALTER COLUMN created_by TYPE TEXT USING created_by::text;
ALTER TABLE public.registrations ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- 5. Re-add foreign key constraints
ALTER TABLE public.profiles ADD CONSTRAINT profiles_managed_by_fkey FOREIGN KEY (managed_by) REFERENCES public.profiles(id);
ALTER TABLE public.events ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
ALTER TABLE public.registrations ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- 6. Re-create Helper Functions with Clerk JWT logic
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS TEXT AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'app_role', '')::text;
$$ LANGUAGE sql STABLE;

-- 7. Re-create Security Definer for staff checks
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = public.requesting_user_id()) IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 9. Re-create all RLS Policies from scratch

-- PROFILES
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (requesting_user_id() = id OR managed_by = requesting_user_id());

CREATE POLICY "Staff and Admins can view all profiles"
ON public.profiles FOR SELECT
USING (requesting_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (requesting_user_id() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (requesting_user_id() = id)
WITH CHECK (requesting_user_id() = id);

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
    requesting_user_id() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = registrations.user_id 
        AND managed_by = requesting_user_id()
    )
);

CREATE POLICY "Staff can manage registrations"
ON public.registrations FOR ALL
USING (requesting_user_role() IN ('admin', 'staff'))
WITH CHECK (requesting_user_role() IN ('admin', 'staff'));

COMMIT;
