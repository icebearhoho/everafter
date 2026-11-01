// Thư trong chai biển: chai trôi dạt vào bờ, khách kéo nút bần (pop + rung), lá thư cuộn mở ra rồi thiệp hiện.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}/${m[2]}/${m[1]}` : `${m[2]}/${m[1]}`) : ''; };
const WAVE = (c1, c2, h = 40) => `<svg viewBox="0 0 600 ${h}" preserveAspectRatio="none"><path d="M0 ${h * .5} Q 37 0 75 ${h * .5} T 150 ${h * .5} T 225 ${h * .5} T 300 ${h * .5} T 375 ${h * .5} T 450 ${h * .5} T 525 ${h * .5} T 600 ${h * .5} V ${h} H0Z" fill="${c1}"/><path d="M0 ${h * .62} Q 37 ${h * .12} 75 ${h * .62} T 150 ${h * .62} T 225 ${h * .62} T 300 ${h * .62} T 375 ${h * .62} T 450 ${h * .62} T 525 ${h * .62} T 600 ${h * .62}" fill="none" stroke="${c2}" stroke-width="1.5"/></svg>`;
const BOTTLE = `<svg viewBox="0 0 120 300" aria-hidden="true"><defs>
  <linearGradient id="btg" x1="0" x2="1"><stop offset="0" stop-color="#bfe6df" stop-opacity=".85"/><stop offset=".5" stop-color="#e4f6f1" stop-opacity=".55"/><stop offset="1" stop-color="#8ccbc4" stop-opacity=".8"/></linearGradient>
  <linearGradient id="btp" x1="0" x2="1"><stop offset="0" stop-color="#d7c08a"/><stop offset=".45" stop-color="#fbf2d8"/><stop offset="1" stop-color="#d2b97c"/></linearGradient></defs>
  <g class="roll"><rect x="42" y="128" width="36" height="124" rx="18" fill="url(#btp)"/><rect x="42" y="176" width="36" height="9" fill="#b23a2a"/></g>
  <path d="M47 38 H73 V104 C73 128 108 140 108 186 V262 C108 284 94 294 60 294 C26 294 12 284 12 262 V186 C12 140 47 128 47 104Z" fill="url(#btg)" stroke="rgba(255,255,255,.95)" stroke-width="2.4"/>
  <path d="M24 190 C24 160 30 150 38 142" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>
  <path d="M26 226 V262" stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
  <rect x="45" y="32" width="30" height="9" rx="3" fill="#cfe9e4" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/></svg>`;
