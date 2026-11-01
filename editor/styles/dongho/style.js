// Tranh Đông Hồ: những mộc bản khắc tay lần lượt in từng lớp màu (vàng, đỏ, đen) lên giấy điệp.
// Cover: kéo khuôn gỗ xuống tờ giấy -> ba lần đóng dấu liên tiếp -> con dấu son -> giấy điệp ánh lên -> thiệp mở.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const initials = s => String(s || '').replace(/[\s&]/g, '');

const K = '#15110d', RED = '#c0281a', YEL = '#e0a02a', GRN = '#3f6a3a', PAPER = '#efe4c6';

// ---------- tranh khắc: cặp cá chép âm dương, ba lớp màu ----------
const FA = 'M150 36a64 64 0 0 1 0 128a32 32 0 0 1 0-64a32 32 0 0 0 0-64z';
const FB = 'M150 164a64 64 0 0 1 0-128a32 32 0 0 1 0 64a32 32 0 0 0 0 64z';
const TAIL = 'M150 40C142 30 132 18 112 14C120 26 122 38 116 48C128 46 140 46 150 42Z';
const CLOUD = 'M16 84c-2-16 20-24 30-12c8 10-4 22-14 18c-8-3-6-12 0-12';
const waves = y => `M10 ${y}q8-9 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0`;
const ART = {
  y: `<g transform="translate(1.6 -1)"><path d="${FB}" fill="${YEL}"/><path d="${TAIL}" fill="${YEL}" transform="rotate(180 150 100)"/>
      <ellipse cx="62" cy="150" rx="22" ry="9" fill="${YEL}" opacity=".85"/><ellipse cx="238" cy="150" rx="22" ry="9" fill="${YEL}" opacity=".85"/>
      ${[[40, 40], [260, 40], [96, 30], [204, 30], [70, 120], [230, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${YEL}"/>`).join('')}</g>`,
  r: `<g transform="translate(-1.2 1.2)"><path d="${FA}" fill="${RED}"/><path d="${TAIL}" fill="${RED}"/><circle cx="58" cy="42" r="15" fill="${RED}"/>
      <path d="M14 14h22v5H19v17h-5zM286 14h-22v5h17v17h5zM14 186h22v-5H19v-17h-5zM286 186h-22v-5h17v-17h5z" fill="${RED}"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${96 + i * 18}" cy="186" r="2.6" fill="${RED}"/>`).join('')}</g>`,
  k: `<rect x="8" y="8" width="284" height="184" fill="none" stroke="${K}" stroke-width="3.4"/><rect x="13" y="13" width="274" height="174" fill="none" stroke="${K}" stroke-width="1"/>
      <path d="${FA}" fill="url(#dh-sc)"/><path d="${FB}" fill="url(#dh-sc)"/>
      <g fill="none" stroke="${K}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><path d="${FA}"/><path d="${FB}"/><path d="${TAIL}"/><path d="${TAIL}" transform="rotate(180 150 100)"/>
        <path d="M184 112q9 14 0 30"/><path d="M116 88q-9-14 0-30" /><path d="M126 48c4-8 8-12 14-14M174 152c-4 8-8 12-14 14" stroke-width="2"/></g>
      <circle cx="170" cy="128" r="6" fill="${PAPER}" stroke="${K}" stroke-width="2.6"/><circle cx="170" cy="128" r="2.4" fill="${K}"/>
      <circle cx="130" cy="72" r="6" fill="${PAPER}" stroke="${K}" stroke-width="2.6"/><circle cx="130" cy="72" r="2.4" fill="${K}"/>
      <g fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"><path d="${CLOUD}"/><path d="${CLOUD}" transform="translate(300 0) scale(-1 1)"/>
        <path d="${CLOUD}" transform="translate(0 44) scale(.7)"/><path d="${CLOUD}" transform="translate(300 44) scale(-.7 .7)"/>
        <path d="${waves(172)}" stroke-width="2.2" clip-path="url(#dh-clip)"/></g>
      <circle cx="58" cy="42" r="15" fill="none" stroke="${K}" stroke-width="2.6"/><circle cx="242" cy="42" r="15" fill="none" stroke="${K}" stroke-width="2.6"/><path d="M234 42h16M242 34v16" stroke="${K}" stroke-width="1.6"/>`
};
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <filter id="dh-ink" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.7" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
  <filter id="dh-ink2" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
  <pattern id="dh-sc" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M0 10a7 7 0 0 1 14 0" fill="none" stroke="${K}" stroke-width="1.1" opacity=".75"/></pattern>
  <clipPath id="dh-clip"><rect x="14" y="14" width="272" height="172"/></clipPath></defs></svg>`;

// ---------- hình dân gian nhỏ (mèo, chó, đàn, cọ, sách, sen, cá) ----------
const sk = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const ICONS = {
  cat: `<path d="M20 90c-6-26 6-42 30-42s36 16 30 42z" fill="${RED}" ${sk}/><path d="M80 88c16 0 18-18 8-26" fill="none" ${sk}/><circle cx="50" cy="36" r="20" fill="${YEL}" ${sk}/><path d="M32 24l-4-16 15 9zM68 24l4-16-15 9z" fill="${YEL}" ${sk}/><circle cx="43" cy="34" r="3" fill="${K}"/><circle cx="57" cy="34" r="3" fill="${K}"/><path d="M47 42l3 3 3-3z" fill="${RED}" ${sk}/><path d="M30 42h-12M30 47l-11 4M70 42h12M70 47l11 4" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`,
  dog: `<path d="M22 90c-4-24 8-40 28-40s32 16 28 40z" fill="${RED}" ${sk}/><ellipse cx="50" cy="36" rx="19" ry="20" fill="${YEL}" ${sk}/><path d="M32 22c-14 0-16 22-8 30c6-4 10-14 8-30zM68 22c14 0 16 22 8 30c-6-4-10-14-8-30z" fill="${RED}" ${sk}/><ellipse cx="50" cy="46" rx="9" ry="7" fill="${PAPER}" ${sk}/><circle cx="50" cy="43" r="3" fill="${K}"/><circle cx="42" cy="32" r="2.8" fill="${K}"/><circle cx="58" cy="32" r="2.8" fill="${K}"/>`,
  fish: `<path d="M12 50c14-22 40-26 62-8c-14 2-14 14 0 16c-22 18-48 14-62-8z" fill="${RED}" ${sk}/><path d="M74 42l16-14v44l-16-14" fill="${YEL}" ${sk}/><circle cx="30" cy="46" r="3.4" fill="${PAPER}" stroke="${K}" stroke-width="2"/><g fill="none" stroke="${K}" stroke-width="1.6"><path d="M44 40a8 8 0 0 1 8 8M54 36a8 8 0 0 1 8 8M44 54a8 8 0 0 1 8-8"/></g>`,
  guitar: `<path d="M48 58l34-40" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M48 58l34-40" stroke="${YEL}" stroke-width="5" stroke-linecap="round"/><path d="M80 12l10 6-6 10z" fill="${RED}" ${sk}/><path d="M42 54a13 13 0 0 0-14 14a15 15 0 1 0 24 8a11 11 0 0 0-10-22z" fill="${RED}" ${sk}/><circle cx="38" cy="68" r="5" fill="${K}"/>`,
  brush: `<path d="M12 62c0-22 22-36 44-30c18 5 24 22 12 30c-8 6-4 14-16 18c-22 6-40 0-40-18z" fill="${YEL}" ${sk}/><circle cx="32" cy="58" r="5" fill="${RED}" stroke="${K}" stroke-width="2"/><circle cx="46" cy="48" r="5" fill="${GRN}" stroke="${K}" stroke-width="2"/><circle cx="58" cy="60" r="5" fill="${K}"/><path d="M52 44l36-34" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M52 44l36-34" stroke="${PAPER}" stroke-width="4" stroke-linecap="round"/><path d="M44 52l8-8" stroke="${RED}" stroke-width="9" stroke-linecap="round"/>`,
  book: `<path d="M50 26c-12-8-28-8-40-4v52c12-4 28-4 40 4c12-8 28-8 40-4V22c-12-4-28-4-40 4z" fill="${YEL}" ${sk}/><path d="M50 26v52" fill="none" ${sk}/><g stroke="${RED}" stroke-width="3" stroke-linecap="round"><path d="M18 36c8-2 16-2 24 2M18 46c8-2 16-2 24 2M58 38c8-4 16-4 24-2M58 48c8-4 16-4 24-2"/></g>`,
  camera: `<rect x="12" y="30" width="76" height="50" rx="6" fill="${YEL}" ${sk}/><path d="M32 30l6-10h24l6 10" fill="${RED}" ${sk}/><circle cx="50" cy="55" r="17" fill="${PAPER}" ${sk}/><circle cx="50" cy="55" r="8" fill="${RED}" stroke="${K}" stroke-width="2.4"/>`,
  lotus: `<path d="M50 80c-6-14-6-30 0-44c6 14 6 30 0 44z" fill="${RED}" ${sk}/><path d="M50 80c-20-4-34-18-34-34c16 2 28 14 34 34zM50 80c20-4 34-18 34-34c-16 2-28 14-34 34z" fill="${YEL}" ${sk}/><path d="M10 86h80" ${sk} fill="none"/><path d="M26 86c8-8 18-10 24-10s16 2 24 10z" fill="${GRN}" ${sk}/>`
};
const hobbyIcon = h => { const n = norm(h); return /guitar|dan|nhac|hat|piano/.test(n) ? 'guitar' : /ve|mau nuoc|tranh|hoa/.test(n) ? 'brush' : /sach|doc|viet/.test(n) ? 'book' : /chup|anh|camera|phim/.test(n) ? 'camera' : 'lotus'; };
const petIcon = k => { const n = norm(k); return /meo|cat/.test(n) ? 'cat' : /cho|dog|cun/.test(n) ? 'dog' : 'fish'; };
const icon = k => `<svg viewBox="0 0 100 100" class="ic" aria-hidden="true">${ICONS[k]}</svg>`;

