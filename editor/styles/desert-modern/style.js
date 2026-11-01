// Desert Modern: the golden hour.
// Cover: a dune sky and a sun on a dotted arc. The guest drags the sun to the exact ceremony time (the clock runs, the sky and dune shadows
// follow); it locks, wind blows sand from the right and the grains settle into the couple's names. All art is CSS / inline SVG / canvas.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
  const pad = n => String(n).padStart(2, '0');
  const hm = h => { const m = Math.round(h * 60); return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60); };
  const hasPhoto = h => h && !/picsum\.photos/.test(h);
  const firstW = s => String(s || '').trim().split(/\s+/).pop() || '';
  const MQ = () => window.EAMotion;

  // ---------- sun maths (NOAA fractional-year approximation), tz = Vietnam ----------
  function sunCalc(y, m, d, lat, lng, tz = 7) {
    const R = Math.PI / 180, N = Math.round((Date.UTC(+y, +m - 1, +d) - Date.UTC(+y, 0, 1)) / 864e5) + 1, g = 2 * Math.PI / 365 * (N - 1);
    const eqt = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
    const dec = .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g);
    const elev = h => { const ha = ((h * 60 + eqt + 4 * lng - 60 * tz) / 4 - 180) * R; return Math.asin(Math.sin(lat * R) * Math.sin(dec) + Math.cos(lat * R) * Math.cos(dec) * Math.cos(ha)) / R; };
    const noon = (720 - 4 * lng - eqt + 60 * tz) / 60;
    const cross = (deg, rise) => { const k = (Math.sin(deg * R) - Math.sin(lat * R) * Math.sin(dec)) / (Math.cos(lat * R) * Math.cos(dec)); if (k > 1 || k < -1) return null; return noon + (rise ? -1 : 1) * Math.acos(k) / R / 15; };
    return { elev, noon, sunrise: cross(-.833, true) ?? 6, sunset: cross(-.833, false) ?? 18, goldenStart: cross(6, false), goldenAM: cross(6, true) };
  }
  const HCM = { lat: 10.78, lng: 106.7 };
  const ceremony = c => {
    const evs = c.data.events || [];
    return evs.find(e => /thành hôn|hôn lễ|lễ cưới|ceremony|wedding/i.test(e.title || '')) || evs[0] || { time: '10:00', title: 'Lễ cưới' };
  };
  const okPin = p => p && isFinite(p.lat) && isFinite(p.lng);
  const venueOf = (c, ev) => {
    const P = c.p, mc = c.mods.events?.content || {};
    for (const p of [ev, mc, P.get('venuePin'), P.get('metPin'), (P.get('places', []) || [])[0], P.get('hometownPins.groom')]) if (okPin(p)) return { lat: +p.lat, lng: +p.lng };
    return HCM;
  };
  const model = c => {
    if (c._dm) return c._dm;
    const ev = ceremony(c), V = venueOf(c, ev), S = sunCalc(c.y, c.m, c.d, V.lat, V.lng), [th, tm] = String(ev.time).split(':');
    return (c._dm = { ev, V, S, target: (+th || 10) + (+tm || 0) / 60 });
  };

  // ---------- sky + dunes ----------
  const SKY = [[-12, '#16152b', '#2a2147', '#4a3558'], [-4, '#2d2a5a', '#7a4a78', '#e2806f'], [1, '#5a6aa6', '#e59a86', '#f8b765'],
    [7, '#79a6d2', '#f3c99a', '#fbdcae'], [25, '#4f9fd6', '#8ec6e6', '#d3e9ef'], [90, '#3b8fd1', '#7dbbe3', '#cbe5f1']];
  const skyAt = e => { let i = 0; while (i < SKY.length - 2 && e > SKY[i + 1][0]) i++; const a = SKY[i], b = SKY[i + 1], t = clamp((e - a[0]) / (b[0] - a[0])); return [1, 2, 3].map(k => mix(a[k], b[k], t)); };
  const DUNE = [['#ecc08f', '#d3a077'], ['#d98f5f', '#b9704a'], ['#a9532f', '#85391f'], ['#6e3420', '#4f2417']];
  const LAY = [{ b: 96, a: 50, f: .0052, p: .4 }, { b: 156, a: 64, f: .0068, p: 2.1 }, { b: 216, a: 72, f: .0058, p: 4.2 }, { b: 276, a: 62, f: .0082, p: 1.3 }];
  const W0 = 1400, H0 = 320;
  const layer = (L, i) => {
    const ys = x => L.b - L.a * Math.pow(Math.abs(Math.sin(x * L.f + L.p)), .8) * (.62 + .38 * Math.sin(x * L.f * .41 + L.p * 1.7));
    let body = 'M';
    for (let x = -60; x <= W0 + 60; x += 12) body += `${x} ${ys(x).toFixed(1)}L`;
    body += `${W0 + 60} ${H0}L-60 ${H0}Z`;
    const sh = dir => {
      let d = '';
      for (let k = -2; k < Math.ceil((W0 * L.f + L.p) / Math.PI) + 2; k++) {
        const xc = ((k + .5) * Math.PI - L.p) / L.f, xv = ((dir > 0 ? k + 1 : k) * Math.PI - L.p) / L.f;
        if (Math.max(xc, xv) < -60 || Math.min(xc, xv) > W0 + 60) continue;
        d += `M${xc.toFixed(0)} ${ys(xc).toFixed(1)}`;
        for (let j = 1; j <= 8; j++) { const x = xc + (xv - xc) * j / 8; d += `L${x.toFixed(0)} ${ys(x).toFixed(1)}`; }
        d += `L${xv.toFixed(0)} ${H0}L${(xc - dir * Math.abs(xv - xc) * .5).toFixed(0)} ${H0}Z`;
      }
      return d;
    };
    return `<g class="dl" style="--c:var(--d${i});--s:var(--s${i});--k:${[-10, 4, 16, 30][i - 1]}"><path class="b" d="${body}"/><path class="sr" d="${sh(1)}"/><path class="sl" d="${sh(-1)}"/></g>`;
  };
  const DUNES = n => `<svg class="dm-dn" viewBox="0 0 ${W0} ${H0}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${LAY.slice(4 - n).map((L, i) => layer(L, i + 5 - n)).join('')}</svg>`;

  // ---------- sand: grains fly in on the wind and settle onto target points ----------
  const sampleText = (W, H, lines, step) => {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.textAlign = 'center'; g.fillStyle = '#000';
    lines.forEach(l => { g.font = l.font; g.fillText(l.text, l.x, l.y); });
    const d = g.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 120) pts.push([x + (Math.random() - .5) * step * .6, y + (Math.random() - .5) * step * .6]);
    return pts;
  };
  const lineFrom = (n, r0) => {
    const r = n.getBoundingClientRect(), cs = getComputedStyle(n), font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const cx = document.createElement('canvas').getContext('2d'); cx.font = font; const m = cx.measureText(n.textContent);
    const A = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * .9, Dd = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * .25;
    return { text: n.textContent, font, x: r.left - r0.left + r.width / 2, y: r.top - r0.top + (r.height - A - Dd) / 2 + A };
  };
  const sandForm = (cv, pts, o = {}) => {
    const M = MQ(), g = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const COL = o.colors || ['#fff1d4', '#f7d9a0', '#efc27d', '#fde7bd'], T = o.total || 3600;
    const gr = pts.map(([tx, ty]) => ({ tx, ty, sx: W + 30 + Math.random() * 260, sy: clamp(ty + (Math.random() - .5) * H * .55, 10, H - 10), d: Math.random() * 1500, dur: 1300 + Math.random() * 800,
      amp: 40 + Math.random() * 90, ph: Math.random() * 6.28, k: Math.random(), col: COL[(Math.random() * COL.length) | 0], sz: 1.4 + Math.random() * 1.5 }));
    const wind = Array.from({ length: Math.round(110 * (M.tier === 'high' ? 1 : .4)) }, () => ({ y: Math.random() * H, x: W + Math.random() * W, v: .9 + Math.random() * 1.6, l: 14 + Math.random() * 40, a: .15 + Math.random() * .4 }));
    const at = (q, u) => { const e = 1 - Math.pow(1 - u, 2.6), w = 1 - e; return [q.sx + (q.tx - q.sx) * e + Math.sin(u * (7 + q.k * 5) + q.ph) * q.amp * w, q.sy + (q.ty - q.sy) * e + Math.cos(u * (6 + q.k * 4) + q.ph) * q.amp * .55 * w]; };
    return new Promise(res => {
      const stop = M.loop((t, dt) => {
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
        const fade = clamp((t - (T - 700)) / 700);
        g.globalAlpha = 1 - fade;
        if (t < T - 700) wind.forEach(w => { w.x -= w.v * dt * .9; g.fillStyle = `rgba(255,236,200,${w.a})`; g.fillRect(w.x, w.y, w.l, 1); });
        gr.forEach(q => {
          const u = clamp((t - q.d) / q.dur); if (t < q.d) return;
          let [x, y] = at(q, u);
          if (u >= 1) { x += Math.sin(t * .004 + q.ph) * .5; y += Math.cos(t * .003 + q.ph) * .5; }
          else { const [px, py] = at(q, Math.max(0, u - .04)); g.fillStyle = q.col; g.globalAlpha = (1 - fade) * .35; g.fillRect(px, py, q.sz, q.sz); g.globalAlpha = 1 - fade; }
          g.fillStyle = q.col; g.fillRect(x, y, q.sz, q.sz);
        });
        if (t >= T) { stop(); g.clearRect(0, 0, W, H); res(); }
      });
    });
  };

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc, { ev, S, target } = model(c);
    const h0 = Math.min(S.sunrise - .45, target - 1.6), h1 = Math.max(S.sunset + .75, target + 1.6), pT = (target - h0) / (h1 - h0);
    el.innerHTML = `<div class="dm-cover" style="--dp:0">
      <div class="dm-sky"></div><div class="dm-stars"></div><div class="dm-haze"></div>
      <div class="dm-clock" aria-live="off"><b>--:--</b><span>Bình minh</span></div>
      <p class="dm-ask">Kéo mặt trời tới <b>${e(ev.time)}</b>, giờ làm lễ</p>
      <svg class="dm-arc" aria-hidden="true"><path class="trk" pathLength="1"/><path class="done" pathLength="1"/><circle class="tg" r="11"/><circle class="tg2" r="3.5"/></svg>
      <div class="dm-tgl">Giờ làm lễ</div>
      <div class="dm-sun" tabindex="0" role="slider" aria-label="Mặt trời. Kéo tới giờ làm lễ ${e(ev.time)}" aria-valuemin="0" aria-valuemax="100"><i class="rays"></i><i class="halo"></i><i class="disc"></i><i class="pulse"></i></div>
      <div class="dm-dunes">${DUNES(4)}</div>
      <div class="dm-big" aria-hidden="true"><span class="l">${e(D.bride.name)}</span><span class="v">và</span><span class="l">${e(D.groom.name)}</span></div>
      <canvas class="dm-sand" aria-hidden="true"></canvas>
      <div class="dm-foot">
        <div class="dm-fade"><p class="dm-sm">${e(D.bride.name)} <i>và</i> ${e(D.groom.name)}</p></div>
        <p class="dm-date"><span>${c.dow}</span><i></i><b>${c.dateText}</b></p>
        <p class="dm-guest">Gửi <b>${e(c.guest)}</b></p>
        <div class="dm-fade"><button class="open-btn" type="button">Mặt trời, lên đi</button></div>
      </div></div>`;
    const root = el.querySelector('.dm-cover'), sun = root.querySelector('.dm-sun'), arc = root.querySelector('.dm-arc');
    const clockB = root.querySelector('.dm-clock b'), clockS = root.querySelector('.dm-clock span'), tgl = root.querySelector('.dm-tgl');
    const trk = arc.querySelector('.trk'), dn = arc.querySelector('.done'), tg = arc.querySelector('.tg'), tg2 = arc.querySelector('.tg2');
    const setV = (k, v) => root.style.setProperty(k, v);
    let G = {}, p = .04, locked = false, dragging = false, inBasin = 0, wasNear = false, lastHour = -1;
    const pos = q => ({ x: G.x0 + q * G.aw, y: G.hy - Math.sin(Math.PI * q) * G.rise });
    const layout = () => {
      const W = root.clientWidth, H = root.clientHeight, aw = Math.min(W * .82, 760);
      G = { W, H, aw, x0: W / 2 - aw / 2, hy: H * .585, rise: Math.min(H * .33, aw * .62) };
      arc.setAttribute('viewBox', `0 0 ${W} ${H}`);
      let d = ''; for (let i = 0; i <= 48; i++) { const q = pos(i / 48); d += (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1); }
      trk.setAttribute('d', d); dn.setAttribute('d', d);
      const t = pos(pT); [tg, tg2].forEach(n => { n.setAttribute('cx', t.x); n.setAttribute('cy', t.y); });
      tgl.style.left = t.x + 'px'; tgl.style.top = (t.y - 44) + 'px';
      apply();
    };
    const label = (h, el_) => h < S.sunrise + .35 ? 'Bình minh' : el_ > 45 ? 'Nắng trưa' : el_ > 6 ? (h < S.noon ? 'Buổi sáng' : 'Buổi chiều') : el_ > -.8 ? 'Giờ vàng' : el_ > -6 ? 'Hoàng hôn' : 'Chạng vạng';
    function apply() {
      const h = lerp(h0, h1, p), el_ = S.elev(h), [t, m, b] = skyAt(el_), q = pos(p), night = clamp((6 - el_) / 16), warm = clamp(1 - Math.abs(el_ - 3) / 8);
      setV('--sk1', t); setV('--sk2', m); setV('--sk3', b);
      DUNE.forEach(([a, s], i) => {
        const haze = [.38, .16, .04, 0][i];
        const f = col => mix(mix(mix(col, b, haze), '#ff9250', warm * .2), '#2c2140', night * (.62 - i * .06));
        setV('--d' + (i + 1), f(a)); setV('--s' + (i + 1), f(s));
      });
      setV('--ro', clamp((.62 - p) / .4)); setV('--lo', clamp((p - .38) / .4));
      setV('--stars', clamp((2 - el_) / 8)); setV('--sx', q.x + 'px'); setV('--sy', q.y + 'px');
      setV('--sc', mix('#fff8dc', '#ff8a46', clamp((14 - el_) / 14))); setV('--dp', p.toFixed(3));
      sun.style.transform = `translate(${q.x}px,${q.y}px)`;
      dn.setAttribute('stroke-dasharray', `${p} 2`);
      const shown = locked ? target : h;
      clockB.textContent = hm(shown); clockS.textContent = label(shown, S.elev(shown));
      sun.setAttribute('aria-valuenow', Math.round(p * 100)); sun.setAttribute('aria-valuetext', hm(shown));
    }
    // a magnetic basin around the target hour pulls the sun in
    const setFromX = x => {
      let q = clamp((x - G.x0) / G.aw), h = lerp(h0, h1, q); const d = Math.abs(h - target);
      if (d < .75) { const pull = d < .2 ? 1 : 1 - (d - .2) / .55; q = lerp(q, pT, pull * pull); }
      p = q; apply(); check();
    };
    const check = () => {
      const d = Math.abs(lerp(h0, h1, p) - target) * 60;
      const near = d < 40; root.classList.toggle('near', near);
      if (near && !wasNear) { M.haptic('tap'); M.tone('click'); } wasNear = near;
      const hr = Math.floor(lerp(h0, h1, p)); if (hr !== lastHour) { lastHour = hr; if (!locked) M.tone('click'); }
      if (d < 7 && !locked) { inBasin++; if (inBasin > 3) lock(); } else inBasin = 0;
    };
    root.addEventListener('pointerdown', ev => {
      if (locked || ev.target.closest('.open-btn')) return;
      dragging = true; root.setPointerCapture?.(ev.pointerId); M.requestTilt(); EA.music(); root.classList.add('dragging'); root.classList.remove('hint'); setFromX(ev.clientX);
    });
    root.addEventListener('pointermove', ev => { if (dragging && !locked) setFromX(ev.clientX); });
    const up = () => { if (!dragging) return; dragging = false; root.classList.remove('dragging'); if (!locked && Math.abs(lerp(h0, h1, p) - target) < .3) lock(); };
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    sun.addEventListener('keydown', ev => {
      const st = { ArrowRight: .25, ArrowUp: .25, ArrowLeft: -.25, ArrowDown: -.25, PageUp: 1, PageDown: -1 }[ev.key]; if (!st || locked) return;
      ev.preventDefault(); let h = Math.round((lerp(h0, h1, p) + st) * 4) / 4; h = clamp(h, h0, h1);
      p = (h - h0) / (h1 - h0); if (Math.abs(h - target) < .13) p = pT; apply(); check();
    });
    const offTilt = M.tilt(({ x, y }) => { setV('--tx', x.toFixed(3)); setV('--ty', y.toFixed(3)); });
    window.addEventListener('resize', layout);

    // ---- wow: lock -> wind -> sand names -> open ----
    let started = false;
    const names = () => {
      const r0 = root.getBoundingClientRect(), W = Math.round(r0.width), H = Math.round(r0.height), lines = [];
      root.querySelectorAll('.dm-big > *').forEach(n => lines.push(lineFrom(n, r0)));
      return sampleText(W, H, lines, M.tier === 'high' ? 3 : M.tier === 'mid' ? 4 : 6);
    };
    function lock() {
      if (locked) return; locked = true; dragging = false; root.classList.remove('dragging', 'hint');
      p = pT; apply(); root.classList.add('locked');
      M.haptic('success'); M.tone('chime'); EA.music(); offTilt();
      const done = () => { root.classList.add('shown'); c.after(900, open); };
      c.after(650, () => root.classList.add('wind'));
      if (c.reduced) { root.classList.add('wind'); return done(); }
      c.after(700, () => { M.tone('whoosh'); M.haptic('thud'); });
      c.after(900, async () => {
        const pts = names(), cv = root.querySelector('.dm-sand');
        c.after(2500, () => { root.classList.add('shown'); M.tone('pop'); });
        await sandForm(cv, pts, { total: 3700 }); M.haptic('success'); c.after(500, open);
      });
    }
    const auto = () => {
      if (locked || started) return; started = true; root.classList.remove('hint'); EA.music(); M.requestTilt();
      const p0 = p; M.tween(0, 1, 1900, 'inOut', k => { p = lerp(p0, pT, k); apply(); }).then(() => lock());
    };
    root.querySelector('.open-btn').addEventListener('click', auto);
    layout(); root.classList.add('hint');
    // a gentle nudge so the guest sees the sun can move
    c.after(1400, () => { if (!dragging && !locked && !started) { const p0 = p; M.tween(0, 1, 1300, t => Math.sin(t * Math.PI), k => { if (!dragging && !locked) { p = p0 + .06 * k; apply(); } }); } });
  });

  // ---------- shared bits ----------
  const SUNI = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="13" r="4.2"/><path d="M12 3v3M3 13h2.5M18.5 13H21M5.6 6.6l1.8 1.8M18.4 6.6l-1.8 1.8M3 20h18"/></svg>';
  const head = (c, eb, title, sub) => { const mc = c.mod?.content || {}; return `<header class="dm-hd"><span class="dm-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</span><h2>${mc.title != null ? esc(mc.title) : title}</h2><i class="dm-rule"><b></b></i>${sub ? `<p>${sub}</p>` : ''}</header>`; };
  const discArt = `<svg class="dm-art" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="dmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c58a"/><stop offset=".7" stop-color="#f08a52"/></linearGradient></defs><rect width="200" height="200" fill="url(#dmg)"/><circle cx="118" cy="92" r="30" fill="#fff0cf" opacity=".92"/><circle cx="118" cy="92" r="46" fill="none" stroke="#fff0cf" opacity=".4"/><path d="M0 128C30 104 60 108 90 124S150 134 200 112V200H0Z" fill="#c9693f"/><path d="M0 154C40 136 80 146 110 158S170 160 200 146V200H0Z" fill="#8a3f24"/><path d="M40 70l6-3 4 4 7-2M150 56l5-3 3 3 6-2" stroke="#7a3e22" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

  // ---------- hero ----------
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content, ph = hasPhoto(cp.heroImage) ? cp.heroImage : '';
    return `<div class="dm-hero">
      <div class="dm-hsky"><p class="dm-eb">${e(mc.eyebrow || 'Hân hoan kính báo tin mừng')}</p>
        <div class="dm-discw"><i class="dm-rays"></i><button class="dm-disc${ph ? '' : ' ea-nophoto'}" type="button" aria-label="Mặt trời. Chạm ba lần để thấy nhật thực">${ph ? `<img src="${e(ph)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}${discArt}</button><span class="dm-egg" role="status"></span></div></div>
      <div class="dm-hdn">${DUNES(3)}</div>
      <div class="dm-hbody">
        <h1 class="dm-names"><span>${e(D.bride.name)}</span><span class="va">và</span><span>${e(D.groom.name)}</span></h1>
        ${cp.headline ? `<p class="dm-headline">${c.t(cp.headline)}</p>` : ''}
        <p class="dm-hdate"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>
        ${cp.lunarDate ? `<p class="dm-lunar">${e(cp.lunarDate)}</p>` : ''}
        ${mc.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  // ---------- invitation + days together ----------
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether, met = String(c.p.get('metDate', '')).split('-').reverse().join('.'), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow"><div class="dm-letter">
      <span class="dm-mark">${SUNI}</span>
      <div class="dm-salute">${t(mc.greeting || 'Gửi {guestName},')}</div>
      <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2><i class="dm-rule"><b></b></i>
      ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
      ${D.letterHighlight ? `<p class="dm-hl">${t(D.letterHighlight)}</p>` : ''}
      ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
      <p class="dm-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p></div>
      ${days > 0 ? `<div class="dm-days" data-days="${days}"><svg viewBox="0 0 240 90" aria-hidden="true"><path class="ar" pathLength="1" d="M10 84 Q120 -34 230 84"/><circle class="sn" r="9"/></svg>
        <div class="n">${days.toLocaleString('vi-VN')}</div><div class="u">lần mặt trời mọc từ ngày gặp nhau</div>
        <p>${met ? `Từ ${met}` : ''}${place ? ` · ${e(place)}` : ''}</p></div>` : ''}</div>`;
  });

  // ---------- story: chapters, dawn/dusk duo, road trip ----------
  const roadmap = (c, places) => {
    const P = places.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))), pd = 22, VW = 300;
    const la = P.map(x => +x.lat), lo = P.map(x => +x.lng), mid = (Math.min(...la) + Math.max(...la)) / 2, cs = Math.cos(mid * Math.PI / 180);
    const dx = Math.max(.4, (Math.max(...lo) - Math.min(...lo)) * cs), dy = Math.max(.4, Math.max(...la) - Math.min(...la));
    const s = Math.min((VW - pd * 2) / dx, 300 / dy), w = dx * s + pd * 2, h = clamp(dy * s + pd * 2, 200, 400), ox = (VW - w) / 2;
    const pt = P.map(x => [ox + pd + (x.lng - Math.min(...lo)) * cs * s + (VW - 2 * ox - w) / 2, (h - dy * s) / 2 + (Math.max(...la) - x.lat) * s]);
    let d = `M${pt[0][0].toFixed(1)} ${pt[0][1].toFixed(1)}`;
    for (let i = 1; i < pt.length; i++) { const a = pt[i - 1], b = pt[i], sag = (i % 2 ? 1 : -1) * 18; d += `Q${((a[0] + b[0]) / 2 + sag).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; }
    let km = 0; const rows = P.map((x, i) => { const k = i ? Math.round(c.p.kmBetween(P[i - 1], x)) : 0; km += k; return { x, k }; });
    return `<div class="dm-trip" data-n="${P.length}"><div class="dm-map"><svg viewBox="0 0 ${VW} ${h.toFixed(0)}" aria-hidden="true">
      ${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${VW / 2}" cy="${h / 2}" rx="${60 + i * 42}" ry="${34 + i * 30}" class="cn"/>`).join('')}
      <path class="rd" d="${d}"/><path class="rd2" pathLength="1" d="${d}"/>
      ${pt.map((q, i) => `<g class="pn" data-i="${i}"><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="9"/><text x="${q[0].toFixed(1)}" y="${(q[1] + 3.6).toFixed(1)}" text-anchor="middle">${i + 1}</text></g>`).join('')}
      <g class="car"><rect x="-8" y="-4" width="16" height="8" rx="3"/><circle cx="-4" cy="4.5" r="2"/><circle cx="4" cy="4.5" r="2"/></g></svg></div>
      <ol class="dm-places">${rows.map((r, i) => `<li data-i="${i}"><b>${i + 1}</b><div><span>${esc(r.x.name)}</span><small>${esc(String(r.x.date || '').replace('-', '/').split('/').reverse().join('/'))}${r.k ? ` · ${r.k.toLocaleString('vi-VN')} km` : ''}</small></div></li>`).join('')}
        <li class="tot">Tổng cộng khoảng <b>${km.toLocaleString('vi-VN')} km</b> trên đường cùng nhau</li></ol></div>`;
  };
  EA.section('story', c => {
    const { esc: e, mod } = c, mc = mod.content, tr = c.p.get('traits', {}) || {}, places = (c.p.get('places', []) || []).filter(okPin);
    const person = (k, nm) => {
      const t = tr[k]; if (!t) return '';
      const night = t.rhythm === 'night', rows = [['Thức uống', t.drink], ['Sở thích', t.hobby]].filter(r => r[1]);
      return `<article class="dm-tr ${night ? 'dusk' : 'dawn'}"><div class="sk"></div><span class="ic">${SUNI}</span><h3>${e(nm)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3>
        <em>${t.rhythm ? (night ? 'Người của hoàng hôn' : 'Người của bình minh') : 'Một nửa của ánh nắng'}</em>${rows.map(r => `<p><span>${r[0]}</span>${e(r[1])}</p>`).join('')}</article>`;
    };
    const duo = person('bride', c.data.bride.short || c.data.bride.name) + person('groom', c.data.groom.short || c.data.groom.name);
    return `<div class="wrap">${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="dm-chap">${(mc.chapters || []).map((ch, i) => `<li><div class="ph${ch.image ? '' : ' ea-nophoto'}">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</div><div class="tx"><span>${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${mc.quote ? `<p class="dm-sq">${e(mc.quote)}</p>` : ''}
      ${duo ? `<div class="dm-duo">${duo}</div>` : ''}
      ${places.length >= 2 ? `<h3 class="dm-h3">Hành trình trên cát</h3><p class="dm-lead">Những nơi hai bạn đã đi qua, nối thành một con đường.</p>${roadmap(c, places)}` : ''}</div>`;
  });

  // ---------- events: golden hour for the venue ----------
  const goldenCard = c => {
    const { S, V, ev } = model(c), e = esc, gs = S.goldenStart, ss = S.sunset, evs = c.data.events;
    const X = h => 10 + (h - 4) / 16 * 300, Y = el => 118 - clamp(el, -4, 90) / 90 * 100;
    let curve = ''; for (let h = 4.5; h <= 19.5; h += .25) curve += (curve ? 'L' : 'M') + X(h).toFixed(1) + ' ' + Y(S.elev(h)).toFixed(1);
    const marks = evs.map(v => { const [a, b] = String(v.time).split(':'), h = +a + (+b || 0) / 60; return { h, v, x: X(h), y: Y(S.elev(h)) }; });
    const inG = gs != null && evs.find(v => { const [a, b] = String(v.time).split(':'), h = +a + (+b || 0) / 60; return h <= ss && h + (v.hours || 2) >= gs; });
    return `<div class="dm-gold" data-gs="${gs ?? ''}" data-ss="${ss}" data-date="${c.y}-${c.m}-${c.d}">
      <span class="dm-eb">Giờ vàng ngày cưới</span>
      <p class="big">Nắng đẹp nhất rơi vào <b>${gs != null ? hm(gs) : '--'} – ${hm(ss)}</b></p>
      <svg viewBox="0 0 320 150" aria-hidden="true" role="img"><defs><clipPath id="dmc"><rect x="0" y="0" width="320" height="118"/></clipPath></defs>
        <rect class="gb" x="${X(S.goldenAM ?? S.sunrise)}" y="0" width="${X((S.goldenAM ?? S.sunrise) + .5) - X(S.goldenAM ?? S.sunrise)}" height="118"/>
        ${gs != null ? `<rect class="gb" x="${X(gs)}" y="0" width="${X(ss) - X(gs)}" height="118"/>` : ''}
        <line class="hz" x1="6" x2="314" y1="118" y2="118"/><path class="cv" clip-path="url(#dmc)" pathLength="1" d="${curve}"/>
        ${[6, 9, 12, 15, 18].map(h => `<text class="tk" x="${X(h)}" y="136" text-anchor="middle">${h}h</text>`).join('')}
        ${marks.map(m => `<g class="mk"><circle cx="${m.x.toFixed(1)}" cy="${Math.min(118, m.y).toFixed(1)}" r="5"/></g>`).join('')}</svg>
      <div class="stats"><div><span>Mặt trời mọc</span><b>${hm(S.sunrise)}</b></div><div><span>Giờ vàng</span><b>${gs != null ? hm(gs) : '--'}</b></div><div><span>Hoàng hôn</span><b>${hm(ss)}</b></div></div>
      <p class="cd" aria-live="off"></p>
      ${inG ? `<p class="tip"><b>${e(inG.title)}</b> lúc ${e(inG.time)} trùng giờ vàng. Hãy đến sớm một chút để kịp những bức ảnh ngược nắng.</p>` : ''}
      <small>Tính theo toạ độ ${V.lat.toFixed(2)}°N, ${V.lng.toFixed(2)}°E cho ngày ${c.d}.${c.m}.${c.y}</small></div>`;
  };
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    return `<div class="wrap narrow">${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi', 'Từng giờ nắng của một ngày đáng nhớ')}
      ${goldenCard(c)}
      <ol class="dm-ev">${D.events.map(ev => `<li><div class="tm"><b>${e(ev.time)}</b><span>${SUNI}</span></div><article><span class="tag">${e(ev.label)}</span><h3>${e(ev.title)}</h3>
        <p class="pl"><b>${e(ev.place)}</b><br>${e(ev.address)}</p>${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}${ui.actions(ev)}</article></li>`).join('')}</ol></div>`;
  });

  EA.section('gallery', c => `<div class="wrap">${head(c, 'Khoảnh khắc', 'Khoảnh khắc của chúng mình')}<div class="dm-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  EA.section('quote', c => {
    const q = c.p.get('quote', null), txt = c.data.quote || q?.text, song = c.p.get('song', null), pet = c.p.get('pet', null);
    return `<div class="wrap narrow"><span class="dm-eb">${esc(c.mod.content.eyebrow || 'Lời mời')}</span>
      ${txt ? `<blockquote>${esc(txt)}</blockquote>${q?.author && !c.data.quote ? `<cite>${esc(q.author)}</cite>` : ''}` : ''}
      <div class="dm-extras">${song?.title ? `<div class="dm-song"><span class="eq"><i></i><i></i><i></i><i></i></span><div><small>Bài hát của hai đứa</small><b>${esc(song.title)}</b>${song.artist ? `<span>${esc(song.artist)}</span>` : ''}${song.lyric ? `<em>${esc(song.lyric)}</em>` : ''}</div></div>` : ''}
      ${pet?.name ? `<div class="dm-pet"><small>Thành viên bốn chân</small><b>${esc(pet.name)}</b><span>${esc(pet.kind || '')} sẽ nhớ nắng</span></div>` : ''}</div></div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">${head(c, 'Xác nhận tham dự', 'Bạn sẽ đến chứ?', 'Một dấu chân của bạn sẽ ở lại trên cát')}<div class="dm-rsvp">${c.ui.rsvpForm()}</div></div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="dm-bye"><div class="sky"><i class="star"></i><div class="sun"></div></div><div class="in">
      <span class="dm-eb">Lời cảm ơn</span><h2>Hẹn gặp <b>${e(guest)}</b> lúc nắng vàng</h2><p>${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <div class="dm-prints" aria-label="Dấu chân của khách mời"></div><p class="dm-bdate">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Xem lại buổi bình minh ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div></div>${DUNES(2)}</div>`;
  });

  // ---------- behaviours ----------
  const prints = main => {
    const box = main.querySelector('.dm-prints'); if (!box) return;
    Promise.resolve(EA.shared.list('footprints')).then(l => {
      const nm = (l || []).map(x => String(x?.name || '').trim()).filter(Boolean).slice(-8);
      box.innerHTML = nm.map((n, i) => `<span style="--i:${i}"><svg viewBox="0 0 24 30" aria-hidden="true"><ellipse cx="9" cy="19" rx="5" ry="8" transform="rotate(-8 9 19)"/><ellipse cx="17" cy="9" rx="4" ry="7" transform="rotate(8 17 9)"/></svg>${esc(n)}</span>`).join('');
    }).catch(() => {});
  };
  EA.afterRender((c, main) => {
    const M = c.motion, root = document.documentElement;
    // dunes shift on scroll
    let raf = 0; const sync = () => { raf = 0; root.style.setProperty('--ds', (scrollY / 40).toFixed(1)); };
    if (!c.reduced) addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
    // easter egg: three taps on the hero sun -> eclipse
    const disc = main.querySelector('.dm-disc'), egg = main.querySelector('.dm-egg');
    if (disc) {
      let n = 0, tm = 0;
      disc.addEventListener('click', () => {
        n++; clearTimeout(tm); tm = setTimeout(() => { n = 0; }, 1000); M.tone('click');
        if (n >= 3) { n = 0; const joke = c.p.get('insideJoke', ''); egg.textContent = joke || 'Nhật thực: cả sa mạc chỉ còn hai người.'; main.querySelector('.dm-hsky').classList.add('eclipse'); M.haptic('success'); M.tone('chime'); setTimeout(() => main.querySelector('.dm-hsky').classList.remove('eclipse'), 5200); }
      });
    }
    // golden countdown
    const g = main.querySelector('.dm-gold');
    if (g) {
      const cd = g.querySelector('.cd'), at = h => new Date(`${g.dataset.date}T00:00:00+07:00`).getTime() + h * 3600e3;
      const gs = g.dataset.gs ? at(+g.dataset.gs) : null, ss = at(+g.dataset.ss);
      const tick = () => {
        const n = Date.now(), t = gs != null && n < gs ? gs : n < ss ? ss : null;
        if (!t) { cd.innerHTML = 'Giờ vàng ngày cưới đã khép lại. Nắng vẫn nhớ hai bạn.'; return; }
        const s = Math.max(0, Math.floor((t - n) / 1000)), d = Math.floor(s / 86400), f = [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map(pad).join(':');
        cd.innerHTML = `${t === gs ? 'Còn' : 'Giờ vàng đang rót nắng, hoàng hôn sau'} <b>${d ? d + ' ngày ' : ''}${f}</b>${t === gs ? ' nữa là tới giờ vàng' : ''}`;
      };
      tick(); setInterval(tick, 1000);
      M.inView(g, () => g.classList.add('on'), { threshold: .35 });
    }
    // days together
    const dd = main.querySelector('.dm-days');
    if (dd) M.inView(dd, () => { dd.classList.add('on'); const n = dd.querySelector('.n'), to = +dd.dataset.days; M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .4 });
    // road trip: the car drives
    main.querySelectorAll('.dm-trip').forEach(tr => M.inView(tr, () => {
      tr.classList.add('on');
      const path = tr.querySelector('.rd'), car = tr.querySelector('.car'), len = path.getTotalLength(), n = +tr.dataset.n, pins = [...tr.querySelectorAll('.pn')], lis = [...tr.querySelectorAll('.dm-places li[data-i]')];
      const drive = k => { const q = path.getPointAtLength(len * k), q2 = path.getPointAtLength(Math.min(len, len * k + 1)); car.setAttribute('transform', `translate(${q.x} ${q.y}) rotate(${Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI})`); tr.querySelector('.rd2').style.strokeDashoffset = 1 - k; pins.forEach((pn, i) => { if (k >= i / (n - 1) - .001) { pn.classList.add('on'); lis[i]?.classList.add('on'); } }); };
      drive(0); M.tween(0, 1, c.reduced ? 0 : 4800, 'inOut', drive);
    }, { threshold: .4 }));
    // sunset on the closing section
    const bye = main.querySelector('.dm-bye');
    if (bye) { M.scrollProgress(bye, q => bye.style.setProperty('--sp', clamp((q - .25) / .45).toFixed(3))); prints(main); }
  });

  // finale: the RSVP name is written in sand at dusk
  EA.onRsvp(entry => {
    const M = EA.motion, name = String(entry?.name || '').trim() || 'bạn';
    prints(document.getElementById('inv'));
    if (entry && entry.attending === false) return;
    try { EA.shared.add('footprints', { name }); } catch { /* local only */ }
    const o = document.createElement('div'); o.className = 'dm-finale'; o.innerHTML = '<canvas></canvas><div class="msg"><small>Cảm ơn bạn</small><b></b><span>Hẹn gặp lúc giờ vàng</span></div>';
    o.querySelector('b').textContent = name; document.body.appendChild(o);
    M.haptic('success'); M.tone('chime');
    requestAnimationFrame(() => o.classList.add('on'));
    const end = () => { o.classList.remove('on'); setTimeout(() => o.remove(), 900); };
    if (M.reduced) return void setTimeout(end, 3200);
    const cv = o.querySelector('canvas'), W = cv.clientWidth, H = cv.clientHeight, nb = o.querySelector('b');
    const r0 = o.getBoundingClientRect(), lines = [lineFrom(nb, r0)];
    M.tone('whoosh'); setTimeout(() => o.classList.add('shown'), 2400);
    sandForm(cv, sampleText(Math.round(W), Math.round(H), lines, M.tier === 'high' ? 3 : 4), { total: 3400 }).then(() => { o.classList.add('hold'); setTimeout(end, 2200); });
  });
})();
