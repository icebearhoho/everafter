// The Morning Vow: a letter opened at dawn. Swipe and a sheer voile blows open, sunlight sweeps the room, the vow writes itself in ink.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2, lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sc = n => Math.max(1, Math.round(M.scale(n)));
  const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
  const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
  const nb = s => String(s || '').replace(/ (\S+)$/, ' $1');   // keep the last two words together (no orphan)
  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }
  const setTier = () => { html.dataset.mvTier = M.tier; };

  // ---------- the voile: two sheer panels hung from a rod, folds shift with the wind ----------
  // open 0 = drawn shut, 1 = gathered at the sides; blow 0..1 = gust strength
  function makeCurtain(cv) {
    const g = cv.getContext('2d'), S = 36;
    return function draw(t, open, blow, calm) {
      const { w, h, dpr } = fit(cv, 1.25); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const gath = Math.min(w * .15, 96), edge = lerp(w * .5 + 3, gath, open), amp = w * (.012 + .03 * blow) * (1 - .55 * open * calm);
      for (let side = 0; side < 2; side++) {
        const dir = side ? -1 : 1, x0 = side ? w : 0, pts = [];
        for (let i = 0; i <= S; i++) {
          const f = i / S, x = x0 + dir * f * edge;
          const sway = Math.sin(t * .0011 + f * 4.4 + side * 1.9), gust = Math.sin(t * .0007 + f * 2 + side) * .5 + .5;
          const bottom = amp * (.5 + f) * sway + blow * w * .05 * f * f * (.6 + gust * .8);
          pts.push({ x, bx: x + bottom * dir, f, sway });
        }
        const hemY = i => h * (.985 + .008 * Math.sin(t * .0016 + i * .7 + side));
        for (let i = 0; i < S; i++) {
          const a = pts[i], b = pts[i + 1];
          const shade = .5 + .5 * Math.cos((i / S) * 7 * TAU + a.sway * .55 + side);
          const col = mix([228, 212, 190], [255, 252, 245], shade), al = .34 + .3 * shade;
          g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`;
          g.beginPath(); g.moveTo(a.x, 0); g.lineTo(b.x, 0); g.lineTo(b.bx, hemY(i + 1)); g.lineTo(a.bx, hemY(i)); g.closePath(); g.fill();
        }
        g.strokeStyle = 'rgba(205,165,100,.85)'; g.lineWidth = 1.6; g.beginPath();
        pts.forEach((p, i) => i ? g.lineTo(p.bx, hemY(i) - 1) : g.moveTo(p.bx, hemY(0) - 1)); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath();
        pts.forEach((p, i) => i ? g.lineTo(p.bx, hemY(i) - 7) : g.moveTo(p.bx, hemY(0) - 7));
        for (let i = S; i >= 0; i--) g.lineTo(pts[i].bx, hemY(i) - 2); g.fill();
      }
      const rod = g.createLinearGradient(0, 0, 0, 12); rod.addColorStop(0, '#e9cd8c'); rod.addColorStop(.5, '#b88c4a'); rod.addColorStop(1, '#8a6532');
      g.fillStyle = rod; g.fillRect(0, 0, w, 10);
      for (let x = 14; x < w; x += Math.max(26, w / 18)) { g.fillStyle = '#c99d55'; g.beginPath(); g.arc(x, 10, 3.4, 0, TAU); g.fill(); }
    };
  }

  // ---------- dawn scene behind the glass ----------
  const SKY = { top: [[170, 178, 200], [247, 214, 168]], mid: [[214, 208, 214], [255, 226, 178]], low: [[236, 222, 218], [255, 205, 150]],
    far: [[150, 158, 178], [206, 168, 128]], near: [[118, 128, 148], [172, 126, 92]], tree: [[84, 94, 112], [120, 86, 62]] };
  function makeScene(cv) {
    const g = cv.getContext('2d');
    const ridge = (seed, base, amp) => { const a = []; for (let i = 0; i <= 24; i++) a.push(base + amp * (Math.sin(i * .7 + seed) * .5 + Math.sin(i * 1.9 + seed * 2) * .3 + Math.sin(i * .25 + seed) * .4)); return a; };
    const far = ridge(1, .78, .035), near = ridge(4, .86, .03);
    const trees = []; for (let i = 0; i < 16; i++) trees.push({ x: R(.02, .98), h: R(.05, .11), w: R(.018, .03) });
    return function draw(t, dawn, tx) {
      const { w, h, dpr } = fit(cv, 1.25); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, rgb(mix(...SKY.top, dawn))); bg.addColorStop(.55, rgb(mix(...SKY.mid, dawn))); bg.addColorStop(.8, rgb(mix(...SKY.low, dawn)));
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const sx = w * (.5 + tx * .06), sy = h * lerp(.72, .6, dawn), r = Math.min(w, h) * lerp(.07, .095, dawn);
      const halo = g.createRadialGradient(sx, sy, 0, sx, sy, r * lerp(4, 9, dawn));
      halo.addColorStop(0, `rgba(255,240,205,${.6 + .35 * dawn})`); halo.addColorStop(.35, `rgba(255,214,150,${.22 + .3 * dawn})`); halo.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = halo; g.fillRect(0, 0, w, h);
      g.fillStyle = `rgba(255,248,226,${.82 + .18 * dawn})`; g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill();
      const hills = (arr, col, par) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(-10, h);
        arr.forEach((y, i) => g.lineTo(i / 24 * (w + 20) - 10 + tx * par, y * h)); g.lineTo(w + 10, h); g.closePath(); g.fill();
      };
      hills(far, rgb(mix(...SKY.far, dawn)), 5); hills(near, rgb(mix(...SKY.near, dawn)), 12);
      g.fillStyle = rgb(mix(...SKY.tree, dawn));
      trees.forEach(tr => { const x = tr.x * w + tx * 18, y = h * .91, th = tr.h * h; g.beginPath(); g.moveTo(x - tr.w * w, y); g.quadraticCurveTo(x, y - th * 1.5, x + tr.w * w, y); g.fill(); });
      g.fillRect(0, h * .92, w, h * .1);
      return { sx, sy, r };
    };
  }

  // ---------- light: god rays + a sweeping band + dust motes ----------
  function makeLight(cv) {
    const g = cv.getContext('2d'), motes = [];
    for (let i = 0; i < sc(46); i++) motes.push({ x: R(0, 1), y: R(0, 1), r: R(.8, 2.4), v: R(.004, .014), ph: R(0, TAU), a: R(.35, .85) });
    return function draw(t, dt, dawn, sweep, tx, sun) {
      const { w, h, dpr } = fit(cv, 1.25); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      if (dawn > .02) {
        for (let i = 0; i < 6; i++) {
          const ang = -Math.PI / 2 + (i - 2.5) * .26 + tx * .12 + Math.sin(t * .0003 + i) * .02, L = Math.hypot(w, h) * 1.2, wd = .05 + (i % 2) * .03;
          const gr = g.createLinearGradient(sun.sx, sun.sy, sun.sx + Math.cos(ang) * L, sun.sy + Math.sin(ang) * L);
          gr.addColorStop(0, `rgba(255,236,190,${.38 * dawn})`); gr.addColorStop(1, 'rgba(255,236,190,0)');
          g.fillStyle = gr; g.beginPath(); g.moveTo(sun.sx, sun.sy);
          g.lineTo(sun.sx + Math.cos(ang - wd) * L, sun.sy + Math.sin(ang - wd) * L); g.lineTo(sun.sx + Math.cos(ang + wd) * L, sun.sy + Math.sin(ang + wd) * L); g.fill();
        }
      }
      if (sweep > 0 && sweep < 1) {   // a band of morning light crossing the room
        const x = lerp(-.4, 1.4, sweep) * w, k = Math.sin(sweep * Math.PI), sk = h * .45;
        const gr = g.createLinearGradient(x - w * .3, 0, x + w * .3, 0);
        gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, `rgba(255,244,214,${.62 * k})`); gr.addColorStop(1, 'rgba(255,240,200,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * .3 + sk, 0); g.lineTo(x + w * .3 + sk, 0); g.lineTo(x + w * .3 - sk, h); g.lineTo(x - w * .3 - sk, h); g.fill();
      }
      if (dawn > .1) motes.forEach(m => {
        m.y -= m.v * dt * .06; m.x += Math.sin(t * .0004 + m.ph) * .0003 * dt * .1 + tx * .00004 * dt; if (m.y < -.02) { m.y = 1.02; m.x = R(0, 1); }
        const a = m.a * dawn * (.5 + .5 * Math.sin(t * .002 + m.ph)), x = m.x * w, y = m.y * h;
        const gr = g.createRadialGradient(x, y, 0, x, y, m.r * 4); gr.addColorStop(0, `rgba(255,236,190,${a})`); gr.addColorStop(1, 'rgba(255,236,190,0)');
        g.fillStyle = gr; g.fillRect(x - m.r * 4, y - m.r * 4, m.r * 8, m.r * 8);
      });
    };
  }

  // sunrise time at a place on a date (NOAA approximation), hours in local time
  function sunrise(dateStr, lat, lng) {
    const d = new Date(`${dateStr}T12:00:00Z`), n = Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), g = TAU / 365 * (n - 1), rad = Math.PI / 180;
    const eq = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
    const dec = .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g);
    const c = Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(dec)) - Math.tan(lat * rad) * Math.tan(dec), ha = Math.acos(clamp(c, -1, 1)) / rad;
    const tz = 7 * 60, rise = 720 - 4 * (lng + ha) - eq + tz, set = 720 - 4 * (lng - ha) - eq + tz;
    return { rise: rise / 60, set: set / 60 };
  }
  const hhmm = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`;

  // ---------- ongoing light: a sun-angle beam that follows tilt + dust ----------
  let beam = null, motesCv = null, motes = null, offTilt = null;
  function startAmbient() {
    if (beam) return;
    beam = Object.assign(document.createElement('div'), { className: 'mv-beam' }); beam.setAttribute('aria-hidden', 'true');
    motesCv = Object.assign(document.createElement('canvas'), { className: 'mv-motes' }); motesCv.setAttribute('aria-hidden', 'true');
    document.body.append(beam, motesCv);
    motes = M.particles(motesCv, {
      count: 38,
      init(p, i, w, h) { const f = p.first === undefined; p.first = false; p.x = R(0, w); p.y = f ? R(0, h) : h + 10; p.r = R(.8, 2.2); p.v = R(.012, .04); p.ph = R(0, TAU); p.a = R(.4, .85); },
      step(p, dt, w) { p.y -= p.v * dt; p.x += Math.sin(p.life * .0005 + p.ph) * .02 * dt + (p.tx || 0); return p.y > -10; },
      draw(g, p) {
        const a = p.a * (.55 + .45 * Math.sin(p.life * .002 + p.ph)), gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        gr.addColorStop(0, `rgba(214,168,86,${a})`); gr.addColorStop(1, 'rgba(214,168,86,0)'); g.fillStyle = gr; g.fillRect(p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      }
    });
    offTilt = M.tilt(v => { beam.style.setProperty('--ang', `${112 + v.x * 14}deg`); beam.style.setProperty('--shift', `${v.x * -6 + v.y * 4}%`); });
  }

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier();
    el.innerHTML = `<div class="mv-stage">
      <canvas class="mv-scene" aria-hidden="true"></canvas><canvas class="mv-curtain" aria-hidden="true"></canvas><canvas class="mv-light" aria-hidden="true"></canvas>
      <div class="mv-txt">
        <p class="mv-to">Gửi ${e(c.guest)}</p>
        <h1 class="mv-names"><span class="n n1">${e(D.bride.name).replace(' ', '&nbsp;')}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n n2">${e(D.groom.name).replace(' ', '&nbsp;')}</span></h1>
        <p class="mv-date">${c.dow} · ${c.d}.${c.m}.${c.y}</p>
        <p class="mv-vow" aria-live="polite">Mỗi buổi sáng về sau,<br>mình thức dậy bên nhau.</p>
      </div>
      <div class="mv-flash" aria-hidden="true"></div>
      <p class="mv-egg" role="status"></p>
      <div class="mv-ui"><p class="mv-hint"><i class="mv-chev"></i>Vuốt để mở rèm<i class="mv-chev r"></i></p><button class="open-btn" type="button">Mở rèm</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.mv-stage'), vow = q('.mv-vow'), egg = q('.mv-egg'), flash = q('.mv-flash');
    const scene = makeScene(q('.mv-scene')), curtain = makeCurtain(q('.mv-curtain')), light = makeLight(q('.mv-light'));
    const st = { open: 0, blow: 0, dawn: 0, sweep: 0, tx: 0 }; let go = false, music = false, sun = { sx: 0, sy: 0, r: 40 }, eggT = 0, sx0 = null, drawing = false;
    const stop = M.loop((t, dt) => {
      if (!stage.clientWidth) return;
      sun = scene(t, st.dawn, st.tx); curtain(t, st.open, st.blow, 1); light(t, dt, st.dawn, st.sweep, st.tx, sun);
    }, { el: stage });
    const offTiltC = M.tilt(v => { st.tx = v.x; });
    const clean = () => { stop(); offTiltC(); };

    const showEgg = () => {
      egg.textContent = c.p.get('insideJoke', 'Chào buổi sáng, người của em.'); egg.classList.add('on'); M.haptic('success'); M.tone('chime');
      M.tween(st.dawn, Math.max(st.dawn, .5), 500, 'out', v => { st.dawn = v; });
      clearTimeout(eggT); eggT = setTimeout(() => { egg.classList.remove('on'); if (!go && !drawing) M.tween(st.dawn, 0, 900, 'inOut', v => { st.dawn = v; }); }, 4200);
    };

    const wow = async () => {
      if (go) return; go = true; stage.classList.add('opening'); egg.classList.remove('on');
      M.requestTilt(); if (!music) { music = true; EA.music(); }
      M.haptic('tap'); M.tone('whoosh');
      const o0 = st.open, d0 = st.dawn;
      M.tween(0, 1, 1900, 'inOut', v => { st.open = lerp(o0, 1, v); st.blow = Math.sin(v * Math.PI) * .95; });
      M.tween(d0, 1, 2300, 'inOut', v => { st.dawn = v; });
      c.after(150, () => M.tween(0, 1, 1900, 'inOut', v => { st.sweep = v; }));
      c.after(700, () => { M.haptic('crack'); });
      c.after(1150, () => { vow.classList.add('on'); M.tone('click'); M.reveal(vow, { mode: 'write', stagger: 52 }).then(() => { M.haptic('success'); M.tone('chime'); }); });
      c.after(3500, () => { flash.classList.add('on'); });
      c.after(3850, () => { open(); startAmbient(); html.classList.add('mv-open'); c.after(900, clean); });
    };

    // swipe anywhere: the voile follows the finger, release past a third to let the wind take it
    let x0 = 0, y0 = 0, pid = null, moved = 0;
    const prog = ev => clamp(Math.max(Math.abs(ev.clientX - x0) / (stage.clientWidth * .5), Math.abs(ev.clientY - y0) / (stage.clientHeight * .3)));
    stage.addEventListener('pointerdown', ev => {
      if (go || ev.target.closest('.open-btn')) return;
      pid = ev.pointerId; x0 = ev.clientX; y0 = ev.clientY; moved = 0; drawing = true; stage.setPointerCapture?.(pid);
      if (!music) { music = true; EA.music(); M.requestTilt(); }
    });
    stage.addEventListener('pointermove', ev => {
      if (ev.pointerId !== pid || go) return;
      moved = prog(ev); st.open = moved * .42; st.dawn = moved * .45; st.blow = Math.min(.5, moved * 1.1);
      stage.classList.toggle('pulling', moved > .04);
    });
    const end = ev => {
      if (ev.pointerId !== pid) return; pid = null; drawing = false;
      if (go) return;
      if (moved > .34) { wow(); return; }
      if (moved < .03 && Math.hypot(ev.clientX - stage.getBoundingClientRect().left - sun.sx, ev.clientY - stage.getBoundingClientRect().top - sun.sy) < 70) showEgg();
      const o = st.open, d = st.dawn; stage.classList.remove('pulling');
      M.tween(1, 0, 600, 'out', k => { st.open = o * k; st.dawn = d * k; st.blow = st.blow * .9; });
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    q('.open-btn').addEventListener('click', wow, { once: true });
    if (c.reduced) { st.open = 0; }
  });

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const SUN = '<svg class="mv-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="4.2" fill="currentColor"/><path d="M12 3v3M4.5 7l2 2M19.5 7l-2 2M2 13h3M19 13h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M3 20h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const MOON = '<svg class="mv-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>';

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="mv-hero">
      <i class="mv-drape l" aria-hidden="true"></i><i class="mv-drape r" aria-hidden="true"></i>
      <div class="mv-hero-in">
        <p class="eyebrow">Buổi sáng chúng mình nói lời hứa</p>
        <div class="mv-arch"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><span class="mv-sunrise" aria-hidden="true"></span></div>
        <h1 class="mv-names"><span class="n">${e(cp.brideName).replace(' ', '&nbsp;')}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(cp.groomName).replace(' ', '&nbsp;')}</span></h1>
        <p class="headline">${c.t(nb(cp.headline))}</p>
        <p class="hero-date">${c.dow} · ${c.d}.${c.m}.${c.y}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="mv-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  EA.section('story', ({ esc: e, mod }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    return `<div class="wrap narrow">${head(e(mod.content.eyebrow || 'Chuyện tình'), e(mod.content.title || 'Chuyện của chúng mình'))}
      <ol class="mv-line">${chs.map(ch => `<li class="mv-ch"><span class="dot" aria-hidden="true"></span><p class="when">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(nb(ch.text))}</p>${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</li>`).join('')}</ol>
      ${mod.content.quote ? `<p class="story-quote">${e(nb(mod.content.quote))}</p>` : ''}</div>`;
  });

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="mv-curt" aria-hidden="true"><canvas></canvas><div class="mv-close"><p class="mv-seeyou">Hẹn gặp bạn<br>sáng hôm ấy</p><button class="btn ghost mv-pull" type="button" tabindex="-1">Kéo rèm lên</button></div></div>
    <div class="wrap narrow mv-thanks-in">
      ${SUN}
      <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
      <p class="mono">${e(D.monogram)}</p>
      <p>${e(nb(D.thanks))}</p>
      ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
      <p class="kicker">${dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Mở lại tấm rèm ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
    </div>`);

  // ---------- personality add-ons ----------
  function addSection(main, id, inner, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec mv-add m-${id}`; s.innerHTML = `<div class="wrap narrow">${inner}</div>`;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const AFTER = ['.m-story', '.m-saveDate', '.m-events'];

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    setTimeout(() => { if (cov.hidden) { startAmbient(); html.classList.add('mv-open'); } }, 80);

    // lời hứa viết tay của hai người
    const L = p.raw.letters || {};
    if (L.bride || L.groom) {
      const one = (who, name, txt) => txt ? `<article class="mv-vowcard"><p class="to">Lời hứa của ${e(name)}</p><p class="ink">${e(nb(txt))}</p><p class="sig">${e(name)}</p></article>` : '';
      const sec = addSection(main, 'vows', `${head('Hai lá thư buổi sáng', 'Lời hứa của chúng mình')}<div class="mv-vows">${one('bride', c.data.bride.short, L.bride)}${one('groom', c.data.groom.short, L.groom)}</div>`, AFTER);
      sec.querySelectorAll('.ink').forEach((n, i) => M.inView(n, () => M.reveal(n, { mode: 'write', stagger: 17, delay: i * 250 }), { threshold: .35 }));
    }

    // đồng hồ bình minh
    if (p.raw.metDate) {
      const pin = p.raw.metPin || { lat: 10.78, lng: 106.7 }, sr = sunrise(p.raw.metDate, pin.lat, pin.lng);
      const [yy, mm, dd] = p.raw.metDate.split('-'), met = p.raw.metTime && /^\d{1,2}:\d{2}$/.test(p.raw.metTime) ? +p.raw.metTime.split(':')[0] + +p.raw.metTime.split(':')[1] / 60 : null;
      const R0 = 92, pt = (h, r) => { const th = h / 24 * TAU + Math.PI; return [120 + r * Math.sin(th), 120 - r * Math.cos(th)]; };
      const arc = (a, b, r) => { const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r); return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${(b - a) > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
      const ticks = [0, 6, 12, 18].map(h => { const [x, y] = pt(h, R0 + 21); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${h}h</text>`; }).join('');
      const [hx, hy] = pt(sr.rise, R0);
      const sec = addSection(main, 'sunclock', `${head('Sáng hôm ấy', 'Đồng hồ bình minh')}
        <div class="mv-clock"><svg viewBox="0 0 240 240" role="img" aria-label="Mặt trời mọc lúc ${hhmm(sr.rise)} ngày ${+dd} tháng ${+mm} năm ${yy}">
          <circle cx="120" cy="120" r="${R0}" fill="none" stroke="var(--night)" stroke-width="12" opacity=".8"/>
          <path d="${arc(sr.rise, sr.set, R0)}" fill="none" stroke="var(--gold)" stroke-width="12" stroke-linecap="butt"/>
          ${ticks}
          <g class="hand"><line x1="120" y1="176" x2="120" y2="${120 + R0 - 17}" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/><circle cx="120" cy="${120 + R0 - 17}" r="4" fill="var(--ink)"/></g>
          <g class="sunmark" transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})"><circle r="12" fill="#fff6dc" stroke="var(--gold)" stroke-width="2"/><circle r="5.5" fill="var(--gold)"/></g>
          ${met != null ? (() => { const [mx, my] = pt(met, R0); return `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7" fill="var(--wine)" stroke="#fff" stroke-width="2"/>`; })() : ''}
        </svg><p class="mv-time" aria-hidden="true">00:00</p></div>
        <p class="mv-cap">Ngày ${+dd} tháng ${+mm} năm ${yy}, mặt trời mọc lúc <b>${hhmm(sr.rise)}</b>${p.has('metCity') ? ` ở ${e(p.get('metCity'))}` : ''}.${met != null ? ` Chúng mình gặp nhau lúc <b>${hhmm(met)}</b>.` : ''}</p>
        ${p.has('metPlace') ? `<p class="sub">Tại ${e(p.get('metPlace'))}.</p>` : ''}`, ['.m-vows', ...AFTER]);
      const hand = sec.querySelector('.hand'), mk = sec.querySelector('.sunmark'), tm = sec.querySelector('.mv-time'); mk.style.opacity = c.reduced ? 1 : 0;
      const setH = h => { hand.setAttribute('transform', `rotate(${(h / 24 * 360) + 180 - 180} 120 120)`); tm.textContent = hhmm(h); };
      hand.setAttribute('transform', 'rotate(0 120 120)'); tm.textContent = hhmm(sr.rise);
      if (!c.reduced) { setH(0); M.inView(sec, () => { M.haptic('tap'); M.tween(0, sr.rise, 2400, 'inOut', setH).then(() => { mk.style.transition = 'opacity .6s'; mk.style.opacity = 1; M.tone('chime'); M.haptic('success'); }); }, { threshold: .5 }); }
      else setH(sr.rise);
    }

    // hai nhịp sống
    const T = p.raw.traits || {}, tb = T.bride || {}, tg = T.groom || {};
    if (Object.keys(tb).length || Object.keys(tg).length) {
      const card = (name, t) => Object.keys(t).length ? `<article class="mv-rhythm">${t.rhythm === 'night' ? MOON : SUN}<h3>${e(name)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3>
        <p class="r">${t.rhythm === 'night' ? 'Cú đêm, thức cùng sao' : t.rhythm === 'morning' ? 'Dậy sớm đón bình minh' : ''}</p>
        <ul>${t.drink ? `<li><span>Ly buổi sáng</span>${e(t.drink)}</li>` : ''}${t.hobby ? `<li><span>Thích</span>${e(t.hobby)}</li>` : ''}</ul></article>` : '';
      addSection(main, 'rhythm', `${head('Hai nhịp sống', 'Một người đón nắng, một người giữ đêm')}<div class="mv-rhythms">${card(c.data.bride.short, tb)}${card(c.data.groom.short, tg)}</div>${p.has('pet') ? `<p class="sub">Và ${e(p.get('pet.name', ''))}${p.has('pet.kind') ? `, ${e(p.get('pet.kind'))} của nhà mình` : ''} cũng thức dậy cùng.</p>` : ''}`, ['.m-sunclock', '.m-vows', ...AFTER]);
    }

    // lời hỏi lúc bình minh
    if (p.has('proposal')) {
      const sec = addSection(main, 'dawnask', `${head('Lời hỏi lúc bình minh', 'Câu hỏi ấy')}<blockquote class="mv-ask">${e(nb(p.get('proposal')))}</blockquote>`, ['.m-rhythm', '.m-sunclock', '.m-vows', ...AFTER]);
      M.inView(sec, () => sec.classList.add('lit'), { threshold: .4 });
    }

    // rèm cuối thiệp
    const th = main.querySelector('.m-thanks'), cv = th?.querySelector('.mv-curt canvas');
    if (th && cv) {
      const draw = makeCurtain(cv), host = th.querySelector('.mv-curt'), S = { open: 1, blow: 0 };
      let on = false; const stop = () => { on = false; };
      M.loop(t => { if (host.clientWidth) draw(t, S.open, S.blow, 1); }, { el: host });
      const drawn = shut => { host.classList.toggle('shut', shut); host.setAttribute('aria-hidden', shut ? 'false' : 'true'); th.querySelector('.mv-pull').tabIndex = shut ? 0 : -1; };
      const close = async () => {
        if (on) return; on = true; drawn(true); M.tone('whoosh'); M.haptic('thud');
        await M.tween(1, 0, 1900, 'inOut', v => { S.open = v; S.blow = Math.sin(v * Math.PI) * .7; });
        M.tone('chime'); M.haptic('success'); stop();
      };
      th.querySelector('.mv-pull').addEventListener('click', async () => {
        M.tone('whoosh'); host.classList.remove('shut'); await M.tween(0, 1, 1500, 'inOut', v => { S.open = v; S.blow = Math.sin(v * Math.PI) * .6; }); drawn(false); html.classList.remove('mv-finale');
      });
      th.addEventListener('mv:close', close);
    }
  });

  // finale: after the RSVP the voile draws shut over the thank-you
  EA.onRsvp(() => {
    html.classList.add('mv-finale'); M.haptic('success');
    const th = document.getElementById('thanks');
    th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => th?.dispatchEvent(new Event('mv:close')), M.reduced ? 0 : 900);
  });
})();
