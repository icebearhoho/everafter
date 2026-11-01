// Bạch Nguyệt Quang & nốt chu sa.
// Cover: đêm tối, kéo vầng trăng lên -> một giọt chu sa rơi vào trăng, loang ra rồi thành sợi chỉ đỏ buộc hai cái tên -> thiệp mở.
// Add-ons (chỉ hiện khi có dữ liệu): hai đêm trăng (pha trăng đêm gặp & đêm cưới), sợi chỉ đỏ (dòng thời gian), lời trăng, thư dưới trăng.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const nb = s => String(s ?? '').replace(/ /g, ' ');
const nf = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------------- moon phase maths ----------------
const SYN = 29.530588853, REF = Date.UTC(2000, 0, 6, 18, 14);
const moonAge = iso => {                          // 21:00 giờ Việt Nam = 14:00 UTC
  const t = new Date(`${iso}T14:00:00Z`).getTime();
  const a = ((t - REF) / 864e5) % SYN;
  return a < 0 ? a + SYN : a;
};
const phaseInfo = iso => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso || '')) return null;
  const age = moonAge(iso.slice(0, 10)), f = age / SYN, ill = (1 - Math.cos(2 * Math.PI * f)) / 2;
  const name = f < .03 || f > .97 ? 'Trăng non, đêm không trăng' : f < .22 ? 'Trăng lưỡi liềm đầu tháng' : f < .28 ? 'Trăng thượng huyền'
    : f < .47 ? 'Trăng gần tròn' : f < .53 ? 'Trăng rằm' : f < .72 ? 'Trăng khuyết sau rằm' : f < .78 ? 'Trăng hạ huyền' : 'Trăng lưỡi liềm cuối tháng';
  return { age, f, ill, name };
};
let gid = 0;
const moonSVG = (f, cls = '') => {
  const k = Math.cos(2 * Math.PI * f), rx = Math.max(.001, Math.abs(k) * 50), waxing = f < .5, id = `mg${++gid}`;
  const d = f < .012 || f > .988 ? '' : Math.abs(f - .5) < .006 ? 'M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z'
    : `M50 0A50 50 0 0 ${waxing ? 1 : 0} 50 100A${rx.toFixed(2)} 50 0 0 ${waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0)} 50 0Z`;
  return `<svg class="mp ${cls}" viewBox="-8 -8 116 116" aria-hidden="true"><defs><radialGradient id="${id}" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef0f5"/><stop offset="1" stop-color="#cfd5e2"/></radialGradient></defs>
    <circle cx="50" cy="50" r="50" fill="#1b2140"/><circle cx="50" cy="50" r="50" fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".8"/>
    ${d ? `<path d="${d}" fill="url(#${id})"/>` : ''}</svg>`;
};

// ---------------- the red thread (shared pieces) ----------------
const bowPath = (x, y, s) => `M${x} ${y}C${x - s * 2.3} ${y - s * 1.5} ${x - s * 2.3} ${y + s * 1.5} ${x} ${y}C${x + s * 2.3} ${y - s * 1.5} ${x + s * 2.3} ${y + s * 1.5} ${x} ${y}`;
const draw = (path, t) => { path.style.strokeDashoffset = String(1 - clamp(t)); path.style.opacity = t > .001 ? '1' : '0'; };

let stopCover = () => {};

