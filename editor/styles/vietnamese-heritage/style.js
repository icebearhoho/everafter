// Vietnamese Heritage: arriving at the family gate on the wedding day.
// Cover: lacquered red gate doors with a Song Hỷ medallion, swaying lanterns, rolled câu đối scrolls.
// Wow: press and hold the medallion (or tap "Mở cổng"): doors swing open in 3D, light floods, scrolls unroll, paper confetti.
// All artwork is CSS / inline SVG. No external images besides the couple's own photo.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/vietnamese-heritage.jpg';
  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const photoOf = c => {
    const h = c.config.couple.heroImage || '';
    return !h || /picsum\.photos/.test(h) ? PHOTO : h;
  };

  // A tiny subset of Noto Serif TC for the 囍 glyph (system CJK fonts are the fallback).
  try {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&text=%E5%9B%8D&display=swap';
    document.head.appendChild(l);
  } catch { /* offline */ }

  // gradients shared by every inline svg (must live in a rendered svg, not display:none)
  document.body.insertAdjacentHTML('beforeend', `<svg class="vh-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="vh-lg" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#ff6a45"/><stop offset=".55" stop-color="#d11d22"/><stop offset="1" stop-color="#7d0b10"/></radialGradient>
    <linearGradient id="vh-gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset=".5" stop-color="#d89f38"/><stop offset="1" stop-color="#8a5a12"/></linearGradient>
      <pattern id="vh-tile" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 0 Q5 8 10 0" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1.3"/></pattern>
      <linearGradient id="vh-rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a3022"/><stop offset="1" stop-color="#3a100d"/></linearGradient>
  </defs></svg>`);

  // ---------- artwork ----------
  const lantern = (cls = '', label = '') => `<span class="vh-lan ${cls}"><svg viewBox="0 0 60 120" aria-hidden="true">
    <line x1="30" y1="0" x2="30" y2="20" stroke="#D89F38" stroke-width="1.4"/>
    <rect x="19" y="18" width="22" height="8" rx="2.5" fill="url(#vh-gg)"/>
    <path d="M30 25 C48 25 55 38 55 52 C55 66 48 77 30 77 C12 77 5 66 5 52 C5 38 12 25 30 25Z" fill="url(#vh-lg)"/>
    <path d="M30 25 C19 34 19 68 30 77 M30 25 C41 34 41 68 30 77 M30 25 C10 36 10 66 30 77 M30 25 C50 36 50 66 30 77" fill="none" stroke="rgba(255,205,130,.34)" stroke-width="1"/>
    <ellipse cx="21" cy="40" rx="4.5" ry="9" fill="rgba(255,255,255,.2)" transform="rotate(16 21 40)"/>
    <rect x="18" y="75" width="24" height="8" rx="2.5" fill="url(#vh-gg)"/>
    <line x1="30" y1="83" x2="30" y2="95" stroke="#D89F38" stroke-width="1.4"/>
    <circle cx="30" cy="95" r="2.8" fill="url(#vh-gg)"/>
    <path d="M30 96 l-6 20 M30 96 l-3 22 M30 96 v23 M30 96 l3 22 M30 96 l6 20" stroke="#c4161c" stroke-width="2" stroke-linecap="round"/>
  </svg>${label}</span>`;

  const ROOF = `<svg viewBox="0 0 320 70" aria-hidden="true" preserveAspectRatio="none">
    <path d="M0 64 C16 62 24 52 32 40 L50 24 H270 L288 40 C296 52 304 62 320 64 L320 70 H0Z" fill="url(#vh-rf)"/>
    <path d="M0 64 C16 62 24 52 32 40 L50 24 H270 L288 40 C296 52 304 62 320 64 L320 70 H0Z" fill="url(#vh-tile)"/>
    <rect x="44" y="14" width="232" height="11" rx="5" fill="#3a0f0c"/><path d="M46 15.5 H274" stroke="#D89F38" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M44 20 C30 20 28 6 40 2 C34 8 38 12 46 12Z M276 20 C290 20 292 6 280 2 C286 8 282 12 274 12Z" fill="url(#vh-gg)"/>
    <path d="M32 40 L50 24 M288 40 L270 24" stroke="#D89F38" stroke-width="1.6" fill="none"/><path d="M0 64 C16 62 24 52 32 40 L50 24 H270 L288 40 C296 52 304 62 320 64" stroke="rgba(246,220,149,.55)" stroke-width="1.2" fill="none"/>
    <path d="M0 68.5 H320" stroke="#D89F38" stroke-width="2.4"/>
  </svg>`;

  const DIV = `<svg viewBox="0 0 180 14" aria-hidden="true"><path d="M2 7 H72 M108 7 H178" stroke="currentColor" stroke-width="1" fill="none"/><path d="M90 1 L97 7 L90 13 L83 7Z" fill="currentColor"/><circle cx="76" cy="7" r="1.6" fill="currentColor"/><circle cx="104" cy="7" r="1.6" fill="currentColor"/></svg>`;
  const SUN = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#9B1B1E" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="#D89F38" stroke="#7a4d0e"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>`;

  const head = (c, eyebrow, title, sub, dark) => {
    const t = c.mod?.content?.title;
    return `<header class="vh-hd${dark ? ' dark' : ''}"><span class="vh-eb">${eyebrow}</span><h2>${t != null && t !== '' ? esc(t) : title}</h2><span class="vh-div" aria-hidden="true">${DIV}</span>${sub ? `<span class="vh-sub">${sub}</span>` : ''}</header>`;
  };

  // ---------- câu đối riêng: 8 handwritten pairs, name slots {B} (bride) / {G} (groom) ----------
  const COUPLETS = [
    ['{B} hoa nở thắm duyên trăm năm', '{G} ngọc sáng ngời phúc vạn đời'],
    ['Duyên {B} thắm mãi tựa xuân hồng', 'Nghĩa {G} bền lâu tựa biển xanh'],
    ['Xuân về {B} nở tình son sắt', 'Thu đến {G} thành nghĩa vàng ròng'],
    ['Trăm năm hạnh phúc {B} sánh vai', 'Muôn thuở bình an {G} kề bước'],
    ['Loan phụng hòa minh nghĩa {B} thắm', 'Uyên ương sánh cánh tình {G} bền'],
    ['Gấm vóc đón xuân {B} rạng rỡ', 'Châu báu mừng thu {G} an khang'],
    ['Nhà mới đầm ấm {B} thương yêu mãi', 'Cửa vàng rộng mở {G} hạnh phúc dài'],
    ['Sen nở trong vườn {B} dịu dàng', 'Trúc xanh bên cổng {G} vững vàng']
  ];
  const firstWord = s => String(s || '').trim().split(/\s+/).pop() || '';
  const couplet = c => {
    const B = (c.data.bride.short || firstWord(c.data.bride.name)).trim();
    const G = (c.data.groom.short || firstWord(c.data.groom.name)).trim();
    let h = 7;
    for (const ch of (B + '|' + G).toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const tpl = COUPLETS[h % COUPLETS.length];
    const words = (line, name, slot) => line.split(' ').flatMap(w => w === slot
      ? name.split(/\s+/).map(x => ({ w: x, nm: true })) : [{ w, nm: false }]);
    return { B, G, L: words(tpl[0], B, '{B}'), R: words(tpl[1], G, '{G}'), text: [tpl[0].replace('{B}', B), tpl[1].replace('{G}', G)] };
  };
  const scroll = (words, side, n) => `<div class="vh-scroll ${side}" style="--n:${n}">
    <span class="vh-rod top"></span>
    <div class="vh-paper"><ol class="vh-words">${words.map((x, i) => `<li class="${x.nm ? 'nm' : ''}" style="--i:${i}">${esc(x.w)}</li>`).join('')}</ol></div>
    <span class="vh-rod bot"><i class="tassel"></i></span>
  </div>`;

  // ---------- the gate ----------
  const door = side => `<div class="vh-door ${side}"><i class="ring"></i><div class="vh-med"><span class="hy-glyph">囍</span></div></div>`;
  const gateHTML = (c, opt = {}) => `<div class="vh-gate">
    <div class="vh-roof">${ROOF}</div>
    <div class="vh-plaque"><span>Bách niên giai lão</span></div>
    <div class="vh-frame">
      <div class="vh-court"><img src="${esc(photoOf(c))}" alt=""><i class="vh-rays"></i><i class="vh-light"></i></div>
      <div class="vh-doors">${door('l')}${door('r')}</div>
      <i class="vh-seam"></i>
      ${opt.hold ? `<button class="vh-hold" type="button" aria-label="Nhấn giữ Song Hỷ để mở cổng"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="46"/><circle class="fill" cx="50" cy="50" r="46" transform="rotate(-90 50 50)"/></svg></button>` : ''}
    </div>
    <div class="vh-step"></div>
  </div>`;

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const pair = couplet(c);
    const n = Math.max(pair.L.length, pair.R.length);
    el.innerHTML = `<div class="vh-cover">
      <div class="vh-bg"></div><div class="vh-pat"></div>
      <div class="vh-lanterns" aria-hidden="true">${lantern('a')}${lantern('b')}${lantern('c sm')}${lantern('d sm')}</div>
      <div class="vh-head">
        <p class="vh-eyebrow">Hân hoan kính báo tin mừng</p>
        <h1 class="vh-names"><span>${e(D.bride.name)}</span><span class="va">và</span><span>${e(D.groom.name)}</span></h1>
      </div>
      <div class="vh-stage"><div class="vh-row">
        ${scroll(pair.L, 'l', n)}${gateHTML(c, { hold: true })}${scroll(pair.R, 'r', n)}
      </div></div>
      <div class="vh-foot">
        <div class="vh-dateline"><span>${c.dow}</span><i></i><b>${c.dateText}</b></div>
        <p class="vh-guest">Kính gửi <b>${c.esc(c.guest)}</b></p>
        <p class="vh-hint">Nhấn giữ Song Hỷ để mở cổng</p>
        <button class="open-btn" type="button">Mở cổng</button>
      </div>
      <div class="vh-bloom" aria-hidden="true"></div>
      <canvas class="vh-confetti" aria-hidden="true"></canvas>
    </div>`;
    const root = el.querySelector('.vh-cover');
    const frame = el.querySelector('.vh-frame');
    const holdBtn = el.querySelector('.vh-hold');
    const ringFill = el.querySelector('.vh-hold .fill');
    const openBtn = el.querySelector('.open-btn');
    const CIRC = 2 * Math.PI * 46;
    ringFill.style.strokeDasharray = CIRC.toFixed(2);
    const setP = p => { ringFill.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(2); root.style.setProperty('--hp', p.toFixed(3)); };
    setP(0);

    // ambient: lanterns + scrolls parallax with device tilt / pointer
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    // paper confetti (pháo giấy)
    const COLORS = ['#c4161c', '#9b1b1e', '#e23b2e', '#d89f38', '#f6dc95', '#b01418'];
    const parts = M.particles(el.querySelector('.vh-confetti'), {
      count: 0,
      init(p) { if (!p.burst) p.dead = true; },
      step(p, dt) {
        if (p.dead) return true;
        const k = Math.pow(.96, dt / 16);
        p.vx *= k; p.vy = (p.vy + .0013 * dt) * k;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.s += p.vs * dt;
        return p.y < p.maxY && p.life < 7000;
      },
      draw(g, p) {
        if (p.dead) return;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.cos(p.s));
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        if (p.gold) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h / 3); }
        g.restore();
      }
    });
    const piece = (p, x, y, ang, spd) => {
      p.x = x; p.y = y; p.vx = Math.cos(ang) * spd; p.vy = Math.sin(ang) * spd;
      p.w = 6 + Math.random() * 7; p.h = 9 + Math.random() * 9; p.r = Math.random() * 6.28; p.vr = (Math.random() - .5) * .014;
      p.s = Math.random() * 6.28; p.vs = .004 + Math.random() * .008; p.c = COLORS[(Math.random() * COLORS.length) | 0];
      p.gold = p.c === '#d89f38' || p.c === '#f6dc95'; p.maxY = parts.h + 30;
    };
    const confetti = () => {
      const r = frame.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height * .6;
      parts.burst(130, p => piece(p, ox + (Math.random() - .5) * r.width * .5, oy, -Math.PI / 2 + (Math.random() - .5) * 1.9, .55 + Math.random() * 1.15));
      c.after(520, () => {
        parts.burst(60, p => piece(p, -10, parts.h * .78, -Math.PI / 2 + .55 + Math.random() * .35, .8 + Math.random() * .9));
        parts.burst(60, p => piece(p, parts.w + 10, parts.h * .78, -Math.PI / 2 - .55 - Math.random() * .35, .8 + Math.random() * .9));
      });
    };

    let started = false;
    const go = viaHold => {
      if (started) return;
      started = true;
      openBtn.disabled = true;
      root.classList.remove('is-holding');
      if (viaHold) EA.music();
      M.requestTilt();
      root.classList.add('is-opening');
      M.haptic('crack'); M.tone('click');
      c.after(180, () => { root.classList.add('doors-open'); M.tone('whoosh'); });
      c.after(560, () => root.classList.add('lit'));
      c.after(1100, () => { root.querySelectorAll('.vh-scroll').forEach(s => s.classList.add('is-open')); M.tone('chime'); });
      c.after(1300, () => { confetti(); M.haptic('thud'); M.tone('thud'); });
      c.after(3500, () => { offTilt(); open(); c.after(1200, () => parts.stop()); });
    };
    M.hold(holdBtn, 1200, { onProgress: setP, onDone: () => go(true) });
    holdBtn.addEventListener('pointerdown', () => { if (started) return; M.requestTilt(); M.haptic('tap'); M.tone('click'); root.classList.add('is-holding'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => holdBtn.addEventListener(ev, () => root.classList.remove('is-holding')));
    openBtn.addEventListener('click', () => go(false));
  });

  // ======================= SECTIONS =======================
  // ---- hero: red gate-light scene with the couple in an arch ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    const lunar = cp.lunarDate;
    return `<div class="vh-hero">
      <div class="vh-hl" aria-hidden="true">${lantern('a')}${lantern('b')}</div>
      <p class="vh-eyebrow">Hân hoan kính báo tin mừng</p>
      <div class="vh-archw">
        <div class="vh-arch"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"></div>
        <span class="vh-hyb hy-glyph" aria-hidden="true">囍</span>
        ${lunar ? `<div class="vh-lunar" aria-live="polite"><span>${e(lunar)}</span></div>` : ''}
      </div>
      <h1 class="vh-names"><span>${e(D.bride.name)}</span><span class="va">và</span><span>${e(D.groom.name)}</span></h1>
      ${cp.headline ? `<p class="vh-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="vh-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</button>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  // ---- invitation: the letter + Ngày bên nhau (needs metDate) ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content;
    const days = c.p.daysTogether;
    const met = c.p.get('metDate', '');
    const metTxt = met ? met.split('-').reverse().join('.') : '';
    const place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <div class="vh-paper-card">
        <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        <div class="vh-hymed hy-glyph" aria-hidden="true">囍</div>
        <span class="vh-eb">Thư mời</span>
        <div class="vh-salute">${t(mc.greeting || 'Kính gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        <span class="vh-div" style="margin:0 auto 18px;display:block" aria-hidden="true">${DIV}</span>
        ${D.letter.slice(0, 2).map(p => `<div class="vh-p">${t(p)}</div>`).join('')}
        ${D.letterHighlight ? `<div class="vh-hl-line">${t(D.letterHighlight)}</div>` : ''}
        ${D.letter.slice(2).map(p => `<div class="vh-p">${t(p)}</div>`).join('')}
        <div class="vh-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></div>
      </div>
      ${days != null && days > 0 ? `<div class="vh-days" data-days="${days}">
        <svg class="vh-thread" viewBox="0 0 320 84" aria-hidden="true">
          <path class="th" pathLength="1" d="M22 46 C70 -14 112 112 160 44 S 250 -8 298 46"/>
          <circle class="dot" cx="22" cy="46" r="8"/><circle class="dot" cx="298" cy="46" r="8"/>
          <circle class="knot" cx="160" cy="44" r="6"/>
        </svg>
        <div class="vh-who"><span>${e(D.bride.short || D.bride.name)}</span><span>${e(D.groom.short || D.groom.name)}</span></div>
        <div class="vh-count"><span class="n">${days.toLocaleString('vi-VN')}</span><span class="u">ngày bên nhau</span></div>
        <p class="vh-since">Sợi chỉ đỏ se duyên từ ngày ${metTxt}${place ? ` · ${e(place)}` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  // ---- families: two red-framed columns + Hai họ (needs hometowns) ----
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="vh-fam"><span class="vh-fam-tab">${label}</span>
      <span class="r">Ông</span><span class="nm">${e(f.father)}</span>
      <span class="r">Bà</span><span class="nm">${e(f.mother)}</span>
      ${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const homes = c.p.get('hometowns', {});
    const hG = homes.groom, hB = homes.bride;
    let homesHTML = '';
    if (hG || hB) {
      const pins = c.p.get('hometownPins', {});
      const km = pins.groom && pins.bride ? c.p.kmBetween(pins.groom, pins.bride) : null;
      const kmTxt = km ? Math.round(km / 10) * 10 : null;
      homesHTML = `<div class="vh-homes">
        <div class="vh-homes-line">${hG ? `Nhà trai từ <b>${e(hG)}</b>` : ''}${hG && hB ? ' · ' : ''}${hB ? `Nhà gái từ <b>${e(hB)}</b>` : ''}</div>
        ${km ? `<div class="vh-route"><svg viewBox="0 0 320 60" aria-hidden="true"><path class="th" pathLength="1" d="M20 40 C80 -14 110 70 160 28 S 250 -6 300 40"/><circle class="pin" cx="20" cy="40" r="8"/><circle class="pin" cx="300" cy="40" r="8"/></svg></div>
        <div class="vh-ends"><span>${e(hG || '')}</span><span>${e(hB || '')}</span></div>
        <div class="vh-km">Cách nhau khoảng ${kmTxt.toLocaleString('vi-VN')} km<small>Một sợi chỉ đỏ nối hai quê về chung một nhà</small></div>` : ''}
      </div>`;
    }
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="vh-fam-grid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      <div class="vh-fam-couple"><span>${e(D.groom.name)}</span><span class="va">và</span><span>${e(D.bride.name)}</span></div>
      ${D.announceNote ? `<p class="vh-fam-note">${e(D.announceNote)}</p>` : ''}
      ${homesHTML}
    </div>`;
  });

  // ---- events: red-thread timeline with "Giờ lành" badges ----
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    const dateOf = ev => {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date;
      const [y, m, d] = iso.split('-');
      return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`;
    };
    return `<div class="wrap narrow">
      ${head(c, 'Lịch trình ngày vui', 'Ngày chúng mình thành đôi', 'Những giờ lành đón chào Quý khách')}
      <ol class="vh-tl">
        ${D.events.map((ev, i) => `<li class="vh-ev"><span class="vh-node" aria-hidden="true"><i>${i + 1}</i></span>
          <article class="vh-evc">
            <div class="vh-gio">${SUN}<span>Giờ lành</span><b>${e(ev.time)}</b></div>
            <h3>${e(ev.title)}</h3>
            <div class="vh-evtag">${e(ev.label)}</div>
            <div class="vh-evdate">${dateOf(ev)}</div>
            ${ev.lunar ? `<div class="vh-evlunar">${e(ev.lunar)}</div>` : ''}
            <div class="vh-place"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></div>
            ${ui.actions(ev)}
          </article></li>`).join('')}
      </ol>
    </div>`;
  });

  // ---- gallery ----
  EA.section('gallery', c => `<div class="wrap">
    ${head(c, 'Khung hình hạnh phúc', 'Khoảnh khắc của chúng mình')}
    <div class="vh-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div>
  </div>`);

  // ---- quote: câu đối riêng ----
  EA.section('quote', c => {
    const pair = couplet(c);
    const n = Math.max(pair.L.length, pair.R.length);
    return `<div class="wrap narrow">
      ${head(c, 'Câu đối riêng', 'Đôi câu đối dành cho hai ta', null)}
      <div class="vh-couplet" role="img" aria-label="Câu đối: ${esc(pair.text[0])}; ${esc(pair.text[1])}">${scroll(pair.L, 'l', n)}${scroll(pair.R, 'r', n)}</div>
      <p class="vh-couplet-cap">Viết riêng cho <b>${esc(pair.B)}</b> và <b>${esc(pair.G)}</b></p>
      ${c.data.quote ? `<blockquote class="vh-quote">${esc(c.data.quote)}</blockquote>` : ''}
    </div>`;
  });

  // ---- rsvp ----
  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một đèn lồng sẽ bay lên mang tên bạn')}
    <div class="vh-rsvp">${c.ui.rsvpForm()}</div>
  </div>`);

  // ---- thanks: the gates gently close ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="vh-bye" data-guest="${e(guest)}">
      <span class="vh-eb">Lời cảm ơn</span>
      <div class="vh-gatewrap doors-open lit">${gateHTML(c)}</div>
      <div class="vh-bye-line">Hẹn gặp <b>${e(guest)}</b> ngày vui</div>
      <div class="vh-bye-text">${e(D.thanks)}</div>
      ${mod.content.signature ? `<div class="vh-bye-sig">${e(mod.content.signature.replace('&', 'và'))}</div>` : ''}
      <div class="vh-wall" aria-label="Đèn lồng của khách mời"></div>
      <div class="vh-bye-date">${c.dow} · ${c.dateText}</div>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Mở lại cổng nhà ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  const lanternWall = (main, list) => {
    const wall = main.querySelector('.vh-wall');
    if (!wall) return;
    const names = list.map(x => String(x?.name || '').trim()).filter(Boolean).slice(-8);
    wall.innerHTML = names.map((nm, i) => `<span class="w">${lantern('sm', `<span>${esc(nm)}</span>`).replace('class="vh-lan sm"', `class="vh-lan sm" style="--sl:-${(i * 1.3).toFixed(1)}s"`)}</span>`).join('');
  };
  const refreshWall = main => { try { Promise.resolve(EA.shared.list('lanterns')).then(l => lanternWall(main, l || [])).catch(() => {}); } catch { /* ignore */ } };

  EA.afterRender((c, main) => {
    const M = c.motion;

    // easter egg: tap the date 3 times to write the lunar date vertically
    const dateBtn = main.querySelector('.vh-date'), lunarEl = main.querySelector('.vh-lunar');
    if (dateBtn && lunarEl) {
      let taps = 0, timer = 0;
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100);
        M.tone('click');
        if (taps >= 3) { taps = 0; lunarEl.classList.add('on'); M.haptic('success'); M.tone('chime'); }
      });
    }

    // Ngày bên nhau: the red thread draws itself and the days count up
    const days = main.querySelector('.vh-days');
    if (days) M.inView(days, () => {
      days.classList.add('on');
      const n = days.querySelector('.n'), to = +days.dataset.days;
      M.tween(0, to, 2400, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .4 });

    // Hai họ thread
    const homes = main.querySelector('.vh-homes');
    if (homes) M.inView(homes, () => homes.classList.add('on'), { threshold: .4 });

    // câu đối riêng unrolls when it scrolls into view
    main.querySelectorAll('.vh-couplet').forEach(el => M.inView(el, () => {
      el.querySelectorAll('.vh-scroll').forEach(s => s.classList.add('is-open'));
      M.tone('chime');
    }, { threshold: .5 }));

    // finale at thanks: the gates close gently
    const bye = main.querySelector('.vh-bye');
    if (bye) {
      const wrap = bye.querySelector('.vh-gatewrap');
      M.inView(bye, () => {
        wrap.classList.add('is-closing');
        requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('doors-open', 'lit')));
        c.after(2300, () => { M.tone('thud'); M.haptic('tap'); bye.classList.add('shut'); });
      }, { threshold: .55 });
      refreshWall(main);
    }
  });

  // finale after RSVP: a red lantern floats up with the guest's name
  EA.onRsvp(entry => {
    const M = EA.motion;
    refreshWall(document.getElementById('inv'));
    if (entry && entry.attending === false) return;
    const name = String(entry?.name || '').trim();
    try { EA.shared.add('lanterns', { name }); } catch { /* local only */ }
    const mk = (cls, dx, delay, label) => {
      const f = document.createElement('div');
      f.className = `vh-float ${cls}`;
      f.style.setProperty('--dx', `${dx}px`);
      f.style.animationDelay = `${delay}s`;
      f.innerHTML = lantern('', label || '');
      document.body.appendChild(f);
      setTimeout(() => f.remove(), 9500 + delay * 1000);
    };
    mk('', -24, 0, `<span class="tagn">${esc(name || 'Quý khách')}</span>`);
    [[-120, .5], [110, .8], [-70, 1.3], [80, 1.7]].forEach(([dx, d]) => mk('s', dx, d));
    M?.haptic('success'); M?.tone('chime');
    setTimeout(() => M?.tone('pop'), 700);
  });
})();
