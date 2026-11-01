// Đông Dương 1930: một buổi sáng Sài Gòn.
// Cover: kéo hai cánh cửa chớp gỗ sang hai bên -> nắng tràn vào phố -> những viên gạch bông lật thành sóng, ghép thành chữ lồng của đôi bạn.
// Add-ons: bản đồ Sài Gòn xưa với nơi tổ chức, chiếc radio 1930 phát bài hát của hai người, thực đơn quán cà phê, hai ô gạch hai quê.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// ---- gạch bông: a seeded 4-fold tile, drawn as an inline SVG string ----
const PAL = [['#efe6d2', '#1f4d45', '#b8863b'], ['#efe6d2', '#8c2f2a', '#1f4d45'], ['#1f4d45', '#e3b55a', '#efe6d2'], ['#d9a441', '#1f4d45', '#8c2f2a'], ['#e6d3b0', '#2f5d8a', '#b8863b'], ['#efe6d2', '#b8863b', '#1f4d45']];
function tileSVG(seed, o = {}) {
  const h = hash(seed), pal = o.pal || PAL[h % PAL.length], [bg, a, b] = pal;
  const petal = 5 + (h >> 3) % 4, wide = 3.4 + ((h >> 5) % 4) * .6, kind = (h >> 7) % 3;
  const quarter = [0, 90, 180, 270].map(r => `<path transform="rotate(${r} 20 20)" d="M0 0h${9 + (h >> 9) % 4}a${9 + (h >> 9) % 4} ${9 + (h >> 9) % 4} 0 0 1-${9 + (h >> 9) % 4} ${9 + (h >> 9) % 4}z" fill="${b}"/>`).join('');
  const pet = [0, 90, 180, 270].map(r => `<ellipse transform="rotate(${r} 20 20)" cx="20" cy="${20 - petal - 1}" rx="${wide}" ry="${petal}" fill="${a}"/>`).join('');
  const diag = kind === 1 ? [45, 135, 225, 315].map(r => `<ellipse transform="rotate(${r} 20 20)" cx="20" cy="9" rx="2" ry="4.5" fill="${b}"/>`).join('') : kind === 2 ? `<rect x="14" y="14" width="12" height="12" transform="rotate(45 20 20)" fill="none" stroke="${b}" stroke-width="1.6"/>` : '';
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/>${quarter}${pet}${diag}<circle cx="20" cy="20" r="3" fill="${b}"/><rect x=".6" y=".6" width="38.800" height="38.800" fill="none" stroke="${a}" stroke-opacity=".35" stroke-width="1"/></svg>`;
}

const initials = c => {
  const parts = String(c.data.monogram || '').split('&').map(s => s.trim()).filter(Boolean);
  const ini = n => (String(n).trim().split(/\s+/).pop() || '?')[0].toUpperCase();
  return [parts[0] || ini(c.data.bride.name), parts[1] || ini(c.data.groom.name)];
};

const STREET = `<svg class="ic-street" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="ics" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d49b"/><stop offset=".5" stop-color="#fbe9c8"/><stop offset="1" stop-color="#f4d6a4"/></linearGradient>
  <radialGradient id="icg"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></radialGradient></defs>
  <rect width="300" height="420" fill="url(#ics)"/>
  <circle cx="226" cy="84" r="86" fill="url(#icg)"/><circle cx="226" cy="84" r="15" fill="#fff8dc"/>
  <g class="far" fill="#d9bb8f" opacity=".75"><rect x="40" y="120" width="26" height="90"/><path d="M40 120l13-44 13 44zM74 150h20v60H74z"/><rect x="100" y="132" width="26" height="78"/><path d="M100 132l13-40 13 40z"/><rect x="132" y="158" width="60" height="52"/></g>
  <g class="mid">
    <rect x="-10" y="188" width="320" height="170" fill="#e6b968"/><rect x="-10" y="188" width="320" height="10" fill="#c98a3e"/>
    <path d="M-10 176h320l-10 12H0z" fill="#9c3e2b"/>
    ${[18, 78, 138, 198, 258].map(x => `<g><path d="M${x} 262v-46a18 18 0 0 1 36 0v46z" fill="#2a6b5e"/><path d="M${x + 3} 262v-44a15 15 0 0 1 30 0v44z" fill="#f6e7c4"/><path d="M${x} 262v-46a18 18 0 0 1 18-18v64zM${x + 36} 262v-46a18 18 0 0 0-18-18v64z" fill="#2f7a69"/><path d="M${x + 4} 222h14M${x + 4} 230h14M${x + 4} 238h14M${x + 4} 246h14M${x + 18} 222h14M${x + 18} 230h14M${x + 18} 238h14M${x + 18} 246h14" stroke="#1e5448" stroke-width="1.600"/></g>`).join('')}
    <path d="M-10 272h320v10H-10z" fill="#b97a34"/><path d="M0 284h300l-8 26H8z" fill="#c8453a"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<path d="M${i * 30} 284h15l-1.500 26H${i * 30 + 1.500}z" fill="#f4e6c6"/>`).join('')}
    <rect x="-10" y="334" width="320" height="90" fill="#cfa86a"/><rect x="-10" y="334" width="320" height="6" fill="#9f7a3e"/>
  </g>
  <g class="near"><path d="M258 420V150c0-10 6-14 6-14h8s6 4 6 14v270z" fill="#4b3623"/>
    <g fill="#2c6a55"><circle cx="262" cy="118" r="42"/><circle cx="236" cy="144" r="30"/><circle cx="296" cy="140" r="32"/><circle cx="268" cy="86" r="26"/></g>
    <g fill="#38806a" opacity=".8"><circle cx="248" cy="102" r="18"/><circle cx="288" cy="120" r="16"/></g>
    <g stroke="#2a2a28" stroke-width="3" fill="none"><path d="M44 420V190"/><path d="M44 190c0-8 12-8 12 0"/></g><circle cx="50" cy="186" r="8" fill="#fff0b8" stroke="#2a2a28" stroke-width="2"/>
  </g></svg>`;

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  el.className = 'cover ic-cover';
  el.innerHTML = `
    <div class="ic-shafts" aria-hidden="true"></div>
    <div class="ic-fan"><svg viewBox="0 0 200 70" aria-hidden="true">
        <path d="M100 0v22" stroke="#3a2c20" stroke-width="3"/><rect x="88" y="20" width="24" height="12" rx="4" fill="#3a2c20"/>
        <g class="blades"><g class="spin"><rect x="98" y="26" width="86" height="10" rx="5" fill="#5a4330"/><rect x="16" y="26" width="86" height="10" rx="5" fill="#5a4330"/><rect x="95" y="34" width="10" height="28" rx="5" fill="#4a3727"/><rect x="95" y="2" width="10" height="28" rx="5" fill="#4a3727"/></g></g>
      </svg>
      <button class="cord" type="button" aria-label="Dây quạt trần. Kéo ba lần để thấy một điều thú vị"><i></i></button></div>
    <p class="ic-tip" hidden></p>
    <div class="ic-win" aria-label="Cửa sổ chớp gỗ. Kéo hai cánh cửa sang hai bên để mở">
      <div class="ic-view">
        ${STREET}
        <div class="ic-tiles" aria-hidden="true"></div>
        <div class="ic-medal" aria-hidden="true"><div class="in"><span>${e(initials(c)[0])}</span><i>&amp;</i><span>${e(initials(c)[1])}</span></div></div>
        <div class="ic-flood" aria-hidden="true"></div>
      </div>
      <div class="ic-shutter l"><i></i><b></b></div>
      <div class="ic-shutter r"><i></i><b></b></div>
      <div class="ic-frame" aria-hidden="true"></div>
    </div>
    <div class="ic-plaque">
      <p class="ic-k">Kính mời ${e(c.guest)}</p>
      <p class="ic-n">${e(D.bride.name.replace(' ', ' '))}</p>
      <p class="ic-amp" aria-hidden="true"><span></span><i>&amp;</i><span></span></p>
      <p class="ic-n">${e(D.groom.name.replace(' ', ' '))}</p>
      <p class="ic-d">${c.dow} · ${c.dateText}</p>
    </div>
    <p class="ic-hint">Kéo hai cánh cửa sang hai bên</p>
    <button class="open-btn" type="button">Mở cửa sổ</button>`;

  const $ = s => el.querySelector(s), win = $('.ic-win'), view = $('.ic-view'), tiles = $('.ic-tiles'), tip = $('.ic-tip'), hint = $('.ic-hint');
  const stops = [];
  let locked = false, ended = false, started = false, o = 0;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  const setO = v => { o = clamp(v); el.style.setProperty('--o', o.toFixed(4)); };
  setO(0);
  const begin = () => { if (started) return; started = true; EA.music(); M.requestTilt(); hint.classList.add('gone'); };

  // the tile wall, built to the size of the window
  let cells = 0;
  const build = () => {
    const W = view.clientWidth, H = view.clientHeight; if (!W || !H) return;
    const target = M.tier === 'low' ? 28 : M.tier === 'mid' ? 23 : 20;
    const cols = Math.max(9, Math.round(W / target)), size = W / cols, rows = Math.ceil(H / size);
    const light = `url("data:image/svg+xml,${encodeURIComponent(tileSVG('mono-a', { pal: ['#f4ecdc', '#a9c2b8', '#dcc592'] }))}")`, dark = `url("data:image/svg+xml,${encodeURIComponent(tileSVG('mono-b', { pal: ['#12302b', '#e3b55a', '#b8863b'] }))}")`;
    el.style.setProperty('--tl', light); el.style.setProperty('--td', dark);
    tiles.style.setProperty('--cols', cols); tiles.style.setProperty('--sz', size.toFixed(2) + 'px');
    let html = '';
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const d = Math.round(((cols - 1 - k) + (rows - 1 - r)) * (M.tier === 'low' ? 22 : 28) + rnd(0, 60));
      const e2 = Math.round(Math.hypot(k + .5 - cols / 2, r + .5 - rows / 2) * (M.tier === 'low' ? 36 : 46) + rnd(0, 50));
      html += `<i class="t${(k + r) % 5 === 0 ? ' k' : ''}" style="--d:${d};--e:${e2}"><b></b></i>`;
    }
    tiles.innerHTML = html; cells = cols * rows;
  };
  const rebuild = () => { if (!locked) build(); };
  requestAnimationFrame(build); document.fonts?.ready.then(() => { if (!locked) build(); });
  addEventListener('resize', rebuild); stops.push(() => removeEventListener('resize', rebuild));

  // ambient: the street breathes with the phone, light shafts slide, fan turns (CSS)
  if (M.tier !== 'low' && !M.reduced) stops.push(M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } }));

  // easter egg: kéo dây quạt ba lần
  let pulls = 0, lastPull = 0, tipTimer = 0;
  $('.cord').addEventListener('click', () => {
    if (locked) return;
    M.tone('click'); M.haptic('tap');
    const now = Date.now(); pulls = now - lastPull < 2200 ? pulls + 1 : 1; lastPull = now;
    el.classList.toggle('fast', pulls % 2 === 1);
    $('.cord').classList.remove('pull'); void $('.cord').offsetWidth; $('.cord').classList.add('pull');
    if (pulls < 3) return;
    pulls = 0; el.classList.add('fast');
    const a = nick('bride'), b = nick('groom');
    const line = a && b ? `Quạt chạy hết cỡ cho ${a} và ${b}` : c.p.get('insideJoke', 'Mát quá, ở lại thêm chút nữa nhé.');
    tip.textContent = line; tip.hidden = false; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
    M.tone('chime'); M.haptic('success');
    clearTimeout(tipTimer); tipTimer = setTimeout(() => { tip.hidden = true; el.classList.remove('fast'); }, 3400);
  });

  // gesture: kéo cánh cửa sang hai bên (kéo trái hoặc phải đều được)
  let x0 = 0, id = null, moved = false, ticks = 0;
  win.addEventListener('pointerdown', ev => { if (locked || ev.target.closest('.cord')) return; id = ev.pointerId; x0 = ev.clientX; moved = false; win.setPointerCapture?.(id); begin(); });
  win.addEventListener('pointermove', ev => {
    if (ev.pointerId !== id || locked) return;
    const dx = Math.abs(ev.clientX - x0); if (dx > 6) moved = true;
    if (!moved) return;
    setO(dx / (win.clientWidth * .38));
    const k = Math.floor(o * 5); if (k !== ticks) { ticks = k; if (k > 0 && k < 5) { M.haptic('tap'); M.tone('click'); } }
  });
  const up = ev => {
    if (ev.pointerId !== id) return; id = null;
    if (locked) return;
    if (!moved || o > .4) play(); else M.tween(o, 0, 450, 'out', setO);
  };
  win.addEventListener('pointerup', up); win.addEventListener('pointercancel', up);
  win.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') play(); });
  $('.open-btn').addEventListener('click', () => { play(); }, { once: true });

  async function play() {
    if (locked || ended) return;
    locked = true; begin(); build();
    el.classList.add('busy');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    M.tone('whoosh');
    const run = M.tween(o, 1, 1250 * (1 - o) + 250, 'inOut', setO);
    await wait(380 * (1 - o) + 120);
    M.haptic('crack'); M.tone('click');
    await run; if (ended) return;
    el.classList.add('lit');                       // sun floods the street
    await wait(650);
    try { await Promise.race([document.fonts.load('400 56px Prata'), new Promise(r => setTimeout(r, 1500))]); } catch { /* */ }
    el.classList.add('go');                        // the tile wave
    M.tone('thud'); M.haptic('thud');
    await wait(1550);
    el.classList.add('medal');                     // one framed medallion tile flips up in the middle
    M.tone('chime'); M.haptic('success');
    await wait(1000);
    el.classList.add('back');                      // the wall flips back from the centre outwards: street + medallion
    M.tone('whoosh');
    await wait(1900);
    open();
  }
});

