// Minimalist Modern: the blueprint of our home.
// Cover: a drafting sheet. Drag the ruler (or tap "Dựng ngôi nhà") and the floor plan is drawn line by line,
// then the camera tilts, the plan extrudes into an isometric house, the windows light up and the names snap into the grid.
// All artwork is canvas / CSS. No external images besides the couple's own photo (the baked-in VOGUE logo is cropped out).
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/minimal_modern_couple_1790233381708.jpg';
  const isFallback = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h); };
  const photoOf = c => isFallback(c) ? PHOTO : c.config.couple.heroImage;
  const NB = s => String(s || '').trim().replace(/\s+/g, ' ');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const DEG = Math.PI / 180;
  const INK = '#111111', COPPER = '#b97a3e';
  const fmt = n => Math.round(n).toLocaleString('vi-VN');
  const dmy = iso => String(iso || '').split('-').reverse().join('.');

  // ---------------------------------------------------------------- the house
  // plan units: the lot is 108 x 88. Volumes: ground floor, a cantilevered upper floor, a thin roof plate, a terrace.
  const BOXES = [
    { id: 'slab', x: -4, y: -4, w: 108, d: 88, t: 'slab' },
    { id: 'terr', x: 62, y: 44, w: 34, d: 32, t: 'terr' },
    { id: 'base', x: 8, y: 30, w: 56, d: 46, t: 'vol' },
    { id: 'up', x: 28, y: 10, w: 64, d: 42, t: 'vol' },
    { id: 'roof', x: 26, y: 8, w: 68, d: 46, t: 'roof' }
  ];
  const BY = Object.fromEntries(BOXES.map(b => [b.id, b]));
  // plan segments (drawn progressively in stage 1)
  const rect = (b, dash) => [[b.x, b.y, b.x + b.w, b.y], [b.x + b.w, b.y, b.x + b.w, b.y + b.d], [b.x + b.w, b.y + b.d, b.x, b.y + b.d], [b.x, b.y + b.d, b.x, b.y]].map(s => [...s, dash || 0]);
  const arc = (cx, cy, r, a0, a1, n = 9) => Array.from({ length: n }, (_, i) => { const t0 = a0 + (a1 - a0) * i / n, t1 = a0 + (a1 - a0) * (i + 1) / n; return [cx + r * Math.cos(t0 * DEG), cy + r * Math.sin(t0 * DEG), cx + r * Math.cos(t1 * DEG), cy + r * Math.sin(t1 * DEG), 0]; });
  const SEGS = [
    ...rect(BY.base), ...rect(BY.up, 1), ...rect(BY.terr),
    [36, 30, 36, 54, 0], [36, 62, 36, 76, 0], [8, 54, 36, 54, 0], [36, 54, 64, 54, 0],
    [36, 62, 43, 62, 0], ...arc(36, 62, 7, 0, -90), [14, 38, 30, 38, 1], [14, 46, 30, 46, 1],
    [44, 38, 58, 38, 1], [44, 38, 44, 48, 1], [58, 38, 58, 48, 1], [44, 48, 58, 48, 1]
  ];
  const SEGLEN = SEGS.map(s => Math.hypot(s[2] - s[0], s[3] - s[1]));
  const TOTAL = SEGLEN.reduce((a, b) => a + b, 0);
  const ROOMS = [['KHÁCH', 20, 70], ['BẾP', 48, 70], ['NGỦ', 21, 50], ['SÂN', 80, 62]];
  // window decals: [box, side, u0, u1, v0, v1, kind]
  const WIN = [
    ['up', '+y', .1, .42, .22, .78, 'w'], ['up', '+y', .56, .9, .22, .78, 'w'], ['up', '+x', .12, .88, .22, .72, 'w'],
    ['up', '-x', .2, .8, .22, .72, 'w'], ['up', '-y', .15, .85, .22, .72, 'w'],
    ['base', '+y', .08, .48, .3, .76, 'w'], ['base', '+y', .6, .76, 0, .82, 'door'], ['base', '+x', .2, .8, .3, .74, 'w'],
    ['base', '-x', .2, .8, .3, .74, 'w']
  ];
  const SIDES = (b) => [['-y', b.x, b.y, b.x + b.w, b.y, 0, -1], ['+x', b.x + b.w, b.y, b.x + b.w, b.y + b.d, 1, 0], ['+y', b.x + b.w, b.y + b.d, b.x, b.y + b.d, 0, 1], ['-x', b.x, b.y + b.d, b.x, b.y, -1, 0]];

  function makeHouse(canvas) {
    const g = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const S = { p: 1, e: 35.264, th: 45, G: 1, fill: 1, lit: 0, dim: 0, part: 0, plan: 1, litN: 0, pulse: -1, tip: null };
    const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); };
    fit();
    const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    function draw() {
      if (!W || !H) fit();
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const k = clamp((90 - S.e) / (90 - 35.264));
      const scPlan = Math.min(W / 122, H / 100), scIso = Math.min(W / 152, H / 122);
      const sc = scPlan + (scIso - scPlan) * k;
      const th = S.th * DEG, e = S.e * DEG, sin = Math.sin(e), cos = Math.cos(e), cth = Math.cos(th), sth = Math.sin(th);
      const ox = W / 2, oy = H / 2 + 11 * sc * cos;
      const P = (x, y, z = 0) => { const dx = x - 50, dy = y - 44; return [ox + (dx * cth - dy * sth) * sc, oy + (dx * sth + dy * cth) * sc * sin - z * sc * cos]; };
      g.lineJoin = 'round'; g.lineCap = 'round';
      const poly = (pts, fill, stroke, lw = 1.1) => {
        g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
        if (fill) { g.fillStyle = fill; g.fill(); }
        if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
      };
      const mono = 'IBM Plex Mono, ui-monospace, monospace';

      // ---- stage 1: the plan drawn line by line
      if (S.plan) {
        const shown = clamp(S.p) * TOTAL;
        // lot boundary + ghost of the plan
        g.save();
        g.setLineDash([3, 4]); g.strokeStyle = 'rgba(185,122,62,.75)'; g.lineWidth = 1;
        const L = BY.slab; poly([P(L.x, L.y), P(L.x + L.w, L.y), P(L.x + L.w, L.y + L.d), P(L.x, L.y + L.d)], null, 'rgba(185,122,62,.7)', 1);
        g.restore();
        if (S.p < 1) {
          g.strokeStyle = 'rgba(17,17,17,.13)'; g.lineWidth = 1;
          SEGS.forEach(s => { const a = P(s[0], s[1]), b = P(s[2], s[3]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
        }
        let acc = 0; S.tip = null;
        SEGS.forEach((s, i) => {
          const len = SEGLEN[i];
          if (acc >= shown) return;
          const f = clamp((shown - acc) / len); acc += len;
          const a = P(s[0], s[1]), b = P(s[0] + (s[2] - s[0]) * f, s[1] + (s[3] - s[1]) * f);
          g.save(); if (s[4]) g.setLineDash([4, 3]);
          g.strokeStyle = INK; g.lineWidth = s[4] ? 1 : 1.5; g.globalAlpha = Math.max(0, 1 - S.G * 6);
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore();
          if (f < 1 || acc >= shown) S.tip = b;
        });
        // room labels + dimension lines
        const la = clamp((S.p - .55) / .35) * (1 - clamp(S.G * 4));
        if (la > 0) {
          g.save(); g.globalAlpha = la; g.fillStyle = INK; g.font = `500 ${Math.max(7, 7.5 * sc / 2.2)}px ${mono}`; g.textAlign = 'center';
          ROOMS.forEach(([t, x, y]) => { const [px, py] = P(x, y); g.fillText(t, px, py); });
          g.restore();
        }
        const da = clamp((S.p - .85) / .15) * (1 - clamp(S.G * 6));
        if (da > 0) {
          g.save(); g.globalAlpha = da; g.strokeStyle = COPPER; g.fillStyle = COPPER; g.lineWidth = 1; g.font = `500 ${Math.max(8, 8 * sc / 2.2)}px ${mono}`; g.textAlign = 'center';
          const dim = (x1, y1, x2, y2, label) => {
            const a = P(x1, y1), b = P(x2, y2); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
            [a, b].forEach(q => { g.beginPath(); g.moveTo(q[0] - 3, q[1] - 3); g.lineTo(q[0] + 3, q[1] + 3); g.stroke(); });
            const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            if (y1 === y2) g.fillText(label, mx, my - 5); else { g.save(); g.translate(mx - 6, my); g.rotate(-Math.PI / 2); g.fillText(label, 0, 0); g.restore(); }
          };
          dim(8, 90, 64, 90, '5,60'); dim(-12, 30, -12, 76, '4,60'); dim(28, 4, 92, 4, '6,40');
          g.restore();
        }
        if (S.tip && S.p < 1 && S.p > 0) { g.fillStyle = COPPER; g.beginPath(); g.arc(S.tip[0], S.tip[1], 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(185,122,62,.35)'; g.beginPath(); g.arc(S.tip[0], S.tip[1], 7, 0, 7); g.stroke(); }
        if (S.G <= 0) return;
      }

      // ---- stage 2: volumes (painter's order)
      const gg = id => clamp((S.G - { terr: 0, base: 0, up: .22, roof: .5 }[id]) / (id === 'base' ? .6 : .5));
      const kb = ease(gg('base')), ku = ease(gg('up')), kr = ease(gg('roof')), kt = ease(gg('terr'));
      const zr = { slab: [-3 * S.G, 0], terr: [0, 3 * kt], base: [0, 26 * kb], up: [26 * kb, 26 * kb + 20 * ku], roof: [26 * kb + 20 * ku, 26 * kb + 20 * ku + 2.5 * kr] };
      const order = BOXES.map(b => ({ b, z: zr[b.id] })).sort((a, b) => a.z[0] - b.z[0] || (((a.b.x + a.b.w / 2 - 50) * sth + (a.b.y + a.b.d / 2 - 44) * cth) - ((b.b.x + b.b.w / 2 - 50) * sth + (b.b.y + b.b.d / 2 - 44) * cth)));
      let wi = 0;
      order.forEach(({ b, z: [zb, zt] }) => {
        if (b.id === 'roof' && kr <= 0) return;
        if (b.id === 'up' && ku <= 0) return;
        if (b.id === 'terr' && kt <= 0) return;
        const fa = b.id === 'slab' ? S.fill * .9 : S.fill;
        const top = { slab: `rgba(240,240,237,${fa})`, terr: `rgba(231,214,193,${fa})`, vol: `rgba(255,255,255,${fa})`, roof: `rgba(30,30,30,${fa})` }[b.t];
        SIDES(b).forEach(([name, x1, y1, x2, y2, nx, ny]) => {
          const nY = nx * sth + ny * cth, nX = nx * cth - ny * sth;
          if (nY <= .02 || zt - zb < .05) return;
          const lum = Math.round(228 - nX * 18);
          const col = b.t === 'roof' ? `rgba(14,14,14,${fa})` : b.t === 'terr' ? `rgba(${lum - 28},${lum - 40},${lum - 56},${fa})` : `rgba(${lum},${lum},${lum - 2},${fa})`;
          poly([P(x1, y1, zb), P(x2, y2, zb), P(x2, y2, zt), P(x1, y1, zt)], col, INK, 1.1);
          // fluted cladding on the upper floor
          if (b.id === 'up' && S.fill > .5) {
            g.strokeStyle = 'rgba(17,17,17,.16)'; g.lineWidth = .7; g.beginPath();
            const n = Math.round(Math.hypot(x2 - x1, y2 - y1) / 2.2);
            for (let i = 1; i < n; i++) { const u = i / n, a = P(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, zb), c2 = P(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, zt); g.moveTo(a[0], a[1]); g.lineTo(c2[0], c2[1]); }
            g.stroke();
          }
          // windows
          WIN.forEach(w => {
            if (w[0] !== b.id || w[1] !== name) return;
            const idx = wi++;
            const q = (u, v) => P(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, zb + (zt - zb) * v);
            const pts = [q(w[2], w[4]), q(w[3], w[4]), q(w[3], w[5]), q(w[2], w[5])];
            const a = clamp(S.lit * 1.8 - idx * .12) + (S.pulse === idx ? 1 : 0);
            poly(pts, `rgba(${w[6] === 'door' ? '40,44,48' : '58,64,70'},${.85 * S.fill})`, INK, 1);
            if (a > 0) { poly(pts, `rgba(255,221,150,${clamp(a) * .95})`, null); }
            // fluted glass lines
            g.strokeStyle = a > 0 ? 'rgba(160,100,40,.35)' : 'rgba(255,255,255,.28)'; g.lineWidth = .6; g.beginPath();
            const n = w[6] === 'door' ? 5 : 9;
            for (let i = 1; i < n; i++) { const u = w[2] + (w[3] - w[2]) * i / n, a1 = q(u, w[4]), b1 = q(u, w[5]); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); }
            g.stroke();
            if (w[6] === 'door' && S.fill > .6) { const h1 = q(w[2] + (w[3] - w[2]) * .14, .34), h2 = q(w[2] + (w[3] - w[2]) * .14, .52); g.strokeStyle = COPPER; g.lineWidth = 2.6; g.beginPath(); g.moveTo(h1[0], h1[1]); g.lineTo(h2[0], h2[1]); g.stroke(); }
          });
        });
        poly([P(b.x, b.y, zt), P(b.x + b.w, b.y, zt), P(b.x + b.w, b.y + b.d, zt), P(b.x, b.y + b.d, zt)], top, b.t === 'slab' ? 'rgba(185,122,62,.8)' : INK, b.t === 'slab' ? 1 : 1.2);
      });
    }
    return { S, draw, fit };
  }

  const reduce = c => c.reduced;
  // letters of a name, grapheme-safe
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const letters = s => seg ? Array.from(seg.segment(s), x => x.segment) : (String(s).normalize('NFC').match(/\P{M}\p{M}*/gu) || []);
  const splitName = (name, i0 = 0) => { let i = i0; const html = `<span class="mm-nm">${letters(NB(name)).map(ch => ch === ' ' ? '<span class="mm-ch sp">&nbsp;</span>' : `<span class="mm-ch" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`; return { html, n: i }; };

  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const ICO_ARROW = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><path d="M3 12h18M15 6l6 6-6 6"/></svg>';

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    try { document.fonts.load('500 10px "IBM Plex Mono"'); } catch { /* offline */ }
    const a = splitName(D.bride.name), b = splitName(D.groom.name, a.n);
    el.innerHTML = `<div class="mm-cover">
      <div class="mm-grid" aria-hidden="true"></div>
      <i class="mm-xh x" aria-hidden="true"></i><i class="mm-xh y" aria-hidden="true"></i>
      <div class="mm-cv-in">
        <div class="mm-meta"><span>Bản vẽ số 01</span><span>Tỷ lệ 1 : 100</span></div>
        <h1 class="mm-names">${a.html}<span class="mm-and">và</span>${b.html}</h1>
        <div class="mm-stage"><canvas class="mm-house" aria-hidden="true"></canvas>
          <span class="mm-read" aria-hidden="true">x 00 · y 00</span></div>
        <div class="mm-ruler" role="group" aria-label="Thước vẽ">
          <span class="mm-rl">Kéo thước để vẽ ngôi nhà của chúng mình</span>
          <div class="mm-track"><i class="mm-fill"></i><button class="mm-handle" type="button" aria-label="Kéo thước sang phải để vẽ">${ICO_ARROW}</button></div>
        </div>
        <dl class="mm-tb">
          <div><dt>Gửi</dt><dd>${e(c.guest)}</dd></div>
          <div><dt>Ngày</dt><dd>${c.d}.${c.m}.${c.y}</dd></div>
          <div><dt>${c.dow}</dt><dd>${e(c.config.couple.city || '')}</dd></div>
        </dl>
        <button class="open-btn" type="button">Dựng ngôi nhà</button>
      </div></div>`;
    const root = el.querySelector('.mm-cover'), cv = el.querySelector('.mm-house');
    const track = el.querySelector('.mm-track'), handle = el.querySelector('.mm-handle'), fillEl = el.querySelector('.mm-fill');
    const openBtn = el.querySelector('.open-btn'), read = el.querySelector('.mm-read');
    const house = makeHouse(cv);
    const S = house.S; S.p = 0; S.e = 90; S.th = 0; S.G = 0; S.fill = 0; S.plan = 1;
    const draw = () => house.draw();
    draw();
    const onResize = () => { house.fit(); draw(); };
    addEventListener('resize', onResize);

    // drafting crosshair snapped to the 24px grid + a little readout
    const xv = el.querySelector('.mm-xh.x'), yv = el.querySelector('.mm-xh.y');
    const onPtr = ev => {
      const gx = Math.round(ev.clientX / 24) * 24, gy = Math.round(ev.clientY / 24) * 24;
      root.style.setProperty('--cx', gx + 'px'); root.style.setProperty('--cy', gy + 'px');
      read.textContent = `x ${String(Math.round(gx / 24)).padStart(2, '0')} · y ${String(Math.round(gy / 24)).padStart(2, '0')}`;
    };
    if (matchMedia('(pointer:fine)').matches) addEventListener('pointermove', onPtr, { passive: true });
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    const chars = [...el.querySelectorAll('.mm-ch')];
    const wait = ms => new Promise(r => c.after(ms, r));
    let started = false, pen = null;
    const setDraw = p => { S.p = p; fillEl.style.width = (p * 100).toFixed(1) + '%'; handle.style.setProperty('--hp', p.toFixed(3)); draw(); };
    const penTick = () => { M.tone('click'); };
    const scatter = () => {
      chars.forEach(ch => {
        const sx = (Math.round(Math.random() * 6) - 3) * 24, sy = (Math.round(Math.random() * 4) - 2) * 24;
        ch.style.setProperty('--sx', sx + 'px'); ch.style.setProperty('--sy', sy + 'px');
      });
      root.classList.add('scatter');
    };
    const run = async () => {
      if (started) return; started = true;
      openBtn.disabled = true; handle.disabled = true;
      M.requestTilt(); EA.music(); M.haptic('tap'); M.tone('click');
      root.classList.add('is-drawing');
      const p0 = S.p;
      if (p0 < 1) await M.tween(p0, 1, 1700 * (1 - p0) + 250, 'inOut', setDraw);
      setDraw(1); M.tone('pop'); M.haptic('tap');
      await wait(260);
      // extrude: the camera tilts from plan to isometric while the volumes rise
      root.classList.add('is-rising'); scatter(); M.tone('whoosh');
      const rise = M.tween(0, 1, 2000, 'inOut', t => {
        S.G = t; S.e = 90 - (90 - 35.264) * t; S.th = 45 * t; S.fill = clamp(t * 1.6 - .1); S.part = clamp(t * 5); draw();
      });
      c.after(900, () => M.haptic('crack'));
      await rise;
      S.G = 1; S.e = 35.264; S.th = 45; S.fill = 1; draw();
      M.haptic('thud'); M.tone('thud');
      root.classList.add('is-built');
      await M.tween(0, 1, 800, 'out', t => { S.lit = t; draw(); });
      M.tone('chime');
      root.classList.remove('scatter'); root.classList.add('snap'); M.haptic('success');
      await wait(1750);
      offTilt(); removeEventListener('pointermove', onPtr); removeEventListener('resize', onResize);
      open();
    };
    // drag the ruler: the plan is drawn as far as the handle goes
    const dist = () => Math.max(60, track.clientWidth - handle.offsetWidth - 4);
    M.drag(handle, {
      axis: 'x', distance: dist(),
      onMove(p) { if (started) return; setDraw(p); if (p > .02) root.classList.add('is-drawing'); },
      onEnd(p) {
        if (started) return;
        if (p > .5) { run(); return; }
        M.tween(S.p, 0, 360, 'out', setDraw);
        root.classList.remove('is-drawing');
      }
    });
    handle.addEventListener('pointerdown', () => { M.requestTilt(); M.haptic('tap'); M.tone('click'); });
    // keyboard: arrow keys draw, Enter builds
    handle.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight' || ev.key === 'Enter') { ev.preventDefault(); run(); } });
    openBtn.addEventListener('click', run);
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="mm-hd"><span class="mm-eb">${esc(mc.eyebrow != null ? mc.eyebrow : eb)}</span><h2>${esc(mc.title != null && mc.title !== '' ? mc.title : title)}</h2>${sub || mc.sub ? `<p class="mm-sub">${esc(mc.sub || sub)}</p>` : ''}</header>`;
  };
  const dmsOf = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), s = Math.round(((a - d) * 60 - m) * 60); return `${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″${v >= 0 ? pos : neg}`; };

  // ---- hero: photo plate + names + a model house you can turn
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    const A = splitName(D.bride.name), B = splitName(D.groom.name, A.n);
    const metDate = c.p.get('metDate', '');
    return `<div class="mm-hero">
      <div class="mm-hero-meta"><span>Bản vẽ số 01</span><span>${e(cp.city || '')}</span></div>
      <figure class="mm-plate${isFallback(c) ? ' crop' : ''}">
        <img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">
        <i class="rc tl"></i><i class="rc tr"></i><i class="rc bl"></i><i class="rc br"></i>
        <figcaption>Hình 01 · ${e(D.bride.short || D.bride.name)} và ${e(D.groom.short || D.groom.name)}</figcaption>
      </figure>
      <h1 class="mm-hnames">${A.html.replace('mm-nm', 'mm-nm on')}<span class="mm-and">và</span>${B.html.replace('mm-nm', 'mm-nm on')}</h1>
      ${cp.headline ? `<p class="mm-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="mm-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d}.${c.m}.${c.y}</b>${cp.lunarDate ? `<span>${e(cp.lunarDate)}</span>` : ''}</button>
      <div class="mm-stamp" role="status" aria-live="polite" data-met="${e(metDate)}"><i></i><span class="mm-stamp-t"></span></div>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
      <div class="mm-model">
        <canvas class="mm-house2" aria-hidden="true"></canvas>
        <button class="mm-turn" type="button" aria-label="Xoay mô hình ngôi nhà">${EA.icon('replay')}<span>Xoay mô hình</span></button>
      </div>
    </div>`;
  });

  // ---- invitation: the design brief + site coordinates + measurements
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content;
    const pin = c.p.get('metPin', null), place = c.p.get('metPlace', ''), met = c.p.get('metDate', ''), city = c.p.get('metCity', '');
    const days = c.p.daysTogether;
    // measurement rows from real numbers
    const rows = [];
    if (days != null && days > 0) {
      const y = Math.floor(days / 365.25), mo = Math.floor((days - y * 365.25) / 30.44);
      rows.push({ label: 'Thời gian bên nhau', n: days, unit: 'ngày', sub: `${y ? y + ' năm ' : ''}${mo} tháng, tính từ ${dmy(met)}`, w: 1 });
    }
    const pins = c.p.get('hometownPins', {}), h = c.p.get('hometowns', {});
    if (pins.bride && pins.groom) {
      const km = Math.round(c.p.kmBetween(pins.bride, pins.groom) / 10) * 10;
      rows.push({ label: 'Khoảng cách hai quê', n: km, unit: 'km', sub: `${h.bride || 'Quê nhà gái'} và ${h.groom || 'quê nhà trai'}`, w: .72 });
    }
    const pl = c.p.get('places', []);
    if (pl.length > 1) {
      let tot = 0; for (let i = 1; i < pl.length; i++) tot += c.p.kmBetween(pl[i - 1], pl[i]) || 0;
      rows.push({ label: 'Quãng đường đã cùng đi', n: Math.round(tot / 10) * 10, unit: 'km', sub: `${pl.length} điểm đến, từ ${pl[0].name} tới ${pl[pl.length - 1].name}`, w: .46 });
    }
    const meas = rows.length ? `<div class="mm-meas">
      <span class="mm-eb">Số đo của chúng mình</span>
      ${rows.map(r => `<div class="mm-row" data-n="${r.n}" style="--w:${r.w}">
        <div class="mm-rlab">${e(r.label)}</div>
        <div class="mm-num"><b>${fmt(r.n)}</b><span>${e(r.unit)}</span></div>
        <div class="mm-dimline" aria-hidden="true"><i class="l"></i><i class="r"></i><u></u></div>
        <div class="mm-rsub">${e(r.sub)}</div></div>`).join('')}
    </div>` : '';
    const site = pin || place || met ? `<div class="mm-site">
      <svg class="mm-xs" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="34"/><circle cx="60" cy="60" r="16"/><path d="M60 0v120M0 60h120" class="ax"/><circle cx="60" cy="60" r="3.2" class="dot"/><path d="M60 60L96 30" class="ld"/></svg>
      <div class="mm-site-t">
        <span class="mm-eb">Toạ độ khởi công</span>
        <h3>${e(place || 'Nơi chúng mình gặp nhau')}</h3>
        ${pin ? `<p class="mm-mono">${dmsOf(pin.lat, 'N', 'S')}<br>${dmsOf(pin.lng, 'E', 'W')}</p>` : ''}
        <p class="mm-sitemeta">${[met ? 'Khởi công ngày ' + dmy(met) : '', city].filter(Boolean).map(esc).join(' · ')}</p>
      </div></div>` : '';
    const paras = [...D.letter.slice(0, 2), '§', ...D.letter.slice(2)];
    let n = 0;
    return `<div class="wrap">
      <div class="mm-brief">
        <aside class="mm-brief-side"><span class="mm-eb">Thuyết minh</span>
          <div class="mm-salute">${t(mc.greeting || 'Gửi {guestName},')}</div></aside>
        <div class="mm-brief-main">
          <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
          ${paras.map(p => p === '§' ? (D.letterHighlight ? `<p class="mm-hl">${t(D.letterHighlight)}</p>` : '') : `<p class="mm-p"><span class="mm-n">${String(++n).padStart(2, '0')}</span>${t(p)}</p>`).join('')}
          <p class="mm-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
        </div>
      </div>
      ${meas}${site}
    </div>`;
  });

  // ---- families: spec table + the distance between hometowns
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f, code) => `<article class="mm-fam"><span class="mm-code">${code}</span><h3>${label}</h3>
      <dl><dt>Ông</dt><dd>${e(f.father)}</dd><dt>Bà</dt><dd>${e(f.mother)}</dd>${f.address ? `<dt>Địa chỉ</dt><dd>${e(f.address)}</dd>` : ''}</dl></article>`;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}
      <div class="mm-fams">${fam('Nhà trai', D.groomFamily, 'GĐ-01')}${fam('Nhà gái', D.brideFamily, 'GĐ-02')}</div>
      <p class="mm-couple">${esc(D.groom.name)} <span>và</span> ${esc(D.bride.name)}</p>
      ${D.announceNote ? `<p class="mm-note">${e(D.announceNote)}</p>` : ''}
    </div>`;
  });

  // ---- story: chapters as sections, then the floor plan of the shared home
  EA.section('story', c => {
    const { esc: e, mod, p } = c;
    const s = mod.content, tr = p.get('traits', {}), B = tr.bride || {}, G = tr.groom || {};
    const bn = c.data.bride.short || c.data.bride.name, gn = c.data.groom.short || c.data.groom.name;
    const rooms = [];
    if (B.hobby) rooms.push({ k: `Góc của ${bn}`, v: B.hobby });
    if (G.hobby) rooms.push({ k: `Góc của ${gn}`, v: G.hobby });
    if (B.drink || G.drink) rooms.push({ k: 'Bếp và quầy bar', v: [B.drink, G.drink].filter(Boolean).join(' · ') });
    if (p.has('pet.name')) rooms.push({ k: `Chỗ của ${p.get('pet.name')}`, v: `Bạn ${p.get('pet.kind', 'nhỏ')} giữ nhà` });
    if (p.has('song.title')) rooms.push({ k: 'Phòng nghe nhạc', v: `${p.get('song.title')}${p.has('song.artist') ? ' · ' + p.get('song.artist') : ''}` });
    if (B.rhythm && G.rhythm && B.rhythm !== G.rhythm) rooms.push({ k: 'Phòng ngủ', v: `${B.rhythm === 'morning' ? bn : gn} dậy cùng nắng, ${B.rhythm === 'morning' ? gn : bn} thức cùng đèn` });
    const spans = { 1: [6], 2: [3, 3], 3: [6, 3, 3], 4: [3, 3, 3, 3], 5: [3, 3, 2, 2, 2], 6: [2, 2, 2, 2, 2, 2] }[rooms.length] || [];
    const plan = rooms.length ? `<div class="mm-plan-w">
      <span class="mm-eb">Mặt bằng tổ ấm</span><h3 class="mm-plan-h">Những căn phòng của hai đứa</h3>
      <div class="mm-plan" role="list">${rooms.map((r, i) => `<div class="mm-room" role="listitem" style="--s:${spans[i]};--i:${i}"><span class="mm-rk">${String(i + 1).padStart(2, '0')} · ${e(r.k)}</span><b>${e(r.v)}</b></div>`).join('')}</div>
      <p class="mm-plan-c">Tổng cộng ${rooms.length} không gian, chung một mái nhà.</p></div>` : '';
    return `<div class="wrap">
      ${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="mm-chs">${(s.chapters || []).map((ch, i) => `<li class="mm-ch2"><span class="mm-code">${String(i + 1).padStart(2, '0')}</span>
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <div><span class="mm-eb">${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="mm-story-q">${e(s.quote)}</p>` : ''}
      ${plan}
    </div>`;
  });

  // ---- gallery
  EA.section('gallery', c => `<div class="wrap">${head(c, 'Khung hình', 'Khoảnh khắc của chúng mình')}
    <div class="mm-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  // ---- quote: notes on the drawing (song, inside joke, proposal) + letters
  EA.section('quote', c => {
    const { data: D, esc: e, p } = c;
    const notes = [];
    if (p.has('song.title')) notes.push({ k: 'Bài hát của chúng mình', t: p.get('song.title'), s: [p.get('song.artist', ''), p.get('song.lyric', '')].filter(Boolean).join(' · ') });
    if (p.has('insideJoke')) notes.push({ k: 'Chuyện chỉ hai đứa hiểu', t: '', s: p.get('insideJoke') });
    if (p.has('proposal')) notes.push({ k: 'Khoảnh khắc ngỏ lời', t: '', s: p.get('proposal') });
    const L = p.get('letters', {});
    const lets = [['bride', D.bride.short || D.bride.name], ['groom', D.groom.short || D.groom.name]].filter(([k]) => L[k]);
    return `<div class="wrap narrow">
      ${head(c, 'Ghi chú bản vẽ', 'Lời nhắn từ chúng mình')}
      ${D.quote ? `<blockquote class="mm-q">${e(D.quote)}</blockquote>` : ''}
      ${notes.length ? `<ol class="mm-notes">${notes.map((n, i) => `<li><span class="mm-dot">${'ABC'[i]}</span><div><span class="mm-eb">${e(n.k)}</span>${n.t ? `<h3>${e(n.t)}</h3>` : ''}<p>${e(n.s)}</p></div></li>`).join('')}</ol>` : ''}
      ${lets.length ? `<div class="mm-letters">${lets.map(([k, nm]) => `<details class="mm-letter"><summary><span class="mm-eb">Thư của</span><b>${e(nm)}</b></summary><p>${e(L[k])}</p></details>`).join('')}</div>` : ''}
      ${p.has('quote.text') ? `<p class="mm-pq">“${e(p.get('quote.text'))}”${p.has('quote.author') ? `<span>${e(p.get('quote.author'))}</span>` : ''}</p>` : ''}
    </div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một ô cửa sẽ sáng đèn mang tên bạn')}<div class="mm-rsvp">${c.ui.rsvpForm()}</div></div>`);

  // ---- thanks: the finished house with a window lit for every guest
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="mm-bye" data-guest="${e(guest)}">
      <span class="mm-eb">Lời cảm ơn</span>
      <div class="mm-model sm"><canvas class="mm-house3" aria-hidden="true"></canvas></div>
      <p class="mm-bye-line">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="mm-bye-text">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="mm-bye-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <div class="mm-facade" aria-label="Những ô cửa sáng đèn của khách mời"></div>
      <p class="mm-bye-date">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Dựng lại ngôi nhà ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  const facade = (main, list) => {
    const el = main.querySelector('.mm-facade'); if (!el) return;
    const names = list.map(x => String(x?.name || '').trim()).filter(Boolean).slice(-11);
    el.innerHTML = Array.from({ length: 12 }, (_, i) => names[i] ? `<span class="w on" style="--i:${i}"><em>${esc(names[i])}</em></span>` : `<span class="w" style="--i:${i}"></span>`).join('');
  };
  const refresh = main => { try { Promise.resolve(EA.shared.list('windows')).then(l => facade(main, l || [])).catch(() => {}); } catch { /* ignore */ } };

  EA.afterRender((c, main) => {
    const M = c.motion;
    // turnable model house in the hero (tilt + scroll + tap)
    const cv = main.querySelector('.mm-house2');
    if (cv) {
      const h = makeHouse(cv), S = h.S; S.lit = .7;
      let base = 45, tgt = 45, cur = 45, tx = 0, sp = .5;
      const fitDraw = () => { h.fit(); S.th = cur; h.draw(); };
      fitDraw(); addEventListener('resize', fitDraw);
      document.fonts?.ready.then(fitDraw);
      main.querySelector('.mm-turn')?.addEventListener('click', () => { base += 90; M.tone('click'); M.haptic('tap'); });
      cv.parentElement.addEventListener('click', ev => { if (ev.target === cv) { base += 90; M.tone('click'); M.haptic('tap'); } });
      if (M.tier !== 'low' && !c.reduced) {
        M.tilt(({ x }) => { tx = x; });
        M.scrollProgress(cv, p => { sp = p; });
        M.loop(() => {
          tgt = base + (sp - .5) * 70 + tx * 14;
          const d = tgt - cur;
          if (Math.abs(d) > .05) { cur += d * .09; S.th = cur; h.draw(); }
        }, { el: cv });
      } else { M.loop(() => { if (Math.abs(base - cur) > .05) { cur = base; S.th = cur; h.draw(); } }, { el: cv }); }
    }
    // easter egg: tap the date three times and the first drawing is stamped
    const dateBtn = main.querySelector('.mm-date'), stamp = main.querySelector('.mm-stamp');
    if (dateBtn && stamp) {
      let taps = 0, timer = 0;
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100); M.tone('click');
        if (taps >= 3) {
          taps = 0; const met = stamp.dataset.met;
          stamp.querySelector('.mm-stamp-t').textContent = met ? `Khởi công ${dmy(met)}${c.p.get('metPlace', '') ? ' · ' + c.p.get('metPlace', '') : ''}` : `Hoàn thiện ngày ${c.d}.${c.m}.${c.y}`;
          stamp.classList.add('on'); M.haptic('success'); M.tone('chime');
        }
      });
    }
    // measurement lines: dimension lines extend and numbers count up
    main.querySelectorAll('.mm-row').forEach(row => M.inView(row, () => {
      row.classList.add('on');
      const n = row.querySelector('b'), to = +row.dataset.n;
      M.tween(0, to, 2000, 'out', v => { n.textContent = fmt(v); });
    }, { threshold: .5 }));
    // floor plan: walls draw, rooms appear in turn
    const plan = main.querySelector('.mm-plan');
    if (plan) M.inView(plan.parentElement, () => { plan.classList.add('on'); M.tone('pop'); }, { threshold: .3 });
    const site = main.querySelector('.mm-site');
    if (site) M.inView(site, () => site.classList.add('on'), { threshold: .4 });
    // thanks: house with the windows lit
    const bye = main.querySelector('.mm-bye');
    if (bye) {
      const h3 = makeHouse(bye.querySelector('.mm-house3')), S = h3.S; S.lit = 0;
      const fitDraw = () => { h3.fit(); h3.draw(); }; fitDraw(); addEventListener('resize', fitDraw);
      M.inView(bye, () => { M.tween(0, 1, 1600, 'inOut', t => { S.lit = t; h3.draw(); }); }, { threshold: .4 });
      refresh(main);
    }
  });

  // finale after RSVP: a new window lights up on a small house
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    const main = document.getElementById('inv');
    if (main) refresh(main);
    if (entry && entry.attending === false) return;
    const name = String(entry?.name || '').trim() || 'Quý khách';
    try { EA.shared.add('windows', { name }); } catch { /* local only */ }
    const box = document.createElement('div');
    box.className = 'mm-final'; box.setAttribute('role', 'status');
    box.innerHTML = `<canvas aria-hidden="true"></canvas><div><span class="mm-eb">Đã nghiệm thu</span><p>Một ô cửa vừa sáng đèn mang tên <b>${esc(name)}</b></p></div>`;
    document.body.appendChild(box);
    const h = makeHouse(box.querySelector('canvas')), S = h.S; S.lit = 0; S.pulse = -1;
    requestAnimationFrame(() => box.classList.add('on'));
    h.fit(); h.draw();
    const idx = 1 + (EA.list('rsvp').length % 7);
    M.tween(0, 1, 1200, 'inOut', t => { S.lit = t * .55; h.draw(); }).then(() => {
      S.pulse = idx; M.tween(0, 1, 900, 'out', t => { S.lit = .55 + t * .45; h.draw(); });
      M.haptic('success'); M.tone('chime');
    });
    setTimeout(() => { box.classList.remove('on'); setTimeout(() => box.remove(), 700); }, 6200);
  });
})();
