// Quiet Crossing: two koi from two banks. Tap the water for ripples; call the koi and they circle into a heart.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k, ss = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const setTier = () => { html.dataset.qcTier = M.tier; };
  const pad = (n, k = 2) => String(n).padStart(k, '0');
  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }
  const heartPt = (tau, cx, cy, r) => {
    const s = r / 16, f = 13 * Math.cos(tau) - 5 * Math.cos(2 * tau) - 2 * Math.cos(3 * tau) - Math.cos(4 * tau);
    return { x: cx + 16 * Math.sin(tau) ** 3 * s, y: cy - (f + 2.5) * s };
  };

  // ---------- the pond: dark water, moon, lily pads, ripples and two koi that follow a spine ----------
  const WID = [.55, .8, .95, 1, .95, .86, .74, .6, .47, .36, .27, .19, .13, .08];
  function makePond(cv, o = {}) {
    const g = cv.getContext('2d'), N = WID.length, rip = [];
    const fish = [0, 1].map(i => ({ i, ph: (i ? .5 : 1.5) * Math.PI, pts: [], x: 0, y: 0, ang: 0, tg: null, tgT: 0, leap: -1e9 }));
    let S = { w: 0, h: 0, dpr: 1 }, ready = false, mode = 'idle', tau = 0, omega = 0, k = 0, glow = o.glow ?? .45, heartA = 0, attract = null, T = 0, lastEmit = 0, tilt = { x: 0, y: 0 }, tauT = 0, bw = 10, L = 14;
    const ripple = (x, y, big = 1, delay = 0) => rip.push({ x, y, t0: T + delay, dur: 1900 * Math.min(1.4, big), max: 70 * big });
    const pads = [[.07, .9, .075, 0], [.95, .1, .06, 1], [.9, .93, .05, 0], [.04, .14, .05, 0], [.5, .97, .04, 0]];

    function place(w, h) {
      fish.forEach(f => {
        if (o.orbit) {
          const c = o.center(w, h), t0 = Math.random() * TAU; mode = 'heart'; k = 1; tau = t0; omega = o.omega || .00045;
          f.pts = Array.from({ length: N }, (_, j) => heartPt(tau + f.ph - j * .11, c.x, c.y, c.r));
          f.x = f.pts[0].x; f.y = f.pts[0].y; f.ang = 0;
        } else {
          f.x = f.i ? w * 1.04 : -w * .04; f.y = h * (f.i ? .7 : .3); f.ang = f.i ? Math.PI : 0;
          f.pts = Array.from({ length: N }, (_, j) => ({ x: f.x - Math.cos(f.ang) * L * j, y: f.y - Math.sin(f.ang) * L * j }));
        }
      });
    }
    const smooth = p => { // closed smooth path through points
      g.moveTo((p[0].x + p[p.length - 1].x) / 2, (p[0].y + p[p.length - 1].y) / 2);
      for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; g.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    };
    function sides(f, sc, off) {
      const left = [], right = [], mid = [];
      for (let j = 0; j < N; j++) {
        const a = f.pts[Math.max(0, j - 1)], b = f.pts[Math.min(N - 1, j + 1)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / d, ny = (b.x - a.x) / d;
        const sway = Math.sin(T * .0058 - j * .55) * bw * .38 * (j / N) ** 1.2, w = bw * WID[j] * sc;
        const mx = f.pts[j].x + nx * sway + off[0], my = f.pts[j].y + ny * sway + off[1];
        mid.push({ x: mx, y: my, nx, ny, w }); left.push({ x: mx + nx * w, y: my + ny * w }); right.push({ x: mx - nx * w, y: my - ny * w });
      }
      return { mid, outline: left.concat(right.reverse()) };
    }
    function drawFish(f, shadow) {
      const lp = clamp((T - f.leap) / 1000), up = Math.sin(lp * Math.PI), sc = 1 + .6 * up, off = shadow ? [5 + 22 * up, 9 + 30 * up] : [0, -10 * up];
      const { mid, outline } = sides(f, sc, off), t = mid[N - 1], p = mid[N - 2];
      const dx = t.x - p.x, dy = t.y - p.y, dd = Math.hypot(dx, dy) || 1, ux = dx / dd, uy = dy / dd, nx = -uy, ny = ux;
      const sw = Math.sin(T * .0058 - N * .55) * bw * 1.1 * sc, tl = L * 2.3 * sc;
      const tail = () => {
        g.beginPath(); g.moveTo(t.x, t.y);
        g.quadraticCurveTo(t.x + ux * tl * .5 + nx * bw * 1.6 * sc, t.y + uy * tl * .5 + ny * bw * 1.6 * sc, t.x + ux * tl + nx * (bw * 1.3 * sc + sw), t.y + uy * tl + ny * (bw * 1.3 * sc + sw));
        g.quadraticCurveTo(t.x + ux * tl * .62 + nx * sw * .7, t.y + uy * tl * .62 + ny * sw * .7, t.x + ux * tl - nx * (bw * 1.3 * sc - sw), t.y + uy * tl - ny * (bw * 1.3 * sc - sw));
        g.quadraticCurveTo(t.x + ux * tl * .5 - nx * bw * 1.6 * sc, t.y + uy * tl * .5 - ny * bw * 1.6 * sc, t.x, t.y); g.closePath();
      };
      const fins = col => { [1, -1].forEach(s => { const m = mid[2], wv = Math.sin(T * .005 + s) * .25; g.save(); g.translate(m.x + m.nx * s * m.w * .9, m.y + m.ny * s * m.w * .9); g.rotate(Math.atan2(mid[3].y - mid[1].y, mid[3].x - mid[1].x) + s * (1 + wv)); g.fillStyle = col; g.beginPath(); g.ellipse(bw * .9 * sc, 0, bw * 1.3 * sc, bw * .38 * sc, 0, 0, TAU); g.fill(); g.restore(); }); };
      if (shadow) { g.fillStyle = 'rgba(0,10,14,.3)'; tail(); g.fill(); g.beginPath(); smooth(outline); g.fill(); return; }
      const A = f.i === 0, base = A ? '#f6f0e4' : '#ee8a3a', patch = A ? '#d8402a' : '#f7d9a0', fin = A ? 'rgba(246,240,228,.55)' : 'rgba(238,138,58,.55)';
      fins(fin); g.fillStyle = fin; tail(); g.fill();
      g.save(); g.beginPath(); smooth(outline); g.fillStyle = base; g.fill(); g.clip();
      g.fillStyle = patch;
      (A ? [[1, 4], [6, 9]] : [[3, 6], [9, 11]]).forEach(([a, b]) => { for (let j = a; j <= b; j += .5) { const m = mid[Math.floor(j)]; g.beginPath(); g.arc(m.x + m.nx * Math.sin(j * 2.1) * m.w * .5, m.y + m.ny * Math.sin(j * 2.1) * m.w * .5, m.w * 1.05, 0, TAU); g.fill(); } });
      if (A) { g.fillStyle = '#23201f'; const m = mid[5]; g.beginPath(); g.arc(m.x + m.nx * m.w * .2, m.y + m.ny * m.w * .2, bw * .3, 0, TAU); g.fill(); }
      const sh = g.createLinearGradient(mid[0].x, mid[0].y, t.x, t.y); sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = sh; g.fillRect(0, 0, S.w, S.h);
      g.restore();
      g.fillStyle = '#121212'; [1, -1].forEach(s => { const m = mid[0]; g.beginPath(); g.arc(m.x + m.nx * s * m.w * .62 + ux * 0, m.y + m.ny * s * m.w * .62, bw * .12 + .6, 0, TAU); g.fill(); });
    }

    function frame(t, dt) {
      const sz = fit(cv, 1.5); if (!sz.w) return; S = sz; const { w, h } = S; T = t;
      g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
      const unit = Math.min(w, h), c = o.center ? o.center(w, h) : { x: w / 2, y: h * .46, r: Math.min(w * .4, h * .27, 220) };
      bw = clamp(unit * .026, 8, 15); L = bw * 1.5;
      const rects = o.avoid ? o.avoid(w, h) : [], inR = (x, y) => rects.find(r => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1);
      if (!ready) { ready = true; place(w, h); }
      // water
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0d2d3a'); bg.addColorStop(.55, '#0a2230'); bg.addColorStop(1, '#06151f'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const mx = w * .8 - tilt.x * 14, my = h * .15 - tilt.y * 8, ga = .16 + .3 * glow, mr = unit * (.9 + .4 * glow);
      const mg = g.createRadialGradient(mx, my, 0, mx, my, mr); mg.addColorStop(0, `rgba(255,243,210,${ga})`); mg.addColorStop(1, 'rgba(255,243,210,0)'); g.fillStyle = mg; g.fillRect(0, 0, w, h);
      g.fillStyle = `rgba(255,248,228,${.55 + .4 * glow})`; g.beginPath(); g.arc(mx, my, unit * .055, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(190,225,230,.05)'; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { g.beginPath(); for (let x = 0; x <= w; x += 20) { const y = h * (.1 + i * .16) + Math.sin(x * .016 + T * .0005 + i) * 5; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      pads.forEach(([px, py, pr, bud], i) => { const r = pr * unit * 1.6, x = px * w, y = py * h + Math.sin(T * .0006 + i) * 1.5; g.fillStyle = '#1b4a3c'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, .3 + i, TAU - .25 + i); g.closePath(); g.fill(); g.strokeStyle = 'rgba(160,210,180,.2)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(i + 2) * r * .8, y + Math.sin(i + 2) * r * .8); g.stroke();
        if (bud) { g.fillStyle = '#f2a9bd'; for (let a = 0; a < 6; a++) { g.beginPath(); g.ellipse(x - r * .1 + Math.cos(a) * r * .22, y + Math.sin(a) * r * .22, r * .2, r * .09, a, 0, TAU); g.fill(); } } });
      // fish logic
      if (mode === 'heart') { tau += omega * dt; }
      fish.forEach(f => {
        const chase = mode === 'heart' && k < 1;
        let tx, ty, v, om;
        if (mode === 'heart') { const ti = tau + f.ph; const tp = heartPt(ti + (k < 1 ? .35 : 0), c.x, c.y, c.r); tx = tp.x; ty = tp.y; v = unit * .00085; om = .0065;
          const lim = Math.min(c.r * 1.15, w / 2 - bw * 3); if (k < 1 && Math.abs(f.x - c.x) < lim) { tx = c.x + (tp.x >= c.x ? 1 : -1) * (lim + 30); ty = f.y; } }
        else {
          if (attract && T < attract.until) { tx = attract.x; ty = attract.y; }
          else { if (!f.tg || Math.hypot(f.tg.x - f.x, f.tg.y - f.y) < 40 || T > f.tgT) { for (let n = 0; n < 12; n++) { f.tg = { x: R(f.i ? .45 : .04, f.i ? .96 : .55) * w, y: R(.1, .9) * h }; if (!inR(f.tg.x, f.tg.y)) break; } f.tgT = T + R(3500, 7000); } tx = f.tg.x; ty = f.tg.y; }
          v = attract && T < attract.until ? .09 : .05; om = .0024;
        }
        let want = Math.atan2(ty - f.y, tx - f.x);
        if (rects.length && (mode !== 'heart' || k < .7)) { const ax = f.x + Math.cos(f.ang) * unit * .2, ay = f.y + Math.sin(f.ang) * unit * .2, hit = inR(ax, ay) || inR(f.x, f.y); if (hit) { const cx2 = (hit.x0 + hit.x1) / 2, cy2 = (hit.y0 + hit.y1) / 2; want = Math.atan2(f.y - cy2, f.x - cx2) + (f.i ? .5 : -.5); om *= 3; f.tg = null; } }
        let d = ((want - f.ang + 3 * Math.PI) % TAU) - Math.PI; f.ang += clamp(d, -om * dt, om * dt);
        const ox = f.x, oy = f.y; f.x += Math.cos(f.ang) * v * dt; f.y += Math.sin(f.ang) * v * dt;
        if (mode === 'heart' && k > 0) { const pp = heartPt(tau + f.ph, c.x, c.y, c.r); f.x = lerp(f.x, pp.x, k); f.y = lerp(f.y, pp.y, k); if (dt && Math.hypot(f.x - ox, f.y - oy) > .01) f.ang = Math.atan2(f.y - oy, f.x - ox); }
        f.pts[0] = { x: f.x, y: f.y };
        for (let j = 1; j < N; j++) { const a = f.pts[j - 1], b = f.pts[j]; let dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1; f.pts[j] = { x: a.x + dx / dd * L, y: a.y + dy / dd * L }; }
      });
      if (mode === 'heart' && k > .5 && T - lastEmit > 420 && o.emit !== false) { lastEmit = T; fish.forEach(f => ripple(f.x, f.y, .35)); }
      // heart outline glow
      if (heartA > .01) {
        g.save(); g.strokeStyle = `rgba(255,214,150,${heartA * .55})`; g.lineWidth = 2; g.shadowColor = 'rgba(255,190,110,.9)'; g.shadowBlur = 14; g.beginPath();
        for (let a = 0; a <= TAU + .05; a += .06) { const p = heartPt(a, c.x, c.y, c.r * 1.02); a ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); } g.stroke(); g.restore();
      }
      // ripples
      for (let i = rip.length - 1; i >= 0; i--) {
        const r = rip[i], a = (T - r.t0) / r.dur; if (a < 0) continue; if (a >= 1) { rip.splice(i, 1); continue; }
        const e = 1 - (1 - a) ** 3;
        for (let q = 0; q < 3; q++) { const rr = r.max * e - q * 9 * (r.max / 70); if (rr <= 0) continue; g.strokeStyle = `rgba(214,238,240,${(1 - a) ** 1.4 * (.5 - q * .14)})`; g.lineWidth = 1.4 - q * .3; g.beginPath(); g.arc(r.x, r.y, rr, 0, TAU); g.stroke(); }
      }
      fish.forEach(f => drawFish(f, true)); fish.forEach(f => drawFish(f, false));
    }
    return {
      frame, ripple, fish, get S() { return S; },
      tilt(v) { tilt = v; },
      attract(x, y) { attract = { x, y, until: T + 2600 }; },
      glow(v) { glow = v; }, heartGlow(v) { heartA = v; },
      call() { mode = 'heart'; tau = 0; omega = 0; k = 0; const sw = fish[0].x > fish[1].x; fish[0].ph = (sw ? .5 : 1.5) * Math.PI; fish[1].ph = (sw ? 1.5 : .5) * Math.PI; },
      swim(on, om) { omega = on ? om : 0; },
      blend(v) { k = v; },
      orbit(om) { omega = om; },
      hit(x, y) { return fish.findIndex(f => f.pts.some(p => Math.hypot(p.x - x, p.y - y) < bw * 2.6)); },
      leap(i) { fish[i].leap = T; ripple(fish[i].x, fish[i].y, 1.6); },
      burst(x, y) { for (let i = 0; i < 4; i++) ripple(x, y, 1.1 + i * .55, i * 170); }
    };
  }
  // run a pond on a canvas; returns the pond + stop
  function runPond(cv, o) {
    const pond = makePond(cv, o); let stop = () => { };
    if (M.reduced) { pond.frame(0, 16); pond.frame(16, 16); } else stop = M.loop((t, dt) => pond.frame(t, dt), { el: cv });
    const off = M.tilt(v => pond.tilt(v));
    const toXY = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    return { pond, toXY, stop() { stop(); off(); } };
  }

  // ---------- small art ----------
  const koiSVG = (a, b, cls = '') => `<svg class="qc-koi ${cls}" viewBox="0 0 120 48" aria-hidden="true"><path d="M10 24C32 5 70 6 98 21L114 8l-4 16 4 16-16-13C70 42 32 43 10 24z" fill="${a}"/><circle cx="48" cy="19" r="9" fill="${b}"/><circle cx="68" cy="27" r="7" fill="${b}"/><circle cx="22" cy="21" r="2" fill="#151515"/><circle cx="22" cy="28" r="2" fill="#151515"/></svg>`;
  const SEAL = `<svg class="qc-seal" viewBox="0 0 64 64" aria-hidden="true"><rect x="3" y="3" width="58" height="58" rx="6" fill="#b2392f"/><g fill="none" stroke="#f6e9d8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 40C22 20 34 16 46 22M46 22c-4-8-10-10-16-8M46 22l6-8M14 40c6 8 18 10 30 2M44 42l7 6M44 42l7-4"/></g><circle cx="22" cy="31" r="2.600" fill="#f6e9d8"/></svg>`;
  const LOTUS = `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="36" rx="20" ry="8" fill="#1d4a3c"/><g class="pet" fill="#f4b6c6" stroke="#fbe3ea" stroke-width=".8"><path d="M24 34C14 30 10 20 14 12c6 3 9 11 10 22z"/><path d="M24 34c10-4 14-14 10-22-6 3-9 11-10 22z"/><path d="M24 34C19 27 19 17 24 8c5 9 5 19 0 26z" fill="#f9cdd8"/></g><circle cx="24" cy="30" r="3" fill="#f2c96b"/></svg>`;

  // ---------- page ripples: water answers every finger on the paper ----------
  let ripCv = null;
  function pageRipples() {
    if (ripCv || M.reduced) return;
    ripCv = Object.assign(document.createElement('canvas'), { className: 'qc-rip' }); ripCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(ripCv);
    const g = ripCv.getContext('2d'), list = []; let lx = -99, ly = -99, down = false, was = false;
    const add = (x, y, big) => { if (list.length < 14) list.push({ x, y, t0: performance.now(), max: big ? 80 : 46, dur: big ? 1700 : 1200 }); };
    addEventListener('pointerdown', ev => { if (ev.target.closest('.cover') || ev.target.closest('canvas.qc-pond')) return; down = true; lx = ev.clientX; ly = ev.clientY; add(lx, ly, true); M.tone('pop'); }, { passive: true });
    addEventListener('pointermove', ev => { if (!down && ev.pointerType !== 'mouse') return; if (Math.hypot(ev.clientX - lx, ev.clientY - ly) > 52) { lx = ev.clientX; ly = ev.clientY; add(lx, ly, false); } }, { passive: true });
    addEventListener('pointerup', () => { down = false; }, { passive: true });
    M.loop(() => {
      if (!list.length) { if (was) { g.clearRect(0, 0, ripCv.width, ripCv.height); was = false; } return; }
      was = true; const dpr = Math.min(1.5, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
      if (ripCv.width !== Math.round(w * dpr)) { ripCv.width = Math.round(w * dpr); ripCv.height = Math.round(h * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); const now = performance.now();
      for (let i = list.length - 1; i >= 0; i--) {
        const r = list[i], a = (now - r.t0) / r.dur; if (a >= 1) { list.splice(i, 1); continue; }
        const e = 1 - (1 - a) ** 3; for (let q = 0; q < 2; q++) { const rr = r.max * e - q * 8; if (rr > 0) { g.strokeStyle = `rgba(80,140,155,${(1 - a) * (.55 - q * .2)})`; g.lineWidth = 1.5 - q * .4; g.beginPath(); g.arc(r.x, r.y, rr, 0, TAU); g.stroke(); } }
      }
    });
    ripCv.addRipple = add;
  }

  // heart layout: the heart must enclose the names (+24px); other text is pushed above/below the heart's tips
  function heartLayout(cv, names, wrap, scale = 1) {
    let last = '';
    return (w, h) => {
      const rg = document.createRange(); rg.selectNodeContents(names);
      const nr = rg.getBoundingClientRect(), b = cv.getBoundingClientRect(), hw = nr.width / 2, hh = nr.height / 2;
      const r = Math.min(Math.max(.58 * (hw + 40) + 1.19 * (hh + 40), Math.min(w * .44, h * .3, 230) * scale), w * .47), key = Math.round(r) + ',' + Math.round(hh);
      if (key !== last) { last = key; wrap.style.paddingTop = Math.max(0, .594 * r - hh + 26) + 'px'; wrap.style.paddingBottom = Math.max(0, 1.22 * r - hh + 30) + 'px'; }
      return { x: nr.left - b.left + nr.width / 2, y: nr.top - b.top + hh + 5 * r / 16, r };
    };
  }
  const textRects = (cv, els, pad = 24) => () => { const b = cv.getBoundingClientRect(); return els.map(el => { const rg = document.createRange(); rg.selectNodeContents(el); const r = rg.getBoundingClientRect(); return { x0: r.left - b.left - pad, x1: r.right - b.left + pad, y0: r.top - b.top - pad, y1: r.bottom - b.top + pad }; }); };

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c; setTier();
    const nm = s => e(s.replace(/ /g, ' '));
    el.innerHTML = `<div class="qc-stage"><canvas class="qc-pond" aria-hidden="true"></canvas>
      <div class="qc-txt"><p class="qc-to">Gửi ${e(c.guest)}</p>
        <div class="qc-nm"><h1 class="qc-names"><span class="n">${nm(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${nm(D.groom.name)}</span></h1></div>
        <p class="qc-date">${c.d} · ${c.m} · ${c.y}</p></div>
      <div class="qc-ui"><p class="qc-hint">Chạm mặt nước để gợn sóng</p><button class="open-btn" type="button">Gọi đôi cá về</button></div>
      <p class="qc-egg" role="status"></p></div>`;
    const q = s => el.querySelector(s), cv = q('.qc-pond'), stage = q('.qc-stage'), names = q('.qc-names'), egg = q('.qc-egg');
    const center = heartLayout(cv, names, q('.qc-nm')), avoid = textRects(cv, [q('.qc-to'), names, q('.qc-date')]);
    const { pond, toXY, stop } = runPond(cv, { center, avoid, glow: .35 });
    let go = false, music = false, hits = 0, hitT = 0, eggT = 0;
    const sound = () => { if (!music) { music = true; EA.music(); M.requestTilt(); } };
    cv.addEventListener('pointerdown', ev => {
      if (go) return; sound(); const [x, y] = toXY(ev); pond.ripple(x, y, 1); pond.ripple(x, y, .6, 160); pond.attract(x, y); M.tone('pop'); M.haptic('tap');
      const i = pond.hit(x, y);
      if (i >= 0) { const now = performance.now(); hits = now - hitT < 3000 ? hits + 1 : 1; hitT = now; if (hits >= 3) { hits = 0; pond.leap(i); egg.textContent = c.p.get('insideJoke', 'Cá chép vượt Vũ Môn, hóa rồng!'); egg.classList.add('on'); M.haptic('success'); M.tone('chime'); clearTimeout(eggT); eggT = setTimeout(() => egg.classList.remove('on'), 4200); } }
    });
    let lx = -99, ly = -99;
    cv.addEventListener('pointermove', ev => { if (go || !(ev.buttons || ev.pointerType === 'touch')) return; const [x, y] = toXY(ev); if (Math.hypot(x - lx, y - ly) > 46) { lx = x; ly = y; pond.ripple(x, y, .55); pond.attract(x, y); } });

    const wow = async () => {
      if (go) return; go = true; sound(); stage.classList.add('calling'); M.haptic('tap'); M.tone('whoosh');
      if (c.reduced) { pond.call(); pond.blend(1); open(); return; }
      pond.call(); pond.glow(.35);
      M.tween(.35, 1, 2600, 'inOut', v => pond.glow(v));
      c.after(850, () => { pond.swim(true, TAU / 2300); M.tween(0, 1, 650, 'inOut', v => pond.blend(v)); });
      c.after(1500, () => { pond.heartGlow(0); M.tween(0, 1, 1100, 'out', v => pond.heartGlow(v)); stage.classList.add('lit'); });
      c.after(2350, () => { const ctr = center(cv.clientWidth, cv.clientHeight); pond.burst(ctr.x, ctr.y); M.tone('chime'); M.haptic('success'); });
      c.after(3150, () => { el.classList.add('qc-lift'); open(); setTier(); html.classList.add('qc-open'); c.after(900, stop); });
    };
    q('.open-btn').addEventListener('click', wow, { once: true });
  });

  // ---------- sections ----------
  const head = (eb, t, sub) => `<header class="head"><p class="eyebrow">${eb}</p><h2 class="title">${t}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const nbsp = s => s.replace(/ /g, ' ');
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, past = new Date(`${D.date}T23:59:00+07:00`) < Date.now();
    return `<div class="qc-hero"><canvas class="qc-pond" aria-hidden="true"></canvas>
      <div class="qc-hero-in"><p class="eyebrow">Hai bờ, một nhà</p>
        <div class="qc-nm"><h1 class="qc-names"><span class="n">${e(nbsp(D.bride.name))}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(nbsp(D.groom.name))}</span></h1></div>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="qc-date">${c.d} · ${c.m} · ${c.y}</p><p class="hero-date">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="qc-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}</div></div>`;
  });

  EA.section('story', ({ esc: e, mod, ui }) => {
    const chs = mod.content.chapters || []; if (!chs.length) return '';
    return `<div class="wrap">${ui.head('Dòng chảy của chúng mình', 'Chuyện của chúng mình')}
      <div class="qc-river"><i class="qc-swimmer">${koiSVG('#f6f0e4', '#d8402a')}</i>
      ${chs.map((ch, i) => `<article class="qc-ch ${i % 2 ? 'r' : 'l'}"><div class="ph">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div><div class="tx"><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></article>`).join('')}</div>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}</div>`;
  });

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="qc-thx"><canvas class="qc-pond" aria-hidden="true"></canvas>
    <div class="wrap narrow qc-thx-in"><p class="eyebrow">Lời cảm ơn</p><div class="qc-nm"><p class="mono qc-names">${e(D.monogram)}</p></div><p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <div class="qc-sealrow">${SEAL}<p>Cá chép vượt Vũ Môn<small>Vượt bao sóng gió để về chung một bờ</small></p></div>
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Về lại hồ cá ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div></div></div>`);

  function addSection(main, id, html_, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec qc-add m-${id}`; s.innerHTML = html_;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const ponds = {};
  let lotusApi = null;

  EA.afterRender((c, main) => {
    const { p, esc: e, data: D } = c, cov = document.getElementById('cover');
    setTier(); setTimeout(() => { if (cov.hidden) html.classList.add('qc-open'); }, 80); pageRipples();

    // ponds in the hero and the thanks: the koi keep circling their heart
    const mount = (sel, key, om) => {
      const cv = main.querySelector(`${sel} .qc-pond`); if (!cv) return;
      const nm = main.querySelector(`${sel} .qc-names`);
      const center = heartLayout(cv, nm, nm.closest('.qc-nm'), key === 'thx' ? .8 : 1);
      const rp = runPond(cv, { center, orbit: true, omega: om, glow: .6 }); ponds[key] = rp;
      cv.addEventListener('pointerdown', ev => { const [x, y] = rp.toXY(ev); rp.pond.ripple(x, y, 1); rp.pond.ripple(x, y, .6, 160); M.tone('pop'); M.haptic('tap'); const i = rp.pond.hit(x, y); if (i >= 0) rp.pond.leap(i); });
      rp.pond.heartGlow(.35);
    };
    mount('.qc-hero', 'hero', .00045); mount('.qc-thx', 'thx', .0003);

    // swimmer follows the story river as you scroll
    const river = main.querySelector('.qc-river'), sw = river?.querySelector('.qc-swimmer');
    if (river && sw) M.scrollProgress(river, pr => { sw.style.top = (clamp((pr - .12) / .76) * 100).toFixed(1) + '%'; });

    // Hai bờ: both hometowns and the distance between
    const ht = p.raw.hometowns || {};
    if (ht.bride || ht.groom) {
      const pins = p.raw.hometownPins || {}, km = pins.bride && pins.groom ? Math.round(p.kmBetween(pins.bride, pins.groom)) : null;
      const sec = addSection(main, 'bank', `<div class="wrap narrow">${head('Hai bờ', 'Từ hai miền về một nhà')}
        <div class="qc-banks"><div class="bk l"><b>${e(ht.bride || '')}</b><span>Quê cô dâu</span></div>
        <div class="rv"><i class="ka">${koiSVG('#f6f0e4', '#d8402a')}</i><i class="kb">${koiSVG('#ee8a3a', '#f7d9a0')}</i><svg class="hrt" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor"/></svg></div>
        <div class="bk r"><b>${e(ht.groom || '')}</b><span>Quê chú rể</span></div></div>
        ${km ? `<p class="qc-km"><span data-n="${km}">0</span> km</p><p class="sub">Hai bờ cách nhau ${km.toLocaleString('vi-VN')} km đường chim bay, nay chung một nhà${p.has('metCity') ? ` ở ${e(p.get('metCity'))}` : ''}.</p>` : `<p class="sub">Hai miền quê, nay chung một nhà.</p>`}</div>`, ['.m-story', '.m-events']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => { sec.classList.add('meet'); if (num) M.tween(0, km, 2200, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .45 });
    }

    // Đá lót: places as lily-pad stepping stones
    const places = Array.isArray(p.raw.places) ? p.raw.places : [];
    if (places.length) {
      const sec = addSection(main, 'stones', `<div class="wrap narrow">${head('Đá lót qua ao', 'Những bước chân chúng mình đã đi', 'Chạm vào từng lá sen')}
        <ol class="qc-stones">${places.map((pl, i) => `<li class="${i % 2 ? 'r' : 'l'}"><button type="button" class="pad" aria-label="${e(pl.name)}">${pad(i + 1)}</button><div><b>${e(pl.name)}</b><span>${e(pl.date || '')}</span></div></li>`).join('')}</ol></div>`, ['.m-bank', '.m-story', '.m-events']);
      sec.querySelectorAll('.pad').forEach(b => b.addEventListener('click', () => { b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); M.tone('pop'); M.haptic('tap'); const r = b.getBoundingClientRect(); ripCv?.addRipple(r.left + r.width / 2, r.top + r.height / 2, true); }));
    }

    // two koi, two personalities
    const tr = p.raw.traits || {};
    if (tr.bride || tr.groom) {
      const card = (who, a, b2) => { const t = tr[who]; if (!t) return ''; const nm = who === 'bride' ? D.bride : D.groom, night = t.rhythm === 'night';
        const rows = [['Giờ bơi', night ? 'Về đêm, dưới trăng' : t.rhythm === 'morning' ? 'Buổi sáng, trong sương' : ''], ['Đồ uống', t.drink], ['Sở thích', t.hobby]].filter(r => r[1]);
        return `<article class="qc-koicard ${night ? 'night' : ''}">${koiSVG(a, b2)}<h3>${e(nm.short)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3><dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${e(r[1])}</dd>`).join('')}</dl></article>`; };
      addSection(main, 'koi', `<div class="wrap">${head('Hai chú cá', 'Mỗi người một dáng bơi')}<div class="qc-koicards">${card('bride', '#f6f0e4', '#d8402a')}${card('groom', '#ee8a3a', '#f7d9a0')}</div></div>`, ['.m-stones', '.m-bank', '.m-story']);
    }

    // Ao sen: each guestbook wish becomes a lotus
    const gb = main.querySelector('.m-guestbook');
    if (gb) {
      const samples = c.mods.guestbook?.content?.samples || [], all = () => [...samples, ...EA.list('guestbook')];
      const sec = addSection(main, 'lotus', `<div class="wrap narrow">${head('Ao sen lời chúc', 'Mỗi lời chúc nở thành một đóa sen', 'Chạm vào đóa sen để đọc lời chúc')}
        <div class="qc-pondbox"><div class="lts"></div></div><div class="qc-wish" aria-live="polite"><p class="msg">Chọn một đóa sen nhé.</p></div></div>`, ['.m-guestbook']);
      gb.after(sec);
      const lts = sec.querySelector('.lts'), msg = sec.querySelector('.qc-wish');
      const addLotus = (w, i, fresh) => {
        const a = i * 2.399 + .6, rr = Math.sqrt(i + .8) * 13, x = clamp(50 + Math.cos(a) * rr * 1.7, 9, 91), y = clamp(50 + Math.sin(a) * rr * .85, 14, 84);
        const b = document.createElement('button'); b.type = 'button'; b.className = 'lt' + (fresh ? ' fresh' : ''); b.style.cssText = `left:${x}%;top:${y}%;--d:${(i * 90) % 900}ms`; b.setAttribute('aria-label', `Lời chúc của ${w.name}`); b.innerHTML = LOTUS;
        b.addEventListener('click', () => { show(w); M.tone('pop'); M.haptic('tap'); const r = b.getBoundingClientRect(); ripCv?.addRipple(r.left + r.width / 2, r.top + r.height / 2, true); });
        lts.appendChild(b); return b;
      };
      const show = w => { msg.innerHTML = `<p class="msg">${e(w.message)}</p><p class="by">— ${e(w.name)}</p>`; };
      all().forEach((w, i) => addLotus(w, i, false));
      lotusApi = { add(w) { const b = addLotus(w, lts.children.length, true); show(w); M.tone('chime'); b.scrollIntoView({ block: 'nearest' }); } };
      M.inView(sec, () => sec.classList.add('bloom'), { threshold: .3 });
    }
  });

  EA.onGuestbook(entry => { lotusApi?.add(entry); });

  // finale: the koi leap, ripples run across the page, the lotuses glow
  EA.onRsvp(() => {
    html.classList.add('qc-finale'); M.haptic('success'); M.tone('chime');
    const th = document.getElementById('thanks');
    setTimeout(() => th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 600);
    setTimeout(() => { const t = ponds.thx; if (!t) return; const cv = th.querySelector('.qc-pond'), r = cv.clientWidth; t.pond.leap(0); setTimeout(() => t.pond.leap(1), 350); t.pond.burst(r / 2, cv.clientHeight / 2); t.pond.heartGlow(1); t.pond.glow(1); M.haptic('crack'); }, 1500);
    if (ripCv) for (let i = 0; i < 5; i++) setTimeout(() => ripCv.addRipple(R(.1, .9) * innerWidth, R(.2, .8) * innerHeight, true), 200 + i * 260);
  });
})();
