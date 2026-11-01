// Cổ trang hoàng triều: một cuộn thánh chỉ khép hờ; kéo hai đầu trục ra, núi non thuỷ mặc hiện dần, rồi ấn son đóng xuống.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : ''; };
const ym = s => { const m = String(s).match(/^(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : ''; };
const NUMS = ['nhất', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy', 'tám'];
const RANKS = ['nhất phẩm', 'nhị phẩm', 'tam phẩm', 'tứ phẩm', 'ngũ phẩm'];
const TITLES = ['Thượng khách', 'Quý nhân', 'Đại phu', 'Hiền sĩ', 'Tri kỷ'];
const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };

const INK_HILLS = `<svg class="hills" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true">
  <path class="h1" d="M0 150 C60 110 90 60 140 90 C190 120 210 40 270 70 C330 100 360 150 420 110 C480 70 520 100 600 80 L600 220 L0 220Z" fill="rgba(28,26,23,.10)"/>
  <path class="h2" d="M0 180 C80 130 130 150 190 120 C250 90 300 160 360 140 C430 118 470 90 540 130 C570 145 590 150 600 150 L600 220 L0 220Z" fill="rgba(28,26,23,.18)"/>
  <path class="h3" d="M0 205 C100 175 160 200 240 180 C320 160 380 200 460 185 C520 175 560 190 600 185 L600 220 L0 220Z" fill="rgba(28,26,23,.28)"/>
</svg>`;
// núi thuỷ mặc trên mặt giấy: ba lớp hiện dần từ dưới lên theo tiến độ mở cuộn
const MTN = `<svg class="mtn" viewBox="0 0 600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs><filter id="anb"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
  <path class="q1" filter="url(#anb)" d="M-20 210 C40 150 70 120 120 140 C160 156 180 90 240 70 C290 54 310 110 350 120 C400 132 430 80 480 96 C530 112 560 150 620 130 L620 300 L-20 300Z" fill="rgba(28,26,23,.14)"/>
  <path class="q2" filter="url(#anb)" d="M-20 250 C50 200 110 190 170 214 C230 238 250 160 320 150 C380 142 400 200 460 196 C520 192 560 170 620 190 L620 300 L-20 300Z" fill="rgba(28,26,23,.24)"/>
  <path class="q3" d="M-20 288 C70 262 150 270 230 276 C320 282 360 250 430 258 C500 266 560 270 620 262 L620 300 L-20 300Z" fill="rgba(28,26,23,.36)"/>
  <g class="q3" fill="none" stroke="rgba(28,26,23,.5)" stroke-width="1.4" stroke-linecap="round"><path d="M96 276 v-20 m-6 8 l6 -8 l6 8 m-10 -2 l4 -6 l4 6"/><path d="M168 280 v-16 m-5 6 l5 -7 l5 7"/></g>
</svg>`;
const CHEV = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

const toast = (host, txt, ms = 4200) => {
  host.querySelectorAll('.an-chip').forEach(x => x.remove());
  const t = document.createElement('p'); t.className = 'an-chip'; t.setAttribute('role', 'status'); t.textContent = txt; host.appendChild(t);
  setTimeout(() => t.remove(), ms);
};
// Ba lần chạm vào chữ hỷ / mặt trời: phong hiệu hoàng gia theo biệt danh
const eggText = c => {
  const nb = c.p.get('traits.bride.nickname'), ng = c.p.get('traits.groom.nickname');
  return nb || ng ? `Phong: ${ng ? `Hoàng thượng “${ng}”` : c.data.groom.short}, ${nb ? `Hoàng hậu “${nb}”` : c.data.bride.short}. Trăm năm hảo hợp.` : 'Chiếu viết: trăm năm hảo hợp, vạn sự hanh thông.';
};
const eggTap = (el, onHit) => {
  if (!el) return;
  let n = 0, last = 0;
  el.addEventListener('click', () => { const t = Date.now(); n = t - last < 1800 ? n + 1 : 1; last = t; if (n >= 3) { n = 0; onHit(); } });
};

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const stops = []; let ended = false, locked = false, musicOn = false;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const nm = s => e(s).replace(' ', '&nbsp;');
  el.classList.add('an-cover');
  el.innerHTML = `
    <div class="an-sky" aria-hidden="true"><i class="mist m1"></i><i class="mist m2"></i><i class="mist m3"></i><span class="cv-sun"></span></div>
    ${INK_HILLS}
    <div class="an-stage">
      <p class="an-to">Gửi ${e(c.guest)}</p>
      <div class="handscroll" role="group" aria-label="Thánh chỉ khép hờ. Kéo hai đầu trục ra hai bên để mở">
        <span class="roller l" aria-hidden="true"><i class="pull">${CHEV}</i></span>
        <div class="paper">
          <div class="paper-in">
            <svg class="grain" aria-hidden="true"><filter id="anp"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .34  0 0 0 0 .2  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#anp)"/></svg>
            <i class="band t" aria-hidden="true"></i><i class="band b" aria-hidden="true"></i>
            ${MTN}
            <div class="side l"><p class="sd-k">Kính gửi</p><p class="sd-v">${e(c.guest)}</p><p class="sd-t">Hôn lễ đã định, kính mời quang lâm chứng giám.</p></div>
            <div class="mid"><p class="han egg" aria-hidden="true">囍</p><p class="vnames" aria-hidden="true"><span>${nm(D.groom.name)}</span><i></i><span>${nm(D.bride.name)}</span></p></div>
            <div class="side r"><p class="sd-k">Ngày lành</p><p class="sd-v">${+c.d}<small> tháng ${+c.m}</small></p><p class="sd-t">Năm ${c.y}</p></div>
            <div class="stamp" aria-hidden="true"><span>囍</span><i class="ring"></i></div>
          </div>
        </div>
        <span class="roller r" aria-hidden="true"><i class="pull">${CHEV}</i></span>
      </div>
      <p class="an-cap"><b>${nm(D.groom.name)}</b> <i>&amp;</i> <b>${nm(D.bride.name)}</b></p>
      <p class="an-date">${c.dow} · ${c.dateText}</p>
      <p class="an-hint">Kéo hai đầu trục ra hai bên để mở thánh chỉ</p>
      <button class="open-btn" type="button">Mở thánh chỉ</button>
    </div>
    <div class="sparks" aria-hidden="true"></div>`;
  const $ = s => el.querySelector(s), hs = $('.handscroll'), P0 = .3;
  const S = { p: P0 };
  const setP = v => {
    S.p = clamp(v, P0, 1);
    const p = S.p, st = el.style;
    st.setProperty('--p', p.toFixed(4));
    st.setProperty('--q1', clamp((p - .38) / .4).toFixed(3)); st.setProperty('--q2', clamp((p - .5) / .4).toFixed(3)); st.setProperty('--q3', clamp((p - .62) / .34).toFixed(3));
    st.setProperty('--tx', clamp((p - .5) / .35).toFixed(3));
  };
  setP(P0);
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--ox', x); el.style.setProperty('--oy', y); } }));
  const begin = () => { if (musicOn) return; musicOn = true; EA.music(); M.requestTilt(); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  eggTap($('.egg'), () => { M.tone('chime'); M.haptic('success'); toast($('.an-stage'), eggText(c)); });

  let tick = 0, moved = false;
  M.drag(hs, {
    axis: 'x', distance: 1,
    onMove: (_p, dx) => {
      if (locked) return; if (Math.abs(dx) > 6) { moved = true; begin(); }
      if (!moved) return;
      const W = $('.paper-in').offsetWidth;
      setP(P0 + Math.abs(dx) / (W * .34) * (1 - P0));
      const k = Math.floor((S.p - P0) / (1 - P0) * 5); if (k !== tick) { tick = k; M.haptic('tap'); M.tone('click'); }
    },
    onEnd: () => {
      if (locked) return;
      if (!moved) { hs.classList.remove('nudge'); void hs.offsetWidth; hs.classList.add('nudge'); return; }
      moved = false;
      if (S.p >= .6) finish(); else M.tween(S.p, P0, 450, 'out', setP);
    }
  });
  $('.open-btn').addEventListener('click', () => { begin(); finish(); }, { once: true });

  const sparkBurst = () => {
    const host = $('.sparks'), st = $('.stamp').getBoundingClientRect(), n = Math.round(M.scale(22));
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'), a = Math.random() * 6.283, d = 50 + Math.random() * 90;
      s.style.cssText = `left:${st.left + st.width / 2}px;top:${st.top + st.height / 2}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 20}px;--s:${(.5 + Math.random() * 1.1).toFixed(2)}`;
      host.appendChild(s); setTimeout(() => s.remove(), 1200);
    }
  };
  async function finish() {
    if (locked || ended) return;
    locked = true; begin(); el.classList.add('busy');
    if (M.reduced) { setP(1); el.classList.add('stamped'); setTimeout(open, 700); return; }
    M.tone('whoosh'); M.haptic('tap');
    await M.tween(S.p, 1, 500 + 1000 * (1 - S.p), 'inOut', setP);
    if (ended) return;
    await wait(160);
    el.classList.add('stamping');
    await M.tween(0, 1, 280, 'out', v => { el.style.setProperty('--st', v.toFixed(3)); });
    if (ended) return;
    M.tone('thud'); M.haptic('thud');
    el.classList.add('stamped'); sparkBurst();
    await wait(520);
    M.tone('chime'); M.haptic('success');
    await wait(700);
    if (ended) return;
    el.classList.add('lift');
    await wait(420);
    if (ended) return;
    open();
    setTimeout(stopCover, 1200);
  }
});

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="an-hero">
    <div class="an-sun egg" aria-hidden="true"></div>
    <figure class="hanging"><span class="rod"></span><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><span class="rod"></span></figure>
    <h1 class="an-names"><span>${e(cp.groomName).replace(' ', '&nbsp;')}</span><span class="dot" aria-hidden="true"></span><span>${e(cp.brideName).replace(' ', '&nbsp;')}</span></h1>
    <div class="an-meta">
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="hero-date">${c.dow} · ${c.dateText}</p>
      ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
    <i class="mist hm1" aria-hidden="true"></i><i class="mist hm2" aria-hidden="true"></i>
    ${INK_HILLS}
  </div>
