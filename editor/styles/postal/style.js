// Bưu Thiếp Thư Tay: một phong bì hàng không gửi riêng cho bạn.
// Cover: kéo con dấu lên phong bì -> dấu bưu điện (ngày + địa điểm) đóng "cạch" -> phong bì lật -> nắp mở -> thư trượt ra.
// Add-ons: bộ tem riêng, bưu thiếp từ những chuyến đi, hai lá thư tay + điện tín cầu hôn, hòm thư mở vào kỷ niệm một năm.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pad2 = n => String(n).padStart(2, '0');

// ---- small SVG art (all drawn here, no external images) ----
const ART = {
  book: '<path d="M8 12c8-4 16-4 24 1v26c-8-5-16-5-24-1z" fill="#fffaf0" stroke="currentColor" stroke-width="2"/><path d="M56 12c-8-4-16-4-24 1v26c8-5 16-5 24-1z" fill="#fffaf0" stroke="currentColor" stroke-width="2"/><path d="M13 20c5-1.5 10-1 15 1M13 27c5-1.5 10-1 15 1M36 21c5-2 10-2.500 15-1M36 28c5-2 10-2.500 15-1" stroke="currentColor" stroke-width="1.400" fill="none"/>',
  pin: '<path d="M32 50S14 34 14 22a18 18 0 0 1 36 0c0 12-18 28-18 28z" fill="currentColor" opacity=".9"/><circle cx="32" cy="22" r="6.500" fill="#fffaf0"/>',
  cat: '<path d="M14 46V22l9 7a22 22 0 0 1 18 0l9-7v24c0 5-8 8-18 8s-18-3-18-8z" fill="#fffaf0" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="25" cy="35" r="2.600" fill="currentColor"/><circle cx="39" cy="35" r="2.600" fill="currentColor"/><path d="M29 41l3 2.500 3-2.500M32 43.500v3M18 40l-8-1.500M18 44l-8 2M46 40l8-1.500M46 44l8 2" stroke="currentColor" stroke-width="1.600" fill="none" stroke-linecap="round"/>',
  paw: '<ellipse cx="32" cy="42" rx="12" ry="9" fill="currentColor"/><ellipse cx="17" cy="29" rx="5" ry="7" fill="currentColor"/><ellipse cx="27" cy="20" rx="5" ry="7.500" fill="currentColor"/><ellipse cx="38" cy="20" rx="5" ry="7.500" fill="currentColor"/><ellipse cx="48" cy="29" rx="5" ry="7" fill="currentColor"/>',
  umbrella: '<path d="M8 32a24 24 0 0 1 48 0c-4-4-8-4-12 0-4-4-8-4-12 0-4-4-8-4-12 0-4-4-8-4-12 0z" fill="currentColor"/><path d="M32 32v18a5 5 0 0 1-10 0" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/>',
  home: '<path d="M10 32L32 12l22 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M16 29v22h32V29" fill="#fffaf0" stroke="currentColor" stroke-width="2.600" stroke-linejoin="round"/><rect x="28" y="38" width="8" height="13" fill="currentColor"/>',
  plane: '<path d="M4 31L58 6 40 56 30 38z" fill="#fffaf0" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round"/><path d="M58 6L30 38l-2 14 7-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  heart: '<path d="M32 52S10 38 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 14-22 28-22 28z" fill="currentColor"/>',
  mount: '<path d="M0 52L20 18l12 18 8-11 24 27z" fill="currentColor" opacity=".9"/><circle cx="48" cy="14" r="6" fill="#fffaf0"/>',
  wave: '<path d="M0 36c8-8 16-8 24 0s16 8 24 0 12-6 16-3v22H0z" fill="currentColor" opacity=".9"/><path d="M0 28c8-8 16-8 24 0s16 8 24 0 12-6 16-3" fill="none" stroke="#fffaf0" stroke-width="2"/><circle cx="46" cy="14" r="6" fill="#fffaf0"/>',
  sun: '<circle cx="32" cy="32" r="12" fill="currentColor"/><g stroke="currentColor" stroke-width="2.600" stroke-linecap="round"><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.500 13.500l5 5M45.500 45.500l5 5M13.500 50.500l5-5M45.500 18.500l5-5"/></g>',
  pine: '<path d="M32 6l14 20H38l12 18H36l6 14H22l6-14H14l12-18H18z" fill="currentColor" opacity=".9"/>',
  pagoda: '<path d="M32 6l6 8H26zM18 24l14-8 14 8zM10 40l22-12 22 12zM12 40v14h40V40" fill="currentColor" opacity=".9"/><rect x="26" y="44" width="12" height="10" fill="#fffaf0"/>'
};
const art = (k, cls = '') => `<svg class="art ${cls}" viewBox="0 0 64 64" aria-hidden="true">${ART[k] || ART.pin}</svg>`;
const SCENES = ['mount', 'wave', 'pine', 'pagoda', 'sun'];
const sceneOf = (name, i) => /thư viện|trường/i.test(name) ? 'book' : /biển|quy nhơn|nha trang|đà nẵng|vũng tàu|phú quốc|hạ long/i.test(name) ? 'wave' : /đà lạt|sa pa|mộc châu|tam đảo/i.test(name) ? 'pine' : /hội an|huế|hà nội|ninh bình/i.test(name) ? 'pagoda' : SCENES[i % 5];

