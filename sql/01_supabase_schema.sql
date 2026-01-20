-- 1. Create Custom Enums
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'volunteer', 'caregiver', 'participant');
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'cancelled');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- Matches Clerk User ID (casted to UUID)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'participant' NOT NULL,
  membership_type TEXT, -- e.g., 'Ad hoc', 'Once a week'
  managed_by UUID REFERENCES public.profiles(id), -- Self-reference for Caregiver -> Participant link
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  is_accessible BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Registrations Table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  ticket_code TEXT UNIQUE NOT NULL, -- For QR scanning
  status registration_status DEFAULT 'registered' NOT NULL,
  check_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id) -- Prevent double registration
);

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid()::text = id::text OR managed_by::text = auth.uid()::text);

CREATE POLICY "Staff and Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  )
);

-- 7. RLS Policies: Events
CREATE POLICY "Anyone can view events" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Staff and Admins can manage events"
ON public.events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  )
);

-- 8. RLS Policies: Registrations
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
USING (auth.uid()::text = user_id::text OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id::text = registrations.user_id::text AND managed_by::text = auth.uid()::text
));

CREATE POLICY "Staff can update registration status"
ON public.registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id::text = auth.uid()::text AND role IN ('admin', 'staff')
  )
);
