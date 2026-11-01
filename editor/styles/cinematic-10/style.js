// Seoul Rain Window: a K-drama rainy night seen through a fogged window. Wipe the glass, the city comes into focus.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const sc = n => Math.max(1, Math.round(M.scale(n)));
  const TAU = Math.PI * 2;
  const setTier = () => { html.dataset.srTier = M.tier; };
  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }

  // ---------- edge layer: rain on the page edges, then petals at the thanks ----------
  let edge = null, edgeCv = null;
  function setEdge(mode) {
    edge?.stop(); edge = null;
    if (mode === 'off') { if (edgeCv) edgeCv.style.opacity = 0; return; }
    if (!edgeCv) {
      edgeCv = Object.assign(document.createElement('canvas'), { className: 'sr-edge' });
      edgeCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(edgeCv);
    }
    edgeCv.style.opacity = 1;
    const petal = mode === 'petal';
    edge = M.particles(edgeCv, {
      count: petal ? 30 : 44,
      init(p, i, w, h) {
        const first = p.first === undefined; p.first = false;
        if (petal) {
          p.x = R(0, w); p.y = first ? R(0, h) : R(-30, -8); p.sz = R(6, 11); p.vy = R(.035, .075);
          p.ph = R(0, TAU); p.sw = R(.0007, .0016); p.rot = R(0, TAU); p.vr = R(-.0012, .0012); p.hue = R(335, 352); p.a = R(.55, .9);
        } else {
          const band = Math.min(w * .14, 150);
          p.x = Math.random() < .5 ? R(0, band) : R(w - band, w); p.y = first ? R(0, h) : R(-60, -10);
          p.len = R(14, 34); p.v = R(.7, 1.25); p.a = R(.12, .28) * (1 - Math.min(p.x, w - p.x) / band * .75);
        }
      },
      step(p, dt, w, h) {
        if (petal) { p.y += p.vy * dt; p.x += Math.sin(p.life * p.sw + p.ph) * .03 * dt; p.rot += p.vr * dt; return p.y < h + 20; }
        p.y += p.v * dt; p.x -= p.v * dt * .08; return p.y < h + 40;
      },
      draw(g, p) {
        if (petal) {
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = `hsla(${p.hue},78%,84%,${p.a})`;
          g.beginPath(); g.ellipse(0, 0, p.sz * .38, p.sz * .62, 0, 0, TAU); g.fill(); g.restore();
        } else {
          g.strokeStyle = `rgba(205,228,240,${p.a})`; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + p.len * .08, p.y - p.len); g.stroke();
        }
      }
    });
  }
  const afterOpen = () => { setTier(); html.classList.add('sr-open'); if (!html.classList.contains('sr-finale')) setEdge('rain'); };

  // ---------- the city behind the glass (canvas bokeh, sharpens with `focus`) ----------
  function makeCity(cv) {
    const g = cv.getContext('2d');
    const COL = ['240,168,189', '95,208,214', '255,184,102', '200,225,255', '255,120,150'];
    const lights = [], add = (n, y0, y1, r0, r1, a0, a1, sharp) => { for (let i = 0; i < sc(n); i++) lights.push({ x: R(0, 1), y: R(y0, y1), r: R(r0, r1), c: COL[Math.random() * COL.length | 0], a: R(a0, a1), ph: R(0, TAU), sp: R(.0005, .0014), sharp }); };
    add(9, .05, .7, .11, .18, .07, .15, 0);      // very large, faint, far away
    add(16, .1, .85, .045, .085, .18, .36, .1);   // medium soft discs
    add(44, .66, .97, .008, .028, .45, .85, .45); // street level: small, near-sharp
    const back = []; for (let x = -.02; x < 1;) { const w = R(.08, .17); back.push([x, w, R(.25, .55)]); x += w + R(0, .02); }
    const bld = []; for (let x = 0; x < 1;) {
      const w = R(.06, .13), win = []; for (let k = 0; k < 14; k++) win.push([R(.12, .78), R(.08, .92), Math.random() < .55]);
      bld.push({ x, w, h: R(.14, .42), win }); x += w;
    }
    return function render(t, focus) {
      const { w, h, dpr } = fit(cv, 1.25); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0b1116'); bg.addColorStop(.6, '#1a2730'); bg.addColorStop(1, '#2a3841');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      if (focus > .03) {
        g.globalAlpha = focus * .92;
        back.forEach(([x, bw, bh]) => { const gr = g.createLinearGradient(0, h - bh * h, 0, h); gr.addColorStop(0, '#16222a'); gr.addColorStop(1, '#0e171d'); g.fillStyle = gr; g.fillRect(x * w, h - bh * h, bw * w, bh * h); });
        bld.forEach(b => {
          const bx = b.x * w, bw = b.w * w + 1, bh = b.h * h; g.fillStyle = '#091014'; g.fillRect(bx, h - bh, bw, bh);
          b.win.forEach(([fx, fy, on]) => { if (on) { g.fillStyle = fy > .5 ? 'rgba(255,196,120,.75)' : 'rgba(240,168,189,.6)'; g.fillRect(bx + fx * bw, h - bh + fy * bh, 3, 4); } });
        });
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'lighter';
      const base = Math.min(w, h) * 1.4;
      lights.forEach(l => {
        const dx = Math.abs(l.x - .5) / .5, dy = Math.abs(l.y - .47) / .2, att = 1 - .6 * Math.max(0, 1 - dy) * Math.max(0, 1 - dx * .75);
        const a = l.a * att * (.78 + .22 * Math.sin(t * l.sp + l.ph)), rad = l.r * base, x = l.x * w, y = l.y * h;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad), s = Math.min(.9, .2 + .65 * focus + l.sharp * (1 - focus));
        gr.addColorStop(0, `rgba(${l.c},${a * .8})`); gr.addColorStop(s, `rgba(${l.c},${a * .6})`);
        gr.addColorStop(.93, `rgba(${l.c},${a * (.1 + .7 * focus + l.sharp * .5)})`); gr.addColorStop(1, `rgba(${l.c},0)`);
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      });
      g.globalCompositeOperation = 'source-over';
    };
  }

  // ---------- raindrops on the glass: static beads that grow, merge and run, leaving trails ----------
  function makeRain(cv, cityCv, fogApi) {
    const g = cv.getContext('2d'), refr = M.tier !== 'low', beads = [], runs = [];
    let S = fit(cv, 1.5);
    const bead = (x, y, r) => beads.push({ x: x ?? R(0, S.w), y: y ?? R(0, S.h), r: r ?? R(1.3, 4) });
    for (let i = 0; i < sc(70); i++) bead();
    const run = b => runs.push({ x: b.x, y: b.y, r: b.r, hold: 0, left: R(30, 120), tr: [[b.x, b.y]] });
    function draw(x, y, r, el) {
      const ry = r * el;
      if (refr && r > 4) {   // the drop is a tiny lens: an upside-down piece of the city
        const k = cityCv.width / S.w; g.save(); g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, TAU); g.clip(); g.translate(x, y); g.scale(1, -1);
        g.drawImage(cityCv, (x - r * 2.2) * k, (y - ry * 2.2) * k, r * 4.4 * k, ry * 4.4 * k, -r, -ry, 2 * r, 2 * ry);
        g.fillStyle = 'rgba(170,200,215,.16)'; g.fillRect(-r, -ry, 2 * r, 2 * ry); g.restore();
      }
      g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, TAU); g.fill();
      g.lineWidth = .9; g.strokeStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(x, y, r * .92, ry * .92, 0, .15 * Math.PI, .85 * Math.PI); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y, r, ry, 0, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(x - r * .35, y - ry * .4, Math.max(.6, r * .17), 0, TAU); g.fill();
    }
    return function frame(dt) {
      S = fit(cv, 1.5); g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); g.clearRect(0, 0, S.w, S.h);
      if (beads.length < sc(70) && Math.random() < .25) bead();
      for (let i = beads.length - 1; i >= 0; i--) {
        const b = beads[i]; b.r += dt * .00035 * Math.random();
        if (b.r > 5.6 && runs.length < sc(14)) { run(b); beads.splice(i, 1); }
      }
      for (let i = runs.length - 1; i >= 0; i--) {
        const d = runs[i];
        if (d.hold > 0) d.hold -= dt;
        else {
          const v = (.02 + d.r * .012) * dt; d.y += v; d.x += R(-.12, .12); d.left -= v;
          if (d.tr.length === 0 || d.y - d.tr[d.tr.length - 1][1] > 5) d.tr.push([d.x, d.y]);
          if (d.tr.length > 26) d.tr.shift();
          if (d.left <= 0) { d.hold = R(150, 800); d.left = R(30, 130); if (d.r > 3.2) { d.r *= .985; bead(d.x + R(-1, 1), d.y - d.r * 2, R(1, 1.8)); } }
          fogApi.clear(d.x, d.y, d.r);
          if (d.y > S.h + 30) { runs.splice(i, 1); continue; }
        }
        for (let j = beads.length - 1; j >= 0; j--) {   // eat beads on the way
          const b = beads[j]; if (Math.hypot(b.x - d.x, b.y - d.y) < d.r + b.r) { d.r = Math.min(10.5, Math.sqrt(d.r * d.r + b.r * b.r * .8)); beads.splice(j, 1); }
        }
        for (let j = i - 1; j >= 0; j--) {
          const o = runs[j]; if (Math.hypot(o.x - d.x, o.y - d.y) < d.r + o.r - 1) { o.r = Math.min(10.5, Math.sqrt(o.r * o.r + d.r * d.r)); runs.splice(i, 1); break; }
        }
      }
      g.lineCap = g.lineJoin = 'round';
      runs.forEach(d => {
        if (d.tr.length > 1) {
          g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = Math.max(1.4, d.r * .8); g.beginPath(); g.moveTo(d.tr[0][0], d.tr[0][1]);
          d.tr.forEach(p => g.lineTo(p[0], p[1])); g.stroke();
        }
      });
      beads.forEach(b => draw(b.x, b.y, b.r, 1));
      runs.forEach(d => draw(d.x, d.y, d.r, 1.35));
    };
  }

  // rough heart detection: a closed loop of bounded size, widest near the top, pointing down
  function isHeart(p) {
    if (p.length < 18) return false;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, len = 0;
    p.forEach((q, i) => {
      x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
      if (i) len += Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]);
    });
    const w = x1 - x0, h = y1 - y0;
    if (w < 70 || h < 60 || w > Math.min(innerWidth, 560) || h > Math.min(innerHeight, 560) || w / h > 1.9 || h / w > 1.9) return false;
    const e = p[p.length - 1];
    if (Math.hypot(e[0] - p[0][0], e[1] - p[0][1]) > Math.max(w, h) * .38 || len < (w + h) * 1.5) return false;
    const low = p.reduce((a, q) => q[1] > a[1] ? q : a, p[0]);
    if (Math.abs(low[0] - (x0 + x1) / 2) > w * .25) return false;
    const spread = (a, b) => { let lo = 1e9, hi = -1e9; p.forEach(q => { const t = (q[1] - y0) / h; if (t >= a && t <= b) { lo = Math.min(lo, q[0]); hi = Math.max(hi, q[0]); } }); return hi > lo ? hi - lo : 0; };
    return spread(.1, .45) > spread(.75, 1) * 1.4;
  }

  // ---------- cover: the fogged window ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier(); el.classList.remove('sr-lift');
    el.innerHTML = `<div class="sr-stage">
      <canvas class="sr-city" aria-hidden="true"></canvas>
      <div class="sr-txt">
        <p class="sr-to">Gửi ${e(c.guest)}</p>
        <h1 class="sr-names dim"><span class="n n1">${e(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n n2">${e(D.groom.name)}</span></h1>
        <p class="sr-dow">${c.dow}</p>
        <p class="sr-neon">${c.d} · ${c.m} · ${c.y}</p>
      </div>
      <canvas class="sr-fog" aria-hidden="true"></canvas>
      <canvas class="sr-rain" aria-hidden="true"></canvas>
      <div class="sr-wiper" aria-hidden="true"></div>
      <div class="sr-frame" aria-hidden="true"></div>
      <p class="sr-egg" role="status"></p>
      <div class="sr-ui"><p class="sr-hint">Lau kính để nhìn rõ hơn</p><button class="open-btn" type="button">Mở cửa sổ</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.sr-stage'), cityCv = q('.sr-city'), fogCv = q('.sr-fog'), rainCv = q('.sr-rain');
    const fg = fogCv.getContext('2d'), wiperEl = q('.sr-wiper'), egg = q('.sr-egg');
    let focus = 0, fogOn = true, go = false, music = false, drawing = false, pts = [], eggT = 0, refogT = 0, refogN = 0;

    const paintFog = () => {
      fit(fogCv, 1.25); const w = fogCv.width, h = fogCv.height, k = w / fogCv.clientWidth;
      fg.setTransform(1, 0, 0, 1, 0, 0); fg.globalCompositeOperation = 'source-over'; fg.clearRect(0, 0, w, h);
      const gr = fg.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(160,182,196,.5)'); gr.addColorStop(.55, 'rgba(150,172,186,.56)'); gr.addColorStop(1, 'rgba(122,146,160,.66)');
      fg.fillStyle = gr; fg.fillRect(0, 0, w, h);
      for (let i = 0; i < sc(7); i++) {   // uneven condensation clouds
        const x = R(0, w), y = R(0, h), r = R(.2, .45) * Math.max(w, h) * .5, cl = fg.createRadialGradient(x, y, 0, x, y, r);
        cl.addColorStop(0, 'rgba(225,238,245,.1)'); cl.addColorStop(1, 'rgba(225,238,245,0)'); fg.fillStyle = cl; fg.fillRect(x - r, y - r, r * 2, r * 2);
      }
      const nt = document.createElement('canvas'); nt.width = nt.height = 128; const ng = nt.getContext('2d'), id = ng.createImageData(128, 128);
      for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = Math.random() * 34; }
      ng.putImageData(id, 0, 0); fg.fillStyle = fg.createPattern(nt, 'repeat'); fg.fillRect(0, 0, w, h);
      for (let i = 0; i < sc(520); i++) { fg.fillStyle = `rgba(255,255,255,${R(.03, .09)})`; fg.beginPath(); fg.arc(R(0, w), R(0, h), R(.8, 2.6) * k, 0, TAU); fg.fill(); }
    };
    paintFog();
    const fogApi = {
      clear(x, y, r) {   // running drops leave a clear track in the fog
        if (!fogOn) return;
        const k = fogCv.width / fogCv.clientWidth; fg.save(); fg.globalCompositeOperation = 'destination-out'; fg.fillStyle = 'rgba(0,0,0,.3)';
        fg.beginPath(); fg.ellipse(x * k, y * k, r * 1.1 * k, r * 1.7 * k, 0, 0, TAU); fg.fill(); fg.restore();
      }
    };

    const city = makeCity(cityCv), rain = makeRain(rainCv, cityCv, fogApi);
    const stopLoop = M.loop((t, dt) => {
      if (!cityCv.clientWidth) return;
      city(t, focus); rain(dt);
      if (fogOn && !go && refogN < 60 && t - refogT > 700) {   // wiped glass slowly mists over again
        refogT = t; refogN++; fg.save(); fg.globalCompositeOperation = 'source-over'; fg.fillStyle = 'rgba(140,162,176,.012)'; fg.fillRect(0, 0, fogCv.width, fogCv.height); fg.restore();
      }
    }, { el: stage });
    const offTilt = M.tilt(v => { cityCv.style.transform = `translate(${v.x * -9}px,${v.y * -7}px) scale(1.06)`; });
    const onResize = () => { if (fogOn && !go) paintFog(); };
    addEventListener('resize', onResize);
    const cleanup = () => { stopLoop(); offTilt(); removeEventListener('resize', onResize); };

    // soft brush halo around the kit's hard wipe stroke
    const toFog = ev => { const r = fogCv.getBoundingClientRect(); return [(ev.clientX - r.left) * fogCv.width / r.width, (ev.clientY - r.top) * fogCv.height / r.height]; };
    const halo = (x, y) => {
      const k = fogCv.width / fogCv.clientWidth, rad = 78 * k, gr = fg.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      fg.save(); fg.globalCompositeOperation = 'destination-out'; fg.fillStyle = gr; fg.beginPath(); fg.arc(x, y, rad, 0, TAU); fg.fill(); fg.restore();
    };
    const showEgg = () => {
      egg.textContent = c.p.get('insideJoke', 'Saranghae'); egg.classList.add('on'); M.haptic('success'); M.tone('chime');
      clearTimeout(eggT); eggT = setTimeout(() => egg.classList.remove('on'), 4200);
    };

    // the wow
    const sweep = () => new Promise(res => {
      const W = fogCv.width, H = fogCv.height, px = W / 2, py = H * 1.04, len = Math.hypot(W, H) * 1.05;
      wiperEl.style.height = len / (W / fogCv.clientWidth) + 'px'; wiperEl.classList.add('on');
      let prev = -1.45;
      M.tween(-1.45, 1.45, 1000, 'inOut', a => {
        fg.save(); fg.globalCompositeOperation = 'destination-out'; fg.fillStyle = '#000'; fg.beginPath(); fg.moveTo(px, py);
        fg.lineTo(px + Math.sin(prev - .015) * len, py - Math.cos(prev - .015) * len); fg.lineTo(px + Math.sin(a) * len, py - Math.cos(a) * len); fg.closePath(); fg.fill(); fg.restore();
        wiperEl.style.transform = `rotate(${Math.PI + a}rad)`; prev = a;
      }).then(() => { wiperEl.classList.remove('on'); res(); });
    });
    const flip = () => {   // the neon date flies from the cover into the hero
      const src = q('.sr-neon'), dst = document.querySelector('.sr-hero .sr-neon');
      if (!dst || c.reduced) return;
      const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect(), k = src.cloneNode(true);
      dst.style.visibility = 'hidden'; src.style.visibility = 'hidden'; k.className = 'sr-neon on steady';
      Object.assign(k.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 60, transformOrigin: '0 0', transition: 'transform .68s cubic-bezier(.7,0,.3,1)', pointerEvents: 'none' });
      document.body.appendChild(k); void k.offsetWidth;
      k.style.transform = `translate(${b.left - a.left}px,${b.top - a.top}px) scale(${b.width / a.width},${b.height / a.height})`;
      setTimeout(() => { dst.style.visibility = ''; k.remove(); }, 720);
    };
    const wow = async viaButton => {
      if (go) return; go = true; wp.off(); stage.classList.add('clearing');
      M.requestTilt(); if (!music) { music = true; EA.music(); }
      M.haptic('tap'); M.tone('whoosh');
      if (viaButton && !c.reduced) await sweep();
      wp.reveal(); setTimeout(() => { fogOn = false; }, 560);
      M.tween(0, 1, 1500, 'out', v => { focus = v; });
      const n1 = q('.n1'), n2 = q('.n2'), names = q('.sr-names');
      c.after(250, () => { names.classList.remove('dim'); M.reveal(n1, { mode: 'write', stagger: 65 }); M.reveal(n2, { mode: 'write', stagger: 65, delay: 380 }); });
      c.after(1300, () => { q('.sr-neon').classList.add('on'); M.haptic('success'); M.tone('click'); });
      c.after(2300, () => { el.classList.add('sr-lift'); open(); afterOpen(); flip(); c.after(900, cleanup); });
    };
    const wp = M.wipe(fogCv, { radius: 34, done: .45, onProgress: p => { if (p > .1) stage.classList.add('wiping'); if (p >= .45) wow(false); } });

    fogCv.addEventListener('pointerdown', ev => {
      if (go) return;
      if (!music) { music = true; EA.music(); M.requestTilt(); }
      drawing = true; pts = [[ev.clientX, ev.clientY]]; stage.classList.add('wiping'); M.haptic('tap'); halo(...toFog(ev));
    });
    fogCv.addEventListener('pointermove', ev => {
      if (!drawing || go) return;
      if (pts.length < 600) pts.push([ev.clientX, ev.clientY]);
      halo(...toFog(ev));
    });
    const up = () => { if (drawing && !go && isHeart(pts)) showEgg(); drawing = false; };
    fogCv.addEventListener('pointerup', up); fogCv.addEventListener('pointercancel', up);
    q('.open-btn').addEventListener('click', () => wow(true), { once: true });
    if (c.reduced) { paintFog(); focus = 0; }
  });

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const UMB = '<svg class="sr-umb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 18 0c-1.5-1.3-3-1.3-4.5 0-1.5-1.3-3-1.3-4.5 0-1.5-1.3-3-1.3-4.5 0C6 10.700 4.500 10.700 3 12z" fill="currentColor"/><path d="M12 12v6.500a1.800 1.800 0 0 1-3.600 0M12 3V2" fill="none" stroke="currentColor" stroke-width="1.400" stroke-linecap="round"/></svg>';

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="sr-hero">
      <img class="sr-hero-img" src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high">
      <div class="sr-hero-in">
        ${UMB}
        <p class="eyebrow">Ngoài kia mưa rơi, trong này có chúng mình</p>
        <h1 class="sr-names"><span class="n">${e(cp.brideName)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(cp.groomName)}</span></h1>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="sr-neon on steady">${c.d} · ${c.m} · ${c.y}</p>
        <p class="hero-date">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="sr-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div>
    </div>`;
  });

  // "Tập phim": story chapters as drama episodes
  EA.section('story', ({ esc: e, mod, d, m, y }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    const card = (i, ch) => `<article class="sr-ep" style="--i:${i % 3}">
      <div class="still"><span class="shade"></span>${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}<span class="ep-no">Tập ${i + 1}</span><span class="ep-rec">${e(ch.date)}</span></div>
      <div class="ep-body"><h3>Tập ${i + 1}: ${e(ch.title)}</h3><p>${e(ch.text)}</p></div></article>`;
    return `<div class="wrap">
      ${head('Tập phim của chúng mình', e(mod.content.title || 'Chuyện của chúng mình'))}
      <div class="sr-eps">${chs.map((ch, i) => card(i, ch)).join('')}
        <article class="sr-ep final"><div class="ep-body"><p class="ep-fin-t">Tập cuối</p><h3>Tập cuối: ${+d} tháng ${+m}, ${y}</h3><p>Có bạn trong khung hình thì mới trọn vẹn.</p></div></article>
      </div>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
    </div>`;
  });

  // "Mang ô cho bạn": RSVP with an umbrella that opens when the guest says yes
  EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
    ${head('Mang ô cho bạn', 'Bạn sẽ đến chứ?', 'Chúng mình đã chuẩn bị ô cho bạn')}
    <div class="sr-umb" aria-hidden="true"><svg viewBox="0 0 200 160">
      <defs><linearGradient id="srU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c0d0"/><stop offset="1" stop-color="#d9708f"/></linearGradient></defs>
      <path class="stick" d="M100 70V128a13 13 0 0 1-26 0" fill="none" stroke="#dce4e8" stroke-width="4" stroke-linecap="round"/>
      <g class="canopy"><path d="M12 74Q22 14 100 8Q178 14 188 74Q166 62 144 74Q122 62 100 74Q78 62 56 74Q34 62 12 74Z" fill="url(#srU)"/>
      <path d="M100 8V74M100 8Q66 22 56 74M100 8Q134 22 144 74" fill="none" stroke="rgba(32,42,49,.35)" stroke-width="1.500"/></g>
      <g class="rain-in"><path d="M20 20v14M44 6v14M156 6v14M180 24v14" stroke="#cfe3ee" stroke-width="2" stroke-linecap="round"/></g></svg></div>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="wrap narrow">
    ${UMB}
    <p class="eyebrow">Cảm ơn bạn</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Nhìn lại ô cửa sổ ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);

  // ---------- add-ons that need personality data ----------
  function addSection(main, id, html, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec sr-add m-${id}`; s.innerHTML = html;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else main.querySelector('.m-rsvp') ? main.querySelector('.m-rsvp').before(s) : main.appendChild(s);
    return s;
  }
  const rainySeasons = (a, b) => {   // May-Nov overlapping [a, b]; dry = Dec-Apr
    let rain = 0, dry = 0;
    for (let Y = a.getFullYear() - 1; Y <= b.getFullYear() + 1; Y++) {
      if (new Date(Y, 4, 1) <= b && new Date(Y, 10, 30) >= a) rain++;
      if (new Date(Y - 1, 11, 1) <= b && new Date(Y, 3, 30) >= a) dry++;
    }
    return [rain, dry];
  };

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    setTimeout(() => { if (cov.hidden) afterOpen(); }, 80);

    if (p.daysTogether != null) {
      const city = p.get('metCity', ''), place = /h[oồ] chí minh|sài gòn|hcm/i.test(city) ? 'Sài Gòn' : city;
      const [rs, ds] = rainySeasons(new Date(`${p.raw.metDate}T12:00:00+07:00`), new Date(`${c.config.couple.weddingDate}T12:00:00+07:00`));
      const sec = addSection(main, 'days', `<div class="wrap narrow">
        ${head('Ngày mưa và nắng', 'Từ cơn mưa năm ấy')}
        <p class="sr-days" aria-label="${p.daysTogether} ngày, qua bao mùa mưa ${e(place)}"><b data-n="${p.daysTogether}">0</b><span> ngày, qua bao mùa mưa ${e(place)}</span></p>
        <ul class="sr-seasons"><li>${UMB}<b>${rs}</b> mùa mưa</li><li><svg class="sr-umb-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.500" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg><b>${ds}</b> mùa nắng</li></ul>
        ${p.has('metPlace') ? `<p class="sub">Bắt đầu từ ${e(p.get('metPlace'))}.</p>` : ''}
      </div>`, ['.m-story', '.m-saveDate', '.m-events']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => { M.tween(0, p.daysTogether, 2000, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }); });
    }

    if (p.has('song.title')) {
      const lyric = p.get('song.lyric', ''), tag = `${EA.icon('note')} ${e(p.get('song.title'))}${p.has('song.artist') ? ` — ${e(p.get('song.artist'))}` : ''}`;
      const sec = addSection(main, 'ost', `<div class="wrap narrow">
        ${head('OST của chúng mình', 'Bài hát của hai đứa')}
        <div class="sr-screen"><span class="bk b1"></span><span class="bk b2"></span><span class="bk b3"></span>
          <p class="ost-tag">${tag}</p>
          <p class="sr-sub" aria-live="polite">${lyric ? e(lyric) : ''}</p></div>
        <button class="btn" type="button" data-ost>${EA.icon('play')} Bật nhạc</button>
      </div>`, ['.m-days', '.m-story', '.m-saveDate', '.m-events']);
      const sub = sec.querySelector('.sr-sub');
      const type = () => { if (!lyric) return; sub.textContent = lyric; sub.classList.remove('ea-mo-on'); M.reveal(sub, { mode: 'letters', stagger: 45 }); };
      M.inView(sec, type, { threshold: .5 });
      sec.querySelector('[data-ost]').addEventListener('click', ev => { EA.music(); M.tone('pop'); M.haptic('tap'); ev.currentTarget.innerHTML = `${EA.icon('note')} Đang phát`; type(); });
    }

    main.querySelectorAll('form.rsvp-form').forEach(form => form.addEventListener('change', () => {
      const yes = form.attending.value === 'yes', u = main.querySelector('.sr-umb');
      if (u && u.classList.contains('open') !== yes) { u.classList.toggle('open', yes); if (yes) { M.tone('pop'); M.haptic('tap'); } }
    }));

    const th = main.querySelector('.m-thanks');
    if (th) {
      th.insertAdjacentHTML('afterbegin', '<div class="sr-dawn" aria-hidden="true"></div>');
      M.inView(th, () => { setEdge('petal'); html.classList.add('sr-petals'); }, { threshold: .4 });
    }
  });

  // finale: the rain stops, dawn comes up behind the thank-you
  EA.onRsvp(() => {
    html.classList.add('sr-finale'); setEdge('off'); M.haptic('success'); M.tone('chime');
    const th = document.getElementById('thanks');
    setTimeout(() => th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 900);
  });
})();
