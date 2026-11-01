// Art Deco 1920s: a night at the gala.
// Cover: a stepped-arch gold gate (two bifold doors) in front of a turning sunburst. Drag the clasp apart (or tap "Mở cổng"):
//        the doors fold open in 3D, a champagne tower fills coupe by coupe, bubbles rise, gold glitter, the card opens.
// All artwork is CSS / inline SVG / canvas. Only the couple's own photo is an image.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/art_deco_couple_1790233250094.jpg';
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? PHOTO : h; };
  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const hash = s => { let h = 7; for (const ch of String(s).toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const fmtDate = iso => iso ? iso.split('-').reverse().join('.') : '';

  document.body.insertAdjacentHTML('beforeend', `<svg class="dc-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="dc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2a4"/><stop offset=".45" stop-color="#d1a751"/><stop offset="1" stop-color="#8b6a24"/></linearGradient>
    <clipPath id="dc-bowl" clipPathUnits="userSpaceOnUse"><path d="M-25 0H25Q25 23 0 26Q-25 23 -25 0Z"/></clipPath>
    <linearGradient id="dc-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe9b0"/><stop offset="1" stop-color="#d9a93f"/></linearGradient>
  </defs></svg>`);

  // ---------- art ----------
  const PANEL = `<svg viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="96" height="296" class="o"/><rect x="9" y="9" width="82" height="282" class="o i"/>
    <path d="M9 74 L50 112 L91 74 M9 98 L50 136 L91 98 M9 122 L50 160 L91 122" class="o"/>
    <path d="M50 9V112 M30 9V92 M70 9V92" class="o i"/>
    <path d="M9 250 Q50 200 91 250 M9 270 Q50 220 91 270 M9 291 Q50 241 91 291" class="o"/><circle cx="50" cy="200" r="5" class="d"/>
  </svg>`;
  const door = side => `<div class="dc-door ${side}"><div class="pa">${PANEL}<i class="sh"></i><div class="pb">${PANEL}<i class="sh"></i></div></div></div>`;
  const coupePath = 'M-25 0H25Q25 23 0 26Q-25 23 -25 0Z';
  const tower = () => {
    let s = '', streams = '';
    for (let r = 3; r >= 0; r--) for (let i = 0; i <= r; i++) {
      const x = 150 + (i - r / 2) * 60, y = 44 + r * 54, k = r * 4 + i;
      s += `<g class="cp" data-r="${r}" style="--d:${(r * .62 + i * .12).toFixed(2)}s" transform="translate(${x} ${y})">
        <g clip-path="url(#dc-bowl)"><rect class="liq" x="-25" y="1" width="50" height="26"/></g>
        <path class="gl" d="${coupePath}"/><ellipse class="rim" cx="0" cy="0" rx="25" ry="4"/><path class="gl" d="M0 26V42"/><ellipse class="gl" cx="0" cy="43" rx="13" ry="3"/>
        <path class="spk" d="M-9 8l3-3 3 3-3 3z"/></g>`;
      if (r < 3) streams += [-30, 30].map(dx => `<path class="str" style="--d:${(r * .62 + i * .12 + .45).toFixed(2)}s" pathLength="1" d="M${x + dx * .4} ${y + 22} Q${x + dx * .7} ${y + 34} ${x + dx} ${y + 52}"/>`).join('');
    }
    return `<svg class="dc-tower" viewBox="0 0 300 300" aria-hidden="true" focusable="false">${streams}${s}
      <path class="plinth" d="M70 270H230L222 258H78Z"/><path class="plinth" d="M50 288H250L240 270H60Z"/><path d="M60 270H240M78 258H222" class="pl"/></svg>`;
  };
  const DIV = `<svg class="dc-div" viewBox="0 0 240 24" aria-hidden="true"><path class="tr" pathLength="1" d="M0 12H96M144 12H240"/><path class="tr" pathLength="1" d="M120 2L132 12L120 22L108 12Z"/><path class="tr" pathLength="1" d="M100 12L106 6M100 12L106 18M140 12L134 6M140 12L134 18"/></svg>`;
  const box = (inner, cls = '') => `<div class="dc-box ${cls}"><i class="ln t"></i><i class="ln r"></i><i class="ln b"></i><i class="ln l"></i><i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i>${inner}</div>`;
  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="dc-hd"><span class="dc-eb">${mc.eyebrow != null && mc.eyebrow !== '' ? esc(mc.eyebrow) : eyebrow}</span>
      <h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${DIV}${sub ? `<p class="dc-sub">${sub}</p>` : ''}</header>`;
  };
  const names = (D, e) => `<span>${e(D.bride.name.replace(' ', ' '))}</span><i class="dia" aria-hidden="true"></i><span>${e(D.groom.name.replace(' ', ' '))}</span>`;

  // ---------- fx canvas (glitter / bubbles) ----------
  const fxCanvas = () => {
    let cv = document.querySelector('.dc-fx');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'dc-fx'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); }
    return cv;
  };
  const GOLD = ['#f6e2a4', '#d1a751', '#fff3c9', '#b98b35', '#ece7dc'];
  const makeFx = (M, cv) => M.particles(cv, {
    count: 0, init(p) { p.dead = true; },
    step(p, dt) {
      if (p.dead) return true;
      const k = Math.pow(.97, dt / 16);
      p.vx *= k; p.vy = (p.vy + p.g * dt) * k; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.s += p.vs * dt;
      return p.life < p.max && p.y < 4000;
    },
    draw(g, p) {
      if (p.dead) return;
      const a = clamp(1 - p.life / p.max) * (p.bub ? .85 : 1);
      g.save(); g.globalAlpha = a; g.translate(p.x, p.y);
      if (p.bub) { g.strokeStyle = p.c; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, p.w, 0, 6.283); g.stroke(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fill(); }
      else { g.rotate(p.r); g.scale(1, Math.cos(p.s)); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      g.restore();
    }
  });
  const glitter = (fx, ox, oy, n, spread = 1.7, spd = 1) => fx.burst(n, p => {
    const a = -Math.PI / 2 + (Math.random() - .5) * spread, v = (.35 + Math.random() * 1.0) * spd;
    p.x = ox; p.y = oy; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.g = .0011; p.w = 4 + Math.random() * 6; p.h = 6 + Math.random() * 8;
    p.r = Math.random() * 6; p.vr = (Math.random() - .5) * .014; p.s = Math.random() * 6; p.vs = .004 + Math.random() * .008;
    p.c = GOLD[(Math.random() * GOLD.length) | 0]; p.max = 3200 + Math.random() * 1800;
  });

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="dc-cover">
      <div class="dc-rays" aria-hidden="true"><i></i></div>
      <i class="dc-fr" aria-hidden="true"></i>
      <header class="dc-ch">
        <p class="dc-eyebrow">Dạ tiệc kính mời</p>
        <h1 class="dc-names">${names(D, e)}</h1>
      </header>
      <div class="dc-mid"><div class="dc-gate"><i class="dc-gold"></i>
        <div class="dc-inner"><div class="dc-scene"><div class="dc-glow"></div>${tower()}</div>
        <div class="dc-doors">${door('l')}${door('r')}</div></div>
        <button class="dc-clasp" type="button" aria-label="Kéo hai cánh cổng để mở"><svg viewBox="0 0 120 56" aria-hidden="true"><path class="dm" d="M60 4L84 28L60 52L36 28Z"/><path class="ar" d="M26 28H8M14 20L6 28L14 36M94 28H112M106 20L114 28L106 36"/></svg></button>
      </div></div>
      <footer class="dc-cf">
        <p class="dc-date">${c.dow} <i></i> <b>${c.dateText}</b></p>
        <p class="dc-guest">Kính gửi <b>${e(c.guest)}</b></p>
        <p class="dc-hint">Kéo hai cánh cổng để bước vào đêm tiệc</p>
        <button class="open-btn" type="button">Mở cổng</button>
      </footer>
      <canvas class="dc-cvfx" aria-hidden="true"></canvas>
    </div>`;
    const root = el.querySelector('.dc-cover'), gate = el.querySelector('.dc-gate'), clasp = el.querySelector('.dc-clasp');
    const openBtn = el.querySelector('.open-btn'), cvs = el.querySelector('.dc-cvfx');
    const rays = el.querySelector('.dc-rays i');
    let f = 0, started = false;
    const setF = v => { f = v; root.style.setProperty('--f', v.toFixed(4)); };
    setF(0);

    // sunburst keeps turning; it speeds up while the gala lights come on
    let rot = 0, speed = .006, wantSpeed = .006;
    const stopLoop = M.loop((t, dt) => { speed += (wantSpeed - speed) * Math.min(1, dt * .003); rot += speed * dt; rays.style.transform = `rotate(${rot.toFixed(2)}deg)`; }, { el: root });
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    // bubbles in the coupes + glitter
    const coupes = [];
    const fx = M.particles(cvs, {
      count: Math.round(M.scale(90)),
      init(p, i, w, h) { p.ok = coupes.length > 0; if (!p.ok) return; const q = coupes[(Math.random() * coupes.length) | 0]; p.x = q.x + (Math.random() - .5) * 30; p.y = q.y + 10; p.vy = -(.03 + Math.random() * .06); p.vx = 0; p.ph = Math.random() * 6; p.w = 1 + Math.random() * 2.6; p.max = 1100 + Math.random() * 1800; p.delay = Math.random() * 1600; p.top = q.y - 120 - Math.random() * 120; },
      step(p, dt) {
        if (p.dead) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; return p.life < p.max; }
        if (!p.ok) return !coupes.length;
        if (p.life < p.delay) return true;
        p.y += p.vy * dt; p.x += Math.sin((p.life + p.ph * 300) / 260) * .03 * dt;
        return p.life - p.delay < p.max && p.y > p.top;
      },
      draw(g, p) {
        if (p.dead) { if (p.life > p.max) return; g.save(); g.globalAlpha = clamp(1 - p.life / p.max); g.translate(p.x, p.y); g.rotate(p.r + p.life * .006); g.scale(1, Math.cos(p.life * .01 + p.s)); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); return; }
        if (!p.ok || p.life < p.delay) return;
        const a = clamp(1 - (p.life - p.delay) / p.max);
        g.save(); g.globalAlpha = a * .9; g.strokeStyle = '#fff3c9'; g.lineWidth = 1.1; g.beginPath(); g.arc(p.x, p.y, p.w, 0, 6.283); g.stroke(); g.fillStyle = 'rgba(255,243,201,.22)'; g.fill(); g.restore();
      }
    });
    const spark = (ox, oy, n) => fx.burst(n, p => {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = .3 + Math.random() * .9;
      p.dead = true; p.x = ox; p.y = oy; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.g = .0011; p.w = 4 + Math.random() * 5; p.h = 6 + Math.random() * 7;
      p.r = Math.random() * 6; p.s = Math.random() * 6; p.c = GOLD[(Math.random() * GOLD.length) | 0]; p.max = 2600 + Math.random() * 1600;
    });
    const locate = cp => { const a = cp.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left + a.width / 2 - b.left, y: a.top + a.height * .45 - b.top }; };

    const finish = () => {
      root.classList.add('is-lit');
      wantSpeed = .05;
      const cps = [...el.querySelectorAll('.cp')];
      cps.forEach(cp => c.after(parseFloat(cp.style.getPropertyValue('--d')) * 1000 + 450, () => { coupes.push(locate(cp)); if (+cp.dataset.r < 2) M.tone('pop'); }));
      c.after(250, () => root.classList.add('is-fill'));
      c.after(1500, () => M.tone('chime'));
      c.after(2700, () => { const r = gate.getBoundingClientRect(), b = root.getBoundingClientRect(); spark(r.left + r.width / 2 - b.left, r.top + r.height * .45 - b.top, 120); M.haptic('success'); M.tone('chime'); });
      c.after(4100, () => { offTilt(); stopLoop(); open(); c.after(1500, () => fx.stop()); });
    };
    const go = viaDrag => {
      if (started) return;
      started = true;
      openBtn.disabled = true; clasp.disabled = true;
      root.classList.add('is-opening');
      EA.music(); M.requestTilt(); M.haptic('crack'); M.tone('click');
      c.after(120, () => M.tone('whoosh'));
      M.tween(f, 1, c.reduced ? 0 : 1500 * (1 - f * .5) + 200, 'inOut', setF).then(() => M.haptic('thud'));
      c.after(520, finish);
    };

    // drag the clasp apart; a short tap also opens
    const dist = () => Math.max(90, gate.clientWidth * .34);
    let id = null, x0 = 0, moved = 0;
    clasp.addEventListener('pointerdown', ev => { if (started || id != null) return; id = ev.pointerId; x0 = ev.clientX; moved = 0; clasp.setPointerCapture?.(id); root.classList.add('is-drag'); M.requestTilt(); M.haptic('tap'); });
    clasp.addEventListener('pointermove', ev => { if (ev.pointerId !== id) return; moved = Math.max(moved, Math.abs(ev.clientX - x0)); setF(clamp(Math.abs(ev.clientX - x0) / dist()) * .62); });
    const end = ev => {
      if (ev.pointerId !== id) return; id = null; root.classList.remove('is-drag');
      if (moved < 8 || f > .3) go(true); else M.tween(f, 0, 380, 'out', setF);
    };
    clasp.addEventListener('pointerup', end); clasp.addEventListener('pointercancel', end);
    clasp.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(false); } });
    openBtn.addEventListener('click', () => go(false));
  });

  // ======================= SECTIONS =======================
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    return `<div class="dc-hero">
      <div class="dc-hrays" aria-hidden="true"><i></i></div>
      <p class="dc-eb">${e(mc.eyebrow || 'Đêm dạ tiệc của chúng mình')}</p>
      <div class="dc-arch"><div class="in"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"></div><i class="dc-sheen" aria-hidden="true"></i></div>
      <h1 class="dc-names gold">${names(D, e)}</h1>
      ${cp.headline ? `<p class="dc-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="dc-datebtn" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d}<i></i>${c.m}<i></i>${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</button>
      <p class="dc-egg" aria-live="polite"></p>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content, days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      ${box(`<div class="dc-letter">
        <span class="dc-eb">Thư mời</span>
        <div class="dc-salute">${t(mc.greeting || 'Kính gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>${DIV}
        ${D.letter.slice(0, 2).map(p => `<p class="dc-p">${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="dc-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p class="dc-p">${t(p)}</p>`).join('')}
        <div class="dc-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></div>
      </div>`)}
      ${days != null && days > 0 ? `<div class="dc-marquee" data-days="${days}">
        ${['t', 'b'].map(k => `<div class="bulbs ${k}" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>`).join('')}
        <p class="dc-eb">Bảng đèn của đêm</p>
        <div class="num"><span class="n">0</span></div>
        <p class="u">đêm bên nhau</p>
        <p class="s">Từ ngày ${fmtDate(met)}${place ? ` · ${e(place)}` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  const skyline = (h, cls) => `<svg class="dc-sky ${cls}" viewBox="0 0 80 120" aria-hidden="true"><path d="M8 120V60H20V40H28V24H34V8H40V0 40 8H46V24H52V40H60V60H72V120Z" class="b"/><path d="M40 0V30M24 70V110M40 54V110M56 70V110" class="l"/></svg>`;
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="dc-fam">${box(`<span class="dc-tab">${label}</span>
      <span class="r">Ông</span><span class="nm">${e(f.father)}</span><span class="r">Bà</span><span class="nm">${e(f.mother)}</span>
      ${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}`)}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? c.p.kmBetween(pins.groom, pins.bride) : null;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="dc-famgrid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="dc-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="dc-cities">
        <div class="row">${skyline(120, 'a')}<svg class="arc" viewBox="0 0 200 60" aria-hidden="true"><path class="tr" pathLength="1" d="M4 54 Q100 -30 196 54"/></svg>${skyline(90, 'b')}</div>
        <div class="ends"><span>${e(homes.groom || '')}</span><span>${e(homes.bride || '')}</span></div>
        <p class="km">${km ? `Hai thành phố cách nhau khoảng <b>${(Math.round(km / 10) * 10).toLocaleString('vi-VN')} km</b>` : 'Hai thành phố, một đêm tiệc'}<small>Mọi con đường đều dẫn về cùng một sảnh tiệc.</small></p>
      </div>` : ''}
    </div>`;
  });

  // events + the guest's own gala ticket
  const ticketData = (c, ev) => {
    const guest = c.guest, h = hash(guest + c.data.date);
    return { guest, table: String(1 + h % 24).padStart(2, '0'), seat: 1 + (h >>> 5) % 8, no: String(1000 + h % 9000), ev, bars: Array.from({ length: 34 }, (_, i) => 1 + ((h >>> (i % 24)) + i * 7) % 4) };
  };
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    const dateOf = ev => {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date;
      const [y, m, d] = iso.split('-');
      return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`;
    };
    const last = D.events[D.events.length - 1];
    const tk = last ? ticketData(c, last) : null;
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi', 'Ba đêm sáng đèn cho một lời hẹn')}
      <ol class="dc-evs">${D.events.map((ev, i) => `<li class="dc-ev">${box(`
        <span class="rn" aria-hidden="true">${ROMAN[i] || i + 1}</span>
        <p class="tag">${e(ev.label)}</p><h3>${e(ev.title)}</h3>
        <p class="tm"><b>${e(ev.time)}</b></p><p class="dt">${dateOf(ev)}</p>
        ${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}
        <p class="pl"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>${ui.actions(ev)}`)}</li>`).join('')}</ol>
      ${tk ? `<div class="dc-ticketwrap">
        <p class="dc-eb">Vé dạ tiệc dành riêng cho bạn</p>
        <div class="dc-ticket" data-ticket='${esc(JSON.stringify({ g: tk.guest, t: tk.table, s: tk.seat, n: tk.no, d: `${c.dow}, ${c.d}.${c.m}.${c.y}`, tm: last.time, p: last.place }))}'>
          <div class="stub"><span>Dạ tiệc</span><b>1920</b><span>Vé số ${tk.no}</span></div>
          <div class="main">
            <i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
            <p class="k">Admit one · Vé mời</p>
            <p class="who">${e(tk.guest)}</p>
            <p class="meta"><span>${c.dow}, ${c.d}.${c.m}.${c.y}</span><span>${e(last.time)}</span><span>${e(last.place)}</span></p>
            <div class="seat"><span>Bàn <b>${tk.table}</b></span><span>Ghế <b>${tk.seat}</b></span></div>
            <div class="bars" aria-hidden="true">${tk.bars.map(w => `<i style="--w:${w}"></i>`).join('')}</div>
          </div>
        </div>
        <button class="btn" type="button" data-saveticket>Lưu vé về máy</button>
      </div>` : ''}
    </div>`;
  });

  // schedule + gala menu
  EA.section('schedule', c => {
    const { data: D, esc: e } = c;
    const mc = c.mod.content;
    const tb = c.p.get('traits.bride', {}), tg = c.p.get('traits.groom', {});
    const courses = Array.isArray(mc.menu) && mc.menu.length ? mc.menu : [
      { course: 'Khai vị', dishes: ['Gỏi ngó sen tôm thịt', 'Súp hải sản măng tây'] },
      { course: 'Món chính', dishes: ['Cá hồi áp chảo sốt chanh dây', 'Bò hầm vang đỏ khoai nghiền'] },
      { course: 'Tráng miệng', dishes: ['Panna cotta chanh dây', 'Trái cây theo mùa'] }
    ];
    const sig = [[D.bride.short || D.bride.name, tb.drink], [D.groom.short || D.groom.name, tg.drink]].filter(x => x[1]);
    const drinks = ['Champagne chào mừng', ...sig.map(([n, d]) => `Ly của ${n}: ${d}`)];
    return `<div class="wrap narrow">
      ${head(c, 'Chương trình dạ tiệc', 'Một đêm trọn vẹn', 'Từng giờ trôi qua đều lấp lánh')}
      <ol class="dc-tl">${D.itinerary.map(it => `<li><time>${e(it.time)}</time><div><strong>${e(it.title)}</strong><span>${e(it.note)}</span></div></li>`).join('')}</ol>
      <div class="dc-menu">${box(`<span class="dc-eb">Thực đơn dạ tiệc</span><h3>Menu của đêm</h3>${DIV}
        ${courses.map(k => `<div class="course"><p class="cr">${e(k.course)}</p>${(k.dishes || []).map(d => `<p class="ds">${e(d)}</p>`).join('')}</div>`).join('')}
        <div class="course"><p class="cr">Thức uống</p>${drinks.map(d => `<p class="ds">${e(d)}</p>`).join('')}</div>`)}</div>
    </div>`;
  });

  // dress code: a geometric mood board
  const ICON = {
    gown: '<path d="M30 8l6 18-8 12 6 80H12l8-80-8-12 6-18M24 8c2 6 8 6 12 0M30 26l10 12-6 80"/>',
    tux: '<path d="M14 12l16 22 16-22 10 14-8 90H12L4 26ZM30 34v82M24 40h12l-3 8h-6zM18 62h8M18 76h8"/>',
    fan: '<path d="M30 112V60M30 60L6 34M30 60L18 22M30 60L30 14M30 60L42 22M30 60L54 34M6 34Q30 8 54 34M12 112h36"/>'
  };
  EA.section('dressCode', c => {
    const { data: D, esc: e } = c;
    const SHAPES = ['arch', 'fan', 'dia', 'bars', 'circ'];
    const tiles = D.dressCode.map((s, i) => `<li class="tile ${SHAPES[i % 5]}" style="--c:${e(s.color)}"><span class="sw" aria-hidden="true"></span><span class="nm">${e(s.name)}</span></li>`).join('');
    const icons = [['gown', 'Đầm dạ hội dài hoặc cocktail'], ['tux', 'Vest, smoking, nơ'], ['fan', 'Phụ kiện: ánh vàng, lông vũ, ngọc trai']];
    return `<div class="wrap">
      ${head(c, 'Dress code', 'Bảng cảm hứng trang phục', 'Lộng lẫy kiểu những năm 1920')}
      <ul class="dc-mood">${tiles}${icons.map(([k, l]) => `<li class="ico"><svg viewBox="0 0 60 120" aria-hidden="true"><g class="tr" fill="none">${ICON[k]}</g></svg><span>${l}</span></li>`).join('')}</ul>
      <ul class="dc-notes">${D.notes.map(n => `<li>${e(n)}</li>`).join('')}</ul>
    </div>`;
  });

  // quote + the song (title and artist only, never the lyric)
  EA.section('quote', c => {
    const { esc: e, data: D } = c;
    const q = c.p.get('quote', null), song = c.p.get('song', null);
    const text = q?.text || D.quote;
    return `<div class="wrap narrow dc-quote">
      <span class="dc-eb">${e(c.mod.content.eyebrow || 'Lời nhắn')}</span>
      <blockquote>${e(text)}</blockquote>${q?.author ? `<cite>${e(q.author)}</cite>` : ''}
      ${song?.title ? `<div class="dc-song"><svg class="rec" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" class="d"/><circle cx="50" cy="50" r="38" class="g"/><circle cx="50" cy="50" r="28" class="g"/><circle cx="50" cy="50" r="16" class="l"/><circle cx="50" cy="50" r="3" class="d"/></svg>
        <div><p class="k">Bản nhạc mở màn</p><p class="t">${e(song.title)}</p>${song.artist ? `<p class="a">${e(song.artist)}</p>` : ''}</div></div>` : ''}
    </div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một chiếc ly đang chờ bạn')}
    ${box(`<div class="dc-rsvp">${c.ui.rsvpForm()}</div>`)}
  </div>`);

  const glass = cls => `<g transform="translate(${cls === 'a' ? 50 : 150} 124)"><g class="r ${cls}"><path class="lq" d="M-26 -70H26Q24 -52 0 -49Q-24 -52 -26 -70Z"/><path class="gl" d="M-30 -78H30Q30 -50 0 -46Q-30 -50 -30 -78Z"/><path class="gl" d="M0 -46V-2M-18 0H18"/></g></g>`;
  const COUPES = `<svg class="dc-toast" viewBox="0 0 200 140" aria-hidden="true" focusable="false">${glass('a')}${glass('b')}</svg>`;
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="dc-bye">
      <div class="dc-brays" aria-hidden="true"><i></i></div>
      <span class="dc-eb">${e(mod.content.eyebrow || 'Lời cảm ơn')}</span>
      ${COUPES}
      <p class="dc-byel">Hẹn gặp <b>${e(guest)}</b> trong đêm dạ tiệc</p>
      <p class="dc-byet">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="dc-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="dc-bd">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Mở lại cổng ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  const VI_EB = { saveDate: 'Lưu ngày vui', party: 'Những người đồng hành', video: 'Thước phim', gallery: 'Khoảnh khắc', faq: 'Cần biết',
    gift: 'Mừng cưới', registry: 'Gợi ý quà tặng', guestbook: 'Sổ lưu bút', contact: 'Liên hệ', story: 'Chuyện tình' };

  const saveTicket = async data => {
    try { await Promise.all(['600 54px "Playfair Display"', '500 22px "Josefin Sans"', '400 italic 28px "Playfair Display"'].map(f => document.fonts.load(f))); } catch { /* ignore */ }
    const W = 1200, H = 520, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1d2733'); bg.addColorStop(1, '#10161d');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const gold = g.createLinearGradient(0, 0, W, 0); gold.addColorStop(0, '#f6e2a4'); gold.addColorStop(.5, '#d1a751'); gold.addColorStop(1, '#8b6a24');
    g.strokeStyle = gold; g.lineWidth = 3; g.strokeRect(24, 24, W - 48, H - 48); g.lineWidth = 1; g.strokeRect(38, 38, W - 76, H - 76);
    g.beginPath(); g.moveTo(300, 38); g.lineTo(300, H - 38); g.setLineDash([8, 10]); g.stroke(); g.setLineDash([]);
    g.fillStyle = gold; g.textAlign = 'center';
    g.font = '500 22px "Josefin Sans"'; g.fillText('DẠ TIỆC', 169, 150);
    g.font = '600 96px "Playfair Display"'; g.fillText('1920', 169, 262);
    g.font = '500 20px "Josefin Sans"'; g.fillText('VÉ SỐ ' + data.n, 169, 320);
    g.textAlign = 'left'; g.fillStyle = '#d1a751'; g.font = '500 22px "Josefin Sans"'; g.fillText('ADMIT ONE · VÉ MỜI', 350, 120);
    g.fillStyle = '#ece7dc'; let fs = 64; g.font = `600 ${fs}px "Playfair Display"`;
    while (g.measureText(data.g).width > 780 && fs > 28) { fs -= 4; g.font = `600 ${fs}px "Playfair Display"`; }
    g.fillText(data.g, 350, 215);
    g.font = '500 24px "Josefin Sans"'; g.fillStyle = '#d8d2c4';
    g.fillText(`${data.d} · ${data.tm}`, 350, 290); g.fillText(data.p, 350, 330);
    g.fillStyle = gold; g.font = '600 34px "Playfair Display"'; g.fillText(`Bàn ${data.t}   Ghế ${data.s}`, 350, 410);
    let x = 780; for (let i = 0; i < 34; i++) { const w = 2 + ((i * 7 + data.s) % 4) * 2; g.fillRect(x, 380, w, 60); x += w + 6; }
    cv.toBlob(b => { if (!b) return; const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: 've-da-tiec.png' }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); });
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    Object.entries(VI_EB).forEach(([id, eb]) => {
      const h = main.querySelector(`#${id} .head .eyebrow`);
      if (h && /^[A-Za-z &;]+$/.test(h.textContent.trim())) h.textContent = eb;
    });

    // hero: sunburst follows tilt / pointer
    const hero = main.querySelector('.dc-hero');
    if (hero) {
      const off = M.tilt(({ x, y }) => { hero.style.setProperty('--tx', x.toFixed(3)); hero.style.setProperty('--ty', y.toFixed(3)); });
      void off;
    }

    // easter egg: tap the date 3 times -> champagne pops
    const dateBtn = main.querySelector('.dc-datebtn'), egg = main.querySelector('.dc-egg');
    if (dateBtn && egg) {
      let taps = 0, timer = 0;
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100);
        M.tone('click');
        if (taps >= 3) {
          taps = 0;
          const met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
          egg.innerHTML = met ? `Pop! Chúng mình gặp nhau ngày <b>${fmtDate(met)}</b>${place ? ` · ${esc(place)}` : ''}.` : 'Pop! Một nụ cười cho đêm nay.';
          egg.classList.add('on'); M.haptic('success'); M.tone('pop'); M.tone('chime');
          const r = dateBtn.getBoundingClientRect(), fx = makeFx(M, fxCanvas());
          glitter(fx, r.left + r.width / 2, r.top + r.height / 2, 110, 2.6);
          setTimeout(() => fx.stop(), 6000);
        }
      });
    }

    // marquee counter
    const mq = main.querySelector('.dc-marquee');
    if (mq) M.inView(mq, () => {
      mq.classList.add('on');
      const n = mq.querySelector('.n'), to = +mq.dataset.days;
      M.tween(0, to, 3000, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .4 });

    // ticket
    const tk = main.querySelector('.dc-ticket');
    if (tk) {
      const data = JSON.parse(tk.dataset.ticket);
      main.querySelector('[data-saveticket]')?.addEventListener('click', () => { M.tone('click'); saveTicket({ ...data, g: data.g, n: data.n }); });
      M.inView(tk, () => tk.classList.add('on'), { threshold: .4 });
    }
    // cities arc, moodboard, thanks toast
    ['.dc-cities', '.dc-mood', '.dc-bye', '.dc-menu', '.dc-tl'].forEach(s => { const el = main.querySelector(s); if (el) M.inView(el, () => el.classList.add('on'), { threshold: .3 }); });
    const bye = main.querySelector('.dc-bye');
    if (bye) M.inView(bye, () => c.after(1700, () => { M.tone('chime'); M.haptic('tap'); }), { threshold: .5 });
  });

  // finale after RSVP: two coupes clink, glitter, the guest's name lights up
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    const name = String(entry?.name || '').trim() || 'Quý khách';
    const yes = entry?.attending !== false;
    const o = document.createElement('div');
    o.className = 'dc-fin';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Cảm ơn bạn');
    o.innerHTML = `<div class="dc-finc">${COUPES}
      <p class="dc-finm">${yes ? 'Chúc mừng' : 'Cảm ơn'}</p>
      <p class="dc-fint">${esc(name)}</p>
      <p class="dc-fins">${yes ? 'Chiếc ly của bạn đã được rót đầy. Hẹn gặp bạn trong đêm dạ tiệc.' : 'Chúng mình rất tiếc, hy vọng sẽ sớm gặp lại bạn.'}</p>
      <button class="btn ghost" type="button">Đóng</button></div>`;
    document.body.appendChild(o);
    const close = () => { o.classList.add('out'); setTimeout(() => o.remove(), 700); };
    o.querySelector('button').addEventListener('click', close);
    o.addEventListener('click', ev => { if (ev.target === o) close(); });
    requestAnimationFrame(() => o.classList.add('in'));
    setTimeout(() => {
      o.classList.add('clink'); M?.tone('chime'); M?.haptic('success');
      if (M && yes) { const fx = makeFx(M, fxCanvas()); glitter(fx, innerWidth / 2, innerHeight * .4, 140, 3); setTimeout(() => fx.stop(), 7000); }
    }, 900);
    setTimeout(close, 9000);
  });
})();