// =====================================================================================================
// COVER
// =====================================================================================================
EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  el.className = 'cover mc'; el.style.cssText = '';
  document.documentElement.classList.toggle('mc-low', M.tier === 'low');
  el.innerHTML = `
    <div class="mc-sky" aria-hidden="true"><div class="mc-wash"></div><canvas class="mc-stars ea-mo-canvas"></canvas><i class="mc-cloud a"></i><i class="mc-cloud b"></i></div>
    <div class="mc-drag" aria-hidden="true"></div>
    <div class="mc-col">
      <header class="mc-top"><p class="mc-to">Gửi ${e(c.guest)}</p><i class="mc-drop" aria-hidden="true"></i></header>
      <div class="mc-region">
        <button class="mc-moon" type="button" aria-label="Vầng trăng. Kéo lên để nâng ánh trăng"><i class="halo"></i><i class="disc"><i class="blot"></i><i class="ring"></i></i></button>
      </div>
      <div class="mc-bot">
        <p class="mc-names"><span class="nm b"><b>${e(nb(D.bride.name))}</b></span><i class="mc-knot" aria-hidden="true"></i><span class="nm g"><b>${e(nb(D.groom.name))}</b></span></p>
        <p class="mc-date">${c.d} · ${c.m} · ${c.y}</p>
        <div class="mc-msg"><p class="mc-hint">${c.icon('up')}<span>Kéo vầng trăng lên</span></p><p class="mc-done" aria-live="polite"></p></div>
        <button class="open-btn" type="button">Nâng ánh trăng</button>
      </div>
    </div>
    <svg class="mc-thread" aria-hidden="true"><g class="glow"></g><g class="core"></g><circle class="bead" r="4" opacity="0"/></svg>
    <div class="mc-flash" aria-hidden="true"></div>`;

  const $ = s => el.querySelector(s);
  const moonBtn = $('.mc-moon'), disc = $('.disc'), drop = $('.mc-drop'), knotEl = $('.mc-knot'), svg = $('.mc-thread');
  const stars = $('.mc-stars'), hint = $('.mc-hint'), done = $('.mc-done');
  const S = { r: 0, tx: 0, ty: 0, ended: false, locked: false, music: false };
  const stops = [];
  stopCover = () => { S.ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));

  const setR = v => { S.r = clamp(v); el.style.setProperty('--r', S.r.toFixed(4)); };
  setR(0);

  // ambient: stars twinkle and drift with tilt; two slow cloud bands
  const sp = M.particles(stars, {
    count: 90,
    init: (s, i, w, h) => { s.x = rnd(0, w); s.y = rnd(0, h * .8); s.r = rnd(.5, 1.7); s.sp = rnd(.0014, .004); s.ph = rnd(0, 6.28); s.a = rnd(.45, 1); s.z = rnd(.2, 1); },
    step: () => {},
    draw: (g, s) => {
      const tw = .5 + .5 * Math.sin(s.life * s.sp + s.ph), vis = (1 - S.r * .55) * s.a * (.4 + .6 * tw);
      g.globalAlpha = vis; g.fillStyle = '#fff';
      g.beginPath(); g.arc(s.x - S.tx * 10 * s.z, s.y - S.ty * 6 * s.z, s.r, 0, 6.2832); g.fill();
      g.globalAlpha = 1;
    }
  });
  stops.push(() => sp.stop());
  if (M.tier !== 'low' && !c.reduced) stops.push(M.tilt(({ x, y }) => { S.tx = x; S.ty = y; el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); }));

  // ---- the thread geometry, measured after the moon has risen ----
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 2'; p.setAttribute('class', cls || ''); draw(p, 0); return p; };
  let segs = null, beads = [];
  const build = () => {
    const cr = el.getBoundingClientRect(), R = r => ({ l: r.left - cr.left, r: r.right - cr.left, t: r.top - cr.top, b: r.bottom - cr.top, cx: r.left + r.width / 2 - cr.left, cy: r.top + r.height / 2 - cr.top });
    const m = R(disc.getBoundingClientRect()), k = R(knotEl.getBoundingClientRect()), nb_ = R($('.nm.b b').getBoundingClientRect()), ng = R($('.nm.g b').getBoundingClientRect());
    const dy = k.cy - m.cy, s = 13, by = Math.max(nb_.b, ng.b) - 2;
    const dMain = `M${m.cx} ${m.cy}C${m.cx - 110} ${m.cy + dy * .32} ${k.cx + 130} ${m.cy + dy * .5} ${m.cx + 18} ${m.cy + dy * .68}S${k.cx - 20} ${k.cy - 24} ${k.cx} ${k.cy}`;
    const dL = `M${k.cx} ${k.cy}C${k.cx - 12} ${by + 14} ${nb_.l + (k.cx - nb_.l) * .5} ${by + 16} ${nb_.l} ${by + 5}`;
    const dR = `M${k.cx} ${k.cy}C${k.cx + 12} ${by + 14} ${ng.r - (ng.r - k.cx) * .5} ${by + 16} ${ng.r} ${by + 5}`;
    const defs = [[dMain, 'main'], [bowPath(k.cx, k.cy, s), 'bow'], [dL, 'tail'], [dR, 'tail']];
    const glow = svg.querySelector('.glow'), core = svg.querySelector('.core');
    glow.innerHTML = ''; core.innerHTML = '';
    segs = defs.map(([d, cl]) => { const a = mk(d, cl), b = mk(d, cl); glow.appendChild(a); core.appendChild(b); return { a, b, len: b.getTotalLength() }; });
    beads = [[nb_.l, by + 5], [ng.r, by + 5]].map(([x, y]) => { const ci = document.createElementNS(NS, 'circle'); ci.setAttribute('cx', x); ci.setAttribute('cy', y); ci.setAttribute('r', 3.2); ci.setAttribute('class', 'end'); ci.style.opacity = '0'; core.appendChild(ci); return ci; });
    return { m, k };
  };
  const setThread = t => {
    const win = (a, b) => clamp((t - a) / (b - a));
    const ts = [win(0, .6), win(.6, .78), win(.78, 1), win(.78, 1)];
    segs.forEach((s, i) => { draw(s.a, ts[i]); draw(s.b, ts[i]); });
    const main = segs[0], bead = svg.querySelector('.bead');
    if (ts[0] > 0 && ts[0] < 1) { const pt = main.b.getPointAtLength(main.len * ts[0]); bead.setAttribute('cx', pt.x); bead.setAttribute('cy', pt.y); bead.setAttribute('opacity', '1'); } else bead.setAttribute('opacity', '0');
    beads.forEach(b => { b.style.opacity = ts[2] > .96 ? '1' : '0'; });
  };

  // ---- the sequence ----
  const begin = () => { if (!S.music) { S.music = true; EA.music(); M.requestTilt(); } hint.classList.add('gone'); };
  let lastTick = 0;
  const rise = v => { setR(v); const k = Math.floor(S.r * 5); if (k !== lastTick) { lastTick = k; if (k > 0) { M.haptic('tap'); M.tone('click'); } } };

  const finish = async () => {
    if (S.locked || S.ended) return;
    S.locked = true; begin();
    el.classList.add('busy');
    if (c.reduced) { setR(1); open(); return; }
    M.tone('whoosh');
    await M.tween(S.r, 1, 280 + 620 * (1 - S.r), 'out', rise);
    if (S.ended) return;
    // 1. the drop falls into the moon
    const m = disc.getBoundingClientRect(), d0 = drop.getBoundingClientRect();
    const fall = m.top + m.height * .46 - (d0.top + d0.height / 2), side = (m.left + m.width / 2) - (d0.left + d0.width / 2);
    el.classList.add('falling');
    M.haptic('tap');
    await drop.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${side * .3}px,${fall * .25}px) scale(1.15,1.35)`, offset: .3 }, { transform: `translate(${side}px,${fall}px) scale(.9,1.1)` }],
      { duration: 620, easing: 'cubic-bezier(.55,0,.95,.55)', fill: 'forwards' }).finished.catch(() => {});
    if (S.ended) return;
    // 2. impact: ripple, blot spreading across the moon
    drop.style.opacity = '0';
    M.tone('thud'); M.haptic('thud');
    el.classList.add('splat');
    await wait(520);
    if (S.ended) return;
    // 3. the thread leaves the blot and ties the two names
    const g = build(); void g;
    M.haptic('tap');
    let tick = 0;
    await M.tween(0, 1, 1500, 'inOut', t => {
      setThread(t);
      const k = Math.floor(t * 4); if (k !== tick) { tick = k; if (t < .95) { M.tone('click'); M.haptic('tap'); } }
    });
    if (S.ended) return;
    el.classList.add('tied');
    done.textContent = 'Sợi chỉ đỏ đã buộc hai cái tên.';
    M.tone('chime'); M.haptic('success');
    await wait(1100);
    if (S.ended) return;
    el.classList.add('wash');
    await wait(520);
    open();
  };

  // gesture: drag the moon (or the sky) upwards; a plain tap or the button does it for you
  let moved = false;
  const dist = () => Math.min(260, innerHeight * .34);
  const dragOpts = {
    axis: 'y', distance: dist(), invert: true,
    onMove: p => { if (S.locked || S.ended) return; if (p > .04) { moved = true; begin(); } rise(p); },
    onEnd: p => {
      if (S.locked || S.ended) return;
      if (p > .5) finish();
      else if (S.r > 0) M.tween(S.r, 0, 380, 'out', setR);
    }
  };
  M.drag($('.mc-drag'), dragOpts); M.drag(moonBtn, dragOpts);
  moonBtn.addEventListener('click', () => { if (moved) { moved = false; return; } finish(); });
  $('.open-btn').addEventListener('click', () => finish());
});

// =====================================================================================================
// SECTIONS
// =====================================================================================================
const daysFromChapters = (chapters, wedding) => {
  const m = (chapters?.[0]?.date || '').match(/(\d{1,2})\D+(\d{4})/);
  if (!m) return 0;
  return Math.max(0, Math.round((new Date(`${wedding}T00:00:00+07:00`) - new Date(Date.UTC(+m[2], +m[1] - 1, 1))) / 864e5));
};
const hasEgg = c => c.p.has('insideJoke') || c.p.has('traits.bride.nickname') || c.p.has('traits.groom.nickname');

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  const dot = hasEgg(c)
    ? '<button class="cinnabar egg-dot" type="button" aria-label="Chạm ba lần vào nốt chu sa để xem điều bí mật"></button>'
    : '<span class="cinnabar" aria-hidden="true"></span>';
  return `<div class="wrap">
  <div class="ml-hero">
    <div class="moon-photo"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><i class="sheen" aria-hidden="true"></i>${dot}</div>
    <p class="eyebrow">Bạch nguyệt quang · Nốt chu sa</p>
    <h1 class="ml-names"><span class="n">${e(nb(cp.brideName))}</span><span class="amp">&amp;</span><span class="n">${e(nb(cp.groomName))}</span></h1>
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="hero-date">${c.dow} · ${c.dateText}</p>
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
  </div>
