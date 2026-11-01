// Watercolor Romance: two colours that become one.
// Cover: cold-press paper. Each partner picks a pigment; tap "Pha màu" and two wet blooms spread across the page,
// overlap into the wedding colour, the names are painted letter by letter and petals drift up. The wedding colour then
// tints the whole card (accent, buttons, washes) and the washes keep spreading as you scroll.
// All artwork is CSS / SVG / canvas. The only image is the couple's own photo (or the bundled watercolour painting).
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/watercolor_couple_1790233174385.jpg';
  const isDemo = h => !h || /picsum\.photos/.test(h);
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return isDemo(h) ? PHOTO : h; };
  const M0 = window.EAMotion || EA.motion;
  const tryLS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } return null; };

  // ---------- colour helpers ----------
  const SW = [['#E58BA0', 'Hồng phấn'], ['#F2967F', 'San hô'], ['#F5BC8B', 'Cam đào'], ['#F2D676', 'Vàng bơ'], ['#9CC5A1', 'Xanh bạc hà'], ['#7FB0DA', 'Xanh trời'], ['#B6A0E0', 'Tím oải hương'], ['#D798C8', 'Hồng sen']];
  const NAMES = [['#E8A0B0', 'Hồng phấn'], ['#F4B3A5', 'Hồng đào'], ['#F5BC8B', 'Cam đào'], ['#F2D676', 'Vàng bơ'], ['#C9D88A', 'Xanh lá non'], ['#9CC5A1', 'Xanh bạc hà'], ['#8FD0C0', 'Xanh ngọc'], ['#9BC9D8', 'Xanh lơ'],
    ['#7FB0DA', 'Xanh trời'], ['#A9A8E0', 'Xanh tím than nhạt'], ['#B6A0E0', 'Tím oải hương'], ['#B29DBD', 'Tím khói'], ['#C9A3D6', 'Tím hoa cà'], ['#D798C8', 'Hồng sen'], ['#E59AAE', 'Hồng cánh sen'], ['#D9B49A', 'Be hồng'], ['#E9C7A8', 'Kem đào'], ['#B9C7A4', 'Xanh rêu non']];
  const h2r = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const r2h = r => '#' + r.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const r2hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; };
  const hsl2r = (h, s, l) => { const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return [f(0) * 255, f(8) * 255, f(4) * 255]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  // pigment as readable ink: same hue, darkened until white text on it passes 5.2:1
  const deep = rgb => { const [h, s] = r2hsl(rgb); let l = .46, out; do { out = hsl2r(h, Math.min(.7, Math.max(.34, s)), l); l -= .015; } while (1.05 / (lum(out) + .05) < 5.2 && l > .12); return out; };
  const mixRGB = (a, b) => { const m = a.map((v, i) => (v + b[i]) / 2), [h, s, l] = r2hsl(m); return hsl2r(h, Math.min(1, s * 1.12), l); };
  const nameOf = rgb => { let best = NAMES[0], bd = 1e9; NAMES.forEach(n => { const q = h2r(n[0]), d = q.reduce((t, v, i) => t + (v - rgb[i]) ** 2, 0); if (d < bd) { bd = d; best = n; } }); return best[1]; };

  const state = { b: h2r(SW[0][0]), g: h2r(SW[5][0]), bn: SW[0][1], gn: SW[5][1] };
  (() => { const s = tryLS('wc:colors'); if (s && s.b && s.g) { state.b = h2r(s.b); state.g = h2r(s.g); state.bn = nameOf(state.b); state.gn = nameOf(state.g); } })();
  const mixed = () => mixRGB(state.b, state.g);
  const applyTheme = () => {
    const st = document.documentElement.style, m = mixed();
    [['1', state.b], ['2', state.g], ['m', m]].forEach(([k, rgb]) => {
      st.setProperty('--w' + k, r2h(rgb)); st.setProperty('--w' + k + '-rgb', rgb.map(Math.round).join(','));
      st.setProperty('--d' + k, r2h(deep(rgb)));
    });
    st.setProperty('--accent', r2h(deep(m)));
    document.dispatchEvent(new CustomEvent('wc:colors'));
  };
  applyTheme();

  // ---------- art ----------
  document.body.insertAdjacentHTML('beforeend', `<svg class="wc-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <filter id="wc-rough" x="-5%" y="-30%" width="110%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
  </defs></svg>`);
  const flower = (n = 6, cls = '', seed = 1) => {
    let p = '';
    for (let i = 0; i < n; i++) { const a = i * 360 / n + seed * 11; p += `<ellipse cx="0" cy="-15" rx="${8 + (i % 2)}" ry="${15 + (i % 3)}" transform="rotate(${a.toFixed(1)})"/>`; }
    for (let i = 0; i < n; i++) { const a = i * 360 / n + 180 / n + seed * 7; p += `<ellipse cx="0" cy="-9" rx="5.5" ry="10" transform="rotate(${a.toFixed(1)})" opacity=".7"/>`; }
    return `<svg class="wc-fl ${cls}" viewBox="-34 -34 68 68" aria-hidden="true"><g fill="currentColor" style="mix-blend-mode:multiply">${p}</g><circle r="4.6" fill="#F2C85E"/><circle r="2" fill="#D9963A"/></svg>`;
  };
  const leaf = (cls = '') => `<svg class="wc-lf ${cls}" viewBox="0 0 30 60" aria-hidden="true"><path d="M15 58 C2 40 3 16 15 2 C27 16 28 40 15 58Z" fill="#9CC5A1" opacity=".72"/><path d="M15 56 V10" stroke="#6E9C78" stroke-width="1" fill="none" opacity=".6"/></svg>`;
  // failed pictures are hidden by core (img.ea-img-failed); their frame (.ea-nophoto) shows a painted placeholder from the CSS

  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const gr = s => seg ? Array.from(seg.segment(s), x => x.segment) : (s.normalize('NFC').match(/\P{M}\p{M}*/gu) || []);
  const paintName = (txt, cls, d0 = 0) => `<span class="n ${cls}" aria-hidden="true">${gr(String(txt).trim()).map((ch, i) => `<i style="--i:${i + d0}">${ch === ' ' ? '&nbsp;' : esc(ch)}</i>`).join('')}<svg class="sw" viewBox="0 0 300 26" preserveAspectRatio="none"><path pathLength="1" d="M6 15 C60 3 118 24 176 11 S 268 17 294 8"/></svg></span>`;
  const namesH = (c, tag = 'h1') => `<${tag} class="wc-names" aria-label="${esc(c.data.bride.name)} và ${esc(c.data.groom.name)}">${paintName(c.data.bride.name, 'b')}<span class="amp" aria-hidden="true">&amp;</span>${paintName(c.data.groom.name, 'g', 12)}</${tag}>`;
  const shortOf = (p, fb) => (p.short || String(p.name || fb).trim().split(/\s+/).pop() || fb);

  // ---------- watercolour bloom engine (canvas, multiply on paper) ----------
  function engine(cv, M) {
    const g = cv.getContext('2d'); let W = 1, H = 1, dpr = 1, dirty = true;
    const fit = () => { dpr = Math.min(devicePixelRatio || 1, M.tier === 'high' ? 1.5 : 1); const r = cv.getBoundingClientRect(); W = r.width || innerWidth; H = r.height || innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); dirty = true; };
    fit(); addEventListener('resize', fit);
    const L = Math.max(3, Math.round(M.scale(7)));
    const mk = (fx, fy, rgb, r0) => ({ fx, fy, rgb: rgb.slice(), to: rgb.slice(), r0, rad: r0, a: 1, seed: Math.random() * 9, ph: Array.from({ length: L }, () => [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28]) });
    const blobs = [];
    const draw = now => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'multiply';
      blobs.forEach(b => {
        if (b.a <= .001 || b.rad < 2) return;
        for (let i = 0; i < 3; i++) b.rgb[i] += (b.to[i] - b.rgb[i]) * .12;
        const cx = b.fx * W, cy = b.fy * H, col = b.rgb.map(Math.round).join(',');
        for (let li = 0; li < L; li++) {
          const sc = b.rad * (.58 + .42 * li / (L - 1)), p = b.ph[li], t = now / 2600 + b.seed;
          g.beginPath();
          for (let k = 0; k <= 56; k++) {
            const a = k / 56 * 6.2832, r = sc * (1 + .15 * Math.sin(3 * a + p[0] + t * .6) + .09 * Math.sin(5 * a + p[1] - t * .5) + .05 * Math.sin(9 * a + p[2] + t));
            k ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          g.closePath();
          const gr0 = g.createRadialGradient(cx, cy, sc * .15, cx, cy, sc * 1.12), al = .085 * b.a;
          gr0.addColorStop(0, `rgba(${col},${al * .5})`); gr0.addColorStop(.78, `rgba(${col},${al * .9})`); gr0.addColorStop(.95, `rgba(${col},${al * 2})`); gr0.addColorStop(1, `rgba(${col},${al * .4})`);
          g.fillStyle = gr0; g.fill();
        }
      });
      dirty = false;
    };
    const stop = M.loop(now => { if (dirty || !M.reduced) draw(now); }, { el: cv });
    return { blobs, add(b) { blobs.push(b); dirty = true; return b; }, mk, touch() { dirty = true; }, get W() { return W; }, get H() { return H; }, stop() { stop(); removeEventListener('resize', fit); } };
  }

  // petals: DOM-free canvas burst (colours = the two pigments and their mix)
  function petalBurst(M, x, y, count = 40, opts = {}) {
    const cv = document.createElement('canvas'); cv.className = 'wc-petals fixed'; document.body.appendChild(cv);
    const cols = [state.b, state.g, mixed()].map(r => r.map(Math.round).join(','));
    const P = M.particles(cv, {
      count: 0,
      init(p) { if (!p.burst) p.dead = true; },
      step(p, dt) { if (p.dead) return false; const k = Math.pow(.97, dt / 16); p.vx *= k; p.vy = (p.vy + .00055 * dt) * k; p.x += p.vx * dt + Math.sin(p.life / 380 + p.s) * .25; p.y += p.vy * dt; p.r += p.vr * dt; return p.life < (opts.life || 4200) && p.y < innerHeight + 40; },
      draw(c2, p) { if (p.dead) return; c2.save(); c2.translate(p.x, p.y); c2.rotate(p.r); c2.globalAlpha = Math.max(0, Math.min(.85, ((opts.life || 4200) - p.life) / 900)); c2.fillStyle = `rgba(${p.c},1)`; c2.beginPath(); c2.ellipse(0, 0, p.w, p.w * 1.7, 0, 0, 6.283); c2.fill(); c2.globalAlpha *= .5; c2.fillStyle = '#fff'; c2.beginPath(); c2.ellipse(-p.w * .2, -p.w * .5, p.w * .3, p.w * .7, 0, 0, 6.283); c2.fill(); c2.restore(); }
    });
    P.burst(count, p => { const a = opts.dir ?? (-Math.PI / 2 + (Math.random() - .5) * 2.4), sp = (opts.speed || .5) * (.5 + Math.random()); p.x = x + (Math.random() - .5) * (opts.spread || 30); p.y = y; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; p.w = 4 + Math.random() * 5; p.r = Math.random() * 6.28; p.vr = (Math.random() - .5) * .006; p.s = Math.random() * 6.28; p.c = cols[(Math.random() * 3) | 0]; });
    setTimeout(() => { P.stop(); cv.remove(); }, (opts.life || 4200) + 600);
  }

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const bS = shortOf(D.bride, 'cô dâu'), gS = shortOf(D.groom, 'chú rể');
    const pick = (who, nm) => `<div class="wc-row" data-who="${who}"><span class="wc-rl">Màu của ${e(nm)}</span><div class="wc-dabs" role="radiogroup" aria-label="Chọn màu của ${e(nm)}">${SW.map(([hx, n], i) => `<button type="button" role="radio" aria-checked="false" aria-label="${n}" data-i="${i}" data-hex="${hx}"><i style="background:${hx};--r:${(i * 37) % 11}"></i></button>`).join('')}</div></div>`;
    el.innerHTML = `<div class="wc-cover">
      <canvas class="wc-bloom" aria-hidden="true"></canvas>
      <div class="wc-cflora" aria-hidden="true"><span class="f1">${flower(7, '', 1)}</span><span class="f2">${flower(6, '', 2)}</span><span class="f3">${flower(8, '', 3)}</span><span class="f4">${flower(5, '', 4)}</span>${leaf('l1')}${leaf('l2')}${leaf('l3')}</div>
      <div class="wc-cin">
        <p class="wc-ceb">Hai sắc màu, một ngày cưới</p>
        ${namesH(c)}
        <p class="wc-cdate"><span>${c.dow}</span><i aria-hidden="true"></i><b>${c.dateText}</b></p>
        <p class="wc-cguest">Gửi <b>${e(c.guest)}</b></p>
        <div class="wc-pick">${pick('b', bS)}${pick('g', gS)}</div>
        <button class="open-btn" type="button">Pha màu &amp; mở thiệp</button>
        <p class="wc-hint">Mỗi người một màu, chạm để hòa thành màu cưới</p>
      </div>
    </div>`;
    const root = el.querySelector('.wc-cover'), cv = el.querySelector('.wc-bloom'), openBtn = el.querySelector('.open-btn');
    const eng = engine(cv, M);
    const portrait = () => eng.H > eng.W * 1.05;
    const bPos = () => portrait() ? [.12, .26] : [.3, .5], gPos = () => portrait() ? [.88, .78] : [.7, .5];
    const baseR = () => Math.min(eng.W, eng.H) * (portrait() ? .36 : .3);
    const bb = eng.add(eng.mk(...bPos(), state.b, 0)), gb = eng.add(eng.mk(...gPos(), state.g, 0)), mb = eng.add(eng.mk(.5, .5, mixed(), 0));
    mb.a = 0;
    // idle: the two pools grow in, slowly breathing
    let idle = true;
    const place = () => { const p = bPos(), q = gPos(); bb.fx = p[0]; bb.fy = p[1]; gb.fx = q[0]; gb.fy = q[1]; if (idle) { bb.rad = baseR(); gb.rad = baseR(); } };
    place(); addEventListener('resize', place);
    if (!M.reduced) { bb.rad = gb.rad = 0; M.tween(0, 1, 1800, 'out', p => { if (idle) { bb.rad = baseR() * p; gb.rad = baseR() * Math.max(0, p * 1.1 - .1); } }); }

    const sync = () => el.querySelectorAll('.wc-row').forEach(r => { const rgb = r.dataset.who === 'b' ? state.b : state.g, hx = r2h(rgb).toUpperCase(); r.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(SW[+b.dataset.i][0].toUpperCase() === hx))); });
    const pulse = (blob, rgb) => { blob.to = rgb.slice(); if (!idle) return; const r0 = baseR(); M.tween(.7, 1, 900, 'outBack', p => { blob.rad = r0 * p; eng.touch(); }); };
    el.querySelectorAll('.wc-dabs button').forEach(btn => btn.addEventListener('click', () => {
      if (!idle) return; const who = btn.closest('.wc-row').dataset.who, rgb = h2r(btn.dataset.hex);
      state[who] = rgb; state[who + 'n'] = SW[+btn.dataset.i][1]; tryLS('wc:colors', { b: r2h(state.b), g: r2h(state.g) });
      applyTheme(); pulse(who === 'b' ? bb : gb, rgb); mb.to = mixed(); sync();
      M.tone('pop'); M.haptic('tap');
    }));
    sync();
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    let started = false;
    const go = () => {
      if (started) return; started = true; idle = false; openBtn.disabled = true;
      EA.music(); M.requestTilt(); M.haptic('tap'); M.tone('whoosh');
      root.classList.add('is-mixing');
      const R = Math.max(eng.W, eng.H) * .78, b0 = bb.rad, g0 = gb.rad;
      mb.to = mixed(); mb.a = 1;
      M.tween(0, 1, 2300, 'out', p => { bb.rad = b0 + (R - b0) * p; gb.rad = g0 + (R - g0) * p; eng.touch(); });
      c.after(900, () => { M.tween(0, 1, 1700, 'out', p => { mb.rad = Math.min(eng.W, eng.H) * .5 * p; eng.touch(); }); M.tone('chime'); });
      c.after(1100, () => { root.classList.add('is-painting'); M.haptic('success'); });
      c.after(2200, () => { const r = root.querySelector('.wc-names .amp').getBoundingClientRect(); petalBurst(M, r.left + r.width / 2, r.top + r.height / 2, 46, { speed: .65, spread: 60 }); M.tone('pop'); });
      c.after(3500, () => { offTilt(); open(); c.after(1000, () => eng.stop()); });
    };
    openBtn.addEventListener('click', go);
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="wc-hd"><p class="eyebrow">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</p><h2>${mc.title != null ? esc(mc.title) : title}</h2><span class="wc-rule" aria-hidden="true"></span>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  };

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content, own = !isDemo(cp.heroImage);
    return `<div class="wc-hero">
      <div class="wc-hflora" aria-hidden="true">${flower(7, 'a', 1)}${flower(6, 'b', 2)}${leaf('a')}${leaf('b')}</div>
      <div class="wc-art${own ? ' own' : ' art'}"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"></div>
      <div class="wc-htxt">
        <p class="eyebrow">${e(mc.eyebrow || 'Ngày chung đôi')}</p>
        ${namesH(c)}
        ${cp.headline ? `<p class="wc-headline">${c.t(cp.headline)}</p>` : ''}
        <p class="wc-hdate"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>
        ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
        ${mc.showCountdown !== false ? ui.countdown() : ''}
      </div>
    </div>`;
  });

  const mixCard = c => {
    const m = mixed(), bS = shortOf(c.data.bride, ''), gS = shortOf(c.data.groom, '');
    return `<div class="wc-mix" data-mix>
      <div class="wc-drops" aria-hidden="true"><i class="d1"></i><i class="d2"></i><i class="dm"></i></div>
      <p class="wc-mixk">Màu cưới của chúng mình</p>
      <b class="wc-mixn" data-n="m">${nameOf(m)}</b>
      <small class="wc-mixs"><span data-n="b">${esc(bS)} chọn ${state.bn}</span> · <span data-n="g">${esc(gS)} chọn ${state.gn}</span></small>
    </div>`;
  };

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether;
    const met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <div class="wc-letter">
        <span class="wc-tape t1" aria-hidden="true"></span><span class="wc-tape t2" aria-hidden="true"></span>
        <p class="eyebrow">Thư mời</p>
        <p class="wc-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        <span class="wc-rule" aria-hidden="true"></span>
        ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="wc-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
        <p class="wc-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
      </div>
      ${days > 0 ? `<div class="wc-days" data-days="${days}"><span class="wc-dropn" aria-hidden="true"></span>
        <span class="n">${days.toLocaleString('vi-VN')}</span><span class="u">ngày bên nhau</span>
        ${met ? `<p>Từ ${met.split('-').reverse().join('.')}${place ? ` · ${e(place)}` : ''}</p>` : ''}</div>` : ''}
      ${mixCard(c)}
    </div>`;
  });

  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (cls, label, f) => `<article class="wc-fam ${cls}"><span class="label">${e(f.label || label)}</span>
      <p>Ông <b>${e(f.father)}</b></p><p>Bà <b>${e(f.mother)}</b></p>${f.address ? `<small>${e(f.address)}</small>` : ''}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? Math.round(c.p.kmBetween(pins.groom, pins.bride) / 10) * 10 : null;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="wc-fams">${fam('g', 'Nhà trai', D.groomFamily)}${fam('b', 'Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="wc-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="wc-homes"><svg viewBox="0 0 320 64" aria-hidden="true"><path class="r" pathLength="1" d="M26 42 C80 -12 118 70 164 30 S 252 -4 294 40"/><circle class="p1" cx="26" cy="42" r="9"/><circle class="p2" cx="294" cy="42" r="9"/></svg>
        <div class="ends"><span class="b">${e(homes.bride || '')}</span><span class="g">${e(homes.groom || '')}</span></div>
        ${km ? `<p>Hai miền quê cách nhau khoảng <b>${km.toLocaleString('vi-VN')} km</b>, hai nét cọ gặp nhau ở một mái nhà.</p>` : ''}</div>` : ''}
    </div>`;
  });

  // story: painted frames + the personal add-ons (traits, places, song, pet, letters, proposal)
  const RHY = { morning: ['Chim sớm', 'Thức dậy cùng nắng'], night: ['Cú đêm', 'Tỉnh táo cùng trăng'] };
  const fmtDate = d => String(d || '').split('-').reverse().join('.');
  EA.section('story', c => {
    const { esc: e, mod, ui } = c, s = mod.content, P = c.p, B = c.data.bride, G = c.data.groom;
    const trait = (who, p, cls) => {
      const t = P.get('traits.' + who, null); if (!t) return '';
      const rows = [t.nickname && ['Biệt danh', t.nickname], t.rhythm && RHY[t.rhythm] && ['Nhịp sống', RHY[t.rhythm][0]], t.drink && ['Thức uống', t.drink], t.hobby && ['Sở thích', t.hobby]].filter(Boolean);
      return rows.length ? `<article class="wc-trait ${cls}"><h3>${e(shortOf(p, ''))}</h3><dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${e(r[1])}</dd>`).join('')}</dl></article>` : '';
    };
    const traits = trait('bride', B, 'b') + trait('groom', G, 'g');
    const places = P.get('places', []);
    const song = P.get('song', null), pet = P.get('pet', null), lt = P.get('letters', null), prop = P.get('proposal', ''), joke = P.get('insideJoke', ''), q = P.get('quote', null);
    return `<div class="wrap">
      ${ui.head('Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="wc-chap">${(s.chapters || []).map((ch, i) => `<li class="${i % 2 ? 'r' : 'l'}">
        <figure><span class="wash" aria-hidden="true"></span><img src="${e(ch.image || '')}" alt="" loading="lazy"></figure>
        <div><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="wc-sq">${e(s.quote)}</p>` : ''}
      ${traits ? `<div class="wc-block"><h3 class="wc-bh">Hai tâm hồn, một nhịp tim</h3><div class="wc-traits">${traits}</div></div>` : ''}
      ${places.length ? `<div class="wc-block"><h3 class="wc-bh">Những nơi mình đã đi cùng nhau</h3><ol class="wc-places">${places.map((p, i) => `<li style="--i:${i}"><i aria-hidden="true"></i><b>${e(p.name)}</b>${p.date ? `<small>${e(p.date.split('-').reverse().join('/'))}</small>` : ''}</li>`).join('')}</ol></div>` : ''}
      ${song && song.title ? `<div class="wc-song"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><p class="label">Bài hát của hai đứa</p><b>${e(song.title)}</b>${song.artist ? `<small>${e(song.artist)}</small>` : ''}${song.lyric ? `<q>${e(song.lyric)}</q>` : ''}</div>` : ''}
      ${pet && pet.name ? `<div class="wc-pet"><span class="paws" aria-hidden="true"><i></i><i></i><i></i><i></i></span><p class="label">Thành viên thứ ba</p><b>${e(pet.name)}</b>${pet.kind ? `<small>một bé ${e(pet.kind)} sẽ có mặt trong ngày vui</small>` : ''}</div>` : ''}
      ${lt && (lt.bride || lt.groom) ? `<div class="wc-block"><h3 class="wc-bh">Thư tay gửi nhau</h3><div class="wc-letters">${lt.bride ? `<article class="b"><span class="label">${e(shortOf(B, ''))} viết</span><p>${e(lt.bride)}</p></article>` : ''}${lt.groom ? `<article class="g"><span class="label">${e(shortOf(G, ''))} viết</span><p>${e(lt.groom)}</p></article>` : ''}</div></div>` : ''}
      ${prop ? `<div class="wc-prop"><p class="label">Lời cầu hôn</p><p>${e(prop)}</p></div>` : ''}
      ${joke ? `<div class="wc-joke"><p class="label">Chuyện chỉ hai đứa hiểu</p><p>${e(joke)}</p></div>` : ''}
      ${q && q.text ? `<blockquote class="wc-pq">${e(q.text)}${q.author ? `<cite>${e(q.author)}</cite>` : ''}</blockquote>` : ''}
    </div>`;
  });

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const stems = [[-92, -14, 7, 1], [-48, 6, 6, 2], [0, -24, 8, 3], [48, 4, 5, 4], [92, -12, 6, 5]];
    return `<div class="wc-bye wrap narrow">
      <p class="eyebrow">Lời cảm ơn</p>
      <div class="wc-bouquet" aria-hidden="true">${stems.map(([x, y, n, s], i) => `<span class="st" style="--x:${x}px;--y:${y}px;--i:${i}"><em></em>${flower(n, '', s)}</span>`).join('')}<span class="lv l1">${leaf()}</span><span class="lv l2">${leaf()}</span><span class="lv l3">${leaf()}</span></div>
      <p class="wc-byeline">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="wc-byetext">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="wc-bsig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="wc-bdate">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Pha lại màu ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
    </div>`;
  });

  // ======================= behaviours =======================
  const EYE = { 'Love story': 'Chuyện tình', 'Save the date': 'Ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khung hình', 'Dress code & notes': 'Trang phục', 'Dress code &amp; notes': 'Trang phục', 'Wedding guide': 'Cẩm nang', 'Gift registry': 'Gợi ý quà', 'Guestbook': 'Lưu bút', 'Contact': 'Liên hệ', 'RSVP': 'Phản hồi', 'A note from us': 'Lời nhắn', 'Thank you': 'Cảm ơn', 'Save our date': 'Ngày chung đôi', 'Mừng cưới': 'Mừng cưới' };

  EA.afterRender((c, main) => {
    const M = c.motion, root = document.documentElement;
    root.dataset.tier = M.tier;
    // English eyebrows from core's default layouts → Vietnamese
    main.querySelectorAll('.eyebrow').forEach(el => { const k = el.innerHTML.trim(); if (EYE[k]) el.textContent = EYE[k]; });
    main.querySelectorAll('.fine a, .gift-item a').forEach(a => { a.innerHTML = a.innerHTML.replace(/\s*[↗→]\s*$/u, ''); });

    // fixed wash layer: the pigment keeps spreading as the page is read
    let fx = document.querySelector('.wc-fx');
    if (!fx) { fx = document.createElement('div'); fx.className = 'wc-fx'; fx.setAttribute('aria-hidden', 'true'); fx.innerHTML = '<i class="a"></i><i class="b"></i><i class="m"></i>'; document.body.prepend(fx); }
    let raf = 0;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const mx = document.documentElement.scrollHeight - innerHeight; fx.style.setProperty('--sp', (mx > 0 ? Math.min(1, scrollY / mx) : 0).toFixed(3)); }); };
    if (!M.reduced) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); } else fx.style.setProperty('--sp', '.5');

    // names get painted when the hero scrolls into view (and after opening)
    const heroNames = main.querySelector('.wc-hero .wc-names');
    if (heroNames) { const paint = () => c.after(350, () => { heroNames.classList.add('is-painting'); }); M.inView(heroNames, paint, { threshold: .3 }); }

    // days together: the drop fills and the number counts up
    const days = main.querySelector('.wc-days');
    if (days) M.inView(days, () => { days.classList.add('on'); const n = days.querySelector('.n'), to = +days.dataset.days; M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });
    main.querySelectorAll('.wc-mix, .wc-homes, .wc-song, .wc-pet, .wc-traits, .wc-places, .wc-letters, .wc-bouquet, .wc-chap li').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .3 }));

    // the wedding colour card follows the cover's picks
    const upd = () => { const m = main.querySelector('[data-mix]'); if (!m) return; m.querySelector('[data-n=m]').textContent = nameOf(mixed()); m.querySelector('[data-n=b]').textContent = `${shortOf(c.data.bride, '')} chọn ${state.bn}`; m.querySelector('[data-n=g]').textContent = `${shortOf(c.data.groom, '')} chọn ${state.gn}`; };
    document.addEventListener('wc:colors', upd);

    // easter egg: tap "&" three times, a bouquet of petals in your two colours
    const amp = main.querySelector('.wc-hero .amp');
    if (amp) { let taps = 0, tm = 0; amp.style.cursor = 'pointer'; amp.setAttribute('role', 'button'); amp.setAttribute('tabindex', '0'); amp.setAttribute('aria-label', 'Chạm ba lần để thả cánh hoa');
      const hit = () => { taps++; clearTimeout(tm); tm = setTimeout(() => { taps = 0; }, 1100); M.tone('pop'); M.haptic('tap'); if (taps >= 3) { taps = 0; const r = amp.getBoundingClientRect(); petalBurst(M, r.left + r.width / 2, r.top + r.height / 2, 70, { speed: .8, spread: 40, life: 5000 }); M.tone('chime'); M.haptic('success'); } };
      amp.addEventListener('click', hit); amp.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hit(); } }); }
  });

  // finale after RSVP: a full-page bloom in the wedding colour with petals and a thank-you
  EA.onRsvp((entry, c) => {
    const M = (c && c.motion) || EA.motion, name = String(entry?.name || '').trim();
    if (entry && entry.attending === false) return;
    const ov = document.createElement('div'); ov.className = 'wc-finale';
    ov.innerHTML = `<canvas aria-hidden="true"></canvas><p><span>Cảm ơn ${esc(name || 'bạn')}</span><small>Màu của bạn đã hòa vào ngày vui</small></p>`;
    document.body.appendChild(ov);
    const eng = engine(ov.querySelector('canvas'), M), W = eng.W, H = eng.H, R = Math.max(W, H) * .8;
    const a = eng.add(eng.mk(.2, 1.02, state.b, 0)), b = eng.add(eng.mk(.8, 1.02, state.g, 0)), m = eng.add(eng.mk(.5, .95, mixed(), 0));
    M.tween(0, 1, 2000, 'out', p => { a.rad = R * p; b.rad = R * p * .95; m.rad = R * .62 * p; eng.touch(); });
    requestAnimationFrame(() => ov.classList.add('on'));
    petalBurst(M, W / 2, H * .85, 60, { speed: .9, spread: W * .6, life: 4800 });
    M.haptic('success'); M.tone('chime'); setTimeout(() => M.tone('pop'), 600);
    setTimeout(() => ov.classList.remove('on'), 3600);
    setTimeout(() => { eng.stop(); ov.remove(); }, 4500);
  });

  // guestbook: a petal drifts up from the form
  EA.onGuestbook(() => {
    const M = EA.motion, f = document.querySelector('.wish-form'); if (!f) return;
    const r = f.getBoundingClientRect(); petalBurst(M, r.left + r.width / 2, Math.min(innerHeight - 40, r.bottom - 30), 22, { speed: .55, spread: r.width * .6, life: 3200 });
    M.tone('pop'); M.haptic('tap');
  });
})();