const SMALL = `<svg viewBox="0 0 60 150" aria-hidden="true"><path d="M23 26 H37 V58 C37 70 54 76 54 100 V132 C54 143 47 148 30 148 C13 148 6 143 6 132 V100 C6 76 23 70 23 58Z" fill="rgba(190,230,224,.75)" stroke="#fff" stroke-width="2"/><rect x="26" y="52" width="8" height="52" rx="4" fill="#f3e8c8"/><rect x="21" y="14" width="18" height="16" rx="3" fill="#b98a57"/></svg>`;

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  el.className = 'cover bt-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <div class="bt-sky" aria-hidden="true">
      <button class="bt-sun" type="button" tabindex="-1"><i></i></button>
      <i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i>
      <svg class="gull g1" viewBox="0 0 40 20"><path d="M2 14 Q10 2 20 12 Q30 2 38 14" fill="none" stroke="#35606b" stroke-width="2" stroke-linecap="round"/></svg>
      <svg class="gull g2" viewBox="0 0 40 20"><path d="M2 14 Q10 2 20 12 Q30 2 38 14" fill="none" stroke="#35606b" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <div class="bt-sea" aria-hidden="true">
      <div class="wv w1">${WAVE('#7dbfca', 'rgba(255,255,255,.55)')}</div>
      <div class="wv w2">${WAVE('#5fa8b8', 'rgba(255,255,255,.5)')}</div>
      <canvas class="bt-glint ea-mo-canvas"></canvas>
    </div>
    <div class="bt-sand" aria-hidden="true"><svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice"><g fill="#e0a98f" stroke="#c98468" stroke-width="1"><path transform="translate(54 150) rotate(-14) scale(1.15)" d="M0-20 L5-6 L20-6 L8 3 L13 18 L0 9 L-13 18 L-8 3 L-20-6 L-5-6Z"/></g><g fill="#f6e9d4" stroke="#cdb08a" stroke-width="1.2"><path transform="translate(350 120) rotate(20)" d="M0 12 C-18 8-18-10 0-14 C18-10 18 8 0 12Z M0-14 V12 M-8-11 L-6 10 M8-11 L6 10"/><path transform="translate(330 176) rotate(-30) scale(.7)" d="M0 12 C-18 8-18-10 0-14 C18-10 18 8 0 12Z"/><circle cx="96" cy="182" r="5"/></g><g fill="#cdb08a" opacity=".7"><ellipse cx="30" cy="100" rx="4" ry="6.5"/><ellipse cx="46" cy="84" rx="4" ry="6.5"/><ellipse cx="368" cy="70" rx="4" ry="6.5"/><ellipse cx="354" cy="52" rx="4" ry="6.5"/></g></svg></div>
    <div class="bt-stage">
      <div class="bt-bwrap">
        <div class="bt-bottle">${BOTTLE}<button class="bt-cork" type="button" aria-label="Kéo nút bần lên để mở chai"></button></div>
      </div>
    </div>
    <div class="bt-front wv-f" aria-hidden="true"><div class="wv w3">${WAVE('rgba(125,191,202,.88)', 'rgba(255,255,255,.7)', 44)}</div></div>
    <div class="bt-card">
      <p class="k">Một lá thư trôi đến</p>
      <p class="to">Gửi ${e(c.guest)}</p>
      <p class="n">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
      <p class="d">${c.dow} · ${c.dateText}</p>
      <p class="h">Kéo nút bần lên để mở chai</p>
      <button class="open-btn" type="button">Mở nút chai</button>
    </div>
    <div class="bt-lt" aria-hidden="true">
      <i class="rod t"></i>
      <div class="paper"><div class="in">
        <p class="k">Một lá thư từ biển</p>
        <p class="to">Gửi ${e(c.guest)},</p>
        <p class="n">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
        <p class="m">mời bạn đến chung vui trong ngày chúng mình về chung một nhà</p>
        <p class="d">${c.dow} · ${c.dateText}</p>
      </div></div>
      <i class="rod b"></i>
    </div>
    <canvas class="bt-fx ea-mo-canvas"></canvas>
    <p class="bt-egg" role="status" hidden></p>`;

  const $ = s => el.querySelector(s);
  const cork = $('.bt-cork'), bottle = $('.bt-bottle'), fxCv = $('.bt-fx'), lt = $('.bt-lt'), paper = $('.paper');
  let state = 'idle', ended = false, began = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  const begin = viaBtn => { if (began) return; began = true; if (!viaBtn) EA.music(); M.requestTilt(); };

  // ---- ambient: ánh nắng lấp lánh trên mặt nước, sóng trôi, chim hải âu, nghiêng theo tay ----
  const gl = M.particles($('.bt-glint'), {
    count: 46,
    init: (p, i, w, h) => { p.x = rnd(0, w); p.y = rnd(h * .1, h); p.r = rnd(.8, 2.4); p.sp = rnd(.0014, .004); p.ph = rnd(0, 6.28); },
    step: () => {},
    draw: (g, p) => { const a = Math.max(0, Math.sin(p.life * p.sp + p.ph)) ** 3; if (a < .04) return; g.globalAlpha = a * .9; g.fillStyle = '#fffbe8'; g.fillRect(p.x - p.r * 3, p.y - .5, p.r * 6, 1); g.fillRect(p.x - .5, p.y - p.r * 1.5, 1, p.r * 3); g.globalAlpha = 1; }
  });
  const fx = M.particles(fxCv, { count: 0, init: () => {}, step: (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= .00004 * dt; return p.life < p.max; },
    draw: (g, p) => { const k = 1 - p.life / p.max; g.globalAlpha = k * .85; g.strokeStyle = '#fff'; g.fillStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.4; g.beginPath(); g.arc(p.x, p.y, p.r * (1 + (1 - k) * .6), 0, 6.2832); g.fill(); g.stroke(); g.globalAlpha = 1; } });
  stops.push(() => gl.stop(), () => fx.stop());
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (state === 'idle') { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } }));

  // ---- easter egg: chạm 3 lần vào mặt trời ----
  const egg = $('.bt-egg'); let taps = 0, tapT = 0, eggT = 0;
  $('.bt-sun').addEventListener('click', () => {
    const now = Date.now(); taps = now - tapT < 1500 ? taps + 1 : 1; tapT = now; M.tone('pop'); M.haptic('tap');
    if (taps < 3) return; taps = 0;
    const met = c.p.get('metDate'), pl = c.p.get('metPlace'), bits = [];
    if (met) bits.push(`Lá thư đầu tiên của chúng mình viết ngày ${dmy(met)}${pl ? `, ở ${pl}` : ''}.`);
    if (c.p.daysTogether) bits.push(`Đã ${fmt(c.p.daysTogether)} ngày trôi theo con sóng.`);
    if (!bits.length && nick('bride') && nick('groom')) bits.push(`${nick('bride')} và ${nick('groom')} gửi lời chào từ biển.`);
    if (!bits.length) return;
    egg.textContent = bits.join(' '); egg.hidden = false; egg.classList.remove('show'); void egg.offsetWidth; egg.classList.add('show');
    M.tone('chime'); M.haptic('success'); clearTimeout(eggT); eggT = setTimeout(() => { egg.hidden = true; }, 5200);
  });

  // ---- wow: pop nút bần -> bong bóng -> cuộn thư bay ra -> thư mở ----
  const center = n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; };
  const pop = async () => {
    if (state !== 'idle') return; state = 'busy'; begin();
    el.classList.add('busy');
    if (M.reduced) { open(); return; }
    const cr = center(cork), er = el.getBoundingClientRect();
    M.tone('pop'); M.haptic('thud');
    // nút bần bay lên rồi rơi xuống nước
    cork.style.transition = 'none';
    const dx = -90, up = -er.height * .3, down = er.height * .14;
    cork.animate([
      { transform: `translate(0,${cork.dataset.y || 0}px) rotate(0)`, opacity: 1 },
      { transform: `translate(${dx * .55}px,${up}px) rotate(320deg)`, opacity: 1, offset: .45 },
      { transform: `translate(${dx}px,${down}px) rotate(640deg)`, opacity: 0 }
    ], { duration: 1150, easing: 'cubic-bezier(.3,.6,.5,1)', fill: 'forwards' });
    bottle.classList.add('wobble');
    fx.burst(26, (p) => { p.x = cr.x - er.left + rnd(-8, 8); p.y = cr.y - er.top; p.vx = rnd(-.06, .06); p.vy = -rnd(.05, .16); p.r = rnd(2, 6); p.max = rnd(700, 1500); });
    c.after(1000, () => { const s = document.createElement('i'); s.className = 'bt-ring'; s.style.cssText = `left:${cr.x + dx - er.left}px;top:${cr.y + down - er.top}px`; el.appendChild(s); setTimeout(() => s.remove(), 1600); M.tone('click'); });
    await wait(520); if (ended) return;
    // cuộn thư trượt ra khỏi cổ chai
    const rb = center(bottle.querySelector('.roll'));
    const W = Math.min(er.width * .86, 340);
    lt.style.setProperty('--W', `${W}px`);
    lt.style.left = `${rb.x - er.left}px`; lt.style.top = `${rb.y - er.top - 62}px`;
    el.classList.add('rolled');
    await wait(60);
    const topTo = Math.max(er.height * .17, 80), topFrom = rb.y - er.top - 62;
    const t1 = M.tween(0, 1, 950, 'inOut', k => {
      lt.style.top = `${topFrom + (topTo - topFrom) * k}px`;
      lt.style.left = `${(rb.x - er.left) + (er.width / 2 - (rb.x - er.left)) * k}px`;
      lt.style.setProperty('--w', `${36 + (W - 36) * clamp(k * 1.6 - .2)}px`);
    });
    M.tone('whoosh'); await t1; if (ended) return;
    // thư cuộn mở
    const full = paper.firstElementChild.offsetHeight;
    M.haptic('tap');
    await M.tween(0, 1, 1300, 'out', k => { paper.style.height = `${full * k}px`; paper.firstElementChild.style.opacity = clamp((k - .25) / .6); });
    M.tone('chime'); M.haptic('success');
    el.classList.add('glow');
    await wait(1200); if (ended) return;
    open(); setTimeout(stopCover, 1400);
  };

  let last = 0;
  M.drag(cork, {
    axis: 'y', distance: 64, invert: true,
    onMove: (p) => {
      if (state !== 'idle') return; if (!began) begin();
      el.classList.add('pulling');
      const y = -p * 34; cork.dataset.y = y;
      cork.style.transform = `translate(${Math.sin(p * 30) * p * 1.6}px,${y}px) rotate(${Math.sin(p * 22) * p * 5}deg)`;
      const k = Math.floor(p * 5); if (k !== last) { last = k; if (k) { M.haptic('tap'); M.tone('click'); } }
      if (p >= 1) pop();
    },
    onEnd: p => {
      if (state !== 'idle') return;
      el.classList.remove('pulling'); last = 0;
      M.tween(p, 0, 340, 'spring', v => { cork.dataset.y = -v * 34; cork.style.transform = `translateY(${-v * 34}px)`; });
    }
  });
  cork.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && state === 'idle') { ev.preventDefault(); pop(); } });
  $('.open-btn').addEventListener('click', () => { if (state !== 'idle') return; begin(true); pop(); });
  cork.focus?.({ preventScroll: true });
});

// ---- layouts: dấu chân trên cát, dạo biển ----
EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lịch trình', 'Dấu chân một ngày')}
  <ol class="steps">
    ${D.itinerary.map(it => `<li><span class="foot" aria-hidden="true"></span><time>${e(it.time)}</time><strong>${e(it.title)}</strong><span class="n">${e(it.note)}</span></li>`).join('')}
  </ol>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Dạo biển cùng chúng mình', 'Vuốt sang để xem thêm ảnh.')}
  <div class="shoreline" tabindex="0" aria-label="Ảnh, cuộn ngang">${D.photos.map((p, i) => ui.photo(p, i)).join('')}</div>
</div>`);

