/* ============================================================
   Studio Khushi — Supabase + Admin configuration
   ------------------------------------------------------------
   1. Create a free project at https://supabase.com
   2. Project Settings → API → copy the "Project URL" and the
      "anon / public" key into the two fields below.
   3. Run the SQL in  supabase/schema.sql  (SQL Editor → Run).
   4. Open  admin.html  and log in.

   Until you fill these in, the site runs on its built-in demo
   content — nothing breaks, the admin just can't save yet.
   ============================================================ */
window.SUPABASE_CONFIG = {
  url:     'https://ypcsczvmfyggluxextom.supabase.co',
  anonKey: 'sb_publishable_XhSaJKR-aNV1Jq4R61Damw_e_j7NRvu',  // publishable (client-safe) key
  bucket:  'project-images'           // storage bucket for uploads (created by schema.sql)
};

/* ------------------------------------------------------------
   Admin login (hard-coded, as requested — change these!).
   NOTE: this only gates the dashboard UI in the browser. It is
   NOT real security. Anyone determined can read these values in
   the page source. Before this site is public, move to Supabase
   Auth — see the commented section in supabase/schema.sql.
   ------------------------------------------------------------ */
window.ADMIN_CREDENTIALS = {
  id:       'admin',
  password: 'admin123'
};