// =============================================================================================
// layouts: arched doorways and an art-deco menu card
// =============================================================================================
EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi')}
  <div class="doors">
    ${D.events.map(ev => `
      <article class="door-card">
        <p class="label">${e(ev.label)}</p>
        <p class="time">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p class="place">${e(ev.place)}</p>
        <p class="addr">${e(ev.address)}</p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <div class="menu">
    <p class="menu-top">Chương trình</p>
    <ol>
      ${D.itinerary.map(it => `<li><span class="t">${e(it.title)}<small>${e(it.note)}</small></span><span class="dots" aria-hidden="true"></span><time>${e(it.time)}</time></li>`).join('')}
    </ol>
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Qua những ô cửa')}
  <div class="arcade">${D.photos.map((p, i) => ui.photo(p, i)).join('')}</div>
</div>`);

EA.section('notes', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lưu ý', 'Một chút lưu ý')}
  <ul class="tiles">
    ${D.dressCode.map(s => `<li><span class="tile" style="--c:${e(s.color)}"></span>${e(s.name)}</li>`).join('')}
  </ul>
  <ol class="deco-notes">${D.notes.map(n => `<li>${e(n)}</li>`).join('')}</ol>
</div>`);

EA.section('contact', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Liên lạc', 'Chúng mình luôn ở đây')}
  <div class="plaques">
    ${[['Cô dâu', D.bride], ['Chú rể', D.groom]].map(([r, p]) => `
      <a class="brass" href="tel:${e(p.phone.replace(/\s/g, ''))}"><small>${r}</small><b>${e(p.name)}</b><span>${e(p.phone)}</span></a>`).join('')}
  </div>
</div>`);

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="ic-hero">
    <div class="ic-window"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
    <div class="ic-txt">
      <p class="eyebrow">Sài Gòn · ${c.y}</p>
      <div class="ic-brass">
        <h1 class="couple"><span>${e(cp.brideName.replace(' ', ' '))}</span><span class="amp">&amp;</span><span>${e(cp.groomName.replace(' ', ' '))}</span></h1>
      </div>
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="hero-date">${c.dow} · ${c.dateText}</p>
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Những ô cửa ký ức')}
  <div class="ic-arcade">
    ${(mod.content.chapters || []).map(ch => `
      <article class="ic-arch">
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : '<div class="ic-noimg"></div>'}
        <div class="plate"><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3></div>
        <p class="ic-text">${e(ch.text)}</p>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Xin hồi âm')}
  <div class="deco-card"><span class="dc tl"></span><span class="dc tr"></span><span class="dc bl"></span><span class="dc br"></span>${ui.rsvpForm()}</div>
</div>`);

// =============================================================================================
// add-ons
// =============================================================================================
// the 1930 radio: plays the card's music (else a little music-box tune) through a narrow-band "valve" filter with crackle
function makeRadio(cfg) {
  let ctx = null, chain = null, audio = null, timer = 0, crack = 0, on = false, usingTune = false, step = 0;
  const init = () => {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 320;
    const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1700; pk.gain.value = 7; pk.Q.value = .9;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3100;
    const sh = ctx.createWaveShaper(); const k = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; k[i] = Math.tanh(x * 2.2); } sh.curve = k;
    const out = ctx.createGain(); out.gain.value = 0;
    hp.connect(pk); pk.connect(lp); lp.connect(sh); sh.connect(out); out.connect(ctx.destination);
    // hiss + crackle
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < .0009 ? 1 : .05);
    const ns = ctx.createBufferSource(); ns.buffer = buf; ns.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2400; const ng = ctx.createGain(); ng.gain.value = .35;
    ns.connect(nf); nf.connect(ng); ng.connect(out); ns.start();
    chain = { hp, out };
  };
  const tuneNote = () => {
    const sc = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 4, 7, 4, 2, 0, -3], n = sc[step++ % sc.length];
    const f = 261.63 * Math.pow(2, n / 12), t = ctx.currentTime;
    [1, 2.01].forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f * m;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(i ? .12 : .3, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      o.connect(g); g.connect(chain.hp); o.start(t); o.stop(t + 1.2);
    });
  };
  const fall = () => { usingTune = true; clearInterval(timer); timer = setInterval(() => ctx && on && tuneNote(), 460); };
  return {
    get on() { return on; },
    start() {
      try {
        if (!ctx) init();
        ctx.resume?.();
        on = true; chain.out.gain.cancelScheduledValues(0); chain.out.gain.setTargetAtTime(.9, ctx.currentTime, .25);
        if (!audio && cfg && cfg.source && !usingTune) {
          audio = new Audio(cfg.source); audio.loop = true; audio.crossOrigin = 'anonymous';
          audio.addEventListener('error', fall);
          try { ctx.createMediaElementSource(audio).connect(chain.hp); } catch { fall(); }
        }
        if (audio && !usingTune) audio.play().catch(fall); else fall();
      } catch { /* no audio */ }
    },
    stop() {
      on = false; clearInterval(timer);
      try { audio?.pause(); chain?.out.gain.setTargetAtTime(0, ctx.currentTime, .15); } catch { /* */ }
    }
  };
}

EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const short = k => D[k].short || D[k].name;
  const adds = [];

  // đã qua ngày cưới
  // --- 1. Hai ô gạch hai quê ---
  const hs = P.get('hometowns', {}), hp = P.get('hometownPins', {});
  if (hs.bride && hs.groom) {
    const km = hp.bride && hp.groom ? Math.round(P.kmBetween(hp.bride, hp.groom) / 10) * 10 : 0;
    const merged = `<div class="mt-tile">${tileSVG(hs.bride + hs.groom, { pal: PAL[2] })}</div>`;
    adds.push(['quehuong', 'families', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hai ô gạch, hai quê</p><h2 class="title">${e(hs.bride)} và ${e(hs.groom)} chung một nền nhà</h2></header>
      <div class="ht" data-state="apart">
        <figure class="ht-a"><div class="ht-t">${tileSVG(hs.bride)}</div><figcaption><b>${e(hs.bride)}</b>quê của ${e(short('bride'))}</figcaption></figure>
        <div class="ht-m" aria-hidden="true">${merged}</div>
        <figure class="ht-b"><div class="ht-t">${tileSVG(hs.groom)}</div><figcaption><b>${e(hs.groom)}</b>quê của ${e(short('groom'))}</figcaption></figure>
      </div>
      <p class="ht-note">${km ? `Cách nhau khoảng <b>${fmt(km)} km</b>, nay lát chung một nền gạch.` : 'Hai ô gạch khác màu, nay lát chung một nền nhà.'}</p>
    </div>`]);
  }

  // --- 2. Bản đồ Sài Gòn xưa ---
  const ev = D.events.find(x => /tiệc/i.test(x.title)) || D.events[D.events.length - 1];
  if (ev) {
    const met = P.has('metPlace');
    adds.push(['map', 'events', `<div class="wrap">
      <header class="head"><p class="eyebrow">Bản đồ Sài Gòn xưa</p><h2 class="title">Tìm đường đến với chúng mình</h2></header>
      <figure class="oldmap">
        <svg viewBox="0 0 360 300" role="img" aria-label="Bản đồ vẽ tay: ${e(ev.place)}${met ? ` và ${e(P.get('metPlace'))}` : ''}">
          <defs><pattern id="icg2" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 0h30v30" fill="none" stroke="#b8863b" stroke-opacity=".28" stroke-width="1"/></pattern>
            <path id="icrv" d="M-10 70C60 40 90 110 150 130S250 130 280 190 330 280 380 290"/></defs>
          <rect width="360" height="300" fill="#ecdcb4"/><rect width="360" height="300" fill="url(#icg2)"/>
          <g fill="#d8c394" opacity=".8"><rect x="20" y="150" width="46" height="34"/><rect x="76" y="160" width="40" height="40"/><rect x="190" y="30" width="52" height="30"/><rect x="250" y="40" width="40" height="46"/><rect x="40" y="220" width="60" height="40"/><rect x="200" y="210" width="44" height="50"/><rect x="120" y="215" width="50" height="34"/><rect x="290" y="110" width="44" height="40"/></g>
          <use href="#icrv" fill="none" stroke="#9fb6b0" stroke-width="22" stroke-linecap="round"/><use href="#icrv" fill="none" stroke="#c8d8d2" stroke-width="16" stroke-linecap="round"/>
          <g stroke="#7a5a2a" stroke-width="1.400" fill="none" opacity=".7"><path d="M0 120L360 220M60 0L170 300M250 0L200 300M0 250L360 170"/></g>
          ${met ? `<path d="M96 168Q150 90 246 98" fill="none" stroke="#8c2f2a" stroke-width="2" stroke-dasharray="3 6" class="rt"/>
          <g class="pin"><circle cx="96" cy="168" r="11" fill="#1f4d45"/><text x="96" y="172.500" text-anchor="middle" font-size="12" font-weight="600" fill="#efe6d2">1</text></g>` : ''}
          <g class="pin v"><circle cx="246" cy="98" r="14" fill="#8c2f2a"/><text x="246" y="103" text-anchor="middle" font-size="14" font-weight="600" fill="#efe6d2">${met ? 2 : 1}</text></g>
          <g transform="translate(310 250)"><circle r="22" fill="none" stroke="#7a5a2a" stroke-width="1.200"/><path d="M0-20L5 0 0 20-5 0z" fill="#8c2f2a"/><path d="M-20 0L0-5 20 0 0 5z" fill="#7a5a2a"/></g>
        </svg>
        <figcaption>
          <ol class="legend">
            ${met ? `<li><b>${e(P.get('metPlace'))}</b><span>Nơi hai bạn gặp nhau${P.daysTogether ? `, cách ngày cưới ${fmt(P.daysTogether)} ngày` : ''}.</span></li>` : ''}
            <li><b>${e(ev.place)}</b><span>${e(ev.address)}</span></li>
          </ol>
          <a class="btn" href="${ui_map(c, ev)}" target="_blank" rel="noopener">Chỉ đường</a>
        </figcaption>
      </figure>
    </div>`]);
  }

  // --- 3. Chiếc radio 1930 ---
  if (P.has('song.title')) {
    adds.push(['radio', 'story', `<div class="wrap">
      <header class="head"><p class="eyebrow">Chiếc radio 1930</p><h2 class="title">Bài hát của chúng mình</h2></header>
      <div class="radio" data-on="0">
        <div class="rd-top" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="rd-body">
          <div class="rd-grille" aria-hidden="true"></div>
          <div class="rd-panel">
            <div class="rd-dial"><div class="rd-scale" aria-hidden="true"></div><i class="rd-needle" aria-hidden="true"></i>
              <p class="rd-song"><b>${e(P.get('song.title'))}</b>${P.has('song.artist') ? `<span>${e(P.get('song.artist'))}</span>` : ''}</p></div>
            <div class="rd-ctrl"><button class="rd-knob" type="button" aria-pressed="false" aria-label="Bật radio"><i></i></button><span class="rd-state" aria-live="polite">Radio đang tắt</span></div>
          </div>
        </div>
      </div>
      ${P.has('song.lyric') ? `<p class="rd-lyric">“${e(P.get('song.lyric'))}”</p>` : ''}
    </div>`]);
  }

  // --- 4. Thực đơn quán cà phê ---
  const tb = P.get('traits.bride', {}), tg = P.get('traits.groom', {});
  const menu = [['drink', 'Thức uống'], ['hobby', 'Thú vui'], ['nickname', 'Gọi thân mật']].filter(([f]) => tb[f] && tg[f]);
  if (menu.length) {
    adds.push(['cafe', 'dressCode', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Quán cà phê Sài Gòn, 1930</p><h2 class="title">Thực đơn của hai người</h2></header>
      <div class="cafe"><p class="cf-top">Hai chỗ ngồi · một bàn</p>
        <div class="cf-names"><b>${e(short('bride'))}</b><i aria-hidden="true"></i><b>${e(short('groom'))}</b></div>
        <ul>${menu.map(([f, l]) => `<li><span class="cf-l">${l}</span><span class="cf-v">${e(tb[f])}</span><span class="dots" aria-hidden="true"></span><span class="cf-v r">${e(tg[f])}</span></li>`).join('')}</ul>
        <p class="cf-foot">Phục vụ cả đời, không tính tiền</p></div>
    </div>`]);
  }

  const place = {};
  adds.forEach(([id, after, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} ic-add`; s.innerHTML = html;
    const prev = place[after] || main.querySelector(`#${after}`) || main.lastElementChild;
    prev.insertAdjacentElement('afterend', s); place[id] = s;
  });

  // hai ô gạch trượt lại gần nhau, rồi hợp thành một
  const ht = main.querySelector('.ht');
  if (ht) M.inView(ht, () => { ht.dataset.state = 'near'; setTimeout(() => { ht.dataset.state = 'one'; M.tone('thud'); M.haptic('tap'); }, M.reduced ? 0 : 1400); }, { threshold: .5 });
  const map = main.querySelector('.oldmap');
  if (map) M.inView(map, () => map.classList.add('on'), { threshold: .3 });
  const cafe = main.querySelector('.cafe');
  if (cafe) M.inView(cafe, () => cafe.classList.add('on'), { threshold: .3 });

  // radio
  const rd = main.querySelector('.radio');
  if (rd) {
    const radio = makeRadio(c.config.music), knob = rd.querySelector('.rd-knob'), st = rd.querySelector('.rd-state');
    let resume = false;
    knob.addEventListener('click', () => {
      const mb = document.getElementById('music-btn');
      if (!radio.on) {
        if (mb && mb.getAttribute('aria-pressed') === 'true') { mb.click(); resume = true; }
        radio.start(); M.haptic('tap');
      } else { radio.stop(); if (resume) { mb?.click(); resume = false; } }
      const on = radio.on;
      rd.dataset.on = on ? '1' : '0'; knob.setAttribute('aria-pressed', on); knob.setAttribute('aria-label', on ? 'Tắt radio' : 'Bật radio');
      st.textContent = on ? 'Đang phát, qua chiếc radio cũ' : 'Radio đang tắt';
    });
    // pause when scrolled away
    new IntersectionObserver(es => es.forEach(x => { if (!x.isIntersecting && radio.on) knob.click(); }), { threshold: 0 }).observe(rd);
  }

  // light shafts that slide with the page (tier-aware)
  if (M.tier !== 'low' && !M.reduced) {
    document.body.insertAdjacentHTML('beforeend', '<div class="ic-shaft-fixed" aria-hidden="true"></div>');
    const sh = document.querySelector('.ic-shaft-fixed');
    let raf = 0;
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(() => { raf = 0; sh.style.setProperty('--sy', (scrollY * .12).toFixed(1) + 'px'); }); }, { passive: true });
    M.tilt(({ x }) => sh.style.setProperty('--sx', (x * 24).toFixed(1) + 'px'));
  }

  // finale: sau RSVP, một hàng gạch lật thành sóng thành hai chữ "CẢM ƠN"
  EA.onRsvp(() => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('ic-thx')) return;
        const letters = ['C', 'Ả', 'M', '·', 'Ơ', 'N'];
        done.insertAdjacentHTML('beforebegin', `<div class="ic-thx" role="img" aria-label="Cảm ơn">${letters.map((l, i) => l === '·' ? '<span class="sp"></span>' : `<i style="--i:${i}"><b>${l}</b></i>`).join('')}</div>`);
        requestAnimationFrame(() => requestAnimationFrame(() => done.previousElementSibling.classList.add('go')));
      });
    }, 30);
  });
});

function ui_map(c, ev) { return c.ui.mapUrl(ev); }
