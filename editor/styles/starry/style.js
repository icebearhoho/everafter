// Ngưu Lang Chức Nữ: a night sky split by the Milky Way. Drag across it to call the magpies; they build the bridge,
// the two stars cross it and meet. Add-ons: guests' magpies, days on the two banks, Thất tịch of the wedding.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / .5;
  // quadratic bezier helpers (bridge arcs)
  const Q = (A, K, B, t) => [(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * K[0] + t * t * B[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * K[1] + t * t * B[1]];
  const dQ = (A, K, B, t) => [2 * (1 - t) * (K[0] - A[0]) + 2 * t * (B[0] - K[0]), 2 * (1 - t) * (K[1] - A[1]) + 2 * t * (B[1] - K[1])];

  // The magpie: a luminous silhouette facing right, origin (0,0) = shoulder so the wings can flap around it.
  const BIRD = `<svg class="bird-svg" viewBox="-32 -26 58 40" aria-hidden="true" focusable="false">
    <g class="wing far"><path d="M-3 -1C-8-11 -1-20 13-23C11-14 8-6 5 0Z"/></g>
    <path class="tail" d="M-9 3L-27 10.5L-25.5 13.5L-11 9.5Z"/>
    <path class="body" d="M-12 3C-10-3-4-7 4-7C6-12 14-13 16-8L23-6.2L16.5-4.4C17 0 14 6 8 9C2 11-7 9-12 3Z"/>
    <path class="belly" d="M-6 6C0 9 8 8 13 2C14 0 15-2 15-3C10 0 2 1-6 6Z"/>
    <circle class="eye" cx="14.4" cy="-7.6" r="1"/>
    <g class="wing near"><path d="M-2-2C-6-12 2-21 17-23C13-14 10-6 6-1Z"/></g>
  </svg>`;
  const bird = cls => `<div class="bird ${cls || ''}"><div class="bird-in">${BIRD}</div></div>`;
  // heading transform for a bird at (x, y) moving along (vx, vy); tilt < 1 calms the rotation when perched
  const orient = (vx, vy, s, tilt = 1) => {
    const fx = vx >= 0 ? 1 : -1, a = fx > 0 ? Math.atan2(vy, vx) : Math.atan2(-vy, -vx);
    return `rotate(${(a * tilt).toFixed(3)}rad) scale(${fx * s},${s})`;
  };
  const pose = (x, y, vx, vy, s, tilt = 1, ay = 50) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-${ay}%) ${orient(vx, vy, s, tilt)}`;

  // Hold on a star → the inside joke appears as a tiny constellation caption.
  let eggEl = null;
  const showEgg = (anchor, text, c) => {
    eggEl?.remove();
    const r = anchor.getBoundingClientRect(), mo = c.motion;
    const d = document.createElement('div');
    d.className = 'egg'; d.setAttribute('role', 'status');
    d.innerHTML = `<svg viewBox="0 0 120 34" aria-hidden="true"><polyline points="4,26 34,10 62,22 94,6 116,18"/>${[[4, 26], [34, 10], [62, 22], [94, 6], [116, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</svg><p></p>`;
    d.querySelector('p').textContent = text;
    document.body.appendChild(d);
    const w = Math.min(280, innerWidth - 32);
    d.style.width = w + 'px';
    const left = clamp(r.left + r.width / 2 - w / 2, 16, innerWidth - w - 16);
    const h = d.offsetHeight, top = r.top - h - 14 > 12 ? r.top - h - 14 : r.bottom + 14;
    d.style.left = left + 'px'; d.style.top = top + 'px';
    requestAnimationFrame(() => d.classList.add('on'));
    mo.haptic('success'); mo.tone('chime');
    eggEl = d;
    const off = () => { d.classList.remove('on'); setTimeout(() => d.remove(), 500); removeEventListener('pointerdown', off, true); };
    setTimeout(() => addEventListener('pointerdown', off, true), 400);
    setTimeout(off, 7000);
  };
  const armEgg = (btn, c) => {
    const joke = c.p.get('insideJoke');
    if (!joke || !btn) return;
    c.motion.hold(btn, 1500, {
      onProgress: p => btn.style.setProperty('--p', p),
      onDone: () => { btn.style.setProperty('--p', 0); showEgg(btn, joke, c); }
    });
  };

  // =====================================================================================================
  // COVER
  // =====================================================================================================
  EA.cover((el, c, open) => {
    const { data: D, esc: e, motion: mo } = c;
    const N = 9;
    const hasJoke = c.p.has('insideJoke');
    const glyphW = '<svg viewBox="0 0 24 24" class="gl" aria-hidden="true"><path d="M2.5 12C7 6.5 17 6.5 21.5 12C17 17.5 7 17.5 2.5 12Z"/><path d="M6 12H18"/></svg>';
    const glyphC = '<svg viewBox="0 0 24 24" class="gl" aria-hidden="true"><path d="M4.5 5C4.5 11 8 14 12 14S19.5 11 19.5 5"/><path d="M12 14V20"/><path d="M9 20H15"/></svg>';
    el.innerHTML = `
      <div class="sk${mo.tier === 'low' ? ' lite' : ''}">
        <div class="sk-glow" aria-hidden="true"><i></i><i></i><i></i></div>
        <canvas class="sk-cv ea-mo-canvas" aria-hidden="true"></canvas>
        <div class="sk-drag" aria-hidden="true"></div>
        <div class="sk-stage">
          <svg class="sk-svg" aria-hidden="true">
            <defs>
              <radialGradient id="skh"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".22" stop-color="#ffefb8" stop-opacity=".55"/><stop offset="1" stop-color="#e8d9a8" stop-opacity="0"/></radialGradient>
            </defs>
            <path class="sk-ghost" pathLength="1"/>
            <path class="sk-bridge" pathLength="1"/>
            <g class="sk-ticks"></g>
          </svg>
          <i class="sk-finger" aria-hidden="true"></i>
          <div class="sk-birds"></div>
          <svg class="sk-svg top" aria-hidden="true">
            <g class="sk-star a"><circle class="halo" r="38" fill="url(#skh)"/><path class="spk" d="M0-19L2.4-2.4L19 0L2.4 2.4L0 19L-2.4 2.4L-19 0L-2.4-2.4Z"/><circle r="4.6" fill="#fff"/></g>
            <g class="sk-star b"><circle class="halo" r="38" fill="url(#skh)"/><path class="spk" d="M0-19L2.4-2.4L19 0L2.4 2.4L0 19L-2.4 2.4L-19 0L-2.4-2.4Z"/><circle r="4.6" fill="#fff"/></g>
            <g class="sk-star m"><circle class="halo" r="60" fill="url(#skh)"/><path class="spk" d="M0-30L3.4-3.4L30 0L3.4 3.4L0 30L-3.4 3.4L-30 0L-3.4-3.4Z"/><circle r="6.5" fill="#fff"/></g>
          </svg>
          <div class="sk-lab a">${glyphW}<b>${e(D.bride.short)}</b><small>Chức Nữ</small></div>
          <div class="sk-lab b">${glyphC}<b>${e(D.groom.short)}</b><small>Ngưu Lang</small></div>
          ${hasJoke ? '<button class="sk-hit" type="button" aria-label="Giữ lâu vào ngôi sao để xem điều bí mật"></button>' : ''}
          <div class="sk-bloom" aria-hidden="true"></div>
        </div>
        <header class="sk-title">
          <p class="sk-eye">Ngưu Lang · Chức Nữ</p>
          <h1 class="sk-names"><span>${e(D.bride.short)}</span> <i>&amp;</i> <span>${e(D.groom.short)}</span></h1>
          <p class="sk-to">Gửi ${e(c.guest)}</p>
        </header>
        <p class="sk-vow" aria-live="polite">Mỗi năm một lần — từ nay là mãi mãi</p>
        <div class="sk-foot">
          <p class="sk-date">${c.dateText}</p>
          <p class="sk-hint">Kéo để gọi đàn ô thước</p>
          <button class="open-btn" type="button">Bắc cầu</button>
        </div>
      </div>`;
    const $ = s => el.querySelector(s);
    const sk = $('.sk'), cv = $('.sk-cv'), stage = $('.sk-stage'), svg = $('.sk-svg'), dragEl = $('.sk-drag');
    const birds = $('.sk-birds'), bridge = $('.sk-bridge'), ghost = $('.sk-ghost'), ticks = $('.sk-ticks');
    const stA = $('.sk-star.a'), stB = $('.sk-star.b'), stM = $('.sk-star.m');
    const labA = $('.sk-lab.a'), labB = $('.sk-lab.b'), bloom = $('.sk-bloom'), vow = $('.sk-vow'), hit = $('.sk-hit'), finger = $('.sk-finger');
    const glow = $('.sk-glow');

    // ----- geometry: the river runs diagonally, the two stars sit on its banks, the bridge arches between them
    const G = { W: 0, H: 0, L: 0, sigma: 50, R: 150, th: 0, C: [0, 0], u: [0, -1], n: [1, 0], A: [0, 0], B: [0, 0], K: [0, 0] };
    const slots = [];
    const order = [];
    for (let i = 0; i < N; i++) order.push(i % 2 ? N - 1 - (i >> 1) : i >> 1);   // banks first, meeting in the middle
    const state = { called: 0, landed: 0, done: false, travel: null };
    const placed = [];                                  // landed birds: {el, slot}
    const star = (g, x, y, s = 1) => g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`);
    const geo = () => {
      const r = sk.getBoundingClientRect(); if (!r.width) return;
      const W = r.width, H = r.height, portrait = W < H * .95;
      const th = (portrait ? -72 : -60) * Math.PI / 180;
      const u = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
      const C = [W * .5, H * (portrait ? .5 : .56)];
      const R = portrait ? Math.min(W * .36, 170) : Math.min(W * .2, 300, H * .3);
      const A = [C[0] - n[0] * R, C[1] - n[1] * R], B = [C[0] + n[0] * R, C[1] + n[1] * R];
      const off = R * 1.3;
      const K = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - off];
      Object.assign(G, { W, H, th, u, n, C, R, A, B, K, L: Math.hypot(W, H) * .62, sigma: R * .32 });
      stage.querySelectorAll('.sk-svg').forEach(v => v.setAttribute('viewBox', `0 0 ${W} ${H}`));
      const d = `M${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${K[0].toFixed(1)} ${K[1].toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
      bridge.setAttribute('d', d); ghost.setAttribute('d', d);
      finger.style.offsetPath = `path("${d}")`;
      slots.length = 0;
      for (let i = 0; i < N; i++) slots.push(.085 + .83 * i / (N - 1));
      ticks.innerHTML = slots.map(t => { const [x, y] = Q(A, K, B, t); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7"/>`; }).join('');
      ticks.querySelectorAll('circle').forEach((ci, i) => { if (placed.some(b => b.slot === i)) ci.style.opacity = 0; });
      if (!state.travel) { star(stA, ...A); star(stB, ...B); }
      const mid = Q(A, K, B, .5);
      star(stM, mid[0], mid[1] - 16);
      const bw = clamp(Math.hypot(...dQ(A, K, B, .5)) / 2 / (N - 1) * 1.95, 44, 98);
      stage.style.setProperty('--bw', bw.toFixed(1) + 'px');
      labA.style.cssText = `left:${A[0]}px;top:${A[1] + 26}px`; labB.style.cssText = `left:${B[0]}px;top:${B[1] + 26}px`;
      if (hit) hit.style.cssText = `left:${B[0]}px;top:${B[1]}px`;
      bloom.style.cssText = `left:${mid[0]}px;top:${mid[1] - 16}px`;
      vow.style.top = `${Math.min(H - 190, Math.max(mid[1] + 70, H * .62))}px`;
      const bandW = R * 1.55, bandL = G.L * 2.2;
      glow.style.cssText = `width:${bandW}px;height:${bandL}px;left:${C[0] - bandW / 2}px;top:${C[1] - bandL / 2}px;transform:rotate(${th * 180 / Math.PI + 90}deg)`;
      placed.forEach(b => { const p = slotPose(b.slot); b.el.style.transform = p; });
    };
    const slotPose = i => {
      const t = slots[i], [x, y] = Q(G.A, G.K, G.B, t), [vx, vy] = dQ(G.A, G.K, G.B, t), dir = t < .5 ? 1 : -1;
      return pose(x, y, vx * dir, vy * dir, 1, .28, 78);
    };

    // ----- canvas: the Milky Way as layered particles + twinkling field stars; sparks for the ceremony
    let tl = { x: 0, y: 0 };
    const COLS = ['255,255,255', '206,218,255', '255,236,196', '196,176,255', '168,200,255'];
    let burstAt = [0, 0];
    const blob = col => { const o = document.createElement('canvas'); o.width = o.height = 64; const g = o.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, `rgba(${col},1)`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return o; };
    const BLOB = { b: blob('150,165,255'), g: blob('255,232,196') };
    const sky = mo.particles(cv, {
      count: 1900,
      init(p, i) {
        p.kind = i % 6 === 0 ? 's' : i % 11 === 1 ? 'c' : 'r';
        p.col = COLS[(Math.random() * COLS.length) | 0];
        p.z = .3 + Math.random() * 1.2;
        p.tw = Math.random() * 6.28; p.ts = .0006 + Math.random() * .002;
        if (p.kind === 's') {
          p.fx = Math.random(); p.fy = Math.random();
          p.sz = Math.random() < .12 ? 1.8 + Math.random() : .6 + Math.random() * 1.1;
          p.a = .35 + Math.random() * .6;
        } else if (p.kind === 'c') {
          p.s = (Math.random() * 2 - 1) * (G.L || 600); p.k = gauss() * .7; p.sz = 40 + Math.random() * 70; p.a = .05 + Math.random() * .08; p.v = .002 + Math.random() * .004;
          p.blob = Math.random() < .55 ? BLOB.b : BLOB.g;
        } else {
          p.s = (Math.random() * 2 - 1) * (G.L || 600);
          p.k = gauss(); if (Math.abs(p.k) < .22 && Math.random() < .55) p.k = gauss();
          p.sz = Math.random() < .06 ? 1.6 : .5 + Math.random() * .9;
          p.a = .18 + Math.random() * .62; p.v = .004 + Math.random() * .012;
        }
      },
      step(p, dt) {
        if (p.kind === 'x') {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .00002 * dt; p.vx *= .998;
          return p.life < p.max;
        }
        p.tw += dt * p.ts;
        if (p.kind !== 's') { p.s += p.v * dt; if (p.s > G.L) p.s -= 2 * G.L; }
      },
      draw(g, p) {
        if (p.kind === 'x') {
          const k = 1 - p.life / p.max; g.globalCompositeOperation = 'lighter';
          g.fillStyle = `rgba(${p.col},${(k * k * .9).toFixed(3)})`;
          g.beginPath(); g.arc(p.x, p.y, p.sz * (.4 + k), 0, 6.283); g.fill();
          g.globalCompositeOperation = 'source-over'; return;
        }
        const px = tl.x * -11 * p.z, py = tl.y * -11 * p.z;
        let x, y, a = p.a * (.6 + .4 * Math.sin(p.tw));
        if (p.kind === 's') { x = p.fx * G.W + px; y = p.fy * G.H + py; }
        else {
          const sig = G.sigma * (.85 + .3 * Math.sin(p.s * .006 + 1.3)), mean = G.R * .1 * Math.sin(p.s * .0042);
          const t = mean + p.k * sig;
          x = G.C[0] + G.u[0] * p.s + G.n[0] * t + px; y = G.C[1] + G.u[1] * p.s + G.n[1] * t + py;
          if (p.kind === 'r') a *= 1 - Math.min(1, Math.abs(p.k) / 3.2) * .55;
        }
        g.fillStyle = `rgba(${p.col},${a.toFixed(3)})`;
        if (p.kind === 'c') { g.globalAlpha = a; g.drawImage(p.blob, x - p.sz, y - p.sz, p.sz * 2, p.sz * 2); g.globalAlpha = 1; return; }
        if (p.sz > 1.5) {
          g.beginPath(); g.arc(x, y, p.sz, 0, 6.283); g.fill();
          if (a > .5) { g.fillRect(x - 5, y - .3, 10, .6); g.fillRect(x - .3, y - 5, .6, 10); }
        } else g.fillRect(x, y, p.sz, p.sz);
      }
    });
    const sparks = (n, x, y, speed = .05, spread = 6.283, dir = 0) => {
      burstAt = [x, y];
      sky.burst(n, p => {
        const a = dir + (Math.random() - .5) * spread, v = speed * (.3 + Math.random());
        p.kind = 'x'; p.x = burstAt[0]; p.y = burstAt[1]; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
        p.max = 600 + Math.random() * 900; p.sz = 1 + Math.random() * 1.6; p.col = Math.random() < .7 ? '255,236,184' : '255,255,255';
      });
    };

    geo();
    if ('ResizeObserver' in window) new ResizeObserver(geo).observe(sk); else addEventListener('resize', geo);
    const offTilt = mo.tilt(v => { tl = v; stage.style.translate = `${(-v.x * 7).toFixed(2)}px ${(-v.y * 7).toFixed(2)}px`; glow.style.translate = `${(-v.x * 14).toFixed(2)}px ${(-v.y * 14).toFixed(2)}px`; });

    // ----- calling the magpies
    const flights = new Set();
    const landBird = (b, slot) => {
      b.el.classList.remove('flying'); b.el.classList.add('perched', 'hop');
      b.slot = slot; b.el.style.transform = slotPose(slot);
      placed.push(b);
      const tick = ticks.children[slot]; if (tick) tick.style.opacity = 0;
      state.landed++;
      const prog = state.landed / N, seg = .16 + .34 * prog;
      bridge.style.strokeDasharray = `${seg} ${Math.max(0, 1 - 2 * seg)} ${seg}`;
      const [x, y] = Q(G.A, G.K, G.B, slots[slot]);
      sparks(5, x, y, .03, 6.283);
      mo.tone('click'); mo.haptic('tap');
      if (state.landed >= N) meet();
    };
    const callBird = (delay = 0) => {
      if (state.called >= N || state.done) return;
      const slot = order[state.called++];
      finger.style.display = 'none';
      const go = () => {
        const el2 = document.createElement('div'); el2.innerHTML = bird('flying'); const be = el2.firstChild;
        be.style.setProperty('--fd', `-${(Math.random() * .3).toFixed(2)}s`);
        birds.appendChild(be);
        const b = { el: be, slot };
        if (mo.reduced) { landBird(b, slot); return; }
        // enter from off-screen (mostly from above), swoop, then settle on the arc
        const r = Math.random();
        const S = r < .6 ? [G.W * (-.1 + Math.random() * 1.2), -70] : r < .8 ? [-80, G.H * Math.random() * .5] : [G.W + 80, G.H * Math.random() * .5];
        const T0 = Q(G.A, G.K, G.B, slots[slot]);
        const sw = (Math.random() < .5 ? -1 : 1) * (80 + Math.random() * 120);
        const K2 = [(S[0] + T0[0]) / 2 + sw, (S[1] + T0[1]) / 2 + Math.abs(sw) * .6];
        mo.tone('whoosh');
        flights.add(b);
        mo.tween(0, 1, 1050 + Math.random() * 450, 'out', k => {
          const T = Q(G.A, G.K, G.B, slots[slot]);
          const [x, y] = Q(S, K2, T, k), [vx, vy] = dQ(S, K2, T, Math.min(.98, k));
          const sc = 1 + (1 - k) * .45;
          const e2 = k > .85 ? (k - .85) / .15 : 0;
          b.el.style.transform = pose(x, y, vx, vy, sc, 1 - e2 * .72, 50 + e2 * 28);
        }).then(() => { flights.delete(b); landBird(b, slot); });
      };
      delay ? setTimeout(go, delay) : go();
    };

    // ----- the ceremony: the two stars cross the bridge and meet
    async function meet() {
      if (state.done) return; state.done = true;
      sk.classList.add('meeting');
      bridge.style.strokeDasharray = '1 0 0';
      const lift = 17, mid = Q(G.A, G.K, G.B, .5);
      await wait(mo.reduced ? 0 : 250);
      mo.tone('whoosh');
      const lit = new Set();
      await mo.tween(0, .5, 1350, 'inOut', k => {
        const pa = Q(G.A, G.K, G.B, k), pb = Q(G.A, G.K, G.B, 1 - k);
        state.travel = k;
        star(stA, pa[0], pa[1] - lift); star(stB, pb[0], pb[1] - lift);
        if (Math.random() < .8) { sparks(2, pa[0], pa[1] - lift, .02); sparks(2, pb[0], pb[1] - lift, .02); }
        placed.forEach(b => { const t = slots[b.slot]; if (!lit.has(b) && (Math.abs(t - k) < .055 || Math.abs(t - (1 - k)) < .055)) { lit.add(b); b.el.classList.add('lit'); } });
      });
      // the meeting: a bloom of light
      star(stA, mid[0], mid[1] - lift); star(stB, mid[0], mid[1] - lift);
      sk.classList.add('met');
      mo.haptic('success'); mo.tone('chime');
      sparks(80, mid[0], mid[1] - lift, .16);
      sparks(28, mid[0], mid[1] - lift, .07);
      if (!mo.reduced) bloom.animate([
        { transform: 'translate(-50%,-50%) scale(.05)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(2.6)', opacity: 1, offset: .3 },
        { transform: 'translate(-50%,-50%) scale(9)', opacity: 0 }
      ], { duration: 1500, easing: 'cubic-bezier(.2,.7,.2,1)' });
      placed.forEach(b => b.el.classList.add('lit'));
      mo.reveal(vow, { mode: 'words', stagger: 130, delay: 250 });
      vow.classList.add('on');
      await wait(mo.reduced ? 700 : 1600);
      setTimeout(() => { offTilt(); sky.stop(); }, 1200);
      open();
    }

    // ----- gestures
    let acc = 0, lx = 0, ly = 0, first = true, unlocked = false;
    const unlock = () => { if (unlocked) return; unlocked = true; EA.music(); mo.requestTilt(); };
    dragEl.addEventListener('pointerdown', () => { unlock(); first = true; acc = 0; lx = ly = 0; });
    mo.drag(dragEl, {
      axis: 'xy', distance: 280,
      onMove(p, dx, dy) {
        const d = Math.hypot(dx - lx, dy - ly); lx = dx; ly = dy;
        if (state.done) return;
        acc += d;
        if (first && Math.hypot(dx, dy) > 10) { first = false; callBird(); callBird(160); acc = 0; sk.classList.add('called'); }
        while (!first && acc >= 105) { acc -= 105; callBird(); }
      },
    });
    mo.swipe(dragEl, 'up', () => { unlock(); if (state.called < N && !state.done) { callBird(); callBird(130); } });
    $('.open-btn').addEventListener('click', () => {
      unlock();
      sk.classList.add('called');
      for (let i = state.called, k = 0; i < N; i++, k++) callBird(k * 60);
    }, { once: true });
    armEgg(hit, c);
  });

  // =====================================================================================================
  // LAYOUTS (itinerary, gallery, events, faq, thanks, hero, story, rsvp)
  // =====================================================================================================
  EA.section('itinerary', ({ data: D, esc: e, ui }) => {
    const n = D.itinerary.length;
    const pts = D.itinerary.map((_, i) => [i % 2 ? 24 : 8, 10 + i * 20]);
    return `<div class="wrap narrow">
  ${ui.head('Chòm sao trong ngày', 'Chòm sao của ngày vui')}
  <div class="constellation" style="--rows:${n}">
    <svg viewBox="0 0 100 ${n * 20}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${pts.map(p => p.join(',')).join(' ')}" vector-effect="non-scaling-stroke"/>
    </svg>
    ${D.itinerary.map((it, i) => `
      <div class="star-item" style="top:${(10 + i * 20) / n / 20 * 100}%; --x:${pts[i][0]}%; --i:${i}">
        <span class="dot" aria-hidden="true"></span>
        <div><time>${e(it.time)}</time><strong>${e(it.title)}</strong><span>${e(it.note)}</span></div>
      </div>`).join('')}
  </div>
</div>`;
  });

  EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Khoảnh khắc của chúng mình')}
  <div class="orbit">${D.photos.map((p, i) => ui.photo(p, i)).join('')}</div>
