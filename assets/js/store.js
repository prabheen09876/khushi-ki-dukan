/* ============================================================
   Studio Khushi — data layer (Supabase)
   ------------------------------------------------------------
   One small API used by both the public site and the admin.
   - Reads content + projects (falls back to built-in demo data
     so the site NEVER breaks if Supabase isn't set up yet).
   - Writes are used only by the admin panel.
   - Auth here is the hard-coded gate you asked for; it protects
     the dashboard UI only. See supabase/schema.sql for the
     production-grade Supabase Auth upgrade.
   ============================================================ */
window.Store = (function () {
  'use strict';

  var CFG = window.SUPABASE_CONFIG || {};
  var CREDS = window.ADMIN_CREDENTIALS || { id: 'admin', password: 'admin123' };
  var BUCKET = CFG.bucket || 'project-images';
  var SESSION_KEY = 'khushi:admin';
  var CACHE_CONTENT = 'khushi:content';
  var CACHE_PROJECTS = 'khushi:projects';

  /* ---- built-in defaults: identical to the current site ---- */
  var DEFAULT_CONTENT = {
    hero_title: 'Designing Products, Patterns & Visual Stories.',
    hero_description: 'I create modern product designs, surface patterns, textile prints, branding elements and creative concepts that blend aesthetics with function — repeats built to actually go to production.',
    skills: [
      { name: 'Surface Pattern & Repeats', level: 98 },
      { name: 'Textile & Print Development', level: 94 },
      { name: 'Product & Furniture Design', level: 88 },
      { name: 'Brand Identity & Direction', level: 90 }
    ],
    contact: {
      name: 'Khushi',
      phone: '+91 00000 00000',
      email: 'hello@studiokhushi.example',
      location: 'Jaipur, India — working worldwide, GMT+5:30',
      linkedin: '',
      instagram: '',
      behance: ''
    }
  };

  /* ---------------------------------------------------------
     Config + client
     --------------------------------------------------------- */
  function configured() {
    return !!(CFG.url && CFG.anonKey &&
      CFG.url.indexOf('YOUR_SUPABASE') === -1 &&
      CFG.anonKey.indexOf('YOUR_SUPABASE') === -1 &&
      window.supabase && window.supabase.createClient);
  }

  var _client = null;
  function client() {
    if (!configured()) return null;
    if (!_client) _client = window.supabase.createClient(CFG.url, CFG.anonKey);
    return _client;
  }

  /* ---------------------------------------------------------
     Tiny cache helpers (instant paint + offline resilience)
     --------------------------------------------------------- */
  function readCache(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function writeCache(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function mergeContent(home, contact) {
    var d = DEFAULT_CONTENT;
    home = home || {};
    contact = contact || {};
    return {
      hero_title: home.hero_title || d.hero_title,
      hero_description: home.hero_description || d.hero_description,
      skills: (Array.isArray(home.skills) && home.skills.length) ? home.skills : d.skills,
      contact: {
        name: contact.name || d.contact.name,
        phone: contact.phone || d.contact.phone,
        email: contact.email || d.contact.email,
        location: contact.location || d.contact.location,
        linkedin: contact.linkedin || '',
        instagram: contact.instagram || '',
        behance: contact.behance || ''
      }
    };
  }

  /* ---------------------------------------------------------
     READ — content (home + contact settings)
     --------------------------------------------------------- */
  function getContent() {
    if (!configured()) {
      return Promise.resolve(readCache(CACHE_CONTENT) || mergeContent(null, null));
    }
    return client()
      .from('site_settings').select('key,value').in('key', ['home', 'contact'])
      .then(function (res) {
        if (res.error) throw res.error;
        var home = null, contact = null;
        (res.data || []).forEach(function (row) {
          if (row.key === 'home') home = row.value;
          if (row.key === 'contact') contact = row.value;
        });
        var merged = mergeContent(home, contact);
        writeCache(CACHE_CONTENT, merged);
        return merged;
      })
      .catch(function () {
        return readCache(CACHE_CONTENT) || mergeContent(null, null);
      });
  }

  /* ---------------------------------------------------------
     READ — projects
     --------------------------------------------------------- */
  function normalizeProject(p) {
    p = p || {};
    return {
      id: p.id,
      title: p.title || 'Untitled project',
      category: p.category || 'Project',
      introduction: p.introduction || '',
      description: p.description || '',
      objective: p.objective || '',
      design_process: p.design_process || '',
      materials_used: p.materials_used || '',
      final_outcome: p.final_outcome || '',
      images: Array.isArray(p.images) ? p.images : [],
      sort: typeof p.sort === 'number' ? p.sort : 0
    };
  }

  function getProjects() {
    if (!configured()) {
      return Promise.resolve(readCache(CACHE_PROJECTS) || []);
    }
    return client()
      .from('projects').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        var list = (res.data || []).map(normalizeProject);
        writeCache(CACHE_PROJECTS, list);
        return list;
      })
      .catch(function () {
        return readCache(CACHE_PROJECTS) || [];
      });
  }

  function getProjectById(id) {
    return getProjects().then(function (list) {
      for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return list[i];
      return null;
    });
  }

  /* ---------------------------------------------------------
     AUTH (hard-coded gate — dashboard UI only)
     --------------------------------------------------------- */
  function login(id, password) {
    if (id === CREDS.id && password === CREDS.password) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
      return true;
    }
    return false;
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  function isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  /* ---------------------------------------------------------
     WRITE (admin only) — every method needs Supabase configured
     --------------------------------------------------------- */
  function requireDB() {
    var c = client();
    if (!c) throw new Error('Supabase isn’t connected yet. Add your project URL and anon key in assets/js/supabase-config.js, then run supabase/schema.sql.');
    return c;
  }

  function upsertSetting(key, value) {
    var c = requireDB();
    return c.from('site_settings')
      .upsert({ key: key, value: value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .then(function (res) { if (res.error) throw res.error; return true; });
  }

  function saveHome(data) {
    var payload = {
      hero_title: (data.hero_title || '').trim(),
      hero_description: (data.hero_description || '').trim(),
      skills: (data.skills || []).map(function (s) {
        return { name: (s.name || '').trim(), level: Math.max(0, Math.min(100, parseInt(s.level, 10) || 0)) };
      }).filter(function (s) { return s.name; })
    };
    return upsertSetting('home', payload).then(function () {
      var cached = readCache(CACHE_CONTENT) || mergeContent(null, null);
      cached.hero_title = payload.hero_title || DEFAULT_CONTENT.hero_title;
      cached.hero_description = payload.hero_description || DEFAULT_CONTENT.hero_description;
      cached.skills = payload.skills.length ? payload.skills : DEFAULT_CONTENT.skills;
      writeCache(CACHE_CONTENT, cached);
      return true;
    });
  }

  function saveContact(data) {
    var payload = {
      name: (data.name || '').trim(),
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      location: (data.location || '').trim(),
      linkedin: (data.linkedin || '').trim(),
      instagram: (data.instagram || '').trim(),
      behance: (data.behance || '').trim()
    };
    return upsertSetting('contact', payload).then(function () {
      var cached = readCache(CACHE_CONTENT) || mergeContent(null, null);
      cached.contact = mergeContent(null, payload).contact;
      writeCache(CACHE_CONTENT, cached);
      return true;
    });
  }

  function saveProject(project) {
    var c = requireDB();
    var row = {
      title: (project.title || '').trim() || 'Untitled project',
      category: (project.category || '').trim() || 'Project',
      introduction: project.introduction || '',
      description: project.description || '',
      objective: project.objective || '',
      design_process: project.design_process || '',
      materials_used: project.materials_used || '',
      final_outcome: project.final_outcome || '',
      images: Array.isArray(project.images) ? project.images : [],
      sort: typeof project.sort === 'number' ? project.sort : 0
    };
    var q = project.id
      ? c.from('projects').update(row).eq('id', project.id).select().single()
      : c.from('projects').insert(row).select().single();
    return q.then(function (res) { if (res.error) throw res.error; return normalizeProject(res.data); });
  }

  function deleteProject(id) {
    var c = requireDB();
    return c.from('projects').delete().eq('id', id)
      .then(function (res) { if (res.error) throw res.error; return true; });
  }

  /* ---------------------------------------------------------
     Image upload → Supabase Storage, returns a public URL
     --------------------------------------------------------- */
  function uploadImage(file) {
    var c = requireDB();
    var safe = (file.name || 'image').toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
    var path = 'projects/' + Date.now() + '-' + Math.round(Math.random() * 1e6) + '-' + safe;
    return c.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return c.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      });
  }

  return {
    configured: configured,
    getContent: getContent,
    getProjects: getProjects,
    getProjectById: getProjectById,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    saveHome: saveHome,
    saveContact: saveContact,
    saveProject: saveProject,
    deleteProject: deleteProject,
    uploadImage: uploadImage,
    DEFAULT_CONTENT: DEFAULT_CONTENT
  };
})();