// ---- the venue shown in the postmark: the evening party, else the last event ----
const venueOf = c => {
  const ev = c.data.events.find(x => /tiệc/i.test(x.title)) || c.data.events[c.data.events.length - 1] || {};
  return { place: ev.place || c.config.couple.city || '', time: ev.time || '' };
};
const cityOf = c => (c.config.couple.city || '').replace(/^TP\.?\s*/i, 'TP. ');

// postmark: double ring, city on the upper arc, venue on the lower arc, date in the middle
function postmarkSVG(c, id, o = {}) {
  const e = c.esc, v = venueOf(c);
  const top = e(cityOf(c).toUpperCase()), bot = e((o.bottom || v.place.replace(/^(Trung tâm|Nhà hàng|Khách sạn|Tư gia)\s+/i, '')).toUpperCase().slice(0, 24));
  return `<svg class="pm-svg" viewBox="0 0 160 160" aria-hidden="true">
    <defs><path id="${id}t" d="M22 82a58 58 0 0 1 116 0"/><path id="${id}b" d="M18 78a62 62 0 0 0 124 0"/></defs>
    <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="80" cy="80" r="43" fill="none" stroke="currentColor" stroke-width="1.600"/>
    <text font-size="10.500" font-weight="500" letter-spacing="1.200" fill="currentColor"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${top}</textPath></text>
    <text font-size="10.500" font-weight="500" letter-spacing="1.200" fill="currentColor"><textPath href="#${id}b" startOffset="50%" text-anchor="middle" dominant-baseline="hanging">${bot}</textPath></text>
    <text x="80" y="74" text-anchor="middle" font-size="13" font-weight="500" fill="currentColor">${o.l1 || `${c.d} · ${c.m}`}</text>
    <text x="80" y="95" text-anchor="middle" font-size="19" font-weight="500" fill="currentColor">${o.l2 || c.y}</text>
  </svg>`;
}