</div>`);

  EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ngày hội ngộ', 'Hai vì sao, một ngày')}
  <div class="pair">
    ${D.events.map((ev, i) => `
      <article class="orb-card">
        <span class="orb" aria-hidden="true"></span>
        <p class="label">${e(ev.label)}</p>
        <h3>${e(ev.title)}</h3>
        <p class="t">${e(ev.time)}</p>
        <p>${e(ev.place)}</p>
        <p class="addr">${e(ev.address)}</p>
        ${ui.actions(ev)}
      </article>${i === 0 ? '<div class="span-bridge" aria-hidden="true"></div>' : ''}`).join('')}
  </div>
</div>`);

  EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Cẩm nang', 'Điều bạn muốn biết')}
  <div class="wishes">
    ${D.faq.map(f => `<details class="wish"><summary><span class="twinkle" aria-hidden="true">${EA.icon('star')}</span>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('')}
  </div>
</div>`);

  // Finale at the thanks: the two stars orbit side by side and a shooting star crosses the sky.
  EA.section('thanks', ({ data: D, esc: e, dateText, mod, p }) => `<div class="wrap narrow">
  <div class="fin">
    <div class="fin-orbit">
      <span class="fs a" aria-hidden="true"></span>
      ${p.has('insideJoke') ? '<button class="fs b" type="button" aria-label="Giữ lâu vào ngôi sao để xem điều bí mật"></button>' : '<span class="fs b" aria-hidden="true"></span>'}
    </div>
    <span class="fin-shoot" aria-hidden="true"></span>
  </div>
  <p class="eyebrow">Lời cảm ơn</p>
  <p class="mono">${e(D.monogram)}</p>
  <p>${e(D.thanks)}</p>
  ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
  <p class="kicker">${dateText}</p>
  <button class="btn" type="button" id="reopen">Ngắm lại bầu trời ${EA.icon('replay')}</button>
</div>`);

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    return `<div class="wrap">
  <div class="st-hero">
    <p class="st-side l"><span class="st-dot" aria-hidden="true"></span>${e(cp.brideName)}<small>Chức Nữ</small></p>
    <div class="moon"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
    <p class="st-side r">${c.p.has('insideJoke') ? '<button class="st-dot st-hold" type="button" aria-label="Giữ lâu vào ngôi sao để xem điều bí mật"></button>' : '<span class="st-dot" aria-hidden="true"></span>'}${e(cp.groomName)}<small>Ngưu Lang</small></p>
  </div>
  <p class="headline">${c.t(cp.headline)}</p>
  <p class="hero-date">${c.dow} · ${c.dateText}</p>
  ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
  ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
</div>`;
  });

  EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Câu chuyện', 'Quỹ đạo của chúng mình')}
  <ol class="orbit-story">
    ${(mod.content.chapters || []).map((ch, i) => `
      <li style="--i:${i}">
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <div><time>${e(ch.date)}</time><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
      </li>`).join('')}
  </ol>
  ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
