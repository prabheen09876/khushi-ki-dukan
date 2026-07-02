# Studio Khushi — Admin Panel

A small, secure-enough admin dashboard for editing your site content, backed by
[Supabase](https://supabase.com). The public site stays exactly as designed —
the admin just feeds it live content.

Open **`admin.html`** to log in.

- **Admin ID:** `admin`
- **Password:** `admin123`

> Change these in [`assets/js/supabase-config.js`](assets/js/supabase-config.js)
> (`ADMIN_CREDENTIALS`). See the **Security** note at the bottom before going live.

---

## What you can edit

| Section | You can change |
| --- | --- |
| **Home** | Hero title, hero description, and your skills (add / remove / reorder by editing). |
| **Projects** | Add, edit and delete projects. Upload multiple images. Fields: Title, Category, Introduction, Description, Objective, Design Process, Materials Used, Final Outcome. |
| **Contact** | Name, Phone, Email, Location, LinkedIn, Instagram, Behance. |

Saved changes appear on the website on the next page refresh. Uploaded projects
show up in the **Portfolio** grid and open as full case-study pages.

---

## One-time setup (about 5 minutes)

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → **New project**. Wait for it to
finish provisioning.

### 2. Add your keys
In Supabase: **Project Settings → API**. Copy:
- **Project URL**
- **anon / public** key

Paste them into [`assets/js/supabase-config.js`](assets/js/supabase-config.js):

```js
window.SUPABASE_CONFIG = {
  url:     'https://YOURPROJECT.supabase.co',
  anonKey: 'eyJhbGciOi...your-anon-key...',
  bucket:  'project-images'
};
```

### 3. Create the database
In Supabase: **SQL Editor → New query** → paste the entire contents of
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

This creates the tables, seeds your current content, makes the image storage
bucket, and sets the access rules.

### 4. Done
Open `admin.html`, log in, and start editing. If Supabase isn’t connected yet,
the dashboard still opens but shows a **“Demo mode”** banner and can’t save.

---

## How it works

- **`assets/js/store.js`** is the shared data layer. Both the public site and the
  admin read/write through it. If Supabase is unreachable or unconfigured, it
  falls back to the built-in demo content, so the site **never breaks**.
- Content lives in two Supabase tables: `site_settings` (hero + skills + contact)
  and `projects`. Images live in the `project-images` storage bucket.
- The public pages ([index.html](index.html), [project.html](project.html)) load
  their default design instantly, then quietly patch in your saved content.

---

## 🔒 Security — please read before publishing

The `admin` / `admin123` login only hides the dashboard in the browser. It is
**not real security** — and the development database rules let anyone with your
public key write data. That’s fine while you build, **not** for a live site.

When you’re ready to go public, switch to **Supabase Auth** (about 5 minutes):

1. Supabase → **Authentication → Users → Add user**. Create one admin user, e.g.
   `admin@studiokhushi.com` with a strong password.

2. Run the production policy block at the bottom of
   [`supabase/schema.sql`](supabase/schema.sql) (it’s written out and ready).

3. In [`assets/js/admin.js`](assets/js/admin.js), replace the login handler’s
   `Store.login(...)` check with Supabase Auth:

   ```js
   // inside the #loginForm submit handler
   var email = $('#adId').value.trim();      // now an email
   var pw = $('#adPw').value;
   supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
     .auth.signInWithPassword({ email: email, password: pw })
     .then(function (res) {
       if (res.error) { $('#loginErr').textContent = 'Invalid ID or Password'; return; }
       showDashboard();
     });
   ```

Now only a signed-in admin can change anything, even though the anon key stays
public. ✅
