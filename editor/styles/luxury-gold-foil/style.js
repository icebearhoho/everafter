// Luxury Gold Foil: hot-stamped by hand.
// Cover: black velvet card with a ghost die-mark. Pull the brass lever (or tap "Ép kim") and the hot brass die comes down,
// presses the monogram, sparks fly, the names are gilded and the foil keeps catching the light as the phone tilts.
// Everything is CSS / inline SVG / canvas. No external images besides the couple's own photo.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/luxury_gold_couple_1790233121353.jpg';
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? PHOTO : h; };
  const NB = s => String(s || '').trim().replace(/\s+/g, ' ');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fmt = n => Math.round(n).toLocaleString('vi-VN');
  const dmy = iso => String(iso || '').split('-').reverse().join('.');
  const plain = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
  const initial = (c, who) => { const d = c.data[who]; const w = String(d.short || d.name || '?').trim().split(/\s+/).pop(); return Array.from(w)[0].toUpperCase(); };

  // ---------------------------------------------------------------- shared svg defs (the foil gradient)
  const STOPS = [[0, '#8a6a14'], [.1, '#c9a227'], [.22, '#fff3b0'], [.34, '#b8902a'], [.46, '#8f6e16'], [.58, '#d9b94a'], [.7, '#fff0a6'], [.84, '#b08a24'], [1, '#8a6a14']];
  document.body.insertAdjacentHTML('beforeend', `<svg class="lx-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="lx-foil" x1="0" y1="0" x2="1" y2="1" spreadMethod="reflect">${STOPS.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient>
    <radialGradient id="lx-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
  </defs></svg>`);
  const foilGrad = document.getElementById('lx-foil');
  let tiltOn = false;
  const startFoil = M => {
    if (tiltOn) return; tiltOn = true;
    const root = document.documentElement.style;
    if (M.reduced) return;
    M.tilt(({ x, y }) => {
      root.setProperty('--fx', x.toFixed(3)); root.setProperty('--fy', y.toFixed(3));
      foilGrad.setAttribute('x1', (x * .55).toFixed(3)); foilGrad.setAttribute('y1', (y * .4).toFixed(3));
      foilGrad.setAttribute('x2', (1 + x * .55).toFixed(3)); foilGrad.setAttribute('y2', (1 + y * .4).toFixed(3));
    });
  };

  // ---------------------------------------------------------------- icons for the crest
  const ICONS = {
    brush: '<path d="M4.5 19.5c2.2-.4 3.3-1.6 3.3-3.4l8.7-8.7 2.4 2.4-8.7 8.7c-1.8 0-3 1.2-3.4 3.3-1.2.1-1.9-.8-2.3-2.3z"/><path d="M15.5 6.5l2-2 2.5 2.5-2 2"/>',
    guitar: '<circle cx="8.5" cy="15.5" r="4.6"/><circle cx="8.5" cy="15.5" r="1.2"/><path d="M12 12l8-8M17.5 3.5l3 3"/>',
    note: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    book: '<path d="M3 5h7a2 2 0 012 2v12a2 2 0 00-2-2H3zM21 5h-7a2 2 0 00-2 2v12a2 2 0 012-2h7z"/>',
    camera: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    plane: '<path d="M3 13L21 5l-5 15-4-6-6-1zM12 14l4-5"/>',
    cup: '<path d="M5 9h12v4a5 5 0 01-5 5h-2a5 5 0 01-5-5zM17 10h2a2 2 0 010 4h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>',
    paw: '<ellipse cx="12" cy="16" rx="4.5" ry="3.6"/><circle cx="6" cy="11" r="1.8"/><circle cx="10" cy="7" r="1.8"/><circle cx="14" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.4 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z"/>',
    star: '<path d="M12 3l2.2 6.2L21 12l-6.8 2.8L12 21l-2.2-6.2L3 12l6.8-2.8z"/>'
  };
  const pickIcon = txt => {
    const t = plain(txt);
    if (/guitar|dan |ghi ta/.test(t + ' ')) return 'guitar';
    if (/nhac|hat|piano|ca hat|violin/.test(t)) return 'note';
    if (/ve|mau|tranh|hoa|nghe thuat|thiet ke/.test(t)) return 'brush';
    if (/sach|doc|viet/.test(t)) return 'book';
    if (/anh|chup|phim|camera/.test(t)) return 'camera';
    if (/du lich|phuot|bay|di choi|kham pha|travel/.test(t)) return 'plane';
    if (/ca phe|tra|cafe|coffee|nau|bep|banh/.test(t)) return 'cup';
    return 'star';
  };
  const ico = (k, cls = '') => `<svg class="lx-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="url(#lx-foil)" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.star}</svg>`;

  // ---------------------------------------------------------------- monogram medallion
  const monogram = (c, id = '') => {
    const A = initial(c, 'bride'), B = initial(c, 'groom');
    const ticks = Array.from({ length: 48 }, (_, i) => { const a = i * 7.5 * Math.PI / 180, r1 = 80, r2 = i % 4 === 0 ? 74 : 77; return `M${(100 + r1 * Math.sin(a)).toFixed(1)} ${(100 - r1 * Math.cos(a)).toFixed(1)}L${(100 + r2 * Math.sin(a)).toFixed(1)} ${(100 - r2 * Math.cos(a)).toFixed(1)}`; }).join('');
    const dia = [0, 90, 180, 270].map(a => `<path transform="rotate(${a} 100 100)" d="M100 4l3.4 5L100 14l-3.4-5z" fill="url(#lx-foil)" stroke="none"/>`).join('');
    return `<svg class="lx-mono" viewBox="0 0 200 200" role="img" aria-label="Monogram ${esc(A)} và ${esc(B)}">
      <circle class="ring" cx="100" cy="100" r="92" fill="none" stroke="url(#lx-foil)" stroke-width="2.4" pathLength="1"/>
      <circle class="ring2" cx="100" cy="100" r="86" fill="none" stroke="url(#lx-foil)" stroke-width=".9" pathLength="1"/>
      <path d="${ticks}" stroke="url(#lx-foil)" stroke-width=".8" fill="none"/>${dia}
      <text class="ini" x="64" y="124" text-anchor="middle" fill="url(#lx-foil)">${esc(A)}</text>
      <text class="ini" x="138" y="124" text-anchor="middle" fill="url(#lx-foil)">${esc(B)}</text>
      <text class="amp" x="101" y="112" text-anchor="middle" fill="url(#lx-foil)">&amp;</text>
    </svg>`;
  };

  // ---------------------------------------------------------------- sparks / dust
  const sparkSystem = (cv, M, dust) => {
    const sys = M.particles(cv, {
      count: dust ? 26 : 0,
      init(p, i, w, h) {
        if (!p.burst) { if (!dust) { p.dead = true; return; } p.x = Math.random() * w; p.y = Math.random() * h; p.vx = (Math.random() - .5) * .01; p.vy = -.008 - Math.random() * .016; p.r = .6 + Math.random() * 1.6; p.tw = Math.random() * 6; p.dust = true; }
      },
      step(p, dt, w, h) {
        if (p.dead) return true;
        if (p.dust) { p.x += p.vx * dt; p.y += p.vy * dt; p.tw += dt * .004; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } return false; }
        const k = Math.pow(.965, dt / 16); p.vx *= k; p.vy = (p.vy + .0009 * dt) * k; p.x += p.vx * dt; p.y += p.vy * dt;
        return p.life < p.ttl;
      },
      draw(g, p) {
        if (p.dead) return;
        if (p.dust) { g.globalAlpha = .25 + .45 * (Math.sin(p.tw) * .5 + .5); g.fillStyle = '#f3dc8a'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); g.globalAlpha = 1; return; }
        const a = clamp(1 - p.life / p.ttl); g.globalAlpha = a; g.strokeStyle = p.c; g.lineWidth = p.w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 60, p.y - p.vy * 60); g.stroke(); g.globalAlpha = 1;
      }
    });
    sys.sparks = (x, y, n = 70) => sys.burst(n, p => { const a = Math.random() * 6.283, s = .25 + Math.random() * .9; p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s - .12; p.ttl = 600 + Math.random() * 900; p.w = .8 + Math.random() * 1.6; p.c = ['#fff3b0', '#f3dc8a', '#d4af37', '#ffb347'][(Math.random() * 4) | 0]; });
    return sys;
  };

  const splitLine = (name) => `<span class="n0">${esc(NB(name))}</span><span class="n1" aria-hidden="true">${esc(NB(name))}</span>`;
  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="lx-cover">
      <div class="lx-grain" aria-hidden="true"></div><i class="lx-frame" aria-hidden="true"></i>
      <canvas class="lx-dust" aria-hidden="true"></canvas>
      <div class="lx-cin">
        <p class="lx-eyebrow">Trân trọng kính mời</p>
        <h1 class="lx-names"><span class="lx-nm">${splitLine(D.bride.name)}</span><span class="lx-and">và</span><span class="lx-nm">${splitLine(D.groom.name)}</span></h1>
        <div class="lx-zone">
          <div class="lx-halo" aria-hidden="true"></div>
          <div class="lx-ghost" aria-hidden="true">${monogram(c)}</div>
          <div class="lx-foilmark" aria-hidden="true">${monogram(c)}<i class="lx-sheen"></i></div>
          <div class="lx-die" aria-hidden="true"><i class="lx-dface"><b>${e(initial(c, 'groom'))}${e(initial(c, 'bride'))}</b></i></div>
          <div class="lx-lever"><i class="lx-rod"></i><button class="lx-knob" type="button" aria-label="Kéo cần ép kim xuống">${c.icon('down')}</button></div>
        </div>
        <div class="lx-foot">
          <div class="lx-date"><span class="lx-dow">${c.dow}</span><b>${c.d}<i></i>${c.m}<i></i>${c.y}</b></div>
          <p class="lx-guest">Gửi <b>${e(c.guest)}</b></p>
          <p class="lx-hint">Kéo cần gạt xuống để ép kim</p>
          <button class="open-btn" type="button">Ép kim và mở thiệp</button>
        </div>
      </div>
      <canvas class="lx-sparks" aria-hidden="true"></canvas>
    </div>`;
    const root = el.querySelector('.lx-cover'), zone = el.querySelector('.lx-zone'), knob = el.querySelector('.lx-knob'), rod = el.querySelector('.lx-rod');
    const openBtn = el.querySelector('.open-btn');
    const dust = sparkSystem(el.querySelector('.lx-dust'), M, true);
    const sparks = sparkSystem(el.querySelector('.lx-sparks'), M, false);
    startFoil(M);
    const wait = ms => new Promise(r => c.after(ms, r));
    let started = false;
    const setP = p => { root.style.setProperty('--pd', p.toFixed(3)); knob.style.setProperty('--kp', p.toFixed(3)); };
    setP(0);
    const run = async () => {
      if (started) return; started = true;
      knob.disabled = true; openBtn.disabled = true;
      M.requestTilt(); EA.music(); M.haptic('tap'); M.tone('whoosh');
      root.classList.add('is-pressing');
      const p0 = +root.style.getPropertyValue('--pd') || 0;
      await M.tween(p0, 1, 520 * (1 - p0) + 120, 'out', setP);
      // contact
      M.haptic('thud'); M.tone('thud');
      root.classList.add('hot', 'shake', 'stamped');
      const r = zone.getBoundingClientRect(), cr = root.getBoundingClientRect();
      sparks.sparks(r.left - cr.left + r.width / 2, r.top - cr.top + r.height / 2, 80);
      c.after(160, () => sparks.sparks(r.left - cr.left + r.width / 2, r.top - cr.top + r.height / 2, 40));
      await wait(520);
      root.classList.remove('shake'); root.classList.add('lift'); M.tone('click');
      await wait(420);
      // gild the names
      root.classList.add('gilded'); M.tone('chime'); M.haptic('success');
      await wait(1900);
      root.classList.remove('hot');
      open();
      c.after(1400, () => { dust.stop(); sparks.stop(); });
    };
    M.drag(knob, {
      axis: 'y', distance: Math.max(80, rod.clientHeight - 56),
      onMove(p) { if (!started) { setP(p); if (p > .97) run(); } },
      onEnd(p) { if (started) return; if (p > .72) run(); else M.tween(p, 0, 340, 'out', setP); }
    });
    knob.addEventListener('pointerdown', () => { M.requestTilt(); M.haptic('tap'); M.tone('click'); });
    knob.addEventListener('keydown', ev => { if (ev.key === 'ArrowDown' || ev.key === 'Enter') { ev.preventDefault(); run(); } });
    openBtn.addEventListener('click', run);
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="lx-hd"><span class="lx-eb">${esc(mc.eyebrow != null ? mc.eyebrow : eb)}</span><h2 class="lx-foil">${esc(mc.title != null && mc.title !== '' ? mc.title : title)}</h2><span class="lx-rule" aria-hidden="true"><i></i><u></u><i></i></span>${sub || mc.sub ? `<p class="lx-sub">${esc(mc.sub || sub)}</p>` : ''}</header>`;
  };

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    return `<div class="lx-hero">
      <p class="lx-eyebrow">${e(mc.eyebrow || 'Ngày chung đôi')}</p>
      <div class="lx-arch"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"><i class="lx-gleam" aria-hidden="true"></i></div>
      <button class="lx-hmono" type="button" aria-label="Monogram, chạm ba lần để ép kim lại">${monogram(c)}</button>
      <h1 class="lx-hnames"><span class="lx-foil">${e(NB(D.bride.name))}</span><span class="lx-and">và</span><span class="lx-foil">${e(NB(D.groom.name))}</span></h1>
      ${cp.headline ? `<p class="lx-headline">${c.t(cp.headline)}</p>` : ''}
      <div class="lx-hdate"><span>${c.dow}</span><b class="lx-foil">${c.d} . ${c.m} . ${c.y}</b>${cp.lunarDate ? `<span>${e(cp.lunarDate)}</span>` : ''}${cp.city ? `<span>${e(cp.city)}</span>` : ''}</div>
      <p class="lx-toast" role="status" aria-live="polite"></p>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  // medallion for "ngày bên nhau"
  const scallop = (r0, r1, n) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, r = i % 2 ? r0 : r1; d += `${i ? 'L' : 'M'}${(100 + r * Math.sin(a)).toFixed(1)} ${(100 - r * Math.cos(a)).toFixed(1)}`; } return d + 'Z'; };

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content, days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const lastEv = D.events[D.events.length - 1];
    const seal = days != null && days > 0 ? `<div class="lx-seal" data-n="${days}">
      <svg viewBox="0 0 200 200" aria-hidden="true"><path d="${scallop(86, 96, 28)}" fill="url(#lx-foil)"/><circle cx="100" cy="100" r="76" fill="#1a1714"/><circle cx="100" cy="100" r="72" fill="none" stroke="url(#lx-foil)" stroke-width="1.2"/><circle cx="100" cy="100" r="66" fill="none" stroke="url(#lx-foil)" stroke-width=".6" stroke-dasharray="1.5 3"/></svg>
      <div class="lx-seal-t"><b class="lx-foil">${fmt(days)}</b><span>ngày bên nhau</span></div>
      <p class="lx-seal-c">Từ ngày ${dmy(met)}${place ? `, ${e(place)}` : ''}</p></div>` : '';
    let n = 0;
    return `<div class="wrap narrow">
      <article class="lx-letter">
        <i class="lx-cn tl"></i><i class="lx-cn tr"></i><i class="lx-cn bl"></i><i class="lx-cn br"></i>
        <span class="lx-eb dk">Thư mời</span>
        <div class="lx-salute">${t(mc.greeting || 'Gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        <span class="lx-rule dk" aria-hidden="true"><i></i><u></u><i></i></span>
        ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="lx-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
        <p class="lx-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
      </article>
      ${seal}
      <div class="lx-place" aria-label="Thẻ đặt chỗ">
        <span class="lx-eb dk">Dành riêng cho</span>
        <div class="lx-embossed">${e(guest)}</div>
        <span class="lx-rule dk" aria-hidden="true"><i></i><u></u><i></i></span>
        <p>${c.dow}, ${c.d}.${c.m}.${c.y}${lastEv ? ` · ${e(lastEv.time)}` : ''}</p>
        ${lastEv ? `<p class="lx-pl2">${e(lastEv.place)}</p>` : ''}
      </div>
    </div>`;
  });

  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="lx-fam"><span class="lx-eb">${label}</span>
      <p class="r">Ông</p><p class="nm">${e(f.father)}</p><p class="r">Bà</p><p class="nm">${e(f.mother)}</p>${f.address ? `<p class="ad">${e(f.address)}</p>` : ''}</article>`;
    const hm = c.p.get('hometowns', {});
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}
      <div class="lx-fams">${fam('Nhà trai', D.groomFamily)}<div class="lx-fmono" aria-hidden="true">${monogram(c)}</div>${fam('Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="lx-note">${e(D.announceNote)}</p>` : ''}
      ${hm.bride || hm.groom ? `<p class="lx-homes">${hm.groom ? `Nhà trai từ <b>${e(hm.groom)}</b>` : ''}${hm.groom && hm.bride ? ' · ' : ''}${hm.bride ? `Nhà gái từ <b>${e(hm.bride)}</b>` : ''}</p>` : ''}
    </div>`;
  });

  // ---- story + crest builder
  const crestItems = c => {
    const p = c.p, tr = p.get('traits', {}), B = tr.bride || {}, G = tr.groom || {};
    const bn = c.data.bride.short || c.data.bride.name, gn = c.data.groom.short || c.data.groom.name, it = [];
    if (B.hobby) it.push({ k: pickIcon(B.hobby), l: B.hobby, who: bn });
    if (G.hobby) it.push({ k: pickIcon(G.hobby), l: G.hobby, who: gn });
    if (p.has('pet.name')) it.push({ k: 'paw', l: p.get('pet.name'), who: p.get('pet.kind', 'thú cưng') });
    if (B.drink || G.drink) it.push({ k: 'cup', l: [B.drink, G.drink].filter(Boolean)[0], who: 'Thức uống' });
    if (p.has('song.title')) it.push({ k: 'note', l: p.get('song.title'), who: 'Bài hát' });
    const pl = p.get('places', []); if (pl.length) it.push({ k: 'plane', l: `${pl.length} điểm đến`, who: 'Hành trình' });
    if (B.rhythm && G.rhythm) it.push({ k: B.rhythm === 'morning' ? 'sun' : 'moon', l: B.rhythm === 'morning' ? 'Dậy cùng nắng' : 'Thức cùng đêm', who: 'Nhịp sống' });
    return it.slice(0, 4);
  };
  EA.section('story', c => {
    const { esc: e, mod } = c, s = mod.content;
    const items = crestItems(c);
    const pos = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    const crest = items.length >= 2 ? `<div class="lx-crestw"><span class="lx-eb">Huy hiệu của chúng mình</span><h3 class="lx-foil">Bốn góc của một mái nhà</h3>
      <div class="lx-crest" data-tilt><svg viewBox="0 0 240 240" aria-hidden="true">
        <path class="sh" pathLength="1" d="M120 8c26 18 58 22 100 22v82c0 56-40 96-100 120C60 208 20 168 20 112V30c42 0 74-4 100-22z" fill="rgba(212,175,55,.05)" stroke="url(#lx-foil)" stroke-width="2.2"/>
        <path class="sh2" pathLength="1" d="M120 22c22 14 50 19 86 20v70c0 48-34 82-86 103-52-21-86-55-86-103V42c36-1 64-6 86-20z" fill="none" stroke="url(#lx-foil)" stroke-width=".8"/>
        <path class="cr" pathLength="1" d="M120 22v196M24 112h192" stroke="url(#lx-foil)" stroke-width=".9" fill="none"/>
        ${Array.from({ length: 4 }, (_, i) => { const [sx, sy] = pos[i]; const it = items[i]; return `<g class="q" style="--i:${i}" transform="translate(${120 + sx * 49 - 27.6} ${112 + sy * 47 - 27.6}) scale(2.3)">${it ? ICONS[it.k] : ICONS.star}</g>`; }).join('')}
        <circle cx="120" cy="112" r="25" fill="#1a1714" stroke="url(#lx-foil)" stroke-width="1.6"/>
        <text x="120" y="121" text-anchor="middle" class="cini" fill="url(#lx-foil)">${e(initial(c, 'bride'))}${e(initial(c, 'groom'))}</text>
      </svg></div>
      <ul class="lx-legend">${items.map(it => `<li>${ico(it.k)}<span class="lx-eb">${e(it.who)}</span><b>${e(it.l)}</b></li>`).join('')}</ul></div>` : '';
    return `<div class="wrap">
      ${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="lx-chs">${(s.chapters || []).map((ch, i) => `<li class="lx-ch"><span class="lx-no lx-foil">${String(i + 1).padStart(2, '0')}</span>
        ${ch.image ? `<div class="lx-chimg"><img src="${e(ch.image)}" alt="" loading="lazy"></div>` : ''}
        <div><span class="lx-eb">${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="lx-sq">${e(s.quote)}</p>` : ''}
      ${crest}
    </div>`;
  });

  EA.section('gallery', c => `<div class="wrap">${head(c, 'Khung hình', 'Khoảnh khắc của chúng mình')}
    <div class="lx-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  EA.section('quote', c => {
    const { data: D, esc: e, p } = c;
    const song = p.has('song.title');
    const L = p.get('letters', {});
    const lets = [['bride', D.bride.short || D.bride.name], ['groom', D.groom.short || D.groom.name]].filter(([k]) => L[k]);
    return `<div class="wrap narrow">
      ${head(c, 'Lời nhắn', 'Lời nhắn từ chúng mình')}
      ${D.quote ? `<blockquote class="lx-q">${e(D.quote)}</blockquote>` : ''}
      ${song ? `<figure class="lx-song"><span class="lx-eb">Bản nhạc của chúng mình</span>
        <b class="lx-foil">${e(p.get('song.title'))}</b>${p.has('song.artist') ? `<span class="art">${e(p.get('song.artist'))}</span>` : ''}
        ${p.has('song.lyric') ? `<blockquote class="lx-foil lyr">${e(p.get('song.lyric'))}</blockquote>` : ''}</figure>` : ''}
      ${p.has('proposal') ? `<div class="lx-prop"><span class="lx-eb">Khoảnh khắc ngỏ lời</span><p>${e(p.get('proposal'))}</p></div>` : ''}
      ${lets.length ? `<div class="lx-letters">${lets.map(([k, nm]) => `<details class="lx-lt"><summary><span class="lx-eb">Thư của</span><b>${e(nm)}</b></summary><p>${e(L[k])}</p></details>`).join('')}</div>` : ''}
    </div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một dấu ép kim sẽ được khắc riêng cho bạn')}<div class="lx-rsvp">${c.ui.rsvpForm()}</div></div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="lx-bye">
      <span class="lx-eb">Lời cảm ơn</span>
      <div class="lx-bmono">${monogram(c)}</div>
      <p class="lx-bye-line">Hẹn gặp <b class="lx-foil">${e(guest)}</b> ngày vui</p>
      <p class="lx-bye-text">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="lx-bye-sig lx-foil">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <div class="lx-wall" aria-label="Những dấu ép kim của khách mời"></div>
      <p class="lx-bye-date">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Ép kim lại ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  const miniSeal = (nm, i) => `<span class="ms" style="--i:${i}"><svg viewBox="0 0 200 200" aria-hidden="true"><path d="${scallop(84, 96, 20)}" fill="url(#lx-foil)"/><circle cx="100" cy="100" r="68" fill="none" stroke="#1a1714" stroke-width="3"/></svg><b>${esc(Array.from(nm.trim())[0].toUpperCase())}</b><em>${esc(nm)}</em></span>`;
  const wall = (main, list) => {
    const el = main.querySelector('.lx-wall'); if (!el) return;
    const names = list.map(x => String(x?.name || '').trim()).filter(Boolean).slice(-8);
    el.innerHTML = names.map(miniSeal).join('');
  };
  const refresh = main => { try { Promise.resolve(EA.shared.list('seals')).then(l => wall(main, l || [])).catch(() => {}); } catch { /* ignore */ } };

  EA.afterRender((c, main) => {
    const M = c.motion;
    startFoil(M);
    // easter egg: triple-tap the hero monogram to re-stamp it
    const hm = main.querySelector('.lx-hmono'), toast = main.querySelector('.lx-toast');
    if (hm) {
      let taps = 0, timer = 0;
      hm.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100); M.tone('click');
        if (taps >= 3) {
          taps = 0; hm.classList.remove('restamp'); void hm.offsetWidth; hm.classList.add('restamp'); M.haptic('thud'); M.tone('thud'); c.after(500, () => M.tone('chime'));
          const d = c.p.daysTogether;
          toast.textContent = d ? `Một dấu ép kim nữa cho ${fmt(d)} ngày bên nhau` : `Một dấu ép kim nữa cho ngày ${c.d}.${c.m}.${c.y}`;
          toast.classList.add('on'); setTimeout(() => toast.classList.remove('on'), 5000);
        }
      });
    }
    // medallion stamps down with a count-up
    const seal = main.querySelector('.lx-seal');
    if (seal) M.inView(seal, () => {
      seal.classList.add('on');
      const b = seal.querySelector('b'), to = +seal.dataset.n;
      c.after(380, () => { M.tone('thud'); M.haptic('thud'); });
      M.tween(0, to, 2000, 'out', v => { b.textContent = fmt(v); });
    }, { threshold: .5 });
    const place = main.querySelector('.lx-place');
    if (place) M.inView(place, () => place.classList.add('on'), { threshold: .5 });
    const cw = main.querySelector('.lx-crestw');
    if (cw) {
      M.inView(cw, () => { cw.classList.add('on'); M.tone('chime'); }, { threshold: .35 });
      const cr = cw.querySelector('.lx-crest');
      if (!c.reduced) M.tilt(({ x, y }) => { cr.style.transform = `perspective(700px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`; });
    }
    main.querySelectorAll('.lx-song, .lx-hd, .lx-q').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .3 }));
    const bye = main.querySelector('.lx-bye');
    if (bye) { M.inView(bye, () => bye.classList.add('on'), { threshold: .35 }); refresh(main); }
  });

  // finale after RSVP: the brass die stamps a foil seal onto the guest's place card
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    const main = document.getElementById('inv'); if (main) refresh(main);
    if (entry && entry.attending === false) return;
    const name = String(entry?.name || '').trim() || 'Quý khách';
    try { EA.shared.add('seals', { name }); } catch { /* local only */ }
    const o = document.createElement('div');
    o.className = 'lx-fin'; o.setAttribute('role', 'status');
    o.innerHTML = `<canvas aria-hidden="true"></canvas>
      <div class="lx-fcard"><span class="lx-eb dk">Đã giữ chỗ cho</span><div class="lx-embossed">${esc(name)}</div><span class="lx-rule dk" aria-hidden="true"><i></i><u></u><i></i></span><p>Hẹn gặp bạn trong ngày vui</p>
        <div class="lx-fseal">${monogram(c)}</div>
        <div class="lx-fdie" aria-hidden="true"><i></i></div></div>`;
    document.body.appendChild(o);
    const sys = sparkSystem(o.querySelector('canvas'), M, false);
    requestAnimationFrame(() => o.classList.add('on'));
    const close = () => { o.classList.remove('on'); setTimeout(() => { sys.stop(); o.remove(); }, 600); };
    o.addEventListener('click', close);
    setTimeout(() => { M.haptic('thud'); M.tone('thud'); o.classList.add('hit'); const r = o.querySelector('.lx-fseal').getBoundingClientRect(); sys.sparks(r.left + r.width / 2, r.top + r.height / 2, 70); }, 900);
    setTimeout(() => { M.tone('chime'); M.haptic('success'); }, 1500);
    setTimeout(close, 6200);
  });
})();