</div>`;
});

EA.section('families', ({ data: D, esc: e, mod }) => `<div class="wrap">
  <div class="two-clans">
    <div class="clan"><p class="v-title vert">Nhà trai</p><p>Ông ${e(D.groomFamily.father)}</p><p>Bà ${e(D.groomFamily.mother)}</p></div>
    <div class="clan-mid">
      <p class="big-hy" aria-hidden="true">囍</p>
      <p class="kicker">${e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}</p>
      <h2 class="couple"><span>${e(D.groom.name)}</span><span class="amp">&amp;</span><span>${e(D.bride.name)}</span></h2>
      <p class="note">${e(D.announceNote)}</p>
    </div>
    <div class="clan"><p class="v-title vert">Nhà gái</p><p>Ông ${e(D.brideFamily.father)}</p><p>Bà ${e(D.brideFamily.mother)}</p></div>
  </div>
</div>`);

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Truyện kể', 'Duyên phận của chúng mình')}
  <div class="chapters">
    ${(mod.content.chapters || []).map((ch, i) => `
      <article class="hoi">
        <p class="hoi-no vert" aria-hidden="true">Hồi thứ ${NUMS[i] || i + 1}</p>
        <div class="hoi-body">
          <p class="label">Hồi thứ ${NUMS[i] || i + 1} · ${e(ch.date)}</p>
          <h3>${e(ch.title)}</h3>
          <p>${e(ch.text)}</p>
        </div>
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
      </article>`).join('')}
  </div>
  ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Hỷ yến', 'Lễ thành hôn')}
  <div class="slips-set">
    ${D.events.map(ev => `
      <article class="slips">
        <div class="slat-row" aria-hidden="true">
          <span class="slat">${e(ev.title)}</span><span class="slat">Giờ ${e(ev.time)}</span><span class="slat">${e(ev.place)}</span>
        </div>
        <h3 class="sr-only">${e(ev.title)}</h3>
        <p class="slip-info">${ui.evDate(ev)}<br>${e(ev.place)} · ${e(ev.address)}</p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Hoạ quyển', 'Những bức tranh của chúng mình')}
  <div class="scrolls-wall">${D.photos.map((p, i) => `<div class="hang">${ui.photo(p, i)}</div>`).join('')}</div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Xin quý khách hồi âm')}
  <div class="red-letter"><div class="rl-inner">${ui.rsvpForm().replace('Gửi phản hồi', 'Gửi hồi âm')}</div></div>
