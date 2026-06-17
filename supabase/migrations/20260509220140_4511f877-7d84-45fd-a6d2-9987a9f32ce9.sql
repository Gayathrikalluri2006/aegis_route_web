
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  night_mode_safety BOOLEAN NOT NULL DEFAULT true,
  avoid_isolated BOOLEAN NOT NULL DEFAULT true,
  prefer_crowded BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE public.saved_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  origin_text TEXT NOT NULL,
  destination_text TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  last_safety_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_routes_own_all" ON public.saved_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TYPE public.incident_type AS ENUM ('crime','accident','hazard','poor_lighting','crowd','weather','other');
CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  type public.incident_type NOT NULL,
  severity INT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_select_all" ON public.incident_reports FOR SELECT USING (true);
CREATE POLICY "incidents_insert_auth" ON public.incident_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "incidents_delete_own" ON public.incident_reports FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.route_score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_route_id UUID NOT NULL REFERENCES public.saved_routes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX route_score_snapshots_route_idx ON public.route_score_snapshots(saved_route_id, recorded_at);
ALTER TABLE public.route_score_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_select_own" ON public.route_score_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.saved_routes sr WHERE sr.id = saved_route_id AND sr.user_id = auth.uid()));
CREATE POLICY "snapshots_insert_own" ON public.route_score_snapshots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.saved_routes sr WHERE sr.id = saved_route_id AND sr.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
