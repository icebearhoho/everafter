// Ink Tide: one drop of ink falls on rice paper, blooms across the page, then a tide washes in and paints the names.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;
  const setTier = () => { html.dataset.ikTier = M.tier; };
  const IKS = { plum: '#4a2f47', deep: '#33202f', rose: '213,137,146', teal: '157,200,201' };

  function fit(cv, maxDpr) {
    const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }

  // ---------- the ink itself: a living blob with a fractal edge, teal and rose bleeding out past the pigment ----------
  const PAL_INK = [
    { k: 1.07, fill: `rgba(${IKS.teal},.5)`, glow: `rgba(${IKS.teal},.9)` },
    { k: 1.03, fill: `rgba(${IKS.rose},.62)`, glow: `rgba(${IKS.rose},.9)` },
    { k: .98, fill: IKS.plum, glow: IKS.plum },
    { k: .8, fill: IKS.deep, glow: IKS.deep }
  ];
  const PAL_SOFT = [
    { k: 1.05, fill: `rgba(${IKS.teal},.34)`, glow: `rgba(${IKS.teal},.7)` },
    { k: 1, fill: `rgba(${IKS.rose},.34)`, glow: `rgba(${IKS.rose},.7)` },
    { k: .82, fill: 'rgba(74,47,71,.16)', glow: 'rgba(74,47,71,.4)' }
  ];
  function paintInk(g, dpr, cx, cy, r, o) {
    const ph = o.ph, t = o.t || 0, amp = o.amp ?? .2;
    o.pal.forEach((L, li) => {
      const rad = r * L.k, N = 88;
      g.beginPath();
      for (let i = 0; i <= N; i++) {
        const a = i / N * TAU, k = 1 + amp * (.5 * Math.sin(3 * a + ph[0] + t * .0006) + .32 * Math.sin(5 * a + ph[1] - t * .0004 * (1 + li * .2)) + .2 * Math.sin(8 * a + ph[2]) + .11 * Math.sin(14 * a + ph[3] + t * .0008));
        const x = cx + Math.cos(a) * rad * k, y = cy + Math.sin(a) * rad * k;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.closePath(); g.shadowColor = L.glow; g.shadowBlur = (li < 2 ? 22 : 12) * dpr; g.fillStyle = L.fill; g.fill();
    });
    g.shadowBlur = 0;
    if (o.tendrils) {   // fine capillary threads creeping out of the edge
      g.lineCap = 'round'; g.strokeStyle = o.tendrilColor || 'rgba(74,47,71,.55)';
      o.tn.forEach(([a, len, bend]) => {
        const r0 = r * .9, r1 = r * (1.04 + len * o.grow), ca = a + bend;
        g.lineWidth = 2.2 - len * 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.quadraticCurveTo(cx + Math.cos(ca) * (r0 + r1) / 2, cy + Math.sin(ca) * (r0 + r1) / 2, cx + Math.cos(a + bend * 1.6) * r1, cy + Math.sin(a + bend * 1.6) * r1); g.stroke();
      });
    }
  }
  const inkOpts = (pal, extra) => ({ pal, ph: [R(0, TAU), R(0, TAU), R(0, TAU), R(0, TAU)], tn: Array.from({ length: 16 }, () => [R(0, TAU), R(.2, 1), R(-.35, .35)]), ...extra });

  const PAL_FIN = [
    { k: 1.05, fill: `rgba(${IKS.teal},.2)`, glow: `rgba(${IKS.teal},.5)` },
    { k: 1, fill: `rgba(${IKS.rose},.2)`, glow: `rgba(${IKS.rose},.5)` },
    { k: .8, fill: 'rgba(74,47,71,.05)', glow: 'rgba(74,47,71,.15)' }
  ];
  // small blooms: RSVP drop and the finale wash
  function miniBloom(cv, pal, cx, cy, maxR, ms, keep) {
    if (!cv) return Promise.resolve();
    const g = cv.getContext('2d'), o = inkOpts(pal, { amp: .24 });
    return M.tween(0, 1, ms, 'out', v => {
      const { w, h, dpr } = fit(cv, 1.5); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      o.t = v * 1500; paintInk(g, dpr, cx ?? w / 2, cy ?? h / 2, maxR(w, h) * v, o);
    }).then(() => { if (keep === false) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); });
  }

  // ---------- cover: a drop of ink, a bloom, the tide ----------
  const DROP = '<svg viewBox="0 0 48 72" aria-hidden="true" focusable="false"><defs><radialGradient id="ikD" cx=".36" cy=".38" r=".8"><stop offset="0" stop-color="#7a5476"/><stop offset=".55" stop-color="#4a2f47"/><stop offset="1" stop-color="#2a1829"/></radialGradient></defs><path d="M24 2C26 18 44 34 44 50a20 20 0 0 1-40 0C4 34 22 18 24 2z" fill="url(#ikD)"/><ellipse cx="16" cy="46" rx="4.5" ry="8" fill="#fff" opacity=".28" transform="rotate(14 16 46)"/></svg>';
  let coverStop = null;
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier(); coverStop?.(); el.classList.remove('ik-fade');
    el.innerHTML = `<div class="ik-stage">
      <div class="ik-paper" aria-hidden="true"><i class="w1"></i><i class="w2"></i><i class="w3"></i></div>
      <canvas class="ik-stamps" aria-hidden="true"></canvas>
      <div class="ik-txt">
        <p class="ik-to">Gửi ${e(c.guest)}</p>
        <h1 class="ik-names"><span class="n n1">${e(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n n2">${e(D.groom.name)}</span></h1>
        <p class="ik-dow">${c.dow}</p>
        <p class="ik-date">${c.d} · ${c.m} · ${c.y}</p>
      </div>
      <i class="ik-ring" aria-hidden="true"></i>
      <canvas class="ik-ink" aria-hidden="true"></canvas>
      <button class="ik-drop" type="button" aria-label="Chạm vào giọt mực để mở thiệp"><span class="ik-sway">${DROP}</span></button>
      <p class="ik-egg" role="status"></p>
      <div class="ik-ui"><p class="ik-hint">Chạm vào giọt mực</p><button class="open-btn" type="button">Mở thiệp</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.ik-stage'), ink = q('.ik-ink'), stampCv = q('.ik-stamps'), dropEl = q('.ik-drop'), ring = q('.ik-ring'), egg = q('.ik-egg');
    const g = ink.getContext('2d'), sg = stampCv.getContext('2d');
    let go = false, music = false, stamps = 0, eggT = 0, buf = null;
    const begin = () => { if (!music) { music = true; EA.music(); M.requestTilt(); } };

    // easter egg: tap the paper and it takes a splash of ink; five splashes and it whispers
    stage.addEventListener('pointerdown', ev => {
      if (go || ev.target.closest('.ik-drop, .ik-ui')) return;
      const r = stampCv.getBoundingClientRect(), { dpr } = fit(stampCv, 1.5), x = (ev.clientX - r.left) * dpr, y = (ev.clientY - r.top) * dpr;
      begin(); sg.setTransform(1, 0, 0, 1, 0, 0);
      const base = R(9, 17) * dpr; sg.fillStyle = 'rgba(74,47,71,.78)'; sg.shadowColor = 'rgba(74,47,71,.6)'; sg.shadowBlur = 8 * dpr;
      sg.beginPath(); sg.arc(x, y, base, 0, TAU); sg.fill();
      for (let i = 0; i < 7; i++) { const a = R(0, TAU), d = base * R(1.2, 2.5); sg.beginPath(); sg.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, base * R(.1, .3), 0, TAU); sg.fill(); }
      M.haptic('tap'); M.tone('pop');
      if (++stamps === 5) {
        egg.textContent = c.p.get('insideJoke', 'Mực đã thấm giấy, tình đã thấm lòng.'); egg.classList.add('on'); M.haptic('success'); M.tone('chime');
        clearTimeout(eggT); eggT = setTimeout(() => egg.classList.remove('on'), 5200);
      }
    });

    // the wow: fall, impact, bloom, tide
    const wow = async () => {
      if (go) return; go = true; begin(); stage.classList.add('go'); M.haptic('tap'); M.tone('whoosh');
      if (c.reduced) { open(); return; }
      const { w: W0, h: H0 } = fit(ink, 1);   // sizes (CSS px); canvas drawn at a capped dpr
      const dpr = Math.min(M.tier === 'low' ? 1 : 1.25, devicePixelRatio || 1);
      ink.width = Math.round(W0 * dpr); ink.height = Math.round(H0 * dpr);
      const W = W0, H = H0, cx = W / 2, cy = H * .5, Rmax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.16;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dr = dropEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const dy = cy - (dr.top - sr.top + dr.height * .72);
      dropEl.classList.add('fall');
      await M.tween(0, 1, 560, t => t * t, v => { dropEl.style.transform = `translateY(${dy * v}px) scaleY(${1 + .22 * v}) scaleX(${1 - .1 * v})`; });
      // impact
      dropEl.hidden = true; ring.style.left = cx + 'px'; ring.style.top = cy + 'px'; ring.classList.add('on');
      M.haptic('thud'); M.tone('thud');
      const o = inkOpts(PAL_INK, { amp: .22, tendrils: M.tier !== 'low', grow: 0 });
      const drops = Array.from({ length: Math.round(M.scale(16)) + 4 }, () => { const a = R(-Math.PI * .95, -Math.PI * .05), v = R(.25, .75); return { x: cx, y: cy, vx: Math.cos(a) * v * 1.5, vy: Math.sin(a) * v, r: R(1.8, 4.4) }; });
      let dropT = 0;
      const t0 = performance.now();
      await M.tween(0, 1, 1250, 'out', v => {
        const now = performance.now(), dt = Math.min(40, now - dropT || 16); dropT = now;
        g.clearRect(0, 0, W, H); o.t = now - t0; o.grow = v;
        paintInk(g, dpr, cx, cy, Rmax * v, o);
        g.fillStyle = IKS.plum; drops.forEach(d => { d.x += d.vx * dt * .5; d.y += d.vy * dt * .5; d.vy += .0025 * dt; if (v < .7) { g.beginPath(); g.arc(d.x, d.y, d.r * (1 - v * .8), 0, TAU); g.fill(); } });
      });
      // flood: freeze the full ink on a buffer, then let the tide eat it
      g.clearRect(0, 0, W, H); g.fillStyle = IKS.plum; g.fillRect(0, 0, W, H);
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Rmax * .8); gr.addColorStop(0, 'rgba(51,32,47,.9)'); gr.addColorStop(1, 'rgba(51,32,47,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      buf = document.createElement('canvas'); buf.width = ink.width; buf.height = ink.height; buf.getContext('2d').drawImage(ink, 0, 0);
      stage.classList.add('flood'); M.haptic('crack');
      c.after(200, () => M.tone('whoosh'));
      const n1 = q('.n1'), n2 = q('.n2'), names = q('.ik-names'), nb = names.getBoundingClientRect().bottom - sr.top;
      let said = false; const A = H * .03, ph0 = R(0, TAU);
      names.classList.add('gone');
      const wave = (x, yf, ph, a) => yf + a * (Math.sin(x / W * TAU * 1.35 + ph) + .45 * Math.sin(x / W * TAU * 3.3 - ph * 1.4));
      await M.tween(0, 1, 1500, 'inOut', v => {
        const yf = H * (1.12 - 1.38 * v), ph = ph0 + v * 7;
        g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.drawImage(buf, 0, 0, W, H);
        g.globalCompositeOperation = 'destination-out';
        [[34, .3], [16, .45], [0, 1]].forEach(([off, a]) => {   // feathered, wet edge
          g.globalAlpha = a; g.beginPath(); g.moveTo(0, H + 20);
          for (let x = 0; x <= W + 8; x += W / 44) g.lineTo(x, wave(x, yf - off, ph, A));
          g.lineTo(W, H + 20); g.closePath(); g.fill();
        });
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        g.beginPath(); for (let x = 0; x <= W + 8; x += W / 44) { const y = wave(x, yf, ph, A); x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = 'rgba(251,246,239,.9)'; g.lineWidth = 3; g.shadowColor = `rgba(${IKS.teal},1)`; g.shadowBlur = 14 * dpr; g.stroke(); g.shadowBlur = 0;
        g.beginPath(); for (let x = 0; x <= W + 8; x += W / 44) { const y = wave(x, yf + 14, ph + .7, A * .8); x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = `rgba(${IKS.teal},.5)`; g.lineWidth = 8; g.stroke();
        if (!said && yf - A < nb) {   // the tide reaches the names: paint them in ink wash
          said = true; M.haptic('success'); M.tone('chime');
          M.reveal(n1, { mode: 'letters', stagger: 62 }); M.reveal(n2, { mode: 'letters', stagger: 62, delay: 420 }); names.classList.remove('gone');
        }
      });
      g.clearRect(0, 0, W, H); stage.classList.add('rest');
      c.after(520, () => { el.classList.add('ik-fade'); open(); afterOpen(); });
    };
    dropEl.addEventListener('click', wow);
    q('.open-btn').addEventListener('click', wow, { once: true });
    coverStop = () => { go = true; };
  });

  const afterOpen = () => { setTier(); html.classList.add('ik-open'); };

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="ik-hero">
      <div class="ik-washes" aria-hidden="true"><i class="w1"></i><i class="w2"></i><i class="w3"></i></div>
      <div class="ik-hero-in">
        <div class="ik-blot"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
        <p class="eyebrow">${e(c.mod.content.eyebrow || 'Mực loang, tình đậm')}</p>
        <h1 class="ik-names"><span class="n">${e(cp.brideName)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(cp.groomName)}</span></h1>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="ik-date">${c.d} · ${c.m} · ${c.y}</p>
        <p class="hero-date">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="ik-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div>
    </div>`;
  });

  // milestones as waves: chapter i carries i+1 lines of water, the tide rising toward the wedding
  const WAVE = n => `<svg class="ik-wv" viewBox="0 0 64 ${8 + n * 9}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<path pathLength="1" d="M2 ${8 + i * 9}q8-8 15 0t15 0 15 0 15 0" />`).join('')}</svg>`;
  EA.section('story', ({ esc: e, mod, d, m, y }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    const n = chs.length + 1;
    return `<div class="wrap">
      ${head('Con sóng đầu tiên', e(mod.content.title || 'Chuyện của chúng mình'))}
      <ol class="ik-tides">${chs.map((ch, i) => `<li class="ik-tide" style="--w:${i + 1}">
        <div class="ik-wvbox">${WAVE(Math.min(5, i + 1))}</div>
        <div class="ik-tbody">${ch.image ? `<div class="ik-tpic"><img src="${e(ch.image)}" alt="" loading="lazy"></div>` : ''}
          <p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}
        <li class="ik-tide last"><div class="ik-wvbox">${WAVE(Math.min(5, n))}</div><div class="ik-tbody"><p class="label">Con sóng cuối</p><h3>${+d} tháng ${+m}, ${y}</h3><p>Có bạn trong khung hình thì mới trọn vẹn.</p></div></li>
      </ol>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
    </div>`;
  });

  // RSVP: say yes and a drop of ink falls on the card
  EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
    ${head('Một giọt mực xác nhận', 'Bạn sẽ đến chứ?', 'Chạm “Mình sẽ đến”, một giọt mực sẽ rơi xuống thiệp')}
    <div class="ik-seal"><canvas aria-hidden="true"></canvas><span class="ik-seal-t" aria-hidden="true"></span></div>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="ik-fin"><canvas aria-hidden="true"></canvas></div>
    <div class="wrap narrow ik-thx">
    <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Thả lại giọt mực ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);

  // ---------- add-ons driven by personality ----------
  function addSection(main, id, inner, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec ik-add m-${id}`; s.innerHTML = `<div class="wrap narrow">${inner}</div>`;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const POEMS = [
    { who: 'Xuân Diệu', lines: ['Làm sao sống được mà không yêu,', 'Không nhớ không thương một kẻ nào?'] },
    { who: 'Nguyễn Bính', lines: ['Nhà em có một giàn giầu,', 'Nhà anh có một hàng cau liên phòng.'] }
  ];
  const kmText = km => km ? `${Math.round(km / 10) * 10} km`.replace(/(\d)(?=(\d{3})+$)/, '$1.') : '';

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    setTimeout(() => { if (cov.hidden) afterOpen(); }, 80);
    // Vietnamese-only eyebrows: swap core's English defaults (module content eyebrows already win)
    const VI = { 'Save the date': 'Ngày trọng đại', 'Wedding itinerary': 'Lịch trình trong ngày', 'Wedding party': 'Những người đồng hành', 'Wedding film': 'Thước phim cưới', 'A glimpse of us': 'Khoảnh khắc của chúng mình', 'Dress code & notes': 'Trang phục và lưu ý', 'Wedding guide': 'Cẩm nang ngày cưới', 'A note from us': 'Lời nhắn từ chúng mình', 'Gift registry': 'Gợi ý quà tặng', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ', 'Love story': 'Chuyện tình', 'RSVP': 'Xác nhận tham dự', 'Wedding': 'Đám cưới', 'Thank you': 'Lời cảm ơn' };
    main.querySelectorAll('.eyebrow').forEach(n => { const k = n.textContent.trim(); if (VI[k]) n.textContent = VI[k]; });

    // sections bleed in like ink in water; once settled, drop the mask
    main.addEventListener('animationend', ev => { if (ev.animationName === 'ikBleed') ev.target.classList.remove('reveal'); });

    // ---- bao nhiêu con sóng: days together as waves ----
    if (p.daysTogether != null) {
      const sec = addSection(main, 'days', `${head('Những con sóng của hai đứa', 'Mỗi ngày một con sóng')}
        <div class="ik-gauge"><div class="ik-sea"><svg viewBox="0 0 400 60" preserveAspectRatio="none" class="s1"><path d="M0 30q50-30 100 0t100 0 100 0 100 0V60H0z"/></svg><svg viewBox="0 0 400 60" preserveAspectRatio="none" class="s2"><path d="M0 30q50-30 100 0t100 0 100 0 100 0V60H0z"/></svg></div>
          <p class="ik-count" aria-label="${p.daysTogether} ngày"><b data-n="${p.daysTogether}">0</b><span>con sóng đã đưa hai đứa về một bến</span></p></div>
        ${p.has('metPlace') ? `<p class="sub">Con sóng đầu tiên chạm bờ ở ${e(p.get('metPlace'))}${p.has('metCity') ? `, ${e(p.get('metCity'))}` : ''}.</p>` : ''}`, ['.m-story', '.m-saveDate', '.m-events']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => { sec.classList.add('rise'); M.tween(0, p.daysTogether, 2200, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .4 });
    }

    // ---- hai dòng mực: two hometowns flowing into one river ----
    const ht = p.get('hometowns', null), pin = p.get('hometownPins', null);
    if (ht && ht.bride && ht.groom) {
      const km = pin && p.kmBetween(pin.bride, pin.groom);
      addSection(main, 'rivers', `${head('Hai dòng mực', 'Từ hai miền về một bến')}
        <div class="ik-rv"><p class="a"><span>Quê ${e(c.data.bride.short)}</span>${e(ht.bride)}</p><p class="b"><span>Quê ${e(c.data.groom.short)}</span>${e(ht.groom)}</p></div>
        <svg class="ik-streams" viewBox="0 0 320 190" aria-hidden="true"><path class="r a" pathLength="1" d="M50 6C50 70 150 70 160 130"/><path class="r b" pathLength="1" d="M270 6C270 70 170 70 160 130"/><path class="r m" pathLength="1" d="M160 130C160 150 164 168 160 186"/><circle cx="160" cy="132" r="7"/></svg>
        <p class="ik-rv-end">${p.has('metCity') ? `Gặp nhau ở ${e(p.get('metCity'))}` : 'Gặp nhau'}</p>
        ${km ? `<p class="sub">Hai quê cách nhau khoảng ${kmText(km)}, vậy mà hai dòng mực vẫn tìm thấy nhau.</p>` : ''}`, ['.m-days', '.m-story', '.m-saveDate', '.m-events']);
    }

    // ---- hai sắc mực: traits become two pigments that mix ----
    const tb = p.get('traits.bride', null), tg = p.get('traits.groom', null);
    if (tb && tg) {
      const RH = { morning: 'Mực buổi sáng', night: 'Mực ban đêm' }, who = (t, s) => `<li class="ik-pig ${t.rhythm === 'night' ? 'night' : 'morn'}"><i aria-hidden="true"></i><h3>${e(t.nickname || s)}</h3><p>${[RH[t.rhythm], t.drink, t.hobby].filter(Boolean).map(e).join('<br>')}</p></li>`;
      const sec = addSection(main, 'inks', `${head('Hai sắc mực', 'Hai người, hai màu')}
        <ul class="ik-pigs">${who(tb, c.data.bride.short)}${who(tg, c.data.groom.short)}</ul>
        <button class="btn ghost ik-mix" type="button">Hòa hai màu mực</button><p class="ik-mixed" aria-live="polite"></p>`, ['.m-rivers', '.m-days', '.m-story', '.m-saveDate', '.m-events']);
      const b = sec.querySelector('.ik-mix');
      b.addEventListener('click', () => {
        const on = sec.classList.toggle('mixed'); M.haptic('tap'); M.tone('pop');
        b.textContent = on ? 'Tách hai màu' : 'Hòa hai màu mực';
        sec.querySelector('.ik-mixed').textContent = on ? 'Hai màu mực hòa vào nhau thành một sắc riêng, sắc của chúng mình.' : '';
      });
    }

    // ---- thơ gửi bạn: the poem picker ----
    const own = p.has('quote.text') ? { who: p.get('quote.author', 'Chúng mình'), lines: [p.get('quote.text')], own: 1 }
      : p.has('song.lyric') ? { who: p.get('song.title', 'Chúng mình'), lines: [p.get('song.lyric')], own: 1 } : null;
    const poems = own ? [...POEMS, { ...own, label: 'Của chúng mình' }] : POEMS;
    const ps = addSection(main, 'poem', `${head('Một bài thơ cho ngày vui', 'Chọn bài thơ bạn thích')}
      <div class="ik-chips" role="tablist" aria-label="Chọn bài thơ">${poems.map((o, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${e(o.label || o.who)}</button>`).join('')}</div>
      <figure class="ik-sheet"><blockquote class="ik-lines" aria-live="polite"></blockquote><figcaption></figcaption></figure>`, ['.m-inks', '.m-rivers', '.m-days', '.m-story', '.m-saveDate', '.m-events']);
    const lines = ps.querySelector('.ik-lines'), cap = ps.querySelector('figcaption'), tabs = [...ps.querySelectorAll('[role=tab]')];
    const show = (i, loud) => {
      const o = poems[i]; tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
      lines.removeAttribute('data-ea-text'); lines.classList.remove('ea-mo-on', 'ea-mo-write'); lines.innerHTML = o.lines.map(e).join('<br>');
      cap.textContent = `— ${o.who}`; ps.classList.remove('flash'); void ps.offsetWidth; ps.classList.add('flash');
      M.reveal(lines, { mode: 'write', stagger: 26 }); if (loud) { M.haptic('tap'); M.tone('pop'); }
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i, true)));
    lines.textContent = poems[0].lines.join(' '); cap.textContent = `— ${poems[0].who}`;
    M.inView(ps, () => show(0, false), { threshold: .45 });

    // ---- rsvp: yes drops ink on the card, no sends a pale ripple ----
    main.querySelectorAll('form.rsvp-form').forEach(form => form.addEventListener('change', () => {
      const yes = form.attending.value === 'yes', box = main.querySelector('.ik-seal'), cv = box?.querySelector('canvas');
      if (!cv || box.dataset.v === form.attending.value) return; box.dataset.v = form.attending.value;
      box.classList.toggle('yes', yes); M.haptic('tap'); M.tone(yes ? 'pop' : 'click');
      miniBloom(cv, yes ? PAL_INK : PAL_SOFT, null, null, (w, h) => Math.min(h * .46, 58), 900);
    }));

    // ---- ongoing: the washes breathe with tilt ----
    const hero = main.querySelector('.ik-hero');
    if (hero) M.tilt(v => { hero.style.setProperty('--tx', v.x.toFixed(3)); hero.style.setProperty('--ty', v.y.toFixed(3)); });
  });

  // finale: rose and teal ink wash over the thank-you, the page exhales
  EA.onRsvp((entry) => {
    html.classList.add('ik-finale'); M.haptic('success'); M.tone('chime');
    const th = document.getElementById('thanks'), cv = th?.querySelector('.ik-fin canvas');
    setTimeout(() => th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 700);
    if (cv && entry && entry.attending !== false) setTimeout(() => miniBloom(cv, PAL_FIN, null, null, (w, h) => Math.hypot(w, h) * .62, 2800), 1200);
  });
})();