</div>`;
});

EA.section('story', c => {
  const { esc: e, ui, mod, config } = c;
  const days = c.p.daysTogether ?? daysFromChapters(mod.content.chapters, config.couple.weddingDate);
  return `<div class="wrap narrow">
  ${ui.head('Chuyện tình', 'Những ngày theo đuổi')}
  ${days ? `<p class="ml-days"><span>${nf(days)}</span> ngày từ lần đầu gặp gỡ</p>` : ''}
  <ol class="ml-line">
    ${(mod.content.chapters || []).map((ch, i, all) => `
      <li class="${i === all.length - 1 ? 'last' : ''}">
        <time>${e(ch.date)}</time>
        <div><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
      </li>`).join('')}
  </ol>
  ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
</div>`;
});

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ngày cưới', 'Ngày ánh trăng về nhà')}
  <div class="ml-events">
    ${D.events.map((ev, i) => `
      <article class="ml-ev ${i % 2 ? 'red' : 'white'}">
        <span class="ev-mark" aria-hidden="true"></span>
        <p class="label">${e(ev.label)}</p>
        <h3>${e(ev.title)}</h3>
        <p class="ev-time">${e(ev.time)}</p>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Những tuần trăng')}
  <div class="phases">${D.photos.map((p, i) => ui.photo(p, i, `<span class="phase p${i % 4}" aria-hidden="true"></span>`)).join('')}</div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Hồi âm dưới ánh trăng')}
  <div class="ml-rsvp"><span class="cinnabar" aria-hidden="true"></span>${ui.rsvpForm()}</div>