</div>`);

const stampHTML = '<div class="stamp" aria-hidden="true"><span>囍</span><i class="ring"></i></div>';
const onEmptyTap = (main, fn) => main.addEventListener('click', ev => {
  if (ev.target.closest('a, button, input, select, textarea, label, summary, details, dialog, canvas, .photo, img, iframe, .egg, .letter-s, .an-add')) return;
  fn(ev.clientX, ev.pageY);
});
const fx = (() => { const l = document.createElement('div'); l.className = 'fx-layer'; l.setAttribute('aria-hidden', 'true'); document.body.appendChild(l); return l; })();

EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data, reduced = M.reduced;
  const nick = k => P.get(`traits.${k}.nickname`, '');

  // ---- tiêu đề được viết bằng cọ khi cuộn tới; chạm vào giấy trống, mực loang ----
  const heads = main.querySelectorAll('.title, .hoi-body h3, .an-names');
  if (reduced || !('IntersectionObserver' in window)) heads.forEach(h => h.classList.add('brushed'));
  else {
    // quan sát phần tử cha: clip-path trên chính nó làm vùng giao cắt bằng 0 nên sẽ không bao giờ kích hoạt
    const map = new Map();
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { map.get(en.target)?.classList.add('brushed'); io.unobserve(en.target); } }), { threshold: .5 });
    heads.forEach(h => { h.classList.add('brush'); map.set(h.parentElement, h); io.observe(h.parentElement); });
  }
  if (!reduced) onEmptyTap(main, (x, y) => {
    const b = document.createElement('span'); b.className = 'ink';
    b.style.cssText = `left:${x}px;top:${y}px;--s:${(.7 + Math.random() * .8).toFixed(2)};border-radius:${[1, 2, 3, 4].map(() => 40 + Math.random() * 20 | 0).join('% ')}%`;
    fx.appendChild(b); setTimeout(() => b.remove(), 3200);
  });

  // ---- hero: sương trôi giữa núi, núi lệch theo nghiêng máy / cuộn trang, tro vàng bay lên ----
  const hero = main.querySelector('.m-hero');
  if (hero && !reduced) {
    if (M.tier !== 'low') M.tilt(({ x, y }) => { hero.style.setProperty('--ox', x); hero.style.setProperty('--oy', y); });
    let raf = 0;
    const upd = () => { raf = 0; const r = hero.getBoundingClientRect(); hero.style.setProperty('--sy', clamp(-r.top / Math.max(1, r.height)).toFixed(3)); };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(upd); }, { passive: true }); upd();
    const cv = document.createElement('canvas'); cv.className = 'dust ea-mo-canvas'; cv.setAttribute('aria-hidden', 'true'); hero.querySelector('.an-hero').prepend(cv);
    M.particles(cv, {
      count: 38,
      init: (s, i, w, h) => { s.x = Math.random() * w; s.y = Math.random() * h; s.r = .8 + Math.random() * 1.8; s.v = .012 + Math.random() * .03; s.ph = Math.random() * 6.28; s.a = .25 + Math.random() * .5; },
      step: (s, dt) => { s.y -= s.v * dt; s.x += Math.sin(s.ph + s.y * .01) * .12; s.ph += dt * .0008; if (s.y < -6) { s.y = cv.clientHeight + 6; s.x = Math.random() * cv.clientWidth; } },
      draw: (g, s) => { g.globalAlpha = s.a; g.fillStyle = '#c9a45c'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.2832); g.fill(); g.globalAlpha = 1; }
    });
  }
  eggTap(main.querySelector('.an-sun'), () => { M.tone('chime'); M.haptic('success'); toast(main.querySelector('.an-hero'), eggText(c)); });

  // ---- add-on 1: Thánh chỉ (hôn thư viết bằng giọng cổ trang) ----
  const hs = P.get('hometowns', {}), tn = k => nick(k) ? ` (nhũ danh “${e(nick(k))}”)` : '';
  const adds = [];
  const hasDecree = P.has('metDate') || (hs.bride && hs.groom) || nick('bride') || nick('groom');
  if (hasDecree) {
    const n = P.daysTogether, md = P.get('metDate'), pl = P.get('metPlace');
    const who = (k, side) => `${e(D[k].name)}${tn(k)}${hs[k] ? `, người xứ ${e(hs[k])}` : ''}`;
    const lines = [
      `Nay có ${who('groom')}, cùng ${who('bride')}.`,
      md ? `Duyên khởi từ ngày ${dmy(md)}${pl ? `, tại ${e(pl)}` : ''}${n != null ? `; đến nay đã ${fmt(n)} ngày gắn bó, tình chẳng hề phai` : ''}.` : '',
      'Nay chuẩn cho kết tóc se duyên, trăm năm hảo hợp, bách niên giai lão. Khâm thử!'
    ].filter(Boolean);
    adds.push(['decree', 'families', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Thánh chỉ</p><h2 class="title">Chiếu thư ban hôn</h2></header>
      <article class="chieu"><i class="band t" aria-hidden="true"></i><i class="band b" aria-hidden="true"></i>
        <p class="ch-k">Phụng thiên thừa vận, Nguyệt Lão chiếu viết</p>
        ${lines.map(l => `<p class="ch-l">${l}</p>`).join('')}
        <p class="ch-d">Ngày ${+c.d} tháng ${+c.m} năm ${c.y}</p>
        ${stampHTML}
      </article></div>`]);
  }
  // ---- add-on 2: Sợi tơ hồng nối hai quê ----
  const hp = P.get('hometownPins', {});
  if (hp.bride && hp.groom && isFinite(hp.bride.lat) && isFinite(hp.groom.lat)) {
    const km = Math.round(P.kmBetween(hp.bride, hp.groom) / 10) * 10;
    const la = [hp.bride.lat, hp.groom.lat], lo = [hp.bride.lng, hp.groom.lng], cl = Math.cos((la[0] + la[1]) / 2 * Math.PI / 180);
    const dx = Math.max(Math.abs(lo[0] - lo[1]) * cl, .1), dy = Math.max(Math.abs(la[0] - la[1]), .1), k = Math.min(200 / dx, 150 / dy);
    const pos = q => [200 + (q.lng - (lo[0] + lo[1]) / 2) * cl * k, 100 - (q.lat - (la[0] + la[1]) / 2) * k];
    const A = pos(hp.bride), B = pos(hp.groom), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - 38;
    adds.push(['thread', 'story', `<div class="wrap">
      <header class="head"><p class="eyebrow">Nguyệt Lão se tơ</p><h2 class="title">${e(hs.bride || 'Quê em')} và ${e(hs.groom || 'quê anh')}, một sợi chỉ hồng</h2></header>
      <svg class="tho" viewBox="0 0 400 200" role="img" aria-label="Hai quê cách nhau ${fmt(km)} km, nối bằng một sợi tơ hồng">
        <path class="wash" d="M10 150 C70 120 110 140 170 120 C240 96 290 150 390 120 L390 200 L10 200Z"/>
        <path class="th" d="M${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}" pathLength="1" fill="none"/>
        <g class="knot" transform="translate(${((A[0] + B[0]) / 4 + mx / 2).toFixed(1)} ${((A[1] + B[1]) / 4 + my / 2).toFixed(1)})"><circle r="7" fill="#a4262c"/><path d="M-7 3 q-8 8 -4 14 M7 3 q8 8 4 14" stroke="#a4262c" stroke-width="2" fill="none" stroke-linecap="round"/></g>
        <circle class="pt a" cx="${A[0].toFixed(1)}" cy="${A[1].toFixed(1)}" r="6"/><circle class="pt b" cx="${B[0].toFixed(1)}" cy="${B[1].toFixed(1)}" r="6"/>
        <text x="${A[0].toFixed(1)}" y="${(A[1] + 24).toFixed(1)}" text-anchor="middle" class="tt">${e(hs.bride || D.bride.short)}</text>
        <text x="${B[0].toFixed(1)}" y="${(B[1] + 24).toFixed(1)}" text-anchor="middle" class="tt">${e(hs.groom || D.groom.short)}</text>
      </svg>
      <p class="tho-km">Cách nhau <b>${fmt(km)}</b> km, nay chung một mái nhà.</p></div>`]);
  }
  // ---- add-on 3: Du ký (những nơi đã đi qua) ----
  const places = (P.get('places', []) || []).filter(p => p && p.name);
  if (places.length) adds.push(['route', 'story', `<div class="wrap narrow">
    <header class="head"><p class="eyebrow">Du ký</p><h2 class="title">Dặm đường đã cùng qua</h2></header>
    <ol class="du">${places.map((p, i) => `<li style="--i:${i}"><span class="du-d">${ym(p.date) || `Chặng ${i + 1}`}</span><span class="du-n">${e(p.name)}</span></li>`).join('')}</ol></div>`]);
  // ---- add-on 4: Tâm thư (hai bức thư tay, chạm để mở cuộn) ----
  const lt = P.get('letters', {});
  if (lt.bride || lt.groom) adds.push(['letters', 'story', `<div class="wrap">
    <header class="head"><p class="eyebrow">Tâm thư</p><h2 class="title">Đôi lời gửi người thương</h2></header>
    <div class="ls">${[['groom', 'chú rể'], ['bride', 'cô dâu']].filter(([k]) => lt[k]).map(([k, l]) => `<div class="letter-s">
      <button class="ls-b" type="button" aria-expanded="false"><span class="ls-r" aria-hidden="true"></span><span>Thư của ${e(nick(k) || D[k].short)}</span><small>${l} · chạm để mở</small></button>
      <div class="ls-p"><p>${e(lt[k])}</p></div></div>`).join('')}</div></div>`]);
  const anchors = { families: main.querySelector('#families') || main.querySelector('#hero'), story: main.querySelector('#story') || main.querySelector('#families') || main.querySelector('#hero') };
  const last = {};
  adds.forEach(([id, at, html]) => {
    const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} an-add`; s.innerHTML = html;
    const ref = last[at] || anchors[at]; if (ref) ref.insertAdjacentElement('afterend', s); else main.appendChild(s);
    last[at] = s;
  });
  main.querySelectorAll('.chieu, .tho, .du').forEach(x => M.inView(x, () => {
    x.classList.add('on');
    if (x.classList.contains('chieu')) setTimeout(() => { x.classList.add('stamped'); M.tone('thud'); M.haptic('thud'); }, reduced ? 0 : 1400);
  }, { threshold: .45 }));
  main.querySelectorAll('.ls-b').forEach(b => b.addEventListener('click', () => {
    const o = b.parentElement.classList.toggle('open'); b.setAttribute('aria-expanded', o); M.tone('click'); M.haptic('tap');
  }));

  // ---- finale: sau hồi âm, khách được sắc phong một phẩm hàm ----
  EA.onRsvp(entry => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('sac')) return;
        if (!entry.attending) return;
        const h = hash(entry.name), i = h % RANKS.length, plus = entry.plus || 0;
        done.insertAdjacentHTML('beforebegin', `<article class="sac"><p class="ch-k">Sắc phong</p>
          <p class="ch-l">${e(entry.name)}</p><p class="sac-r">${TITLES[(h >>> 3) % TITLES.length]} ${RANKS[i]}</p>
          <p class="ch-l">${plus ? `Cho phép mang theo ${plus} tuỳ tùng.` : 'Ân chuẩn nhập tiệc, ngồi bàn thượng khách.'}</p>${stampHTML}</article>`);
        const sac = done.previousElementSibling;
        setTimeout(() => { sac.classList.add('stamped'); M.tone('thud'); M.haptic('thud'); }, reduced ? 0 : 500);
      });
    }, 30);
  });
});