// ---------- cover ----------
let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  el.className = 'cover dh-cover';
  el.style.cssText = '';
  el.innerHTML = `${DEFS}
    <div class="dh-wrap">
      <div class="dh-paper">
        <div class="dh-top"><span>Tin vui</span><span>Hỷ sự</span></div>
        <div class="dh-art">
          <i class="reg a" aria-hidden="true"></i><i class="reg b" aria-hidden="true"></i><i class="reg c" aria-hidden="true"></i><i class="reg d" aria-hidden="true"></i>
          <svg class="ghost" viewBox="0 0 300 200" aria-hidden="true"><circle cx="150" cy="100" r="64" fill="none" stroke="${K}" stroke-width="1.4" stroke-dasharray="3 5"/><rect x="8" y="8" width="284" height="184" fill="none" stroke="${K}" stroke-width="1.2" stroke-dasharray="3 5"/></svg>
          <svg class="ly y" viewBox="0 0 300 200" aria-hidden="true">${ART.y}</svg>
          <svg class="ly r" viewBox="0 0 300 200" aria-hidden="true">${ART.r}</svg>
          <svg class="ly k" viewBox="0 0 300 200" aria-hidden="true">${ART.k}</svg>
          <span class="dh-seal" aria-hidden="true">${e(initials(D.monogram))}</span>
          <div class="blk" role="slider" tabindex="0" aria-label="Khuôn gỗ. Kéo xuống tờ giấy để in tranh" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="hd"></i></div>
        </div>
        <div class="dh-names"><p class="n">${e(D.bride.name)}</p><p class="s">sánh duyên</p><p class="n">${e(D.groom.name)}</p></div>
        <p class="dh-date">${c.d} · ${c.m} · ${c.y}</p>
        <p class="dh-to">Kính mời <b>${e(c.guest)}</b></p>
        <i class="dh-sheen" aria-hidden="true"></i>
      </div>
      <p class="dh-hint">Kéo khuôn gỗ xuống tờ giấy điệp để in tranh</p>
      <button class="open-btn" type="button">In tranh</button>
    </div>`;

  const $ = s => el.querySelector(s);
  const paper = $('.dh-paper'), blk = $('.blk'), art = $('.dh-art'), hint = $('.dh-hint');
  const ly = { y: $('.ly.y'), r: $('.ly.r'), k: $('.ly.k') };
  const S = { p: 0 };
  let locked = false, ended = false, musicOn = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(fn => { try { fn(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  if (M.tier === 'low') el.classList.add('low');

  const setBlk = (by, sc, sh, o = 1) => { blk.style.setProperty('--by', by.toFixed(2)); blk.style.setProperty('--bs', sc.toFixed(3)); blk.style.setProperty('--sh', sh.toFixed(1)); blk.style.setProperty('--bo', o); };
  const setP = v => { S.p = clamp(v); setBlk(-64 * (1 - S.p), 1 + .16 * (1 - S.p), 2 + 26 * (1 - S.p)); blk.setAttribute('aria-valuenow', Math.round(S.p * 100)); };
  setP(0);

  // ambient: giấy điệp lấp lánh theo nghiêng máy
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x.toFixed(3)); el.style.setProperty('--ty', y.toFixed(3)); } }));

  const begin = () => { if (musicOn) return; musicOn = true; EA.music(); M.requestTilt(); hint.classList.add('gone'); };
  const print = (k, tone, hap) => {
    ly[k].classList.add('on'); M.tone(tone); M.haptic(hap);
    paper.classList.remove('hit', 'hit-k'); void paper.offsetWidth; paper.classList.add(k === 'k' ? 'hit-k' : 'hit');
  };
  const drop = async (rim, ms) => {
    blk.style.setProperty('--rim', rim);
    setBlk(-150, 1.3, 36, 1);
    await M.tween(0, 1, ms, t => t * t * t, v => setBlk(-150 * (1 - v), 1.3 - .3 * v, 36 - 34 * v));
  };
  const lift = async ms => { await M.tween(0, 1, ms, 'out', v => setBlk(-150 * v, 1 + .3 * v, 2 + 34 * v, 1 - v * .9)); };

  async function finish(fromP) {
    if (locked || ended) return;
    locked = true; begin(); el.classList.add('busy');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    if (M.reduced) { Object.values(ly).forEach(l => l.classList.add('on')); el.classList.add('sealed'); setTimeout(() => { if (!ended) open(); }, 700); return; }
    // 1. vàng: khuôn đã được kéo xuống
    M.tone('whoosh');
    await M.tween(S.p, 1, 130 + 200 * (1 - S.p), t => t * t * t, setP);
    if (ended) return;
    print('y', 'click', 'tap');
    await wait(120); if (ended) return;
    await lift(200); if (ended) return;
    // 2. đỏ
    await wait(60); if (ended) return;
    await drop(RED, 300); if (ended) return;
    print('r', 'thud', 'thud');
    await wait(110); if (ended) return;
    await lift(200); if (ended) return;
    // 3. đen: nét cuối, nặng tay nhất
    await wait(60); if (ended) return;
    await drop(K, 340); if (ended) return;
    print('k', 'thud', 'crack');
    el.classList.add('inked');
    await wait(160); if (ended) return;
    await lift(260); if (ended) return;
    blk.hidden = true;
    // 4. con dấu son và giấy điệp ánh lên
    await wait(80); if (ended) return;
    el.classList.add('sealed'); M.tone('pop'); M.haptic('tap');
    await wait(330); if (ended) return;
    el.classList.add('shine'); M.tone('chime'); M.haptic('success');
    await wait(1250); if (ended) return;
    el.classList.add('lift');
    await wait(380); if (ended) return;
    open();
    setTimeout(stopCover, 1200);
  }

  let base = 0, moved = false;
  blk.addEventListener('pointerdown', () => { if (locked) return; base = S.p; moved = false; begin(); blk.style.setProperty('--rim', YEL); });
  M.drag(blk, {
    axis: 'y', distance: 1,
    onMove: (_p, _dx, dy) => { if (locked) return; if (Math.abs(dy) > 5) moved = true; if (moved) { const h = art.clientHeight * .62; const p = base + dy / h; setP(p); const k = Math.floor(S.p * 5); if (k !== (blk._k | 0)) { blk._k = k; if (k > 0) M.haptic('tap'); } } },
    onEnd: () => { if (locked || !moved) return; if (S.p >= .55) finish(); else M.tween(S.p, 0, 420, 'outBack', setP); }
  });
  blk.addEventListener('keydown', ev => { if (['Enter', ' ', 'ArrowDown'].includes(ev.key) && !locked) { ev.preventDefault(); begin(); finish(); } });
  $('.open-btn').addEventListener('click', () => { locked || finish(); }, { once: true });
});

