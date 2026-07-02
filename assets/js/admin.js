/* ============================================================
   Studio Khushi — Admin dashboard logic
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var loginView = $('#loginView');
  var dashView = $('#dashView');
  var toastEl = $('#toast');
  var toastTimer = null;

  /* ---------------------------------------------------------
     Theme (shared with the site)
     --------------------------------------------------------- */
  try { var t = localStorage.getItem('theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
  var tb = $('#themeToggle');
  if (tb) tb.addEventListener('click', function () {
    var now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', now);
    try { localStorage.setItem('theme', now); } catch (e) {}
  });

  function toast(msg, isErr) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('err', !!isErr);
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  function busy(btn, on, label) {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="ad-spin"></span> ' + (label || 'Saving…');
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  /* ---------------------------------------------------------
     Auth gate
     --------------------------------------------------------- */
  function showDashboard() {
    loginView.hidden = true;
    dashView.hidden = false;
    $('#cfgBanner').hidden = Store.configured();
    loadHome();
    loadContact();
    loadProjects();
  }
  function showLogin() {
    dashView.hidden = true;
    loginView.hidden = false;
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var id = $('#adId').value.trim();
    var pw = $('#adPw').value;
    var err = $('#loginErr');
    if (Store.login(id, pw)) {
      err.textContent = '';
      $('#adPw').value = '';
      showDashboard();
    } else {
      err.textContent = 'Invalid ID or Password';
      $('#adPw').select();
    }
  });

  $('#logoutBtn').addEventListener('click', function () {
    Store.logout();
    showLogin();
    toast('Logged out.');
  });

  /* ---------------------------------------------------------
     Tabs
     --------------------------------------------------------- */
  $$('.ad-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.ad-tab').forEach(function (t) { t.classList.remove('active'); });
      $$('.ad-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = $('#tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------------------------------------------------------
     HOME — hero + skills
     --------------------------------------------------------- */
  function skillRow(name, level) {
    var row = document.createElement('div');
    row.className = 'ad-skill';
    row.innerHTML =
      '<div class="ad-field"><input type="text" class="s-name" placeholder="Skill name" /></div>' +
      '<div class="ad-field"><input type="number" class="s-level" min="0" max="100" placeholder="0–100" /></div>' +
      '<button type="button" class="ad-iconbtn s-del" aria-label="Remove skill">✕</button>';
    row.querySelector('.s-name').value = name || '';
    row.querySelector('.s-level').value = (level === 0 || level) ? level : '';
    row.querySelector('.s-del').addEventListener('click', function () { row.remove(); });
    return row;
  }

  function loadHome() {
    Store.getContent().then(function (c) {
      $('#heroTitle').value = c.hero_title || '';
      $('#heroDesc').value = c.hero_description || '';
      var list = $('#skillsList');
      list.innerHTML = '';
      (c.skills || []).forEach(function (s) { list.appendChild(skillRow(s.name, s.level)); });
    });
  }

  $('#addSkill').addEventListener('click', function () {
    $('#skillsList').appendChild(skillRow('', ''));
  });

  $('#homeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var skills = $$('.ad-skill', $('#skillsList')).map(function (row) {
      return { name: row.querySelector('.s-name').value, level: row.querySelector('.s-level').value };
    });
    var btn = $('#homeSave');
    busy(btn, true);
    Store.saveHome({
      hero_title: $('#heroTitle').value,
      hero_description: $('#heroDesc').value,
      skills: skills
    }).then(function () {
      busy(btn, false);
      toast('Home page saved. Refresh your site to see it.');
    }).catch(function (err) {
      busy(btn, false);
      toast(err.message || 'Could not save.', true);
    });
  });

  /* ---------------------------------------------------------
     CONTACT
     --------------------------------------------------------- */
  function loadContact() {
    Store.getContent().then(function (c) {
      var k = c.contact || {};
      $('#cName').value = k.name || '';
      $('#cPhone').value = k.phone || '';
      $('#cEmail').value = k.email || '';
      $('#cLocation').value = k.location || '';
      $('#cLinkedin').value = k.linkedin || '';
      $('#cInstagram').value = k.instagram || '';
      $('#cBehance').value = k.behance || '';
    });
  }

  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('#contactSave');
    busy(btn, true);
    Store.saveContact({
      name: $('#cName').value,
      phone: $('#cPhone').value,
      email: $('#cEmail').value,
      location: $('#cLocation').value,
      linkedin: $('#cLinkedin').value,
      instagram: $('#cInstagram').value,
      behance: $('#cBehance').value
    }).then(function () {
      busy(btn, false);
      toast('Contact details saved.');
    }).catch(function (err) {
      busy(btn, false);
      toast(err.message || 'Could not save.', true);
    });
  });

  /* ---------------------------------------------------------
     PROJECTS — list / editor / images
     --------------------------------------------------------- */
  var editorImages = [];   // working copy of image URLs for the open editor

  function loadProjects() {
    Store.getProjects().then(function (list) {
      var wrap = $('#projectsList');
      wrap.innerHTML = '';
      $('#projectsEmpty').hidden = list.length > 0;
      list.forEach(function (p) {
        var cover = p.images && p.images[0];
        var row = document.createElement('div');
        row.className = 'ad-proj';
        row.innerHTML =
          '<div class="ad-proj__thumb">' + (cover ? '<img src="' + esc(cover) + '" alt="" />' : '<span>No image</span>') + '</div>' +
          '<div class="ad-proj__body">' +
            '<span class="ad-proj__cat">' + esc(p.category) + '</span>' +
            '<h4>' + esc(p.title) + '</h4>' +
            '<p>' + esc(p.introduction || p.description || '') + '</p>' +
          '</div>' +
          '<div class="ad-proj__acts">' +
            '<button class="ad-mini" data-edit>Edit</button>' +
            '<button class="ad-mini danger" data-del>Delete</button>' +
          '</div>';
        row.querySelector('[data-edit]').addEventListener('click', function () { openEditor(p); });
        row.querySelector('[data-del]').addEventListener('click', function () { removeProject(p); });
        wrap.appendChild(row);
      });
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function showList(show) {
    $('#projectsWrap').hidden = !show;
    $('#projectEditor').hidden = show;
    $('#newProject').hidden = !show;
  }

  function openEditor(p) {
    p = p || {};
    $('#editorTitle').textContent = p.id ? 'Edit project' : 'New project';
    $('#pId').value = p.id || '';
    $('#pTitle').value = p.title || '';
    $('#pCategory').value = p.category || '';
    $('#pIntro').value = p.introduction || '';
    $('#pDescription').value = p.description || '';
    $('#pObjective').value = p.objective || '';
    $('#pProcess').value = p.design_process || '';
    $('#pMaterials').value = p.materials_used || '';
    $('#pOutcome').value = p.final_outcome || '';
    editorImages = (p.images || []).slice();
    renderThumbs();
    showList(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderThumbs() {
    var wrap = $('#imgThumbs');
    wrap.innerHTML = '';
    editorImages.forEach(function (url, i) {
      var cell = document.createElement('div');
      cell.className = 'ad-thumb';
      cell.innerHTML = '<img src="' + esc(url) + '" alt="" />' +
        '<button type="button" class="ad-thumb__x" aria-label="Remove image">✕</button>' +
        (i === 0 ? '<span class="ad-thumb__cover">Cover</span>' : '');
      cell.querySelector('.ad-thumb__x').addEventListener('click', function () {
        editorImages.splice(i, 1);
        renderThumbs();
      });
      wrap.appendChild(cell);
    });
  }

  $('#newProject').addEventListener('click', function () { openEditor(null); });
  $('#editorClose').addEventListener('click', function () { showList(true); });
  $('#projectCancel').addEventListener('click', function () { showList(true); });

  /* image upload */
  var imgDrop = $('#imgDrop'), imgInput = $('#imgInput'), imgDropText = $('#imgDropText');
  imgDrop.addEventListener('click', function () { imgInput.click(); });
  imgInput.addEventListener('change', function () { handleFiles(imgInput.files); imgInput.value = ''; });
  imgDrop.addEventListener('dragover', function (e) { e.preventDefault(); imgDrop.classList.add('over'); });
  imgDrop.addEventListener('dragleave', function () { imgDrop.classList.remove('over'); });
  imgDrop.addEventListener('drop', function (e) {
    e.preventDefault(); imgDrop.classList.remove('over');
    if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList).filter(function (f) { return /^image\//.test(f.type); });
    if (!files.length) return;
    if (!Store.configured()) { toast('Connect Supabase first to upload images.', true); return; }
    var done = 0;
    imgDropText.innerHTML = '<span class="ad-spin"></span> Uploading 0/' + files.length + '…';
    files.reduce(function (chain, file) {
      return chain.then(function () {
        return Store.uploadImage(file).then(function (url) {
          editorImages.push(url);
          done++;
          imgDropText.innerHTML = '<span class="ad-spin"></span> Uploading ' + done + '/' + files.length + '…';
          renderThumbs();
        });
      });
    }, Promise.resolve()).then(function () {
      imgDropText.textContent = 'Click to upload images, or drop them here';
      toast(done + (done === 1 ? ' image' : ' images') + ' uploaded.');
    }).catch(function (err) {
      imgDropText.textContent = 'Click to upload images, or drop them here';
      toast(err.message || 'Upload failed.', true);
    });
  }

  $('#projectForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!$('#pTitle').value.trim()) { toast('Please add a project title.', true); return; }
    var btn = $('#projectSave');
    busy(btn, true);
    Store.saveProject({
      id: $('#pId').value || null,
      title: $('#pTitle').value,
      category: $('#pCategory').value,
      introduction: $('#pIntro').value,
      description: $('#pDescription').value,
      objective: $('#pObjective').value,
      design_process: $('#pProcess').value,
      materials_used: $('#pMaterials').value,
      final_outcome: $('#pOutcome').value,
      images: editorImages
    }).then(function () {
      busy(btn, false);
      toast('Project saved.');
      showList(true);
      loadProjects();
    }).catch(function (err) {
      busy(btn, false);
      toast(err.message || 'Could not save project.', true);
    });
  });

  function removeProject(p) {
    if (!window.confirm('Delete “' + p.title + '”? This cannot be undone.')) return;
    Store.deleteProject(p.id).then(function () {
      toast('Project deleted.');
      loadProjects();
    }).catch(function (err) {
      toast(err.message || 'Could not delete.', true);
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  try {
    if (typeof Store === 'undefined' || !Store) {
      throw new Error('Data layer failed to load. Check that assets/js/store.js and the Supabase script loaded (no ad-blocker / offline), then hard-refresh.');
    }
    if (Store.isLoggedIn()) showDashboard();
    else showLogin();
  } catch (e) {
    if (window.console) console.error('Admin boot error:', e);
    try { showLogin(); } catch (e2) {}
    throw e; // let the on-screen error trap surface it
  }
})();