// the stamp: perforated, with the couple's monogram and a tiny house
const stampSVG = (c, big) => `<div class="tem-face${big ? ' big' : ''}">
  <span class="t-top">THƯ MỜI</span>${art('heart', 't-heart')}<b class="t-val">${c.d}.${c.m}</b></div>`;

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  el.className = 'cover po-cover';
  el.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="po-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></svg>
    <div class="po-light" aria-hidden="true"></div>
    <div class="po-stage">
      <p class="po-hello">Một lá thư gửi riêng cho bạn</p>
      <div class="po-tilt"><div class="po-env">
        <div class="po-face po-front">
          <div class="po-rim" aria-hidden="true"></div>
          <p class="po-from"><small>Người gửi</small>${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
          <button class="po-stamp" type="button" aria-label="Con tem của hai bạn">${stampSVG(c)}</button>
          <div class="po-target" aria-hidden="true"><i></i></div>
          <div class="po-mark" aria-hidden="true">${postmarkSVG(c, 'cv')}</div>
          <div class="po-addr"><small>Kính gửi</small><p class="po-name">${e(c.guest)}</p><i></i><i></i></div>
          <p class="po-air">Thư hàng không · Thư mời</p>
        </div>
        <div class="po-face po-rear" aria-hidden="true">
          <div class="po-rim"></div>
          <div class="po-in">
            <div class="po-lining"></div>
            <div class="po-letter">
              <p class="l-to">Gửi ${e(c.guest)},</p>
              <p class="l-t">Một lời mời từ chúng mình</p>
              <p class="l-n">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
              <p class="l-d">${c.dow} · ${c.d}.${c.m}.${c.y}</p>
            </div>
            <div class="po-pocket"></div>
            <div class="po-flap"><i class="ff"></i><i class="fb"></i><span class="po-seal"><i class="sh l"><b>${e(D.monogram.replace(/\s*&\s*/, '·'))}</b></i><i class="sh r"><b>${e(D.monogram.replace(/\s*&\s*/, '·'))}</b></i></span></div>
          </div>
        </div>
      </div></div>
      <p class="po-tip" hidden></p>
      <div class="po-tool-wrap">
        <p class="po-hint">Kéo con dấu lên phong bì để đóng dấu bưu điện</p>
        <button class="po-tool" type="button" aria-label="Con dấu bưu điện. Kéo lên phong bì, hoặc bấm để đóng dấu">
          <svg viewBox="0 0 90 130" aria-hidden="true">
            <defs><linearGradient id="pwood" x1="0" x2="1"><stop offset="0" stop-color="#7a3f1f"/><stop offset=".45" stop-color="#b8683a"/><stop offset="1" stop-color="#6a3519"/></linearGradient>
              <linearGradient id="pbrass" x1="0" x2="1"><stop offset="0" stop-color="#8a6a2a"/><stop offset=".5" stop-color="#e8cf8a"/><stop offset="1" stop-color="#8a6a2a"/></linearGradient></defs>
            <ellipse cx="45" cy="125" rx="34" ry="4" fill="rgba(0,0,0,.18)"/>
            <path d="M33 4h24c8 0 10 10 4 16l-4 4v10H33V24l-4-4c-6-6-4-16 4-16z" fill="url(#pwood)"/>
            <rect x="30" y="38" width="30" height="8" rx="2" fill="url(#pbrass)"/>
            <path d="M36 46h18v30H36z" fill="url(#pwood)"/>
            <rect x="12" y="78" width="66" height="14" rx="3" fill="url(#pbrass)"/>
            <rect x="14" y="92" width="62" height="22" rx="4" fill="#1d2a52"/>
            <circle cx="45" cy="103" r="7.500" fill="none" stroke="#6f86c4" stroke-width="1.600"/>
          </svg>
        </button>
        <button class="open-btn" type="button">Đóng dấu &amp; mở thư</button>
      </div>
    </div>`;

  const $ = s => el.querySelector(s);
  const env = $('.po-env'), tool = $('.po-tool'), tip = $('.po-tip'), hint = $('.po-hint');
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  let locked = false, ended = false, started = false, tp = 0;
  const wait = ms => new Promise(r => c.after(ms, r));
  const setTool = p => { tp = clamp(p); el.style.setProperty('--tp', tp.toFixed(3)); };
  setTool(0);
  // where the stamp has to travel: from its resting place onto the dashed target ring
  const measure = () => {
    const tg = $('.po-target').getBoundingClientRect(), tr = tool.getBoundingClientRect();
    if (!tg.width || !tr.width) return;
    const sv = tool.querySelector('svg').getBoundingClientRect(), prog = tp;
    // undo the current transform contribution so the numbers are for p = 0
    const dx = parseFloat(el.style.getPropertyValue('--dx')) || 0, dy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
    const rx = sv.left + sv.width / 2 - prog * dx, ry = sv.top + sv.height * .84 - prog * dy;
    el.style.setProperty('--dx', (tg.left + tg.width / 2 - rx).toFixed(1) + 'px');
    el.style.setProperty('--dy', (tg.top + tg.height / 2 - ry).toFixed(1) + 'px');
  };
  requestAnimationFrame(measure); addEventListener('resize', measure); stops.push(() => removeEventListener('resize', measure));
  const begin = () => { if (started) return; started = true; EA.music(); M.requestTilt(); hint.classList.add('gone'); };

  // ---- ambient: the envelope floats with the phone, the stamp wobbles ----
  if (M.tier !== 'low' && !M.reduced) {
    const off = M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } });
    stops.push(off);
  }

  // ---- easter egg: ba lần chạm vào con tem -> biệt danh của hai người ----
  let taps = 0, last = 0, tipTimer = 0;
  $('.po-stamp').addEventListener('click', () => {
    if (locked) return;
    M.tone('pop'); M.haptic('tap');
    const now = Date.now(); taps = now - last < 1800 ? taps + 1 : 1; last = now;
    $('.po-stamp').classList.remove('peel'); void $('.po-stamp').offsetWidth; $('.po-stamp').classList.add('peel');
    if (taps < 3) return;
    taps = 0;
    const a = nick('bride'), b = nick('groom');
    const line = a && b ? `${a} và ${b}` : c.p.get('insideJoke', 'Con tem này chỉ có một chiếc trên đời.');
    tip.innerHTML = `${c.icon('heart')}<span>${e(line)}</span>`;
    tip.hidden = false; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
    M.tone('chime'); M.haptic('success');
    clearTimeout(tipTimer); tipTimer = setTimeout(() => { tip.hidden = true; }, 3200);
  });

  // ---- the gesture: kéo con dấu lên phong bì ----
  const dist = () => Math.max(120, Math.min(260, tool.getBoundingClientRect().top - env.getBoundingClientRect().bottom + 40));
  let lastTick = 0;
  M.drag(tool, {
    axis: 'y', invert: true, distance: 190,
    onMove: p => {
      if (locked) return; begin(); setTool(p);
      const k = Math.floor(p * 4); if (k !== lastTick) { lastTick = k; if (k > 0 && k < 4) M.haptic('tap'); }
    },
    onEnd: p => {
      if (locked) return;
      if (p < .08) return play();                     // a plain tap on the stamp also works
      if (p >= .55) play(); else M.tween(tp, 0, 420, 'out', setTool);
    }
  });
  tool.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); play(); } });
  $('.open-btn').addEventListener('click', () => { play(); }, { once: true });

  // ---- 1. đóng dấu  2. lật phong bì  3. nắp mở  4. thư trượt ra  5. thư ra giữa trang ----
  async function play() {
    if (locked || ended) return;
    locked = true; begin();
    el.classList.add('busy');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    await M.tween(tp, 1, 380 * (1 - tp) + 120, 'inOut', setTool);
    if (ended) return;
    // contact: the stamp presses, ink spreads, the whole desk jolts
    el.classList.add('press');
    await wait(90);
    M.tone('thud'); M.haptic('thud');
    el.classList.add('stamped', 'jolt');
    await wait(760);
    el.classList.add('lift');
    await wait(260);
    // flip to the back
    M.tone('whoosh');
    el.classList.add('flip');
    await wait(880);
    // the seal cracks, the flap opens
    M.tone('click'); M.haptic('crack');
    el.classList.add('crack');
    await wait(200);
    el.classList.add('flap');
    await wait(60);
    // the letter slides out while the flap finishes opening
    M.tone('whoosh');
    el.classList.add('rise');
    await wait(1300);
    M.tone('chime'); M.haptic('success');
    el.classList.add('show');
    await wait(900);
    open();
  }
});

// =============================================================================================
// layouts: postcards and a postal route
// =============================================================================================
EA.section('events', ({ data: D, esc: e, ui, d, m, icon }) => `<div class="wrap">
  ${ui.head('Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi')}
  <div class="cards">
    ${D.events.map((ev, i) => `
      <article class="postcard" style="--i:${i}">
        <div class="msg">
          <p class="label">${e(ev.label)}</p>
          <h3>${e(ev.title)}</h3>
          <p class="hand">Hẹn gặp bạn lúc ${e(ev.time)} nhé!</p>
          ${ui.actions(ev)}
        </div>
        <div class="to-side">
          <div class="pc-stamp"><b>${e(ev.time)}</b><small>${d}.${m}</small></div>
          <p class="line">${e(ev.place)}</p>
          <p class="line">${e(ev.address)}</p>
          <span class="pc-mark" aria-hidden="true"><b>${d}.${m}</b><i>${e(ev.time)}</i></span>
        </div>
      </article>`).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Lịch trình', 'Hành trình một ngày')}
  <ol class="route">
    ${D.itinerary.map(it => `<li><span class="pm">${e(it.time)}</span><strong>${e(it.title)}</strong><span class="n">${e(it.note)}</span></li>`).join('')}
  </ol>
</div>`);

EA.section('letter', ({ data: D, esc: e, guest, dateText, t, config }) => `<div class="wrap narrow">
  <div class="typed">
    <p class="dateline">${e(config.couple.city || '')}, ${dateText}</p>
    <p class="salute">Gửi ${e(guest)} thân mến,</p>
    ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
    <p class="highlight">${t(D.letterHighlight)}</p>
    ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
    <p class="sign">Thân mến,<br><span class="names">${e(D.bride.short)} <span class="amp">&amp;</span> ${e(D.groom.short)}</span></p>
    <span class="wax" aria-hidden="true">${EA.icon('heart')}</span>
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui, d, m }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Bưu ảnh của chúng mình')}
  <div class="postcards">
    ${D.photos.map((p, i) => ui.photo(p, i, `<span class="pmark" aria-hidden="true">${d}.${m}<br>số ${i + 1}</span>`)).join('')}
  </div>
</div>`);

EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Hộp thư', 'Hộp thư giải đáp')}
  ${D.faq.map((f, i) => `<article class="mail"><p class="mail-no">Thư số ${i + 1}</p><h3>${e(f.q)}</h3><p>${e(f.a)}</p></article>`).join('')}
</div>`);

