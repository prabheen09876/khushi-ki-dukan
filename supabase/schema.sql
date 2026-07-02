-- ============================================================
-- Studio Khushi — Supabase schema
-- Run this once:  Supabase dashboard → SQL Editor → paste → Run
-- ============================================================

-- ---------- Tables ----------

-- Editable site content (hero + skills + contact), one row per section.
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Portfolio projects / case studies.
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  category        text default 'Project',
  introduction    text default '',
  description     text default '',
  objective       text default '',
  design_process  text default '',
  materials_used  text default '',
  final_outcome   text default '',
  images          jsonb not null default '[]'::jsonb,   -- array of public image URLs
  sort            int  default 0,
  created_at      timestamptz default now()
);

-- ---------- Seed the two content rows (safe to re-run) ----------
insert into public.site_settings (key, value) values
  ('home', jsonb_build_object(
      'hero_title', 'Designing Products, Patterns & Visual Stories.',
      'hero_description', 'I create modern product designs, surface patterns, textile prints, branding elements and creative concepts that blend aesthetics with function — repeats built to actually go to production.',
      'skills', jsonb_build_array(
        jsonb_build_object('name', 'Surface Pattern & Repeats',  'level', 98),
        jsonb_build_object('name', 'Textile & Print Development', 'level', 94),
        jsonb_build_object('name', 'Product & Furniture Design',  'level', 88),
        jsonb_build_object('name', 'Brand Identity & Direction',  'level', 90)
      )
  )),
  ('contact', jsonb_build_object(
      'name', 'Khushi',
      'phone', '+91 00000 00000',
      'email', 'hello@studiokhushi.example',
      'location', 'Jaipur, India — working worldwide, GMT+5:30',
      'linkedin', '',
      'instagram', '',
      'behance', ''
  ))
on conflict (key) do nothing;

-- ---------- Storage bucket for uploaded project images ----------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.site_settings enable row level security;
alter table public.projects      enable row level security;

-- Everyone can READ site content + projects (needed for the public site).
create policy "public read settings" on public.site_settings for select using (true);
create policy "public read projects" on public.projects      for select using (true);

-- ------------------------------------------------------------
-- ⚠️  DEVELOPMENT WRITE ACCESS  ⚠️
-- These policies let the admin panel save using only the public
-- anon key — matching the "hard-coded login for now" you asked
-- for. It means anyone who has your anon key COULD write too.
-- Fine while you build; DO NOT ship to production as-is.
-- ------------------------------------------------------------
create policy "anon write settings" on public.site_settings for all using (true) with check (true);
create policy "anon write projects" on public.projects      for all using (true) with check (true);

-- Storage: public read + open write (development).
create policy "public read images"  on storage.objects for select using (bucket_id = 'project-images');
create policy "anon upload images"   on storage.objects for insert with check (bucket_id = 'project-images');
create policy "anon update images"   on storage.objects for update using (bucket_id = 'project-images');
create policy "anon delete images"   on storage.objects for delete using (bucket_id = 'project-images');


-- ============================================================
-- 🔒  PRODUCTION UPGRADE — real security with Supabase Auth
-- ------------------------------------------------------------
-- When you're ready to go live, do the following and the site
-- becomes properly locked down:
--
-- 1. Supabase dashboard → Authentication → Users → "Add user".
--    Create one user, e.g.  admin@studiokhushi.com / a-strong-password
--
-- 2. In assets/js/admin.js, switch the login to Supabase Auth
--    (a ready-made snippet is in ADMIN.md).
--
-- 3. Replace the development write policies above by running:
--
--    drop policy "anon write settings" on public.site_settings;
--    drop policy "anon write projects" on public.projects;
--    drop policy "anon upload images"  on storage.objects;
--    drop policy "anon update images"  on storage.objects;
--    drop policy "anon delete images"  on storage.objects;
--
--    create policy "auth write settings" on public.site_settings
--      for all to authenticated using (true) with check (true);
--    create policy "auth write projects" on public.projects
--      for all to authenticated using (true) with check (true);
--    create policy "auth manage images" on storage.objects
--      for all to authenticated using (bucket_id = 'project-images')
--      with check (bucket_id = 'project-images');
--
-- Now only a signed-in admin can change anything, even though the
-- anon key stays public. ✅
-- ============================================================
