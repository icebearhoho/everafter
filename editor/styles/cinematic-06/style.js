// Message to Shore: a lighthouse in the dark. Its beam sweeps and reads the letter aloud; your initials blink in Morse.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2, PI = Math.PI;
  const setTier = () => { html.dataset.shTier = M.tier; };
  const SIG = { k: 1 };   // shared lamp intensity: Morse blinks every beam on the page
  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }

  // ---------- Morse ----------
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  const base = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'D').toUpperCase().replace(/[^A-Z]/g, '');
  const mrow = word => [...base(word)].map(ch => `<span class="mc"><b>${ch}</b><span class="ms">${[...MORSE[ch]].map(s => `<i class="${s === '.' ? 'dot' : 'dash'}"></i>`).join('')}</span></span>`).join('');
  // Plays a Morse row: each symbol lights up, the lamp blinks, the phone ticks. One vibrate pattern keeps dots and dashes crisp.
  function sendMorse(row, unit = 90) {
    const syms = [...row.querySelectorAll('.ms i')], ev = [], pat = []; let t = 0;
    row.querySelectorAll('.mc').forEach((mc, li, all) => {
      const ss = [...mc.querySelectorAll('i')];
      ss.forEach((el, k) => { const d = el.classList.contains('dash') ? unit * 3 : unit; ev.push([t, d, el]); pat.push(d, unit); t += d + unit; });
      t += unit * 2;
    });
    const cap = !!window.Capacitor;
    if (!cap && navigator.vibrate) { try { navigator.vibrate(pat); } catch { /* no vibration */ } }
    return new Promise(done => {
      ev.forEach(([at, d, el]) => {
        setTimeout(() => { el.classList.add('on'); SIG.k = .06; html.classList.add('sh-blink'); M.tone(d > unit ? 'pop' : 'click'); if (cap) M.haptic(d > unit ? 'thud' : 'tap'); }, at);
        setTimeout(() => { el.classList.remove('on'); SIG.k = 1; html.classList.remove('sh-blink'); }, at + d);
      });
      setTimeout(() => { SIG.k = 1; html.classList.remove('sh-blink'); done(); }, t + 60);
    });
  }

  // ---------- art ----------
  const LH = `<svg viewBox="0 0 80 260" aria-hidden="true" focusable="false">
    <path d="M2 260c4-26 10-36 22-44h32c12 8 18 18 22 44z" fill="#10272f"/>
    <path d="M26 216 31 78h18l5 138z" fill="#ece8da"/><path d="M26 216 31 78h6l-4 138z" fill="#c4d0cd"/><path d="M44 78h5l5 138h-6z" fill="#9fb2b3"/>
    <path d="M28.500 188l.9-22h21.200l.9 22zM30.600 138l.9-22h17l.9 22z" fill="#e2735a"/>
    <path d="M24 78h32v6H24zM27 84h26v5H27z" fill="#26424b"/>
    <rect x="31" y="52" width="18" height="26" rx="2" fill="#26424b"/><rect class="glass" x="33" y="55" width="14" height="20" rx="1.500" fill="#ffe2a8"/>
    <path d="M28 52h24l-12-16z" fill="#e2735a"/><path d="M40 36V28" stroke="#8fa4a6" stroke-width="2" stroke-linecap="round"/>
    <circle class="sh-lamp" cx="40" cy="65" r="3" fill="#fff6dc"/></svg>`;
  const SHIP = '<svg viewBox="0 0 44 40" aria-hidden="true"><path d="M2 30h40l-6 8H8z" fill="#05121a"/><path d="M22 6v24M22 10l12 16H22z" fill="#0a1f29" stroke="#0a1f29"/><circle class="lt" cx="22" cy="5" r="2.600" fill="#ffd9a0"/></svg>';
  const SWELL = `<svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 32q50-12 100 0t100 0 100 0 100 0V60H0z"/></svg>`;
  const waveRows = (g, W, H, t, y0, y1, rows, a, off) => {
    for (let i = 0; i < rows; i++) {
      const d = i / Math.max(1, rows - 1), y = y0 + (y1 - y0) * Math.pow(d, 1.6), amp = 1 + d * 7;
      g.strokeStyle = `rgba(130,200,195,${(.06 + d * .2) * a})`; g.lineWidth = 1 + d * 1.6; g.beginPath();
      for (let x = 0; x <= W + 8; x += 8) { const yy = y + Math.sin(x * (.018 - d * .01) + t * .0009 * (1 + d) + i * 1.7 + off) * amp; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
      g.stroke();
    }
  };
  function beam(g, lx, ly, phi, w, L, a) {
    const dx = Math.sin(phi), dy = -Math.cos(phi), px = -dy, py = dx, sp = Math.tan(w) * L;
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(lx, ly, 0, lx, ly, L); gr.addColorStop(0, `rgba(255,232,176,${a})`); gr.addColorStop(.35, `rgba(255,226,168,${a * .42})`); gr.addColorStop(1, 'rgba(255,226,168,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + dx * L + px * sp, ly + dy * L + py * sp); g.lineTo(lx + dx * L - px * sp, ly + dy * L - py * sp); g.closePath(); g.fill(); g.restore();
  }
  const stars = n => Array.from({ length: n }, () => ({ x: R(0, 1), y: R(0, .62), r: R(.4, 1.5), ph: R(0, TAU), sp: R(.0008, .002) }));
  const drawStars = (g, W, H, t, st, yMax) => { st.forEach(s => { if (s.y * H > yMax) return; g.fillStyle = `rgba(230,244,240,${.25 + .55 * (.5 + .5 * Math.sin(t * s.sp + s.ph))})`; g.fillRect(s.x * W, s.y * H, s.r, s.r); }); };

  // ---------- fixed backdrop after opening: stars, a wandering beam, waves that drift with scroll ----------
  let back = null;
  function startBack(fast) {
    if (back?.cv.isConnected) { if (fast) back.fast = fast; return; }
    const cv = Object.assign(document.createElement('canvas'), { className: 'sh-back' }); cv.setAttribute('aria-hidden', 'true'); document.body.prepend(cv);
    const g = cv.getContext('2d'), st = stars(Math.round(M.scale(90)) + 20); let tilt = 0, skip = 0;
    back = { cv, fast: 0 };
    M.tilt(v => { tilt = v.x; });
    M.loop((t, dt) => {
      if (M.tier === 'low' && (skip ^= 1)) return;
      const { w: W, h: H, dpr } = fit(cv, 1); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      drawStars(g, W, H, t, st, H);
      const lamp = document.querySelector('.sh-hero .sh-lamp'), r = lamp?.getBoundingClientRect();
      const vis = r && r.bottom > 0 && r.top < H, lx = vis ? r.left + r.width / 2 : W * 1.04, ly = vis ? r.top + r.height / 2 : -H * .08;
      const mid = vis ? -PI / 2 - .12 : -2.25, sp = back.fast > Date.now() ? .0042 : .00055, phi = mid + (M.reduced ? 0 : Math.sin(t * sp) * .5) + tilt * .12;
      beam(g, lx, ly, phi, .1, Math.hypot(W, H) * 1.1, (vis ? .3 : .13) * Math.min(1.4, SIG.k));
      const sc = scrollY * .0015; waveRows(g, W, H, t, H * .86, H, M.tier === 'low' ? 3 : 6, .8, sc);
    });
  }

  // ---------- cover ----------
  let coverStop = null;
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier(); coverStop?.(); el.classList.remove('sh-gone');
    const ini = [base(D.bride.short || D.bride.name)[0] || 'L', base(D.groom.short || D.groom.name)[0] || 'B'];
    el.innerHTML = `<div class="sh-stage">
      <canvas class="sh-scene" aria-hidden="true"></canvas>
      <button class="sh-ship" type="button" aria-label="Con tàu ngoài khơi: chạm để gửi lời chào"><span>${SHIP}</span></button>
      <button class="sh-lh" type="button" aria-label="Thắp đèn hải đăng để mở thiệp">${LH}</button>
      <div class="sh-txt">
        <div class="sh-g g0"><p class="sh-to">Gửi ${e(c.guest)}</p></div>
        <div class="sh-g g1"><h1 class="sh-names"><span class="n">${e(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(D.groom.name)}</span></h1></div>
        <div class="sh-g g2"><p class="sh-date">${c.d} · ${c.m} · ${c.y}</p><p class="sh-dow">${c.dow}</p><div class="sh-morse" aria-hidden="true">${mrow(ini[0])}<span class="sh-sp"></span>${mrow(ini[1])}</div></div>
      </div>
      <div class="sh-swell" aria-hidden="true"><span class="a">${SWELL}</span><span class="b">${SWELL}</span></div>
      <p class="sh-egg" role="status"></p>
      <div class="sh-flash" aria-hidden="true"></div>
      <div class="sh-ui"><p class="sh-hint">Chạm vào ngọn hải đăng để thắp đèn</p><button class="open-btn" type="button">Thắp đèn</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.sh-stage'), cv = q('.sh-scene'), g = cv.getContext('2d'), swell = q('.sh-swell'), egg = q('.sh-egg');
    const groups = [...el.querySelectorAll('.sh-g')], st = stars(Math.round(M.scale(120)) + 30);
    const S = { phi: -PI / 2, k: 1, ig: 0, tilt: 0, lit: [0, 0, 0], latch: [0, 0, 0], mode: 'idle', mid: -PI / 2, amp: .3 };
    let geo = null, go = false, music = false, eggT = 0;
    const measure = () => {
      const sr = stage.getBoundingClientRect(), lr = q('.sh-lamp').getBoundingClientRect();
      const lx = lr.left + lr.width / 2 - sr.left, ly = lr.top + lr.height / 2 - sr.top;
      const gs = groups.map(n => { const r = n.getBoundingClientRect(), cx = r.left + r.width / 2 - sr.left, cy = r.top + r.height / 2 - sr.top; return { a: Math.atan2(cx - lx, -(cy - ly)), h: Math.atan2(r.height / 2, Math.hypot(cx - lx, cy - ly)) }; });
      const top = Math.max(...gs.map(x => x.a + x.h)) + .1, bot = Math.min(...gs.map(x => x.a - x.h)) - .1;
      geo = { lx, ly, gs, top, bot, y: sr.height * .66 };
      S.mid = (top + bot) / 2; S.amp = Math.max(.12, (top - bot) / 2);
    };
    const begin = () => { if (!music) { music = true; EA.music(); M.requestTilt(); } };
    const offTilt = M.tilt(v => { S.tilt = v.x; swell.style.setProperty('--tx', v.x.toFixed(3)); });
    const stopLoop = M.loop((t, dt) => {
      if (!stage.clientWidth) return;
      if (!geo) measure();
      const { w: W, h: H, dpr } = fit(cv, M.tier === 'low' ? 1 : 1.5); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (S.mode === 'idle') S.phi = S.mid + (c.reduced ? 0 : Math.sin(t * .00078) * S.amp) + S.tilt * .1;
      const yh = geo.y, k = Math.min(1.3, S.k * SIG.k);
      const sky = g.createLinearGradient(0, 0, 0, yh); sky.addColorStop(0, '#040e14'); sky.addColorStop(.7, '#0c2b37'); sky.addColorStop(1, '#1b4d58'); g.fillStyle = sky; g.fillRect(0, 0, W, yh + 1);
      const sea = g.createLinearGradient(0, yh, 0, H); sea.addColorStop(0, '#12393f'); sea.addColorStop(1, '#050f15'); g.fillStyle = sea; g.fillRect(0, yh, W, H - yh);
      drawStars(g, W, H, t, st, yh);
      const hz = g.createLinearGradient(0, yh - 30, 0, yh + 6); hz.addColorStop(0, 'rgba(255,214,150,0)'); hz.addColorStop(1, 'rgba(255,214,150,.22)'); g.fillStyle = hz; g.fillRect(0, yh - 30, W, 36);
      waveRows(g, W, H, t, yh + 4, H, M.tier === 'low' ? 6 : 12, 1, 0);
      beam(g, geo.lx, geo.ly, S.phi, .06, Math.hypot(W, H) * 1.15, .62 * k);
      beam(g, geo.lx, geo.ly, S.phi, .2, Math.hypot(W, H) * .9, .14 * k);
      g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(geo.lx, geo.ly, 0, geo.lx, geo.ly, 70 + S.ig * W); gl.addColorStop(0, `rgba(255,236,190,${(.85 * Math.min(1, k) + S.ig * .7)})`); gl.addColorStop(.25, `rgba(255,214,150,${.28 * k + S.ig * .3})`); gl.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
      groups.forEach((n, i) => {   // the beam reads the card: text brightens as it passes, then glows down
        const o = geo.gs[i], hit = k > .5 && Math.abs(S.phi - o.a) < o.h + .09;
        if (hit && S.mode === 'wow') S.latch[i] = 1;
        S.lit[i] = hit ? Math.min(1, S.lit[i] + dt * .008) : S.latch[i] ? Math.max(S.lit[i], .9) : Math.max(0, S.lit[i] - dt * .0012);
        n.style.setProperty('--lit', S.lit[i].toFixed(3));
      });
    }, { el: stage });
    const onResize = () => { geo = null; };
    addEventListener('resize', onResize);
    const cleanup = () => { stopLoop(); offTilt(); removeEventListener('resize', onResize); };
    coverStop = () => { go = true; cleanup(); };

    // easter egg: the ship on the horizon answers in Morse
    const ship = q('.sh-ship');
    ship.addEventListener('click', async () => {
      if (go || ship.classList.contains('talk')) return; begin(); ship.classList.add('talk'); M.haptic('tap');
      const row = document.createElement('div'); row.className = 'sh-morse sh-yeu'; row.innerHTML = mrow('YEU'); stage.appendChild(row);
      await sendMorse(row, 95); row.remove();
      egg.textContent = c.p.get('insideJoke', 'Tàu đã nhận được tín hiệu: có hai người đang rất yêu nhau.'); egg.classList.add('on'); M.haptic('success'); M.tone('chime');
      clearTimeout(eggT); eggT = setTimeout(() => { egg.classList.remove('on'); ship.classList.remove('talk'); }, 5200);
    });

    // the wow: ignite, three sweeps that each read a line, initials in Morse, flare out
    const wow = async () => {
      if (go) return; go = true; begin(); stage.classList.add('go'); M.haptic('tap'); M.tone('whoosh');
      if (c.reduced) { open(); afterOpen(); return; }
      if (!geo) measure();
      S.mode = 'wow'; M.tween(0, 1, 140, 'out', v => { S.ig = v * .9; }).then(() => M.tween(.9, 0, 520, 'out', v => { S.ig = v; }));
      M.haptic('thud'); M.tone('thud');
      let cur = S.phi;
      await M.tween(cur, geo.top, 260, 'inOut', v => { S.phi = v; }); cur = geo.top;
      for (let i = 0; i < 3; i++) {
        const target = i === 2 ? geo.gs[2].a - geo.gs[2].h * .4 : geo.gs[i].a;
        const from = cur; cur = target;
        M.haptic('tap'); M.tone('click');
        await M.tween(from, target, 520, 'inOut', v => { S.phi = v; });
        await new Promise(r => setTimeout(r, 90));
      }
      M.haptic('success'); await M.tween(cur, geo.gs[1].a, 220, 'inOut', v => { S.phi = v; });
      await sendMorse(q('.sh-morse'), 72);
      stage.classList.add('flare'); M.tone('chime');
      c.after(300, () => { open(); afterOpen(); }); c.after(1200, cleanup);
    };
    q('.sh-lh').addEventListener('click', wow);
    q('.open-btn').addEventListener('click', wow, { once: true });
    if (c.reduced) { S.amp = 0; }
  });

  const afterOpen = () => { setTier(); html.classList.add('sh-open'); startBack(0); };

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const past = new Date(`${D.date}T23:59:00+07:00`) < Date.now();
    const nm = (cls, full, short) => `<span class="n"><button type="button" class="sh-tapname" data-w="${e(short)}" aria-label="Chạm để cảm nhận tên ${e(short)} bằng mã Morse">${e(full)}</button><span class="sh-nm" aria-hidden="true"></span></span>`;
    return `<div class="sh-hero">
      <img class="sh-hero-img" src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high">
      <div class="sh-hlh" aria-hidden="true">${LH}</div>
      <div class="sh-hero-in">
        <p class="eyebrow">${e(c.mod.content.eyebrow || 'Thư gửi từ ngọn hải đăng')}</p>
        <h1 class="sh-names">${nm('b', cp.brideName, cp.brideShortName)}<span class="amp" aria-hidden="true">&amp;</span>${nm('g', cp.groomName, cp.groomShortName)}</h1>
        <p class="sh-tip">Chạm vào tên để cảm nhận bằng mã Morse</p>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="sh-date">${c.d} · ${c.m} · ${c.y}</p>
        <p class="hero-date">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="sh-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div>
    </div>`;
  });

  // the letter: each line is lit as the beam reaches it
  EA.section('invitation', ({ data: D, esc: e, mod, t, dateText }) => `<div class="wrap narrow sh-letter">
    <p class="kicker">${dateText}</p>
    <p class="sh-ln salute">${t(mod.content.greeting || 'Gửi {guestName},')}</p>
    <h2 class="title sh-ln">${e(mod.content.title || 'Một lời mời từ chúng mình')}</h2>
    <div class="sh-rule" aria-hidden="true"></div>
    ${D.letter.slice(0, 2).map(p => `<p class="sh-ln">${t(p)}</p>`).join('')}
    <p class="sh-ln highlight">${t(D.letterHighlight)}</p>
    ${D.letter.slice(2).map(p => `<p class="sh-ln">${t(p)}</p>`).join('')}
    <p class="sh-ln sign">Thân mến,<br><span class="names">${e(D.bride.name)} <span class="amp">&amp;</span> ${e(D.groom.name)}</span></p>
  </div>`);

  // RSVP: send a signal
  const LAMP = '<svg class="sh-sig-ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 20h20v18H14z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 20l12-12 12 12M10 40h28M24 3v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle class="gl" cx="24" cy="29" r="4.5" fill="currentColor"/></svg>';
  EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
    ${head('Gửi tín hiệu', 'Bạn sẽ đến chứ?', 'Chọn “Mình sẽ đến”, ngọn đèn sẽ nháy chữ ĐẾN bằng mã Morse')}
    <div class="sh-signal"><div class="sh-lampbtn" aria-hidden="true">${LAMP}</div><div class="sh-morse sh-den" aria-hidden="true">${mrow('DEN')}</div></div>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="wrap narrow">
    <div class="sh-thx-lh" aria-hidden="true">${LH}</div>
    <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    <div class="sh-fin" hidden><p class="sh-fin-t"></p><div class="sh-morse sh-fin-row" aria-hidden="true"></div></div>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Thắp lại ngọn đèn ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);

  // ---------- add-ons ----------
  function addSection(main, id, inner, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec sh-add m-${id}`; s.innerHTML = `<div class="wrap narrow">${inner}</div>`;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const fmtKm = km => `${(Math.round(km / 10) * 10).toLocaleString('vi-VN')} km`;

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    setTimeout(() => { if (cov.hidden) afterOpen(); }, 80);
    // Vietnamese-only eyebrows: swap core's English defaults (module content eyebrows already win)
    const VI = { 'Save the date': 'Ngày trọng đại', 'Wedding itinerary': 'Lịch trình trong ngày', 'Wedding party': 'Những người đồng hành', 'Wedding film': 'Thước phim cưới', 'A glimpse of us': 'Khoảnh khắc của chúng mình', 'Dress code & notes': 'Trang phục và lưu ý', 'Wedding guide': 'Cẩm nang ngày cưới', 'A note from us': 'Lời nhắn từ chúng mình', 'Gift registry': 'Gợi ý quà tặng', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ', 'Love story': 'Chuyện tình', 'RSVP': 'Xác nhận tham dự', 'Wedding': 'Đám cưới', 'Thank you': 'Lời cảm ơn' };
    main.querySelectorAll('.eyebrow').forEach(n => { const k = n.textContent.trim(); if (VI[k]) n.textContent = VI[k]; });

    // letter lines light up one by one
    const lns = [...main.querySelectorAll('.sh-ln')];
    lns.forEach((l, i) => { l.style.setProperty('--d', `${(i % 4) * 120}ms`); });
    if (!M.reduced && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('lit'); io.unobserve(en.target); } }), { threshold: .7 });
      lns.forEach(l => io.observe(l));
    } else lns.forEach(l => l.classList.add('lit'));

    // tap a name: feel it in Morse (haptic) and watch it blink
    let busy = false;
    main.querySelectorAll('.sh-tapname').forEach(b => b.addEventListener('click', async () => {
      if (busy) return; busy = true; M.requestTilt();
      const row = b.nextElementSibling; row.innerHTML = mrow(b.dataset.w); row.classList.add('sh-morse', 'on-row');
      await sendMorse(row, 110); setTimeout(() => { row.innerHTML = ''; row.classList.remove('on-row'); busy = false; }, 1400);
    }));

    // hải đồ: the beam points to where you met
    const mp = p.get('metPin', null), pin = p.get('hometownPins', null);
    if (mp && mp.lat != null) {
      const pts = [{ k: 'met', ...mp }]; if (pin?.bride) pts.push({ k: 'bride', ...pin.bride }); if (pin?.groom) pts.push({ k: 'groom', ...pin.groom });
      const lats = pts.map(x => x.lat), lngs = pts.map(x => x.lng), latM = (Math.min(...lats) + Math.max(...lats)) / 2, lngM = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const cl = Math.cos(latM * PI / 180), S = Math.min(150 / Math.max(.4, Math.max(...lats) - Math.min(...lats)), 130 / Math.max(.4, (Math.max(...lngs) - Math.min(...lngs)) * cl));
      const P = x => ({ x: 190 + (x.lng - lngM) * cl * S, y: 124 - (x.lat - latM) * S });
      const m = P(mp), lh = { x: 34, y: 205 }, deg = Math.atan2(m.x - lh.x, -(m.y - (lh.y - 13))) * 180 / PI;
      const nameOf = { bride: p.get('hometowns.bride', ''), groom: p.get('hometowns.groom', '') };
      const route = k => { if (!pin?.[k]) return ''; const a = P(pin[k]), km = p.kmBetween(pin[k], mp), side = a.x < m.x ? -1 : 1, low = a.y > m.y + 8;
        return `<path class="rt" d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${((a.x + m.x) / 2 + side * -14).toFixed(1)} ${((a.y + m.y) / 2).toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}"/><circle class="pt ${k}" cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="4.500"/>
        <text x="${(low ? a.x : a.x + (a.x < m.x ? -10 : 10)).toFixed(1)}" y="${(low ? a.y + 20 : a.y + 4).toFixed(1)}" text-anchor="${low ? 'middle' : a.x < m.x ? 'end' : 'start'}">${e(nameOf[k])}${km ? ` · ${fmtKm(km)}` : ''}</text>`; };
      addSection(main, 'chart', `${head('Hải đồ của chúng mình', 'Nơi ngọn đèn chỉ về')}
        <figure class="sh-chart"><svg viewBox="0 0 320 240" role="img" aria-label="Hải đồ: ngọn đèn chỉ về ${e(p.get('metPlace', 'nơi hai bạn gặp nhau'))}">
          <defs><linearGradient id="shBm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></linearGradient></defs>
          <g class="grid">${[40, 80, 120, 160, 200].map(v => `<path d="M0 ${v}H320"/>`).join('')}${[64, 128, 192, 256].map(v => `<path d="M${v} 0V240"/>`).join('')}</g>
          <g class="beam" style="--a:${deg.toFixed(1)}deg"><path d="M${lh.x} ${lh.y - 13}L${lh.x - 30} ${lh.y - 13 - 215}L${lh.x + 30} ${lh.y - 13 - 215}z" fill="url(#shBm)"/></g>
          ${route('bride')}${route('groom')}
          <g class="met"><circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="11"/><circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="4.500"/></g>
          <g transform="translate(${lh.x - 8} ${lh.y - 26}) scale(.2)" class="mini">${LH.replace(/<svg[^>]*>|<\/svg>|<defs>[\s\S]*?<\/defs>/g, '')}</g>
          <g class="rose" transform="translate(280 36)"><circle r="22"/><path d="M0-22V22M-22 0H22"/><text y="-27" text-anchor="middle">B</text></g>
        </svg>
        <figcaption>${p.has('metPlace') ? `Ngọn đèn chỉ về ${e(p.get('metPlace'))}${p.has('metCity') ? `, ${e(p.get('metCity'))}` : ''}.` : 'Ngọn đèn chỉ về nơi hai đứa gặp nhau.'}</figcaption></figure>`, ['.m-story', '.m-saveDate', '.m-events']);
      const cs = main.querySelector('#chart'); M.inView(cs, () => cs.classList.add('go'), { threshold: .35 });
    }

    // đêm cùng nhìn một biển
    if (p.daysTogether != null) {
      const sec = addSection(main, 'nights', `${head('Những đêm đèn sáng', 'Ngọn đèn đã quay')}
        <p class="sh-nights"><b data-n="${p.daysTogether}">0</b><span>vòng quay, mỗi ngày một vòng, kể từ ${p.has('metPlace') ? `lần đầu gặp ở ${e(p.get('metPlace'))}` : 'ngày gặp nhau'}.</span></p>`, ['.m-chart', '.m-story', '.m-saveDate', '.m-events']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => M.tween(0, p.daysTogether, 2200, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }), { threshold: .5 });
    }

    // hai bức thư gửi vào đêm
    const lt = p.get('letters', null);
    if (lt && (lt.bride || lt.groom)) {
      const who = [['bride', c.data.bride.short], ['groom', c.data.groom.short]].filter(([k]) => lt[k]);
      const sec = addSection(main, 'notes', `${head('Thư gửi vào đêm', 'Hai bức thư trong chai')}
        <div class="sh-tabs" role="tablist" aria-label="Chọn bức thư">${who.map(([k, n], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-k="${k}">Thư của ${e(n)}</button>`).join('')}</div>
        <article class="sh-note"><p class="sh-note-t" aria-live="polite"></p><p class="sh-note-s"></p></article>`, ['.m-nights', '.m-chart', '.m-story', '.m-saveDate', '.m-events']);
      const tx = sec.querySelector('.sh-note-t'), sg = sec.querySelector('.sh-note-s'), tabs = [...sec.querySelectorAll('[role=tab]')];
      const show = (k, loud) => {
        tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.k === k));
        tx.removeAttribute('data-ea-text'); tx.classList.remove('ea-mo-on'); tx.textContent = lt[k]; sg.textContent = `— ${p.get(`traits.${k}.nickname`, c.data[k].short)}`;
        M.reveal(tx, { mode: 'words', stagger: 38 }); if (loud) { M.haptic('tap'); M.tone('pop'); }
      };
      tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.k, true)));
      tx.textContent = lt[who[0][0]]; sg.textContent = `— ${p.get(`traits.${who[0][0]}.nickname`, c.data[who[0][0]].short)}`;
      M.inView(sec, () => show(who[0][0], false), { threshold: .4 });
    }

    // rsvp: pressing "Mình sẽ đến" sends the lamp's signal; the button says what it does
    main.querySelectorAll('form.rsvp-form').forEach(form => {
      const sb = form.querySelector('button[type=submit]'); if (sb) sb.innerHTML = `${LAMP.replace('sh-sig-ico', 'sh-sig-ico sm')} Gửi tín hiệu`;
      form.addEventListener('change', () => {
        const yes = form.attending.value === 'yes', box = main.querySelector('.sh-signal');
        if (!box || box.dataset.v === form.attending.value) return; box.dataset.v = form.attending.value; box.classList.toggle('yes', yes);
        if (yes) { M.requestTilt(); sendMorse(box.querySelector('.sh-den'), 110); }
      });
    });
  });

  // finale: the guest's own initials reach the shore
  EA.onRsvp((entry, c) => {
    html.classList.add('sh-finale'); startBack(Date.now() + 6000); M.haptic('success');
    const th = document.getElementById('thanks'), box = th?.querySelector('.sh-fin'); if (!box) return;
    const name = String(entry?.name || '').trim(), ini = name.split(/\s+/).map(w => base(w)[0] || '').join('').slice(0, 4) || 'LB';
    box.hidden = false; box.querySelector('.sh-fin-t').textContent = entry?.attending === false ? 'Tín hiệu của bạn đã về tới bờ. Mong sớm gặp lại!' : `Tín hiệu của ${name || 'bạn'} đã về tới bờ`;
    const row = box.querySelector('.sh-fin-row'); row.innerHTML = mrow(ini);
    setTimeout(() => th.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 600);
    setTimeout(() => sendMorse(row, 100), 1500);
  });
})();
