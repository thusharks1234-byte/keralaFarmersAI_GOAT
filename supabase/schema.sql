-- Krishi Mithram Full Database Schema
-- Run this in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/tdeoemixcmqkvkyygtke/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (links to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ml')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- FARMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_name TEXT,
  district TEXT,
  village TEXT,
  pincode TEXT,
  latitude FLOAT,
  longitude FLOAT,
  area_acres FLOAT,
  farm_type TEXT,
  farming_experience_years INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SOIL DATA
-- ============================================
CREATE TABLE IF NOT EXISTS public.soil_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  soil_type TEXT,
  ph FLOAT,
  nitrogen INT,
  phosphorus INT,
  potassium INT,
  water_availability TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CROP CYCLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.crop_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  crop_name TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  planting_date DATE,
  expected_harvest_date DATE,
  previous_crop TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- FARM ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.farm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- FARM TASKS (Calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS public.farm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('irrigation','fertilizer','pest_control','weeding','harvest','other')),
  due_date DATE NOT NULL,
  reminder BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CHAT SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- USER PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  units TEXT DEFAULT 'metric',
  notifications_enabled BOOLEAN DEFAULT true,
  notify_disease_doctor BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- FARMS policies
CREATE POLICY "Users can CRUD own farms" ON public.farms FOR ALL USING (auth.uid() = owner_id);

-- SOIL DATA policies
CREATE POLICY "Users can CRUD soil data for their farms" ON public.soil_data
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = soil_data.farm_id AND farms.owner_id = auth.uid())
  );

-- CROP CYCLES policies
CREATE POLICY "Users can CRUD crop cycles for their farms" ON public.crop_cycles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = crop_cycles.farm_id AND farms.owner_id = auth.uid())
  );

-- FARM ACTIVITIES policies
CREATE POLICY "Users can CRUD farm activities" ON public.farm_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_activities.farm_id AND farms.owner_id = auth.uid())
  );

-- FARM TASKS policies
CREATE POLICY "Users can CRUD farm tasks" ON public.farm_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_tasks.farm_id AND farms.owner_id = auth.uid())
  );

-- CHAT SESSIONS policies
CREATE POLICY "Users can CRUD own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = owner_id);

-- CHAT MESSAGES policies
CREATE POLICY "Users can CRUD messages in their sessions" ON public.chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.owner_id = auth.uid())
  );

-- USER PREFERENCES policies
CREATE POLICY "Users can CRUD own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = owner_id);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
