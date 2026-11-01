// Super 8 Love Reel: a 1970s family home movie, projected on the living-room wall.
// Cover: two film strips (one childhood each) run through the projector; drag them together and they merge into one frame where the two met.
// All artwork is CSS / inline SVG. No external images besides the couple's own photos in config.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const nb = s => String(s).replace(/ /g, ' ');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const realPhoto = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? '' : h; };
  const dmy = iso => String(iso || '').split('-').reverse().join('.');
  const lower = s => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);

  // Vietnamese eyebrows for core headers that would otherwise show their English defaults
  const EB = { 'Love story': 'Cuộn phim kể chuyện', 'Save the date': 'Ghi nhớ ngày vui', 'Wedding itinerary': 'Lịch trình ngày vui', 'Wedding party': 'Những người đồng hành', 'Wedding film': 'Thước phim cưới', 'A glimpse of us': 'Lát cắt của hai đứa', 'Dress code &amp; notes': 'Trang phục &amp; lưu ý', 'Wedding guide': 'Cẩm nang cho khách', 'RSVP': 'Xác nhận tham dự', 'Gift registry': 'Gợi ý quà tặng', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ' };
  const patch = c => {
    if (c.ui.__s8) return; c.ui.__s8 = 1;
    const head = c.ui.head;
    c.ui.head = (eb, ti, su) => head(EB[eb] || eb, ti, su);
    document.documentElement.dataset.tier = c.motion.tier;
  };
  const S = (id, fn) => EA.section(id, c => (patch(c), fn(c)));

  // ---------- artwork: small flat scenes of two childhoods (no gradients, so ids never clash) ----------
  const PAL = {
    b: { sky: '#f2bf9f', low: '#e48d6c', gr: '#a35f3f', hair: '#2b1a14', skin: '#eab998', cl: '#b3402c', cl2: '#f6e6c4' },
    g: { sky: '#b3d0bf', low: '#6f9f8d', gr: '#4d7a5c', hair: '#2b1a14', skin: '#e3b08a', cl: '#2f5f7d', cl2: '#ecc65c' }
  };
  const INK = '#2b1a14';
  function scene(kind, who) {
    const P = PAL[who], girl = who === 'b';
    const base = `<rect width="120" height="90" fill="${P.sky}"/><rect y="34" width="120" height="56" fill="${P.low}" opacity=".5"/><circle cx="${kind % 2 ? 28 : 94}" cy="21" r="11" fill="#fbe7ae"/><path d="M0 64Q30 54 62 62T120 60V90H0Z" fill="${P.gr}"/>`;
    const face = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.skin}"/><circle cx="${x - r / 3}" cy="${y + 1}" r="1" fill="${INK}"/><circle cx="${x + r / 3}" cy="${y + 1}" r="1" fill="${INK}"/><path d="M${x - 2} ${y + r / 2.2}q2 2 4 0" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    const hair = (x, y, r) => `<path d="M${x - r} ${y}a${r} ${r} 0 0 1 ${2 * r} 0q-${r} -${r / 2.2} -${2 * r} 0Z" fill="${P.hair}"/>` + (girl ? `<circle cx="${x - r - 1}" cy="${y + 3}" r="2.6" fill="${P.hair}"/><circle cx="${x + r + 1}" cy="${y + 3}" r="2.6" fill="${P.hair}"/>` : '');
    let body = '';
    if (kind === 0) body = `<ellipse cx="60" cy="74" rx="37" ry="11" fill="${P.cl2}"/><path d="M26 74q34 -14 68 0" fill="none" stroke="${P.cl}" stroke-width="2" stroke-dasharray="4 4"/><ellipse cx="60" cy="64" rx="13" ry="9" fill="${P.cl}"/>${face(60, 49, 11)}${hair(60, 43, 10)}<line x1="79" y1="62" x2="87" y2="53" stroke="#8b5a2b" stroke-width="2"/><circle cx="88" cy="52" r="4.4" fill="#e0a52f"/>`;
    else if (kind === 1) body = `<rect x="30" y="64" width="4" height="11" fill="${P.cl2}"/><rect x="37" y="64" width="4" height="11" fill="${P.cl2}"/>${girl ? `<path d="M27 64L36 44L45 64Z" fill="${P.cl}"/>` : `<rect x="29" y="44" width="14" height="20" rx="2" fill="${P.cl}"/>`}${face(36, 37, 7.5)}${hair(36, 32, 7)}<path d="M42 48L50 41" stroke="${P.skin}" stroke-width="3" stroke-linecap="round"/><path d="M50 41L92 24" stroke="${INK}" stroke-width=".7"/><path d="M92 8L101 21L92 34L83 21Z" fill="#e0a52f"/><path d="M92 8V34M83 21H101" stroke="${INK}" stroke-width=".7"/><path d="M92 34q-7 7 1 12t-2 12" fill="none" stroke="${P.cl}" stroke-width="1.6"/>`;
    else if (kind === 2) body = `<g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"><circle cx="36" cy="68" r="11"/><circle cx="84" cy="68" r="11"/><path d="M36 68L56 52H78L84 68M56 52L62 68H36M78 52L76 44H84"/></g><path d="M60 46L58 55" stroke="${P.cl}" stroke-width="8" stroke-linecap="round"/><path d="M62 44L77 45" stroke="${P.skin}" stroke-width="3" stroke-linecap="round"/>${face(63, 35, 7.5)}${hair(63, 30, 7)}<path d="M58 56L62 66" stroke="${P.cl2}" stroke-width="4" stroke-linecap="round"/>`;
    else body = `<rect x="54" y="66" width="5" height="13" fill="#2a3550"/><rect x="61" y="66" width="5" height="13" fill="#2a3550"/><rect x="68" y="48" width="9" height="15" rx="2" fill="#e0a52f"/><rect x="50" y="46" width="20" height="21" rx="2" fill="#f6efe0"/><path d="M54 46H66L60 59Z" fill="#c4161c"/>${face(60, 37, 8)}${hair(60, 32, 7.6)}<path d="M50 50L45 60" stroke="${P.skin}" stroke-width="3" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${base}${body}</svg>`;
  }
  // the two of them, grown up, against a 70s striped sun
  const coupleArt = (vb = '0 0 400 300') => `<svg class="s8-art" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="#f3c98e"/>
    <g fill="#e8923a"><rect y="62" width="400" height="14" opacity=".55"/><rect y="92" width="400" height="18" opacity=".6"/><rect y="128" width="400" height="22" opacity=".7"/></g>
    <circle cx="200" cy="132" r="84" fill="#f8e3a8"/><g fill="#d6672f"><rect x="110" y="118" width="180" height="7"/><rect x="116" y="136" width="168" height="9"/><rect x="128" y="157" width="144" height="11"/></g>
    <path d="M0 200Q70 168 150 196T290 190T400 198V300H0Z" fill="#6d8d63"/><path d="M0 232Q110 206 210 230T400 224V300H0Z" fill="#4f6f4d"/>
    <g><circle cx="332" cy="150" r="30" fill="#4a6a45"/><circle cx="352" cy="170" r="24" fill="#587a50"/><rect x="330" y="170" width="7" height="60" fill="#5b3a26"/></g>
    <g class="s8-groom"><rect x="164" y="198" width="11" height="40" fill="#3a2a22"/><rect x="178" y="198" width="11" height="40" fill="#3a2a22"/><path d="M158 150Q158 138 176 136Q194 138 194 150L196 204H156Z" fill="#4a3329"/><path d="M170 136L176 160L182 136" fill="#f6efe0"/><path d="M175 140l2 0l1 14l-2 4l-2 -4z" fill="#b3402c"/><circle cx="176" cy="118" r="13" fill="#e2ad88"/><path d="M163 116Q165 102 177 103Q189 104 190 116Q184 108 176 108Q168 108 163 116Z" fill="#2b1a14"/><circle cx="171.5" cy="119" r="1.3" fill="#2b1a14"/><circle cx="180.5" cy="119" r="1.3" fill="#2b1a14"/><path d="M172 125q4 3 8 0" stroke="#2b1a14" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>
    <g class="s8-bride"><path d="M222 148Q222 136 238 136Q254 138 254 150L276 240H206Z" fill="#fbf1dc"/><path d="M238 148L228 240M238 148L252 240" stroke="#e5d3b0" stroke-width="1.4" fill="none"/><path d="M252 112Q282 150 274 236L268 236Q274 160 248 126Z" fill="#fff8ea" opacity=".6"/><circle cx="236" cy="120" r="12.5" fill="#eab998"/><path d="M223 118Q224 103 237 104Q250 106 249 118Q243 110 236 110Q229 110 223 118Z" fill="#2b1a14"/><circle cx="238" cy="104" r="6" fill="#2b1a14"/><circle cx="232" cy="122" r="1.2" fill="#2b1a14"/><circle cx="241" cy="122" r="1.2" fill="#2b1a14"/><path d="M233 127q4 3 8 0" stroke="#b3402c" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="213" cy="176" r="9" fill="#c9503a"/><circle cx="208" cy="172" r="5" fill="#e0a52f"/><circle cx="218" cy="173" r="5" fill="#f6efe0"/></g>
    <path d="M192 164Q202 174 214 170" stroke="#e2ad88" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M30 40q30 -16 62 0M310 52q22 -12 46 0" fill="none" stroke="#6a4a3a" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  // a projected frame: illustration underneath, the real photo (if any) on top; a failed photo just reveals the illustration
  const screenHTML = (c, cls = '') => {
    const url = realPhoto(c), D = c.data;
    return `<div class="s8-screen ${cls}">
      <div class="s8-pic">${coupleArt()}${url ? `<img src="${esc(url)}" alt="${esc(D.bride.name)} và ${esc(D.groom.name)}" fetchpriority="high">` : ''}</div>
      <i class="s8-vig"></i><i class="s8-leak a"></i><i class="s8-leak b"></i><i class="s8-grain"></i><i class="s8-scratch"></i>
    </div>`;
  };

  // vertical strip of frames with sprocket holes
  const frame = (inner, cap) => `<figure class="s8-fr"><div class="s8-fi">${inner}</div>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
  const REELS = ['Ngày bé', 'Quê nhà', 'Tuổi đi học', 'Lớn lên'];
  const roll = who => [0, 1, 2, 3, 0, 1, 2, 3].map(k => frame(scene(k, who))).join('');

  const projector = `<svg class="s8-projector" viewBox="0 0 260 120" aria-hidden="true" focusable="false">
    <g class="s8-reelspin a"><circle cx="78" cy="38" r="31" fill="#2a2018"/><circle cx="78" cy="38" r="25" fill="#c8b48d"/><g fill="#2a2018"><circle cx="78" cy="20" r="6"/><circle cx="96" cy="38" r="6"/><circle cx="78" cy="56" r="6"/><circle cx="60" cy="38" r="6"/></g><circle cx="78" cy="38" r="5" fill="#e8923a"/></g>
    <g class="s8-reelspin b"><circle cx="150" cy="38" r="31" fill="#2a2018"/><circle cx="150" cy="38" r="25" fill="#c8b48d"/><g fill="#2a2018"><circle cx="150" cy="20" r="6"/><circle cx="168" cy="38" r="6"/><circle cx="150" cy="56" r="6"/><circle cx="132" cy="38" r="6"/></g><circle cx="150" cy="38" r="5" fill="#e8923a"/></g>
    <path d="M100 66Q120 80 134 72" fill="none" stroke="#e8923a" stroke-width="2" opacity=".7"/>
    <rect x="34" y="62" width="192" height="40" rx="9" fill="#7b8a69"/><rect x="34" y="62" width="192" height="12" rx="6" fill="#92a07d"/><rect x="48" y="80" width="46" height="9" rx="3" fill="#3b3a2e"/><circle cx="116" cy="84" r="5" fill="#d6a02f"/><circle cx="132" cy="84" r="5" fill="#b3402c"/>
    <rect x="224" y="72" width="22" height="22" rx="4" fill="#3a3326"/><circle class="s8-lens" cx="250" cy="83" r="9" fill="#ffd58a"/>
    <rect x="52" y="102" width="8" height="14" fill="#3a3326"/><rect x="200" y="102" width="8" height="14" fill="#3a3326"/>
  </svg>`;

  const CHEV = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M9 8l-4 4 4 4M15 8l4 4-4 4"/></svg>';

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    patch(c);
    const M = c.motion, D = c.data, e = c.esc;
    const metPlace = c.p.get('metPlace', '');
    el.innerHTML = `<div class="s8-cover boot">
      <div class="s8-wall"></div><div class="s8-beam"></div>
      <canvas class="s8-dust" aria-hidden="true"></canvas>
      <header class="s8-title">
        <p class="s8-eb">Hai cuộn phim, một câu chuyện</p>
        <h1 class="s8-names"><span>${nb(e(D.bride.name))}</span><i>&amp;</i><span>${nb(e(D.groom.name))}</span></h1>
      </header>
      <div class="s8-stage">
        <div class="s8-reel l"><span class="s8-tape">${e(D.bride.short || D.bride.name)}</span><div class="s8-gate"><div class="s8-roll">${roll('b')}</div></div></div>
        <div class="s8-reel r"><span class="s8-tape">${e(D.groom.short || D.groom.name)}</span><div class="s8-gate"><div class="s8-roll rev">${roll('g')}</div></div></div>
        <div class="s8-meet">${screenHTML(c)}<p class="s8-hand">Và rồi hai đứa gặp nhau${metPlace ? ' ở ' + e(metPlace) : ''}…</p></div>
      </div>
      <div class="s8-proj">${projector}</div>
      <div class="s8-foot">
        <p class="s8-date"><span>${c.dow}</span><i></i><b>${c.dateText}</b></p>
        <p class="s8-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="s8-hint"><span class="s8-chev">${CHEV}</span>Kéo hai cuộn phim lại gần nhau</p>
        <button class="open-btn" type="button">Bật máy chiếu</button>
      </div>
      <i class="s8-leak a"></i><i class="s8-leak b"></i><i class="s8-grain"></i><i class="s8-scratch"></i><i class="s8-flash"></i>
    </div>`;
    const root = el.querySelector('.s8-cover'), stage = el.querySelector('.s8-stage'), openBtn = el.querySelector('.open-btn');
    let p = 0, started = false, lastTick = 0;
    const setP = v => { p = clamp(v); root.style.setProperty('--p', p.toFixed(3)); };
    const measure = () => {
      const l = root.querySelector('.s8-reel.l').getBoundingClientRect(), r = root.querySelector('.s8-reel.r').getBoundingClientRect();
      const meet = root.querySelector('.s8-meet');
      root.style.setProperty('--sx', (((r.left + r.width / 2) - (l.left + l.width / 2)) / 2).toFixed(1) + 'px');
      const sr = stage.getBoundingClientRect(), mw = sr.width, mh = mw * .75;
      root.style.setProperty('--mw', mw.toFixed(0) + 'px');
      root.style.setProperty('--zs', (Math.max(innerWidth / mw, innerHeight / mh) * 1.04).toFixed(2));
      root.style.setProperty('--zy', ((innerHeight / 2) - (sr.top + sr.height / 2)).toFixed(0) + 'px');
    };
    measure(); addEventListener('resize', measure);
    c.after(1700, () => root.classList.remove('boot'));

    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });
    // dust motes drifting through the beam
    const dust = M.particles(el.querySelector('.s8-dust'), {
      count: 46,
      init(q, i, w, h) { q.x = w * (.25 + Math.random() * .5); q.y = Math.random() * h; q.r = .6 + Math.random() * 1.6; q.vy = -(.006 + Math.random() * .016); q.vx = (Math.random() - .5) * .012; q.a = .2 + Math.random() * .5; q.ph = Math.random() * 6; },
      step(q, dt, w, h) { q.x += q.vx * dt + Math.sin((q.life + q.ph * 900) / 900) * .05; q.y += q.vy * dt; return q.y > -6; },
      draw(g, q) { g.globalAlpha = q.a; g.fillStyle = '#ffe3b0'; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.3); g.fill(); g.globalAlpha = 1; }
    });

    const tick = v => { if (v - lastTick > .14) { M.haptic('tap'); M.tone('click'); lastTick = v; } };
    const go = () => {
      if (started) return; started = true;
      openBtn.disabled = true; EA.music(); M.requestTilt();
      root.classList.add('is-opening'); M.haptic('crack'); M.tone('click');
      const rest = 1 - p;
      M.tween(p, 1, c.reduced ? 0 : 420 + rest * 1500, 'inOut', setP).then(() => {
        root.classList.add('burn', 'lit'); M.tone('whoosh'); M.haptic('thud');
        c.after(350, () => M.tone('chime'));
        c.after(1500, () => { root.classList.add('zoom'); M.haptic('tap'); });
        c.after(2250, () => { offTilt(); open(); c.after(1200, () => { dust.stop(); removeEventListener('resize', measure); }); });
      });
    };
    M.drag(stage, { axis: 'xy', distance: 150, onMove: v => { if (started) return; setP(v); tick(v); }, onEnd: v => { if (started) return; if (v >= .55) go(); else { lastTick = 0; M.tween(v, 0, 380, 'out', setP); } } });
    openBtn.addEventListener('click', go);
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="s8-hd"><p class="s8-eb">${mc.eyebrow != null && mc.eyebrow !== '' ? esc(mc.eyebrow) : eb}</p><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${sub ? `<p class="s8-sub">${sub}</p>` : ''}<span class="s8-perf" aria-hidden="true"></span></header>`;
  };

  // ---- hero: the living-room wall ----
  S('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    return `<div class="s8-hero">
      <p class="s8-eb">${e(mc.eyebrow || 'Phim gia đình · Ngày chung đôi')}</p>
      <div class="s8-wallbox">
        <div class="s8-beam2" aria-hidden="true"></div>
        <button class="s8-frameBtn" type="button" aria-label="Khung hình của ${e(D.bride.name)} và ${e(D.groom.name)}">${screenHTML(c, 'hero')}<span class="s8-rew" aria-hidden="true">TUA LẠI</span></button>
        <div class="s8-hproj" aria-hidden="true">${projector}</div>
        <p class="s8-rewnote" aria-live="polite"></p>
      </div>
      <h1 class="s8-names"><span>${nb(e(D.bride.name))}</span><i>&amp;</i><span>${nb(e(D.groom.name))}</span></h1>
      ${cp.headline ? `<p class="s8-headline">${c.t(cp.headline)}</p>` : ''}
      <p class="s8-datetag"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>
      ${cp.lunarDate ? `<p class="s8-lunar">${e(cp.lunarDate)}</p>` : ''}
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  // ---- invitation: a letter taped to the film can + the film counter + the cassette ----
  const cassette = (title, artist, lyric) => `<div class="s8-tape-card">
    <svg viewBox="0 0 220 138" aria-hidden="true" focusable="false"><rect x="2" y="2" width="216" height="134" rx="12" fill="#2a2018"/><rect x="14" y="12" width="192" height="76" rx="6" fill="#f2e6cc"/><rect x="14" y="12" width="192" height="20" fill="#b3402c"/><rect x="14" y="32" width="192" height="6" fill="#e8923a"/><rect x="58" y="94" width="104" height="34" rx="17" fill="#18110c"/><g class="s8-reelspin a"><circle cx="82" cy="111" r="12" fill="#c8b48d"/><path d="M82 100v22M71 111h22" stroke="#2a2018" stroke-width="3"/></g><g class="s8-reelspin b"><circle cx="138" cy="111" r="12" fill="#c8b48d"/><path d="M138 100v22M127 111h22" stroke="#2a2018" stroke-width="3"/></g></svg>
    <div class="s8-tape-txt"><b>${esc(title)}</b>${artist ? `<span>${esc(artist)}</span>` : ''}</div>
    ${lyric ? `<p class="s8-lyric">“${esc(lyric)}”</p>` : ''}</div>`;

  S('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content, days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <div class="s8-letter">
        <i class="s8-washi a"></i><i class="s8-washi b"></i>
        <p class="s8-date2">${c.dateText}</p>
        <p class="s8-hand2">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        ${D.letter.slice(0, 2).map(x => `<p>${t(x)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="s8-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(x => `<p>${t(x)}</p>`).join('')}
        <p class="s8-sign">Thân mến,<b>${nb(e(D.bride.name))} và ${nb(e(D.groom.name))}</b></p>
      </div>
      ${days != null && days > 0 ? `<div class="s8-counter" data-days="${days}">
        <p class="s8-eb">Độ dài cuộn phim</p>
        <div class="s8-odo" aria-label="${days} ngày bên nhau"><span class="n">${String(days).replace(/\d/g, '0')}</span></div>
        <p class="s8-hand2">ngày bên nhau${met ? `, tính từ ${dmy(met)}` : ''}${place ? ` · ${e(place)}` : ''}</p>
        <div class="s8-meter" aria-hidden="true"><i></i></div>
      </div>` : ''}
      ${c.p.has('song.title') ? `<div class="s8-song">${cassette(c.p.get('song.title'), c.p.get('song.artist', ''), c.p.get('song.lyric', ''))}<p class="s8-hand2">Bản nhạc đi kèm cuộn phim</p></div>` : ''}
    </div>`;
  });

  // ---- families: two film-can labels (+ hometowns) ----
  S('families', c => {
    const { data: D, esc: e, mod } = c;
    const homes = c.p.get('hometowns', {});
    const can = (label, f, home, cls) => `<article class="s8-can ${cls}"><i class="s8-washi a"></i><p class="s8-hand2">${label}</p>
      <p><span class="r">Ông</span> ${e(f.father)}</p><p><span class="r">Bà</span> ${e(f.mother)}</p>
      ${f.address ? `<p class="ad">${e(f.address)}</p>` : ''}${home ? `<p class="s8-home">Quê ${e(home)}</p>` : ''}</article>`;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="s8-cans">${can('Nhà gái', D.brideFamily, homes.bride, 'b')}${can('Nhà trai', D.groomFamily, homes.groom, 'g')}</div>
      <p class="s8-couple2"><span>${nb(e(D.bride.name))}</span><i>&amp;</i><span>${nb(e(D.groom.name))}</span></p>
      ${D.announceNote ? `<p class="s8-note">${e(D.announceNote)}</p>` : ''}
    </div>`;
  });

  // ---- story: two childhood reels converge, then the chapters as dated prints ----
  const reelFrames = (c, side) => {
    const arr = c.p.get(`childhood.${side}`, []);
    const who = side === 'bride' ? 'b' : 'g', tr = c.p.get(`traits.${side}`, {}), home = c.p.get(`hometowns.${side}`, '');
    if (Array.isArray(arr) && arr.length) return arr.slice(0, 5).map((f, i) => frame(`${scene(i % 4, who)}${f.photo ? `<img src="${esc(f.photo)}" alt="" loading="lazy">` : ''}`, [f.year, f.caption].filter(Boolean).join(' · ') || REELS[i % 4]));
    const caps = [tr.nickname ? `Bé “${tr.nickname}”` : REELS[0], home ? `Quê ${home}` : REELS[1], tr.hobby ? `Mê ${lower(tr.hobby)}` : REELS[2], REELS[3]];
    return caps.map((cap, i) => frame(scene(i, who), cap));
  };
  S('story', c => {
    const { esc: e, mod, data: D } = c;
    const s = mod.content, pr = c.p;
    const hasReels = pr.has('hometowns') || pr.has('traits.bride.nickname') || pr.has('traits.groom.nickname') || pr.has('traits.bride.hobby') || pr.has('traits.groom.hobby') || pr.has('childhood');
    const met = pr.get('metDate', ''), place = pr.get('metPlace', '');
    const vids = (pr.get('homeVideos', []) || []).filter(v => v && v.src);
    const reels = hasReels ? `<div class="s8-twin">
      <div class="s8-cols">
        <div class="s8-col l"><span class="s8-tape">${e(D.bride.short || D.bride.name)}</span><div class="s8-strip">${reelFrames(c, 'bride').join('')}</div></div>
        <div class="s8-col r"><span class="s8-tape">${e(D.groom.short || D.groom.name)}</span><div class="s8-strip">${reelFrames(c, 'groom').join('')}</div></div>
      </div>
      <svg class="s8-join" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true"><path class="bed" pathLength="1" d="M62 0C62 56 150 40 150 90M238 0C238 56 150 40 150 90"/><path class="sp" pathLength="1" d="M62 0C62 56 150 40 150 90M238 0C238 56 150 40 150 90"/></svg>
      <div class="s8-meetcard">${screenHTML(c, 'sm')}<p class="s8-hand2">${met ? `Ngày ${dmy(met)}, hai cuộn phim gặp nhau` : 'Hai cuộn phim gặp nhau'}${place ? `<br>${e(place)}` : ''}</p></div>
    </div>` : '';
    return `<div class="wrap">
      ${head(c, 'Cuộn phim kể chuyện', 'Chuyện của chúng mình')}
      ${reels}
      <ol class="s8-chapters">${(s.chapters || []).map((ch, i) => `<li class="s8-print">
        <div class="s8-photo">${coupleArt(['0 0 400 300', '110 70 230 172', '170 90 190 142', '0 120 260 195'][i % 4])}${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</div>
        <div class="s8-cap"><span class="s8-stamp">${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${pr.has('proposal') ? `<div class="s8-proposal"><p class="s8-eb">Cảnh quay đặc biệt</p><p class="s8-hand2">${e(pr.get('proposal'))}</p></div>` : ''}
      ${vids.length ? `<div class="s8-vids"><p class="s8-eb">Phim gia đình</p><div class="s8-vgrid">${vids.slice(0, 4).map(v => `<figure class="s8-vid"><video src="${e(v.src)}" ${v.poster ? `poster="${e(v.poster)}"` : ''} controls preload="none" playsinline></video><figcaption>${e([v.year, v.title].filter(Boolean).join(' · '))}</figcaption></figure>`).join('')}</div></div>` : ''}
      ${s.quote ? `<p class="s8-sq">${e(s.quote)}</p>` : ''}
    </div>`;
  });

  // ---- events: developed prints ----
  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  S('events', c => {
    const { data: D, esc: e, ui } = c;
    const dateOf = ev => { const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date; const [y, m, d] = iso.split('-'); return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`; };
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi')}
      <div class="s8-evs">${D.events.map((ev, i) => `<article class="s8-ev" style="--r:${(i % 2 ? 1 : -1) * (.6 + (i % 3) * .35)}deg">
        <i class="s8-washi a"></i>
        <p class="s8-stamp">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p class="s8-evtag">${e(ev.label)}</p>
        <p class="s8-evd">${dateOf(ev)}</p>
        ${ev.lunar ? `<p class="s8-evl">${e(ev.lunar)}</p>` : ''}
        <p class="s8-pl"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>
        ${ui.actions(ev)}</article>`).join('')}</div>
    </div>`;
  });

  S('gallery', c => `<div class="wrap">
    ${head(c, 'Lát cắt của hai đứa', 'Khoảnh khắc của chúng mình')}
    <div class="s8-slides">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div>
  </div>`);

  // ---- quote + letters + pet + inside joke ----
  S('quote', c => {
    const { data: D, esc: e, mod } = c, pr = c.p;
    const q = pr.get('quote', null), qt = q?.text || D.quote, qa = q?.author || '';
    const letters = ['bride', 'groom'].filter(k => pr.has(`letters.${k}`));
    const nm = k => (k === 'bride' ? D.bride : D.groom);
    return `<div class="wrap narrow">
      <p class="s8-eb">${e(mod.content.eyebrow || 'Lời nhắn')}</p>
      ${qt ? `<blockquote class="s8-q">${e(qt)}${qa ? `<cite>${e(qa)}</cite>` : ''}</blockquote>` : ''}
      ${letters.length ? `<div class="s8-letters"><p class="s8-eb">Thư tay dán vào hộp phim</p>${letters.map((k, i) => `<article class="s8-note${i ? ' r' : ''}"><i class="s8-washi a"></i><p class="s8-hand2">${e(pr.get(`letters.${k}`))}</p><p class="s8-from">${e(nm(k).short || nm(k).name)}${pr.has(`traits.${k}.nickname`) ? ` (${e(pr.get(`traits.${k}.nickname`))})` : ''}</p></article>`).join('')}</div>` : ''}
      ${pr.has('pet.name') ? `<div class="s8-pet"><p class="s8-eb">Diễn viên khách mời</p><p class="s8-hand2">${e(pr.get('pet.name'))}${pr.has('pet.kind') ? `, ${e(pr.get('pet.kind'))} nhà mình` : ''}, xuất hiện trong gần như mọi cuộn phim.</p></div>` : ''}
      ${pr.has('insideJoke') ? `<p class="s8-joke"><span>Chuyện chỉ hai đứa hiểu</span>${e(pr.get('insideJoke'))}</p>` : ''}
    </div>`;
  });

  S('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Xác nhận tham dự', 'Bạn sẽ đến chứ?', 'Phản hồi của bạn sẽ được dán nhãn lên một hộp phim mới')}
    <div class="s8-rsvp">${c.ui.rsvpForm()}</div>
  </div>`);

  S('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="s8-end">
      <p class="s8-eb">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
      <div class="s8-endscreen" aria-hidden="true"><i class="tail"></i><i class="light"></i></div>
      <p class="s8-hand2">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="s8-thx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="s8-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="s8-datetag"><span>${c.dow}</span><b>${c.dateText}</b></p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Chiếu lại từ đầu ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  EA.afterRender((c, main) => {
    const M = c.motion;
    // film counter rolls up like an odometer
    const cnt = main.querySelector('.s8-counter');
    if (cnt) M.inView(cnt, () => {
      cnt.classList.add('on');
      const n = cnt.querySelector('.n'), to = +cnt.dataset.days, pad = String(to).length;
      M.tween(0, to, 2200, 'out', v => { n.textContent = String(Math.round(v)).padStart(pad, '0'); });
    }, { threshold: .5 });

    // two childhood reels converge as they scroll into view
    const twin = main.querySelector('.s8-twin');
    if (twin) {
      M.scrollProgress(twin, v => {
        const m = clamp((v - .28) / .3);
        twin.style.setProperty('--m', m.toFixed(3));
        twin.classList.toggle('joined', m > .98);
      });
      M.inView(twin, () => twin.classList.add('on'), { threshold: .2 });
    }

    // easter egg: tap the projected frame three times to rewind the reel
    const fb = main.querySelector('.s8-frameBtn'), note = main.querySelector('.s8-rewnote');
    if (fb) {
      let taps = 0, timer = 0;
      fb.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1200);
        M.tone('click');
        if (taps >= 3) {
          taps = 0; fb.classList.add('rewind'); M.haptic('success'); M.tone('whoosh');
          const met = c.p.get('metDate', '');
          note.textContent = met ? `Tua lại… ngày ${dmy(met)}, ngày hai đứa lần đầu gặp nhau.` : 'Tua lại… về những ngày hai đứa còn bé.';
          note.classList.add('on');
          c.after(4200, () => { fb.classList.remove('rewind'); note.classList.remove('on'); });
        }
      });
    }

    // end of reel: the tail flaps and the lamp fades
    const end = main.querySelector('.s8-end');
    if (end) M.inView(end, () => { end.classList.add('on'); c.after(2600, () => end.classList.add('dark')); }, { threshold: .55 });
  });

  // finale after RSVP: the reply is canned and labelled; frames of film drift down
  EA.onRsvp((entry, c) => {
    const M = EA.motion, name = String(entry?.name || '').trim();
    const yes = !entry || entry.attending !== false;
    const o = document.createElement('div');
    o.className = 's8-fin';
    o.setAttribute('role', 'status');
    const frames = yes ? Array.from({ length: M.tier === 'low' ? 6 : 14 }, (_, i) => `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 1.6).toFixed(2)}s;--s:${(.7 + Math.random() * .8).toFixed(2)};--c:${i % 3}"></i>`).join('') : '';
    o.innerHTML = `<div class="s8-fin-bg"></div>${frames}
      <div class="s8-can-big"><svg viewBox="0 0 220 130" aria-hidden="true"><ellipse cx="110" cy="104" rx="98" ry="20" fill="#18110c"/><rect x="12" y="34" width="196" height="70" fill="#c8b48d"/><ellipse cx="110" cy="34" rx="98" ry="20" fill="#e3d2ad"/><ellipse cx="110" cy="34" rx="70" ry="13" fill="#c8b48d"/><rect x="12" y="62" width="196" height="26" fill="#b3402c"/><ellipse cx="110" cy="104" rx="98" ry="20" fill="none" stroke="#18110c" stroke-width="3"/></svg>
        <div class="lbl"><span>${yes ? 'Đã có mặt' : 'Hẹn dịp khác'}</span><b>${esc(name || 'Quý khách')}</b></div></div>
      <p class="s8-fin-t">${yes ? 'Cuộn phim của bạn đã được cất vào hộp.' : 'Chúng mình sẽ giữ một chỗ trong cuộn phim cho bạn.'}</p>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add('on'));
    M.haptic('success'); M.tone('chime'); setTimeout(() => M.tone('pop'), 600);
    const close = () => { o.classList.remove('on'); setTimeout(() => o.remove(), 700); };
    o.addEventListener('click', close);
    setTimeout(close, 6500);
  });
})();
