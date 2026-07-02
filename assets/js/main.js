/* ============================================================
   Studio Khushi — interactions & content rendering
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));
  const PE = window.PatternEngine;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     CONTENT — written in the designer's voice, domain-true.
     --------------------------------------------------------- */
  const REPEATS = ['Half-drop', 'Full drop', 'Brick', 'Mirror', 'Tossed', 'Ogee'];

  // Portfolio projects are managed in the admin panel and stored in Supabase.
  // The grid is populated live from the database (empty until you add one).

  const PATTERN_FILTERS = ['All', 'Floral', 'Kids', 'Geometric', 'Ethnic', 'Modern', 'Abstract', 'Minimal', 'Nature', 'Boho', 'Luxury', 'Seasonal', 'Animals', 'Festive'];
  const PATTERNS = [
    ['Wild Marigold', 'Nature Collection', 'Floral', 'sand'],
    ['Tiny Explorers', 'Kids Collection', 'Kids', 'sage'],
    ['Kilim Steps', 'Indian Heritage', 'Ethnic', 'clay'],
    ['Soft Terrazzo', 'Minimal Collection', 'Abstract', 'dusk'],
    ['Fern & Dew', 'Nature Collection', 'Nature', 'sage'],
    ['Gilded Scallop', 'Luxury Collection', 'Luxury', 'ink'],
    ['Hairline Grid', 'Minimal Collection', 'Minimal', 'ivory'],
    ['Sunday Arches', 'Home Decor', 'Boho', 'blush'],
    ['Meadow Toss', 'Nature Collection', 'Floral', 'sage'],
    ['Zigzag Sorbet', 'Kids Collection', 'Geometric', 'blush'],
    ['Midnight Rings', 'Minimal Collection', 'Modern', 'ocean'],
    ['Little Paws', 'Kids Collection', 'Animals', 'clay'],
    ['Festival Sparks', 'Festival Collection', 'Festive', 'sand'],
    ['Monsoon Waves', 'Home Decor', 'Seasonal', 'ocean'],
    ['Ikat Diamond', 'Indian Heritage', 'Ethnic', 'clay'],
    ['Petal Half-Drop', 'Luxury Collection', 'Floral', 'blush'],
    ['Sage Chevron', 'Minimal Collection', 'Geometric', 'sage'],
    ['Golden Bloom', 'Luxury Collection', 'Floral', 'ink'],
  ];
  const FORMATS = ['AI', 'SVG', 'PSD', 'PNG', 'JPEG'];

  const COLLECTIONS = [
    ['Indian Heritage', 24, 'Ethnic', 'clay', 'Block prints, ikats and kalamkari, reimagined for modern interiors.'],
    ['Nature Collection', 18, 'Nature', 'sage', 'Botanicals, ferns and meadows drawn from morning walks.'],
    ['Kids Collection', 16, 'Kids', 'blush', 'Gentle, joyful prints for nurseries and small humans.'],
    ['Luxury Collection', 12, 'Luxury', 'ink', 'Gilded damasks and quiet opulence for premium goods.'],
    ['Festival Collection', 14, 'Festive', 'sand', 'Marigold, diya and celebration motifs for the season.'],
    ['Minimal Collection', 20, 'Minimal', 'dusk', 'Restrained repeats for brands that speak softly.'],
  ];

  const PRODUCTS = [
    ['Arcadia Lounge Chair', 'Furniture', 'Boho', 'clay', 'Caned oak frame · linen seat'],
    ['Bloom Ceramic Set', 'Tableware', 'Floral', 'sand', 'Six-piece · hand-glazed stoneware'],
    ['Fold Planter Trio', 'Home Object', 'Geometric', 'sage', 'Recycled terracotta · nesting'],
    ['Petal Wall Sconce', 'Lighting', 'Nature', 'blush', 'Brass · frosted glass diffuser'],
    ['Toss Storage Tins', 'Packaging', 'Abstract', 'dusk', 'Tinplate · three sizes'],
    ['Heritage Tea Caddy', 'Packaging', 'Luxury', 'ink', 'Gilded card · magnetic close'],
  ];

  const POSTS = [
    ['Designing a repeat that never tiles', 'Work Process', 'Nature', 'sage', 'Mar 2026', '6 min'],
    ['Inside my Diwali colour studies', 'Behind the Scenes', 'Festive', 'sand', 'Feb 2026', '4 min'],
    ['From sketchbook to seamless SVG', 'Sketchbook', 'Floral', 'blush', 'Feb 2026', '8 min'],
    ['Why half-drop still wins in textiles', 'Design', 'Ethnic', 'clay', 'Jan 2026', '5 min'],
    ['The materials I keep returning to', 'Materials', 'Abstract', 'dusk', 'Jan 2026', '7 min'],
    ['Colour trends I am watching in 2026', 'Trends', 'Modern', 'ocean', 'Dec 2025', '5 min'],
  ];

  const QUOTES = [
    ['Khushi translated our brand into a print language we never knew we needed. Sell-through on the launch capsule beat forecast by 40%.', 'Ananya Rao', 'Founder · Rasa Living', 'blush'],
    ['The most collaborative designer we have worked with. Files arrived pristine, layered and production-ready.', 'Marcus Feld', 'Creative Dir · Nord Textiles', 'ocean'],
    ['Our nursery range sold out in ten days. The patterns simply feel loved.', 'Priya Menon', 'Buyer · Little Fern', 'sage'],
    ['She thinks like a product designer and draws like an artist. Rare combination.', 'David Cole', 'Head of Design · Maison Kesar', 'ink'],
  ];

  const SERVICES = [
    ['Surface Pattern Design', 'Seamless repeats built for real production — apparel, home and stationery.', 'from ₹35k / print', 'M4 3 L20 3 L20 21 L4 21 Z M4 9 L20 9 M4 15 L20 15 M10 3 L10 21'],
    ['Product Design', 'Concept to prototype for homeware, furniture and lifestyle objects.', 'project based', 'M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z M12 2 L12 22 M3 7 L21 7'],
    ['Packaging Design', 'Structural and surface design that makes the unboxing part of the story.', 'from ₹60k', 'M3 8 L12 3 L21 8 L21 18 L12 21 L3 18 Z M3 8 L12 12 L21 8 M12 12 L12 21'],
    ['Print Development', 'Colour separations, repeats and strike-off support with your mill.', 'day rate', 'M6 3 L18 3 L18 21 L6 21 Z M9 8 L15 8 M9 12 L15 12 M9 16 L13 16'],
    ['Furniture Design', 'Considered, craftable pieces — from silhouette to material spec.', 'project based', 'M4 10 L20 10 L20 12 L4 12 Z M6 12 L6 20 M18 12 L18 20 M4 10 L4 5 L20 5 L20 10'],
    ['Textile Design', 'Woven and printed textile concepts, ready for the loom or the screen.', 'from ₹45k', 'M3 3 L21 3 M3 8 L21 8 M3 13 L21 13 M3 18 L21 18 M7 3 L7 21 M14 3 L14 21'],
    ['Brand Identity', 'Marks, motifs and systems for makers, studios and slow brands.', 'from ₹80k', 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M12 8 L12 12 L15 14'],
    ['Creative Direction', 'Ongoing art direction for collections, campaigns and seasonal drops.', 'retainer', 'M2 12 C6 4 18 4 22 12 C18 20 6 20 2 12 Z M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9'],
  ];

  const SEARCH_INDEX = [
    ...PATTERNS.map(p => ({ name: p[0], tag: 'Pattern' })),
    ...COLLECTIONS.map(c => ({ name: c[0], tag: 'Collection' })),
    ...PRODUCTS.map(p => ({ name: p[0], tag: 'Product' })),
    ...POSTS.map(p => ({ name: p[0], tag: 'Blog' })),
  ];

  /* small helpers */
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const swatchDots = (keys) => `<span class="dots">${keys.map(k => `<i style="background:${PE.PALETTES[k][1]}"></i>`).join('')}</span>`;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  /* shared reveal observer (also used to animate DB-injected nodes) */
  let revealIO = null;
  const observeNode = (n) => { if (revealIO && n) revealIO.observe(n); };

  /* ---------------------------------------------------------
     RENDER: Portfolio — projects come from the admin (Supabase)
     --------------------------------------------------------- */
  function renderPortfolio(projects) {
    const grid = $('#portfolioGrid'); if (!grid) return;
    grid.innerHTML = '';
    if (!projects || !projects.length) {
      grid.classList.remove('masonry');
      grid.appendChild(el(`<div class="portfolio-empty"><p>New projects are on their way.</p></div>`));
      return;
    }
    grid.classList.add('masonry');
    projects.forEach((p, i) => { const c = projectCard(p, i); grid.appendChild(c); observeNode(c); });
    projects.forEach(p => SEARCH_INDEX.push({ name: p.title, tag: 'Project' }));
  }

  /* ---------------------------------------------------------
     RENDER: Pattern Library (Pinterest pins + filters)
     --------------------------------------------------------- */
  function renderPatternFilters() {
    const bar = $('#patternFilters'); if (!bar) return;
    PATTERN_FILTERS.forEach((f, i) => {
      const b = el(`<button class="filter${i === 0 ? ' active' : ''}" data-filter="${f}">${f}</button>`);
      bar.appendChild(b);
    });
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter'); if (!btn) return;
      $$('.filter', bar).forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      $$('#patternGrid .pin').forEach(pin => {
        const show = f === 'All' || pin.dataset.theme === f;
        pin.style.display = show ? '' : 'none';
      });
    });
  }
  function renderPatterns() {
    const grid = $('#patternGrid'); if (!grid) return;
    PATTERNS.forEach((pt, i) => {
      const [name, coll, theme, pal] = pt;
      const repeat = REPEATS[i % REPEATS.length];
      const variants = [pal, PE.PALETTE_KEYS[(i + 1) % PE.PALETTE_KEYS.length], PE.PALETTE_KEYS[(i + 4) % PE.PALETTE_KEYS.length]];
      const ar = i % 4 === 0 ? '4/5' : (i % 4 === 2 ? '1' : '3/4');
      const card = el(`
        <div class="swatch pin rv" data-theme="${theme}" data-cursor="View">
          <div class="swatch__art" data-cat="${theme}" style="aspect-ratio:${ar}">
            ${PE.makePattern(theme, 101 + i * 9, pal)}
            <div class="swatch__actions">
              <button class="mini-btn js-preview" data-name="${name}" data-theme="${theme}" data-seed="${101 + i * 9}" data-pal="${pal}">Preview</button>
              <button class="mini-btn">License</button>
              <button class="mini-btn mini-btn--solid">Buy</button>
            </div>
          </div>
          <div class="swatch__body">
            <h3 class="swatch__title" style="font-size:1.1rem">${name}</h3>
            <p class="swatch__desc" style="font-size:0.82rem">${coll} · ${theme}</p>
            <div class="swatch__spec">
              <span>repeat · ${repeat}</span>
              ${swatchDots(variants)}
            </div>
            <div class="swatch__spec" style="border:0;padding-top:0.5rem">
              ${FORMATS.map(f => `<span class="chip">${f}</span>`).join('')}
            </div>
          </div>
        </div>`);
      grid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     RENDER: Products / Collections / Blog / Testimonials / Services / IG
     --------------------------------------------------------- */
  function renderProducts() {
    const grid = $('#productGrid'); if (!grid) return;
    PRODUCTS.forEach((p, i) => {
      const [title, kind, theme, pal, spec] = p;
      grid.appendChild(el(`
        <a class="product rv" href="project.html?p=${encodeURIComponent(title)}" data-cursor="Open">
          <div class="product__art">${PE.makePattern(theme, 301 + i * 17, pal)}<span class="product__num mono">P.0${i + 1}</span></div>
          <div class="product__body">
            <p class="eyebrow" style="margin-bottom:0.6rem">${kind}</p>
            <h3>${title}</h3>
            <p class="muted" style="font-size:0.88rem">${spec}</p>
          </div>
        </a>`));
    });
  }
  function renderCollections() {
    const wrap = $('#collectionList'); if (!wrap) return;
    COLLECTIONS.forEach((c, i) => {
      const [name, count, theme, pal, desc] = c;
      wrap.appendChild(el(`
        <a class="collection rv" href="#patterns" data-cursor="Explore">
          <div class="collection__art">${PE.makePattern(theme, 501 + i * 11, pal)}</div>
          <div class="collection__body">
            <span class="collection__count">Collection ${String(i + 1).padStart(2, '0')} — ${count} designs</span>
            <h3>${name}</h3>
            <p class="muted">${desc}</p>
            <span class="tlink" style="margin-top:0.4rem">Open gallery <span aria-hidden="true">→</span></span>
          </div>
        </a>`));
    });
  }
  function renderPosts() {
    const grid = $('#postGrid'); if (!grid) return;
    POSTS.forEach((p, i) => {
      const [title, cat, theme, pal, date, read] = p;
      grid.appendChild(el(`
        <a class="post rv" href="#" data-cursor="Read">
          <div class="post__art">${PE.makePattern(theme, 701 + i * 23, pal)}</div>
          <div class="post__meta"><span class="cat">${cat}</span><span>${date}</span><span>${read} read</span></div>
          <h3>${title}</h3>
          <p>A short field note from the studio on process, colour and craft.</p>
        </a>`));
    });
  }
  function renderQuotes() {
    const row = $('#quoteRow'); if (!row) return;
    QUOTES.forEach((q, i) => {
      const [text, who, role, pal] = q;
      row.appendChild(el(`
        <figure class="quote rv">
          <div class="quote__stars" aria-label="Five stars">★★★★★</div>
          <blockquote class="quote__text">“${text}”</blockquote>
          <figcaption class="quote__who">
            <span class="quote__ava">${PE.makePattern('Abstract', 801 + i * 5, pal)}</span>
            <span><b>${who}</b><span>${role}</span></span>
          </figcaption>
        </figure>`));
    });
  }
  function renderServices() {
    const grid = $('#serviceGrid'); if (!grid) return;
    SERVICES.forEach((s, i) => {
      const [title, desc, price, path] = s;
      grid.appendChild(el(`
        <div class="service rv">
          <div class="service__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></div>
          <h3>${title}</h3>
          <p>${desc}</p>
          <div class="service__foot">
            <span class="service__price">Pricing · <b>${price}</b></span>
            <a class="tlink" href="#contact">Book consultation <span aria-hidden="true">→</span></a>
          </div>
        </div>`));
    });
  }
  function renderInstagram() {
    const grid = $('#igGrid'); if (!grid) return;
    const themes = ['Floral', 'Nature', 'Geometric', 'Ethnic', 'Kids', 'Luxury', 'Abstract', 'Boho', 'Festive', 'Modern', 'Nature', 'Floral'];
    themes.forEach((t, i) => {
      grid.appendChild(el(`<a class="ig-cell" href="#" aria-label="Instagram post" data-cursor="View">${PE.makePattern(t, 901 + i * 3, PE.PALETTE_KEYS[i % PE.PALETTE_KEYS.length])}</a>`));
    });
  }

  /* ---------------------------------------------------------
     Hero drifting pattern + parallax
     --------------------------------------------------------- */
  function renderHero() {
    const c = $('#heroCanvas'); if (!c) return;
    c.innerHTML = PE.makePattern('Floral', 42, 'sand');
    const svg = c.querySelector('svg');
    if (svg) svg.style.opacity = '0.5';
    c.style.transform = 'scale(1.08)';
    if (reduced) return;
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      c.style.transform = `scale(1.1) translate(${nx * -22}px, ${ny * -22}px)`;
    }, { passive: true });
  }
  function renderPortrait() {
    const port = $('#portrait'); if (port) port.innerHTML = PE.makePortrait(3);
  }

  /* ---------------------------------------------------------
     Preloader
     --------------------------------------------------------- */
  function preloader() {
    const pre = $('#preloader');
    document.documentElement.classList.add('reveal-ready');
    if (!pre) return;
    const finish = () => pre.classList.add('done');
    if (reduced) { finish(); return; }
    window.addEventListener('load', () => setTimeout(finish, 1150));
    setTimeout(finish, 2600); // safety
  }

  /* ---------------------------------------------------------
     Nav: solid on scroll, hide on scroll-down, active links
     --------------------------------------------------------- */
  function navBehaviour() {
    const nav = $('#nav'); if (!nav) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('solid', y > 40);
      if (y > 400 && y > last + 4) nav.classList.add('hide');
      else if (y < last - 4) nav.classList.remove('hide');
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = $$('section[id], header[id]');
    const links = $$('.nav__link');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = en.target.id;
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------------------------------------------------------
     Mobile drawer + search + theme
     --------------------------------------------------------- */
  function menus() {
    const burger = $('#burger'), drawer = $('#drawer');
    if (burger && drawer) {
      const toggle = (open) => {
        burger.classList.toggle('open', open);
        drawer.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        burger.setAttribute('aria-expanded', open);
      };
      burger.addEventListener('click', () => toggle(!drawer.classList.contains('open')));
      $$('a', drawer).forEach(a => a.addEventListener('click', () => toggle(false)));
    }
    // theme
    const themeBtn = $('#themeToggle');
    const saved = (function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
    if (themeBtn) themeBtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', now);
      try { localStorage.setItem('theme', now); } catch (e) {}
    });
  }

  function search() {
    const overlay = $('#search'), openBtns = $$('.js-search-open'), input = $('#searchInput'), results = $('#searchResults');
    if (!overlay) return;
    const open = (o) => {
      overlay.classList.toggle('open', o);
      document.body.style.overflow = o ? 'hidden' : '';
      if (o) setTimeout(() => input && input.focus(), 250);
    };
    openBtns.forEach(b => b.addEventListener('click', () => open(true)));
    $('#searchClose') && $('#searchClose').addEventListener('click', () => open(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') open(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(true); }
    });
    let filter = 'All';
    $$('.search__filters .filter').forEach(f => f.addEventListener('click', () => {
      $$('.search__filters .filter').forEach(x => x.classList.remove('active'));
      f.classList.add('active'); filter = f.dataset.filter; run();
    }));
    const run = () => {
      const q = (input.value || '').toLowerCase().trim();
      const items = SEARCH_INDEX.filter(it =>
        (filter === 'All' || it.tag === filter) && (!q || it.name.toLowerCase().includes(q))
      ).slice(0, 8);
      results.innerHTML = items.length
        ? items.map(it => `<a href="#"><span>${it.name}</span><span class="tag">${it.tag}</span></a>`).join('')
        : `<p class="search__hint" style="padding:1rem 0">No matches — try “floral”, “kids” or “heritage”.</p>`;
    };
    if (input) input.addEventListener('input', run);
    run();
  }

  /* ---------------------------------------------------------
     Lightbox (pattern preview)
     --------------------------------------------------------- */
  function lightbox() {
    const lb = $('#lightbox'); if (!lb) return;
    const art = $('#lbArt'), title = $('#lbTitle'), meta = $('#lbMeta');
    const open = (o) => { lb.classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; };
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-preview');
      if (btn) {
        e.preventDefault();
        art.innerHTML = PE.makePattern(btn.dataset.theme, +btn.dataset.seed, btn.dataset.pal);
        title.textContent = btn.dataset.name;
        meta.textContent = `${btn.dataset.theme} · seamless repeat · AI · SVG · PSD · PNG · JPEG`;
        open(true);
      }
      if (e.target.closest('#lbClose') || e.target === lb) open(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
  }

  /* ---------------------------------------------------------
     Reveal on scroll + skill bars
     --------------------------------------------------------- */
  function reveals() {
    revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if (en.target.classList.contains('skill__bar')) {
            const fill = en.target.querySelector('i');
            if (fill) fill.style.width = fill.dataset.val + '%';
          }
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    // stagger siblings within a grid
    $$('.rv').forEach((n, i) => { n.style.transitionDelay = (i % 4) * 0.07 + 's'; revealIO.observe(n); });
    $$('.skill__bar').forEach(b => revealIO.observe(b));
  }

  /* ---------------------------------------------------------
     Custom cursor
     --------------------------------------------------------- */
  function cursor() {
    if (window.matchMedia('(hover: none)').matches || reduced) return;
    const ring = $('#cursor'), dot = $('#cursorDot');
    if (!ring || !dot) return;
    let rx = 0, ry = 0, dx = 0, dy = 0;
    document.addEventListener('mousemove', (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (t) {
        ring.classList.add('grow');
        ring.setAttribute('data-label', t.getAttribute('data-cursor') || '');
      }
    });
    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      if (t) { ring.classList.remove('grow'); ring.removeAttribute('data-label'); }
    });
  }

  /* ---------------------------------------------------------
     Scroll progress + back to top
     --------------------------------------------------------- */
  function scrollExtras() {
    const bar = $('#progress'), fab = $('#toTop');
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (bar) bar.style.width = (p * 100) + '%';
      if (fab) fab.classList.toggle('show', h.scrollTop > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    fab && fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  }

  /* ---------------------------------------------------------
     Cookie consent + newsletter + contact form (front-end)
     --------------------------------------------------------- */
  function cookie() {
    const c = $('#cookie'); if (!c) return;
    let ok = false; try { ok = localStorage.getItem('cookie-ok'); } catch (e) {}
    if (!ok) setTimeout(() => c.classList.add('show'), 1800);
    const set = () => { try { localStorage.setItem('cookie-ok', '1'); } catch (e) {} c.classList.remove('show'); };
    $$('.js-cookie', c).forEach(b => b.addEventListener('click', set));
  }
  function forms() {
    const cf = $('#contactForm');
    if (cf) cf.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = $('#formNote');
      if (note) { note.textContent = '✓ Thank you — your brief has landed. Khushi will reply within two working days.'; }
      cf.reset();
    });
    const drop = $('#fileDrop'), file = $('#fileInput');
    if (drop && file) {
      drop.addEventListener('click', () => file.click());
      file.addEventListener('change', () => { drop.textContent = file.files.length ? `Attached · ${file.files[0].name}` : 'Click to attach a reference image'; });
    }
    const nf = $('#newsForm');
    if (nf) nf.addEventListener('submit', (e) => { e.preventDefault(); const i = nf.querySelector('input'); i.value = ''; i.placeholder = '✓ You are on the list'; });
  }

  /* ---------------------------------------------------------
     Live content from Supabase (via Store) — patched in after
     the default render so first paint is unchanged and nothing
     breaks when Supabase isn't configured yet.
     --------------------------------------------------------- */
  const CAT_THEME = {
    'Surface Pattern': 'Floral', 'Textile Prints': 'Ethnic', 'Product Design': 'Modern',
    'Furniture Design': 'Boho', 'Packaging': 'Nature', 'Branding': 'Luxury',
    'Interior Design': 'Geometric', 'Pattern Making': 'Abstract'
  };
  const catTheme = (cat) => CAT_THEME[cat] || 'Abstract';

  function projectCard(p, i) {
    const tall = i % 3 === 1 ? 'aspect-ratio:3/4' : (i % 3 === 2 ? 'aspect-ratio:4/3' : 'aspect-ratio:1');
    const cover = p.images && p.images[0];
    const pal = PE.PALETTE_KEYS[i % PE.PALETTE_KEYS.length];
    const art = cover
      ? `<img src="${esc(cover)}" alt="${esc(p.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" />`
      : PE.makePattern(catTheme(p.category), 7 + i * 13, pal);
    const desc = p.introduction || p.description || '';
    return el(`
      <a class="swatch rv" href="project.html?id=${encodeURIComponent(p.id)}" data-cursor="Open">
        <div class="swatch__art" data-cat="${esc(p.category)}" style="${tall}">${art}</div>
        <div class="swatch__body">
          <h3 class="swatch__title">${esc(p.title)}</h3>
          <p class="swatch__desc">${esc(desc)}</p>
          <div class="swatch__spec"><span class="chip chip--gold">${esc(p.category)}</span></div>
        </div>
      </a>`);
  }

  function patchHero(content) {
    const titleEl = $('.hero__title');
    if (titleEl && content.hero_title && content.hero_title !== Store.DEFAULT_CONTENT.hero_title) {
      titleEl.innerHTML = content.hero_title.trim().split(/\s+/)
        .map(w => `<span class="word"><span>${esc(w)}</span></span>`).join(' ');
    }
    const leadEl = $('.hero__lead');
    if (leadEl && content.hero_description) leadEl.textContent = content.hero_description;
  }

  function patchSkills(skills) {
    const wrap = $('.skills');
    if (!wrap || !skills || !skills.length) return;
    wrap.innerHTML = skills.map(s => `
      <div class="skill">
        <div class="skill__top"><span>${esc(s.name)}</span><span class="mono">${esc(s.level)}</span></div>
        <div class="skill__bar rv"><i data-val="${esc(s.level)}"></i></div>
      </div>`).join('');
    $$('.skill__bar', wrap).forEach(observeNode);
  }

  function patchContact(k) {
    if (!k) return;
    const rows = $$('.contact__info .info-row');
    // rows: 0 Email, 1 Phone, 2 Studio, 3 Follow
    if (rows[0]) { const a = rows[0].querySelector('a'); if (a && k.email) { a.textContent = k.email; a.href = 'mailto:' + k.email; } }
    if (rows[1]) { const a = rows[1].querySelector('a'); if (a && k.phone) { a.textContent = k.phone; a.href = 'tel:' + k.phone.replace(/\s+/g, ''); } }
    if (rows[2]) { const p = rows[2].querySelector('p'); if (p && k.location) p.textContent = k.location; }
    const socials = { Instagram: k.instagram, Behance: k.behance, LinkedIn: k.linkedin };
    Object.keys(socials).forEach(label => {
      const url = socials[label];
      const a = $(`.socials a[aria-label="${label}"]`);
      if (a && url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    });
    // Instagram section "Follow along" link
    if (k.instagram) { const ig = $('#instagram .tlink'); if (ig) ig.href = k.instagram; }
  }

  function applyStoreOverrides() {
    if (!window.Store) { renderPortfolio([]); return; }
    Store.getContent().then(content => {
      patchHero(content);
      patchSkills(content.skills);
      patchContact(content.contact);
    }).catch(() => {});
    Store.getProjects()
      .then(projects => { renderPortfolio(projects); })
      .catch(() => { renderPortfolio([]); });
  }

  /* ---------------------------------------------------------
     Year + init
     --------------------------------------------------------- */
  function boot() {
    const yr = $('#year'); if (yr) yr.textContent = '2026';
    renderHero(); renderPortrait();
    renderPatternFilters(); renderPatterns();
    renderProducts(); renderCollections(); renderPosts();
    renderQuotes(); renderServices(); renderInstagram();
    preloader(); navBehaviour(); menus(); search(); lightbox();
    reveals(); cursor(); scrollExtras(); cookie(); forms();
    applyStoreOverrides();
    // PWA / offline caching — only over http(s), skipped on file://
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
