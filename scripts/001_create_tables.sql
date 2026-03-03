-- Profiles table (auto-created on signup via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT DEFAULT 'Trader',
  bio TEXT DEFAULT '',
  avatar_index INTEGER DEFAULT 0,
  custom_avatar_url TEXT,
  account_size NUMERIC DEFAULT 10000,
  accent_color TEXT DEFAULT 'blue',
  finnhub_api_key TEXT DEFAULT '',
  balance NUMERIC DEFAULT 10000,
  initial_balance NUMERIC DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  asset TEXT NOT NULL DEFAULT '',
  result NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trades_select_own" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trades_insert_own" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trades_update_own" ON public.trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trades_delete_own" ON public.trades FOR DELETE USING (auth.uid() = user_id);

-- Weekly notes table
CREATE TABLE IF NOT EXISTS public.weekly_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  notes TEXT DEFAULT '',
  balance_change NUMERIC DEFAULT 0,
  goal_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weekly_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weekly_notes_select_own" ON public.weekly_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weekly_notes_insert_own" ON public.weekly_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_notes_update_own" ON public.weekly_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "weekly_notes_delete_own" ON public.weekly_notes FOR DELETE USING (auth.uid() = user_id);

-- Mistakes table
CREATE TABLE IF NOT EXISTS public.mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT DEFAULT '',
  tag TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mistakes_select_own" ON public.mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mistakes_insert_own" ON public.mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mistakes_update_own" ON public.mistakes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mistakes_delete_own" ON public.mistakes FOR DELETE USING (auth.uid() = user_id);

-- Important points table
CREATE TABLE IF NOT EXISTS public.important_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT DEFAULT '',
  pinned BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.important_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "important_points_select_own" ON public.important_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "important_points_insert_own" ON public.important_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "important_points_update_own" ON public.important_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "important_points_delete_own" ON public.important_points FOR DELETE USING (auth.uid() = user_id);

-- Rules table
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_select_own" ON public.rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rules_insert_own" ON public.rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rules_update_own" ON public.rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rules_delete_own" ON public.rules FOR DELETE USING (auth.uid() = user_id);

-- Skip days table
CREATE TABLE IF NOT EXISTS public.skip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.skip_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skip_days_select_own" ON public.skip_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skip_days_insert_own" ON public.skip_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skip_days_update_own" ON public.skip_days FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "skip_days_delete_own" ON public.skip_days FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, account_size, balance, initial_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'Trader'),
    COALESCE((NEW.raw_user_meta_data ->> 'account_size')::numeric, 10000),
    COALESCE((NEW.raw_user_meta_data ->> 'account_size')::numeric, 10000),
    COALESCE((NEW.raw_user_meta_data ->> 'account_size')::numeric, 10000)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert default rules for new user
  INSERT INTO public.rules (user_id, text, sort_order) VALUES
    (NEW.id, 'Only trade after 11:00 Dubai time (GMT+4)', 0),
    (NEW.id, 'Close all positions by 22:00 Dubai time', 1),
    (NEW.id, 'Maximum 1 trade per day', 2),
    (NEW.id, 'Use 15-minute chart for analysis', 3),
    (NEW.id, 'Weekly goal: +2% on account', 4),
    (NEW.id, '1 profitable trade per week = week is done', 5);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "avatar_select_all" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "avatar_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mistakes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.important_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skip_days;
