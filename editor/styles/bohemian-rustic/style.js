// Bohemian Rustic: một chuyến đi dưới nắng. Mặt trời mọc qua vòm cổng, dây macramé tự thắt nút thành tên đôi bạn.
// Cover: kéo mặt trời lên khỏi đồi -> bình minh, các nút macramé thắt từng hàng, tên được khâu bằng sợi dây, rồi ta bước qua vòm cổng.
// Ongoing: tua rua đung đưa theo độ nghiêng điện thoại (con lắc hai tầng), chiếc xe van chạy dọc bản đồ khi cuộn trang.
// Add-ons: bản đồ chuyến đi, đĩa than, nhịp sống mặt trời / mặt trăng, sổ lưu bút bên lửa trại. All art is inline SVG / CSS.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/bohemian-rustic.jpg';
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? PHOTO : h; };
  const nb = s => String(s ?? '').trim().replace(/ /g, ' ');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const P = { terra: '#b8573a', rust: '#9a4630', ochre: '#dca35b', sand: '#ecd9b8', cream: '#f6ecd8', sage: '#8a9a78', wood: '#a06f48', ink: '#3a2a22', edge: '#b89a78' };

  // ---------- art pieces ----------
  // A tassel is two stacked pendulums: the cord, then the skirt that lags behind it.
  const tassel = (x, y, len, col) => {
    const bead = y + len * .34, top = bead + 7, end = y + len, n = 9;
    let st = '';
    for (let i = 0; i < n; i++) { const d = (i - (n - 1) / 2), dx = d * len * .07; st += `<path d="M${(x + d * .5).toFixed(1)} ${top + 4}C${(x + dx * .5).toFixed(1)} ${(top + (end - top) * .4).toFixed(1)} ${(x + dx * 1.1).toFixed(1)} ${(top + (end - top) * .72).toFixed(1)} ${(x + dx * 1.2).toFixed(1)} ${end}"/>`; }
    return `<g class="br-t" data-ox="${x}" data-oy="${y}"><path d="M${x} ${y}V${bead}" stroke="${P.sand}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <g class="br-in" data-ox="${x}" data-oy="${bead}"><circle cx="${x}" cy="${bead}" r="5.4" fill="${P.wood}" stroke="#7a5233" stroke-width=".8"/><rect x="${x - 6}" y="${bead + 4}" width="12" height="7" rx="2.5" fill="${col}" stroke="${P.rust}" stroke-width=".7"/>
      <g stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round">${st}</g></g></g>`;
  };
  const DIV = `<svg class="br-div" viewBox="0 0 160 16" aria-hidden="true"><path d="M2 8H60M100 8H158" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M80 1.5l6.5 6.5-6.5 6.5L73.5 8z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M80 5l3 3-3 3-3-3z" fill="currentColor"/><path d="M64 8l3-3 3 3-3 3zM90 8l3-3 3 3-3 3z" fill="currentColor"/></svg>`;
  const pampas = (flip = 1) => {
    let s = '';
    [[0, 0, 150, -14], [14, 4, 120, 8], [-12, 6, 100, -30], [26, 8, 84, 22]].forEach(([dx, dy, h, bend], k) => {
      const x = dx, top = -h, tx = x + bend;
      s += `<g class="br-sw" style="--k:${k}"><path d="M${x} 0C${x} ${-h * .5} ${tx * .6} ${top * .75} ${tx} ${top}" stroke="#a88a5e" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 16; i++) { const t = .42 + i / 16 * .58, px = x + (tx - x) * t * t + ((i * 7) % 3 - 1) * 1.5, py = top * t; s += `<path d="M${px.toFixed(1)} ${py.toFixed(1)}q${(i % 2 ? 9 : -9) + bend * .15} ${-9 - (16 - i) * .7} ${(i % 2 ? 6 : -6)} ${-20 - (16 - i)}" stroke="${i % 3 ? '#e6cfa3' : '#cdae7a'}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".92"/>`; }
      s += '</g>';
    });
    return `<g transform="scale(${flip} 1)">${s}</g>`;
  };
  const VAN = (pet) => `<g class="br-van"><rect x="3" y="7" width="52" height="19" rx="6" fill="#e0a458"/><path d="M3 18h52v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="${P.terra}"/><rect x="8" y="3" width="42" height="5" rx="2.5" fill="${P.cream}" stroke="#7a5233" stroke-width=".6"/>
    <rect x="9" y="10" width="11" height="8" rx="2" fill="#cfe3e0"/>${pet ? `<path d="M11 18v-5l2 1.8h4L19 13v5z" fill="${P.cream}" stroke="#7a5233" stroke-width=".5"/>` : ''}<rect x="23" y="10" width="14" height="8" rx="2" fill="#cfe3e0"/><path d="M40 10h9a3 3 0 0 1 3 3v5H40z" fill="#cfe3e0"/>
    <circle cx="54" cy="21" r="1.6" fill="#ffe9a8"/><g class="wh"><circle cx="16" cy="27" r="5.2" fill="${P.ink}"/><circle cx="16" cy="27" r="2" fill="${P.cream}"/><path d="M16 22.5v9" stroke="${P.cream}" stroke-width=".8"/></g><g class="wh"><circle cx="43" cy="27" r="5.2" fill="${P.ink}"/><circle cx="43" cy="27" r="2" fill="${P.cream}"/><path d="M43 22.5v9" stroke="${P.cream}" stroke-width=".8"/></g></g>`;
  const SUN_IC = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="7" fill="${P.ochre}" stroke="${P.rust}" stroke-width="1.6"/><path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M30.6 9.4l-3.5 3.5M12.9 27.1l-3.5 3.5" stroke="${P.rust}" stroke-width="2" stroke-linecap="round"/></svg>`;
  const MOON_IC = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M26 6a14 14 0 1 0 8 22A12 12 0 0 1 26 6z" fill="${P.sand}" stroke="${P.rust}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="30" cy="12" r="1.3" fill="${P.rust}"/><circle cx="34" cy="19" r=".9" fill="${P.rust}"/></svg>`;

  // physics for every .br-t inside a root svg: spring toward the tilt, damped, plus a gentle breeze. Drag a tassel and let go.
  const physics = (svg, M, c) => {
    const ts = [...svg.querySelectorAll('.br-t')].map((g, i) => ({ g, inn: g.querySelector('.br-in'), ox: +g.dataset.ox, oy: +g.dataset.oy, ix: +g.querySelector('.br-in').dataset.ox, iy: +g.querySelector('.br-in').dataset.oy, a: 0, v: 0, a2: 0, v2: 0, ph: i * 1.7, k: 22 + (i % 3) * 5, drag: null }));
    if (!ts.length) return () => {};
    let tx = 0, last = 0;
    const off = M.tilt(({ x }) => { tx = x; });
    const toSvg = (e) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(e.clientX - r.left) / r.width * vb.width + vb.x, (e.clientY - r.top) / r.height * vb.height + vb.y]; };
    ts.forEach(t => {
      t.g.style.cursor = 'grab'; t.g.style.touchAction = 'none';
      t.g.addEventListener('pointerdown', e => { t.drag = e.pointerId; t.g.setPointerCapture?.(e.pointerId); M.tone('click'); });
      t.g.addEventListener('pointermove', e => { if (t.drag !== e.pointerId) return; const [px, py] = toSvg(e); t.da = clamp(Math.atan2(px - t.ox, py - t.oy) * 57.3, -60, 60); });
      const end = e => { if (t.drag !== e.pointerId) return; t.drag = null; if (Math.abs(t.a) > 26) { M.tone('chime'); M.haptic('tap'); } };
      t.g.addEventListener('pointerup', end); t.g.addEventListener('pointercancel', end);
    });
    const stop = M.loop((time, dt) => {
      const s = Math.min(dt, 40) / 1000, w = M.reduced ? 0 : 1;
      ts.forEach(t => {
        const tgt = t.drag != null ? (t.da || 0) : tx * 11 + Math.sin(time / 1000 * .9 + t.ph) * 1.6 * w;
        t.v += (-t.k * (t.a - tgt) - 2.6 * t.v) * s; t.a += t.v * s;
        t.v2 += (-34 * (t.a2 - t.a * .55) - 3.4 * t.v2) * s; t.a2 += t.v2 * s;
        t.g.setAttribute('transform', `rotate(${t.a.toFixed(2)} ${t.ox} ${t.oy})`);
        t.inn.setAttribute('transform', `rotate(${(t.a2 * .8).toFixed(2)} ${t.ix} ${t.iy})`);
      });
    }, { el: svg });
    svg._kick = (amp = 40) => ts.forEach((t, i) => { t.v += (i % 2 ? -1 : 1) * amp * (1 + i * .08); });
    return () => { stop(); off(); };
  };
  const stops = [];

  // ---------- the cover scene: arch, sun, hills, macramé hanging, all in one svg ----------
  const knotRows = () => {
    const xs = Array.from({ length: 9 }, (_, i) => 112 + i * 17.25);
    let s = '';
    for (let r = 0; r < 4; r++) for (let j = 0; j < 4; j++) {
      const i = r % 2 ? 1 + j * 2 : j * 2, cx = (xs[i] + xs[i + 1]) / 2, cy = 148 + r * 16;
      s += `<g transform="translate(${cx.toFixed(1)} ${cy})"><g class="br-kn" style="--r:${r};--j:${j}"><ellipse rx="10.5" ry="7.4" fill="${P.cream}" stroke="${P.edge}" stroke-width="1.1"/><path d="M-8 -2.2q8 6 16 0M-8 2.2q8-6 16 0" stroke="${P.edge}" stroke-width="1" fill="none"/></g></g>`;
    }
    return { xs, s };
  };
  const scene = (c) => {
    const D = c.data, { xs, s: knots } = knotRows();
    const cords = xs.map(x => `<path d="M${x.toFixed(1)} 124V216" stroke="${P.edge}" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M${x.toFixed(1)} 124V216" stroke="${P.cream}" stroke-width="2.8" stroke-linecap="round" fill="none"/>`).join('');
    const fringe = Array.from({ length: 17 }, (_, i) => { const x = 108 + i * 9, l = 30 + ((i * 37) % 17); return `<path d="M${x} 338q${i % 2 ? 2 : -2} ${l / 2} ${i % 3 - 1} ${l}" stroke="${P.edge}" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M${x} 338q${i % 2 ? 2 : -2} ${l / 2} ${i % 3 - 1} ${l}" stroke="${P.cream}" stroke-width="1.9" stroke-linecap="round" fill="none"/>`; }).join('');
    const weft = [0, 1, 2].flatMap(k => [`<path class="br-weft" style="--w:${k}" d="M104 ${221 + k * 5}H256" pathLength="1"/>`, `<path class="br-weft" style="--w:${k + 3}" d="M256 ${327 + k * 4}H104" pathLength="1"/>`]).join('');
    const stars = [[120, 100], [150, 90], [208, 96], [236, 118], [100, 140], [250, 152], [132, 170], [226, 188], [176, 80]].map(([x, y], i) => `<circle class="br-star" style="--i:${i}" cx="${x}" cy="${y}" r="${i % 3 ? 1.1 : 1.6}" fill="#fff4dc"/>`).join('');
    const rays = Array.from({ length: 18 }, (_, i) => `<path d="M0 -62L${i % 2 ? 4 : 6} -96L${i % 2 ? -4 : -6} -96z" transform="rotate(${i * 20})" fill="#fff0c0"/>`).join('');
    return `<svg class="br-scene" viewBox="0 0 360 560" role="img" aria-label="${esc(D.bride.name)} và ${esc(D.groom.name)}">
      <defs>
        <linearGradient id="brSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sk1)"/><stop offset="1" style="stop-color:var(--sk2)"/></linearGradient>
        <radialGradient id="brGlow"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffb06a" stop-opacity=".45"/><stop offset="1" stop-color="#ff8a50" stop-opacity="0"/></radialGradient>
        <radialGradient id="brSun" cx=".4" cy=".35"><stop offset="0" stop-color="#fff3c4"/><stop offset=".6" stop-color="#ffc062"/><stop offset="1" stop-color="#f0873e"/></radialGradient>
        <clipPath id="brClip"><path d="M86 470V170A94 94 0 0 1 274 170V470z"/></clipPath>
        <pattern id="brWeave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#d8c5a0" stroke-width=".7" opacity=".6"/></pattern>
      </defs>
      <g class="br-pampas l" transform="translate(40 500)">${pampas(1)}</g><g class="br-pampas r" transform="translate(320 500)">${pampas(-1)}</g>
      <path d="M30 470V170A150 150 0 0 1 330 170V470z" fill="${P.terra}"/><path d="M44 470V170A136 136 0 0 1 316 170V470z" fill="#d98a5a"/><path d="M58 470V170A122 122 0 0 1 302 170V470z" fill="#ecc189"/><path d="M72 470V170A108 108 0 0 1 288 170V470z" fill="${P.sage}"/>
      <path d="M86 470V170A94 94 0 0 1 274 170V470z" fill="url(#brSky)"/>
      <g clip-path="url(#brClip)">
        ${stars}
        <g class="br-sunwrap"><circle r="140" fill="url(#brGlow)" class="br-glow"/><g class="br-rays">${rays}</g><circle r="44" fill="url(#brSun)"/></g>
        <path d="M60 456C110 436 150 446 190 440S260 430 300 448V480H60z" style="fill:var(--h2)"/><path d="M60 470C100 452 140 462 180 456S250 450 300 464V480H60z" style="fill:var(--h1)"/>
      </g>
      <path d="M-200 480C-100 468 120 476 180 470S400 468 560 478V560H-200z" fill="#7a3f2c"/><path d="M-200 500C-100 490 130 498 190 492S410 490 560 500V560H-200z" fill="#5a2e22"/>
      <g class="br-hang">
        <path d="M98 122L180 74L262 122" stroke="${P.edge}" stroke-width="3.6" fill="none" stroke-linejoin="round"/><path d="M98 122L180 74L262 122" stroke="${P.sand}" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <circle cx="180" cy="73" r="4.5" fill="${P.wood}"/>
        ${cords}
        <g class="br-knots">${knots}</g>
        <rect x="104" y="214" width="152" height="124" rx="5" fill="${P.cream}" stroke="${P.edge}" stroke-width="1.2"/><rect x="104" y="214" width="152" height="124" rx="5" fill="url(#brWeave)"/>
        <g class="br-wefts" fill="none" stroke="${P.terra}" stroke-width="2.2" stroke-linecap="round">${weft}</g>
        <g class="br-names" text-anchor="middle">
          <text class="n1" x="180" y="266" font-size="30">${esc(D.bride.name)}</text>
          <text class="va" x="180" y="288" font-size="28">và</text>
          <text class="n2" x="180" y="315" font-size="30">${esc(D.groom.name)}</text>
          <g class="br-stitch" fill="none" stroke="${P.terra}" stroke-width=".9" stroke-linecap="round" stroke-dasharray="3 2.4"><text class="s1" x="180" y="266" font-size="30">${esc(D.bride.name)}</text><text class="s2" x="180" y="315" font-size="30">${esc(D.groom.name)}</text></g>
        </g>
        <g class="br-fringe">${fringe}</g>
        <rect x="90" y="117" width="180" height="9" rx="4.5" fill="${P.wood}" stroke="#7a5233" stroke-width="1"/><circle cx="90" cy="121.5" r="6" fill="${P.wood}" stroke="#7a5233" stroke-width="1"/><circle cx="270" cy="121.5" r="6" fill="${P.wood}" stroke="#7a5233" stroke-width="1"/>
        ${tassel(96, 124, 104, P.terra)}${tassel(264, 124, 104, P.ochre)}
      </g></svg>`;
  };
  const fitText = (svg, max) => svg.querySelectorAll('.br-names .n1, .br-names .n2, .br-stitch text').forEach(t => {
    let size = 30; t.setAttribute('font-size', size);
    for (let i = 0; i < 6 && t.getComputedTextLength() > max; i++) { size -= 3; t.setAttribute('font-size', size); }
  });

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    stops.splice(0).forEach(f => { try { f(); } catch { /* */ } });
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="br-cover" style="--p:0">
      <p class="br-eyebrow">Cùng nhau đón bình minh</p>
      <div class="br-stagebox"><div class="br-stage">${scene(c)}<button class="br-grab" type="button" aria-label="Kéo mặt trời lên để đón bình minh"></button></div></div>
      <div class="br-foot">
        <div class="br-dateline"><span>${c.dow}</span><i></i><b>${c.dateText}</b></div>
        <p class="br-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="br-hint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Kéo mặt trời lên</span></p>
        <button class="open-btn" type="button">Đón bình minh</button>
      </div>
      <canvas class="br-fx" aria-hidden="true"></canvas>
    </div>`;
    const root = el.querySelector('.br-cover'), stage = el.querySelector('.br-stage'), svg = el.querySelector('.br-scene'), grab = el.querySelector('.br-grab'), openBtn = el.querySelector('.open-btn');
    const sunwrap = svg.querySelector('.br-sunwrap');
    const setP = v => { root.style.setProperty('--p', v.toFixed(4)); sunwrap.setAttribute('transform', `translate(180 ${(470 - v * 320).toFixed(1)})`); };
    setP(0);
    c.after(60, () => fitText(svg, 140));
    document.fonts?.ready.then(() => fitText(svg, 140));
    const offPhys = physics(svg, M, c);
    stops.push(offPhys);
    root.querySelectorAll('.br-star').forEach(s => { s.style.animationDelay = `${(+s.style.getPropertyValue('--i') * -.7).toFixed(1)}s`; });

    // sparks and dust motes
    const fx = M.particles(el.querySelector('.br-fx'), {
      count: 0, init(p) { if (!p.burst) p.dead = true; },
      step(p, dt) { if (p.dead) return true; const k = Math.pow(.96, dt / 16); p.vx *= k; p.vy = (p.vy + .0004 * dt) * k; p.x += p.vx * dt; p.y += p.vy * dt; return p.life < 1900; },
      draw(g, p) { if (p.dead) return; g.globalAlpha = clamp(1 - p.life / 1900); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill(); g.globalAlpha = 1; }
    });
    stops.push(() => fx.stop());
    const sparks = () => {
      const r = sunwrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      fx.burst(70, p => { const a = Math.random() * 6.28, sp = .1 + Math.random() * .5; p.x = cx; p.y = cy; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - .08; p.r = 1 + Math.random() * 2.4; p.c = ['#ffe9a8', '#ffc062', '#fff6dc', '#f0873e'][(Math.random() * 4) | 0]; });
    };

    let started = false, cur = 0, epoch = 0;
    const sequence = () => {
      root.classList.add('is-risen'); M.haptic('thud'); M.tone('chime'); sparks();
      c.after(300, () => { root.classList.add('is-tying'); [0, 1, 2, 3].forEach(r => c.after(r * 240, () => M.tone('click'))); });
      c.after(1350, () => { root.classList.add('is-weaving'); M.tone('pop'); });
      c.after(2350, () => { svg._kick?.(46); M.tone('whoosh'); M.haptic('success'); });
      c.after(3150, () => { root.classList.add('is-leaving'); });
      c.after(3900, () => { open(); c.after(800, () => stops.splice(0).forEach(f => f())); });
    };
    const finish = (from, viaDrag) => {
      if (started) return; started = true; epoch++; const my = epoch; openBtn.disabled = true; root.classList.remove('is-drag');
      if (viaDrag) EA.music();
      M.requestTilt();
      M.tween(from, 1, viaDrag ? 420 : 2600, viaDrag ? 'out' : 'inOut', v => { if (my === epoch) { cur = v; setP(v); } }).then(() => { setP(1); sequence(); });
      if (!viaDrag) { M.tone('pop'); M.haptic('tap'); }
    };
    M.drag(grab, {
      axis: 'y', distance: Math.max(150, stage.clientHeight * .42), invert: true,
      onMove: p => { if (started) return; epoch++; cur = p; setP(p); root.classList.add('is-drag'); },
      onEnd: p => {
        if (started) return; root.classList.remove('is-drag');
        if (p >= .72) return finish(p, true);
        const from = p, my = ++epoch; M.tween(from, 0, 650, 'spring', v => { if (my === epoch && !started) { cur = Math.max(0, v); setP(cur); } });
      }
    });
    grab.addEventListener('pointerdown', () => { if (!started) { M.requestTilt(); M.haptic('tap'); M.tone('click'); } });
    grab.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); finish(cur, false); } });
    openBtn.addEventListener('click', () => finish(cur, false));
  });

  // ======================= SECTIONS =======================
  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="br-hd"><p class="br-eb">${mc.eyebrow != null ? c.esc(mc.eyebrow) : eyebrow}</p><h2>${mc.title != null ? c.esc(mc.title) : title}</h2>${DIV}${sub ? `<p class="br-sub">${sub}</p>` : ''}</header>`;
  };

  // ---- hero: an arch of sun-rays and the couple, tassels swinging from a dowel above ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content;
    const cols = [P.terra, P.ochre, P.sage, P.ochre, P.terra];
    return `<div class="br-hero">
      <svg class="br-dowel" viewBox="0 0 360 150" aria-hidden="true"><rect x="14" y="10" width="332" height="9" rx="4.5" fill="${P.wood}" stroke="#7a5233"/><circle cx="14" cy="14.5" r="6.5" fill="${P.wood}" stroke="#7a5233"/><circle cx="346" cy="14.5" r="6.5" fill="${P.wood}" stroke="#7a5233"/>
        ${[34, 107, 180, 253, 326].map((x, i) => tassel(x, 19, i === 2 ? 74 : i % 2 ? 100 : 124, cols[i])).join('')}</svg>
      <p class="br-eb">${e(mc.eyebrow || 'Chung một chuyến đi, chung một mái nhà')}</p>
      <div class="br-arcw"><i class="br-rays" aria-hidden="true"></i>
        <svg class="br-pam l" viewBox="-30 -170 80 190" aria-hidden="true">${pampas(1)}</svg><svg class="br-pam r" viewBox="-30 -170 80 190" aria-hidden="true">${pampas(-1)}</svg>
        <div class="br-ar1"><div class="br-ar2"><div class="br-ar3"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"></div></div></div></div>
      <h1 class="br-names"><span>${e(nb(D.bride.name))}</span><span class="va">và</span><span>${e(nb(D.groom.name))}</span></h1>
      ${DIV}
      ${cp.headline ? `<p class="br-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="br-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</button>
      ${cp.lunarDate ? `<p class="br-lunar">${e(cp.lunarDate)}</p>` : ''}
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  // ---- invitation: the letter on a hanging cotton sheet, a vinyl for your song ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content;
    const song = c.p.get('song', null), days = c.p.daysTogether;
    return `<div class="wrap narrow">
      <div class="br-paper"><i class="br-bar" aria-hidden="true"></i>
        <span class="br-eb">Thư mời</span>
        <div class="br-salute">${t(mc.greeting || 'Gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>${DIV}
        ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="br-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
        <div class="br-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></div>
      </div>
      ${days ? `<p class="br-days"><b>${days.toLocaleString('vi-VN')}</b> ngày đã đi cùng nhau, và con đường vẫn còn dài</p>` : ''}
      ${song && song.title ? `<figure class="br-vinyl"><div class="br-disc"><div class="br-rec"><span class="lb"><i></i></span></div></div>
        <figcaption><span class="br-eb">Bài hát của chúng mình</span><b>${e(song.title)}</b>${song.artist ? `<em>${e(song.artist)}</em>` : ''}${song.lyric ? `<q>${e(song.lyric)}</q>` : ''}</figcaption></figure>` : ''}
    </div>`;
  });

  // ---- families + two sun/moon charms (traits) ----
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="br-fam"><span class="br-eb">${label}</span><span class="nm">Ông ${e(f.father)}</span><span class="nm">Bà ${e(f.mother)}</span>${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const charm = (who, i) => {
      const t = c.p.get(`traits.${who}`, null); if (!t) return '';
      const rows = [t.drink && ['Thức uống', t.drink], t.hobby && ['Sở thích', t.hobby]].filter(Boolean);
      if (!t.nickname && !rows.length && !t.rhythm) return '';
      return `<article class="br-charm"><svg viewBox="0 0 100 130" aria-hidden="true"><path d="M50 0V22" stroke="${P.sand}" stroke-width="2.4"/><circle cx="50" cy="52" r="32" fill="${P.wood}" stroke="#7a5233" stroke-width="1.2"/><circle cx="50" cy="52" r="26" fill="${t.rhythm === 'night' ? '#4a3346' : '#f2c98a'}" stroke="${P.cream}" stroke-width="1.2"/>
        <g transform="translate(30 32) scale(1)">${t.rhythm === 'night' ? MOON_IC : SUN_IC}</g>${tassel(50, 82, 44, i ? P.ochre : P.terra)}</svg>
        <p class="br-eb">${e(D[who].short || D[who].name)}${t.rhythm ? ` · ${t.rhythm === 'night' ? 'Cú đêm' : 'Người của bình minh'}` : ''}</p>
        ${t.nickname ? `<h3>${e(t.nickname)}</h3>` : ''}${rows.map(r => `<p class="br-row"><span>${r[0]}</span>${e(r[1])}</p>`).join('')}</article>`;
    };
    const charms = charm('bride', 0) + charm('groom', 1);
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="br-fam-grid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      <p class="br-couple"><span>${e(nb(D.groom.name))}</span><i>và</i><span>${e(nb(D.bride.name))}</span></p>
      ${D.announceNote ? `<p class="br-fam-note">${e(D.announceNote)}</p>` : ''}
      ${charms ? `<div class="br-charms" aria-label="Hai nhịp sống">${charms}</div>` : ''}
    </div>`;
  });

  // ---- story: polaroid chapters, then the road trip ----
  const mapData = c => {
    const places = (c.p.get('places', []) || []).filter(p => p && isFinite(p.lat) && isFinite(p.lng));
    if (places.length < 2) return null;
    places.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const OUT = [[102.15, 22.4], [102.4, 22.75], [103.0, 22.45], [103.35, 22.75], [104.0, 22.5], [104.4, 22.82], [105.0, 23.2], [105.5, 23.1], [106.0, 22.95], [106.7, 22.85], [107.3, 22.4], [108.0, 21.55], [107.4, 21.3], [107.0, 20.85], [106.7, 20.6], [106.55, 20.25], [106.2, 19.95], [105.9, 19.5], [105.7, 18.8], [106.2, 18.3], [106.6, 17.5], [107.2, 16.8], [107.7, 16.4], [108.2, 16.1], [108.9, 15.1], [109.3, 13.8], [109.3, 12.9], [109.2, 12.2], [109.0, 11.5], [108.4, 10.95], [107.5, 10.45], [106.8, 10.4], [106.5, 9.8], [106.0, 9.4], [105.5, 8.8], [104.85, 8.6], [104.75, 9.2], [105.0, 9.9], [104.85, 10.3], [104.5, 10.45], [104.9, 10.75], [105.5, 11.0], [106.1, 11.35], [106.9, 11.95], [107.4, 12.3], [107.55, 13.0], [107.55, 14.4], [107.3, 15.2], [106.8, 16.0], [106.3, 16.6], [105.7, 17.5], [105.2, 18.2], [104.5, 18.9], [104.1, 19.5], [104.2, 20.0], [103.5, 20.4], [103.0, 20.2], [102.4, 21.0], [102.1, 21.8]];
    const all = OUT.concat(places.map(p => [p.lng, p.lat]));
    const lo = [Math.min(...all.map(a => a[0])), Math.min(...all.map(a => a[1]))], hi = [Math.max(...all.map(a => a[0])), Math.max(...all.map(a => a[1]))];
    const k = Math.cos((lo[1] + hi[1]) / 2 * Math.PI / 180), W = 250, H = 470;
    const s = Math.min(W / ((hi[0] - lo[0]) * k), H / (hi[1] - lo[1]));
    const w = (hi[0] - lo[0]) * k * s, h = (hi[1] - lo[1]) * s, ox = (320 - w) / 2, oy = 24;
    const pr = ([lng, lat]) => [ox + (lng - lo[0]) * k * s, oy + (hi[1] - lat) * s];
    return { places, OUT: OUT.map(pr), pts: places.map(p => pr([p.lng, p.lat])), h: h + oy * 2 };
  };
  const smooth = pts => pts.map((p, i) => {
    if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    const a = pts[i - 2] || pts[i - 1], b = pts[i - 1], d = pts[i + 1] || p;
    return `C${(b[0] + (p[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (p[1] - a[1]) / 6).toFixed(1)} ${(p[0] - (d[0] - b[0]) / 6).toFixed(1)} ${(p[1] - (d[1] - b[1]) / 6).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }).join('');
  const fmtDate = d => { const m = /^(\d{4})-(\d{2})/.exec(d || ''); return m ? `${m[2]}/${m[1]}` : ''; };

  EA.section('story', c => {
    const { esc: e, mod } = c, s = mod.content, md = mapData(c), pet = c.p.get('pet', null);
    const map = md ? `<figure class="br-map" aria-label="Bản đồ chuyến đi của hai bạn">
      <header class="br-hd"><p class="br-eb">Những chặng đường</p><h3 class="br-h3">Chuyến đi của chúng mình</h3></header>
      <svg viewBox="0 0 320 ${md.h.toFixed(0)}" role="img" aria-label="${md.places.length} điểm đến: ${esc(md.places.map(p => p.name).join(', '))}">
        <path class="coast" d="M${md.OUT.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L')}Z"/>
        <path class="road bg" d="${smooth(md.pts)}"/><path class="road" pathLength="1" d="${smooth(md.pts)}"/>
        ${md.pts.map((p, i) => { const left = p[0] > 150; return `<g class="pin" style="--i:${i}" transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><circle r="5.5"/><circle r="2" class="c"/><text x="${left ? -11 : 11}" y="-3" text-anchor="${left ? 'end' : 'start'}">${esc(md.places[i].name.replace(/^(Thư viện|Bãi biển) /, ''))}</text><text class="dt" x="${left ? -11 : 11}" y="11" text-anchor="${left ? 'end' : 'start'}">${fmtDate(md.places[i].date)}</text></g>`; }).join('')}
        <g class="vanrun" transform="translate(${md.pts[0][0].toFixed(1)} ${md.pts[0][1].toFixed(1)})"><g class="vanflip"><g transform="translate(-18 -20) scale(.6)">${VAN(!!pet?.name)}</g></g></g>
      </svg>
      <figcaption>${md.places.length} điểm dừng${pet?.name ? `, và ${esc(pet.name)} ngồi ghế phụ` : ''}</figcaption></figure>` : '';
    return `<div class="wrap">
      ${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="br-chaps">${(s.chapters || []).map(ch => `<li class="br-chap">${ch.image ? `<figure><i class="br-tape"></i><img src="${e(ch.image)}" alt="" loading="lazy"></figure>` : ''}<div><p class="br-eb">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="br-sq">${e(s.quote)}</p>` : ''}
      ${map}
    </div>`;
  });

  EA.section('gallery', c => `<div class="wrap">
    ${head(c, 'Khung hình hạnh phúc', 'Khoảnh khắc của chúng mình')}
    <div class="photos br-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div>
  </div>`);

  EA.section('quote', c => {
    const { data: D, esc: e } = c, q = c.p.get('quote', null), j = c.p.get('insideJoke', '');
    return `<div class="wrap narrow">${head(c, 'Lời nhắn', 'Đôi dòng bên đường')}
      <blockquote class="br-quote">${e(D.quote)}</blockquote>
      ${q?.text ? `<p class="br-pq">“${e(q.text)}”${q.author ? `<small>${e(q.author)}</small>` : ''}</p>` : ''}
      ${j ? `<p class="br-joke"><span>Chuyện riêng của hai đứa</span>${e(j)}</p>` : ''}</div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Chiếc xe van đã chừa sẵn một chỗ cho bạn')}
    <div class="br-rsvp">${c.ui.rsvpForm()}</div></div>`);

  // ---- guestbook: wishes rise from the campfire as sparks ----
  EA.section('guestbook', c => {
    const mc = c.mod.content;
    const flame = (cls, d, col) => `<path class="fl ${cls}" d="${d}" fill="${col}"/>`;
    return `<div class="wrap narrow">
      ${head(c, 'Sổ lưu bút', 'Bên đống lửa trại', c.esc(mc.prompt || 'Viết vài dòng, lời chúc sẽ bay lên như tia lửa.'))}
      <div class="br-fire"><canvas class="br-embers" aria-hidden="true"></canvas><div class="br-sparkbox" aria-live="polite"></div>
        <svg viewBox="0 0 300 220" aria-hidden="true">
          <defs><radialGradient id="brFg"><stop offset="0" stop-color="#ffb35c" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/></radialGradient></defs>
          <circle class="glow" cx="150" cy="150" r="110" fill="url(#brFg)"/>
          <g>${flame('f1', 'M150 190C100 190 92 140 118 108C122 126 132 130 138 124C130 96 146 70 156 40C168 72 196 96 192 136C190 156 184 190 150 190z', '#e8672f')}${flame('f2', 'M150 190C118 190 112 156 130 130C134 144 142 146 146 140C142 120 150 104 158 86C166 108 184 124 180 150C178 172 172 190 150 190z', '#f6a53c')}${flame('f3', 'M150 190C134 190 132 172 142 158C146 166 150 166 152 160C152 150 156 142 160 134C166 148 172 158 168 172C166 184 162 190 150 190z', '#ffe08a')}</g>
          <g stroke="#3a2418" stroke-width="1.5"><rect x="92" y="186" width="116" height="16" rx="8" fill="#6b4328" transform="rotate(-9 150 194)"/><rect x="92" y="186" width="116" height="16" rx="8" fill="#7d5130" transform="rotate(9 150 194)"/></g>
          ${[60, 84, 216, 240].map((x, i) => `<ellipse cx="${x}" cy="${204 + (i % 2) * 4}" rx="14" ry="8" fill="${i % 2 ? '#6e5a4a' : '#8a7562'}" stroke="#3a2a22"/>`).join('')}
        </svg></div>
      <div class="book br-book">${c.ui.wishForm()}<ul class="wish-list"></ul></div></div>`;
  });

  // ---- thanks: the day ends, the van is parked, lights come on ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const bulbs = Array.from({ length: 9 }, (_, i) => { const x = 14 + i * 41.5, y = 18 + Math.sin(i / 8 * Math.PI) * 26 + 6; return `<circle class="bu" style="--i:${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4.2"/>`; }).join('');
    return `<div class="br-bye"><span class="br-eb">Lời cảm ơn</span>
      <svg class="br-dusk" viewBox="0 0 360 200" aria-hidden="true"><defs><linearGradient id="brDk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2535"/><stop offset=".6" stop-color="#b8573a"/><stop offset="1" stop-color="#f0a56a"/></linearGradient></defs>
        <path d="M8 200V110A172 172 0 0 1 352 110V200z" fill="url(#brDk)"/>
        <circle class="sun" cx="180" cy="150" r="46" fill="#ffd28a"/><path d="M0 160C60 148 120 158 180 152S300 148 360 158V200H0z" fill="#5a2e22"/><path d="M0 176C80 166 140 174 200 170S320 168 360 176V200H0z" fill="#3a2018"/>
        <path d="M14 22Q180 66 346 22" stroke="#2a1812" stroke-width="1.5" fill="none"/>${bulbs}
        <g transform="translate(236 140) scale(1.1)">${VAN(!!c.p.get('pet.name'))}</g></svg>
      <p class="br-bye-line">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="br-bye-text">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="br-bye-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="br-bye-date">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Đón bình minh lần nữa ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div></div>`;
  });

  // ======================= behaviours =======================
  const vanRun = (text, c) => {
    const d = document.createElement('div'); d.className = 'br-vanrun';
    d.innerHTML = `<svg viewBox="-110 0 180 40" aria-hidden="true"><path d="M-104 8Q-60 22 -4 14" stroke="#7a5233" stroke-width="1.2" fill="none"/><g class="flag"><path d="M-104 4h96v26h-96z" fill="#f6ecd8" stroke="#b89a78"/><path d="M-104 4l10 13-10 13" fill="#f6ecd8" stroke="#b89a78"/><text x="-54" y="21" text-anchor="middle" font-size="9.5"${text.length > 16 ? ' textLength="86" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(text)}</text></g><g transform="translate(0 4)">${VAN(!!c.p.get('pet.name'))}</g></svg>`;
    document.body.appendChild(d); setTimeout(() => d.remove(), 8200);
  };
  let fire = null;
  EA.afterRender((c, main) => {
    const M = c.motion;
    main.querySelectorAll('.br-dowel, .br-charm svg').forEach(svg => { const off = physics(svg, M, c); stops.push(off); });

    // easter egg: tap the date three times and the van honks past, shaking every tassel
    const dateBtn = main.querySelector('.br-date');
    if (dateBtn) {
      let taps = 0, timer = 0;
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100); M.tone('click');
        if (taps >= 3) { taps = 0; vanRun('Bíp bíp! Đi thôi nào!', c); main.querySelector('.br-dowel')?._kick?.(70); M.haptic('success'); M.tone('chime'); c.after(250, () => M.tone('pop')); }
      });
    }
    // vinyl spins while visible
    main.querySelectorAll('.br-vinyl').forEach(v => M.inView(v, () => v.classList.add('on'), { threshold: .3 }));
    // the road trip: the van drives as the map scrolls by
    const map = main.querySelector('.br-map');
    if (map) {
      const road = map.querySelector('path.road:not(.bg)'), van = map.querySelector('.vanrun'), flip = map.querySelector('.vanflip');
      const len = road.getTotalLength(), pins = [...map.querySelectorAll('.pin')];
      let lastX = 0;
      const place = t => {
        const pt = road.getPointAtLength(len * t); van.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        flip.setAttribute('transform', pt.x < lastX - .1 ? 'scale(-1 1)' : pt.x > lastX + .1 ? 'scale(1 1)' : flip.getAttribute('transform') || ''); lastX = pt.x;
        road.style.strokeDashoffset = (1 - t).toFixed(4);
        pins.forEach((p, i) => p.classList.toggle('on', t >= i / Math.max(1, pins.length - 1) - .02));
      };
      if (M.reduced) place(1); else M.scrollProgress(map, p => place(clamp((p - .22) / .5)));
    }
    // campfire: embers drift up all the time, and each wish becomes a spark
    const box = main.querySelector('.br-fire');
    if (box && !M.reduced) {
      const cv = box.querySelector('.br-embers');
      fire = M.particles(cv, {
        count: 22,
        init(p, i, w, h) { p.x = w * .5 + (Math.random() - .5) * 60; p.y = h * (.5 + Math.random() * .4); p.vy = -(.03 + Math.random() * .05); p.vx = (Math.random() - .5) * .02; p.r = .8 + Math.random() * 1.8; p.ph = Math.random() * 6; p.a = .5 + Math.random() * .5; },
        step(p, dt, w, h) { p.ph += dt * .004; p.x += p.vx * dt + Math.sin(p.ph) * .03 * dt * .3; p.y += p.vy * dt; p.a -= dt * .00035; if (p.y < 6 || p.a <= 0) return false; return true; },
        draw(g, p) { g.globalAlpha = clamp(p.a); g.fillStyle = p.r > 1.6 ? '#ffd27a' : '#ff9a4a'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill(); g.globalAlpha = 1; }
      });
    }
  });

  // each wish rises from the fire as a spark
  EA.onGuestbook(entry => {
    const M = EA.motion, box = document.querySelector('.br-sparkbox');
    if (!box || !entry) return;
    const s = document.createElement('div'); s.className = 'br-spark';
    s.innerHTML = `<i></i><span>${esc(String(entry.message || '').slice(0, 90))}<b>${esc(entry.name || '')}</b></span>`;
    s.style.setProperty('--dx', `${Math.round((Math.random() - .5) * 90)}px`);
    box.appendChild(s); setTimeout(() => s.remove(), 7200);
    box.closest('.br-fire')?.scrollIntoView({ behavior: M?.reduced ? 'auto' : 'smooth', block: 'center' });
    fire?.burst(24, (p, i, w, h) => { p.x = w * .5 + (Math.random() - .5) * 40; p.y = h * .7; p.vy = -(.06 + Math.random() * .1); p.vx = (Math.random() - .5) * .05; p.r = 1 + Math.random() * 2; p.ph = Math.random() * 6; p.a = 1; });
    M?.haptic('success'); M?.tone('pop');
  });

  // finale: the van drives across the screen towing a banner with the guest's name
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    if (!entry || entry.attending === false || !c) return;
    const name = String(entry.name || '').trim() || 'bạn';
    vanRun(`Hẹn gặp ${name.split(/\s+/).slice(-2).join(' ')}!`, c);
    M?.haptic('success'); M?.tone('chime'); setTimeout(() => M?.tone('pop'), 600);
  });
})();
