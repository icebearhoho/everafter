// Mediterranean Postcard: một mùa hè bên biển.
// Cover: bức tranh gạch men 4x5 còn rời rạc, lướt ngón tay (hoặc bấm "Ghép tranh") để từng viên gạch bay về đúng chỗ.
// Hero: chính bức tranh đó (gạch bay thẳng vào hero) + tem ảnh cưới + vespa chạy theo cuộn trang.
// All artwork is inline SVG / CSS / canvas. No external images besides the couple's own photo.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const COLS = 4, ROWS = 5, N = COLS * ROWS;
  const seeded = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let uid = 0;
  const safe = fn => { try { return fn(); } catch { return null; } };
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return h; };

  // ---------- artwork (defs live in a rendered 0x0 svg so <use> can find them) ----------
  const SCENE = `
  <g id="mp-scene">
    <rect width="400" height="500" fill="url(#mp-sky)"/>
    <circle cx="292" cy="118" r="74" fill="#fff3bd" opacity=".45"/><circle cx="292" cy="118" r="46" fill="#fff3bd" opacity=".6"/>
    <circle cx="292" cy="118" r="30" fill="#f6cf4f"/>
    <g fill="#fff" opacity=".9"><ellipse cx="96" cy="140" rx="50" ry="10"/><ellipse cx="128" cy="130" rx="32" ry="10"/><ellipse cx="60" cy="132" rx="26" ry="8"/><ellipse cx="338" cy="214" rx="42" ry="7"/></g>
    <path d="M0 268 Q60 232 140 258 T290 246 T400 262 V310 H0Z" fill="#93bccd" opacity=".75"/>
    <rect y="268" width="400" height="138" fill="url(#mp-sea)"/>
    <g stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M20 292 q12 -6 24 0 t24 0"/><path d="M120 304 q12 -6 24 0 t24 0"/><path d="M214 290 q10 -5 20 0 t20 0"/><path d="M52 338 q14 -7 28 0 t28 0"/><path d="M168 350 q14 -7 28 0 t28 0"/><path d="M300 332 q12 -6 24 0 t24 0"/><path d="M14 376 q12 -6 24 0 t24 0"/><path d="M236 380 q12 -6 24 0 t24 0"/>
    </g>
    <g fill="#fff6c8" opacity=".85"><rect x="262" y="276" width="60" height="3" rx="1.5"/><rect x="270" y="292" width="44" height="3" rx="1.5"/><rect x="276" y="308" width="34" height="3" rx="1.5"/><rect x="280" y="326" width="24" height="3" rx="1.5"/><rect x="284" y="346" width="16" height="3" rx="1.5"/></g>
    <g transform="translate(112 292)"><path d="M0 40 H62 L52 56 H10Z" fill="#e26b42"/><path d="M0 40 H62" stroke="#fff6e0" stroke-width="3"/><path d="M28 36 V-24 L-2 36Z" fill="#fffaf0"/><path d="M33 36 V-12 L58 36Z" fill="#f6e3b8"/><path d="M28 -26 v-10 l12 4 -12 4" fill="#e26b42"/></g>
    <path d="M236 408 L242 330 Q262 312 292 322 Q326 300 358 312 Q386 304 400 310 V408Z" fill="#d6a06a"/>
    <g>
      <rect x="252" y="322" width="34" height="34" fill="#fffaf0"/><rect x="278" y="322" width="8" height="34" fill="#efe0c4"/><path d="M248 322 h42 l-8 -12 h-26z" fill="#e26b42"/><rect x="262" y="334" width="9" height="13" rx="4.5" fill="#165b8a"/>
      <rect x="296" y="304" width="40" height="52" fill="#fffaf0"/><rect x="326" y="304" width="10" height="52" fill="#efe0c4"/><path d="M292 304 a24 24 0 0 1 48 0z" fill="#2b79b0"/><rect x="314" y="288" width="3" height="16" fill="#fffaf0"/><rect x="306" y="326" width="9" height="14" rx="4.5" fill="#165b8a"/><rect x="322" y="326" width="9" height="14" rx="4.5" fill="#165b8a"/>
      <rect x="344" y="318" width="40" height="38" fill="#fffaf0"/><path d="M340 318 h48 l-8 -12 h-32z" fill="#e26b42"/><rect x="354" y="332" width="9" height="13" rx="4.5" fill="#165b8a"/><rect x="370" y="332" width="9" height="13" rx="4.5" fill="#165b8a"/>
      <path d="M236 372 h164 v34 h-164z" fill="#e8bd84" opacity=".55"/>
    </g>
    <rect y="392" width="400" height="18" fill="#f6f0e6"/><path d="M0 392 H400" stroke="#165b8a" stroke-width="2"/>
    <g fill="#165b8a">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 30 + 8} 401 l8 -7 8 7 -8 7z"/>`).join('')}</g>
    <rect y="410" width="400" height="90" fill="#d9c8a4"/><rect y="410" width="400" height="6" fill="#c7b48c"/>
    <path d="M0 462 H400" stroke="#fff6e0" stroke-width="3" stroke-dasharray="26 22"/>
    <g id="mp-branch" transform="translate(0 0)">
      <path d="M-6 36 C60 52 112 36 168 74" stroke="#6b4a2c" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g fill="#5d8f3a"><ellipse cx="28" cy="58" rx="26" ry="9" transform="rotate(26 28 58)"/><ellipse cx="60" cy="28" rx="26" ry="9" transform="rotate(-28 60 28)"/><ellipse cx="96" cy="60" rx="26" ry="9" transform="rotate(30 96 60)"/><ellipse cx="124" cy="36" rx="26" ry="9" transform="rotate(-30 124 36)"/><ellipse cx="150" cy="78" rx="24" ry="8" transform="rotate(34 150 78)"/><ellipse cx="14" cy="20" rx="22" ry="8" transform="rotate(-20 14 20)"/></g>
      <g fill="#7fae52"><ellipse cx="40" cy="48" rx="14" ry="5" transform="rotate(26 40 48)"/><ellipse cx="108" cy="46" rx="14" ry="5" transform="rotate(-30 108 46)"/></g>
      <g fill="#f5cf3f" stroke="#c99a12" stroke-width="1.2"><ellipse cx="44" cy="82" rx="14" ry="19"/><ellipse cx="86" cy="86" rx="13" ry="18" transform="rotate(14 86 86)"/><ellipse cx="128" cy="98" rx="12" ry="17" transform="rotate(-10 128 98)"/></g>
      <g fill="#fff6b0" opacity=".7"><ellipse cx="39" cy="76" rx="3.5" ry="6"/><ellipse cx="82" cy="80" rx="3.2" ry="5.5"/><ellipse cx="124" cy="92" rx="3" ry="5"/></g>
    </g>
    <use href="#mp-vespa" x="150" y="424" width="120" height="80"/>
  </g>
  <g id="mp-vespa">
    <g class="mp-wh" style="transform-origin:28px 60px"><circle cx="28" cy="60" r="14" fill="#233443"/><circle cx="28" cy="60" r="8" fill="#f6f0e6"/><path d="M28 52v16M20 60h16" stroke="#b9ad96" stroke-width="2"/></g>
    <g class="mp-wh" style="transform-origin:96px 60px"><circle cx="96" cy="60" r="14" fill="#233443"/><circle cx="96" cy="60" r="8" fill="#f6f0e6"/><path d="M96 52v16M88 60h16" stroke="#b9ad96" stroke-width="2"/></g>
    <path d="M8 44 C6 28 26 24 44 28 L68 32 C72 26 80 22 86 20 L92 20 L100 42 L88 46 C82 58 66 60 42 58 C22 58 8 56 8 44Z" fill="#59b7a5"/>
    <path d="M86 20 L96 16 L104 52 L96 52Z" fill="#4aa493"/>
    <path d="M30 26 h36 c3 0 3 6 0 6 h-36z" fill="#3b2a24"/>
    <path d="M14 46 C30 52 56 54 80 48" stroke="#fff6e0" stroke-width="2" fill="none"/>
    <path d="M90 14 V4 M82 4 H98" stroke="#233443" stroke-width="3" stroke-linecap="round"/><circle cx="102" cy="18" r="4.5" fill="#fff3b0"/>
    <g class="mp-rider"><circle cx="40" cy="8" r="6" fill="#e9bc98"/><path d="M33 14 h14 l3 16 h-20z" fill="#1f4e8c"/><path d="M47 18 l22 8" stroke="#1f4e8c" stroke-width="5" stroke-linecap="round"/>
      <circle cx="60" cy="10" r="6" fill="#e9bc98"/><path d="M52 4 q8 -8 16 0 l-2 4 h-12z" fill="#3b2a24"/><path d="M53 16 h14 l4 14 h-22z" fill="#e26b42"/><path d="M66 6 q14 -4 22 6" class="mp-scarf" stroke="#f2c94c" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>
  </g>
  <g id="mp-lemon"><ellipse cx="0" cy="0" rx="9" ry="12" fill="#f5cf3f" stroke="#c99a12" stroke-width="1.2"/><path d="M-1 -12 q4 -6 9 -5" stroke="#5d8f3a" stroke-width="2.4" fill="none"/><ellipse cx="-3.5" cy="-4" rx="2" ry="4" fill="#fff6b0" opacity=".7"/></g>`;

  document.body.insertAdjacentHTML('beforeend', `<svg class="mp-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="mp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ea"/><stop offset=".55" stop-color="#d7ecf1"/><stop offset="1" stop-color="#fbe7bd"/></linearGradient>
    <linearGradient id="mp-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa0cf"/><stop offset="1" stop-color="#124c7b"/></linearGradient>
    ${SCENE}</defs></svg>`);

  const tileSVG = i => `<svg viewBox="${(i % COLS) * 100} ${Math.floor(i / COLS) * 100} 100 100" preserveAspectRatio="none" aria-hidden="true"><use href="#mp-scene"/></svg>`;
  const board = (cls, loose) => {
    const rnd = seeded(77);
    return `<div class="mp-board ${cls}">${Array.from({ length: N }, (_, i) => {
      const lo = loose && !PLACED0.includes(i);
      const x = ((rnd() - .5) * 70).toFixed(0), y = ((rnd() - .5) * 70).toFixed(0), r = ((rnd() - .5) * 28).toFixed(1), d = (rnd() * -3).toFixed(2);
      return `<div class="mp-slot" data-i="${i}"><div class="mp-tile${lo ? ' loose' : ''}" style="--x:${x}%;--y:${y}%;--r:${r}deg;--d:${d}s">${tileSVG(i)}</div></div>`;
    }).join('')}<i class="mp-sheen"></i></div>`;
  };
  const PLACED0 = [1, 6, 11, 14, 17, 18];

  const lemonSVG = (cls = '') => `<svg class="mp-lem ${cls}" viewBox="-12 -20 26 34" aria-hidden="true"><use href="#mp-lemon"/></svg>`;
  const vespaSVG = () => `<svg viewBox="0 0 120 80" aria-hidden="true"><use href="#mp-vespa"/></svg>`;
  const road = (cls = '', extra = '') => `<div class="mp-road ${cls}" aria-hidden="true"><div class="mp-wall"></div><div class="mp-lane"><i></i></div>
    <div class="mp-vespa">${extra}<span class="mp-tin"><i></i><i></i><i></i></span>${vespaSVG()}<span class="mp-puff"></span></div></div>`;
  const postmark = (txt) => { const id = 'mpm' + (++uid); return `<svg class="mp-pm" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="${id}" d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0"/></defs><circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width="1.5"/><text font-size="12" font-weight="600" letter-spacing="2.4" fill="currentColor"><textPath href="#${id}" startOffset="2">${esc(txt)}</textPath></text><path d="M44 62 h32 M44 70 h32" stroke="currentColor" stroke-width="2"/><path d="M48 54 q12 -14 24 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>`; };
  const fmtMY = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : String(s || ''); };
  const SP = { lemon: '#f2c94c' };

  // ---------- canvas fx: sea glitter + falling lemon leaves ----------
  function fx(cv, M, o = {}) {
    const sea = o.sea || [0, .6, 1, 1];
    return M.particles(cv, {
      count: o.count || 46,
      init(p, i, w, h) {
        p.k = i % 9 === 0 ? 'leaf' : 'gl';
        if (p.k === 'leaf') { p.x = Math.random() * w; p.y = -20 - Math.random() * h * .8; p.vx = .012 + Math.random() * .02; p.vy = .02 + Math.random() * .025; p.r = Math.random() * 6; p.vr = (Math.random() - .5) * .0016; p.s = 8 + Math.random() * 6; p.ph = Math.random() * 6; }
        else { p.x = (sea[0] + Math.random() * (sea[2] - sea[0])) * w; p.y = (sea[1] + Math.random() * (sea[3] - sea[1])) * h; p.t = Math.random() * 3000; p.sp = 1100 + Math.random() * 1800; p.s = 1.2 + Math.random() * 2.2; }
      },
      step(p, dt, w, h) {
        if (p.k === 'leaf') { p.y += p.vy * dt; p.x += (p.vx + Math.sin(p.life / 700 + p.ph) * .018) * dt; p.r += p.vr * dt; return p.y < h + 24 && p.x < w + 24; }
        p.t += dt; return true;
      },
      draw(g, p) {
        if (p.k === 'leaf') {
          g.save(); g.translate(p.x, p.y); g.rotate(p.r + Math.sin(p.life / 500 + p.ph) * .5); g.fillStyle = '#6fa23f'; g.globalAlpha = .92;
          g.beginPath(); g.ellipse(0, 0, p.s, p.s * .36, 0, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-p.s, 0); g.lineTo(p.s, 0); g.stroke(); g.restore();
        } else {
          const a = Math.max(0, Math.sin(p.t / p.sp * 6.28)); if (a < .05) return;
          g.save(); g.globalAlpha = a * .95; g.fillStyle = '#fff8d6'; g.translate(p.x, p.y);
          g.beginPath(); g.moveTo(0, -p.s * 2.4); g.lineTo(p.s * .5, 0); g.lineTo(0, p.s * 2.4); g.lineTo(-p.s * .5, 0); g.closePath(); g.moveTo(-p.s * 2.4, 0); g.lineTo(0, p.s * .5); g.lineTo(p.s * 2.4, 0); g.lineTo(0, -p.s * .5); g.closePath(); g.fill(); g.restore();
        }
      }
    });
  }

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="mp-cover">
      <div class="mp-bg"></div><div class="mp-waves" aria-hidden="true"><i></i><i></i><i></i></div>
      <canvas class="mp-fx" aria-hidden="true"></canvas>
      <div class="mp-head"><p class="mp-eyebrow">Thư gửi từ bờ biển</p>
        <h1 class="mp-names"><span>${e(D.bride.name)}</span><span class="mp-amp">&amp;</span><span>${e(D.groom.name)}</span></h1></div>
      <div class="mp-bw"><div class="mp-bt">${board('mp-cb', true)}</div></div>
      <div class="mp-foot">
        <p class="mp-dateline"><span>${c.dow}</span><i></i><b>${c.dateText}</b></p>
        <p class="mp-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="mp-hint">Lướt ngón tay qua bức tranh để ghép từng viên gạch</p>
        <button class="open-btn" type="button">Ghép tranh</button>
      </div></div>`;
    const root = el.querySelector('.mp-cover'), bd = el.querySelector('.mp-board');
    const tiles = [...bd.querySelectorAll('.mp-tile')];
    const state = tiles.map((t, i) => ({ t, on: !t.classList.contains('loose') }));
    let placed = state.filter(s => s.on).length, started = false, finished = false, lastT = 0;
    const fxp = fx(el.querySelector('.mp-fx'), M, { sea: [0, .72, 1, 1], count: 40 });
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    const start = () => { if (started) return; started = true; EA.music(); M.requestTilt(); root.classList.add('is-going'); };
    const place = (i, quiet) => {
      const s = state[i]; if (!s || s.on) return false;
      s.on = true; placed++; s.t.classList.remove('loose'); s.t.classList.add('placed');
      if (!quiet) { M.tone('click'); const now = performance.now(); if (now - lastT > 110) { M.haptic('tap'); lastT = now; } }
      if (placed >= N) finish();
      return true;
    };
    const finish = () => {
      if (finished) return; finished = true; start();
      root.classList.add('is-done');
      c.after(380, () => { M.tone('chime'); M.haptic('success'); });
      c.after(1500, () => {
        M.haptic('thud'); M.tone('whoosh');
        const hb = document.querySelector('.mp-hero .mp-mural')?.getBoundingClientRect(), cb = bd.getBoundingClientRect(), wrap = el.querySelector('.mp-bt');
        if (!c.reduced && hb && hb.width > 40 && cb.width > 40) {
          root.classList.add('is-leaving');
          wrap.style.transition = 'transform 1.05s cubic-bezier(.65,0,.2,1)';
          wrap.style.transform = `translate(${(hb.left + hb.width / 2 - cb.left - cb.width / 2).toFixed(1)}px,${(hb.top + hb.height / 2 - cb.top - cb.height / 2).toFixed(1)}px) scale(${(hb.width / cb.width).toFixed(4)})`;
        }
        c.after(c.reduced ? 0 : 750, () => { offTilt(); open(); c.after(1500, () => fxp.stop()); });
      });
    };
    const cascade = () => {
      start(); M.tone('whoosh');
      const left = state.map((s, i) => i).filter(i => !state[i].on).sort(() => Math.random() - .5);
      if (!left.length) return finish();
      left.forEach((i, k) => c.after(k * 85, () => place(i, k % 3 !== 0)));
    };
    // sweep: the tile under the finger lands, and often a neighbour with it
    let down = false, auto = false;
    const slotAt = ev => {
      const r = bd.getBoundingClientRect(), cx = Math.floor((ev.clientX - r.left) / r.width * COLS), cy = Math.floor((ev.clientY - r.top) / r.height * ROWS);
      return cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS ? -1 : cy * COLS + cx;
    };
    const sweep = ev => {
      if (finished || auto) return;
      if (!(down || ev.pointerType === 'mouse' && ev.buttons)) return;
      start();
      const i = slotAt(ev); if (i < 0) return;
      place(i);
      const near = state.map((s, k) => k).filter(k => !state[k].on).sort((a, b) => Math.hypot(a % COLS - i % COLS, (a / COLS | 0) - (i / COLS | 0)) - Math.hypot(b % COLS - i % COLS, (b / COLS | 0) - (i / COLS | 0)));
      if (near.length && Math.random() < .55) place(near[0]);
      if (placed >= 15 && !auto) { auto = true; cascade(); }
    };
    bd.addEventListener('pointerdown', ev => { down = true; bd.setPointerCapture?.(ev.pointerId); M.requestTilt(); sweep(ev); });
    bd.addEventListener('pointermove', sweep);
    ['pointerup', 'pointercancel'].forEach(n => bd.addEventListener(n, () => { down = false; }));
    el.querySelector('.open-btn').addEventListener('click', () => { if (auto) return; auto = true; el.querySelector('.open-btn').disabled = true; cascade(); });
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const t = c.mod?.content?.title, s = c.mod?.content?.sub, b = c.mod?.content?.eyebrow;
    return `<header class="head"><p class="eyebrow">${b != null ? esc(b) : eb}</p><h2 class="title">${t != null && t !== '' ? esc(t) : title}</h2>${(s ?? sub) ? `<p class="sub">${s != null ? esc(s) : sub}</p>` : ''}</header>`;
  };

  // ---- hero: the finished mural + the couple's photo as a postage stamp ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, ph = photoOf(c);
    return `<div class="mp-hero">
      <canvas class="mp-fx" aria-hidden="true"></canvas>
      <p class="mp-eyebrow">${e(mc.eyebrow || 'Một mùa hè bên biển')}</p>
      <div class="mp-mural">${board('mp-hb', false)}
        <figure class="mp-stamp"><div class="mp-sframe">${ph ? `<img src="${e(ph)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}<span class="mp-slem">${lemonSVG()}</span></div>
          <span class="mp-pmk">${postmark(`${cp.city || 'Bưu điện'} · ${c.d}.${c.m}.${c.y} ·`)}</span></figure>
      </div>
      <h1 class="mp-names"><span>${e(D.bride.name)}</span><span class="mp-amp">&amp;</span><span>${e(D.groom.name)}</span></h1>
      ${cp.headline ? `<p class="mp-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="mp-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}${cp.lunarDate ? `<em>${e(cp.lunarDate)}</em>` : ''}</button>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
      ${road('mp-r1')}
    </div>`;
  });

  // ---- invitation: the back of the postcard (+ boarding pass for "ngày bên nhau") ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, p = c.p;
    const days = p.daysTogether, met = p.get('metDate', ''), city = p.get('metCity', ''), place = p.get('metPlace', '');
    const metTxt = met ? met.split('-').reverse().join('.') : '';
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? '' : c.guest;
    return `<div class="wrap narrow">
      <article class="mp-back">
        <div class="mp-msg">
          <p class="mp-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
          <h2 class="title">${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
          ${D.letter.slice(0, 2).map(x => `<p>${t(x)}</p>`).join('')}
          ${D.letterHighlight ? `<p class="mp-hl">${t(D.letterHighlight)}</p>` : ''}
          ${D.letter.slice(2).map(x => `<p>${t(x)}</p>`).join('')}
          <p class="mp-sign">Thân mến,<b>${e(D.bride.short || D.bride.name)} &amp; ${e(D.groom.short || D.groom.name)}</b></p>
        </div>
        <aside class="mp-addr"><span class="mp-pstamp">${lemonSVG()}<small>${c.y}</small></span><span class="mp-pmk2">${postmark(`${c.d}.${c.m}.${c.y} · ${(c.config.couple.city || '').toUpperCase()} ·`)}</span>
          <p class="mp-to">Người nhận</p><p class="mp-toname">${e(guest || 'Quý khách')}</p><i></i><i></i><i></i></aside>
      </article>
      ${days != null && days > 0 ? `<div class="mp-ticket" data-days="${days}">
        <div class="mp-tk-main"><p class="mp-tk-h">Tấm vé của hai người</p>
          <div class="mp-tk-row"><div><small>Khởi hành</small><b>${e(metTxt)}</b></div><svg viewBox="0 0 60 20" aria-hidden="true"><path d="M2 10 H54 M46 3 l8 7 -8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><div><small>Đến nơi</small><b>${c.d}.${c.m}.${c.y}</b></div></div>
          ${city || place ? `<p class="mp-tk-from">Ga đầu tiên: ${e(place || city)}${place && city ? `, ${e(city)}` : ''}</p>` : ''}</div>
        <div class="mp-tk-stub"><b class="n">0</b><small>ngày bên nhau</small><i></i></div></div>` : ''}
    </div>`;
  });

  // ---- rsvp: a reply postcard ----
  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Bưu thiếp hồi âm', 'Bạn sẽ đến chứ?', 'Gửi lại cho chúng mình một tấm bưu thiếp nhé')}
    <div class="rsvp-card mp-reply"><span class="mp-pstamp">${lemonSVG()}<small>Hồi âm</small></span>${c.ui.rsvpForm()}</div>
  </div>`);

  // ---- thanks: the Vespa arrives and parks, tin cans in tow ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod, p } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const song = p.get('song', null), joke = p.get('insideJoke', '');
    return `<div class="wrap narrow mp-bye">
      <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
      <h2 class="title">Hẹn gặp <span>${e(guest)}</span> ngày vui</h2>
      <p class="mp-thx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="mp-signoff">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      ${song?.title || joke ? `<div class="mp-ps"><b>P.S.</b>${song?.lyric ? `<p>“${e(song.lyric)}”<small>${e(song.title)}${song.artist ? ` · ${e(song.artist)}` : ''}</small></p>` : ''}${joke ? `<p>${e(joke)}</p>` : ''}</div>` : ''}
      <p class="mp-bdate">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Ghép lại bức tranh ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
      ${road('mp-r2 park', '<span class="mp-jm">Mới cưới</span>')}
    </div>`;
  });

  // ======================= add-ons =======================
  const hostOf = (main, ids) => { for (const id of ids) { const w = main.querySelector(`#${id} .wrap`); if (w) return w; } return null; };

  const postcards = (c, places) => {
    const km = (a, b) => (a && b && a.lat != null && b.lat != null) ? Math.round(c.p.kmBetween(a, b) / 10) * 10 : null;
    return `<div class="mp-pcs"><header class="head"><p class="eyebrow">Bưu thiếp từ những chuyến đi</p><h3 class="title">Nơi hai đứa từng đứng cạnh nhau</h3><p class="sub">Chạm vào từng tấm để lật mặt sau</p></header>
      <ul class="mp-pc-list">${places.map((pl, i) => {
        const d = km(places[i - 1], pl);
        return `<li><button class="mp-pc" type="button" aria-label="Lật bưu thiếp ${esc(pl.name)}" style="--h:${(i * 47 + 200) % 360}">
          <span class="f front"><span class="mp-pc-art">${tileSVG([2, 9, 13, 5, 17, 10][i % 6])}</span><b>${esc(pl.name)}</b>${pl.date ? `<em>${esc(fmtMY(pl.date))}</em>` : ''}<span class="mp-pc-pm">${postmark(String(pl.name).toUpperCase().slice(0, 14) + ' ·')}</span></span>
          <span class="f back"><span class="mp-pstamp">${lemonSVG()}<small>${i + 1}</small></span><span class="mp-bk">Điểm dừng thứ ${i + 1}</span><span class="mp-bk2">${esc(pl.name)}</span>${d ? `<span class="mp-bk">Cách điểm trước ~${d.toLocaleString('vi-VN')} km</span>` : `<span class="mp-bk">Nơi mọi chuyện bắt đầu</span>`}<i></i><i></i></span></button></li>`;
      }).join('')}</ul></div>`;
  };

  const menuBlock = c => {
    const p = c.p, raw = p.get('menu', null), items = [];
    if (Array.isArray(raw) && raw.length) raw.forEach(m => items.push([m.course || 'Món', m.dish || m.name, m.note || '']));
    else {
      const bd = p.get('traits.bride.drink', ''), gd = p.get('traits.groom.drink', ''), hb = p.get('hometowns.bride', ''), hg = p.get('hometowns.groom', '');
      if (bd || gd) items.push(['Ly chào', [bd, gd].filter(Boolean).join(' &amp; '), bd && gd ? `Hai ly quen thuộc của ${esc(c.data.bride.short || c.data.bride.name)} và ${esc(c.data.groom.short || c.data.groom.name)}` : '']);
      if (hb || hg) items.push(['Hai miền quê', [hb, hg].filter(Boolean).join(' · '), 'Hương vị quê nhà của hai gia đình']);
      const hobby = [p.get('traits.bride.hobby', ''), p.get('traits.groom.hobby', '')].filter(Boolean);
      if (hobby.length) items.push(['Giữa buổi tiệc', hobby.join(' · '), 'Những thú vui đã gắn hai người lại']);
      if (items.length < 2) return '';
    }
    if (!items.length) return '';
    return `<div class="mp-menu"><div class="mp-menu-in"><p class="eyebrow">${raw ? 'Thực đơn tiệc' : 'Hương vị của đôi mình'}</p><h3 class="title">Bàn tiệc kiểu Địa Trung Hải</h3>
      <ol>${items.map(([a, b, n]) => `<li><small>${esc(a)}</small><b>${raw ? esc(b) : b}</b>${n ? `<span>${raw ? esc(n) : n}</span>` : ''}</li>`).join('')}</ol>${lemonSVG('mp-menu-lem')}</div></div>`;
  };

  const honeyIdeas = c => {
    const p = c.p, h = p.get('honeymoon', null);
    if (Array.isArray(h) && h.length >= 2) return { own: true, list: h.map(x => typeof x === 'string' ? { name: x } : x).slice(0, 6) };
    const pl = p.get('places', []);
    if (pl.length >= 2) return { own: false, list: pl.slice(0, 6).map(x => ({ name: x.name, note: x.date ? `Lần đầu tới: ${fmtMY(x.date)}` : '' })) };
    return null;
  };
  const VOTED = 'everafter:mp-voted';
  const honeyBlock = (c, H) => {
    let voted = safe(() => localStorage.getItem(VOTED));
    return `<div class="mp-honey" data-n="${H.list.length}"><header class="head"><p class="eyebrow">Tuần trăng mật</p><h3 class="title">${H.own ? 'Hai bạn nên đưa tụi mình đi đâu?' : 'Nơi nào nên được quay lại?'}</h3>
      <p class="sub">${H.own ? 'Chọn một gợi ý. Mỗi thiết bị được bình chọn một lần.' : 'Chọn một chuyến đi cũ để tụi mình ghé lại trong tuần trăng mật. Mỗi thiết bị được bình chọn một lần.'}</p></header>
      <ul class="mp-ideas">${H.list.map((it, i) => `<li><button class="mp-idea" type="button" data-i="${i}"${voted != null ? ' disabled' : ''}>
        <span class="mp-ico">${tileSVG([2, 9, 13, 5, 17, 10][i % 6])}</span><span class="mp-itx"><b>${esc(it.name)}</b>${it.note ? `<small>${esc(it.note)}</small>` : ''}<span class="mp-bar"><i style="--w:0"></i></span></span><span class="mp-cnt">0</span></button></li>`).join('')}</ul>
      <p class="mp-vote-note" role="status"></p></div>`;
  };
  const wireHoney = (c, root, H) => {
    const M = c.motion, btns = [...root.querySelectorAll('.mp-idea')], note = root.querySelector('.mp-vote-note');
    let mine = safe(() => localStorage.getItem(VOTED)); mine = mine == null ? null : +mine;
    const draw = list => {
      const cnt = H.list.map((_, i) => list.filter(v => +v.idea === i).length), tot = cnt.reduce((a, b) => a + b, 0);
      btns.forEach((b, i) => {
        b.querySelector('.mp-cnt').textContent = cnt[i];
        b.querySelector('.mp-bar i').style.setProperty('--w', tot ? (cnt[i] / tot).toFixed(3) : 0);
        b.classList.toggle('mine', mine === i);
      });
      note.textContent = mine != null ? `Bạn đã chọn “${H.list[mine].name}”. Cảm ơn bạn!` : (tot ? `${tot} lượt bình chọn` : 'Chưa có ai bình chọn, bạn là người đầu tiên nhé.');
    };
    const load = () => Promise.resolve(EA.shared.list('mp-honey')).then(l => draw(l || [])).catch(() => draw([]));
    load();
    btns.forEach(b => b.addEventListener('click', async () => {
      if (mine != null) return;
      mine = +b.dataset.i; safe(() => localStorage.setItem(VOTED, String(mine)));
      btns.forEach(x => { x.disabled = true; });
      M.tone('pop'); M.haptic('success'); b.classList.add('pop');
      try { await EA.shared.add('mp-honey', { idea: mine, name: H.list[mine].name }); } catch { /* local only */ }
      load();
    }));
  };

  // ======================= behaviours =======================
  EA.afterRender((c, main) => {
    const M = c.motion;
    // English default eyebrows (module has no eyebrow of its own) -> Vietnamese
    const EN = { 'Love story': 'Chuyện tình', 'Save the date': 'Ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khoảnh khắc', 'Dress code & notes': 'Trang phục & lưu ý', 'Wedding guide': 'Cẩm nang', 'Gift registry': 'Gợi ý quà', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ', 'A note from us': 'Lời nhắn', 'RSVP': 'Phản hồi' };
    main.querySelectorAll('.eyebrow').forEach(n => { const k = n.textContent.trim(); if (EN[k]) n.textContent = EN[k]; });

    // hero fx: glitter on the sea band of the mural + lemon leaves
    const hero = main.querySelector('.mp-hero');
    if (hero) {
      const cv = hero.querySelector('.mp-fx');
      const mu = hero.querySelector('.mp-mural');
      const place = () => { const r = mu.getBoundingClientRect(), h = hero.getBoundingClientRect(); cv.style.top = '0'; cv.style.height = h.height + 'px'; return { r, h }; };
      cv.style.height = hero.offsetHeight + 'px';
      const f = fx(cv, M, { sea: [.15, .12, .85, .3], count: 34 });
      safe(() => { const mr = () => { const { r, h } = place(); const sy = (r.top - h.top) / h.height; const sh = r.height / h.height; f.sea = null; }; mr(); });
    }
    // tilt parallax on the stamp
    if (hero && !c.reduced) {
      const st = hero.querySelector('.mp-stamp'); M.tilt(({ x, y }) => { st.style.setProperty('--tx', x.toFixed(3)); st.style.setProperty('--ty', y.toFixed(3)); });
    }

    // Vespa: x follows scroll position of its road band; wheels turn with it
    main.querySelectorAll('.mp-road').forEach(rd => {
      const v = rd.querySelector('.mp-vespa'), park = rd.classList.contains('park');
      let last = 0;
      const drive = p => {
        const q = p;
        const eased = park ? 1 - Math.pow(1 - q, 2.2) : q;
        rd.style.setProperty('--vx', (park ? -22 + eased * 78 : -18 + eased * 128).toFixed(2) + '%');
        rd.style.setProperty('--rot', (eased * 2600).toFixed(0) + 'deg');
        const moving = Math.abs(eased - last) > .0008; last = eased;
        rd.classList.toggle('driving', moving && eased < .995);
      };
      if (park) {
        const onS = () => drive(clamp(1 - (document.documentElement.scrollHeight - innerHeight - scrollY) / (innerHeight * .8)));
        addEventListener('scroll', onS, { passive: true }); onS();
      } else M.scrollProgress(rd, drive);
      // easter egg: tap the Vespa three times -> bíp bíp
      let taps = 0, timer = 0;
      v.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1200);
        M.tone('click');
        if (taps >= 3) {
          taps = 0; M.haptic('success'); M.tone('pop'); setTimeout(() => M.tone('pop'), 160);
          rd.classList.remove('honk'); void rd.offsetWidth; rd.classList.add('honk');
          lemonRain(c, 18);
        }
      });
    });

    // ngày bên nhau: boarding pass counter
    const tk = main.querySelector('.mp-ticket');
    if (tk) M.inView(tk, () => { tk.classList.add('on'); const n = tk.querySelector('.n'); M.tween(0, +tk.dataset.days, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });

    // add-ons (each only when its data exists)
    const places = c.p.get('places', []);
    if (places.length) {
      const host = hostOf(main, ['story', 'gallery', 'events']);
      host?.insertAdjacentHTML('beforeend', postcards(c, places.slice(0, 8)));
      main.querySelectorAll('.mp-pc').forEach(b => b.addEventListener('click', () => { b.classList.toggle('flip'); M.tone('click'); M.haptic('tap'); }));
    }
    const menu = menuBlock(c);
    if (menu) hostOf(main, ['schedule', 'events', 'dressCode'])?.insertAdjacentHTML('beforeend', menu);
    const H = honeyIdeas(c);
    if (H) {
      const host = hostOf(main, ['gift', 'registry', 'guestbook', 'rsvp']);
      if (host) { host.insertAdjacentHTML('beforeend', honeyBlock(c, H)); wireHoney(c, host.querySelector('.mp-honey'), H); }
    }
    main.querySelectorAll('.mp-pcs, .mp-menu, .mp-honey').forEach(n => M.inView(n, () => n.classList.add('on'), { threshold: .2 }));
  });

  function lemonRain(c, n = 26) {
    if (c.reduced) return;
    const box = document.createElement('div'); box.className = 'mp-rain'; box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}vw;--d:${(Math.random() * 1.1).toFixed(2)}s;--t:${(2.4 + Math.random() * 1.6).toFixed(2)}s;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;--s:${(.8 + Math.random() * .9).toFixed(2)}`;
      s.innerHTML = lemonSVG(); box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 5200);
  }

  // finale: lemons rain, the Vespa zooms across the screen with the guest's name
  EA.onRsvp((entry, c) => {
    const M = EA.motion, name = String(entry?.name || '').trim();
    if (entry && entry.attending === false) { M?.tone('pop'); return; }
    lemonRain(c || { reduced: M?.reduced }, 28);
    if (!M?.reduced) {
      const z = document.createElement('div'); z.className = 'mp-zoom'; z.setAttribute('aria-hidden', 'true');
      z.innerHTML = `<div class="mp-vespa"><span class="mp-pen">${esc(name || 'Quý khách')}</span><span class="mp-tin"><i></i><i></i><i></i></span>${vespaSVG()}</div>`;
      document.body.appendChild(z); setTimeout(() => z.remove(), 4600);
    }
    M?.haptic('success'); M?.tone('chime'); setTimeout(() => M?.tone('pop'), 900); setTimeout(() => M?.tone('pop'), 1100);
  });
})();
