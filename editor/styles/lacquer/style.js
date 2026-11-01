// Sơn Mài Hỷ Sự: hai cánh cửa sơn mài đỏ dát vàng. Kéo hai cánh ra -> bụi vàng lá rơi -> chữ Hỷ được dát vàng từng nét.
// Đường khe (seam) chỉ chạy trong khung cửa, dừng hẳn phía trên bảng chữ: tên, ngày và "Gửi ..." không bao giờ bị cắt ngang.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : ''; };
const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const plain = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

// ---- chữ Hỷ (囍) vẽ bằng nét: hai chữ 喜 đứng cạnh nhau ----
// chữ Hỷ (囍) là chữ thật, Noto Serif TC 700, chỉ tải đúng một ký tự (text=%E5%9B%8D)
(() => { try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&text=%E5%9B%8D&display=block'; document.head.appendChild(l); } catch { /* offline */ } })();
const hy = (cls = '') => `<span class="hy ${cls}" aria-hidden="true">囍</span>`;

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  document.documentElement.classList.toggle('lq-low', M.tier === 'low');
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  const eggText = nick('bride') && nick('groom') ? `${nick('bride')} và ${nick('groom')}` : 'Trăm năm hạnh phúc';

  el.className = 'cover lq-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <div class="lq-frame">
      <div class="lq-stage">
        <div class="lq-niche" aria-hidden="true">
          <div class="bloom"></div>
          <div class="lq-hyn"><span class="groove">囍</span><span class="gild">囍</span></div>
          <div class="sweep"></div>
        </div>
        <canvas class="lq-fx ea-mo-canvas" aria-hidden="true"></canvas>
        <div class="pan l" aria-hidden="true"><canvas></canvas><i class="half"></i></div>
        <div class="pan r" aria-hidden="true"><canvas></canvas><i class="half"></i></div>
        <div class="lq-seam" aria-hidden="true"></div>
        <p class="lq-egg" hidden></p>
      </div>
      <div class="lq-plaque">
        <p class="k">Lễ thành hôn</p>
        <p class="n">${e(D.bride.name.replace(/ /g, ' '))} <i>&amp;</i> ${e(D.groom.name.replace(/ /g, ' '))}</p>
        <p class="dt">${c.dateText}</p>
        <p class="g">Gửi ${e(c.guest)}</p>
        <p class="hint">Kéo hai cánh cửa sơn mài sang hai bên</p>
        <button class="open-btn" type="button">Mở cửa</button>
      </div>
    </div>`;

  const $ = s => el.querySelector(s);
  const stage = $('.lq-stage'), fx = $('.lq-fx'), pl = $('.pan.l'), pr = $('.pan.r'), egg = $('.lq-egg'), hint = $('.hint');
  const gildEl = $('.gild'); el.style.setProperty('--g', -.1);
  const S = { p: 0 };
  let locked = false, ended = false, musicOn = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => setTimeout(r, M.reduced ? 0 : ms));
  const setP = v => { S.p = clamp(v); el.style.setProperty('--p', S.p.toFixed(4)); };
  setP(0);

  // ---- vàng lá dát trên hai cánh cửa (vẽ một lần) ----
  const leaf = (cv, seed) => {
    const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d'), R = seeded(seed);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const cl = Array.from({ length: 8 }, () => ({ x: R() * w, y: R() * h, r: 30 + R() * 90 }));
    const n = Math.round(w * h / (M.tier === 'low' ? 520 : 300));
    for (let i = 0; i < n; i++) {
      let x, y;
      if (R() < .72) { const k = cl[(R() * cl.length) | 0]; x = k.x + (R() + R() + R() - 1.5) * k.r; y = k.y + (R() + R() + R() - 1.5) * k.r; }
      else { x = R() * w; y = h * (1 - R() ** 2.4); }
      if (x < 0 || x > w || y < 0 || y > h) continue;
      const s = 1.4 + R() ** 2 * 7, sides = 4 + ((R() * 2) | 0), a0 = R() * 6.28;
      g.beginPath();
      for (let j = 0; j < sides; j++) { const a = a0 + j / sides * 6.28 + (R() - .5) * .8, rr = s * (.55 + R() * .6); g[j ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8); }
      g.closePath();
      const hu = 38 + R() * 10, li = 42 + R() * 28;
      g.fillStyle = `hsla(${hu},${62 + R() * 20}%,${li}%,${.55 + R() * .4})`; g.fill();
      if (s > 4.2) { g.strokeStyle = `hsla(46,90%,82%,${.25 + R() * .3})`; g.lineWidth = .6; g.stroke(); }
    }
  };
  const paint = () => { leaf(pl.querySelector('canvas'), 11); leaf(pr.querySelector('canvas'), 29); };
  paint(); addEventListener('resize', paint); stops.push(() => removeEventListener('resize', paint));

  // ---- hạt: vàng lá lấp lánh + vàng lá rơi (burst) ----
  const sparkle = (g, p) => {
    const t = clamp(p.life / p.dur); if (p.kind === 'glint') {
      const a = Math.sin(t * Math.PI) * p.a; if (a < .02) return;
      g.globalAlpha = a; g.fillStyle = '#fff3c4';
      const L = p.r * 4;
      g.beginPath(); g.moveTo(p.x - L, p.y); g.lineTo(p.x, p.y - p.r * .5); g.lineTo(p.x + L, p.y); g.lineTo(p.x, p.y + p.r * .5); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(p.x, p.y - L); g.lineTo(p.x + p.r * .5, p.y); g.lineTo(p.x, p.y + L); g.lineTo(p.x - p.r * .5, p.y); g.closePath(); g.fill();
      g.globalAlpha = 1; return;
    }
    const f = clamp(1 - p.life / p.dur), flick = .55 + .45 * Math.abs(Math.sin(p.rot * 2 + p.ph));
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, .45 + .55 * Math.abs(Math.cos(p.rot * 1.3 + p.ph)));
    g.globalAlpha = f * (p.kind === 'tip' ? 1 : .95);
    g.fillStyle = `hsl(${p.hue},${70 + 20 * flick}%,${48 + 30 * flick}%)`;
    g.beginPath(); g.moveTo(-p.r, -p.r * .3); g.lineTo(p.r * .2, -p.r * .8); g.lineTo(p.r, p.r * .2); g.lineTo(-p.r * .3, p.r * .7); g.closePath(); g.fill();
    g.restore(); g.globalAlpha = 1;
  };
  const fxp = M.particles(fx, {
    count: 14,
    init: (p, i, w, h) => { p.kind = 'glint'; p.x = rnd(w * .06, w * .94); p.y = rnd(h * .05, h * .95); p.r = rnd(.9, 2); p.a = rnd(.5, 1); p.dur = rnd(1400, 3200); p.life = -rnd(0, 2600); },
    step: p => p.kind === 'glint' ? (p.life < p.dur ? true : false) : step(p),
    draw: (g, p) => { if (p.life >= 0) sparkle(g, p); }
  });
  function step(p) {
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    p.vy += p.kind === 'fall' ? .028 : .012; p.vx *= .99;
    return p.life < p.dur;
  }
  stops.push(() => fxp.stop());
  const flakeBurst = (n, x0, x1, y0, y1, spread = 1) => fxp.burst(n, (p, i, w, h) => {
    p.kind = 'fall'; p.x = rnd(x0, x1) * w; p.y = rnd(y0, y1) * h; p.r = rnd(2, 6.5); p.hue = rnd(38, 48); p.ph = rnd(0, 6);
    p.vx = rnd(-1.2, 1.2) * spread; p.vy = rnd(-1.5, .6); p.vr = rnd(-.14, .14); p.rot = rnd(0, 6.28); p.dur = rnd(900, 2200); p.life = 0;
  });
  const tipBurst = (x, y) => fxp.burst(3, p => {
    p.kind = 'tip'; p.x = x + rnd(-3, 3); p.y = y + rnd(-3, 3); p.r = rnd(1.5, 3.6); p.hue = rnd(40, 52); p.ph = rnd(0, 6);
    p.vx = rnd(-.7, .7); p.vy = rnd(-.9, .1); p.vr = rnd(-.2, .2); p.rot = rnd(0, 6.28); p.dur = rnd(500, 900); p.life = 0;
  });

  // ---- tilt: ánh xà cừ trượt trên mặt sơn ----
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } }));

  // ---- easter egg: chạm ba lần vào ấn vàng giữa hai cánh ----
  let taps = 0, tapT = 0, eggTimer = 0;
  const tapSeal = () => {
    const now = Date.now(); M.tone('pop'); M.haptic('tap');
    taps = now - tapT < 1500 ? taps + 1 : 1; tapT = now;
    stage.classList.remove('shiver'); void stage.offsetWidth; stage.classList.add('shiver');
    if (taps < 3) return; taps = 0;
    egg.textContent = eggText; egg.hidden = false; egg.classList.remove('show'); void egg.offsetWidth; egg.classList.add('show');
    M.tone('chime'); M.haptic('success'); flakeBurst(16, .42, .58, .42, .58, 1.6);
    clearTimeout(eggTimer); eggTimer = setTimeout(() => { egg.hidden = true; }, 3000);
  };

  // ---- gesture: kéo hai cánh ra ----
  const distance = () => stage.clientWidth * .34;
  let lastTick = 0, dxLast = 0;
  const progress = v => {
    setP(v);
    const k = Math.floor(S.p * 8);
    if (k !== lastTick) { lastTick = k; if (k > 0) { M.haptic('tap'); M.tone('click'); } }
  };
  const begin = () => { if (!musicOn) { musicOn = true; EA.music(); M.requestTilt(); } hint.classList.add('gone'); };
  // dát vàng: một nét cọ quét từ trên xuống, tia lửa bắn ra ở mép nét quét
  const gild = async () => {
    const r = gildEl.getBoundingClientRect(), f = fx.getBoundingClientRect();
    let lastTick = 0;
    await M.tween(-.1, 1.1, M.reduced ? 0 : 2000, 'inOut', v => {
      el.style.setProperty('--g', v.toFixed(3));
      if (M.reduced || ended) return;
      const y = r.top - f.top + clamp(v) * r.height;
      for (let k = 0; k < 2; k++) tipBurst(r.left - f.left + r.width * (.1 + Math.random() * .8), y);
      const t = Math.floor(v * 8); if (t !== lastTick && t > 0) { lastTick = t; M.haptic('tap'); M.tone('click'); }
    });
    el.style.setProperty('--g', 1.2);
  };
  const finish = async () => {
    if (locked || ended) return;
    locked = true; begin(); el.classList.add('busy');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    M.tone('whoosh');
    await M.tween(S.p, 1, 260 + 1000 * (1 - S.p), 'inOut', progress);
    if (ended) return;
    M.tone('thud'); M.haptic('thud'); el.classList.add('parted');
    flakeBurst(M.scale(46), .0, 1, .02, .9, 1.2);
    await wait(260);
    el.classList.add('lit');
    await wait(420);
    await gild();
    if (ended) return;
    M.tone('chime'); M.haptic('success'); el.classList.add('gilded');
    flakeBurst(M.scale(40), .2, .8, .3, .6, 2.2);
    await wait(1100);
    if (ended) return;
    open();
    setTimeout(stopCover, 1200);
  };
  let down = null, moved = false;
  M.drag(stage, {
    axis: 'x', distance: 1,
    onMove: (_p, dx) => {
      if (locked) return; dxLast = dx;
      if (Math.abs(dx) > 8) { moved = true; begin(); }
      if (moved) progress(Math.abs(dx) / distance());
    },
    onEnd: () => {
      if (locked) return;
      if (!moved) { if (down && down.closest && down.closest('.half')) tapSeal(); return; }
      moved = false;
      if (S.p >= .38) finish(); else M.tween(S.p, 0, 520, 'outBack', setP);
    }
  });
  stage.addEventListener('pointerdown', ev => { down = ev.target; });
  stage.addEventListener('keydown', ev => { if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { ev.preventDefault(); if (!locked) { begin(); progress(S.p + .2); if (S.p >= .98) finish(); } } });
  stage.tabIndex = 0; stage.setAttribute('role', 'button'); stage.setAttribute('aria-label', 'Hai cánh cửa sơn mài. Kéo sang hai bên, hoặc nhấn mũi tên, để mở thiệp');
  $('.open-btn').addEventListener('click', () => { locked || finish(); }, { once: true });
});

// ---- chung ----
const head = (c, a, b) => c.ui.head(a, b);

EA.section('announce', ({ data: D, esc: e, dow, d, m, y }) => `<div class="wrap">
  <div class="thiep">
    <div class="side">
      <p class="label">Nhà trai</p>
      <p>Ông ${e(D.groomFamily.father)}</p><p>Bà ${e(D.groomFamily.mother)}</p>
      <p class="addr">${e(D.groomFamily.address)}</p>
    </div>
    <div class="center">
      ${hy('hy-big')}
      <p class="kicker">Trân trọng báo tin lễ thành hôn của con chúng tôi</p>
      <h2 class="couple"><span>${e(D.groom.name)}</span><span class="amp">&amp;</span><span>${e(D.bride.name)}</span></h2>
      <p class="note">${e(D.announceNote)}</p>
      <p class="lunar">${dow} · ngày ${d} tháng ${+m} năm ${y}</p>
    </div>
    <div class="side">
      <p class="label">Nhà gái</p>
      <p>Ông ${e(D.brideFamily.father)}</p><p>Bà ${e(D.brideFamily.mother)}</p>
      <p class="addr">${e(D.brideFamily.address)}</p>
    </div>
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <ol class="scroll-line">
    ${D.itinerary.map(it => `<li><time>${e(it.time)}</time><div><strong>${e(it.title)}</strong><span>${e(it.note)}</span></div></li>`).join('')}
  </ol>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Lễ thành hôn', 'Trân trọng kính mời')}
  <div class="ceremonies">
    ${D.events.map(ev => `
      <article class="ceremony nacre">
        ${hy('hy-sm')}
        <h3>${e(ev.title)}</h3>
        <p class="label">${e(ev.label)}</p>
        <p class="when">Vào lúc <b>${e(ev.time)}</b><br>${ui.evDate(ev).split('· ')[1]}</p>
        <p class="where">Tại <b>${e(ev.place)}</b><br>${e(ev.address)}</p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Khoảnh khắc của chúng mình')}
  <div class="triptych">${D.photos.map((p, i) => ui.photo(p, i)).join('')}</div>
</div>`);

EA.section('thanks', (c) => {
  const { data: D, esc: e, dateText } = c;
  return `<div class="wrap narrow">
  <div class="seal-end nacre" aria-hidden="true">${hy()}</div>
  <p class="eyebrow">Đa tạ</p>
  <p class="mono">${e(D.monogram)}</p>
  <p>${e(D.thanks)}</p>
  <p class="kicker">${dateText}</p>
  <div class="actions center"><button class="btn" type="button" id="reopen">Mở lại tấm thiệp ${c.icon('replay')}</button></div>
</div>`;
});

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="lq-hero">
    ${hy('lq-hy')}
    <div class="lq-row">
      <p class="lq-name">${e(cp.groomName)}</p>
      <div class="lq-portrait nacre"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
      <p class="lq-name">${e(cp.brideName)}</p>
    </div>
    <p class="kicker">Lễ thành hôn · ${c.dow} · ${c.dateText}</p>
    ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Duyên lành', 'Chuyện của chúng mình')}
  <ol class="lq-story">
    ${(mod.content.chapters || []).map(ch => `
      <li>
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <div><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
      </li>`).join('')}
  </ol>
  ${mod.content.quote ? `<p class="story-quote">“${e(mod.content.quote)}”</p>` : ''}
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi đáp', 'Xác nhận tham dự')}
  <div class="red-envelope nacre"><span class="re-seal" aria-hidden="true">${hy()}</span><div class="re-paper">${ui.rsvpForm()}</div></div>
</div>`);

// ---- tranh sơn mài quê hương (SVG: nền đen, vàng lá, vỏ trứng, son) ----
const GOLD = '#d9a441', RED = '#b8231f', IVORY = '#efe2c2', INK = '#1b0908';
const SCENES = {
  thap: () => { // tháp nhiều tầng
    let s = '';
    for (let i = 0; i < 5; i++) {
      const y = 190 - i * 28, w = 44 - i * 6;
      s += `<path d="M${100 - w - 8} ${y}Q100 ${y - 14} ${100 + w + 8} ${y}L${100 + w} ${y - 9}H${100 - w}Z" fill="${GOLD}"/><rect x="${100 - w + 6}" y="${y - 28 + 9}" width="${2 * w - 12}" height="19" fill="${IVORY}"/><rect x="${97}" y="${y - 24}" width="6" height="11" rx="3" fill="${RED}"/>`;
    }
    return `${s}<path d="M100 56V40M96 46h8" stroke="${GOLD}" stroke-width="2.5"/><circle cx="100" cy="50" r="38" fill="${GOLD}" opacity=".16"/>`;
  },
  ghe: () => { // thuyền trên sông, cây bẹo treo hàng
    const hang = [[78, 96, GOLD], [78, 118, RED], [122, 100, IVORY], [122, 124, GOLD]].map(([x, y, f]) => `<path d="M${x} ${y - 14}V${y}" stroke="${GOLD}" stroke-width="1"/><circle cx="${x}" cy="${y + 6}" r="7" fill="${f}"/>`).join('');
    return `<circle class="sun" cx="100" cy="170" r="46" fill="${GOLD}" opacity=".22"/><path d="M100 188V56M72 82H128" stroke="${IVORY}" stroke-width="3" stroke-linecap="round"/>${hang}<path d="M40 190Q100 214 160 190L150 204Q100 224 50 204Z" fill="${RED}"/><path d="M40 190H160" stroke="${GOLD}" stroke-width="2"/><path d="M92 188l8-17 8 17z" fill="${IVORY}"/>`;
  },
  thaprua: () => `<circle cx="150" cy="60" r="22" fill="${IVORY}" opacity=".9"/><path d="M60 196Q100 180 140 196Z" fill="${GOLD}" opacity=".7"/><rect x="82" y="150" width="36" height="42" fill="${IVORY}"/><rect x="86" y="118" width="28" height="32" fill="${IVORY}"/><rect x="90" y="92" width="20" height="26" fill="${IVORY}"/><path d="M78 150h44M82 118h36M86 92h28" stroke="${GOLD}" stroke-width="4"/><path d="M100 78v14" stroke="${GOLD}" stroke-width="2.5"/><path d="M92 164a8 14 0 0 1 16 0v28H92z M95 130a5 9 0 0 1 10 0v20H95z" fill="${RED}"/><path d="M40 90Q36 130 46 170M52 84Q50 130 60 176M160 100Q164 140 154 178" stroke="${GOLD}" stroke-width="1.4" fill="none" opacity=".8"/>`,
  chuacau: () => `<circle cx="100" cy="64" r="26" fill="${GOLD}" opacity=".5"/><path d="M30 190Q100 120 170 190" stroke="${IVORY}" stroke-width="10" fill="none"/><rect x="62" y="146" width="76" height="30" fill="${RED}"/><path d="M54 148Q100 112 146 148L136 150Q100 128 64 150Z" fill="${GOLD}"/><path d="M62 176h76" stroke="${GOLD}" stroke-width="3"/>`,
  sen: () => {
    const lotus = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">${[-55, -28, 0, 28, 55].map(a => `<ellipse cx="0" cy="-16" rx="7" ry="17" transform="rotate(${a})" fill="${Math.abs(a) > 40 ? RED : IVORY}"/>`).join('')}<circle r="4.5" cy="-3" fill="${GOLD}"/></g>`;
    return `<circle cx="140" cy="66" r="24" fill="${IVORY}" opacity=".92"/><path d="M60 196Q70 150 66 120M100 196V116M140 196Q132 150 136 130" stroke="${GOLD}" stroke-width="2" fill="none"/><ellipse cx="46" cy="190" rx="34" ry="8" fill="${GOLD}" opacity=".5"/><ellipse cx="156" cy="194" rx="30" ry="7" fill="${GOLD}" opacity=".5"/>${lotus(66, 120, 1.05)}${lotus(100, 112, 1.25)}${lotus(136, 130, .95)}`;
  }
};
const sceneFor = place => {
  const t = plain(place);
  if (/nam dinh|thai binh|hai phong|ninh binh|ha nam|hai duong|hung yen|quang ninh/.test(t)) return 'thap';
  if (/can tho|tien giang|ben tre|vinh long|an giang|dong thap|ca mau|soc trang|hau giang|kien giang|long an|tra vinh|bac lieu|mien tay|mekong/.test(t)) return 'ghe';
  if (/ha noi/.test(t)) return 'thaprua';
  if (/hoi an|quang nam|da nang/.test(t)) return 'chuacau';
  return 'sen';
};
const paint = (kind, label) => `<figure class="lq-scene nacre"><svg viewBox="0 0 200 250" role="img" aria-label="Tranh sơn mài ${label}"><rect width="200" height="250" fill="${INK}"/><rect x="8" y="8" width="184" height="234" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity=".8"/><g class="art">${SCENES[kind]()}</g><g class="wave" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round" opacity=".75"><path d="M22 214q9-6 18 0t18 0t18 0t18 0t18 0t18 0t18 0"/><path d="M36 228q9-6 18 0t18 0t18 0t18 0t18 0t18 0" opacity=".6"/></g></svg></figure>`;

// ---- add-ons (chỉ hiện khi có dữ liệu) + hiệu ứng nền + finale ----
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  document.documentElement.classList.toggle('lq-low', M.tier === 'low');
  const adds = [];

  // 1. Hai miền quê: tranh sơn mài quê của cô dâu và chú rể
  const hs = P.get('hometowns', {});
  if (hs.bride || hs.groom) {
    const cards = [['groom', 'Quê chú rể'], ['bride', 'Quê cô dâu']].filter(([k]) => hs[k]).map(([k, l]) =>
      `<div class="lq-que">${paint(sceneFor(hs[k]), e(hs[k]))}<figcaption><span class="label">${l}</span><b>${e(hs[k])}</b></figcaption></div>`).join('');
    adds.push(['hometowns', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hai miền quê</p><h2 class="title">${hs.groom && hs.bride ? `${e(hs.groom)} và ${e(hs.bride)}, về chung một nhà` : 'Quê hương trong tranh sơn mài'}</h2></header>
      <div class="lq-que-row">${cards}</div></div>`]);
  }

  // 2. Duyên trầu cau
  if (P.has('metDate') || P.has('proposal')) {
    const n = P.daysTogether, place = P.get('metPlace', ''), since = dmy(P.get('metDate', ''));
    adds.push(['trau', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Duyên trầu cau</p><h2 class="title">Miếng trầu là đầu câu chuyện</h2></header>
      <svg class="trau" viewBox="0 0 220 150" role="img" aria-label="Lá trầu và quả cau quấn lấy nhau">
        <defs><linearGradient id="lqLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f9a5b"/><stop offset="1" stop-color="#1f5a35"/></linearGradient></defs>
        <g class="lf l"><path d="M110 120C50 100 22 60 56 30c20-14 42 4 54 30z" fill="url(#lqLeaf)"/><path d="M110 120C80 90 62 66 58 36" stroke="#9fd4a2" stroke-width="1.4" fill="none"/></g>
        <g class="lf r"><path d="M110 120C170 100 198 60 164 30c-20-14-42 4-54 30z" fill="url(#lqLeaf)"/><path d="M110 120C140 90 158 66 162 36" stroke="#9fd4a2" stroke-width="1.4" fill="none"/></g>
        <g class="nut"><ellipse cx="110" cy="84" rx="19" ry="23" fill="#efe2c2"/><path d="M110 61v46M99 66q11 18 0 36M121 66q-11 18 0 36" stroke="#b8a77c" stroke-width="1.2" fill="none"/><ellipse cx="110" cy="84" rx="19" ry="23" fill="none" stroke="${GOLD}" stroke-width="1.5"/></g>
      </svg>
      ${n != null ? `<p class="lq-days"><b class="num" data-n="${n}">${fmt(n)}</b> <span>ngày từ buổi gặp đầu tiên</span></p><p class="lq-since">Từ ngày ${since}${place ? `, ở ${e(place)}` : ''}, đến miếng trầu cau hôm nay.</p>` : ''}
      ${P.has('proposal') ? `<blockquote class="lq-prop"><span class="label">Lời ngỏ</span>${e(P.get('proposal'))}</blockquote>` : ''}
    </div>`]);
  }

  // 3. Hoành phi: bài ca của đôi mình
  if (P.has('song.title')) {
    const s = P.get('song', {});
    adds.push(['hoanhphi', `<div class="wrap narrow">
      <div class="hoanh nacre"><i class="cord l"></i><i class="cord r"></i>
        <p class="label">Bài ca của đôi mình</p>
        ${s.lyric ? `<p class="ly">${e(s.lyric)}</p>` : ''}
        <p class="by">${e(s.title)}${s.artist ? ` · ${e(s.artist)}` : ''}</p>
      </div></div>`]);
  }

  // 4. Câu đối: hai bậc phụ mẫu của hai họ (luôn dựa trên dữ liệu gia đình)
  if (D.brideFamily.father && D.groomFamily.father) {
    adds.push(['caudoi', `<div class="wrap">
      <div class="caudoi">
        <p class="cd l" aria-hidden="true">Trăm năm hạnh phúc</p>
        <div class="cd-mid"><p class="eyebrow">Tri ân phụ mẫu</p>
          <p class="cd-n">Ông ${e(D.groomFamily.father)}<br>Bà ${e(D.groomFamily.mother)}</p><span class="cd-hy" aria-hidden="true">${hy()}</span>
          <p class="cd-n">Ông ${e(D.brideFamily.father)}<br>Bà ${e(D.brideFamily.mother)}</p>
          <p class="cd-s">Đã nuôi dạy chúng con nên người, và gật đầu cho ngày hôm nay.</p></div>
        <p class="cd r" aria-hidden="true">Bạc đầu thương nhau</p>
      </div></div>`]);
  }

  let prev = main.querySelector('#story') || main.querySelector('#families') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} lq-add`; s.innerHTML = html;
    if (prev) prev.insertAdjacentElement('afterend', s); else main.appendChild(s);
    prev = s;
  });
  main.querySelectorAll('.lq-add').forEach(s => M.inView(s, () => s.classList.add('on'), { threshold: .2 }));

  // đếm ngày
  const tr = main.querySelector('#trau .num');
  if (tr) {
    const n = +tr.dataset.n;
    if (!M.reduced) tr.textContent = '0';
    M.inView(main.querySelector('#trau'), () => M.tween(0, n, 1800, 'out', v => { tr.textContent = fmt(v); }).then(() => { tr.textContent = fmt(n); }), { threshold: .35 });
  }
  // lá trầu khép lại theo cuộn trang
  const trauSec = main.querySelector('#trau .trau');
  if (trauSec) M.scrollProgress(trauSec, p => trauSec.style.setProperty('--w', clamp((p - .25) / .3).toFixed(3)));

  // lá vàng trên tên (foil) + đèn lồng
  main.querySelectorAll('.sec:nth-child(even) .couple, .sec:nth-child(even) .title, .lq-name').forEach(el => el.classList.add('foil'));
  const lantern = side => `<span class="lantern ${side}" aria-hidden="true"><i class="cord"></i><i class="body">${hy()}</i><i class="tassel"></i></span>`;
  main.querySelector('.m-families')?.insertAdjacentHTML('afterbegin', lantern('l') + lantern('r'));

  // ánh xà cừ theo nghiêng máy / con trỏ / cuộn trang
  const nac = [...main.querySelectorAll('.nacre')], nv = { x: 0, y: 0, s: 0 };
  const setN = () => nac.forEach(n => { n.style.setProperty('--nx', nv.x); n.style.setProperty('--ny', nv.y); n.style.setProperty('--ns', nv.s); });
  let nraf = 0;
  addEventListener('scroll', () => { nv.s = +((scrollY / 900) % 4).toFixed(3); nraf ||= requestAnimationFrame(() => { nraf = 0; setN(); }); }, { passive: true }); setN();
  if (!M.reduced && M.tier !== 'low') M.tilt(({ x, y }) => { nv.x = x; nv.y = y; setN(); });

  // finale: sau RSVP, chữ Hỷ được dát vàng ngay trong phong bao
  EA.onRsvp(() => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('.red-envelope').forEach(env => {
        if (env.querySelector('.re-final')) return;
        const done = env.querySelector('.form-done'); if (!done) return;
        done.insertAdjacentHTML('afterbegin', '<span class="re-final" aria-hidden="true">囍</span>');
        env.classList.add('sealed');
      });
    }, 40);
  });
});