EA.section('letter', ({ data: D, esc: e, guest, dateText }) => `<div class="wrap narrow">
  <div class="parchment">
    <p class="kicker">${dateText}</p>
    <p class="salute">Gửi ${e(guest)},</p>
    <h1 class="display">Một lời mời từ chúng mình</h1>
    ${D.letter.slice(0, 2).map(p => `<p>${e(p)}</p>`).join('')}
    <p class="highlight">${e(D.letterHighlight)}</p>
    ${D.letter.slice(2).map(p => `<p>${e(p)}</p>`).join('')}
    <p class="sign">Thân mến,<br><span class="names">${e(D.bride.name.replace(/ /g, ' '))} <span class="amp">&amp;</span> ${e(D.groom.name.replace(/ /g, ' '))}</span></p>
  </div>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ghi nhớ ngày vui', 'Theo con nước')}
  <div class="tides">
    ${D.events.map((ev, i) => `
      <article class="tide ${i ? 'dusk' : 'dawn'}">
        <p class="label">${e(ev.label)}</p>
        <p class="t">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Cẩm nang', 'Những lá thư nhỏ')}
  ${D.faq.map(f => `<details class="mini-bottle"><summary><span class="mb" aria-hidden="true"></span>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('')}
</div>`);

// ---- v3: đường chân trời, những hòn đảo, thư hồi âm ----
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="bo-hero">
  <div class="bo-sea"><div class="bo-art" aria-hidden="true"><i class="sun"></i><div class="wv w1">${WAVE('#7dbfca', 'rgba(255,255,255,.55)')}</div><div class="wv w2">${WAVE('#5fa8b8', 'rgba(255,255,255,.5)')}</div><div class="wv w3">${WAVE('#3f8da0', 'rgba(255,255,255,.5)', 44)}</div></div><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high" onerror="this.style.visibility='hidden'"><canvas class="bo-glint ea-mo-canvas" aria-hidden="true"></canvas></div>
  <div class="bo-sand">
    <h1 class="bo-names">${e(cp.brideShortName)} &amp; ${e(cp.groomShortName)}</h1>
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="hero-date">${c.dow} · ${c.dateText} · ${e(cp.city)}</p>
    ${c.mod.content.showCountdown !== false ? `<p class="tide-k">Thủy triều đang dâng, còn lại</p>${ui.countdown()}` : ''}
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Những hòn đảo đã qua', 'Vuốt sang để đi tiếp.')}
  <div class="islands" tabindex="0" aria-label="Câu chuyện, cuộn ngang">
    ${(mod.content.chapters || []).map(ch => `
      <article class="island">
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : ''}
        <p class="is-date">${e(ch.date)}</p>
        <h3>${e(ch.title)}</h3>
        <p>${e(ch.text)}</p>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Thả thư hồi âm')}
  <div class="bottle-msg"><span class="cork-top" aria-hidden="true"></span><div class="parchment">${ui.rsvpForm()}</div></div>
</div>`);

// ---------- add-ons + ongoing motion + finale ----------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const short = k => D[k].short || D[k].name;
  const adds = {};

  // ongoing: ánh nắng lấp lánh trên biển ở hero, sóng nhún theo tay
  const hc = main.querySelector('.bo-glint');
  if (hc) M.particles(hc, { count: 40, init: (p, i, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.r = rnd(.8, 2.2); p.sp = rnd(.0014, .004); p.ph = rnd(0, 6.28); }, step: () => {},
    draw: (g, p) => { const a = Math.max(0, Math.sin(p.life * p.sp + p.ph)) ** 3; if (a < .04) return; g.globalAlpha = a; g.fillStyle = '#fffbe8'; g.fillRect(p.x - p.r * 3, p.y - .5, p.r * 6, 1); g.fillRect(p.x - .5, p.y - p.r * 1.5, 1, p.r * 3); g.globalAlpha = 1; } });
  const sea = main.querySelector('.bo-sea');
  if (sea && M.tier !== 'low') M.tilt(({ x }) => sea.style.setProperty('--tx', x));

  // thủy triều: mỗi ô đếm ngược là một ống nước dâng theo giá trị
  const cd = main.querySelector('.countdown:not(.countdown-done)');
  if (cd) {
    const cells = [...cd.children], max = [365, 24, 60, 60];
    const upd = () => cells.forEach((cell, i) => { const v = +cell.querySelector('.n')?.textContent || 0; cell.style.setProperty('--fill', (i === 0 ? clamp(v / 365) : clamp(v / max[i])).toFixed(3)); });
    upd(); setInterval(upd, 1000);
  }

  // 1) Hai lối đi, một bờ cát: hai hàng dấu chân gặp nhau (quê hai người / nơi gặp nhau)
  {
    const hs = P.get('hometowns', {}), pl = P.get('metPlace'), n = P.daysTogether;
    if ((hs.bride && hs.groom) || pl) {
      const pins = P.get('hometownPins', {}), km = pins.bride && pins.groom ? Math.round(P.kmBetween(pins.bride, pins.groom) / 10) * 10 : 0;
      const A = hs.bride || short('bride'), B = hs.groom || short('groom');
      adds.trails = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Hai lối đi</p><h2 class="title">Hai bước chân, một bờ cát</h2></header>
        <div class="tr"><div class="tr-l"><b>${e(A)}</b><span>${e(short('bride'))}</span></div><div class="tr-r"><b>${e(B)}</b><span>${e(short('groom'))}</span></div>
          <svg viewBox="0 0 400 330" role="img" aria-label="Hai hàng dấu chân gặp nhau"><g class="prints"></g><g class="heart" transform="translate(200 296)"><path d="M0 12 C-22 -2 -14 -22 0 -10 C14 -22 22 -2 0 12Z" fill="#c9694f"/></g></svg>
        </div>
        <p class="tr-note">${pl ? `Rồi gặp nhau ở <b>${e(pl)}</b>${n ? `, ${fmt(n)} ngày trước ngày cưới` : ''}.` : ''}${km ? ` Hai quê cách nhau khoảng ${fmt(km)} km.` : ''}</p>
      </div>`;
    }
  }

  // 2) Bản đồ kho báu: những nơi hai người đã đi qua
  {
    const pls = P.get('places', []);
    if (pls.length >= 2) {
      const la = pls.map(p => p.lat), lo = pls.map(p => p.lng);
      const mnLa = Math.min(...la), mxLa = Math.max(...la), mnLo = Math.min(...lo), mxLo = Math.max(...lo);
      const X = p => 50 + (mxLo === mnLo ? .5 : (p.lng - mnLo) / (mxLo - mnLo)) * 300, Y = p => 40 + (mxLa === mnLa ? .5 : 1 - (p.lat - mnLa) / (mxLa - mnLa)) * 200;
      const pts = pls.map(p => [X(p), Y(p)]);
      const path = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
      adds.map = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Bản đồ kho báu</p><h2 class="title">Những nơi chúng mình đã đi qua</h2></header>
        <div class="tmap"><svg viewBox="0 0 400 280" role="img" aria-label="Bản đồ các địa điểm">
          <path class="route" d="${path}" pathLength="1" fill="none" stroke="#a45a3c" stroke-width="2.2" stroke-dasharray="1" stroke-dashoffset="1" stroke-linecap="round"/>
          ${pts.map((q, i) => `<g class="pin" style="--i:${i}" transform="translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})"><circle r="13" fill="#a45a3c"/><text y="5" text-anchor="middle">${i + 1}</text></g>`).join('')}
        </svg></div>
        <ol class="places">${pls.map(p => `<li><b>${e(p.name)}</b>${p.date ? `<span>${dmy(p.date)}</span>` : ''}</li>`).join('')}</ol>
      </div>`;
    }
  }

  // 3) Hai lá thư trong chai
  {
    const lb = P.get('letters.bride'), lg = P.get('letters.groom');
    if (lb || lg) {
      const items = [['bride', lb], ['groom', lg]].filter(x => x[1]);
      adds.letters = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Thư trong chai</p><h2 class="title">Hai lá thư gửi nhau</h2><p class="sub">Chạm vào chai để mở nút bần.</p></header>
        <div class="lbs">${items.map(([k, t]) => `<div class="lb"><button type="button" class="lb-b" aria-expanded="false" aria-label="Mở thư của ${e(short(k))}">${SMALL}</button><p class="lb-n">${e(short(k))}</p><div class="lb-t" hidden><p>${e(t)}</p></div></div>`).join('')}</div>
      </div>`;
    }
  }

  // 4) Thả chai xuống biển (khách để lại lời nhắn, hiện cho mọi người)
  adds.bottles = `<div class="wrap narrow">
    <header class="head"><p class="eyebrow">Thả chai</p><h2 class="title">Gửi một lời nhắn ra biển</h2><p class="sub">Viết vài dòng, chai của bạn sẽ trôi cùng những chai khác.</p></header>
    <div class="sea-box"><div class="bb-sea" aria-live="polite"></div><div class="bb-wv" aria-hidden="true">${WAVE('rgba(95,168,184,.55)', 'rgba(255,255,255,.7)', 30)}</div></div>
    <div class="bb-read" hidden></div>
    <form class="bb-form" novalidate>
      <label class="field"><span>Tên của bạn</span><input name="name" maxlength="40" autocomplete="name"></label>
      <label class="field"><span>Lời nhắn</span><input name="msg" maxlength="120" placeholder="Chúc hai bạn trăm năm hạnh phúc"></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn" type="submit">Thả chai</button>
    </form>
  </div>`;

  const place = (id, html, after) => {
    if (!html) return;
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} bt-add`; s.innerHTML = html;
    const a = [].concat(after).map(x => main.querySelector(`#${x}`)).find(Boolean);
    if (a) a.insertAdjacentElement('afterend', s); else main.appendChild(s);
  };
  place('trails', adds.trails, ['story', 'families', 'hero']);
  place('map', adds.map, ['trails', 'story', 'hero']);
  place('letters', adds.letters, ['map', 'trails', 'story']);
  place('bottles', adds.bottles, ['guestbook', 'gallery', 'faq', 'rsvp']);

  // dấu chân hiện dần theo thanh cuộn
  const tr = main.querySelector('#trails .tr');
  if (tr) {
    const g = tr.querySelector('.prints'), N = 9, feet = [];
    const bez = (a, b, c2, t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c2;
    [[-1, 36, 24], [1, 364, 24]].forEach(([side, sx, sy]) => {
      for (let i = 0; i < N; i++) {
        const t = (i + .5) / N, x = bez(sx, sx + side * 60 - side * 10 + (side > 0 ? -150 : 150) * .2, 200 - side * 14, t), y = bez(sy, 190, 292, t);
        const x2 = bez(sx, sx + (side > 0 ? -150 : 150) * .2, 200 - side * 14, Math.min(1, t + .03)), y2 = bez(sy, 190, 292, Math.min(1, t + .03));
        const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI - 90, off = (i % 2 ? 1 : -1) * 6;
        const gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gEl.setAttribute('transform', `translate(${(x + off * Math.cos((ang + 90) * Math.PI / 180)).toFixed(1)} ${(y + off * Math.sin((ang + 90) * Math.PI / 180)).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${side > 0 && i % 2 ? -1.5 : 1.5} 1.5)`);
        gEl.setAttribute('class', 'ft'); gEl.innerHTML = '<ellipse cx="0" cy="3" rx="4" ry="6.4"/><circle cx="-3.2" cy="-5" r="1.5"/><circle cx="0" cy="-6.4" r="1.6"/><circle cx="3.2" cy="-5" r="1.5"/>';
        g.appendChild(gEl); feet.push({ el: gEl, k: (i + .5) / N });
      }
    });
    const heart = tr.querySelector('.heart');
    M.scrollProgress(tr, p => {
      const q = clamp((p - .22) / .38);
      feet.forEach(f => f.el.style.opacity = M.reduced ? 1 : clamp((q - f.k * .85) / .15).toFixed(2));
      heart.style.opacity = M.reduced ? 1 : clamp((q - .88) / .12);
      heart.style.transform = `translate(200px, 296px) scale(${.6 + .4 * clamp((q - .88) / .12)})`;
    });
  }
  // bản đồ: đường đi tự vẽ, ghim nảy lên
  const tm = main.querySelector('#map .tmap');
  if (tm) M.inView(tm, () => tm.classList.add('go'), { threshold: .4 });
  // lá thư trong chai: mở nút bần
  main.querySelectorAll('.lb-b').forEach(b => b.addEventListener('click', () => {
    const box = b.closest('.lb'), t = box.querySelector('.lb-t'), open = t.hidden;
    M.tone('pop'); M.haptic('thud');
    t.hidden = !open; b.setAttribute('aria-expanded', String(open)); box.classList.toggle('opened', open);
  }));

  // thả chai
  const sb = main.querySelector('.bb-sea');
  if (sb) {
    const read = main.querySelector('.bb-read'), form = main.querySelector('.bb-form');
    let list = [];
    const draw = () => {
      const arr = list.slice(-14);
      sb.innerHTML = arr.length ? arr.map((m, i) => { const h = [...String(m.name) + i].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
        return `<button type="button" class="bb" data-i="${list.length - arr.length + i}" style="left:${6 + (h % 80)}%;top:${8 + ((h >> 4) % 46)}%;--d:${(h % 30) / 10}s" aria-label="Chai của ${e(m.name)}">${SMALL}</button>`; }).join('') : '<p class="bb-empty">Biển còn vắng. Hãy là người đầu tiên thả chai.</p>';
      sb.querySelectorAll('.bb').forEach(b => b.addEventListener('click', () => {
        const m = list[+b.dataset.i]; M.tone('pop'); M.haptic('tap');
        read.hidden = false; read.innerHTML = `<p class="rd-m">${e(m.msg)}</p><p class="rd-n">${e(m.name)}</p>`;
      }));
    };
    EA.shared.list('bottles').then(l => { list = l.filter(x => x.msg); draw(); }).catch(draw);
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const name = form.name.value.trim(), msg = form.msg.value.trim(), er = form.querySelector('.form-error');
      if (!name || !msg) { er.textContent = 'Điền tên và lời nhắn giúp chúng mình nhé.'; er.hidden = false; return; }
      er.hidden = true;
      await EA.shared.add('bottles', { name, msg });
      list.push({ name, msg }); draw(); form.msg.value = ''; M.tone('pop'); M.haptic('success');
      sb.lastElementChild?.classList.add('drop');
    });
    if (!form.name.value && c.guest !== D.defaultGuest) form.name.value = c.guest;
  }

  // finale: sau RSVP, một chiếc chai nhỏ chở thư hồi âm ra khơi
  EA.onRsvp(entry => {
    M.tone('chime'); M.haptic('success');
    document.querySelector('.bt-sail')?.remove();
    const s = document.createElement('div');
    s.className = 'bt-sail'; s.setAttribute('role', 'status');
    s.innerHTML = `<div class="sv">${WAVE('rgba(95,168,184,.9)', 'rgba(255,255,255,.7)', 44)}</div><div class="sb">${SMALL}</div><p>${entry.attending ? 'Thư hồi âm của bạn đã ra khơi' : 'Lời nhắn của bạn đã ra khơi'}</p>`;
    document.body.appendChild(s);
    requestAnimationFrame(() => s.classList.add('on'));
    setTimeout(() => { s.classList.remove('on'); setTimeout(() => s.remove(), 900); }, M.reduced ? 3500 : 5600);
  });
});
