// Lantern Festival: đêm rằm hoa đăng ở Hội An.
// Cover: phố cổ nhìn ra sông Hoài, trăng rằm, đèn lồng thả trôi. Vuốt chiếc đèn lên (hoặc bấm "Thả đèn"):
//   đèn của khách bay lên, cả đàn đèn từ mặt sông bay theo và xếp thành chữ cái đầu tên hai bạn trên bầu trời.
// Sau khi mở: mỗi lời hồi âm / lời chúc là một chiếc đèn trên dòng sông, chạm vào để đọc.
// Mọi hình vẽ là SVG / canvas. Không có ảnh ngoài ngoài ảnh của cặp đôi.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const seeded = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const realPhoto = c => { const h = c.config.couple.heroImage || ''; return h && !/picsum\.photos/.test(h) ? h : ''; };
  const initial = (s, fb) => { const w = String(s || fb || '').trim().split(/\s+/).pop() || ''; return (Array.from(w)[0] || '').toLocaleUpperCase('vi'); };
  const monogram = c => [initial(c.data.bride.short, c.data.bride.name), initial(c.data.groom.short, c.data.groom.name)];

  // ---------- đèn lồng Hội An: lụa, khung nan, nắp gỗ, tua rua ----------
  const defs = `<svg class="lf-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="lf-silk" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="#fff0b8"/><stop offset=".4" stop-color="#ffb347"/><stop offset=".85" stop-color="#e2631f"/><stop offset="1" stop-color="#a32f12"/></radialGradient>
    <radialGradient id="lf-silkr" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".42" stop-color="#ff7448"/><stop offset=".88" stop-color="#d12a1e"/><stop offset="1" stop-color="#7d0f10"/></radialGradient>
    <linearGradient id="lf-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3517"/><stop offset=".5" stop-color="#b9843c"/><stop offset="1" stop-color="#5a3517"/></linearGradient>
    <symbol id="lf-lan" viewBox="0 0 60 104">
      <line x1="30" y1="0" x2="30" y2="14" stroke="#c9953f" stroke-width="1.6"/>
      <rect x="20" y="13" width="20" height="7" rx="2.5" fill="url(#lf-wood)"/>
      <path d="M30 19 C50 19 57 33 57 48 C57 63 50 76 30 76 C10 76 3 63 3 48 C3 33 10 19 30 19Z" fill="url(#lf-silk)"/>
      <path d="M30 19 C20 28 20 67 30 76 M30 19 C40 28 40 67 30 76 M30 19 C11 30 11 65 30 76 M30 19 C49 30 49 65 30 76" fill="none" stroke="rgba(120,40,8,.45)" stroke-width="1"/>
      <path d="M8 36 Q30 41 52 36 M5 48 Q30 54 55 48 M8 60 Q30 66 52 60" fill="none" stroke="rgba(120,40,8,.3)" stroke-width=".9"/>
      <ellipse cx="19" cy="38" rx="4" ry="9" fill="rgba(255,255,255,.28)" transform="rotate(14 19 38)"/>
      <rect x="19" y="74" width="22" height="7" rx="2.5" fill="url(#lf-wood)"/>
      <circle cx="30" cy="84" r="2.6" fill="#e0a64a"/>
      <path d="M30 86 l-7 17 M30 86 l-3.5 18 M30 86 v18 M30 86 l3.5 18 M30 86 l7 17" stroke="#d9442b" stroke-width="2.2" stroke-linecap="round"/>
    </symbol>
    <symbol id="lf-lanr" viewBox="0 0 60 104"><use href="#lf-lan" style="filter:hue-rotate(-18deg) saturate(1.2)"/></symbol>
  </defs></svg>`;
  const lan = (cls = '', style = '') => `<svg class="lf-lan ${cls}" viewBox="0 0 60 104" aria-hidden="true"${style ? ` style="${style}"` : ''}><use href="#lf-lan"/></svg>`;

  // ---------- phố cổ: nhà tường vàng, mái ngói rêu, đèn dưới mái hiên ----------
  function townSVG(seed) {
    const R = seeded(seed), W = 800, H = 220, hy = H;
    let far = '', near = '', x = -20;
    while (x < W + 20) {            // lớp xa
      const w = 50 + R() * 50, h = 60 + R() * 60;
      far += `<path d="M${x} ${hy} V${hy - h} L${x + w * .12} ${hy - h - 12} H${x + w * .88} L${x + w} ${hy - h} V${hy}Z"/>`;
      x += w - 4;
    }
    const walls = ['#a87530', '#b8832f', '#98672c', '#c18f3e', '#8f6030'];
    x = -30;
    while (x < W + 30) {            // lớp gần
      const w = 78 + R() * 46, h = 62 + R() * 40, top = hy - h, wall = walls[Math.floor(R() * walls.length)];
      const two = h > 82;
      near += `<g>
        <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>
        <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#lf-wallshade)"/>
        <path d="M${x - 8} ${top + 18} Q${x + 2} ${top + 16} ${x + 12} ${top + 2} H${x + w - 12} Q${x + w - 2} ${top + 16} ${x + w + 8} ${top + 18} V${top + 24} H${x - 8}Z" fill="#2d1b22"/>
        <path d="M${x - 8} ${top + 24} H${x + w + 8}" stroke="#d29a45" stroke-width="1.4" opacity=".7"/>
        ${Array.from({ length: Math.floor(w / 8) }, (_, i) => `<path d="M${x + 4 + i * 8} ${top + 4} v14" stroke="#4a2e2a" stroke-width="1"/>`).join('')}
        ${two ? `<rect x="${x + w * .18}" y="${top + 32}" width="10" height="16" rx="1" fill="#ffcf75" class="lf-win" style="animation-delay:-${(R() * 6).toFixed(1)}s"/><rect x="${x + w * .62}" y="${top + 32}" width="10" height="16" rx="1" fill="#ffcf75" class="lf-win" style="animation-delay:-${(R() * 6).toFixed(1)}s"/>` : ''}
        <rect x="${x + w * .38}" y="${hy - 28}" width="${w * .24}" height="28" rx="2" fill="#5b3418"/><rect x="${x + w * .42}" y="${hy - 24}" width="${w * .16}" height="24" fill="#ffc15a" opacity=".78" class="lf-win" style="animation-delay:-${(R() * 6).toFixed(1)}s"/>
        <use href="#lf-lan" x="${x + 4}" y="${top + 24}" width="9" height="15.6"/><use href="#lf-lanr" x="${x + w - 13}" y="${top + 24}" width="9" height="15.6"/>
        ${R() > .45 ? `<use href="#lf-lan" x="${x + w * .5 - 6}" y="${top + 24}" width="12" height="21"/>` : ''}
      </g>`;
      x += w - 2;
    }
    return `<svg class="lf-town" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="lf-wallshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1330" stop-opacity=".55"/><stop offset=".55" stop-color="#1c1330" stop-opacity=".1"/><stop offset="1" stop-color="#ff9a2e" stop-opacity=".22"/></linearGradient></defs>
      <g fill="#2a2147" opacity=".95">${far}</g>${near}</svg>`;
  }

  // đôi trẻ trên bờ sông, cùng giữ một chiếc đèn (khi không có ảnh)
  const COUPLE = `<svg class="lf-couple" viewBox="0 0 300 380" aria-hidden="true">
    <defs><radialGradient id="lf-halo" cx="50%" cy="38%" r="55%"><stop offset="0" stop-color="#ffd78a" stop-opacity=".65"/><stop offset="1" stop-color="#ffd78a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="150" cy="130" r="150" fill="url(#lf-halo)"/>
    <g fill="#15102a"><path d="M104 380 V250 Q104 214 124 206 L134 160 H110 L108 154 Q104 120 120 108 Q140 94 154 112 L158 160 L150 206 Q170 214 170 250 V380Z"/>
    <circle cx="125" cy="94" r="17"/><path d="M107 90 Q112 72 130 74 Q142 78 140 92 Q130 80 116 90Z"/>
    <path d="M178 380 L190 218 Q192 190 206 176 L200 140 Q198 118 212 112 Q226 108 232 124 L240 160 L230 186 L252 380Z"/>
    <circle cx="213" cy="96" r="16"/><path d="M196 96 Q196 76 214 76 Q232 78 230 100 L228 130 Q226 112 222 100 Q206 100 196 96Z"/></g>
    <path d="M232 168 Q196 190 160 190" fill="none" stroke="#15102a" stroke-width="9" stroke-linecap="round"/>
    <g transform="translate(131 164) scale(.62)"><use href="#lf-lan" width="60" height="104"/></g>
    <path d="M0 372 H300" stroke="#c9953f" stroke-width="3" opacity=".5"/></svg>`;

  const moonHTML = cls => `<span class="lf-moon-d ${cls || ''}"><i></i><i></i><i></i></span>`;

  // ===================== COVER =====================
  let stopCover = () => {};
  EA.cover((el, c, open) => {
    stopCover();
    const M = c.motion, D = c.data, e = c.esc, [mb, mg] = monogram(c);
    const low = M.tier === 'low';
    if (!document.querySelector('.lf-defs')) document.body.insertAdjacentHTML('beforeend', defs);
    el.className = 'cover lf-cover';
    el.style.cssText = '';
    el.innerHTML = `
      <div class="lf-sky" aria-hidden="true"></div>
      <button class="lf-moon" type="button" aria-label="Trăng rằm">${moonHTML()}</button>
      <div class="lf-glowlayer" aria-hidden="true"></div>
      ${townSVG(7)}
      <div class="lf-river" aria-hidden="true"><i class="lf-sh a"></i><i class="lf-sh b"></i></div>
      <canvas class="lf-fx" aria-hidden="true"></canvas>
      <div class="lf-strand" aria-hidden="true">${lan('s1')}${lan('s2')}${lan('s3')}</div>
      <header class="lf-head">
        <p class="lf-eb">Đêm hoa đăng</p>
        <h1 class="lf-names"><span>${e(D.bride.name.replace(/ /g, ' '))}</span><i class="lf-amp">&amp;</i><span>${e(D.groom.name.replace(/ /g, ' '))}</span></h1>
        <p class="lf-date"><span>${c.dow}</span><i></i><b>${c.dateText}</b></p>
        <p class="lf-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="lf-cap" aria-live="polite"></p>
      </header>
      <div class="lf-foot">
        <div class="lf-lift">
          <button class="lf-rise" type="button" aria-label="Thả đèn: vuốt chiếc đèn lên trời">${lan('')}<span class="lf-flame"></span></button>
        </div>
        <p class="lf-hint">Vuốt đèn lên để thả lên trời</p>
        <button class="open-btn" type="button">Thả đèn</button>
      </div>
      <div class="lf-flash" aria-hidden="true"></div>`;

    const $ = s => el.querySelector(s);
    const cv = $('.lf-fx'), g = cv.getContext('2d'), rise = $('.lf-rise'), foot = $('.lf-foot'), head = $('.lf-head');
    let W = 0, H = 0, dpr = 1, ended = false, launched = false, musicOn = false, t = 0;
    const stops = [];
    stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
    const wait = ms => new Promise(r => c.after(ms, r));

    // ---- sprites (vẽ một lần) ----
    const sprite = (c1, c2, c3) => {
      const s = document.createElement('canvas'); s.width = 64; s.height = 96; const x = s.getContext('2d');
      x.strokeStyle = '#c9953f'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 12); x.stroke();
      const wood = (y, w) => { const gr = x.createLinearGradient(32 - w / 2, 0, 32 + w / 2, 0); gr.addColorStop(0, '#5a3517'); gr.addColorStop(.5, '#c4924a'); gr.addColorStop(1, '#5a3517'); x.fillStyle = gr; x.beginPath(); x.roundRect(32 - w / 2, y, w, 6, 2.5); x.fill(); };
      wood(11, 20);
      const gr = x.createRadialGradient(32, 42, 2, 32, 42, 32); gr.addColorStop(0, c1); gr.addColorStop(.45, c2); gr.addColorStop(1, c3);
      x.fillStyle = gr; x.beginPath(); x.moveTo(32, 17); x.bezierCurveTo(52, 17, 60, 31, 60, 45); x.bezierCurveTo(60, 60, 52, 72, 32, 72); x.bezierCurveTo(12, 72, 4, 60, 4, 45); x.bezierCurveTo(4, 31, 12, 17, 32, 17); x.fill();
      x.strokeStyle = 'rgba(110,35,8,.45)'; x.lineWidth = 1;
      [[22, 29, 22, 62], [42, 29, 42, 62], [13, 31, 13, 60], [51, 31, 51, 60]].forEach(([a, b, cc, d]) => { x.beginPath(); x.moveTo(32, 17); x.quadraticCurveTo(a, (b + d) / 2, 32, 72); x.stroke(); });
      wood(70, 22);
      x.fillStyle = '#e0a64a'; x.beginPath(); x.arc(32, 81, 2.6, 0, 7); x.fill();
      x.strokeStyle = '#d9442b'; x.lineWidth = 2; x.lineCap = 'round';
      [[-7, 16], [-3.5, 17], [0, 17], [3.5, 17], [7, 16]].forEach(([dx, dy]) => { x.beginPath(); x.moveTo(32, 83); x.lineTo(32 + dx, 83 + dy); x.stroke(); });
      return s;
    };
    const SP = [sprite('#fff0b8', '#ffb347', '#d9561c'), sprite('#ffe0a8', '#ff7a4a', '#c42a1e'), sprite('#fff6cf', '#ffc65e', '#e07a1f')];
    const glow = document.createElement('canvas'); glow.width = glow.height = 128;
    { const x = glow.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,214,130,.85)'); gr.addColorStop(.35, 'rgba(255,160,70,.32)'); gr.addColorStop(1, 'rgba(255,140,50,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); }

    const lanterns = [];   // đèn thả trôi / đàn đèn bay
    const stars = Array.from({ length: low ? 40 : 90 }, () => ({ x: Math.random(), y: Math.random() * .55, r: rnd(.4, 1.5), p: rnd(0, 6.3), s: rnd(.0006, .002) }));
    const riverY = () => { const r = $('.lf-river').getBoundingClientRect(), cr = cv.getBoundingClientRect(); return r.top - cr.top; };
    const sizeCanvas = () => {
      const r = el.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1) * (low ? .75 : 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    sizeCanvas(); addEventListener('resize', sizeCanvas); stops.push(() => removeEventListener('resize', sizeCanvas));

    // đèn thả trôi trên sông + vài chiếc bay chậm ở xa
    const nDrift = Math.round(M.scale(11)) + 3;
    const initDrift = () => { lanterns.length = 0; const ry = riverY();
      for (let i = 0; i < nDrift; i++) lanterns.push({ k: 'riv', x: rnd(0, W), y: ry + rnd(14, Math.max(40, H - ry - 190)), v: rnd(5, 14) * (Math.random() < .2 ? -1 : 1), z: rnd(.5, 1), ph: rnd(0, 6.3), sp: Math.floor(rnd(0, 3)) });
      for (let i = 0; i < Math.round(M.scale(5)); i++) lanterns.push({ k: 'sky', x: rnd(0, W), y: rnd(ry * .4, ry), v: rnd(5, 9), z: rnd(.3, .55), ph: rnd(0, 6.3), sp: Math.floor(rnd(0, 3)) });
    };
    initDrift();

    const drawLan = (cx, cy, sz, sp, a, tw) => {
      const gs = sz * 2.3 * (.9 + .1 * (tw || 1));
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .8; g.drawImage(glow, cx - gs / 2, cy - gs / 2 + sz * .05, gs, gs);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = a; g.drawImage(SP[sp], cx - sz * .32, cy - sz * .5, sz * .64, sz * .96);
    };

    let sparks = [];
    const frame = (_t, dt) => {
      t += dt; if (!W) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      // sao
      for (const s of stars) { g.globalAlpha = (.35 + .65 * Math.sin(t * s.s + s.p) ** 2) * .85; g.fillStyle = '#fff4d8'; g.fillRect(s.x * W, s.y * H, s.r, s.r); }
      g.globalAlpha = 1;
      const ry = riverY();
      for (const L of lanterns) {
        if (L.k === 'riv') {
          L.x += L.v * dt / 1000; if (L.x > W + 30) L.x = -30; if (L.x < -30) L.x = W + 30;
          const bob = Math.sin(t * .0016 + L.ph) * 2.2, sz = 26 * L.z + 6, y = L.y + bob;
          g.globalAlpha = .28 * L.z; g.save(); g.translate(L.x, y + sz * .75); g.scale(1, -.7);   // bóng trên mặt nước
          g.globalCompositeOperation = 'lighter'; g.drawImage(glow, -sz * 1.2, -sz * 1.2, sz * 2.4, sz * 2.4); g.restore();
          drawLan(L.x, y, sz, L.sp, .55 + .45 * L.z, 1 + .15 * Math.sin(t * .004 + L.ph));
        } else if (L.k === 'sky') {
          L.y -= L.v * dt / 1000; L.x += Math.sin(t * .0007 + L.ph) * .12; if (L.y < -20) { L.y = ry + 10; L.x = rnd(0, W); }
          drawLan(L.x, L.y, 20 * L.z + 6, L.sp, clamp(L.y / ry) * .8 + .1, 1);
        } else if (L.k === 'fleet') {
          const q = clamp((t - L.t0) / L.dur);
          if (q <= 0) continue;
          const e = 1 - (1 - q) ** 3, sway = Math.sin(q * 9 + L.ph) * (1 - q) * 28 * L.z;
          L.x = L.sx + (L.tx - L.sx) * e + sway; L.y = L.sy + (L.ty - L.sy) * (1 - (1 - q) ** 2.4);
          const settle = q >= 1 ? Math.sin(t * .0018 + L.ph) : 0;
          const sz = L.sz * (.55 + .45 * e);
          if (!low && q < 1 && Math.random() < .12) sparks.push({ x: L.x, y: L.y + sz * .5, vx: rnd(-8, 8), vy: rnd(10, 30), a: .8, r: rnd(.6, 1.4) });
          drawLan(L.x, L.y + settle * 2.2, sz, L.sp, .35 + .65 * Math.min(1, q * 3), 1 + .25 * Math.sin(t * .006 + L.ph) + (L.pulse ? L.pulse() : 0));
        }
      }
      g.globalAlpha = 1;
      sparks = sparks.filter(s => s.a > .02);
      g.globalCompositeOperation = 'lighter';
      for (const s of sparks) { s.x += s.vx * dt / 1000; s.y += s.vy * dt / 1000; s.a -= dt / 700; g.globalAlpha = Math.max(0, s.a); g.fillStyle = '#ffc468'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.3); g.fill(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    };
    stops.push(M.loop(frame, { el }));

    // nghiêng máy: phố cổ và trăng lệch nhẹ
    if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!launched) { el.style.setProperty('--tx', x.toFixed(3)); el.style.setProperty('--ty', y.toFixed(3)); } }));

    // ---- easter egg: chạm trăng 3 lần -> biệt danh của hai bạn bay lên ----
    const moon = $('.lf-moon'); let taps = 0, tt = 0;
    moon.addEventListener('click', () => {
      taps++; clearTimeout(tt); tt = setTimeout(() => { taps = 0; }, 1800); M.tone('pop'); M.haptic('tap');
      if (taps < 3) return; taps = 0; M.tone('chime'); M.haptic('success');
      const names = ['bride', 'groom'].map(k => c.p.get(`traits.${k}.nickname`, '')).filter(Boolean);
      (names.length ? names : ['Trăng rằm', 'Trăng tròn']).slice(0, 2).forEach((nm, i) => {
        const d = document.createElement('div'); d.className = 'lf-egg'; d.style.setProperty('--ex', `${i ? 36 : -36}px`); d.style.animationDelay = `${i * .5}s`;
        d.innerHTML = `${lan('')}<span>${e(nm)}</span>`; $('.lf-glowlayer').appendChild(d); setTimeout(() => d.remove(), 6200);
      });
    });

    // ---- cử chỉ: vuốt chiếc đèn lên ----
    const hint = $('.lf-hint');
    const dist = () => Math.min(300, innerHeight * .4);
    el.style.setProperty('--dd', dist() + 'px');
    const begin = () => { if (!musicOn) { musicOn = true; EA.music(); M.requestTilt(); } };
    const setRise = p => { el.style.setProperty('--rp', p.toFixed(3)); };
    let lastTick = 0;
    M.drag(rise, {
      axis: 'y', distance: dist(), invert: true,
      onMove: p => { if (launched) return; begin(); setRise(p); hint.classList.add('gone'); const k = Math.floor(p * 4); if (k !== lastTick) { lastTick = k; if (k) { M.haptic('tap'); M.tone('click'); } } },
      onEnd: p => { if (launched) return; if (p >= .35) return launch(p); M.tween(p, 0, 420, 'out', setRise); hint.classList.remove('gone'); }
    });
    rise.addEventListener('click', ev => { if (ev.detail === 0) launch(0); });
    rise.addEventListener('keydown', ev => { if (ev.key === 'ArrowUp') { ev.preventDefault(); launch(0); } });
    stops.push(M.swipe(el, 'up', () => launch(0)));
    $('.open-btn').addEventListener('click', () => launch(0), { once: true });

    // ---- wow: đèn bay lên, đàn đèn xếp thành chữ cái đầu của hai bạn ----
    async function launch(p0) {
      if (launched || ended) return; launched = true; begin();
      el.classList.add('is-launch'); M.tone('whoosh'); M.haptic('thud');
      const reduced = M.reduced;
      const hb = head.getBoundingClientRect(), cr = el.getBoundingClientRect(), tb = $('.lf-town').getBoundingClientRect();
      const top = hb.bottom - cr.top + (W < 600 ? 56 : 34), bot = tb.top - cr.top + 14, hh = Math.max(110, bot - top);
      // lấy mẫu chữ
      try { await Promise.race([document.fonts.load('600 120px "Noto Serif Display"'), wait(500)]); } catch { /* */ }
      const fs = Math.min(300, hh / .74, (W * .44) / .78), gap = Math.min(W * .24, fs * .95);
      const oc = document.createElement('canvas'); oc.width = Math.ceil(W); oc.height = Math.ceil(hh); const og = oc.getContext('2d');
      og.font = `600 ${fs}px "Noto Serif Display", Georgia, serif`; og.textAlign = 'center'; og.textBaseline = 'alphabetic'; og.fillStyle = '#000';
      og.strokeStyle = '#000'; og.lineJoin = 'round'; og.lineWidth = fs * .075;
      [[mb, -gap], [mg, gap]].forEach(([ch, dx]) => { og.strokeText(ch, W / 2 + dx, hh / 2 + fs * .26); og.fillText(ch, W / 2 + dx, hh / 2 + fs * .26); });
      const img = og.getImageData(0, 0, oc.width, oc.height), maxN = Math.round(M.scale(190)) + 20;
      let step = clamp(fs / 11, 8, 17), pts = [];
      for (let tries = 0; tries < 6; tries++) {
        pts = [];
        for (let y = step / 2; y < oc.height; y += step * .92) for (let x = step / 2 + (Math.round(y / step) % 2) * step / 2; x < oc.width; x += step) {
          if (img.data[((y | 0) * oc.width + (x | 0)) * 4 + 3] > 140) pts.push([x + rnd(-1.5, 1.5), y + top + rnd(-1.5, 1.5)]);
        }
        if (pts.length <= maxN) break; step *= 1.18;
      }
      const lsz = clamp(step * 1.15, 13, 26), ry = riverY();
      pts.sort((a, b) => a[0] - b[0] + (Math.random() - .5) * 60);
      const now = t, total = reduced ? 1 : 1500;
      pts.forEach(([x, y], i) => {
        const L = { k: 'fleet', sx: rnd(-10, W + 10), sy: ry + rnd(10, 90), tx: x, ty: y, t0: now + (reduced ? 0 : 500 + i / pts.length * 1000 + rnd(0, 160)), dur: reduced ? 1 : rnd(1100, 1500), z: rnd(.7, 1), ph: rnd(0, 6.3), sz: lsz * rnd(.9, 1.1), sp: Math.floor(rnd(0, 3)) };
        lanterns.push(L);
      });
      // chiếc đèn của khách
      const rb = rise.getBoundingClientRect(), targetY = top + hh / 2;
      const dy = (rb.top + rb.height / 2 - cr.top) - targetY;
      const from = clamp(p0), dd = dist();
      const lift = v => { el.style.setProperty('--rp', (from + (dy / dd) * v).toFixed(4)); el.style.setProperty('--rl', v.toFixed(3)); };
      if (reduced) { lift(1); } else M.tween(0, 1, 2100, 'inOut', lift);
      $('.lf-hint').classList.add('gone');
      await wait(reduced ? 150 : 1750);
      if (ended) return;
      // đèn đã lên đủ: tỏa sáng, chuông, tên hai bạn
      M.tone('chime'); M.haptic('success');
      el.classList.add('is-lit');
      lanterns.filter(L => L.k === 'fleet').forEach((L, i) => { const t1 = t + i * 4; L.pulse = () => { const q = (t - t1) / 700; return q > 0 && q < 1 ? Math.sin(q * 3.14) * 1.4 : 0; }; });
      $('.lf-cap').textContent = 'Lời chúc của bạn đã lên cùng đàn đèn';
      await wait(reduced ? 500 : 1700);
      if (ended) return;
      open();
      setTimeout(stopCover, 1300);
    }
  });

  // ===================== SECTIONS =====================
  const head = (c, eb, title, sub) => c.ui.head(eb, title, sub);

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c, ph = realPhoto(c);
    return `<div class="lf-hero">
      <div class="lf-hsky" aria-hidden="true"><span class="lf-hmoon">${moonHTML('lg')}</span>${townSVG(21)}<div class="lf-hriver"><i></i><i></i></div></div>
      <div class="lf-drift" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(i => lan('d d' + i)).join('')}</div>
      <div class="lf-hin">
        <p class="lf-hk">${e(c.mod.content.eyebrow || 'Lưu ngày vui')}</p>
        <div class="lf-arch">${COUPLE}${ph ? `<img src="${e(ph)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high">` : ''}<i class="lf-archglow"></i></div>
        <h1 class="lf-hnames"><span>${e(cp.brideName.replace(/ /g, ' '))}</span><i>&amp;</i><span>${e(cp.groomName.replace(/ /g, ' '))}</span></h1>
        <p class="lf-hd">${c.dow} · ${c.dateText}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${cp.lunarDate ? `<p class="lf-hl">${e(cp.lunarDate)}</p>` : ''}
        ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Hồi âm', 'Bạn sẽ thả đèn cùng chúng mình chứ?', 'Mỗi lời hồi âm là một chiếc đèn trên dòng sông')}
    <div class="lf-rsvp"><div class="lf-paper">${c.ui.rsvpForm()}</div></div>
  </div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, [mb, mg] = monogram(c);
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="lf-bye"><div class="lf-byesky" aria-hidden="true"><span class="lf-bmoon">${moonHTML('lg')}</span>${[0, 1, 2, 3, 4, 5, 6].map(i => lan('u u' + i)).join('')}</div>
      <div class="wrap narrow lf-byein">
        <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
        <p class="lf-mono" aria-label="${e(D.monogram)}">${e(mb)}<i>&amp;</i>${e(mg)}</p>
        <p class="lf-byet">Hẹn gặp <b>${e(guest)}</b> trong ngày vui</p>
        <p>${e(D.thanks)}</p>
        ${mod.content.signature ? `<p class="lf-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
        <p class="kicker">${c.dateText}</p>
        <div class="actions center">
          <button class="btn" type="button" id="reopen">Thả đèn lần nữa ${EA.icon('replay')}</button>
          <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
        </div></div></div>`;
  });

  // ===================== ADD-ONS + FINALE =====================
  const wishList = c => {
    const seen = new Set(), out = [];
    const add = w => { const nm = String(w?.name || '').trim(), msg = String(w?.message || w?.note || '').trim(); if (!nm) return; const k = nm + '|' + msg; if (seen.has(k)) return; seen.add(k); out.push({ name: nm, message: msg }); };
    (c.mods.guestbook?.content?.samples || []).forEach(add);
    EA.list('guestbook').forEach(add);
    return Promise.resolve(EA.shared.list('lanterns')).catch(() => []).then(l => { (l || []).forEach(add); return out; });
  };

  const drawRiver = (main, c, flashName) => wishList(c).then(list => {
    const box = main.querySelector('.lf-rows'); if (!box) return;
    const items = list.slice(-14);
    const rows = [[], [], []]; items.forEach((w, i) => rows[i % 3].push(w));
    box.innerHTML = rows.map((r, ri) => `<div class="lf-row r${ri}">${r.map((w, i) => {
      const dur = 46 + ri * 14, delay = -(i / Math.max(1, r.length)) * dur - ri * 5;
      return `<button class="lf-wl${flashName && w.name === flashName ? ' new' : ''}" type="button" data-n="${esc(w.name)}" data-m="${esc(w.message)}" style="--dur:${dur}s;--dl:${delay.toFixed(1)}s" aria-label="Đèn của ${esc(w.name)}">${lan('')}<em>${esc(w.name)}</em></button>`;
    }).join('')}${[0, 1, 2].map(k => { const dur = 46 + ri * 14; return `<span class="lf-wl deco" aria-hidden="true" style="--dur:${dur}s;--dl:${(-(k + .5) / 3 * dur - ri * 9).toFixed(1)}s">${lan('')}</span>`; }).join('')}</div>`).join('');
    const cnt = main.querySelector('.lf-count'); if (cnt) cnt.textContent = items.length ? `${items.length} chiếc đèn đang trôi trên sông` : 'Chiếc đèn đầu tiên đang chờ bạn';
    main.querySelector('.lf-river-s')?.classList.toggle('empty', !items.length);
  });

  EA.afterRender((c, main) => {
    const M = c.motion, P = c.p, e = c.esc, D = c.data;
    const guestName = c.guest === (D.defaultGuest || 'Quý khách') ? '' : c.guest;
    const mk = (id, html, after) => { const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} lf-add`; s.innerHTML = html; const a = after && main.querySelector('#' + after); if (a) a.insertAdjacentElement('afterend', s); else main.appendChild(s); return s; };

    // --- Đêm Trung Thu: câu chuyện mặt trăng và đèn lồng ---
    const lunar = c.config.couple.lunarDate;
    mk('trungthu', `<div class="wrap"><header class="head"><p class="eyebrow">Đêm rằm</p><h2 class="title">Trăng tròn, đèn lên, một điều ước</h2></header>
      <div class="lf-phases" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<span class="ph p${i}" style="--i:${i}"><i></i></span>`).join('')}</div>
      <div class="lf-tt">
        <p>Mỗi đêm rằm, phố cổ Hội An tắt bớt đèn điện. Người ta thả hoa đăng xuống sông Hoài, và trăng soi xuống từng chiếc đèn giấy. Đêm Trung Thu cũng vậy: trăng tròn nhất năm, đèn lồng đi khắp phố, và ai cũng có một điều ước.</p>
        <p>Hai bạn mượn đêm rằm ấy để kể chuyện của mình${lunar ? `, và chọn ngày <b>${e(lunar)}</b> để đón bạn` : ''}. Hãy thả một chiếc đèn cùng chúng mình.</p>
      </div></div>`, 'invitation');

    // --- Ánh sáng của hai bạn: các add-on chỉ hiện khi có dữ liệu ---
    const cards = [];
    const places = P.get('places', []), hoi = Array.isArray(places) ? places.find(x => /hội an/i.test(x.name || '')) : null;
    if (hoi) {
      const m = String(hoi.date || '').match(/^(\d{4})-(\d{2})/);
      cards.push(`<article class="lf-card"><span class="lf-ic">${lan('')}</span><p class="lf-k">Hội An${m ? ` · tháng ${+m[2]}/${m[1]}` : ''}</p><h3>Lần đầu thả đèn cùng nhau</h3><p>Dưới ánh đèn bên sông Hoài, chúng mình đã ước một điều. Hôm nay chúng mình mời bạn đến chứng kiến điều ước ấy thành thật.</p></article>`);
    }
    if (P.has('song.title')) {
      cards.push(`<article class="lf-card"><span class="lf-ic">${lan('')}</span><p class="lf-k">Bài hát của hai đứa</p><h3>${e(P.get('song.title'))}</h3>${P.has('song.artist') ? `<p class="lf-by">${e(P.get('song.artist'))}</p>` : ''}${P.has('song.lyric') ? `<p class="lf-lyric">${e(P.get('song.lyric'))}</p>` : ''}</article>`);
    }
    if (P.daysTogether != null) {
      cards.push(`<article class="lf-card"><span class="lf-ic">${lan('')}</span><p class="lf-k">Từ ngày gặp nhau</p><h3><b class="lf-num" data-n="${P.daysTogether}">${fmt(P.daysTogether)}</b> đêm có nhau</h3><p>Mỗi đêm một chiếc đèn nhỏ, đến hôm nay đã thành cả một dòng sông.</p></article>`);
    }
    const hs = P.get('hometowns', {}), hp = P.get('hometownPins', {});
    if (hs.bride && hs.groom) {
      const km = hp.bride && hp.groom ? Math.round(P.kmBetween(hp.bride, hp.groom) / 10) * 10 : 0;
      cards.push(`<article class="lf-card lf-two"><span class="lf-ic two">${lan('a')}${lan('b')}</span><p class="lf-k">Hai quê, một bầu trời</p><h3>${e(hs.bride)} và ${e(hs.groom)}</h3><p>${km ? `Cách nhau ${fmt(km)} km, hai chiếc đèn từ hai quê cùng bay lên và gặp nhau trên một bầu trời.` : 'Hai chiếc đèn từ hai quê cùng bay lên và gặp nhau trên một bầu trời.'}</p></article>`);
    }
    if (cards.length) mk('lanterns-of-us', `<div class="wrap"><header class="head"><p class="eyebrow">Ánh sáng của hai bạn</p><h2 class="title">Những chiếc đèn đã thắp</h2></header><div class="lf-cards n${cards.length}">${cards.join('')}</div></div>`, 'story');

    // --- Dòng sông ước nguyện: mỗi lời hồi âm / lời chúc là một chiếc đèn ---
    mk('river', `<div class="wrap lf-river-s"><header class="head"><p class="eyebrow">Dòng sông ước nguyện</p><h2 class="title">Mỗi lời chúc là một chiếc đèn</h2><p class="sub lf-count">&nbsp;</p></header>
      <div class="lf-river-box"><div class="lf-rv-moon" aria-hidden="true"></div><div class="lf-rows"></div><div class="lf-waves" aria-hidden="true"></div>
        <div class="lf-wish" role="status" aria-live="polite" hidden><p class="lf-wm"></p><p class="lf-wn"></p></div></div>
      <p class="lf-tip">Chạm vào một chiếc đèn để đọc lời chúc. Gửi hồi âm hoặc lời chúc, đèn của bạn sẽ thả xuống đây.</p></div>`);
    const riverSec = main.querySelector('#river'), rsvp = main.querySelector('#rsvp');
    if (rsvp && riverSec) rsvp.insertAdjacentElement('beforebegin', riverSec);
    drawRiver(main, c);
    const box = main.querySelector('.lf-river-box'), wishEl = main.querySelector('.lf-wish');
    const closeWish = () => { box.classList.remove('reading'); wishEl.hidden = true; box.querySelectorAll('.lf-wl.on').forEach(b => b.classList.remove('on')); };
    box.addEventListener('click', ev => {
      const b = ev.target.closest('.lf-wl');
      if (!b) { closeWish(); return; }
      box.querySelectorAll('.lf-wl.on').forEach(x => x.classList.remove('on')); b.classList.add('on'); box.classList.add('reading');
      wishEl.querySelector('.lf-wm').textContent = b.dataset.m || 'Chúc hai bạn trăm năm hạnh phúc.';
      wishEl.querySelector('.lf-wn').textContent = b.dataset.n; wishEl.hidden = false; M.tone('pop'); M.haptic('tap');
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeWish(); });

    // --- hiệu ứng khi cuộn tới ---
    const num = main.querySelector('.lf-num');
    if (num) { const n = +num.dataset.n; if (!M.reduced) num.textContent = '0'; M.inView(num, () => M.tween(0, n, 1900, 'out', v => { num.textContent = fmt(v); }).then(() => { num.textContent = fmt(n); }), { threshold: .5 }); }
    main.querySelectorAll('.lf-phases').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .5 }));
    main.querySelectorAll('.lf-two').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .5 }));

    // --- nghiêng / cuộn: phố cổ trong hero lệch nhẹ ---
    const hero = main.querySelector('.lf-hero');
    if (hero && M.tier !== 'low') M.tilt(({ x, y }) => { hero.style.setProperty('--tx', x.toFixed(3)); hero.style.setProperty('--ty', y.toFixed(3)); });

    // --- finale: lời chúc / hồi âm thành đèn ---
    const floatUp = (name, extra) => {
      const f = document.createElement('div'); f.className = 'lf-float'; f.setAttribute('aria-hidden', 'true');
      f.innerHTML = `${lan('')}<span>${e(name || 'Quý khách')}</span>`; document.body.appendChild(f);
      for (let i = 0; i < (extra || 0); i++) { const s = document.createElement('div'); s.className = 'lf-float s'; s.style.setProperty('--dx', `${(i % 2 ? 1 : -1) * (50 + i * 30)}px`); s.style.animationDelay = `${.4 + i * .35}s`; s.innerHTML = lan(''); document.body.appendChild(s); setTimeout(() => s.remove(), 11000); }
      setTimeout(() => f.remove(), 10000);
    };
    const toRiver = (name, message) => {
      try { EA.shared.add('lanterns', { name, message }); } catch { /* local */ }
      setTimeout(() => drawRiver(main, c, name), 400);
    };
    EA.onRsvp(entry => {
      const name = String(entry?.name || guestName || '').trim();
      M.tone('chime'); M.haptic('success');
      floatUp(name, entry && entry.attending === false ? 0 : 4);
      if (name) toRiver(name, entry?.note || (entry?.attending === false ? '' : 'Mình sẽ đến chung vui với hai bạn.'));
      setTimeout(() => M.tone('pop'), 800);
    });
    EA.onGuestbook(entry => { const name = String(entry?.name || '').trim(); if (!name) return; floatUp(name, 2); toRiver(name, entry.message); M.tone('chime'); M.haptic('success'); });
  });
})();
