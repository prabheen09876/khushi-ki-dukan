/* ============================================================
   Pattern Engine — the studio's actual craft, rendered live.
   Every "image" on this site is a seamless surface pattern
   generated in SVG. No stock photography, no AI mush — just
   repeats, the way a textile designer builds them.
   ============================================================ */

/* deterministic PRNG so a named swatch always looks identical */
function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return function () {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* on-brand palettes: [background, motif-a, motif-b, soft, accent] */
const PALETTES = {
  sand:  ['#f6f2ec', '#c8a96a', '#8a7549', '#e6dcc8', '#a9884a'],
  clay:  ['#efe3da', '#c08457', '#8a4f34', '#e3c3a8', '#9a5a3a'],
  sage:  ['#e9ede4', '#8a9a78', '#556146', '#cdd7bf', '#6f7f5c'],
  dusk:  ['#e8e7ee', '#7c7f9e', '#474a63', '#cbcad8', '#9a6478'],
  blush: ['#f4e9e6', '#d99a92', '#a85f57', '#eccfc9', '#c07a70'],
  ink:   ['#222222', '#c8a96a', '#6b6255', '#3a352b', '#e0c88f'],
  ivory: ['#ffffff', '#222222', '#c8a96a', '#efefef', '#8a7549'],
  ocean: ['#e4ecec', '#5f8a8c', '#345455', '#c3d6d5', '#4e7a7b'],
};
const PALETTE_KEYS = Object.keys(PALETTES);

/* ---- individual motif builders → return <pattern> markup ---- */
const MOTIFS = {
  flower(p, r, id) {
    const petals = 6, t = 96, cx = t / 2, cy = t / 2;
    let petal = '';
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * 360;
      petal += `<ellipse cx="${cx}" cy="${cy - 17}" rx="7" ry="15" fill="${p[1]}" transform="rotate(${a} ${cx} ${cy})"/>`;
    }
    const bud = `<g>${petal}<circle cx="${cx}" cy="${cy}" r="6.5" fill="${p[4]}"/></g>`;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      ${bud}
      <g transform="translate(${t / 2} ${t / 2})">${bud.replace(/fill="[^"]+"/g, `fill="${p[2]}"`)}</g>
      <circle cx="${t / 2}" cy="0" r="2.5" fill="${p[2]}"/><circle cx="0" cy="${t / 2}" r="2.5" fill="${p[2]}"/>
    </pattern>`;
  },
  scallop(p, r, id) {
    const t = 44, R = 22;
    const arc = `M0 ${R} A${R} ${R} 0 0 1 ${2 * R} ${R}`;
    return `<pattern id="${id}" width="${t}" height="${R}" patternUnits="userSpaceOnUse">
      <path d="${arc}" fill="none" stroke="${p[1]}" stroke-width="2"/>
      <path d="M${-R} ${R} A${R} ${R} 0 0 1 ${R} ${R}" fill="none" stroke="${p[2]}" stroke-width="2" opacity="0.6"/>
      <circle cx="${R}" cy="6" r="2" fill="${p[4]}"/>
    </pattern>`;
  },
  ikat(p, r, id) {
    const t = 60, c = t / 2;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      <path d="M${c} 6 L${t - 8} ${c} L${c} ${t - 6} L8 ${c} Z" fill="${p[1]}"/>
      <path d="M${c} 16 L${t - 18} ${c} L${c} ${t - 16} L18 ${c} Z" fill="${p[0]}"/>
      <circle cx="${c}" cy="${c}" r="4" fill="${p[4]}"/>
      <path d="M0 0 L10 0 M0 0 L0 10" stroke="${p[2]}" stroke-width="2"/>
      <path d="M${t} ${t} L${t - 10} ${t} M${t} ${t} L${t} ${t - 10}" stroke="${p[2]}" stroke-width="2"/>
    </pattern>`;
  },
  arches(p, r, id) {
    const t = 64, R = 28;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      <path d="M${t / 2 - R} ${t} A${R} ${R} 0 0 1 ${t / 2 + R} ${t}" fill="none" stroke="${p[1]}" stroke-width="3"/>
      <path d="M${t / 2 - R + 8} ${t} A${R - 8} ${R - 8} 0 0 1 ${t / 2 + R - 8} ${t}" fill="none" stroke="${p[2]}" stroke-width="3"/>
      <path d="M${t / 2 - R + 16} ${t} A${R - 16} ${R - 16} 0 0 1 ${t / 2 + R - 16} ${t}" fill="none" stroke="${p[4]}" stroke-width="3"/>
      <circle cx="0" cy="${t / 2}" r="3" fill="${p[1]}"/><circle cx="${t}" cy="${t / 2}" r="3" fill="${p[1]}"/>
    </pattern>`;
  },
  leaf(p, r, id) {
    const t = 72;
    const leaf = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 Q9 -14 0 -30 Q-9 -14 0 0Z" fill="${c}"/><line x1="0" y1="-2" x2="0" y2="-26" stroke="${p[0]}" stroke-width="1.2"/></g>`;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      ${leaf(t * 0.3, t * 0.4, 25, p[1])}${leaf(t * 0.7, t * 0.55, -35, p[2])}
      ${leaf(t * 0.55, t * 0.95, 10, p[4])}${leaf(t * 0.1, t * 0.9, -15, p[1])}
      <circle cx="${t * 0.85}" cy="${t * 0.15}" r="3" fill="${p[4]}"/>
    </pattern>`;
  },
  terrazzo(p, r, id) {
    const t = 120; let s = '';
    for (let i = 0; i < 22; i++) {
      const x = r() * t, y = r() * t, sz = 3 + r() * 8, c = p[1 + Math.floor(r() * 4)];
      const shape = r();
      if (shape < 0.4) s += `<circle cx="${x}" cy="${y}" r="${sz}" fill="${c}"/>`;
      else if (shape < 0.7) s += `<rect x="${x}" y="${y}" width="${sz * 1.6}" height="${sz}" rx="1.5" fill="${c}" transform="rotate(${r() * 90} ${x} ${y})"/>`;
      else s += `<path d="M${x} ${y} l${sz} ${sz * 1.4} l${-sz * 2} 0 Z" fill="${c}"/>`;
    }
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">${s}</pattern>`;
  },
  rings(p, r, id) {
    const t = 56, c = t / 2;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      <circle cx="${c}" cy="${c}" r="20" fill="none" stroke="${p[1]}" stroke-width="2"/>
      <circle cx="${c}" cy="${c}" r="12" fill="none" stroke="${p[2]}" stroke-width="2"/>
      <circle cx="${c}" cy="${c}" r="4" fill="${p[4]}"/>
      <circle cx="0" cy="0" r="20" fill="none" stroke="${p[1]}" stroke-width="2"/>
      <circle cx="${t}" cy="0" r="20" fill="none" stroke="${p[1]}" stroke-width="2"/>
      <circle cx="0" cy="${t}" r="20" fill="none" stroke="${p[1]}" stroke-width="2"/>
      <circle cx="${t}" cy="${t}" r="20" fill="none" stroke="${p[1]}" stroke-width="2"/>
    </pattern>`;
  },
  minimal(p, r, id) {
    const t = 34;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      <circle cx="${t / 2}" cy="${t / 2}" r="1.7" fill="${p[2]}"/>
      <path d="M0 0 L3 0 M0 0 L0 3" stroke="${p[1]}" stroke-width="1" opacity="0.6"/>
    </pattern>`;
  },
  chevron(p, r, id) {
    const t = 40;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      <path d="M0 ${t * 0.75} L${t / 2} ${t * 0.25} L${t} ${t * 0.75}" fill="none" stroke="${p[1]}" stroke-width="4"/>
      <path d="M0 ${t * 0.35} L${t / 2} ${-t * 0.15} L${t} ${t * 0.35}" fill="none" stroke="${p[2]}" stroke-width="4"/>
      <path d="M0 ${t * 1.15} L${t / 2} ${t * 0.65} L${t} ${t * 1.15}" fill="none" stroke="${p[4]}" stroke-width="4" opacity="0.7"/>
    </pattern>`;
  },
  stars(p, r, id) {
    const t = 60;
    const spark = (x, y, s, c) => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z" fill="${c}"/>`;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      ${spark(t * 0.3, t * 0.3, 10, p[1])}${spark(t * 0.75, t * 0.7, 7, p[4])}
      <circle cx="${t * 0.8}" cy="${t * 0.2}" r="2.5" fill="${p[2]}"/>
      <circle cx="${t * 0.2}" cy="${t * 0.8}" r="2.5" fill="${p[2]}"/>
    </pattern>`;
  },
  paw(p, r, id) {
    const t = 70;
    const paw = (x, y, c) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="4" rx="7" ry="6" fill="${c}"/><circle cx="-6" cy="-5" r="3" fill="${c}"/><circle cx="0" cy="-8" r="3" fill="${c}"/><circle cx="6" cy="-5" r="3" fill="${c}"/></g>`;
    return `<pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse">
      ${paw(t * 0.3, t * 0.35, p[1])}${paw(t * 0.75, t * 0.75, p[2])}
      <circle cx="${t * 0.8}" cy="${t * 0.2}" r="2" fill="${p[4]}"/>
    </pattern>`;
  },
  waves(p, r, id) {
    const t = 60;
    return `<pattern id="${id}" width="${t}" height="${t / 2}" patternUnits="userSpaceOnUse">
      <path d="M0 ${t / 4} Q${t / 4} 0 ${t / 2} ${t / 4} T${t} ${t / 4}" fill="none" stroke="${p[1]}" stroke-width="2.5"/>
      <path d="M0 ${t / 4 + 8} Q${t / 4} ${8} ${t / 2} ${t / 4 + 8} T${t} ${t / 4 + 8}" fill="none" stroke="${p[2]}" stroke-width="2" opacity="0.6"/>
    </pattern>`;
  },
};

const THEME_MOTIF = {
  Floral: 'flower', Kids: 'paw', Geometric: 'chevron', Ethnic: 'ikat',
  Modern: 'rings', Abstract: 'terrazzo', Minimal: 'minimal', Nature: 'leaf',
  Boho: 'arches', Luxury: 'scallop', Seasonal: 'waves', Animals: 'paw', Festive: 'stars',
};

/* Build a full inline <svg> for a given theme + seed */
function makePattern(theme, seed, paletteKey) {
  const r = rng(seed);
  const key = paletteKey || PALETTE_KEYS[seed % PALETTE_KEYS.length];
  const p = PALETTES[key];
  const motifName = THEME_MOTIF[theme] || 'flower';
  const id = `p${theme}${seed}`.replace(/[^a-z0-9]/gi, '');
  const motif = MOTIFS[motifName](p, r, id);
  return `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${theme} surface pattern">
    <defs>${motif}</defs>
    <rect width="400" height="400" fill="${p[0]}"/>
    <rect width="400" height="400" fill="url(#${id})"/>
  </svg>`;
}

/* A soft portrait built from pattern language (no stock photo) */
function makePortrait(seed) {
  const p = PALETTES.clay;
  const bg = makePattern('Floral', seed, 'sand');
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-label="Studio portrait">
    <rect width="400" height="500" fill="${p[3]}"/>
    <g opacity="0.35">${bg.replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
    <ellipse cx="200" cy="500" rx="150" ry="240" fill="${p[1]}"/>
    <circle cx="200" cy="210" r="86" fill="#e9c9a8"/>
    <path d="M118 200 Q120 110 200 108 Q280 110 282 200 Q300 150 250 116 Q200 78 150 116 Q100 150 118 200Z" fill="${p[2]}"/>
    <path d="M118 208 Q114 260 130 300 L120 300 Q96 250 118 208Z" fill="${p[2]}"/>
    <circle cx="176" cy="205" r="4" fill="#3a2a20"/><circle cx="224" cy="205" r="4" fill="#3a2a20"/>
    <path d="M188 234 Q200 242 212 234" fill="none" stroke="#b07a55" stroke-width="3" stroke-linecap="round"/>
    <path d="M150 300 Q200 330 250 300 L280 360 Q200 400 120 360Z" fill="${p[0]}"/>
  </svg>`;
}

/* expose */
window.PatternEngine = { makePattern, makePortrait, PALETTES, PALETTE_KEYS };
