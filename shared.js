/* shared.js: rendering, scoring, link encoding, and saving for the Grade 8 Matter practice assessments.
   Used by index.html (students) and teacher.html (teacher). Needs fig.js and questions.js loaded first. */
var SCI = (function () {
  var CFG = window.SCI_CONFIG || {};
  var byId = {};
  Q.forEach(function (q) { byId[q.id] = q; });

  /* ---------- small helpers ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function strip(html) { return String(html || '').replace(/<sub>(\d+)<\/sub>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function letter(i) { return String.fromCharCode(97 + i); }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function rng(seed) { var h = hashStr(String(seed)) || 1; return function () { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; }; }
  function order(n, fixed, seed) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    if (fixed) return a;
    var r = rng(seed); for (i = n - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null'); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return null; } }
  var NUMW = { 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR' };

  /* ---------- scoring ---------- */
  function partial(c, n, p) { if (c === n) return p; if (p === 2 && c >= Math.ceil(n / 2)) return 1; return 0; }
  function tagOf(o, i) { return o[i] && o[i][1] ? [o[i][1]] : []; }
  function score(q, a) {
    var e = 0, tags = [], c, n, i;
    if (q.t === 'mc') {
      if (a === q.k) e = 1; else if (a != null) tags = tagOf(q.o, a);
    } else if (q.t === 'ms') {
      a = a || []; var ok = a.length === q.k.length && q.k.every(function (k) { return a.indexOf(k) > -1; });
      e = ok ? 1 : 0; if (!ok) a.forEach(function (x) { if (q.k.indexOf(x) < 0) tags = tags.concat(tagOf(q.o, x)); });
    } else if (q.t === 'dd') {
      a = a || []; n = q.blanks.length; c = 0; q.blanks.forEach(function (b, i) { if (a[i] === b.k) c++; });
      e = partial(c, n, q.p);
    } else if (q.t === 'dnd') {
      a = a || []; n = q.rows.length; c = 0; q.k.forEach(function (k, i) { if (a[i] === k) c++; });
      e = partial(c, n, q.p);
    } else if (q.t === 'mp') {
      a = a || []; q.parts.forEach(function (p, i) { if (a[i] === p.k) e++; else if (a[i] != null) tags = tags.concat(tagOf(p.o, a[i])); });
    }
    return { e: e, p: q.p, tags: tags, full: e === q.p };
  }
  function answered(q, a) {
    if (a == null) return false;
    if (q.t === 'mc') return typeof a === 'number';
    if (q.t === 'ms') return a.length > 0;
    return Array.isArray(a) && a.some(function (x) { return x != null; });
  }
  function blank(q) {
    if (q.t === 'mc') return null; if (q.t === 'ms') return [];
    if (q.t === 'dd') return q.blanks.map(function () { return null; });
    if (q.t === 'dnd') return q.rows.map(function () { return null; });
    if (q.t === 'mp') return [null, null];
  }

  /* ---------- choice list (mc, ms, and parts of mp) ---------- */
  function choice(opts, ord, o) {
    // o: {multi, pick, sel (index or array), onChange(sel), reveal, keys (array)}
    var wrap = el('div', 'opts'); wrap.setAttribute('role', o.multi ? 'group' : 'radiogroup');
    var sel = o.multi ? (o.sel || []).slice() : o.sel;
    var btns = [];
    ord.forEach(function (oi, pos) {
      var b = el('button', 'opt'); b.type = 'button'; b.setAttribute('role', o.multi ? 'checkbox' : 'radio');
      b.innerHTML = '<span class="bub' + (o.multi ? ' sq' : '') + '">' + letter(pos) + '</span><span class="otext">' + opts[oi][0] + '</span>';
      function paint() {
        var on = o.multi ? sel.indexOf(oi) > -1 : sel === oi;
        b.classList.toggle('sel', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
        if (o.reveal) {
          var isKey = o.keys.indexOf(oi) > -1;
          b.classList.toggle('ok', isKey); b.classList.toggle('key', isKey); b.classList.toggle('bad', on && !isKey);
        }
      }
      b._paint = paint; paint();
      b.addEventListener('click', function () {
        if (o.locked) return;
        if (o.multi) {
          var at = sel.indexOf(oi);
          if (at > -1) sel.splice(at, 1);
          else { if (sel.length >= o.pick) { if (o.hint) { o.hint.textContent = 'You can choose only ' + o.pick + '. Click one of your choices again to take it back.'; } return; } sel.push(oi); }
          if (o.hint) o.hint.textContent = '';
        } else sel = (sel === oi ? null : oi);
        btns.forEach(function (x) { x._paint(); });
        o.onChange(o.multi ? sel.slice().sort(function (a, b) { return a - b; }) : sel);
      });
      btns.push(b); wrap.appendChild(b);
    });
    return wrap;
  }

  /* ---------- drag-and-drop table ---------- */
  function dndUI(q, ctx, mount) {
    var a = (ctx.resp && ctx.resp.length === q.rows.length) ? ctx.resp.slice() : q.rows.map(function () { return null; });
    var selChip = null;
    function used(c) { return !q.reuse && a.indexOf(c) > -1; }
    function set(next) { a = next; ctx.resp = a; ctx.onChange(a.slice()); draw(); }
    function placeInto(r, c) { var n = a.slice(); if (!q.reuse) { var at = n.indexOf(c); if (at > -1) n[at] = null; } n[r] = c; selChip = null; set(n); }
    function draw() {
      mount.innerHTML = '';
      var t = el('table', 'dndt'); t.innerHTML = '<thead><tr><th>' + esc(q.cols[0]) + '</th><th>' + esc(q.cols[1]) + '</th></tr></thead>';
      var tb = el('tbody');
      q.rows.forEach(function (label, r) {
        var tr = el('tr'); tr.appendChild(el('td', '', label));
        var td = el('td', 'slot' + (a[r] != null ? ' filled' : '')); td.tabIndex = 0; td.setAttribute('role', 'button');
        td.setAttribute('aria-label', 'Drop box for ' + strip(label) + (a[r] != null ? ', contains ' + q.chips[a[r]] : ', empty'));
        if (a[r] != null) {
          var ch = el('span', 'chip', esc(q.chips[a[r]])); ch.draggable = !ctx.locked;
          ch.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', 'r:' + r); });
          td.appendChild(ch);
        }
        if (ctx.reveal) { td.classList.add(a[r] === q.k[r] ? 'ok' : 'bad'); if (a[r] !== q.k[r]) td.appendChild(el('div', 'small', 'Correct: ' + esc(q.chips[q.k[r]]))); }
        function act() {
          if (ctx.locked) return;
          if (selChip != null) placeInto(r, selChip);
          else if (a[r] != null) { var n = a.slice(); n[r] = null; set(n); }
        }
        td.addEventListener('click', act);
        td.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); act(); } });
        td.addEventListener('dragover', function (ev) { if (!ctx.locked) { ev.preventDefault(); td.classList.add('hot'); } });
        td.addEventListener('dragleave', function () { td.classList.remove('hot'); });
        td.addEventListener('drop', function (ev) {
          ev.preventDefault(); td.classList.remove('hot'); if (ctx.locked) return;
          var d = (ev.dataTransfer.getData('text/plain') || '').split(':');
          if (d[0] === 'c') placeInto(r, +d[1]);
          else if (d[0] === 'r') { var from = +d[1]; if (from === r) return; var n = a.slice(), moving = n[from]; n[from] = n[r]; n[r] = moving; selChip = null; set(n); }
        });
        tr.appendChild(td); tb.appendChild(tr);
      });
      t.appendChild(tb); mount.appendChild(t);
      if (!ctx.reveal) {
        var tray = el('div', 'tray'); tray.setAttribute('aria-label', 'Labels');
        q.chips.forEach(function (label, c) {
          var b = el('button', 'chip' + (used(c) ? ' used' : '') + (selChip === c ? ' sel' : ''), esc(label)); b.type = 'button'; b.draggable = !ctx.locked;
          b.addEventListener('click', function () { if (ctx.locked) return; selChip = (selChip === c ? null : c); draw(); });
          b.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', 'c:' + c); });
          tray.appendChild(b);
        });
        tray.addEventListener('dragover', function (ev) { ev.preventDefault(); });
        tray.addEventListener('drop', function (ev) {
          ev.preventDefault(); var d = (ev.dataTransfer.getData('text/plain') || '').split(':');
          if (d[0] === 'r') { var n = a.slice(); n[+d[1]] = null; set(n); }
        });
        mount.appendChild(tray);
      }
    }
    draw();
  }

  /* ---------- render one item into mount ---------- */
  /* ctx: {resp, seed, shuffle, locked, reveal, why, onChange} */
  function renderItem(q, mount, ctx) {
    ctx = ctx || {}; ctx.onChange = ctx.onChange || function () { };
    if (ctx.resp === undefined) ctx.resp = blank(q);
    mount.innerHTML = '';
    var main = el('div', 'main'), left = el('div', 'panel left'), right = el('div', 'panel right');
    if (ctx.qno) left.appendChild(el('div', 'qno', 'Question ' + ctx.qno + (ctx.of ? ' of ' + ctx.of : '') + (q.p === 2 ? ' (2 points)' : '')));
    if (q.stem) left.appendChild(el('div', 'stem', q.stem));
    if (q.fig) left.appendChild(el('div', 'figwrap', q.fig));
    var shuffle = ctx.shuffle && !q.fixed, seed = (ctx.seed || '') + '|' + q.id;
    var fixedAll = !shuffle;
    var area = el('div', 'resp' + (ctx.locked ? ' locked' : ''));
    if (q.t === 'mc') {
      area.appendChild(choice(q.o, order(q.o.length, fixedAll, seed), { sel: ctx.resp, keys: [q.k], reveal: ctx.reveal, locked: ctx.locked, onChange: function (s) { ctx.resp = s; ctx.onChange(s); } }));
    } else if (q.t === 'ms') {
      area.appendChild(el('p', 'instr', 'Select ' + NUMW[q.pick] + ' answers.'));
      var hint = el('div', 'small'); hint.style.color = '#b45309'; hint.setAttribute('aria-live', 'polite');
      area.appendChild(choice(q.o, order(q.o.length, fixedAll, seed), { multi: true, pick: q.pick, sel: ctx.resp, keys: q.k, reveal: ctx.reveal, locked: ctx.locked, hint: hint, onChange: function (s) { ctx.resp = s; ctx.onChange(s); } }));
      area.appendChild(hint);
    } else if (q.t === 'dd') {
      area.appendChild(el('p', 'instr', 'Use the drop-down menus to complete the statement.'));
      var cl = el('div', 'cloze'), bits = q.cloze.split(/\{(\d)\}/);
      var a = (ctx.resp || []).slice();
      bits.forEach(function (bit, idx) {
        if (idx % 2 === 0) { cl.appendChild(el('span', '', bit)); return; }
        var bi = +bit, sel = el('select'); sel.setAttribute('aria-label', 'Choice ' + (bi + 1));
        sel.appendChild(new Option('Select', ''));
        q.blanks[bi].o.forEach(function (t, oi) { sel.appendChild(new Option(t, String(oi))); });
        if (a[bi] != null) sel.value = String(a[bi]);
        if (ctx.locked) sel.disabled = true;
        if (ctx.reveal) { sel.classList.add(a[bi] === q.blanks[bi].k ? 'ok' : 'bad'); }
        sel.addEventListener('change', function () { a[bi] = sel.value === '' ? null : +sel.value; ctx.resp = a.slice(); ctx.onChange(a.slice()); });
        cl.appendChild(sel);
        if (ctx.reveal && a[bi] !== q.blanks[bi].k) cl.appendChild(el('span', 'small', ' (correct: ' + esc(q.blanks[bi].o[q.blanks[bi].k]) + ') '));
      });
      area.appendChild(cl);
    } else if (q.t === 'dnd') {
      area.appendChild(el('p', 'instr', 'Click a label, then click a box in the table. You can also drag labels. Click a placed label to take it back.'));
      var m = el('div'); area.appendChild(m); dndUI(q, ctx, m);
    } else if (q.t === 'mp') {
      var ra = (ctx.resp || [null, null]).slice();
      q.parts.forEach(function (p, pi) {
        var mm = /^Part ([AB]):\s*/.exec(p.q);
        var pill = el('div', 'partpill ' + (pi ? 'b' : 'a'), 'Part ' + (pi ? 'B' : 'A'));
        area.appendChild(pill); area.appendChild(el('div', 'partq', mm ? p.q.slice(mm[0].length) : p.q));
        area.appendChild(choice(p.o, order(p.o.length, fixedAll, seed + '|p' + pi), { sel: ra[pi], keys: [p.k], reveal: ctx.reveal, locked: ctx.locked, onChange: function (s) { ra[pi] = s; ctx.resp = ra.slice(); ctx.onChange(ra.slice()); } }));
      });
    }
    right.appendChild(area);
    if (ctx.reveal && ctx.why) {
      var sc = score(q, ctx.resp);
      right.appendChild(el('div', 'fb ' + (sc.full ? 'right' : 'wrong'),
        '<b>' + (sc.full ? 'Correct. ' : (sc.e > 0 ? 'Partly correct (' + sc.e + ' of ' + q.p + '). ' : 'Not quite. ')) + '</b>' + q.why));
    }
    main.appendChild(left); main.appendChild(right); mount.appendChild(main);
  }

  /* ---------- print / answer-key rendering (static HTML string) ---------- */
  function keyText(q) {
    function ch(o, k) { return letter(k) + ') ' + strip(o[k][0]); }
    if (q.t === 'mc') return ch(q.o, q.k);
    if (q.t === 'ms') return q.k.map(function (k) { return ch(q.o, k); }).join('; ');
    if (q.t === 'dd') return q.blanks.map(function (b, i) { return (i + 1) + ') ' + b.o[b.k]; }).join('; ');
    if (q.t === 'dnd') return q.rows.map(function (r, i) { return strip(r) + ' = ' + q.chips[q.k[i]]; }).join('; ');
    if (q.t === 'mp') return q.parts.map(function (p, i) { return 'Part ' + (i ? 'B' : 'A') + ': ' + ch(p.o, p.k); }).join(' | ');
  }
  function renderStatic(q, n, withKey) {
    var h = '<div class="pitem' + (withKey ? ' pk' : '') + '"><div class="qh">' + n + '. <span class="small muted">' + q.id + ' | ' + q.std + ' | DOK ' + q.dok + ' | ' + q.p + ' pt' + (q.p > 1 ? 's' : '') + '</span></div>';
    if (q.stem) h += '<div class="stem">' + q.stem + '</div>';
    if (q.fig) h += q.fig;
    function opts(list, sel) { return list.map(function (o, i) { return '<div class="popt">' + (withKey && sel.indexOf(i) > -1 ? '<b>' : '') + letter(i) + ') ' + o[0] + (withKey && sel.indexOf(i) > -1 ? '</b> &#10004;' : '') + '</div>'; }).join(''); }
    if (q.t === 'mc') h += opts(q.o, withKey ? [q.k] : []);
    else if (q.t === 'ms') h += '<p class="instr">Select ' + NUMW[q.pick] + ' answers.</p>' + opts(q.o, withKey ? q.k : []);
    else if (q.t === 'dd') {
      h += '<div class="cloze">' + q.cloze.replace(/\{(\d)\}/g, function (m, i) { return '<span class="blank">&nbsp;' + (withKey ? '<b>' + esc(q.blanks[+i].o[q.blanks[+i].k]) + '</b>' : '(' + (+i + 1) + ')') + '&nbsp;</span>'; }) + '</div>';
      if (!withKey) h += q.blanks.map(function (b, i) { return '<div class="popt small">(' + (i + 1) + ') ' + b.o.map(function (t, j) { return letter(j) + ') ' + esc(t); }).join('&nbsp;&nbsp; ') + '</div>'; }).join('');
    } else if (q.t === 'dnd') {
      h += '<table class="dndt"><thead><tr><th>' + esc(q.cols[0]) + '</th><th>' + esc(q.cols[1]) + '</th></tr></thead><tbody>' +
        q.rows.map(function (r, i) { return '<tr><td>' + r + '</td><td>' + (withKey ? '<b>' + esc(q.chips[q.k[i]]) + '</b>' : '&nbsp;') + '</td></tr>'; }).join('') + '</tbody></table>';
      if (!withKey) h += '<div class="small">Labels: ' + q.chips.map(esc).join(' &nbsp;|&nbsp; ') + (q.reuse ? ' (a label can be used more than once)' : '') + '</div>';
    } else if (q.t === 'mp') {
      q.parts.forEach(function (p, i) { h += '<div class="partq">' + esc(p.q) + '</div>' + opts(p.o, withKey ? [p.k] : []); });
    }
    if (withKey) h += '<div class="keyline"><b>Answer:</b> ' + keyText(q) + '<br><span class="small">' + q.why + '</span></div>';
    return h + '</div>';
  }

  /* ---------- assessment link encoding ---------- */
  function b64e(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function encodeAssessment(a) { return b64e(JSON.stringify({ v: 1, id: a.id, t: a.title, i: a.ids, s: a.shuffle ? 1 : 0, f: a.feedback, m: a.minutes || 0 })); }
  function decodeAssessment(code) {
    try {
      var o = JSON.parse(b64d(code));
      if (!o || !o.id || !Array.isArray(o.i)) return null;
      var ids = o.i.filter(function (id) { return byId[id]; });
      if (!ids.length) return null;
      return { id: String(o.id), title: String(o.t || 'Practice assessment'), ids: ids, shuffle: !!o.s, feedback: o.f || 'full', minutes: +o.m || 0, missing: o.i.length - ids.length };
    } catch (e) { return null; }
  }
  function newAid() { var d = new Date(); function z(n) { return (n < 10 ? '0' : '') + n; } return 'A' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6); }

  /* ---------- saving results ---------- */
  var SAVE = {
    mode: function () { return CFG.SCRIPT_URL ? 'server' : 'local'; },
    outbox: function () { return store('sci_outbox') || []; },
    post: function (payload) {
      var url = CFG.SCRIPT_URL, tries = 0;
      function once() {
        tries++;
        var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
        return fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', signal: ctl ? ctl.signal : undefined })
          .then(function (r) { clearTimeout(to); return r.json(); })
          .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'The server did not confirm the save.'); return j; })
          .catch(function (err) { clearTimeout(to); if (tries < 3) return new Promise(function (res) { setTimeout(res, 800 * tries); }).then(once); throw err; });
      }
      return once();
    },
    /* returns a promise: {ok:true, local:bool} or {ok:false, error} */
    submit: function (payload) {
      var box = store('sci_outbox') || []; box.push(payload); store('sci_outbox', box);
      if (!CFG.SCRIPT_URL) {
        var all = store('sci_local_attempts') || []; all.push(payload); store('sci_local_attempts', all);
        store('sci_outbox', box.filter(function (p) { return p !== payload && p.sub !== payload.sub; }));
        return Promise.resolve({ ok: true, local: true });
      }
      return SAVE.post(payload).then(function () {
        store('sci_outbox', (store('sci_outbox') || []).filter(function (p) { return p.sub !== payload.sub; }));
        return { ok: true, local: false };
      }, function (err) { return { ok: false, error: String(err && err.message || err) }; });
    }
  };
  function fetchJSON(params) {
    var u = CFG.SCRIPT_URL + (CFG.SCRIPT_URL.indexOf('?') > -1 ? '&' : '?') + Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(u, { redirect: 'follow' }).then(function (r) { return r.json(); });
  }

  /* ---------- sample class (local demo only) ---------- */
  function sampleClass(aid, title, ids, n) {
    var names = [['Avery', 'Brooks'], ['Marcus', 'Taylor'], ['Hannah', 'Reed'], ['Jaylen', 'Williams'], ['Sofia', 'Martin'], ['Ethan', 'Coleman'], ['Naomi', 'Jackson'], ['Carter', 'Dixon'], ['Imani', 'Porter'], ['Owen', 'Sanders'], ['Zoe', 'Hall'], ['Isaiah', 'King'], ['Lily', 'Green'], ['Micah', 'Lewis'], ['Grace', 'Fisher'], ['Andre', 'Nash'], ['Mia', 'Vaughn'], ['Landon', 'Adams'], ['Ruby', 'Ellis'], ['Elijah', 'Quinn'], ['Tessa', 'Owens'], ['Xavier', 'Young'], ['Nora', 'Zimmer'], ['Dylan', 'Underwood']];
    var r = rng('sample' + aid), out = [], tags = Object.keys(MISC);
    for (var s = 0; s < Math.min(n || 24, names.length); s++) {
      var lv = r() < 0.22 ? 1 + Math.floor(r() * 4) : 0;
      var theta = 0.25 + r() * 0.7, items = [], e = 0, p = 0;
      ids.forEach(function (id) {
        var q = byId[id], base = theta - (q.dok - 1) * 0.12 + (r() - 0.5) * 0.25, a;
        var good = r() < base;
        if (q.t === 'mc') a = good ? q.k : pickWrong(q.o.length, [q.k], r);
        else if (q.t === 'ms') a = good ? q.k.slice() : [q.k[0], pickWrong(q.o.length, q.k, r)].sort(function (x, y) { return x - y; });
        else if (q.t === 'dd') a = q.blanks.map(function (b) { return (good || r() < 0.6) ? b.k : pickWrong(b.o.length, [b.k], r); });
        else if (q.t === 'dnd') a = q.k.map(function (k) { return (good || r() < 0.55) ? k : pickWrong(q.chips.length, [k], r); });
        else a = q.parts.map(function (pt) { return (good || r() < 0.4) ? pt.k : pickWrong(pt.o.length, [pt.k], r); });
        var sc = score(q, a); e += sc.e; p += q.p;
        items.push({ id: id, std: q.std, dok: q.dok, t: q.t, p: q.p, e: sc.e, r: a, tg: sc.tags });
      });
      out.push({ v: 1, sub: 'S' + aid + s, aid: aid, title: title, first: names[s][0], last: names[s][1], period: String(1 + (s % 3)), score: e, possible: p, secs: 600 + Math.floor(r() * 900), at: new Date().toISOString(), sample: true, leaves: lv, away: lv ? lv * (8 + Math.floor(r() * 50)) : 0, leavelog: [], items: items });
    }
    return out;
  }
  function pickWrong(n, not, r) { var c = []; for (var i = 0; i < n; i++) if (not.indexOf(i) < 0) c.push(i); return c[Math.floor(r() * c.length)]; }

  return { byId: byId, el: el, esc: esc, strip: strip, letter: letter, store: store, score: score, answered: answered, blank: blank, renderItem: renderItem, renderStatic: renderStatic,
    keyText: keyText, encodeAssessment: encodeAssessment, decodeAssessment: decodeAssessment, newAid: newAid, SAVE: SAVE, fetchJSON: fetchJSON, sampleClass: sampleClass, CFG: CFG };
})();