</div>`);

  EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Gửi lên một vì sao')}
  <div class="glass">${ui.rsvpForm()}</div>
</div>`);

  // =====================================================================================================
  // ADD-ONS (injected after render; each renders only when its data exists)
  // =====================================================================================================
  const MONTHS = { giêng: 1, một: 1, hai: 2, ba: 3, bốn: 4, tư: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10, chạp: 12 };
  const parseLunar = s => {
    const m = String(s).match(/(\d{1,2})\s*tháng\s*(\d{1,2}|[a-zà-ỹ]+)/i);
    if (!m) return null;
    const day = +m[1], mon = /^\d+$/.test(m[2]) ? +m[2] : MONTHS[m[2].toLowerCase()];
    return mon >= 1 && mon <= 12 && day >= 1 && day <= 30 ? { day, mon } : null;
  };
  const fmtDate = s => {
    const m = String(s || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (!m) return String(s || '');
    return m[3] ? `${+m[3]}/${+m[2]}/${m[1]}` : `tháng ${+m[2]}/${m[1]}`;
  };
  const insertAfter = (main, ids, node) => {
    for (const id of ids) { const ref = main.querySelector('#' + id); if (ref) { ref.after(node); return true; } }
    return false;
  };
  const section = (id, html) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} addon`; s.innerHTML = html; return s;
  };

  // --- Thất tịch của chúng mình (text only; couple.lunarDate) ---
  const thatTich = (c, main) => {
    const lunar = c.config.couple.lunarDate;
    if (!lunar) return;
    const L = parseLunar(lunar), e = c.esc;
    let line = 'Mỗi năm một lần, vào mùng 7 tháng 7 âm lịch, đàn ô thước bắc cầu cho hai vì sao. Chúng mình chọn một ngày để bắc cầu mãi mãi.';
    if (L) {
      const diff = Math.round((L.mon - 7) * 29.5 + (L.day - 7));
      if (L.mon === 7 && L.day === 7) line = 'Đúng ngày Thất tịch. Hôm ấy ô thước bắc cầu cho Ngưu Lang Chức Nữ, và cũng bắc cầu cho chúng mình.';
      else if (diff > 0) line = `Ngày cưới đến sau Thất tịch khoảng ${diff} ngày. Ngưu Lang Chức Nữ gặp nhau mỗi năm một lần, còn chúng mình chọn ở bên nhau mỗi ngày.`;
      else line = `Ngày cưới đến trước Thất tịch khoảng ${-diff} ngày. Chúng mình về chung một nhà trước khi ô thước kịp bắc cầu năm ấy.`;
    }
    const s = section('thattich', `<div class="wrap narrow">
      ${c.ui.head('Mùng 7 tháng 7', 'Thất tịch của chúng mình')}
      <div class="tt">
        <div class="tt-end"><span class="tt-star" aria-hidden="true"></span><strong>7/7</strong><small>Thất tịch, âm lịch</small></div>
        <svg class="tt-arc" viewBox="0 0 160 50" aria-hidden="true"><path d="M4 44Q80-34 156 44" pathLength="1"/></svg>
        <div class="tt-end"><span class="tt-star on" aria-hidden="true"></span><strong>${e(L ? `${L.day}/${L.mon}` : lunar)}</strong><small>Ngày cưới, âm lịch</small></div>
      </div>
      <p class="tt-lunar">${e(lunar)}</p>
      <p class="tt-line">${e(line)}</p>
    </div>`);
    insertAfter(main, ['events', 'hero'], s) || main.prepend(s);
  };

  // --- Những ngày ở hai bờ (metDate, optional places / hometowns) ---
  const haiBo = (c, main) => {
    const days = c.p.daysTogether, e = c.esc;
    if (days == null) return;
    const places = (c.p.get('places', []) || []).filter(p => p && p.name);
    const metPlace = c.p.get('metPlace'), hb = c.p.get('hometowns', {}), pins = c.p.get('hometownPins');
    const km = pins?.bride && pins?.groom ? Math.round(c.p.kmBetween(pins.bride, pins.groom)) : null;
    const n = places.length, ys = [118, 54, 108, 48, 100, 66];
    const pt = places.map((p, i) => [n === 1 ? 160 : 30 + i * 260 / (n - 1), ys[i % ys.length] + (i * 7) % 11]);
    const s = section('haibo', `<div class="wrap narrow">
      ${c.ui.head('Hai bờ sông Ngân', 'Những ngày ở hai bờ')}
      <p class="hb-count"><span class="hb-n" data-to="${days}">0</span><span class="hb-u">ngày bên nhau</span></p>
      <p class="hb-sub">${e(c.p.get('metDate') ? `Từ ngày ${fmtDate(c.p.get('metDate'))}${metPlace ? `, ở ${metPlace}` : ''} đến ngày cưới.` : '')}</p>
      ${hb.bride && hb.groom ? `<p class="hb-bank"><span>${e(hb.bride)}</span><i aria-hidden="true"></i><span>${e(hb.groom)}</span>${km ? `<small>Cách nhau khoảng ${km.toLocaleString('vi-VN')} km, và hai bờ đã thành một nhà.</small>` : ''}</p>` : ''}
      ${n ? `<div class="hb-sky" style="--n:${n}">
        <svg viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pt.map(q => q.join(',')).join(' ')}" pathLength="1" vector-effect="non-scaling-stroke"/></svg>
        ${places.map((p, i) => `<button class="hb-pin" type="button" style="left:${pt[i][0] / 3.2}%;top:${pt[i][1] / 1.8}%;--i:${i}" data-i="${i}" aria-label="${e(p.name)}${p.date ? ', ' + fmtDate(p.date) : ''}"><span></span></button>`).join('')}
        <div class="hb-tip" role="status" aria-live="polite" hidden><b></b><small></small></div>
      </div><p class="hb-hint">Chạm vào từng vì sao để xem nơi chúng mình đã đi qua</p>` : ''}
    </div>`);
    if (!insertAfter(main, ['story', 'hero'], s)) main.prepend(s);
    const mo = c.motion, num = s.querySelector('.hb-n');
    mo.inView(s.querySelector('.hb-count'), () => mo.tween(0, days, 2000, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }));
    const tip = s.querySelector('.hb-tip');
    if (tip) {
      const sky = s.querySelector('.hb-sky');
      const show = b => {
        const p = places[+b.dataset.i];
        tip.querySelector('b').textContent = p.name; tip.querySelector('small').textContent = p.date ? fmtDate(p.date) : '';
        tip.hidden = false;
        const x = clamp(parseFloat(b.style.left), 22, 78);
        tip.style.left = x + '%'; tip.style.top = b.style.top;
        s.querySelectorAll('.hb-pin').forEach(q => q.classList.toggle('on', q === b));
        mo.tone('pop'); mo.haptic('tap');
      };
      sky.querySelectorAll('.hb-pin').forEach(b => {
        b.addEventListener('click', () => show(b));
        b.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) show(b); });
        b.addEventListener('focus', () => show(b));
      });
    }
  };

  // --- Cầu ô thước của khách (guest-powered: one magpie per RSVP) ---
  let gb = null;
  const SEED = ['Cô Hạnh', 'Anh Khoa', 'Bạn Thảo', 'Bé Na', 'Chú Tư'];
  const cauOThuoc = (c, main) => {
    const e = c.esc, mo = c.motion;
    const s = section('cauotthuoc', `<div class="wrap">
      ${c.ui.head('Cầu ô thước', 'Cầu ô thước của khách')}
      <div class="gb">
        <div class="gb-river" aria-hidden="true"></div>
        <svg class="gb-svg" viewBox="0 0 600 270" aria-hidden="true">
          <path class="gb-arc" d="M44 214Q300-62 556 214" pathLength="1"/>
          <g class="gb-st" transform="translate(44 214)"><circle r="20" class="h"/><circle r="4.5" class="c"/></g>
          <g class="gb-st" transform="translate(556 214)"><circle r="20" class="h"/><circle r="4.5" class="c"/></g>
        </svg>
        <div class="gb-birds"></div>
      </div>
      <p class="gb-cap" aria-live="polite"></p>
      <p class="gb-note">Mỗi người xác nhận đến dự sẽ là một chú ô thước mang tên bạn bay đến đậu trên cầu.</p>
    </div>`);
    if (!insertAfter(main, ['rsvp'], s)) { const t = main.querySelector('#thanks'); t ? t.before(s) : main.append(s); }
    const wrap = s.querySelector('.gb-birds'), cap = s.querySelector('.gb-cap'), box = s.querySelector('.gb');
    const A = [44, 214], K = [300, -62], B = [556, 214], VW = 600, VH = 270;
    let list = [], nodes = new Map(), me = null;
    const slotT = (i, n) => n === 1 ? .5 : .07 + .86 * i / (n - 1);
    const place = (node, i, n) => {
      const t = slotT(i, n), [x, y] = Q(A, K, B, t), [vx, vy] = dQ(A, K, B, t), dir = t < .5 ? 1 : -1;
      node.style.left = (x / VW * 100) + '%'; node.style.top = (y / VH * 100) + '%';
      node.querySelector('.gb-pose').style.transform = orient(vx * dir, vy * dir, 1, .28);
    };
    const mk = (it, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'gb-bird' + (it.seed ? ' seed' : '') + (it.mine ? ' me' : '');
      b.innerHTML = `<span class="gb-fly"><span class="gb-pose">${bird('perched')}</span></span><span class="gb-tag"></span>`;
      b.querySelector('.gb-tag').textContent = it.name;
      b.setAttribute('aria-label', 'Chú ô thước của ' + it.name);
      b.style.setProperty('--i', i);
      b.addEventListener('click', () => { const on = b.classList.toggle('open'); if (on) { mo.tone('pop'); nodes.forEach((n2, k) => { if (n2 !== b) n2.classList.remove('open'); }); } });
      return b;
    };
    const caption = () => { const n = list.filter(x => !x.seed).length; cap.textContent = n ? `${n} người thân đã cùng bắc cầu` : 'Hãy là người đầu tiên bắc cầu cho hai bạn'; box.classList.toggle('empty', !n); };
    const layout = () => { list.forEach((it, i) => place(nodes.get(it), i, list.length)); };
    const show = arr => {
      list = arr.slice(-14);
      list.forEach((it, i) => { const b = mk(it, i); nodes.set(it, b); wrap.appendChild(b); });
      layout(); caption();
      // birds appear one by one when the section scrolls into view
      mo.inView(box, () => nodes.forEach(b => b.classList.add('in')), { threshold: .3 });
    };
    const ready = Promise.resolve(EA.shared.list('magpie')).then(real => {
      const r = (real || []).filter(x => x && x.name).map(x => ({ name: String(x.name) }));
      show(r.length ? r : SEED.map(name => ({ name, seed: true })));
    }).catch(() => show(SEED.map(name => ({ name, seed: true }))));
    // a guest's magpie flies in and lands, with their name
    gb = {
      el: s,
      async add(name) {
        await ready;
        await EA.shared.add('magpie', { name });
        const it = { name, mine: true };
        if (list.length >= 14) { const old = list.shift(); nodes.get(old)?.remove(); nodes.delete(old); }
        list = list.filter(x => { if (x.seed) { nodes.get(x)?.remove(); nodes.delete(x); } return !x.seed; });
        list.push(it);
        nodes.forEach((n2, k) => { n2.style.setProperty('--i', list.indexOf(k)); });
        const b = mk(it, list.length); b.classList.add('in', 'arriving'); nodes.set(it, b); wrap.appendChild(b);
        layout(); caption(); me = b;
        const r = box.getBoundingClientRect();
        const pose0 = b.querySelector('.gb-fly'), bd = b.querySelector('.bird');
        const t = slotT(list.length - 1, list.length), dest = Q(A, K, B, t);
        const dx = r.width * 1.1 * (1 - dest[0] / VW) + 60, dy = -r.height * 1.1;
        if (mo.reduced) { bd.classList.replace('flying', 'perched'); b.classList.add('open'); return; }
        bd.classList.remove('perched'); bd.classList.add('flying');
        const frames = [];
        for (let i = 0; i <= 14; i++) { const k = i / 14, kk = 1 - (1 - k) ** 3; frames.push({ transform: `translate(${dx * (1 - kk)}px,${dy * (1 - kk) + Math.sin(k * 3.1416) * -34}px) scale(${1 + (1 - kk) * .5})`, opacity: Math.min(1, k * 5) }); }
        mo.tone('whoosh');
        const anim = pose0.animate(frames, { duration: 1700, easing: 'linear', fill: 'backwards' });
        await anim.finished.catch(() => {});
        bd.classList.remove('flying'); bd.classList.add('perched', 'hop');
        mo.tone('click'); mo.haptic('success');
        b.classList.remove('arriving'); b.classList.add('open');
        setTimeout(() => b.classList.remove('open'), 6000);
      }
    };
  };

  EA.onRsvp(entry => {
    if (!gb || !entry?.name || entry.attending !== true) return;
    gb.add(entry.name).then(() => {
      const mo = EA.motion;
      mo?.tone('chime');
      setTimeout(() => gb.el.scrollIntoView({ behavior: EA.motion?.reduced ? 'auto' : 'smooth', block: 'center' }), 500);
    });
  });

  // =====================================================================================================
  // after render: starfield behind everything, add-ons, easter eggs, finale
  // =====================================================================================================
  const onEmptyTap = (main, fn) => main.addEventListener('click', e => {
    if (e.target.closest('a, button, input, select, textarea, label, summary, details, dialog, canvas, .photo, img, iframe, .gb, .hb-sky')) return;
    fn(e.clientX, e.pageY, e);
  });
  const fx = (() => { const l = document.createElement('div'); l.className = 'fx-layer'; l.setAttribute('aria-hidden', 'true'); document.body.appendChild(l); return l; })();

  EA.afterRender((c, main) => {
    const mo = c.motion;
    document.documentElement.dataset.tier = mo.tier;
    thatTich(c, main); haiBo(c, main); cauOThuoc(c, main);
    // re-observe the injected sections for the "stars appear" reveal (core observed .sec at the same time, but only those present)
    main.querySelectorAll('.addon').forEach(s => {
      if (!mo.reduced) { s.classList.add('reveal'); mo.inView(s, () => s.classList.add('in'), { threshold: .12 }); }
    });

    // starfield behind the whole invitation: three depths, scroll parallax, twinkle
    document.querySelector('.bg-sky')?.remove();
    const cvs = document.createElement('canvas');
    cvs.className = 'bg-sky ea-mo-canvas'; cvs.setAttribute('aria-hidden', 'true');
    document.body.prepend(cvs);
    let tl = { x: 0, y: 0 };
    mo.tilt(v => { tl = v; });
    mo.particles(cvs, {
      count: 150,
      init(p, i, w, h) {
        p.x = Math.random() * w; p.y = Math.random() * h; p.z = .15 + Math.random() * .85;
        p.sz = p.z > .85 ? 1.7 : p.z > .5 ? 1.1 : .7; p.tw = Math.random() * 6.28; p.ts = .0005 + Math.random() * .0016;
        p.gold = Math.random() < .14;
      },
      step(p, dt, w, h) { p.tw += dt * p.ts; p.W = w; p.H = h; },
      draw(g, p) {
        const W = p.W || 800, H = p.H || 600;
        const y = (((p.y - scrollY * p.z * .22 - tl.y * 9 * p.z) % H) + H) % H, x = (((p.x - tl.x * 12 * p.z) % W) + W) % W;
        const a = (.25 + .6 * p.z) * (.55 + .45 * Math.sin(p.tw));
        g.fillStyle = p.gold ? `rgba(240,222,170,${a.toFixed(3)})` : `rgba(255,255,255,${a.toFixed(3)})`;
        g.fillRect(x, y, p.sz, p.sz);
      }
    });

    // easter egg: hold on the groom's star in the hero
    armEgg(main.querySelector('.st-hold'), c);
    armEgg(main.querySelector('.fin .fs.b'), c);

    // finale: the shooting star starts crossing when the thanks section is on screen
    const fin = main.querySelector('.fin');
    if (fin) mo.inView(fin, () => fin.classList.add('go'), { once: true, threshold: .3 });

    if (c.reduced) return;
    onEmptyTap(main, (x, y) => {
      const sp = document.createElement('span'); sp.className = 'shoot'; sp.style.cssText = `left:${x - 160}px;top:${y - 60}px`;
      fx.appendChild(sp); setTimeout(() => sp.remove(), 1200);
      mo.tone('pop');
    });
  });
})();