</div>`);

// =====================================================================================================
// ADD-ONS (injected after render; each renders only when its data exists)
// =====================================================================================================
const fmtDay = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${+m[3]}/${+m[2]}/${m[1]}` : `tháng ${+m[2]}/${m[1]}`) : String(iso || ''); };
const section = (id, html) => { const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} addon`; s.innerHTML = html; return s; };
const placeAfter = (main, ids, nodes) => {
  for (const id of ids) { const ref = main.querySelector('#' + id); if (ref) { let at = ref; nodes.forEach(n => { at.after(n); at = n; }); return true; } }
  return false;
};

// --- Hai đêm trăng: pha trăng đêm gặp nhau và đêm cưới ---
const twoMoons = (c) => {
  if (!c.p.has('metDate')) return null;
  const met = phaseInfo(c.p.raw.metDate), wed = phaseInfo(c.config.couple.weddingDate);
  if (!met || !wed) return null;
  const e = c.esc, full = c.p.daysTogether != null ? Math.floor(c.p.daysTogether / SYN) : 0;
  const col = (label, iso, ph, place) => `<div class="mp-col">
      <div class="mp-orb">${moonSVG(ph.f)}</div>
      <p class="label">${label}</p>
      <p class="mp-date">${fmtDay(iso)}</p>
      <p class="mp-name">${ph.name}</p>
      <p class="mp-meta">Tuổi trăng ${ph.age.toFixed(1).replace('.', ',')} ngày · sáng ${Math.round(ph.ill * 100)}%</p>
      ${place ? `<p class="mp-place">${e(place)}</p>` : ''}</div>`;
  return section('twomoons', `<div class="wrap">
    ${c.ui.head('Hai đêm trăng', 'Cùng một vầng trăng')}
    <div class="mp-panel">
      <span class="mp-stars" aria-hidden="true"></span>
      ${col('Đêm gặp nhau', c.p.raw.metDate, met, c.p.get('metPlace', ''))}
      <div class="mp-link" aria-hidden="true"><i class="mp-thread"></i><i class="mp-bead"></i></div>
      ${col('Đêm về chung nhà', c.config.couple.weddingDate, wed, c.config.couple.city)}
    </div>
    ${full ? `<p class="mp-count">Từ đêm ấy đến nay, chúng mình đã cùng đi qua <b>${nf(full)}</b> lần trăng tròn.</p>` : ''}
  </div>`);
};

// --- Sợi chỉ đỏ: dòng thời gian vẽ theo cuộn trang ---
const redThread = (c) => {
  const e = c.esc, P = c.p, cp = c.config.couple;
  const items = [];
  if (P.has('metDate')) items.push({ at: P.raw.metDate, title: P.get('metPlace', 'Lần đầu gặp nhau'), sub: P.get('metCity', ''), pin: P.get('metPin') || null, tag: 'Gặp nhau' });
  (P.get('places', []) || []).forEach(pl => {
    if (!pl?.name) return;
    const mp = P.get('metPin');
    if ((P.has('metPlace') && pl.name === P.raw.metPlace) || (mp && pl.lat === mp.lat && pl.lng === mp.lng) || (P.has('metDate') && String(pl.date) === String(P.raw.metDate).slice(0, 7))) return;
    items.push({ at: pl.date || '', title: pl.name, sub: '', pin: pl.lat != null ? { lat: pl.lat, lng: pl.lng } : null, tag: 'Dấu chân' });
  });
  items.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  if (P.has('proposal')) items.push({ at: '', title: 'Lời cầu hôn', sub: P.raw.proposal, pin: null, tag: 'Một câu hỏi' });
  if (items.length < 2) return null;
  items.push({ at: cp.weddingDate, title: 'Ngày về chung nhà', sub: cp.city || '', pin: null, tag: 'Hôm nay', end: true });
  let prev = null;
  const lis = items.map((it, i) => {
    let km = '';
    if (it.pin && prev) { const d = P.kmBetween(prev, it.pin); if (d != null && d > 1) km = `<span class="rt-km">cách điểm trước ${nf(d)} km</span>`; }
    if (it.pin) prev = it.pin;
    return `<li class="${it.end ? 'end' : ''}" style="--i:${i}"><i class="rt-node" aria-hidden="true"></i>
      <p class="label">${it.tag}${it.at ? ` · ${fmtDay(it.at)}` : ''}</p>
      <h3>${e(it.title)}</h3>${it.sub ? `<p>${e(it.sub)}</p>` : ''}${km}</li>`;
  }).join('');
  return section('redthread', `<div class="wrap narrow">
    ${c.ui.head('Sợi chỉ đỏ', 'Một sợi chỉ đỏ xuyên suốt')}
    <ol class="rt"><i class="rt-line" aria-hidden="true"><i class="rt-fill"></i></i>${lis}</ol>
  </div>`);
};

// --- Lời trăng: câu thơ và bài hát ---
const moonWords = (c) => {
  const e = c.esc, P = c.p, q = P.get('quote'), s = P.get('song');
  if (!q?.text && !s?.title) return null;
  return section('moonwords', `<div class="wrap narrow">
    ${c.ui.head('Lời trăng', 'Vài lời dưới ánh trăng')}
    ${q?.text ? `<figure class="mw-quote"><blockquote>${e(q.text)}</blockquote>${q.author ? `<figcaption>${e(q.author)}</figcaption>` : ''}</figure>` : ''}
    ${s?.title ? `<div class="mw-song"><span class="mw-disc" aria-hidden="true"><i></i></span><div><p class="label">Bài hát của chúng mình</p><p class="mw-title">${e(s.title)}</p>${s.artist ? `<p class="mw-artist">${e(s.artist)}</p>` : ''}${s.lyric ? `<p class="mw-lyric">${e(s.lyric)}</p>` : ''}</div></div>` : ''}
  </div>`);
};

// --- Thư dưới trăng: hai lá thư ---
const letters = (c) => {
  const e = c.esc, L = c.p.get('letters');
  if (!L || (!L.bride && !L.groom)) return null;
  const one = (k, who) => L[k] ? `<details class="lt"><summary><span class="lt-seal" aria-hidden="true"></span><span class="lt-who"><small class="label">Thư của</small>${e(who)}</span></summary><p class="lt-body">${e(L[k])}</p></details>` : '';
  return section('moonletters', `<div class="wrap narrow">
    ${c.ui.head('Thư dưới trăng', 'Hai lá thư chưa gửi')}
    <div class="lt-wrap">${one('bride', c.data.bride.short || c.data.bride.name)}${one('groom', c.data.groom.short || c.data.groom.name)}</div>
  </div>`);
};

// --- Easter egg: ba lần chạm nốt chu sa ---
let eggEl = null;
const showEgg = (btn, c) => {
  eggEl?.remove();
  const mo = c.motion, e = c.esc, nick = k => c.p.get(`traits.${k}.nickname`, '');
  const nb_ = nick('bride'), ng = nick('groom'), joke = c.p.get('insideJoke');
  const d = document.createElement('div');
  d.className = 'egg'; d.setAttribute('role', 'status');
  d.innerHTML = `${nb_ || ng ? `<p class="egg-nick"><b>${e(nb_ || c.data.bride.short)}</b><svg viewBox="0 0 60 16" aria-hidden="true"><path d="M2 8C14 -2 22 18 30 8S48 -2 58 8"/><circle cx="30" cy="8" r="3"/></svg><b>${e(ng || c.data.groom.short)}</b></p>` : ''}${joke ? `<p class="egg-joke">${e(joke)}</p>` : ''}`;
  document.body.appendChild(d);
  requestAnimationFrame(() => d.classList.add('on'));
  mo.haptic('success'); mo.tone('chime');
  eggEl = d;
  const off = () => { d.classList.remove('on'); setTimeout(() => d.remove(), 500); removeEventListener('pointerdown', off, true); };
  setTimeout(() => addEventListener('pointerdown', off, true), 400);
  setTimeout(off, 7000);
};

// --- Finale sau RSVP: vầng trăng rằm, sợi chỉ đỏ buộc hai cái tên ---
const finale = (c, entry) => {
  const e = c.esc, yes = entry.attending !== false;
  document.querySelector('.mc-fin')?.remove();
  const f = document.createElement('div');
  f.className = 'mc-fin'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-label', 'Lời cảm ơn');
  f.innerHTML = `<div class="mf-box">
    <div class="mf-stage"><svg class="mf-svg" viewBox="0 0 300 340" aria-hidden="true">
      <circle class="mf-halo" cx="150" cy="74" r="62"/><circle class="mf-moon" cx="150" cy="74" r="44"/><circle class="mf-spot" cx="150" cy="74" r="7"/>
      <path class="mf-t t1" pathLength="1" d="M150 80C100 130 214 166 160 214S150 250 150 262"/>
      <path class="mf-t t2" pathLength="1" d="${bowPath(150, 262, 13)}"/>
      <path class="mf-t t3" pathLength="1" d="M150 262C138 282 100 288 56 280"/><path class="mf-t t3" pathLength="1" d="M150 262C162 282 200 288 244 280"/>
    </svg>
    <p class="mf-names"><span>${e(nb(c.data.bride.short || c.data.bride.name))}</span><span>${e(nb(c.data.groom.short || c.data.groom.name))}</span></p></div>
    <p class="mf-line">${yes ? `Hẹn gặp ${e(entry.name || c.guest)} dưới ánh trăng nhé.` : `Trăng vẫn sáng cho ${e(entry.name || c.guest)}. Cảm ơn bạn đã báo cho chúng mình.`}</p>
    <button class="btn mf-close" type="button">Đóng</button>
  </div>`;
  document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.add('on')));
  const mo = c.motion;
  mo.tone('whoosh'); mo.haptic('tap');
  if (!c.reduced) { setTimeout(() => { mo.tone('chime'); mo.haptic('success'); }, 2000); }
  const close = () => { f.classList.remove('on'); setTimeout(() => f.remove(), 600); };
  f.querySelector('.mf-close').addEventListener('click', close);
  f.addEventListener('click', ev => { if (ev.target === f) close(); });
  f.querySelector('.mf-close').focus({ preventScroll: true });
};
EA.onRsvp(entry => { const c = window.__mlCtx; if (c) finale(c, entry); });

// =====================================================================================================
// after render: add-ons, ongoing motion (waxing moon, tilt sheen, scroll-drawn thread), egg
// =====================================================================================================
EA.afterRender((c, main) => {
  const mo = c.motion;
  window.__mlCtx = c;
  document.documentElement.dataset.tier = mo.tier;

  const nodes = [twoMoons(c), redThread(c), moonWords(c), letters(c)];
  const [tm, rt, mw, lt] = nodes;
  if (tm) placeAfter(main, ['invitation', 'hero'], [tm]);
  if (rt) placeAfter(main, ['story', 'families'], [rt]);
  const tail = [mw, lt].filter(Boolean);
  if (tail.length) placeAfter(main, ['gallery', 'quote', 'faq', 'events'], tail);
  main.querySelectorAll('.addon').forEach(s => { if (!mo.reduced) { s.classList.add('reveal'); mo.inView(s, () => s.classList.add('in'), { threshold: .12 }); } else s.classList.add('in'); });

  // two moons: the thread between them draws when the panel appears
  const panel = main.querySelector('.mp-panel');
  if (panel) mo.inView(panel, () => panel.classList.add('lit'), { threshold: .35 });

  // red-thread timeline: the red fill follows the scroll, nodes turn red as it passes
  const ol = main.querySelector('.rt');
  if (ol) {
    const fill = ol.querySelector('.rt-fill'), lis = [...ol.querySelectorAll('li')];
    const upd = () => {
      const r = ol.getBoundingClientRect(), y = innerHeight * .62;
      const p = clamp((y - r.top) / Math.max(1, r.height));
      fill.style.transform = `scaleY(${mo.reduced ? 1 : p.toFixed(4)})`;
      lis.forEach(li => { const t = li.getBoundingClientRect().top + 14; li.classList.toggle('on', mo.reduced || t < y); });
    };
    let raf = 0; const tick = () => { raf = 0; upd(); };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(tick); }, { passive: true }); addEventListener('resize', upd); upd();
  }

  // waxing moon in the corner: new -> full as you read; the cinnabar dot lights at the end
  document.querySelector('.waxing')?.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="waxing" aria-hidden="true"><span class="wx"></span><i class="dot"></i></div>`);
  const w = document.querySelector('.waxing'), wx = w.querySelector('.wx');
  let last = -1;
  const phase = () => {
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max) : 1;
    const f = .04 + p * .46;
    if (Math.abs(f - last) > .004) { last = f; wx.innerHTML = moonSVG(Math.min(.5, f)); }
    w.classList.toggle('full', p > .985);
  };
  let wr = 0; addEventListener('scroll', () => { wr ||= requestAnimationFrame(() => { wr = 0; phase(); }); }, { passive: true }); phase();

  // moonlight shifts with tilt (pointer on desktop): the sheen on the hero moon and the halo behind it
  if (!mo.reduced && mo.tier !== 'low') {
    const root = document.documentElement;
    mo.tilt(({ x, y }) => { root.style.setProperty('--tx', x); root.style.setProperty('--ty', y); });
  }

  // easter egg: three taps on the cinnabar dot in the hero
  const dot = main.querySelector('.egg-dot');
  if (dot) { let n = 0, t0 = 0; dot.addEventListener('click', () => { const now = Date.now(); n = now - t0 < 1800 ? n + 1 : 1; t0 = now; mo.tone('pop'); mo.haptic('tap'); dot.classList.remove('pulse'); void dot.offsetWidth; dot.classList.add('pulse'); if (n >= 3) { n = 0; showEgg(dot, c); } }); }
});
