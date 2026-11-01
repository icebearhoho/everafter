// Museum of Us: the exhibition.
// Cover: a dark gallery. The guest slides a brass dimmer and the lights come on room by room.
// Wow: each of three rooms lights up (spotlight cone, frame, plaque), the last one floods the hall, then the walls part to the invitation.
// All artwork is CSS / inline SVG. The couple's own photo is optional (graceful fallback to an illustrated portrait).
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const nb = s => String(s ?? '').trim().replace(/ /g, ' ');
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? '' : h; };
  const fmtDate = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}.${m[2]}.${m[1]}` : `${m[2]}.${m[1]}`) : String(iso || ''); };

  // ---------- artwork ----------
  const portrait = `<svg class="mu-portrait" viewBox="0 0 120 150" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="mu-pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4a4d"/><stop offset="1" stop-color="#14262a"/></linearGradient></defs>
    <rect width="120" height="150" fill="url(#mu-pg)"/>
    <path d="M18 150V62a42 42 0 0 1 84 0v88z" fill="#0f1d20" stroke="#c9a26b" stroke-width="1" opacity=".9"/>
    <circle cx="60" cy="40" r="9" fill="#c9a26b" opacity=".85"/>
    <circle cx="44" cy="84" r="9.5" fill="#d8b985"/><path d="M26 150c0-26 8-46 18-46s18 20 18 46z" fill="#d8b985"/>
    <circle cx="77" cy="80" r="10" fill="#e8cf9f"/><path d="M57 150c0-30 9-50 20-50s20 20 20 50z" fill="#e8cf9f"/>
  </svg>`;
  const A_RINGS = `<svg viewBox="0 0 120 150" aria-hidden="true"><rect width="120" height="150" fill="#1d2f33"/><g fill="none" stroke="#e8cf9f" stroke-width="3"><circle cx="48" cy="78" r="26"/><circle cx="72" cy="78" r="26" stroke="#c9a26b"/></g><circle cx="60" cy="49" r="3" fill="#fff6de"/></svg>`;
  const A_SUN = `<svg viewBox="0 0 120 150" aria-hidden="true"><rect width="120" height="150" fill="#3a2a22"/><circle cx="60" cy="68" r="30" fill="#e8cf9f"/><circle cx="72" cy="62" r="27" fill="#3a2a22"/><path d="M0 120c30-16 60 12 120-6v36H0z" fill="#c9a26b" opacity=".8"/></svg>`;
  const OBJ = {
    ticket: `<svg viewBox="0 0 120 120"><path d="M14 36h92v18a8 8 0 0 0 0 16v18H14V70a8 8 0 0 0 0-16z" /><path d="M78 36v10M78 56v8M78 74v10" stroke-dasharray="3 5"/><path d="M26 54h34M26 66h24" /><path d="M88 50l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z" /></svg>`,
    umbrella: `<svg viewBox="0 0 120 120"><path d="M14 64C14 38 34 22 60 22s46 16 46 42c-8-8-15-8-23 0-8-8-15-8-23 0-8-8-15-8-23 0-8-8-15-8-23 0z"/><path d="M60 22v-8M60 64v32a8 8 0 0 0 16 0"/><path d="M60 22C50 36 48 50 50 64M60 22c10 14 12 28 10 42"/></svg>`,
    ring: `<svg viewBox="0 0 120 120"><path d="M20 62h80v34a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8z"/><path d="M20 62c0-14 10-24 40-24s40 10 40 24"/><circle cx="60" cy="52" r="13"/><path d="M54 38l6-10 6 10"/><path d="M20 76h80"/></svg>`,
    song: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="14"/><circle cx="60" cy="60" r="3" fill="currentColor"/><path d="M26 40a40 40 0 0 1 20-14M94 80a40 40 0 0 1-20 14"/><path d="M60 16c0 0 4 12 14 14"/></svg>`,
    pet: `<svg viewBox="0 0 120 120"><path d="M30 92c-6-20-4-46 10-58l6 12c10-4 18-4 28 0l6-12c14 12 16 38 10 58-10 10-50 10-60 0z"/><circle cx="48" cy="66" r="3" fill="currentColor"/><circle cx="72" cy="66" r="3" fill="currentColor"/><path d="M56 76l4 4 4-4M40 74l-14-3M40 80l-14 3M80 74l14-3M80 80l14 3"/></svg>`,
    cups: `<svg viewBox="0 0 120 120"><path d="M16 46h40l-4 44a8 8 0 0 1-8 7H28a8 8 0 0 1-8-7z"/><path d="M56 56h8a8 8 0 0 1 0 18h-9"/><path d="M30 36c-4-6 4-8 0-14M42 36c-4-6 4-8 0-14"/><path d="M78 38h26l-3 56H81z"/><path d="M78 56h26"/><path d="M98 38l6-14"/></svg>`,
    key: `<svg viewBox="0 0 120 120"><path d="M20 90l36-36"/><circle cx="72" cy="48" r="24"/><circle cx="72" cy="48" r="9"/><path d="M34 76l8 8M44 66l8 8"/></svg>`
  };
  const objSVG = k => `<span class="mu-obj" aria-hidden="true">${OBJ[k] || OBJ.key}</span>`;
  const HEAD = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3" y="13" width="5" height="8" rx="2" fill="currentColor"/><rect x="16" y="13" width="5" height="8" rx="2" fill="currentColor"/></svg>`;
  const ROPE = `<svg class="mu-rope" viewBox="0 0 320 70" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
    <g fill="#c9a26b"><rect x="26" y="22" width="8" height="42" rx="2"/><circle cx="30" cy="18" r="8"/><rect x="18" y="62" width="24" height="6" rx="3"/>
    <rect x="286" y="22" width="8" height="42" rx="2"/><circle cx="290" cy="18" r="8"/><rect x="278" y="62" width="24" height="6" rx="3"/></g>
    <path class="rp" d="M34 20C90 70 230 70 286 20" fill="none" stroke="#8c1d2a" stroke-width="6" stroke-linecap="round"/>
    <path d="M34 20C90 70 230 70 286 20" fill="none" stroke="#c9a26b" stroke-width="1" stroke-dasharray="2 7" opacity=".7"/></svg>`;

  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="mu-hd"><span class="mu-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eyebrow}</span><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${(mc.sub ?? sub) ? `<p class="mu-sub">${esc(mc.sub ?? sub)}</p>` : ''}</header>`;
  };

  // ---------- museum label ----------
  const label = ({ n, title, rows, text, audio }) => `<div class="mu-label">
    <span class="mu-no">${n}</span>
    <h3>${esc(title)}</h3>
    <dl>${rows.filter(r => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <p class="mu-cap" data-text="${esc(text)}">${esc(text)}</p>
    ${audio ? `<button class="mu-audio" type="button" data-say="${esc(audio)}" aria-pressed="false">${HEAD}<span class="t">Nghe thuyết minh</span><i class="eq" aria-hidden="true"><b></b><b></b><b></b><b></b></i></button>` : ''}
  </div>`;
  const exhibit = (n, art, lab, flip) => `<article class="mu-ex${flip ? ' flip' : ''}">
    <div class="mu-art"><i class="mu-cone" aria-hidden="true"></i><div class="mu-mat">${art}</div><span class="mu-glow" aria-hidden="true"></span></div>
    ${lab}</article>`;

  // exhibits from the couple's real objects (personality data); each only when its field exists
  const objects = c => {
    const P = c.p, D = c.data, out = [];
    const b = D.bride.short || D.bride.name, g = D.groom.short || D.groom.name;
    const ch = c.mods.story?.content?.chapters || [];
    if (P.has('metDate') || P.has('metPlace')) out.push({ k: 'ticket', title: 'Tấm vé đầu tiên', date: fmtDate(P.get('metDate', '')), where: P.get('metPlace', ''), mat: 'Giấy, mực in và một buổi chiều có mưa', text: ch[0]?.text || 'Nơi hai người lần đầu gặp nhau, và nơi mọi chuyện bắt đầu.' });
    if (P.has('insideJoke')) out.push({ k: 'umbrella', title: 'Vật chứng của một câu chuyện cười', date: '', where: '', mat: 'Vải, nan thép, và một kỷ niệm chỉ hai người hiểu', text: P.get('insideJoke', '') });
    if (P.has('song.title')) out.push({ k: 'song', title: P.get('song.title', ''), date: '', where: P.get('song.artist', ''), mat: 'Âm thanh, ký ức và một chút ngân nga', text: P.get('song.lyric', '') || 'Bài hát của riêng hai người.', song: true });
    if (P.has('proposal')) out.push({ k: 'ring', title: 'Chiếc hộp nhỏ', date: fmtDate((P.get('places', []).slice(-1)[0] || {}).date || ''), where: (P.get('places', []).slice(-1)[0] || {}).name || '', mat: 'Nhung, vàng trắng và một cái gật đầu', text: P.get('proposal', '') });
    if (P.has('pet.name')) out.push({ k: 'pet', title: `${P.get('pet.name', '')}, thành viên không chính thức`, date: '', where: P.get('pet.kind', ''), mat: 'Lông mềm, tiếng gừ gừ và thói quen ngủ trên ghế sofa', text: `Một ${P.get('pet.kind', 'người bạn nhỏ')} tên ${P.get('pet.name', '')}, chứng kiến mọi buổi sáng và mọi cuộc cãi vã nhỏ của ${b} và ${g}.` });
    const db = P.get('traits.bride.drink', ''), dg = P.get('traits.groom.drink', '');
    if (db || dg) out.push({ k: 'cups', title: 'Hai ly quen thuộc', date: '', where: '', mat: [db, dg].filter(Boolean).join(' và '), text: `${db ? `${b} luôn gọi ${db.toLowerCase()}. ` : ''}${dg ? `${g} thì chọn ${dg.toLowerCase()}. ` : ''}Hai thói quen khác nhau, cùng một bàn.` });
    return out;
  };

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const photo = photoOf(c);
    const lamp = i => `<span class="mu-lamp l${i}"><svg viewBox="0 0 40 52" aria-hidden="true"><rect x="16" y="0" width="8" height="12" fill="#5b5448"/><path d="M6 14h28l-4 30H10z" fill="#2c2b2f" stroke="#c9a26b" stroke-width="1.2"/><ellipse cx="20" cy="46" rx="10" ry="4" class="bulb"/></svg><i class="mu-cone" aria-hidden="true"></i></span>`;
    const frame = (i, art, cap) => `<figure class="mu-fr f${i}"><div class="mu-fr-in">${art}</div><figcaption>${cap}</figcaption></figure>`;
    el.innerHTML = `<div class="mu-cover" style="--p:0;--l1:0;--l2:0;--l3:0;--tx:0;--ty:0">
      <div class="mu-wall" aria-hidden="true"></div>
      <canvas class="mu-dust" aria-hidden="true"></canvas>
      <div class="mu-rail" aria-hidden="true">${lamp(1)}${lamp(2)}${lamp(3)}</div>
      <div class="mu-cv-head">
        <p class="mu-eyebrow">Triển lãm đặc biệt · Khai mạc ${c.d}.${c.m}.${c.y}</p>
        <h1 class="mu-cvnames"><span>${e(nb(D.bride.name))}</span><i>và</i><span>${e(nb(D.groom.name))}</span></h1>
      </div>
      <div class="mu-frames">
        ${frame(1, A_RINGS, '<b>I</b>Gặp gỡ')}
        ${frame(2, `${portrait}${photo ? `<img src="${e(photo)}" alt="">` : ''}`, '<b>II</b>Chung đường')}
        ${frame(3, A_SUN, '<b>III</b>Chung nhà')}
      </div>
      <div class="mu-cv-foot">
        <p class="mu-guest">Gửi <b>${e(c.guest)}</b>, mời vào tham quan</p>
        <div class="mu-plate">
          <div class="mu-trk" tabindex="-1"><i class="mu-fill"></i>
            <b class="t1"></b><b class="t2"></b><b class="t3"></b>
            <button class="mu-knob" type="button" role="slider" aria-label="Công tắc đèn phòng trưng bày" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></button>
          </div>
          <p class="mu-hint">Kéo công tắc để bật đèn từng gian</p>
        </div>
        <button class="open-btn" type="button">Vào phòng trưng bày</button>
      </div>
      <div class="mu-flash" aria-hidden="true"></div>
    </div>`;
    const root = el.querySelector('.mu-cover');
    const trk = el.querySelector('.mu-trk'), knob = el.querySelector('.mu-knob');
    const openBtn = el.querySelector('.open-btn');
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    // drifting dust motes that catch the light
    const dust = M.particles(el.querySelector('.mu-dust'), {
      count: 46,
      init(p, i, w, h) { p.x = Math.random() * w; p.y = Math.random() * h; p.r = .6 + Math.random() * 1.5; p.vx = (Math.random() - .5) * .012; p.vy = .004 + Math.random() * .012; p.ph = Math.random() * 6.28; },
      step(p, dt, w, h) { p.x += p.vx * dt + Math.sin(p.life / 1300 + p.ph) * .06; p.y += p.vy * dt; if (p.y > h + 4 || p.x < -4 || p.x > w + 4) p.y = -4; },
      draw(g, p) { const pp = +root.style.getPropertyValue('--p') || 0; g.globalAlpha = .12 + pp * .5; g.fillStyle = '#f3dfb2'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    });

    const TH = [.14, .5, .84], lit = [false, false, false];
    let p = 0, done = false, started = false;
    const set = v => {
      p = clamp(v);
      root.style.setProperty('--p', p.toFixed(3));
      const ls = [clamp(p / .26), clamp((p - .34) / .26), clamp((p - .68) / .26)];
      ls.forEach((l, i) => {
        root.style.setProperty(`--l${i + 1}`, l.toFixed(3));
        const on = p >= TH[i];
        if (on && !lit[i]) { lit[i] = true; M.haptic('tap'); M.tone('click'); root.classList.add(`r${i + 1}`); }
        if (!on && lit[i]) { lit[i] = false; root.classList.remove(`r${i + 1}`); }
      });
      const w = trk.clientWidth - knob.offsetWidth;
      knob.style.transform = `translateX(${(p * w).toFixed(1)}px)`;
      knob.setAttribute('aria-valuenow', Math.round(p * 100));
    };
    set(0);

    const finish = () => {
      if (started) return;
      started = true; done = true;
      openBtn.disabled = true;
      M.requestTilt(); EA.music();
      set(1);
      root.classList.add('is-opening', 'r1', 'r2', 'r3');
      M.haptic('success'); M.tone('thud');
      c.after(260, () => { root.classList.add('flood'); M.tone('chime'); });
      c.after(1500, () => { root.classList.add('part'); M.tone('whoosh'); });
      c.after(3000, () => { offTilt(); open(); c.after(900, () => dust.stop()); });
    };
    const animateTo = (to, ms) => M.tween(p, to, ms, 'inOut', set);

    const posToP = x => { const r = trk.getBoundingClientRect(), kw = knob.offsetWidth; return clamp((x - r.left - kw / 2) / (r.width - kw)); };
    let drag = false;
    const down = ev => { if (started) return; drag = true; M.requestTilt(); trk.setPointerCapture?.(ev.pointerId); knob.classList.add('is-dragging'); set(posToP(ev.clientX)); ev.preventDefault(); };
    const move = ev => { if (drag && !started) set(posToP(ev.clientX)); };
    const up = () => { if (!drag) return; drag = false; knob.classList.remove('is-dragging'); if (p >= .96) finish(); };
    trk.addEventListener('pointerdown', down); trk.addEventListener('pointermove', move);
    trk.addEventListener('pointerup', up); trk.addEventListener('pointercancel', up);
    knob.addEventListener('keydown', ev => {
      const d = { ArrowRight: .1, ArrowUp: .1, ArrowLeft: -.1, ArrowDown: -.1 }[ev.key];
      if (d == null || started) return;
      ev.preventDefault(); set(p + d); if (p >= .99) finish();
    });
    openBtn.addEventListener('click', () => {
      if (started) return;
      M.requestTilt();
      if (c.reduced) return finish();
      started = true; openBtn.disabled = true; EA.music();
      animateTo(1, 1800).then(() => { started = false; finish(); });
    });
  });

  // ======================= SECTIONS =======================
  // ---- hero: a gilt portrait behind the velvet rope ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, photo = photoOf(c);
    const mat = c.p.has('traits.bride.drink') && c.p.has('traits.groom.drink')
      ? `${c.p.get('traits.bride.drink')}, ${c.p.get('traits.groom.drink').toLowerCase()} và rất nhiều kiên nhẫn` : 'Tình yêu, thời gian và rất nhiều kiên nhẫn';
    const since = c.p.get('metDate', '') ? c.p.get('metDate').slice(0, 4) : '';
    return `<div class="mu-hero">
      <i class="mu-spot" aria-hidden="true"></i>
      <div class="mu-hero-in">
        <div class="mu-hero-art">
          <span class="wire l" aria-hidden="true"></span><span class="wire r" aria-hidden="true"></span>
          <button class="mu-bigframe" type="button" aria-label="Bức chân dung ${e(D.bride.name)} và ${e(D.groom.name)}">
            <span class="in">${portrait}${photo ? `<img src="${e(photo)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}</span>
            <span class="alarm" aria-hidden="true"></span>
          </button>
          ${ROPE}
          <p class="mu-notouch" role="status" aria-live="polite"><span>Xin đừng chạm vào tác phẩm</span></p>
        </div>
        <div class="mu-hero-txt">
          <p class="mu-eb">${e(mc.eyebrow || 'Triển lãm vĩnh cửu')}</p>
          <h1 class="mu-names"><span>${e(nb(D.bride.name))}</span><i>và</i><span>${e(nb(D.groom.name))}</span></h1>
          ${cp.headline ? `<p class="mu-headline">${c.t(cp.headline)}</p>` : ''}
          <div class="mu-placard">
            <b>${e(nb(D.bride.name))} và ${e(nb(D.groom.name))}</b>
            <dl><div><dt>Năm</dt><dd>${since ? `${since} – nay` : c.y}</dd></div><div><dt>Chất liệu</dt><dd>${e(mat)}</dd></div><div><dt>Khai mạc</dt><dd>${c.dow}, ${c.d}.${c.m}.${c.y}${cp.city ? ` · ${e(cp.city)}` : ''}</dd></div></dl>
          </div>
          ${mc.showCountdown !== false ? ui.countdown() : ''}
        </div>
      </div>
    </div>`;
  });

  // ---- invitation: the wall text + how old the collection is ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether;
    const place = c.p.get('metPlace', ''), met = fmtDate(c.p.get('metDate', ''));
    return `<div class="wrap narrow">
      <div class="mu-wallText">
        <span class="mu-eb">Lời giới thiệu triển lãm</span>
        <p class="mu-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        ${D.letter.slice(0, 2).map(p => `<p class="mu-p">${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="mu-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p class="mu-p">${t(p)}</p>`).join('')}
        <p class="mu-sign">Ban tổ chức,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
      </div>
      ${days != null && days > 0 ? `<div class="mu-age" data-days="${days}">
        <span class="mu-eb">Tuổi của bộ sưu tập</span>
        <div class="mu-odo" aria-label="${days} ngày"><span class="n">${days.toLocaleString('vi-VN')}</span><span class="u">ngày bên nhau</span></div>
        <p>Nhập kho từ ${met}${place ? ` · ${e(place)}` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  // ---- families: sponsor placards + where the two collections come from ----
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="mu-fam"><span class="mu-eb">${e(f.label || label)}</span>
      <p><small>Ông</small>${e(f.father)}</p><p><small>Bà</small>${e(f.mother)}</p>${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? c.p.kmBetween(pins.groom, pins.bride) : null;
    return `<div class="wrap">
      ${head(c, 'Đơn vị bảo trợ', 'Trân trọng báo tin', mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}
      <div class="mu-fam-grid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="mu-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="mu-origin">
        <span class="mu-eb">Xuất xứ hiện vật</span>
        <div class="mu-orline"><span><small>Nhà trai</small>${e(homes.groom || '')}</span>${km ? `<svg viewBox="0 0 200 30" aria-hidden="true"><path class="th" pathLength="1" d="M4 22C50 -6 150 -6 196 22"/><circle cx="4" cy="22" r="4"/><circle cx="196" cy="22" r="4"/></svg>` : '<i></i>'}<span><small>Nhà gái</small>${e(homes.bride || '')}</span></div>
        ${km ? `<p class="mu-km">Hai nơi cách nhau khoảng <b>${(Math.round(km / 10) * 10).toLocaleString('vi-VN')} km</b>, và một ngày chung bảng tên.</p>` : ''}
      </div>` : ''}
    </div>`;
  });

  // ---- story: the rooms of the exhibition ----
  EA.section('story', c => {
    const { esc: e, mod } = c, s = mod.content, ch = s.chapters || [];
    const ar = [A_RINGS, A_SUN, portrait];
    const objs = objects(c);
    let n = 0;
    const rooms = ch.map((x, i) => exhibit(n, `${ar[i % 3].replace('<svg ', '<svg class="mu-artsvg" ')}${x.image ? `<img src="${e(x.image)}" alt="" loading="lazy">` : ''}`, label({
      n: `Phòng ${ROMAN[n++] || n}`, title: x.title, rows: [['Năm', x.date], ['Chất liệu', 'Ký ức, nụ cười, thời gian']], text: x.text, audio: `${x.title}. ${x.text}`
    }), i % 2));
    const cols = objs.map((o, i) => exhibit(n, objSVG(o.k), label({
      n: `Hiện vật ${String(i + 1).padStart(2, '0')}`, title: o.title, rows: [['Ngày', o.date], [o.song ? 'Trình bày' : 'Xuất xứ', o.where], ['Chất liệu', o.mat]], text: o.text, audio: `${o.title}. ${o.text}`
    }), (ch.length + i) % 2));
    const pl = c.p.get('places', []);
    return `<div class="wrap">
      ${head(c, 'Các phòng trưng bày', 'Chuyện của chúng mình', 'Hãy đi chậm. Mỗi hiện vật đều có một câu chuyện.')}
      <div class="mu-rooms">${rooms.join('')}</div>
      ${cols.length ? `<div class="mu-coll"><header class="mu-hd mini"><span class="mu-eb">Bộ sưu tập kỷ vật</span><h3>Những món đồ chúng mình giữ lại</h3></header><div class="mu-rooms">${cols.join('')}</div></div>` : ''}
      ${pl.length ? `<div class="mu-plan"><header class="mu-hd mini"><span class="mu-eb">Sơ đồ tham quan</span><h3>Những nơi chúng mình đã đi qua</h3></header>
        <ol>${pl.map((q, i) => `<li style="--i:${i}"><b>${i + 1}</b><span>${e(q.name)}</span><small>${e(fmtDate(q.date || ''))}</small></li>`).join('')}</ol></div>` : ''}
      ${s.quote ? `<p class="mu-quote">${e(s.quote)}</p>` : ''}
    </div>`;
  });

  // ---- events: admission tickets ----
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    return `<div class="wrap">
      ${head(c, 'Giờ mở cửa', 'Ngày chúng mình khai mạc', 'Vé vào cửa miễn phí, cảm xúc không giới hạn.')}
      <div class="mu-tix">${D.events.map((ev, i) => `<article class="mu-tk">
        <div class="mu-tk-main"><span class="mu-eb">${e(ev.label)}</span><h3>${e(ev.title)}</h3>
          <p class="mu-tk-place"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>
          ${ev.lunar ? `<p class="mu-tk-lunar">${e(ev.lunar)}</p>` : ''}
          ${ui.actions(ev)}</div>
        <div class="mu-tk-stub"><span>Vé số ${String(i + 1).padStart(2, '0')}</span><b>${e(ev.time)}</b><small>${c.d}.${c.m}.${c.y}</small></div>
      </article>`).join('')}</div>
    </div>`;
  });

  EA.section('gallery', c => `<div class="wrap">
    ${head(c, 'Phòng tranh', 'Khoảnh khắc của chúng mình')}
    <div class="mu-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div>
  </div>`);

  EA.section('quote', c => {
    const q = c.p.get('quote.text', '') || c.data.quote, by = c.p.get('quote.author', '');
    return `<div class="wrap narrow"><span class="mu-eb">${esc(c.mod.content.eyebrow || 'Trích dẫn trên tường')}</span>
      <blockquote class="mu-bigq">${esc(q)}</blockquote>${by ? `<p class="mu-by">${esc(by)}</p>` : ''}</div>`;
  });

  // ---- registry: the gift shop ----
  EA.section('registry', c => {
    const { esc: e, mod } = c, mc = mod.content;
    return `<div class="wrap">
      ${head(c, 'Cửa hàng lưu niệm', 'Gợi ý quà tặng', mc.note || 'Mang một mảnh của chúng mình về nhà.')}
      <div class="mu-shop">${(mc.items || []).map((g, i) => `<article class="mu-item">
        <div class="mu-shelf"><span class="mu-tag"><i></i>${e(g.price)}</span>${g.image ? `<img src="${e(g.image)}" alt="" loading="lazy">` : ''}${objSVG(['cups', 'ticket', 'ring', 'umbrella'][i % 4])}</div>
        <h3>${e(g.name)}</h3>
        <button class="btn ghost" type="button" data-pick="${i}">Mình chọn món này</button>
        ${g.link ? `<a class="fine" href="${e(g.link)}" target="_blank" rel="noopener">Xem sản phẩm</a>` : ''}
      </article>`).join('')}</div>
    </div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Quầy vé', 'Bạn sẽ đến chứ?', 'Giữ chỗ cho buổi khai mạc, vé của bạn sẽ được in ngay.')}
    <div class="mu-rsvp">${c.ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="mu-close" data-guest="${e(guest)}">
      <div class="mu-lights" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <span class="mu-eb">Bảo tàng sắp đóng cửa</span>
      <p class="mu-bye">Hẹn gặp <b>${e(guest)}</b> trong ngày khai mạc</p>
      <p class="mu-thx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="mu-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <div class="mu-exit" aria-label="Lối ra"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="14" cy="4" r="2" fill="currentColor"/><path d="M13 8l-3 5 3 3v5M10 13l-4 2M13 9l4 3M13 16l4 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Lối ra</span></div>
      <p class="mu-date">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Vào lại phòng trưng bày ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  // audio guide: speechSynthesis (vi-VN) when available, otherwise the caption is read out word by word on screen
  let speaking = null;
  const stopSpeak = () => {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    if (speaking) { speaking.btn.setAttribute('aria-pressed', 'false'); speaking.btn.closest('.mu-label')?.classList.remove('say'); clearInterval(speaking.t); speaking.cap.innerHTML = esc(speaking.cap.dataset.text); speaking = null; }
  };
  const speak = btn => {
    if (speaking && speaking.btn === btn) return stopSpeak();
    stopSpeak();
    const lab = btn.closest('.mu-label'), cap = lab.querySelector('.mu-cap');
    const words = cap.dataset.text.split(/\s+/);
    cap.innerHTML = words.map((w, i) => `<span data-w="${i}">${esc(w)}</span>`).join(' ');
    btn.setAttribute('aria-pressed', 'true'); lab.classList.add('say');
    let i = 0;
    const tick = () => { cap.querySelectorAll('span.hl').forEach(s => s.classList.remove('hl')); const s = cap.querySelector(`[data-w="${i}"]`); if (s) s.classList.add('hl'); i++; if (i > words.length + 1) stopSpeak(); };
    const state = { btn, cap, t: setInterval(tick, 420) };
    speaking = state; tick();
    try {
      const ss = window.speechSynthesis;
      if (ss && window.SpeechSynthesisUtterance) {
        const u = new SpeechSynthesisUtterance(btn.dataset.say);
        u.lang = 'vi-VN'; u.rate = .92;
        const v = ss.getVoices().find(x => /^vi/i.test(x.lang)); if (v) u.voice = v;
        u.onend = u.onerror = () => { if (speaking === state) stopSpeak(); };
        ss.cancel(); ss.speak(u);
      }
    } catch { /* the on-screen karaoke is the fallback */ }
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    main.addEventListener('click', ev => { const b = ev.target.closest('.mu-audio'); if (b) { M.tone('pop'); speak(b); } });

    // spotlights follow the scroll: every exhibit is lit by how close it sits to the middle of the screen
    main.querySelectorAll('.mu-ex, .mu-tk, .mu-item, .mu-fam').forEach(el => {
      M.scrollProgress(el, p => el.style.setProperty('--lit', clamp(1 - Math.abs(p - .5) * 2.2).toFixed(3)));
      M.inView(el, () => el.classList.add('in'), { threshold: .2 });
    });
    // the hero spotlight sweeps with scroll
    const spot = main.querySelector('.mu-spot'), hero = main.querySelector('.mu-hero');
    if (spot && hero) M.scrollProgress(hero, p => spot.style.setProperty('--sw', ((p - .5) * 2).toFixed(3)));

    // easter egg: touch the painting three times
    const bf = main.querySelector('.mu-bigframe'), sign = main.querySelector('.mu-notouch span');
    if (bf) {
      let taps = 0, timer = 0;
      bf.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1300);
        M.tone('click');
        if (taps === 3) {
          taps = 0; bf.classList.add('alarm-on'); M.haptic('crack'); M.tone('thud');
          if (sign) sign.textContent = 'Báo động! Nhưng với hai bạn, chúng mình cho phép chạm.';
          c.after(2600, () => { bf.classList.remove('alarm-on'); if (sign) sign.textContent = 'Xin đừng chạm vào tác phẩm'; });
        }
      });
    }

    const age = main.querySelector('.mu-age');
    if (age) M.inView(age, () => {
      age.classList.add('on');
      const n = age.querySelector('.n'), to = +age.dataset.days;
      M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .5 });
    const origin = main.querySelector('.mu-origin');
    if (origin) M.inView(origin, () => origin.classList.add('on'), { threshold: .5 });
    const plan = main.querySelector('.mu-plan');
    if (plan) M.inView(plan, () => plan.classList.add('on'), { threshold: .3 });

    // finale 2: closing time, the lights go out one by one
    const cl = main.querySelector('.mu-close');
    if (cl) M.inView(cl, () => {
      const ls = cl.querySelectorAll('.mu-lights i');
      ls.forEach((l, i) => c.after(500 + i * 650, () => { l.classList.add('off'); M.tone('click'); }));
      c.after(500 + ls.length * 650, () => { cl.classList.add('dark'); M.haptic('tap'); });
    }, { threshold: .55 });
  });

  // finale 1: the guest's admission ticket is printed and stamped
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    if (entry && entry.attending === false) return;
    stopSpeak();
    const D = c.data, name = String(entry?.name || '').trim() || c.guest;
    const plus = +entry?.plus || 0;
    const ev = D.events[0];
    const ov = document.createElement('div');
    ov.className = 'mu-ticket-ov';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Vé vào cửa của bạn');
    ov.innerHTML = `<div class="mu-ticket">
      <div class="mu-ticket-main">
        <span class="mu-eb">Vé vào cửa · Khai mạc ${c.d}.${c.m}.${c.y}</span>
        <h3>${esc(D.bride.short || D.bride.name)} và ${esc(D.groom.short || D.groom.name)}</h3>
        <p class="who"><small>Khách tham quan</small>${esc(name)}${plus ? ` <em>+ ${plus}</em>` : ''}</p>
        ${ev ? `<p class="where"><small>Cổng vào</small>${esc(ev.place)} · ${esc(ev.time)}</p>` : ''}
        <span class="stamp" aria-hidden="true">Đã giữ chỗ</span>
      </div>
      <div class="mu-ticket-stub"><i class="bar" aria-hidden="true"></i><span>Số ${String(Math.floor(Math.random() * 900 + 100))}</span></div>
      <button class="btn ghost close" type="button">Đóng</button>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('on'));
    M?.haptic('success'); M?.tone('whoosh');
    setTimeout(() => { ov.classList.add('stamped'); M?.tone('thud'); M?.haptic('thud'); }, 1100);
    setTimeout(() => M?.tone('chime'), 1500);
    const close = () => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 500); };
    ov.querySelector('.close').addEventListener('click', close);
    ov.addEventListener('click', ev2 => { if (ev2.target === ov) close(); });
    document.addEventListener('keydown', function k(ev2) { if (ev2.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
    ov.querySelector('.close').focus({ preventScroll: true });
  });
})();
