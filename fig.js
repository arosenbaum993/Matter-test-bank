/* fig.js: figure helpers for the Grade 8 Matter question bank.
   Builds inline SVG/HTML strings. Deterministic (seeded), so a figure never changes between loads.
   Global: FIG */
var FIG = (function () {
  var ATOM = {
    H:  { r: 7,  c: '#bfdbfe' },
    O:  { r: 10, c: '#fecaca' },
    C:  { r: 9,  c: '#d1d5db' },
    N:  { r: 9,  c: '#c7d2fe' },
    Cl: { r: 10, c: '#bbf7d0' },
    He: { r: 8,  c: '#fde68a' },
    Ne: { r: 8,  c: '#fbcfe8' },
    Ar: { r: 9,  c: '#a7f3d0' }
  };
  var NAME = { H: 'hydrogen', O: 'oxygen', C: 'carbon', N: 'nitrogen', Cl: 'chlorine', He: 'helium', Ne: 'neon', Ar: 'argon' };
  var MOL = {
    H2:  [['H', -6, 0], ['H', 6, 0]],
    O2:  [['O', -9, 0], ['O', 9, 0]],
    N2:  [['N', -8, 0], ['N', 8, 0]],
    Cl2: [['Cl', -9, 0], ['Cl', 9, 0]],
    HCl: [['H', -10, 0], ['Cl', 6, 0]],
    CO:  [['C', -8.5, 0], ['O', 8.5, 0]],
    CO2: [['O', -17, 0], ['C', 0, 0], ['O', 17, 0]],
    H2O: [['O', 0, -3], ['H', -10, 8], ['H', 10, 8]],
    NH3: [['N', 0, -4], ['H', -12, 6], ['H', 12, 6], ['H', 0, 12]],
    CH4: [['C', 0, 0], ['H', -11, -11], ['H', 11, -11], ['H', -11, 11], ['H', 11, 11]]
  };
  var stats = { placed: 0, failed: 0 };

  function R(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }
  function parts(k) { return MOL[k] || [[k, 0, 0]]; }
  function bound(k) {
    var m = 0; parts(k).forEach(function (a) { m = Math.max(m, Math.sqrt(a[1] * a[1] + a[2] * a[2]) + ATOM[a[0]].r); });
    return m;
  }
  function f(n) { return Math.round(n * 10) / 10; }

  function atomSvg(sym, x, y) {
    var a = ATOM[sym];
    var fs = a.r <= 7 ? 9 : 10;
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + a.r + '" fill="' + a.c + '" stroke="#374151" stroke-width="1"/>' +
      '<text x="' + f(x) + '" y="' + f(y + 0.5) + '" font-size="' + fs + '" font-family="Arial,Helvetica,sans-serif" text-anchor="middle" dominant-baseline="central" fill="#111827">' + sym + '</text>';
  }
  function molSvg(k, cx, cy, ang) {
    var c = Math.cos(ang), s = Math.sin(ang), out = '';
    var list = parts(k).slice().sort(function (a, b) { return ATOM[b[0]].r - ATOM[a[0]].r; });
    list.forEach(function (a) {
      out += atomSvg(a[0], cx + a[1] * c - a[2] * s, cy + a[1] * s + a[2] * c);
    });
    return out;
  }

  /* place molecules without overlap inside a rectangle (atom-level collision, so long molecules can nest) */
  function atomsOf(k, cx, cy, ang) {
    var c = Math.cos(ang), s = Math.sin(ang);
    return parts(k).map(function (a) { return { x: cx + a[1] * c - a[2] * s, y: cy + a[1] * s + a[2] * c, r: ATOM[a[0]].r }; });
  }
  function scatter(rng, keys, x0, y0, x1, y1, gap) {
    var out = [], all = [];
    keys.forEach(function (k) {
      var br = bound(k), ok = false, tries = 0, x, y, ang, at;
      while (!ok && tries < 2500) {
        ang = rng() * 6.283;
        x = x0 + br + rng() * (x1 - x0 - 2 * br);
        y = y0 + br + rng() * (y1 - y0 - 2 * br);
        at = atomsOf(k, x, y, ang);
        ok = at.every(function (a) {
          if (a.x - a.r < x0 || a.x + a.r > x1 || a.y - a.r < y0 || a.y + a.r > y1) return false;
          return all.every(function (b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy) >= a.r + b.r + gap; });
        });
        tries++;
      }
      stats.placed++; if (!ok) stats.failed++;
      at.forEach(function (a) { all.push(a); });
      out.push({ k: k, x: x, y: y, br: br, a: ang });
    });
    return out;
  }

  function frame(w, h, inner, extra) {
    return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + (extra || 'particle model') + '">' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="#fff" stroke="#1f2937" stroke-width="2"/>' + inner + '</svg>';
  }
  function expand(spec) { // [['H2O',8],['CO2',5]] -> list, interleaved
    var lists = spec.map(function (s) { var a = []; for (var i = 0; i < s[1]; i++) a.push(s[0]); return a; });
    var out = [], more = true, i = 0;
    while (more) { more = false; lists.forEach(function (l) { if (i < l.length) { out.push(l[i]); more = true; } }); i++; }
    return out;
  }

  /* molecule/mixture box. layout: 'even' | 'cluster' */
  function molBox(spec, o) {
    o = o || {}; var w = o.w || 190, h = o.h || 140, rng = R(o.seed || 11), inner = '';
    if (o.layout === 'cluster') {
      var half = w / 2 - 6, groups = spec.map(function (s, i) {
        return scatter(rng, expand([s]), i === 0 ? 6 : w / 2 + 6, 6, i === 0 ? half + 6 : w - 6, h - 6, 3);
      });
      groups.forEach(function (g) { g.forEach(function (p) { inner += molSvg(p.k, p.x, p.y, p.a); }); });
    } else {
      scatter(rng, expand(spec), 6, 6, w - 6, h - 6, o.gap == null ? 4 : o.gap).forEach(function (p) { inner += molSvg(p.k, p.x, p.y, p.a); });
    }
    return frame(w, h, inner);
  }

  /* arrows */
  function arrow(x, y, ang, len, r) {
    var c = Math.cos(ang), s = Math.sin(ang), x1 = x + c * r, y1 = y + s * r, x2 = x1 + c * len, y2 = y1 + s * len, hs = 4;
    var hx = x2 - c * hs, hy = y2 - s * hs;
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(hx) + '" y2="' + f(hy) + '" stroke="#b91c1c" stroke-width="1.6"/>' +
      '<polygon points="' + f(x2) + ',' + f(y2) + ' ' + f(hx - s * 2.6) + ',' + f(hy + c * 2.6) + ' ' + f(hx + s * 2.6) + ',' + f(hy - c * 2.6) + '" fill="#b91c1c"/>';
  }
  var ALEN = { none: 0, tiny: 4, short: 8, med: 15, long: 24 };

  /* state box: solid | liquid | gas | plasma ; o.arrows = none|tiny|short|med|long ; o.n for gas/plasma count */
  function stateBox(state, o) {
    o = o || {}; var w = o.w || 150, h = o.h || 120, r = o.r || 6.5, rng = R(o.seed || 5), inner = '', pts = [], L = ALEN[o.arrows || 'none'];
    var fill = '#93c5fd';
    function dot(x, y) { return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + fill + '" stroke="#1e3a8a" stroke-width="1"/>'; }
    var i, j;
    if (state === 'solid') {
      var d = 2 * r + 1, cols = 5, rows = 4, gx = (w - cols * d) / 2 + r, gy = h - 8 - rows * d + r;
      for (i = 0; i < rows; i++) for (j = 0; j < cols; j++) pts.push([gx + j * d, gy + i * d]);
    } else if (state === 'liquid') {
      var sp = 17, c2 = 5, r2 = 4, lx = (w - c2 * sp) / 2 + r, ly = h - 8 - r2 * sp + r;
      for (i = 0; i < r2; i++) for (j = 0; j < c2; j++) pts.push([lx + j * sp + (rng() - 0.5) * 4 + (i % 2 ? 4 : -3), ly + i * sp + (rng() - 0.5) * 3]);
    } else {
      var n = o.n || 12, m = 12 + (L ? L * 0.6 : 0), mm = Math.max(r + 3, m);
      var pl = scatter(rng, (function () { var a = []; for (var q = 0; q < n; q++) a.push('He'); return a; })(), mm - 8, mm - 8, w - mm + 8, h - mm + 8, 12);
      pl.forEach(function (p) { pts.push([p.x, p.y]); });
    }
    pts.forEach(function (p, idx) {
      var chg = '';
      if (state === 'plasma') { chg = '<text x="' + f(p[0]) + '" y="' + f(p[1] + 0.5) + '" font-size="11" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#1e3a8a">+</text>'; }
      inner += dot(p[0], p[1]) + chg;
      if (L) {
        var ang = state === 'solid' ? (idx % 2 ? 0.8 : 3.94) : rng() * 6.283;
        if (state === 'solid') { inner += ''; }
        else inner += arrow(p[0], p[1], ang, L, r);
      }
    });
    if (state === 'plasma') { // free electrons
      var e = scatter(rng, (function () { var a = []; for (var q = 0; q < (o.n || 12); q++) a.push('He'); return a; })(), 10, 10, w - 10, h - 10, 4);
      e.forEach(function (p) {
        var ok = pts.every(function (q) { return Math.hypot(q[0] - p.x, q[1] - p.y) > r + 6; });
        if (ok) inner += '<circle cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="2.4" fill="#111827"/>';
      });
    }
    return frame(w, h, inner);
  }

  /* group of captioned panels */
  function panels(list, o) {
    o = o || {};
    return '<div class="figrow' + (o.cls ? ' ' + o.cls : '') + '">' + list.map(function (p) {
      return '<figure>' + p.svg + '<figcaption>' + p.cap + '</figcaption></figure>';
    }).join('') + '</div>';
  }
  function legend(list) { // [['H', 'hydrogen atom'], ...] or ['+ particle'] strings
    return '<div class="legend">' + list.map(function (a) {
      if (typeof a === 'string') return '<span>' + a + '</span>';
      return '<span><svg width="24" height="24" viewBox="-12 -12 24 24">' + atomSvg(a[0], 0, 0) + '</svg> ' + (a[1] || NAME[a[0]] + ' atom') + '</span>';
    }).join('') + '</div>';
  }

  /* reaction model: [{m:'H2',n:2}, '+', {m:'O2',n:1}, '->', {m:'H2O',n:2}] */
  function rxn(items, o) {
    o = o || {}; var x = 8, h = 74, inner = '';
    items.forEach(function (it) {
      if (typeof it === 'string') {
        if (it === '+') { inner += '<text x="' + (x + 8) + '" y="' + (h / 2 + 1) + '" font-size="22" text-anchor="middle" dominant-baseline="central" font-family="Arial">+</text>'; x += 24; }
        else { inner += '<line x1="' + (x + 4) + '" y1="' + (h / 2) + '" x2="' + (x + 38) + '" y2="' + (h / 2) + '" stroke="#111827" stroke-width="2.4"/><polygon points="' + (x + 46) + ',' + (h / 2) + ' ' + (x + 36) + ',' + (h / 2 - 6) + ' ' + (x + 36) + ',' + (h / 2 + 6) + '" fill="#111827"/>'; x += 56; }
        return;
      }
      var br = bound(it.m), step = 2 * br + 6;
      for (var i = 0; i < it.n; i++) { inner += molSvg(it.m, x + br + 2, h / 2, 0); x += step; }
      x += 2;
    });
    var w = x + 6;
    return '<svg class="fig rxn" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="reaction model">' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="#fff" stroke="#1f2937" stroke-width="2"/>' + inner + '</svg>';
  }

  /* atom model: p protons, n neutrons, e electrons */
  function atomModel(p, n, e, o) {
    o = o || {}; var S = 140, c = S / 2, rng = R(o.seed || 3), inner = '';
    inner += '<circle cx="' + c + '" cy="' + c + '" r="60" fill="#dbeafe" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4 3"/>';
    var kinds = []; for (var i = 0; i < p; i++) kinds.push('p'); for (i = 0; i < n; i++) kinds.push('n');
    for (i = kinds.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = kinds[i]; kinds[i] = kinds[j]; kinds[j] = t; }
    var sp = 6.6, nuc = [];
    kinds.forEach(function (k, idx) {
      var rad = sp * Math.sqrt(idx + 0.5) * 1.18, ang = idx * 2.39996;
      nuc.push([c + rad * Math.cos(ang), c + rad * Math.sin(ang), k]);
    });
    var nr = 0; nuc.forEach(function (q) { nr = Math.max(nr, Math.hypot(q[0] - c, q[1] - c) + 6); });
    nuc.forEach(function (q) {
      if (q[2] === 'p') inner += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="5.6" fill="#fca5a5" stroke="#7f1d1d" stroke-width="0.8"/><text x="' + f(q[0]) + '" y="' + f(q[1] + 0.4) + '" font-size="8" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#7f1d1d">+</text>';
      else inner += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="5.6" fill="#e5e7eb" stroke="#4b5563" stroke-width="0.8"/>';
    });
    var placed = [];
    for (i = 0; i < e; i++) {
      var ok = false, tries = 0, x, y;
      while (!ok && tries < 300) {
        var a2 = rng() * 6.283, rr = nr + 8 + rng() * (54 - nr - 8);
        x = c + rr * Math.cos(a2); y = c + rr * Math.sin(a2);
        ok = placed.every(function (q) { return Math.hypot(q[0] - x, q[1] - y) > 11; }); tries++;
      }
      placed.push([x, y]);
      inner += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4.2" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="0.8"/><text x="' + f(x) + '" y="' + f(y + 0.3) + '" font-size="8" text-anchor="middle" dominant-baseline="central" font-family="Arial" fill="#fff">-</text>';
    }
    return '<svg class="fig atom" viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S + '" role="img" aria-label="atom model with ' + p + ' protons, ' + n + ' neutrons, ' + e + ' electrons">' + inner + '</svg>';
  }
  var ATOMKEY = '<div class="legend"><span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="5.6" fill="#fca5a5" stroke="#7f1d1d"/><text y="0.5" font-size="8" text-anchor="middle" dominant-baseline="central" fill="#7f1d1d">+</text></svg> proton</span>' +
    '<span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="5.6" fill="#e5e7eb" stroke="#4b5563"/></svg> neutron</span>' +
    '<span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="4.2" fill="#1d4ed8" stroke="#1e3a8a"/><text y="0.4" font-size="8" text-anchor="middle" dominant-baseline="central" fill="#fff">-</text></svg> electron</span>' +
    '<span><svg width="18" height="18" viewBox="-9 -9 18 18"><circle r="8" fill="#dbeafe" stroke="#60a5fa" stroke-dasharray="3 2"/></svg> electron cloud</span></div>';

  /* data table */
  function table(head, rows, o) {
    o = o || {};
    var h = '<table class="dt' + (o.cls ? ' ' + o.cls : '') + '">' + (o.cap ? '<caption>' + o.cap + '</caption>' : '');
    h += '<thead><tr>' + head.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table>';
  }
  /* chemical formula text: digits after a letter or ) become subscripts; -> becomes an arrow */
  function F(s) {
    return s.replace(/->/g, '→').replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>');
  }
  function eq(s) { return '<div class="eq">' + F(s) + '</div>'; }
  function tile(sym, z, mass, name) {
    return '<div class="tile"><span class="z">' + z + '</span><b>' + sym + '</b><span class="nm">' + name + '</span><span class="ms">' + mass + '</span></div>';
  }
  function box(title, lines, o) {
    o = o || {};
    return '<div class="sbox' + (o.cls ? ' ' + o.cls : '') + '"><div class="sbt">' + title + '</div>' +
      (o.list ? '<ul>' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' : lines.map(function (l) { return '<div>' + l + '</div>'; }).join('')) + '</div>';
  }
  return { ATOM: ATOM, NAME: NAME, stats: stats, molBox: molBox, stateBox: stateBox, panels: panels, legend: legend, rxn: rxn,
    atomModel: atomModel, ATOMKEY: ATOMKEY, table: table, F: F, eq: eq, tile: tile, box: box, molSvg: molSvg, atomSvg: atomSvg };
})();