EA.section('contact', ({ data: D, esc: e, ui, icon }) => `<div class="wrap">
  ${ui.head('Liên lạc', 'Địa chỉ liên lạc')}
  <div class="labels">
    ${[['Cô dâu', D.bride], ['Chú rể', D.groom]].map(([r, p]) => `
      <div class="addr-label"><small>${r}</small><p>${e(p.name)}</p><a class="btn" href="tel:${e(p.phone.replace(/\s/g, ''))}">${p.phone ? e(p.phone) : 'Gọi điện'}</a></div>`).join('')}
  </div>
</div>`);

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="big-postcard">
    <div class="bp-img"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
    <div class="bp-back">
      <div class="pc-stamp"><b>${c.d}.${c.m}</b><small>${c.y}</small></div>
      <p class="label">Thư từ ${e(cp.city)}</p>
      <h1 class="couple"><span>${e(cp.brideName.replace(' ', ' '))}</span><span class="amp">&amp;</span><span>${e(cp.groomName.replace(' ', ' '))}</span></h1>
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="bp-pm">${c.dow} · ${c.dateText}</p>
    </div>
  </div>
  ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Bộ tem kỷ niệm')}
  <div class="stamps">
    ${(mod.content.chapters || []).map(ch => `
      <article class="big-stamp">
        <div class="bs-img">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}<span class="bs-date">${e(ch.date)}</span></div>
        <h3>${e(ch.title)}</h3>
        <p>${e(ch.text)}</p>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui, esc: e, config }) => `<div class="wrap">
  ${ui.head('Hồi âm', 'Bưu thiếp hồi âm')}
  <div class="reply-card">
    <div class="rc-left">${ui.rsvpForm()}</div>
    <div class="rc-right" aria-hidden="true">
      <div class="pc-stamp"><b>Trả lời</b><small>có cước</small></div>
      <p class="line">${e(config.couple.brideShortName)} &amp; ${e(config.couple.groomShortName)}</p>
      <p class="line">${e(config.couple.city)}</p>
      <p class="airmail-tag">Thư hàng không</p>
    </div>
  </div>
</div>`);

// =============================================================================================
// after render: personality add-ons, postmarks that land on scroll, plane, finale
// =============================================================================================
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const adds = [];
  const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}.${m[2]}.${m[1]}` : `${m[2]}.${m[1]}`) : ''; };
  const short = k => D[k].short || D[k].name;
  const nick = k => P.get(`traits.${k}.nickname`, '');

  // --- 1. Bộ tem riêng của hai người ---
  const tems = [];
  if (P.has('metDate') || P.has('metPlace')) tems.push(['book', P.has('metDate') ? dmy(P.get('metDate')) : 'Lần đầu', 'Nơi gặp nhau', P.get('metPlace', P.get('metCity', ''))]);
  const hs = P.get('hometowns', {});
  if (hs.bride) tems.push(['home', short('bride'), 'Quê nhà', hs.bride]);
  if (hs.groom) tems.push(['home', short('groom'), 'Quê nhà', hs.groom]);
  if (P.has('pet.name')) tems.push([P.get('pet.kind', '') === 'mèo' ? 'cat' : 'paw', P.get('pet.name'), P.get('pet.kind', 'thú cưng'), 'Thành viên thứ ba']);
  if (P.has('insideJoke')) tems.push(['umbrella', 'Bí mật', 'Chuyện riêng', 'Bấm giữ để nghe kể']);
  if (tems.length >= 2) {
    adds.push(['tem', 'story', `<div class="wrap">
      <header class="head"><p class="eyebrow">Bộ tem của riêng chúng mình</p><h2 class="title">Mỗi kỷ niệm một con tem</h2></header>
      <div class="sheet">
        ${tems.map(([k, v, l, s], i) => `<figure class="tem${k === 'umbrella' ? ' secret' : ''}" style="--i:${i}"${k === 'umbrella' ? ' tabindex="0" role="button" aria-label="Chuyện riêng của hai bạn. Bấm giữ để đọc"' : ''}>
          <div class="tem-in">${art(k)}<b>${e(v)}</b></div>
          <figcaption><span>${e(l)}</span>${e(s)}</figcaption></figure>`).join('')}
      </div>
      <p class="sheet-note">Cả bộ chỉ phát hành một lần, ngày ${c.d}.${c.m}.${c.y}.</p>
      <p class="joke" hidden></p>
    </div>`]);
  }

  // --- 2. Bưu thiếp từ những chuyến đi ---
  const places = P.get('places', []);
  if (places.length >= 2) {
    adds.push(['trips', 'tem', `<div class="wrap">
      <header class="head"><p class="eyebrow">Bưu thiếp từ những chuyến đi</p><h2 class="title">Mình đã cùng nhau đi qua</h2><p class="sub">Chạm vào bưu thiếp để lật mặt sau.</p></header>
      <div class="trips">
        ${places.map((pl, i) => {
          const prev = places[i - 1], km = prev ? Math.round(P.kmBetween(prev, pl) / 10) * 10 : 0;
          const back = i === 0 ? 'Nơi mọi chuyện bắt đầu.' : `Cách chặng trước khoảng ${fmt(km)} km.`;
          return `<button class="trip" type="button" style="--i:${i}" aria-label="Bưu thiếp ${e(pl.name)}. Chạm để lật">
            <span class="trip-in">
              <span class="tf front"><span class="scene s${i % 5}">${art(sceneOf(pl.name, i))}</span><b class="tn">${e(pl.name)}</b><span class="pm-s" aria-hidden="true"><i>${e(dmy(pl.date || ''))}</i></span></span>
              <span class="tf back"><span class="tb-stamp">${art('plane')}</span><span class="tb-l">${e(dmy(pl.date || ''))}</span><span class="tb-m">${e(back)}</span><span class="tb-s">${e(short('bride'))} &amp; ${e(short('groom'))}</span></span>
            </span></button>`;
        }).join('')}
      </div>
    </div>`]);
  }

  // --- 3. Thư tay + điện tín cầu hôn ---
  const lt = P.get('letters', {});
  if (lt.bride || lt.groom || P.has('proposal')) {
    adds.push(['hand', 'quote', `<div class="wrap">
      <header class="head"><p class="eyebrow">Thư tay</p><h2 class="title">Những lá thư chưa gửi đi</h2></header>
      ${lt.bride || lt.groom ? `<div class="notes">
        ${['bride', 'groom'].filter(k => lt[k]).map((k, i) => `<article class="note ${k}" style="--r:${i ? 1.2 : -1.2}deg">
          <p class="n-body">${e(lt[k])}</p><p class="n-sign">${e(nick(k) || short(k))}</p></article>`).join('')}
      </div>` : ''}
      ${P.has('proposal') ? `<div class="tele" role="note"><p class="tele-h">Điện tín · Lời cầu hôn</p><p class="tele-b">${e(P.get('proposal'))}</p></div>` : ''}
      ${P.has('quote.text') ? `<p class="hq">“${e(P.get('quote.text'))}”<small>${e(P.get('quote.author', ''))}</small></p>` : ''}
    </div>`]);
  }

  // --- 4. Hòm thư mở vào kỷ niệm một năm ---
  const y1 = `${c.d}.${c.m}.${+c.y + 1}`;
  adds.push(['future', 'guestbook', `<div class="wrap narrow">
    <header class="head"><p class="eyebrow">Hòm thư tương lai</p><h2 class="title">Viết một lá thư, mở vào ngày ${y1}</h2>
      <p class="sub">Khi tròn một năm, chúng mình sẽ cùng mở hòm thư này. Để lại vài dòng cho ngày ấy nhé.</p></header>
    <div class="fut">
      <div class="box" aria-hidden="true"><svg viewBox="0 0 120 100"><rect x="14" y="30" width="92" height="62" rx="4" class="bx"/><path d="M20 30a40 40 0 0 1 80 0z" class="bt"/><rect x="42" y="42" width="36" height="6" rx="2" class="bs"/></svg><span class="fl"></span></div>
      <form class="fut-form" novalidate>
        <label class="field"><span>Tên của bạn</span><input name="name" maxlength="60" autocomplete="name" value="${c.guest === (D.defaultGuest || 'Quý khách') ? '' : e(c.guest)}"></label>
        <label class="field"><span>Lá thư gửi tương lai</span><textarea name="msg" rows="3" maxlength="400" placeholder="Một năm nữa, mong hai bạn vẫn…"></textarea></label>
        <p class="form-error" role="alert" hidden></p>
        <button class="btn" type="submit">Niêm phong &amp; gửi vào hòm thư</button>
        <p class="fut-count fine" aria-live="polite"></p>
      </form>
    </div>
  </div>`]);

  // insert after the named anchor section (or at the end)
  const place = {};
  adds.forEach(([id, after, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} po-add`; s.innerHTML = html;
    const prev = place[after] || main.querySelector(`#${after}`) || main.lastElementChild;
    prev.insertAdjacentElement('afterend', s); place[id] = s;
  });

  // tem sheet: stamps pop in one by one; hold the secret stamp to read the inside joke
  const sheet = main.querySelector('#tem .sheet');
  if (sheet) {
    M.inView(sheet, () => sheet.classList.add('on'), { threshold: .25 });
    const sec = main.querySelector('#tem .secret'), jk = main.querySelector('#tem .joke');
    if (sec && jk) M.hold(sec, 1100, {
      onProgress: p => sec.style.setProperty('--hp', p),
      onDone: () => { jk.textContent = P.get('insideJoke'); jk.hidden = false; M.tone('chime'); M.haptic('success'); sec.style.setProperty('--hp', 0); }
    });
  }
  // postcards flip
  main.querySelectorAll('.trip').forEach(b => b.addEventListener('click', () => { b.classList.toggle('flipped'); M.tone('click'); M.haptic('tap'); }));
  const trips = main.querySelector('#trips .trips');
  if (trips) M.inView(trips, () => trips.classList.add('on'), { threshold: .15 });
  main.querySelectorAll('#hand .note, #hand .tele').forEach(n => M.inView(n, () => n.classList.add('on'), { threshold: .3 }));

  // the future mailbox
  const ff = main.querySelector('#future form');
  if (ff) {
    const countEl = ff.querySelector('.fut-count');
    const upd = async () => { const l = await EA.shared.list('future-letter'); countEl.textContent = l.length ? `${l.length} lá thư đang chờ ngày ${y1}.` : ''; };
    upd();
    ff.addEventListener('submit', async ev => {
      ev.preventDefault();
      const name = ff.elements.name.value.trim(), msg = ff.elements.msg.value.trim(), er = ff.querySelector('.form-error');
      if (!name || !msg) { er.textContent = 'Điền tên và vài dòng thư giúp chúng mình nhé.'; er.hidden = false; return; }
      er.hidden = true;
      await EA.shared.add('future-letter', { name, msg });
      const fut = ff.closest('.fut');
      fut.classList.add('sealed'); M.tone('thud'); M.haptic('success');
      ff.elements.msg.value = '';
      setTimeout(() => fut.classList.remove('sealed'), 3200);
      upd();
    });
  }

  // postcards get a postmark as they scroll in
  if (!M.reduced) main.querySelectorAll('.postcard').forEach(p => M.inView(p, () => setTimeout(() => p.classList.add('marked'), 350 + (+p.style.getPropertyValue('--i') || 0) * 160), { threshold: .5 }));
  else main.querySelectorAll('.postcard').forEach(p => p.classList.add('marked'));

  // the route line draws itself as you scroll
  const rt = main.querySelector('.route');
  if (rt && !M.reduced) M.scrollProgress(rt, p => rt.style.setProperty('--rp', clamp((p - .2) / .45).toFixed(3)));
  else rt?.style.setProperty('--rp', 1);

  // stamps wobble slightly with the phone
  if (M.tier !== 'low' && !M.reduced) M.tilt(({ x, y }) => { const s = document.documentElement.style; s.setProperty('--wx', x); s.setProperty('--wy', y); });

  // a paper plane flies the route from the groom's home to the bride's
  const host = main.querySelector('.m-hero .wrap');
  if (host) {
    const plane = M.reduced ? '<g transform="translate(330 44)"><path class="pl" d="M-11 0L11-7 5 9-1 3z"/></g>' :
      '<g><path class="pl" d="M-11 0L11-7 5 9-1 3z"/><animateMotion dur="8s" repeatCount="indefinite" rotate="auto"><mpath href="#air-route"/></animateMotion></g>';
    host.insertAdjacentHTML('afterbegin', `<svg class="air" viewBox="0 0 400 112" aria-hidden="true">
      <path id="air-route" d="M40 90 C110 10 290 10 360 80" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 7"/>
      <circle cx="40" cy="90" r="6"/><circle cx="360" cy="80" r="6"/>
      <text x="40" y="108" text-anchor="middle" class="lbl">Nhà trai</text><text x="360" y="100" text-anchor="middle" class="lbl">Nhà gái</text>
      ${plane}</svg>`);
  }

  // finale: sau RSVP, dấu "ĐÃ NHẬN" đóng xuống tấm bưu thiếp hồi âm
  EA.onRsvp(() => {
    M.tone('thud'); M.haptic('thud');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const card = f.closest('.reply-card'), done = f.nextElementSibling;
        if (!card || !f.hidden || card.querySelector('.recv')) return;
        card.insertAdjacentHTML('beforeend', `<div class="recv" aria-hidden="true">${postmarkSVG(c, 'rc', { l1: 'ĐÃ NHẬN', l2: `${c.d}.${c.m}`, bottom: 'Cảm ơn bạn' })}</div>`);
        card.classList.add('received');
        done?.scrollIntoView?.({ block: 'nearest', behavior: M.reduced ? 'auto' : 'smooth' });
        setTimeout(() => { M.tone('chime'); }, 500);
      });
    }, 30);
  });
});