// ---------- layouts ----------
EA.section('events', ({ data: D, esc: e, ui, d, m }) => `<div class="wrap">
  ${ui.head('Ngày vui', 'Ngày chúng mình thành đôi')}
  <div class="couplet">
    ${D.events.map(ev => `
      <article class="scroll-hang">
        <span class="rod" aria-hidden="true"></span>
        <div class="paper">
          <p class="label">${e(ev.label)}</p>
          <h3>${e(ev.title)}</h3>
          <p class="big">${e(ev.time)}</p>
          <p class="day">ngày ${d} tháng ${+m}</p>
          <p class="place">${e(ev.place)}</p>
          <p class="addr">${e(ev.address)}</p>
          ${ui.actions(ev)}
        </div>
        <span class="rod" aria-hidden="true"></span>
      </article>`).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <ol class="prints">
    ${D.itinerary.map(it => `<li><time>${e(it.time)}</time><strong>${e(it.title)}</strong><span>${e(it.note)}</span></li>`).join('')}
  </ol>
</div>`);

EA.section('announce', ({ data: D, esc: e, ui, dow, d, m, y }) => `<div class="wrap">
  <div class="folk">
    <p class="banner">Tin vui</p>
    <div class="families">
      ${ui.family('Nhà gái', D.brideFamily)}
      <div class="mono" aria-hidden="true">${e(D.monogram)}</div>
      ${ui.family('Nhà trai', D.groomFamily)}
    </div>
    <p class="kicker">Trân trọng báo tin lễ thành hôn của</p>
    <h2 class="couple"><span>${e(D.bride.name)}</span><span class="amp">sánh duyên</span><span>${e(D.groom.name)}</span></h2>
    <p class="note">${e(D.announceNote)}</p>
    <p class="folk-date">${dow} · ${d} · ${m} · ${y}</p>
  </div>
</div>`);

