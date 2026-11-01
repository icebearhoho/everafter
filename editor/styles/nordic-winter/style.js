// Nordic Winter: a snow globe on a windowsill, and the first winter two people spent together.
// Cover: shake the phone (or swipe the globe, or wipe the frost off the glass): snow swirls around the couple, settles to reveal the names, and the camera dives into the globe.
// All artwork is CSS / inline SVG / canvas. No external images besides the couple's own photos in config.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const nb = s => String(s).replace(/ /g, ' ');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const dmy = iso => String(iso || '').split('-').reverse().join('.');
  const realPhoto = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? '' : h; };

  const EB = { 'Love story': 'Mùa đông đầu tiên', 'Save the date': 'Ghi nhớ ngày vui', 'Wedding itinerary': 'Lịch trình ngày vui', 'Wedding party': 'Những người đồng hành', 'Wedding film': 'Thước phim cưới', 'A glimpse of us': 'Khung cửa sổ của hai đứa', 'Dress code &amp; notes': 'Trang phục &amp; lưu ý', 'Wedding guide': 'Cẩm nang cho khách', 'RSVP': 'Xác nhận tham dự', 'Gift registry': 'Gợi ý quà tặng', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ' };
  let snowfall = null, wind = 0;
  const patch = c => {
    if (c.ui.__nw) return; c.ui.__nw = 1;
    const head = c.ui.head;
    c.ui.head = (eb, ti, su) => head(EB[eb] || eb, ti, su);
    document.documentElement.dataset.tier = c.motion.tier;
  };
  const S = (id, fn) => EA.section(id, c => (patch(c), fn(c)));

  // ---------- artwork ----------
  let uidN = 0;
  const pine = (x, y, s, fill = '#2f5a4a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -46L11 -26H5L15 -10H7L19 8H-19L-7 -10H-15L-5 -26H-11Z" fill="${fill}"/><path d="M0 -46L11 -26H0ZM0 -10L15 -10L7 -10ZM0 8H19L7 -10H0Z" fill="#fff" opacity=".22"/><rect x="-2.5" y="8" width="5" height="8" fill="#4a3426"/></g>`;
  // the globe's scene (the couple under a lamppost, a cabin, pines, the moon)
  const scene = () => {
    const u = 'nw' + (++uidN);
    return `<svg class="nw-scene" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16263c"/><stop offset=".62" stop-color="#34536f"/><stop offset="1" stop-color="#6f93b2"/></linearGradient>
      <radialGradient id="${u}l"><stop offset="0" stop-color="#ffd58a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}m"><stop offset="0" stop-color="#f6f0dc" stop-opacity=".55"/><stop offset="1" stop-color="#f6f0dc" stop-opacity="0"/></radialGradient></defs>
      <rect width="300" height="300" fill="url(#${u}s)"/>
      <g fill="#fff" opacity=".85"><circle cx="40" cy="30" r="1.1"/><circle cx="120" cy="22" r="1.3"/><circle cx="190" cy="44" r="1"/><circle cx="250" cy="26" r="1.2"/><circle cx="268" cy="70" r="1"/><circle cx="150" cy="70" r="1"/><circle cx="20" cy="84" r="1"/></g>
      <circle cx="64" cy="64" r="46" fill="url(#${u}m)"/><circle class="nw-moon" cx="64" cy="64" r="15" fill="#f6f0dc"/><circle cx="59" cy="60" r="3" fill="#e2dcc4"/>
      <path d="M0 196L48 142L92 184L148 120L206 180L256 140L300 176V300H0Z" fill="#7f9db8"/><path d="M148 120L130 140L148 134L162 142ZM48 142L36 156L50 150L62 158Z" fill="#fff" opacity=".7"/>
      <path d="M0 216Q80 192 150 212T300 206V300H0Z" fill="#dce8f1"/>
      ${pine(20, 214, 1.1)}${pine(46, 220, .8, '#264c3f')}${pine(262, 212, 1.2)}${pine(238, 220, .8, '#264c3f')}${pine(284, 222, .9, '#264c3f')}
      <g><rect x="206" y="190" width="42" height="32" fill="#6b4a3a"/><path d="M200 192L227 168L254 192Z" fill="#2c3e55"/><path d="M203 192L227 171L251 192L246 192L227 176L208 192Z" fill="#fff"/><rect x="238" y="168" width="7" height="14" fill="#4a3426"/><rect x="236" y="164" width="11" height="5" fill="#fff"/>
        <circle class="nw-wg" cx="224" cy="205" r="22" fill="url(#${u}l)"/><rect x="217" y="198" width="14" height="14" fill="#ffd58a"/><path d="M224 198V212M217 205H231" stroke="#6b4a3a" stroke-width="1.4"/>
        <path class="nw-smoke" d="M241 160q-6 -8 0 -15t-2 -14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>
      <path d="M0 232Q90 216 160 228T300 222V300H0Z" fill="#f6f9fc"/><path d="M0 252Q110 240 200 250T300 246V300H0Z" fill="#d3e2ee"/>
      <g><rect x="117" y="168" width="3" height="58" fill="#2a3a4e"/><circle class="nw-lg" cx="118.5" cy="166" r="42" fill="url(#${u}l)"/><rect x="113" y="160" width="11" height="12" rx="2" fill="#ffd58a"/><path d="M111 160L118.5 153L126 160Z" fill="#2a3a4e"/></g>
      <g><path d="M138 226V198" stroke="#27364b" stroke-width="9" stroke-linecap="round"/><path d="M128 200Q138 182 148 200L150 226H126Z" fill="#2b3d55"/><circle cx="138" cy="176" r="8" fill="#e6b896"/><path d="M130 175Q138 160 146 175Q138 170 130 175Z" fill="#b5453f"/><circle cx="138" cy="158" r="3" fill="#f6f9fc"/><path d="M131 186H145V190H131Z" fill="#b5453f"/></g>
      <g><path d="M166 226V206" stroke="#a63f3a" stroke-width="8" stroke-linecap="round"/><path d="M155 207Q165 184 177 207L181 228H152Z" fill="#b5453f"/><circle cx="166" cy="178" r="8" fill="#eab998"/><path d="M157 178Q166 160 175 178Z" fill="#f6f0dc"/><circle cx="166" cy="162" r="3.2" fill="#f6f0dc"/><path d="M158 190H174V194H158Z" fill="#f6f0dc"/></g>
      <path d="M146 200Q152 206 158 202" stroke="#e6b896" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M0 270Q150 258 300 268V300H0Z" fill="#fff" opacity=".9"/>
    </svg>`;
  };
  const MUG = '<svg class="nw-mug" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path class="st" d="M20 18q-5 -6 0 -11M32 18q-5 -6 0 -11M44 18q-5 -6 0 -11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".7"/><path d="M12 24H48V44a12 12 0 0 1-12 12H24A12 12 0 0 1 12 44Z" fill="#b5453f"/><path d="M48 28H52a7 7 0 0 1 0 14H47" fill="none" stroke="#b5453f" stroke-width="4"/><path d="M12 33H48V37H12Z" fill="#f4f7fa"/><path d="M12 33H48" stroke="#9fc1d9" stroke-width="1.4" stroke-dasharray="3 3"/></svg>';
  const PINE_I = '<svg viewBox="0 0 24 28" width="1em" height="1.15em" aria-hidden="true"><path d="M12 1L19 11H15L21 19H15L23 26H1L9 19H3L9 11H5Z" fill="currentColor"/></svg>';
  const candle = (cls = '') => `<span class="nw-candle ${cls}" aria-hidden="true"><i class="fl"></i><i class="wx"></i></span>`;

  // ---------- falling snow helper ----------
  const flake = (g, p, a = 1) => { g.globalAlpha = p.a * a; g.fillStyle = '#e8f2fa'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill(); if (p.r > 1.8) { g.globalAlpha = p.a * a * .3; g.strokeStyle = '#6d93b5'; g.lineWidth = .6; g.stroke(); } g.globalAlpha = 1; };
  const rainSnow = (M, cv, count, o = {}) => M.particles(cv, {
    count,
    init(p, i, w, h) { p.x = Math.random() * w; p.y = Math.random() * h; p.r = .8 + Math.random() * (o.big || 2.1); p.vy = .018 + p.r * .012; p.ph = Math.random() * 6.3; p.a = .45 + Math.random() * .5; },
    step(p, dt, w, h) { p.y += p.vy * dt * (o.speed || 1); p.x += Math.sin((p.life + p.ph * 700) / 900) * .22 + (o.wind ? wind * .5 : 0); if (p.x < -6) p.x = w + 6; if (p.x > w + 6) p.x = -6; return p.y < h + 6; },
    draw: flake
  });
  const frostPaint = cv => {
    const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    g.fillStyle = 'rgba(206,224,238,.9)'; g.fillRect(0, 0, w, h);
    const r = g.createRadialGradient(w / 2, h / 2, w * .1, w / 2, h / 2, w * .62); r.addColorStop(0, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(160,190,214,.35)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.lineCap = 'round';
    for (let i = 0; i < 46; i++) { // little ice crystals
      const x = Math.random() * w, y = Math.random() * h, s = 4 + Math.random() * 10;
      g.beginPath(); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; g.moveTo(x - Math.cos(a) * s, y - Math.sin(a) * s); g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); } g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 6, 0, 6.3); g.fill(); }
  };

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    patch(c);
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="nw-cover">
      <div class="nw-sky"></div><canvas class="nw-out" aria-hidden="true"></canvas>
      <header class="nw-top"><p class="nw-eb">Mùa đông đầu tiên</p><p class="nw-guest">Gửi <b>${e(c.guest)}</b></p></header>
      <div class="nw-gw">
        <div class="nw-globe" role="img" aria-label="Quả cầu tuyết có ${e(D.bride.short || D.bride.name)} và ${e(D.groom.short || D.groom.name)}">
          ${scene()}<canvas class="nw-gs"></canvas>
          <div class="nw-gnames"><span>${nb(e(D.bride.name))}</span><span><i>&amp;</i> ${nb(e(D.groom.name))}</span></div>
          <canvas class="nw-fog"></canvas><p class="nw-fogtxt">Lau lớp sương trên kính</p><i class="nw-shine"></i>
        </div>
        <div class="nw-base"><div class="nw-plaque"><b>${nb(e(D.bride.name))} &amp; ${nb(e(D.groom.name))}</b><span>${c.dateText}</span></div></div>
      </div>
      <span class="nw-cpine l" aria-hidden="true">${PINE_I}</span><span class="nw-cpine r" aria-hidden="true">${PINE_I}</span><span class="nw-knit nw-cknit" aria-hidden="true"></span>
      <div class="nw-foot">
        <p class="nw-hint">Lắc điện thoại hoặc vuốt quanh quả cầu</p>
        <button class="open-btn" type="button">Lắc quả cầu</button>
      </div>
    </div>`;
    const root = el.querySelector('.nw-cover'), globe = el.querySelector('.nw-globe'), fog = el.querySelector('.nw-fog'), btn = el.querySelector('.open-btn');
    const st = { storm: 0, lift: 0 };
    let energy = 0, started = false, askedPerm = false;
    const sizeAll = () => { const r = globe.getBoundingClientRect(); root.style.setProperty('--gdz', (Math.max(innerWidth, innerHeight) * 1.25 / r.width).toFixed(2)); };
    sizeAll(); addEventListener('resize', sizeAll);
    frostPaint(fog);

    // snow inside the globe: flakes lie on the ground until shaken up, then swirl and settle
    const gs = M.particles(el.querySelector('.nw-gs'), {
      count: 260,
      init(p, i, w, h) { p.amb = i % 6 === 0; p.r = 1.1 + Math.random() * 2.1; p.air = p.amb; p.x = Math.random() * w; p.y = p.amb ? Math.random() * h : h * .78 + Math.random() * h * .08; p.vx = 0; p.vy = 0; p.a = .6 + Math.random() * .4; p.ph = Math.random() * 6; },
      step(p, dt, w, h) {
        const floor = h * .79 + Math.sin(p.x * .03) * 3 + (p.ph % 1) * h * .07;
        if (!p.air) { if (st.lift > 0 && Math.random() < st.lift * .2) { p.air = true; p.vx = (Math.random() - .5) * .25; p.vy = -(.08 + Math.random() * .3); } return true; }
        const dx = p.x - w / 2, dy = p.y - h / 2, k = Math.pow(.985, dt / 16), s = st.storm;
        p.vx += (-dy / w * .0009 * s + (Math.random() - .5) * .005 * s) * dt;
        p.vy += (dx / w * .0009 * s + (Math.random() - .5) * .005 * s + .00006) * dt;
        p.vx *= k; p.vy *= k;
        p.x += p.vx * dt + (p.amb ? Math.sin((p.life + p.ph * 600) / 800) * .15 : 0); p.y += p.vy * dt;
        const rr = Math.hypot(p.x - w / 2, p.y - h / 2), R = w / 2 - 3;
        if (rr > R) { p.x = w / 2 + (p.x - w / 2) * R / rr; p.y = h / 2 + (p.y - h / 2) * R / rr; p.vx *= -.4; p.vy *= -.4; }
        if (p.y >= floor) { if (p.amb) { p.y = -4; p.x = Math.random() * w; p.vy = 0; } else { p.air = false; p.y = floor; p.vx = p.vy = 0; } }
        return true;
      },
      draw: flake
    });
    const decay = M.loop((t, dt) => { st.storm *= Math.exp(-dt / 1500); st.lift *= Math.exp(-dt / 450); if (!started) fog.style.opacity = (1 - clamp(energy) * .92).toFixed(3); });
    const out = rainSnow(M, el.querySelector('.nw-out'), 46, { speed: .8, big: 1.6 });
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    const rock = () => { globe.classList.remove('rock'); void globe.offsetWidth; globe.classList.add('rock'); };
    const kick = (amt, big) => {
      if (started) return;
      st.storm = Math.min(1.5, st.storm + amt * 2.2); st.lift = 1;
      energy += amt; if (big) rock();
      if (energy >= 1) go();
    };
    const go = () => {
      if (started) return; started = true; energy = 1;
      btn.disabled = true; EA.music(); M.requestTilt();
      root.classList.add('is-opening'); fog.style.transition = 'opacity 1.2s'; fog.style.opacity = '0'; st.storm = 1.5; st.lift = 1.2; rock(); M.haptic('crack'); M.tone('whoosh');
      c.after(1700, () => { root.classList.add('settled'); M.tone('chime'); M.haptic('success'); });
      c.after(3300, () => { root.classList.add('dive'); M.tone('whoosh'); });
      c.after(4100, () => { offTilt(); open(); c.after(1200, () => { gs.stop(); out.stop(); decay(); removeEventListener('resize', sizeAll); }); });
    };

    // swipe / drag swirls the snow and wipes the frost away at the same time
    let lx = 0, ly = 0, dn = false;
    M.wipe(fog, { radius: 30, done: .5, onProgress: p => { energy = Math.max(energy, Math.min(.98, p * 1.8)); if (p >= .5 && !started) go(); } });
    fog.addEventListener('pointerdown', ev => { dn = true; lx = ev.clientX; ly = ev.clientY; if (!askedPerm) { askedPerm = true; M.requestTilt(); } M.haptic('tap'); });
    fog.addEventListener('pointermove', ev => { if (!dn) return; const v = Math.hypot(ev.clientX - lx, ev.clientY - ly); lx = ev.clientX; ly = ev.clientY; if (v > 2) kick(Math.min(.07, v / 500), false); });
    ['pointerup', 'pointercancel'].forEach(n => fog.addEventListener(n, ev => { if (dn && Math.hypot(ev.clientX - lx, ev.clientY - ly) < 4) { M.tone('click'); kick(.18, true); } dn = false; }));
    const offShake = M.shake(() => { kick(.4, true); M.haptic('tap'); M.tone('click'); });
    btn.addEventListener('click', () => { M.tone('click'); rock(); go(); });
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="nw-hd"><p class="nw-eb"><span class="nw-pi" aria-hidden="true">${PINE_I}</span>${mc.eyebrow != null && mc.eyebrow !== '' ? esc(mc.eyebrow) : eb}<span class="nw-pi" aria-hidden="true">${PINE_I}</span></p><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${sub ? `<p class="nw-sub">${sub}</p>` : ''}<span class="nw-knit" aria-hidden="true"></span></header>`;
  };

  S('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, url = realPhoto(c);
    return `<div class="nw-hero">
      <canvas class="nw-hsnow" aria-hidden="true"></canvas><div class="nw-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
      <p class="nw-eb nw-breath">${e(mc.eyebrow || 'Mùa đông đầu tiên')}</p>
      <div class="nw-hg">
        <div class="nw-globe big">${scene()}${url ? `<img src="${e(url)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}<i class="nw-shine"></i></div>
        <button class="nw-moonbtn" type="button" aria-label="Mặt trăng"></button>
        <div class="nw-base"><div class="nw-plaque"><b>${c.d} . ${c.m} . ${c.y}</b></div></div>
        ${candle('l')}${candle('r')}
      </div>
      <h1 class="nw-names nw-breath"><span>${nb(e(D.bride.name))}</span><i>&amp;</i><span>${nb(e(D.groom.name))}</span></h1>
      ${cp.headline ? `<p class="nw-headline">${c.t(cp.headline)}</p>` : ''}
      <p class="nw-datetag"><span>${c.dow}</span>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>
      ${cp.lunarDate ? `<p class="nw-lunar">${e(cp.lunarDate)}</p>` : ''}
      ${mc.showCountdown !== false ? ui.countdown() : ''}
      <p class="nw-auroranote" aria-live="polite"></p>
    </div>`;
  });

  const musicBox = (title, artist, lyric) => `<div class="nw-mbox"><svg viewBox="0 0 160 110" aria-hidden="true" focusable="false"><rect x="14" y="48" width="132" height="52" rx="6" fill="#6b4a3a"/><rect x="14" y="48" width="132" height="10" rx="4" fill="#8a6350"/><path d="M14 48L26 22H134L146 48Z" fill="#7b5642"/><rect x="34" y="62" width="92" height="22" rx="3" fill="#2f2118"/><g class="nw-key"><circle cx="80" cy="30" r="9" fill="#d7b46a"/><rect x="77" y="12" width="6" height="12" fill="#d7b46a"/></g><circle cx="80" cy="73" r="6" fill="#d7b46a"/></svg>
    <p class="nw-mt"><b>${esc(title)}</b>${artist ? `<span>${esc(artist)}</span>` : ''}</p>${lyric ? `<p class="nw-lyric">“${esc(lyric)}”</p>` : ''}</div>`;

  S('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content, days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <div class="nw-letter"><span class="nw-knit top" aria-hidden="true"></span><i class="nw-frost tl"></i><i class="nw-frost br"></i>
        <p class="nw-date2">${c.dateText}</p>
        <p class="nw-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        ${D.letter.slice(0, 2).map(x => `<p>${t(x)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="nw-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(x => `<p>${t(x)}</p>`).join('')}
        <p class="nw-sign">Thân mến,<b>${nb(e(D.bride.name))} và ${nb(e(D.groom.name))}</b></p>
      </div>
      ${days != null && days > 0 ? `<div class="nw-days" data-days="${days}">
        <svg viewBox="0 0 320 70" aria-hidden="true"><path class="fp" pathLength="1" d="M16 50C70 6 110 74 160 34S250 6 304 40"/><circle cx="16" cy="50" r="6"/><circle cx="304" cy="40" r="6"/></svg>
        <p class="nw-count"><span class="n">${String(days).replace(/\d/g, '0')}</span><span class="u">ngày bên nhau</span></p>
        <p class="nw-since">Những dấu chân đầu tiên in trên tuyết từ ngày ${dmy(met)}${place ? ` · ${e(place)}` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  S('families', c => {
    const { data: D, esc: e, mod } = c, homes = c.p.get('hometowns', {});
    const fam = (label, f, home) => `<article class="nw-fam"><span class="nw-knit top" aria-hidden="true"></span><p class="nw-tab">${label}</p>
      <p><span class="r">Ông</span> ${e(f.father)}</p><p><span class="r">Bà</span> ${e(f.mother)}</p>${f.address ? `<p class="ad">${e(f.address)}</p>` : ''}${home ? `<p class="nw-home">Quê ${e(home)}</p>` : ''}</article>`;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="nw-fams">${fam('Nhà gái', D.brideFamily, homes.bride)}${fam('Nhà trai', D.groomFamily, homes.groom)}</div>
      <p class="nw-couple2"><span>${nb(e(D.bride.name))}</span><i>&amp;</i><span>${nb(e(D.groom.name))}</span></p>
      ${D.announceNote ? `<p class="nw-note">${e(D.announceNote)}</p>` : ''}
    </div>`;
  });

  // first winter: a frosted window; wipe it (or press the button) to read what is behind the glass
  const firstWinter = c => {
    const fw = c.p.get('firstWinter', null), met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    if (fw && (fw.text || fw.place)) return { label: fw.date ? dmy(fw.date) : 'Mùa đông đầu tiên', title: fw.place || 'Mùa đông đầu tiên', text: fw.text || '' };
    if (!met) return null;
    const [y, m] = met.split('-').map(Number), sy = m <= 2 ? y - 1 : y;
    return { label: `Đông ${sy}–${sy + 1}`, title: 'Mùa đông đầu tiên', text: `Từ ngày ${dmy(met)}${place ? ` ở ${place}` : ''}, hai đứa cùng đi qua mùa đông đầu tiên. Trời lạnh hơn một chút, ly nước nóng ngon hơn một chút, và bàn tay thì chẳng muốn buông.` };
  };
  S('story', c => {
    const { esc: e, mod } = c, s = mod.content, pr = c.p, fw = firstWinter(c);
    return `<div class="wrap">
      ${head(c, 'Mùa đông đầu tiên', 'Chuyện của chúng mình')}
      ${fw ? `<div class="nw-win"><div class="nw-frame"><div class="nw-pane"><div class="nw-wtxt"><p class="nw-wlabel">${e(fw.label)}</p><h3>${e(fw.title)}</h3><p>${e(fw.text)}</p></div><canvas class="nw-frost-cv" aria-hidden="true"></canvas><p class="nw-wipehint">Hà hơi và lau lớp sương trên kính</p></div></div>
        <div class="nw-sill"><button class="btn ghost nw-clear" type="button">Lau sạch kính</button>${candle('w')}</div></div>` : ''}
      <ol class="nw-chap">${(s.chapters || []).map((ch, i) => `<li class="nw-ch"><span class="nw-dot" aria-hidden="true">${PINE_I}</span><div class="nw-chimg">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</div>
        <div class="nw-chtx"><p class="nw-wlabel">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${pr.has('proposal') ? `<div class="nw-prop"><p class="nw-eb">Lời cầu hôn</p><p>${e(pr.get('proposal'))}</p></div>` : ''}
      ${s.quote ? `<p class="nw-sq">${e(s.quote)}</p>` : ''}
    </div>`;
  });

  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  S('events', c => {
    const { data: D, esc: e, ui } = c;
    const dateOf = ev => { const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date; const [y, m, d] = iso.split('-'); return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`; };
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi')}
      <div class="nw-evs">${D.events.map((ev, i) => `<article class="nw-ev"><i class="nw-frost tl"></i>${candle('c')}
        <p class="nw-time">${e(ev.time)}</p><h3>${e(ev.title)}</h3><p class="nw-evtag">${e(ev.label)}</p><p class="nw-evd">${dateOf(ev)}</p>
        ${ev.lunar ? `<p class="nw-evl">${e(ev.lunar)}</p>` : ''}<p class="nw-pl"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>${ui.actions(ev)}</article>`).join('')}</div>
    </div>`;
  });

  // schedule + hot-drink menu (chalkboard)
  S('schedule', c => {
    const { data: D, esc: e } = c, pr = c.p;
    const sides = ['bride', 'groom'].filter(k => pr.has(`traits.${k}.drink`));
    const nm = k => (k === 'bride' ? D.bride : D.groom);
    return `<div class="wrap narrow">
      ${head(c, 'Lịch trình ngày vui', 'Một ngày thật vui')}
      <ol class="nw-tl">${D.itinerary.map(it => `<li><time>${e(it.time)}</time><div><strong>${e(it.title)}</strong><span>${e(it.note)}</span></div></li>`).join('')}</ol>
      ${sides.length ? `<div class="nw-menu"><span class="nw-knit top" aria-hidden="true"></span><p class="nw-eb">Quầy đồ uống nóng</p><h3>Thực đơn của hai đứa</h3>
        <div class="nw-items">${sides.map(k => `<div class="nw-item">${MUG}<p class="nw-who">${e(pr.get(`traits.${k}.nickname`) || nm(k).short || nm(k).name)}</p><p class="nw-dr">${e(pr.get(`traits.${k}.drink`))}</p>${pr.has(`traits.${k}.hobby`) ? `<p class="nw-hb">Vừa uống vừa ${e(String(pr.get(`traits.${k}.hobby`)).charAt(0).toLowerCase() + String(pr.get(`traits.${k}.hobby`)).slice(1))}</p>` : ''}</div>`).join('')}</div>
        <p class="nw-menu-f">Mời bạn một ly cho ấm lòng trước khi vào tiệc</p></div>` : ''}
    </div>`;
  });

  S('gallery', c => `<div class="wrap">
    ${head(c, 'Khung cửa sổ của hai đứa', 'Khoảnh khắc của chúng mình')}
    <div class="nw-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  S('quote', c => {
    const { data: D, esc: e, mod } = c, pr = c.p;
    const q = pr.get('quote', null), qt = q?.text || D.quote, qa = q?.author || '';
    const letters = ['bride', 'groom'].filter(k => pr.has(`letters.${k}`));
    const nm = k => (k === 'bride' ? D.bride : D.groom);
    return `<div class="wrap narrow">
      <p class="nw-eb"><span class="nw-pi">${PINE_I}</span>${e(mod.content.eyebrow || 'Lời nhắn')}<span class="nw-pi">${PINE_I}</span></p>
      ${qt ? `<blockquote class="nw-q">${e(qt)}${qa ? `<cite>${e(qa)}</cite>` : ''}</blockquote>` : ''}
      ${pr.has('song.title') ? `<div class="nw-song"><p class="nw-eb">Hộp nhạc mùa đông</p>${musicBox(pr.get('song.title'), pr.get('song.artist', ''), pr.get('song.lyric', ''))}</div>` : ''}
      ${letters.length ? `<div class="nw-letters"><p class="nw-eb">Thư gấp trong túi áo ấm</p>${letters.map((k, i) => `<article class="nw-lt"><span class="nw-knit top" aria-hidden="true"></span><p>${e(pr.get(`letters.${k}`))}</p><p class="nw-from">${e(nm(k).short || nm(k).name)}${pr.has(`traits.${k}.nickname`) ? ` (${e(pr.get(`traits.${k}.nickname`))})` : ''}</p></article>`).join('')}</div>` : ''}
      ${pr.has('pet.name') ? `<div class="nw-pet"><p class="nw-eb">Người bạn nhỏ giữ ấm</p><p>${e(pr.get('pet.name'))}${pr.has('pet.kind') ? `, ${e(pr.get('pet.kind'))} nhà mình` : ''}, đứa nằm trên chiếc chăn len ấm nhất mỗi tối đông.</p></div>` : ''}
      ${pr.has('insideJoke') ? `<p class="nw-joke"><span>Chuyện chỉ hai đứa hiểu</span>${e(pr.get('insideJoke'))}</p>` : ''}
    </div>`;
  });

  S('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Xác nhận tham dự', 'Bạn sẽ đến chứ?', 'Một ly nóng đã được pha sẵn cho bạn')}
    <div class="nw-rsvp"><span class="nw-knit top" aria-hidden="true"></span>${c.ui.rsvpForm()}</div></div>`);

  S('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="nw-end">
      <p class="nw-eb"><span class="nw-pi">${PINE_I}</span>${e(mod.content.eyebrow || 'Lời cảm ơn')}<span class="nw-pi">${PINE_I}</span></p>
      <div class="nw-candles" aria-hidden="true">${candle('')}${candle('tall')}${candle('')}</div>
      <p class="nw-bye">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="nw-thx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="nw-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="nw-datetag"><span>${c.dow}</span><b>${c.dateText}</b></p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Lắc lại quả cầu ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
    </div>`;
  });

  // ======================= behaviours =======================
  EA.afterRender((c, main) => {
    const M = c.motion;
    // gentle snowfall over the whole page; scrolling gives the flakes a little wind
    if (!snowfall && !c.reduced) {
      const cv = document.createElement('canvas'); cv.className = 'nw-fall'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
      snowfall = rainSnow(M, cv, 44, { wind: true, big: 1.6 });
      let ly = scrollY; addEventListener('scroll', () => { wind = clamp((scrollY - ly) * .12, -3, 3); ly = scrollY; }, { passive: true });
      setInterval(() => { wind *= .8; }, 120);
    }
    const hs = main.querySelector('.nw-hsnow');
    if (hs) rainSnow(M, hs, 60, { speed: .7, big: 2.2 });

    // easter egg: tap the moon three times for the northern lights
    const moon = main.querySelector('.nw-moonbtn'), hero = main.querySelector('.nw-hero'), an = main.querySelector('.nw-auroranote');
    if (moon) {
      let taps = 0, tm = 0;
      moon.addEventListener('click', () => {
        taps++; clearTimeout(tm); tm = setTimeout(() => { taps = 0; }, 1200); M.tone('click');
        if (taps >= 3) { taps = 0; hero.classList.add('aurora'); an.textContent = 'Cực quang chỉ hiện ra với ai chịu ngắm trăng cùng người mình thương.'; M.haptic('success'); M.tone('chime'); c.after(9000, () => { hero.classList.remove('aurora'); an.textContent = ''; }); }
      });
    }

    // footprints + counter
    const days = main.querySelector('.nw-days');
    if (days) M.inView(days, () => { days.classList.add('on'); const n = days.querySelector('.n'), to = +days.dataset.days, pad = String(to).length; M.tween(0, to, 2200, 'out', v => { n.textContent = String(Math.round(v)).padStart(pad, '0'); }); }, { threshold: .45 });

    // the frosted window of the first winter
    const win = main.querySelector('.nw-win');
    if (win) {
      const cv = win.querySelector('.nw-frost-cv'), pane = win.querySelector('.nw-pane');
      let w = null;
      const arm = () => { if (w) return; frostPaint(cv); w = M.wipe(cv, { radius: 26, done: .55, onProgress: p => { pane.classList.toggle('fade', p > .3); if (p >= .55) { pane.classList.add('clear'); M.haptic('success'); M.tone('chime'); } } }); };
      M.inView(win, arm, { threshold: .1 });
      win.querySelector('.nw-clear').addEventListener('click', () => { arm(); w.reveal(); pane.classList.add('clear'); M.tone('pop'); });
    }
    const mb = main.querySelector('.nw-mbox');
    if (mb) M.inView(mb, () => mb.classList.add('on'), { threshold: .5 });
    const menu = main.querySelector('.nw-menu');
    if (menu) M.inView(menu, () => menu.classList.add('on'), { threshold: .3 });
    const end = main.querySelector('.nw-end');
    if (end) M.inView(end, () => end.classList.add('on'), { threshold: .5 });
  });

  // finale after RSVP: a snow squall, then the name appears as if breathed on the glass, with a hot drink
  EA.onRsvp((entry, c) => {
    const M = EA.motion, yes = !entry || entry.attending !== false, name = String(entry?.name || '').trim();
    const o = document.createElement('div'); o.className = 'nw-fin'; o.setAttribute('role', 'status');
    o.innerHTML = `<div class="nw-fin-bg"></div><canvas aria-hidden="true"></canvas><div class="nw-fin-c">${MUG}<p class="nw-fin-n">${esc(name || 'Quý khách')}</p><p class="nw-fin-t">${yes ? 'Hẹn gặp bạn dưới tuyết. Ly nóng đã pha sẵn rồi.' : 'Chúng mình giữ ấm một chỗ cho bạn.'}</p></div>`;
    document.body.appendChild(o);
    const sq = M.particles(o.querySelector('canvas'), { count: 0, init(p) { p.dead = true; }, step(p, dt, w, h) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .995; return p.y < h + 10 && p.life < 6000; }, draw(g, p) { flake(g, p); } });
    const mk = (n, fromTop) => sq.burst(n, p => { p.r = 1 + Math.random() * 2.6; p.a = .6 + Math.random() * .4; p.x = Math.random() * sq.w; p.y = fromTop ? -10 : Math.random() * sq.h * .5; p.vx = (Math.random() - .3) * .25; p.vy = .06 + Math.random() * .16; });
    requestAnimationFrame(() => o.classList.add('on'));
    mk(80, false); setTimeout(() => mk(60, true), 500); setTimeout(() => mk(50, true), 1200);
    M.haptic('success'); M.tone('chime'); setTimeout(() => M.tone('pop'), 700);
    const close = () => { o.classList.remove('on'); setTimeout(() => { sq.stop(); o.remove(); }, 700); };
    o.addEventListener('click', close); setTimeout(close, 7000);
  });
})();
