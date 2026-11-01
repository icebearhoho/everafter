// Geometric Camera: the day seen through a lens. Press the shutter: the aperture closes, a flash, and the photo opens in focus.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;
  const sc = n => Math.max(1, Math.round(M.scale(n)));
  const setTier = () => { html.dataset.cmTier = M.tier; };
  const wait = ms => new Promise(r => setTimeout(r, M.reduced ? 0 : ms));
  const pad = (n, k = 2) => String(n).padStart(k, '0');
  const dms = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), s = Math.round(((a - d) * 60 - m) * 60); return `${d}°${pad(m)}'${pad(s)}&quot; ${v >= 0 ? pos : neg}`; };
  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }

  // ---------- bokeh made of 9-sided aperture shapes; `focus` collapses the discs into sharp points of light ----------
  function makeBokeh(cv) {
    const g = cv.getContext('2d'), COL = ['201,164,95', '242,221,170', '95,170,178', '255,200,130', '170,210,214'], lights = [];
    for (let i = 0; i < sc(34); i++) { const near = Math.random() < .35; lights.push({ x: R(0, 1), y: R(0, 1), r: near ? R(.05, .1) : R(.025, .06), c: COL[Math.random() * COL.length | 0], a: R(.07, .2), ph: R(0, TAU), sp: R(.0004, .001), rot: R(0, TAU), near }); }
    const poly = (x, y, r, rot) => { g.beginPath(); for (let k = 0; k < 9; k++) { const a = rot + k * TAU / 9; g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); };
    return function render(t, focus) {
      const { w, h, dpr } = fit(cv, 1.25); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = g.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .5, Math.max(w, h) * .75);
      bg.addColorStop(0, '#173038'); bg.addColorStop(.6, '#0d191d'); bg.addColorStop(1, '#060d10'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'lighter'; const base = Math.min(w, h);
      lights.forEach(l => {
        const pulse = .8 + .2 * Math.sin(t * l.sp + l.ph), k = 1 - (l.near ? .8 : .88) * focus, r = l.r * base * 1.7 * k + 1.6;
        const a = l.a * pulse * (1 + 2.2 * focus * (1 - k) * .6), x = l.x * w, y = l.y * h;
        g.fillStyle = `rgba(${l.c},${a * (.55 + .45 * k)})`; poly(x, y, r, l.rot); g.fill();
        g.strokeStyle = `rgba(${l.c},${a * 1.5 * k})`; g.lineWidth = 1; g.stroke();
      });
      g.globalCompositeOperation = 'source-over';
    };
  }

  // ---------- iris: nine metal blades; --r is the inradius of the opening ----------
  const IRIS = `<svg class="cm-iris" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="cmBl" gradientUnits="userSpaceOnUse" x1="0" x2="190" y1="0" y2="0"><stop offset="0" stop-color="#7a8a8a"/><stop offset=".05" stop-color="#34464c"/><stop offset=".35" stop-color="#16262c"/><stop offset="1" stop-color="#091014"/></linearGradient></defs>
    ${Array.from({ length: 9 }, (_, i) => `<g class="bl" style="--a:${i * 40}deg"><path d="M0 -270H800V620H0Z" fill="url(#cmBl)"/><path d="M0 -270V620" stroke="#d6b36e" stroke-opacity=".7" stroke-width="2.500"/><circle cx="560" cy="-150" r="9" fill="#05090b" stroke="#51666b" stroke-width="2"/></g>`).join('')}
  </svg>`;
  const setIris = (el, r) => { el.style.setProperty('--r', r); el.style.setProperty('--rot', (1 - r / 720) * 40 + 'deg'); };

  // decorative lens barrel: engraved rings and scale ticks
  const LENS = (() => {
    let t = ''; for (let i = 0; i < 72; i++) { const long = i % 9 === 0, a = i * 5; t += `<line x1="200" y1="${long ? 6 : 10}" x2="200" y2="${long ? 24 : 18}" transform="rotate(${a} 200 200)" stroke="#d6b36e" stroke-opacity="${long ? .9 : .45}" stroke-width="${long ? 2 : 1}"/>`; }
    let n = ''; for (let k = 0; k < 9; k++) { const a = k * TAU / 9 - Math.PI / 2; n += `${k ? 'L' : 'M'}${(200 + Math.cos(a) * 128).toFixed(1)} ${(200 + Math.sin(a) * 128).toFixed(1)}`; }
    return `<svg class="cm-lens" viewBox="0 0 400 400" aria-hidden="true">
      <circle cx="200" cy="200" r="197" fill="none" stroke="#d6b36e" stroke-opacity=".55"/>
      <g class="spin">${t}<circle cx="200" cy="200" r="170" fill="none" stroke="#d6b36e" stroke-opacity=".35"/></g>
      <circle cx="200" cy="200" r="152" fill="rgba(6,13,16,.3)" stroke="#f2ddaa" stroke-opacity=".22"/>
      <circle cx="200" cy="4" r="3.500" fill="#e5634d"/>
    </svg>`;
  })();

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e, config: { couple: cp } } = c;
    setTier();
    const names = `<span class="n">${e(D.bride.name.replace(/ /g, ' '))}</span> <span class="n"><i class="amp" aria-hidden="true">&amp;</i> ${e(D.groom.name.replace(/ /g, ' '))}</span>`;
    el.innerHTML = `<div class="cm-stage">
      <canvas class="cm-bokeh" aria-hidden="true"></canvas>
      <img class="cm-photo" src="${e(cp.heroImage)}" alt="" onerror="this.remove()">
      <div class="cm-vig" aria-hidden="true"></div>
      ${LENS}
      <div class="cm-txt">
        <p class="cm-to">Gửi ${e(c.guest)}</p>
        <h1 class="cm-names">${names}</h1>
        <p class="cm-date">${c.d} · ${c.m} · ${c.y}</p>
      </div>
      <div class="cm-af" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="cm-hudtop" aria-hidden="true"><span>f/2.8</span><span>1/125</span><span>ISO 400</span><b class="rec"></b><span class="cnt">36</span></div>
      <div class="cm-ui"><p class="cm-hint">Giữ nút để lấy nét, thả ra để chụp</p>
        <button class="cm-shutter" type="button" aria-label="Chụp"><i></i></button>
        <button class="open-btn" type="button">Bấm chụp</button></div>
      <p class="cm-egg" role="status"></p>
      ${IRIS}<div class="cm-flash" aria-hidden="true"></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.cm-stage'), iris = q('.cm-iris'), flash = q('.cm-flash'), namesEl = q('.cm-names');
    const af = q('.cm-af'), egg = q('.cm-egg'), bk = q('.cm-bokeh'), photo = q('.cm-photo');
    setIris(iris, 720);
    let focus = 0, go = false, music = false, eggT = 0, taps = [], locked = false;
    const draw = makeBokeh(bk);
    const stop = M.loop(t => { if (bk.clientWidth) draw(t, focus); }, { el: stage });
    const offTilt = M.tilt(v => { bk.style.transform = `translate(${v.x * -10}px,${v.y * -8}px) scale(1.05)`; });
    const setBlur = v => { namesEl.style.setProperty('--bl', v.toFixed(2) + 'px'); };
    setBlur(c.reduced ? 0 : 1.2);

    // tap anywhere: autofocus box jumps there; three quick taps: self-timer joke
    stage.addEventListener('pointerdown', ev => {
      if (go || ev.target.closest('button')) return;
      const r = stage.getBoundingClientRect(); af.style.setProperty('--x', ev.clientX - r.left + 'px'); af.style.setProperty('--y', ev.clientY - r.top + 'px');
      af.classList.remove('hit'); void af.offsetWidth; af.classList.add('hit', 'moved'); M.tone('pop'); M.haptic('tap');
      const now = performance.now(); taps = taps.filter(x => now - x < 1400); taps.push(now);
      if (taps.length >= 3) { taps = []; showEgg(); }
    });
    function showEgg() {
      egg.textContent = c.p.get('insideJoke', 'Cười lên nào, một, hai, ba!'); egg.classList.add('on');
      flash.classList.add('pop'); setTimeout(() => flash.classList.remove('pop'), 260);
      M.tone('click'); M.haptic('success'); clearTimeout(eggT); eggT = setTimeout(() => egg.classList.remove('on'), 4200);
    }

    // half-press: lock focus on the names (blur eases to zero), release: shoot
    const sh = q('.cm-shutter');
    sh.addEventListener('pointerdown', () => {
      if (go) return; locked = true; af.classList.add('lock'); M.tone('click'); M.haptic('tap');
      M.tween(1.2, 0, 520, 'out', setBlur);
    });
    const unlock = () => { if (!go && locked) { locked = false; af.classList.remove('lock'); setBlur(1.2); } };
    sh.addEventListener('pointerleave', unlock); sh.addEventListener('pointercancel', unlock);

    const setR = v => setIris(iris, v);
    const wow = async () => {
      if (go) return; go = true; af.classList.add('lock');
      M.requestTilt(); if (!music) { music = true; EA.music(); }
      stage.classList.add('shot'); M.haptic('tap');
      if (c.reduced) { stage.classList.add('seen'); setBlur(0); focus = 1; open(); return; }
      await M.tween(720, -12, 560, 'inOut', setR);               // blades close
      M.tone('click'); setTimeout(() => M.tone('thud'), 110); M.haptic('thud');
      flash.classList.add('on'); stage.classList.add('seen');   // flash; the scene behind swaps to the photo
      setBlur(16); focus = .5;
      await wait(420); flash.classList.remove('on');
      M.tone('whoosh');
      M.tween(-12, 720, 1000, 'out', setR);                     // blades open on the photo
      M.tween(16, 0, 1500, 'inOut', setBlur);                    // focus pull: blur to sharp names
      M.tween(.5, 1, 1500, 'inOut', v => { focus = v; });
      await wait(1450);
      af.classList.add('done'); M.tone('chime'); M.haptic('success');
      await wait(650);
      open(); html.classList.add('cm-open'); setTier();
      c.after(900, () => { stop(); offTilt(); });
    };
    q('.open-btn').addEventListener('click', wow, { once: true });
    sh.addEventListener('click', wow, { once: true });
    if (c.reduced) { setBlur(0); }
  });

  // ---------- sections ----------
  const SPLIT = (e, D) => `<span class="n">${e(D.bride.name.replace(/ /g, ' '))}</span> <span class="n"><i class="amp" aria-hidden="true">&amp;</i> ${e(D.groom.name.replace(/ /g, ' '))}</span>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const past = new Date(`${D.date}T23:59:00+07:00`) < Date.now();
    return `<div class="cm-hero">
      <img class="cm-hero-img" src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high">
      <div class="cm-hero-in">
        <p class="eyebrow">Trân trọng kính mời</p>
        <div class="cm-focusbox"><i></i><i></i><i></i><i></i>
          <h1 class="cm-names">${SPLIT(e, D)}</h1></div>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="cm-date">${c.d} · ${c.m} · ${c.y}</p>
        <p class="hero-date">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="cm-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  EA.section('story', ({ esc: e, mod, ui, d, m, y }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    return `<div class="wrap">${ui.head('Cuộn phim kỷ niệm', 'Chuyện của chúng mình')}
      <div class="cm-exs">${chs.map((ch, i) => `<article class="cm-ex"><div class="still"><span class="ph" style="--h:${(i * 53 + 20) % 360}"></span>${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<span class="stamp">${e(ch.date)}</span></div>
        <div class="body"><p class="no">Khung ${pad(i + 1)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></article>`).join('')}</div>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}</div>`;
  });

  // gallery as a contact sheet: every frame starts undeveloped; tap to develop, tap again to view
  EA.section('gallery', ({ data: D, esc: e, ui }) => `<div class="wrap">${ui.head('Phim chụp thử', 'Khoảnh khắc của chúng mình', 'Chạm vào từng khung để rửa ảnh')}
    <div class="cm-sheet">${D.photos.map((p, i) => `<button class="cm-fr" type="button" data-i="${i}" aria-label="Rửa ảnh ${i + 1}: ${e(p.caption)}"><span class="ph" style="--h:${(i * 47 + 190) % 360}"></span><img src="${e(p.src)}" alt="" loading="lazy" onerror="this.remove()"><span class="no">${pad(i + 1)}A</span><span class="cap">${e(p.caption)}</span></button>`).join('')}</div>
    <div class="actions center"><button class="btn ghost" type="button" data-dev-all>Rửa tất cả</button></div></div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="wrap narrow">
    <div class="cm-leak" aria-hidden="true"></div>
    <p class="eyebrow">Hết cuộn phim</p>
    <p class="cm-count" aria-label="Khung hình cuối"><b>35</b><span>/36</span></p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Chụp lại từ đầu ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div></div>`);

  // ---------- add-ons ----------
  function addSection(main, id, html_, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec cm-add m-${id}`; s.innerHTML = html_;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const head = (eb, t, sub) => `<header class="head"><p class="eyebrow">${eb}</p><h2 class="title">${t}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;

  function drawFrame(cv, img, c) {
    const W = 1080, H = 1350, g = cv.getContext('2d'), { data: D } = c, p = c.p;
    cv.width = W; cv.height = H;
    g.fillStyle = '#0d191d'; g.fillRect(0, 0, W, H);
    const x = 60, y = 60, w = 960, h = 1000;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    if (img) { const s = Math.max(w / img.width, h / img.height); g.drawImage(img, x + (w - img.width * s) / 2, y + (h - img.height * s) / 2, img.width * s, img.height * s); }
    else {
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#1d3a42'); gr.addColorStop(1, '#3a2c1c'); g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(242,221,170,.8)'; g.font = '500 44px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText('Chọn ảnh của bạn', x + w / 2, y + h / 2);
    }
    g.restore();
    g.strokeStyle = '#d6b36e'; g.lineWidth = 6;
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([a, b, dx, dy]) => { g.beginPath(); g.moveTo(a + dx * 70, b + dy * 0); g.lineTo(a, b); g.lineTo(a, b + dy * 70); g.stroke(); });
    g.textAlign = 'center'; g.fillStyle = '#f2ddaa'; g.font = '500 70px "Noto Serif Display", serif';
    g.fillText(`${D.bride.short} & ${D.groom.short}`, W / 2, 1160);
    g.fillStyle = '#c9d3d1'; g.font = '500 30px "Be Vietnam Pro", sans-serif';
    g.fillText(`${c.d} · ${c.m} · ${c.y}   ·   ${c.config.couple.city || ''}`, W / 2, 1218);
    g.fillStyle = '#d6b36e'; g.font = '500 26px "Be Vietnam Pro", sans-serif';
    g.fillText(`f/${+c.d}.${c.m}   1/125${p.daysTogether != null ? `   ISO ${p.daysTogether}` : ''}`, W / 2, 1272);
  }

  EA.afterRender((c, main) => {
    const { p, esc: e, data: D } = c, cov = document.getElementById('cover');
    setTier(); setTimeout(() => { if (cov.hidden) html.classList.add('cm-open'); }, 80);

    // viewfinder readout that follows scroll (rack focus)
    const hud = document.createElement('div'); hud.className = 'cm-hud'; hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<span class="f">f/2.8</span><span>1/125</span><span class="iso">ISO 400</span><b class="rec"></b>'; document.body.appendChild(hud);
    const F = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16], hero = main.querySelector('.cm-hero-in');
    let tick = 0;
    const onScroll = () => {
      if (tick) return; tick = requestAnimationFrame(() => {
        tick = 0; const H = document.documentElement.scrollHeight - innerHeight, pr = H > 0 ? Math.min(1, scrollY / H) : 0;
        hud.querySelector('.f').textContent = 'f/' + F[Math.min(7, Math.floor(pr * 8))];
        hud.querySelector('.iso').textContent = 'ISO ' + (100 * 2 ** Math.min(5, Math.floor(pr * 6)));
        if (hero && !c.reduced && M.tier !== 'low') { const k = Math.min(1, scrollY / (innerHeight * .8)); hero.style.filter = k > .02 ? `blur(${(k * 6).toFixed(1)}px)` : ''; hero.style.opacity = 1 - k * .5; }
      });
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // EXIF panel: f/ = wedding date, ISO = days together, GPS = venue
    if (p.daysTogether != null) {
      const ev = D.events[D.events.length - 1] || {}, pin = p.raw.metPin;
      const bars = Array.from({ length: 28 }, (_, i) => { const v = Math.exp(-((i - 9) ** 2) / 30) * .9 + Math.exp(-((i - 21) ** 2) / 18) * .6 + (Math.sin(i * 12.9) * .5 + .5) * .12; return `<i style="height:${Math.round(v * 100)}%"></i>`; }).join('');
      const sec = addSection(main, 'exif', `<div class="wrap narrow">${head('Thông số bức ảnh', 'Ngày mình thành đôi')}
        <div class="cm-exif"><div class="shot"><span class="grid" aria-hidden="true"></span><span class="cap">${c.d}.${c.m}.${c.y}</span></div>
        <dl>
          <div><dt>Khẩu độ</dt><dd>f/${+c.d}.${c.m}<small>Ngày cưới</small></dd></div>
          <div><dt>ISO</dt><dd><span data-n="${p.daysTogether}">0</span><small>Số ngày bên nhau</small></dd></div>
          <div><dt>Tốc độ</dt><dd>1/125<small>${ev.time ? `Giờ vào tiệc ${e(ev.time)}` : 'Một khoảnh khắc'}</small></dd></div>
          ${ev.place ? `<div class="wide"><dt>GPS</dt><dd>${e(ev.place)}<small>${e(ev.address || '')}</small></dd></div>` : ''}
          ${pin ? `<div class="wide"><dt>Nơi gặp nhau</dt><dd>${e(p.get('metPlace', p.get('metCity', '')))}<small>${dms(pin.lat, 'N', 'S')} · ${dms(pin.lng, 'E', 'W')}</small></dd></div>` : ''}
        </dl><div class="histo" aria-hidden="true">${bars}</div></div></div>`, ['.m-events', '.m-story', '.m-saveDate']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => { M.tween(0, p.daysTogether, 1800, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .4 });
    }

    // two lenses: each partner as a lens spec sheet
    const tr = p.raw.traits || {};
    if (tr.bride || tr.groom) {
      const rh = r => r === 'night' ? 'Về đêm' : r === 'morning' ? 'Buổi sáng' : '';
      const card = (who, label) => { const t = tr[who]; if (!t) return ''; const nm = who === 'bride' ? D.bride : D.groom;
        const rows = [['Nhịp sống', rh(t.rhythm)], ['Đồ uống', t.drink], ['Sở thích', t.hobby]].filter(r => r[1]);
        return `<article class="cm-len"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor"/><circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-dasharray="2 4"/><path d="M32 16l11.500 6.600v13.300L32 42.500l-11.500-6.600V22.600z" fill="none" stroke="currentColor"/></svg>
          <p class="label">${label}</p><h3>${e(nm.short)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3>
          <dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${e(r[1])}</dd>`).join('')}</dl></article>`; };
      addSection(main, 'lenses', `<div class="wrap">${head('Hai ống kính', 'Hai góc nhìn, một khung hình')}<div class="cm-lenses">${card('bride', 'Ống kính thứ nhất')}${card('groom', 'Ống kính thứ hai')}</div></div>`, ['.m-exif', '.m-events', '.m-story']);
    }

    // roll of places
    const places = Array.isArray(p.raw.places) ? p.raw.places : [];
    if (places.length) {
      addSection(main, 'roll', `<div class="wrap">${head('Nhật ký chuyến đi', 'Những nơi mình đã ghi hình')}
        <ol class="cm-roll">${places.map((pl, i) => `<li><span class="no">IMG_${pad(i + 1, 4)}</span><b>${e(pl.name)}</b><span>${e(pl.date || '')}</span>${pl.lat ? `<small>${(+pl.lat).toFixed(2)}°N · ${(+pl.lng).toFixed(2)}°E</small>` : ''}</li>`).join('')}</ol></div>`, ['.m-lenses', '.m-exif', '.m-events', '.m-story']);
    }

    // contact sheet: develop on tap
    const lb = document.getElementById('lightbox');
    const develop = fr => { fr.classList.add('dev'); M.tone('click'); M.haptic('tap'); };
    main.querySelectorAll('.cm-fr').forEach(fr => fr.addEventListener('click', () => {
      if (!fr.classList.contains('dev')) { develop(fr); return; }
      const ph = D.photos[fr.dataset.i]; lb.querySelector('img').src = ph.src; lb.querySelector('img').alt = ph.caption; lb.showModal();
    }));
    main.querySelector('[data-dev-all]')?.addEventListener('click', () => main.querySelectorAll('.cm-fr:not(.dev)').forEach((fr, i) => setTimeout(() => develop(fr), M.reduced ? 0 : i * 140)));

    // guest photo frame
    const fsec = addSection(main, 'frame', `<div class="wrap narrow">${head('Khung ảnh lưu niệm', 'Chụp cùng chúng mình', 'Chọn một tấm ảnh của bạn, chúng mình đóng khung để bạn mang về')}
      <canvas class="cm-fcv" width="1080" height="1350" role="img" aria-label="Khung ảnh xem trước"></canvas>
      <div class="actions center"><label class="btn ghost cm-pick">Chọn ảnh<input type="file" accept="image/*" hidden></label><button class="btn" type="button" data-save>Tải ảnh xuống</button></div></div>`, ['.m-gallery', '.m-video', '.m-party']);
    const cv = fsec.querySelector('canvas'); let img = null;
    document.fonts.ready.then(() => drawFrame(cv, null, c));
    fsec.querySelector('input').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return; const im = new Image(), u = URL.createObjectURL(f);
      im.onload = () => { img = im; drawFrame(cv, img, c); URL.revokeObjectURL(u); M.tone('click'); }; im.src = u;
    });
    fsec.querySelector('[data-save]').addEventListener('click', () => {
      drawFrame(cv, img, c); cv.toBlob(b => { const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: 'khung-anh-cuoi.png' }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); });
    });

    const th = main.querySelector('.m-thanks');
    if (th) M.inView(th, () => { const b = th.querySelector('.cm-count b'); if (b) M.tween(35, 36, 700, 'out', v => { b.textContent = Math.round(v); }); }, { threshold: .4 });
  });

  // finale: the last frame of the roll is exposed
  EA.onRsvp(() => {
    html.classList.add('cm-finale'); M.haptic('success'); M.tone('click'); setTimeout(() => M.tone('chime'), 160);
    const f = document.createElement('div'); f.className = 'cm-blink'; document.body.appendChild(f); setTimeout(() => f.remove(), 1200);
    const th = document.getElementById('thanks');
    setTimeout(() => th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 700);
  });
})();