EA.section('gallery', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Tranh của chúng mình')}
  <div class="prints-wall">
    ${D.photos.map((p, i) => `<figure class="print-frame">${ui.photo(p, i)}<figcaption><span class="seal-sm" aria-hidden="true">${e(initials(D.monogram))}</span>${e(p.caption)}</figcaption></figure>`).join('')}
  </div>
</div>`);

EA.section('contact', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Liên hệ', 'Chúng mình luôn ở đây')}
  <div class="seals">
    ${[['Cô dâu', D.bride], ['Chú rể', D.groom]].map(([r, p]) => `
      <a class="seal-card" href="tel:${e(p.phone.replace(/\s/g, ''))}"><span class="stamp-red">${e(p.short)}</span><small>${r}</small><b>${e(p.name)}</b><span>${e(p.phone)}</span></a>`).join('')}
  </div>
</div>`);

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="dh-poster">
    <p class="dh-band">Hỷ sự · ${c.d}.${c.m}.${c.y}</p>
    <div class="dh-img"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><button class="dh-seal-b" type="button" aria-label="Con dấu son. Chạm ba lần để đóng thêm dấu">${e(initials(cp.monogram))}</button></div>
    <h1 class="couple"><span>${e(cp.brideName)}</span><span class="amp">sánh duyên</span><span>${e(cp.groomName)}</span></h1>
    <p class="headline">${c.t(cp.headline)}</p>
    ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Tranh truyện của chúng mình')}
  <div class="strip">
    ${(mod.content.chapters || []).map((ch, i) => `
      <article class="panel">
        <span class="panel-no">${i + 1}</span>
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <div class="caption"><h3>${e(ch.title)}</h3><p>${e(ch.date)} — ${e(ch.text)}</p></div>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Nhận lời mời')}
  <div class="dh-form">${ui.rsvpForm()}</div>
</div>`);

// ---------- sau khi render ----------
const WISHES = ['Trăm năm hạnh phúc', 'Đầu bạc răng long', 'Sắt cầm hòa hợp', 'Vợ chồng thuận hòa'];

EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const short = k => D[k].short || D[k].name;
  const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : `tháng ${+m[2]} năm ${m[1]}`) : ''; };
  const marks = ['Hỷ', 'Phúc', 'Lộc', 'Thọ', initials(D.monogram)];

  // lớp giấy điệp lấp lánh ở nền, trượt theo cuộn trang và nghiêng máy
  if (!c.reduced && M.tier !== 'low') {
    document.body.insertAdjacentHTML('afterbegin', '<div class="dh-glint" aria-hidden="true"></div>');
    const root = document.documentElement.style; let raf = 0, tx = 0, ty = 0;
    const upd = () => { raf = 0; root.setProperty('--gy', (scrollY * -.18 + ty * 22).toFixed(1)); root.setProperty('--gx', (tx * 28).toFixed(1)); };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(upd); }, { passive: true });
    M.tilt(({ x, y }) => { tx = x; ty = y; raf ||= requestAnimationFrame(upd); });
  }

  // tiêu đề các phần được "in" khi cuộn tới
  main.querySelectorAll('.head').forEach(h => { h.classList.add('prn'); M.inView(h, () => h.classList.add('in'), { threshold: .4 }); });

  // --- add-on ---
  const adds = [];
  const tr = k => P.get(`traits.${k}`, {});
  const pet = P.get('pet', {});
  const figs = [];
  [['bride', tr('bride')], ['groom', tr('groom')]].forEach(([k, t]) => {
    if (t.hobby) figs.push({ ic: hobbyIcon(t.hobby), cap: t.hobby, sub: `${short(k)}${t.nickname ? ` · “${t.nickname}”` : ''}`, k });
  });
  if (pet.name) figs.splice(1, 0, { ic: petIcon(pet.kind), cap: pet.name, sub: pet.kind ? `Bé ${pet.kind} của nhà` : 'Thành viên nhà mình', pet: true });
  if (figs.length) {
    adds.push(['tranh', `<div class="wrap">
      <header class="head"><p class="eyebrow">Tranh khắc</p><h2 class="title">Tranh của đôi ta</h2><p class="sub">Những gương mặt thân quen trong ngôi nhà nhỏ, khắc theo lối tranh dân gian.</p></header>
      <div class="figs">${figs.map((f, i) => `<figure class="fig${f.pet ? ' pet' : ''}" style="--i:${i}"${f.pet ? ' tabindex="0"' : ''}><div class="fig-ic">${icon(f.ic)}</div><figcaption><b>${e(f.cap)}</b><span>${e(f.sub)}</span></figcaption></figure>`).join('')}</div></div>`]);
  }
  // 2. duyên khởi
  if (P.has('metDate') && P.daysTogether != null) {
    const n = P.daysTogether, place = P.get('metPlace', ''), city = P.get('metCity', '');
    adds.push(['duyen', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Duyên khởi</p><h2 class="title">Ngày hai ta gặp nhau</h2></header>
      <div class="plaque" role="group" aria-label="Ngày gặp ${dmy(P.get('metDate'))}, đã bên nhau ${fmt(n)} ngày">
        <p class="pl-d">Ngày ${dmy(P.get('metDate'))}</p>
        ${place ? `<p class="pl-p">${e(place)}${city ? `, ${e(city)}` : ''}</p>` : ''}
        <p class="pl-n"><b class="num" data-n="${n}">${fmt(n)}</b><span>ngày bên nhau</span></p>
        <i class="pl-seal" aria-hidden="true">${e(initials(D.monogram))}</i>
      </div></div>`]);
  }
  // 3. mộc bản chúc phúc
  const wl = [...WISHES];
  if (P.has('quote.text')) wl.push(P.get('quote.text'));
  if (P.has('song.lyric')) wl.push(P.get('song.lyric'));
  adds.push(['chuc', `<div class="wrap">
    <header class="head"><p class="eyebrow">Mộc bản chúc phúc</p><h2 class="title">Lời chúc in trên giấy điệp</h2><p class="sub">Chạm vào từng bản in để đóng lại dấu son.</p></header>
    <div class="wps">${wl.map((w, i) => `<button class="wp${i >= 4 ? ' long' : ''}" type="button" style="--i:${i}" aria-label="Đóng dấu lời chúc: ${e(w)}"><span class="wp-t">${e(w)}</span>${i === 4 && P.has('quote.author') ? `<small>${e(P.get('quote.author'))}</small>` : ''}${i === wl.length - 1 && P.has('song.title') && P.has('song.lyric') ? `<small>${e(P.get('song.title'))}</small>` : ''}<i class="wp-blk" aria-hidden="true"></i></button>`).join('')}</div></div>`]);
  // 4. dấu chân
  const pl = [];
  const hs = P.get('hometowns', {});
  if (hs.bride) pl.push({ n: hs.bride, t: `Quê ${short('bride')}` });
  if (hs.groom) pl.push({ n: hs.groom, t: `Quê ${short('groom')}` });
  (P.get('places', []) || []).slice(0, 4).forEach(x => { if (x.name) pl.push({ n: x.name, t: x.date ? dmy(x.date) : 'Một chặng đường' }); });
  if (pl.length) {
    adds.push(['dauchan', `<div class="wrap">
      <header class="head"><p class="eyebrow">Dấu chân</p><h2 class="title">Những nơi mình đã đi qua</h2></header>
      <ol class="trail">${pl.slice(0, 6).map((x, i) => `<li style="--i:${i}"><span class="tseal${x.n.length > 14 ? ' lg' : ''}"><b>${e(x.n)}</b></span><small>${e(x.t)}</small></li>`).join('')}</ol></div>`]);
  }
  let prev = main.querySelector('#story') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} dh-add`; s.innerHTML = html;
    prev ? prev.insertAdjacentElement('afterend', s) : main.appendChild(s);
    s.querySelectorAll('.head').forEach(h => { h.classList.add('prn'); M.inView(h, () => h.classList.add('in'), { threshold: .4 }); });
    prev = s;
  });
  const nums = [...main.querySelectorAll('.plaque .num')];
  if (nums.length) {
    if (!M.reduced) nums.forEach(x => { x.textContent = '0'; });
    M.inView(main.querySelector('.plaque'), () => nums.forEach(x => { const n = +x.dataset.n; M.tween(0, n, 1800, 'out', v => { x.textContent = fmt(v); }).then(() => { x.textContent = fmt(n); }); }), { threshold: .4 });
  }
  main.querySelectorAll('.trail li, .figs .fig').forEach(li => M.inView(li, () => li.classList.add('in'), { threshold: .25 }));
  // lời chúc: tự in khi cuộn tới, chạm để in lại
  const stamp = b => { b.classList.remove('stamp'); void b.offsetWidth; b.classList.add('on', 'stamp'); M.tone('thud'); M.haptic('tap'); };
  main.querySelectorAll('.wp').forEach((b, i) => {
    M.inView(b, () => setTimeout(() => b.classList.add('on'), i * 140), { threshold: .5 });
    b.addEventListener('click', () => stamp(b));
  });
  // thú cưng: chạm để vẫy
  main.querySelectorAll('.fig.pet').forEach(f => f.addEventListener('click', () => { f.classList.remove('wag'); void f.offsetWidth; f.classList.add('wag'); M.tone('pop'); M.haptic('tap'); }));

  // --- easter egg: chạm ba lần vào con dấu son ở trang đầu -> mưa dấu son ---
  const shower = () => {
    M.tone('chime'); M.haptic('success');
    if (c.reduced) return;
    for (let i = 0; i < 12; i++) setTimeout(() => {
      const s = document.createElement('span'); s.className = 'press-seal'; s.textContent = marks[i % marks.length];
      s.style.cssText = `left:${rnd(8, 92)}vw;top:${rnd(12, 88)}vh;--r:${rnd(-14, 14).toFixed(1)}deg`;
      document.body.appendChild(s); M.tone('click'); setTimeout(() => s.remove(), 2400);
    }, i * 110);
  };
  let taps = 0, tapT = 0;
  main.querySelector('.dh-seal-b')?.addEventListener('click', ev => {
    const now = Date.now(); taps = now - tapT < 1400 ? taps + 1 : 1; tapT = now;
    ev.currentTarget.classList.remove('pr'); void ev.currentTarget.offsetWidth; ev.currentTarget.classList.add('pr'); M.tone('pop'); M.haptic('tap');
    if (taps >= 3) { taps = 0; shower(); }
  });

  // --- sổ lưu bút: mỗi lời chúc là một bản in ---
  EA.onGuestbook(() => {
    M.tone('thud'); M.haptic('success');
    setTimeout(() => main.querySelectorAll('.wish-list').forEach(l => { const f = l.querySelector('.wish-item'); if (f) { f.classList.remove('just'); void f.offsetWidth; f.classList.add('just'); } }), 40);
  });

  // --- finale: dấu son "đã nhận" đóng lên tờ hồi âm ---
  EA.onRsvp(entry => {
    M.tone('thud'); M.haptic('crack');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const card = f.closest('.dh-form'); if (!card || card.querySelector('.dh-fin')) return;
        const yes = entry?.attending !== false, name = entry?.name || c.guest;
        card.insertAdjacentHTML('beforeend', `<div class="dh-fin" role="status"><p class="a">${yes ? 'Hân hạnh đón tiếp' : 'Đã nhận hồi âm'}</p><p class="b">${e(name)}</p><p class="c">${c.d}.${c.m}.${c.y}</p></div>`);
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        setTimeout(() => { M.tone('pop'); M.haptic('tap'); }, 320);
      });
    }, 30);
  });
});
