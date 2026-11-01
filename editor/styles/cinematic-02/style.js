// Herbarium of Us: a naturalist's notebook of your memories. Pull the ribbon, the cover opens and pressed leaves peel off the page with specimen labels.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const f1 = n => +n.toFixed(1);
  const setTier = () => { html.dataset.hbTier = M.tier; };
  const nb = s => String(s || '').replace(/ (\S+)$/, ' $1');

  // ---------- leaf art (all drawn here as paths, 100x100 box centred on 0,0) ----------
  const poly = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  const maple = (() => {
    const pts = []; for (let i = 0; i < 140; i++) { const ph = -Math.PI + i / 140 * TAU, r = 37 * (.3 + .7 * Math.abs(Math.cos(2.5 * ph)) ** 2.4) * (1 + .05 * Math.sin(ph * 21)); pts.push([r * Math.sin(ph), -r * Math.cos(ph) - 4]); }
    return poly(pts);
  })();
  const oak = (() => {
    const L = [], Rr = []; for (let i = 0; i <= 44; i++) { const u = i / 44, y = 42 - u * 84, w = 17 * Math.sin(Math.PI * (.04 + u * .92)) ** .6 * (.6 + .4 * Math.abs(Math.sin(3.5 * Math.PI * u + .4))); L.push([-w, y]); Rr.push([w, y]); }
    return poly(L.concat(Rr.reverse()));
  })();
  const fern = (() => {
    let d = ''; for (let i = 0; i < 13; i++) {
      const y = 34 - i * 5.6, L = 15 * Math.sin(Math.PI * (i + 1.2) / 14.4) ** .8 + 2;
      for (const s of [-1, 1]) d += `M0 ${f1(y)}q${f1(s * L * .55)} ${f1(-L * .55)} ${f1(s * L)} ${f1(-L * .28)}q${f1(-s * L * .45)} ${f1(L * .55)} ${f1(-s * L)} ${f1(L * .28)}Z`;
    }
    return d + 'M0 -36q5 -4 0 -9q-5 5 0 9Z';
  })();
  const LEAVES = [
    { n: 'bạch quả', d: 'M0 44C-3 30-6 22-22 12C-34 4-34-16-24-30C-14-26-8-34 0-32C8-34 14-26 24-30C34-16 34 4 22 12C6 22 3 30 0 44Z', v: 'M0 44V-4M0 6L-18-14M0 6L18-14M0 6L-9-22M0 6L9-22M0 6L-26-4M0 6L26-4' },
    { n: 'phong', d: maple, v: 'M0 8V40M0 6L0-40M0 2L-34-14M0 2L34-14M0-2L-22-36M0-2L22-36' },
    { n: 'sồi', d: oak, v: 'M0 42V-44M0 24L-12 14M0 24L12 14M0 4L-13-6M0 4L13-6M0-16L-12-26M0-16L12-26' },
    { n: 'liễu', d: 'M0 40C-13 22-13-14 0-42C13-14 13 22 0 40Z', v: 'M0 44V-38M0 24L-9 14M0 24L9 14M0 6L-10-4M0 6L10-4M0-12L-8-22M0-12L8-22' },
    { n: 'trầu', d: 'M0-42C-8-24-34-14-30 14C-28 30-10 34 0 28C10 34 28 30 30 14C34-14 8-24 0-42Z', v: 'M0 32V-38M0 16L-18 2M0 16L18 2M0 0L-16-12M0 0L16-12' },
    { n: 'dương xỉ', d: fern, v: 'M0 36V-38' }
  ];
  const PAL = ['#6f8d4d', '#8b9a45', '#b7842f', '#a65530', '#5f8a6a', '#c27a45'];
  const leafSVG = (i, col, cls = '') => { const L = LEAVES[i % 6]; return `<svg class="hb-lf ${cls}" viewBox="-50 -50 100 100" aria-hidden="true"><path d="${L.d}" fill="${col}"/><path d="${L.d}" fill="url(#hbShade)"/><path d="${L.v}" fill="none" stroke="rgba(32,44,24,.42)" stroke-width="1.1" stroke-linecap="round"/></svg>`; };
  const P2D = LEAVES.map(L => ({ d: new Path2D(L.d), v: new Path2D(L.v) }));
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="hbShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient></defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', DEFS);
  const wind = { x: 0 };

  // falling-leaf layer on a canvas (cover ambience + the ongoing page layer)
  function leafLayer(cv, count, speed) {
    return M.particles(cv, {
      count,
      init(p, i, w, h) {
        const first = p.first === undefined; p.first = false;
        if (p.burst) { p.x = w / 2 + R(-80, 80); p.y = h * .55; p.vx = R(-.28, .28); p.vy = R(-.42, -.12); p.g = .00055; }
        else { p.x = R(0, w); p.y = first ? R(0, h) : R(-40, -12); p.vy = R(.018, .04) * speed; p.vx = 0; p.g = 0; }
        p.k = Math.random() * 6 | 0; p.col = PAL[Math.random() * PAL.length | 0]; p.sz = R(13, 24); p.ph = R(0, TAU); p.rot = R(0, TAU); p.vr = R(-.0011, .0011); p.a = R(.55, .9);
      },
      step(p, dt, w, h) {
        if (p.g) { p.vy += p.g * dt; p.vx *= .995; }
        p.y += p.vy * dt; p.x += (Math.sin(p.life * .0007 + p.ph) * .03 + wind.x * .025) * dt + p.vx * dt; p.rot += p.vr * dt;
        return p.y < h + 30 && p.x > -40 && p.x < w + 40;
      },
      draw(g, p) {
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); const s = p.sz / 50; g.scale(s * (.5 + .5 * Math.abs(Math.cos(p.life * .0009 + p.ph))), s);
        g.globalAlpha = p.a; g.fillStyle = p.col; g.fill(P2D[p.k].d); g.strokeStyle = 'rgba(32,44,24,.45)'; g.lineWidth = 1.3 / s * .6; g.stroke(P2D[p.k].v); g.restore();
      }
    });
  }
  let edge = null, edgeCv = null;
  function startEdge() {
    if (edge) return;
    edgeCv = Object.assign(document.createElement('canvas'), { className: 'hb-edge' }); edgeCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(edgeCv);
    edge = leafLayer(edgeCv, 10, 1); M.tilt(v => { wind.x = v.x; });
  }
  const stopEdge = () => { if (edgeCv) edgeCv.style.opacity = 0; };

  // ---------- specimens: personal places become collected plants ----------
  const ascii = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const epithet = name => {
    if (/thư viện/i.test(name)) return 'bibliothecae';
    let t = name.trim().split(/\s+/).filter(w => !/^(đh|đại|học|trường|bãi|biển|quán|phố|tp\.?)$/i.test(w)); if (!t.length) t = [name];
    let tail = t.slice(-1); if (t.length > 1 && tail[0].length < 5) tail = t.slice(-2);
    return ascii(tail.join('')).replace(/[^a-z]/g, '') + 'ensis';
  };
  const dms = (v, a, b) => { const x = Math.abs(v), d = Math.floor(x), m = Math.round((x - d) * 60); return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? a : b}`; };
  const GEN = c => ['Amor', /cà phê|cafe/i.test(`${c.p.get('traits.bride.drink', '')} ${c.p.get('traits.groom.drink', '')}`) ? 'Cafeus' : 'Iter', 'Memoria', 'Lumen'];
  function places(c) {
    const g = GEN(c), pl = (c.p.raw.places || []).slice(0, 4);
    return pl.map((x, i) => {
      const [yy, mm] = String(x.date || '').split('-');
      return { name: x.name, latin: `${g[i % 4]} ${epithet(x.name)}`, when: yy ? `thu thập ${mm ? mm + '/' : ''}${yy}` : 'thu thập', year: +yy || null, lat: x.lat, lng: x.lng, k: i };
    });
  }
  function specimens(c) {
    const out = places(c), ch = c.mods.story?.content?.chapters || [], gen = ['Memoria prima', 'Iter primum', 'Rogatio', 'Nuptiae'];
    for (let i = 0; out.length < 4 && i < ch.length; i++) out.push({ name: ch[i].title, latin: gen[i] || 'Memoria', when: `thu thập ${ch[i].date.replace(/\s/g, '')}`, k: out.length });
    while (out.length < 4) out.push({ name: 'Hôm nay', latin: 'Dies felix', when: `thu thập ${c.d}/${c.m}/${c.y}`, k: out.length });
    out.push({ name: c.data.bride.name, latin: 'Sponsa carissima', when: 'mẫu số 05', k: 4 }, { name: c.data.groom.name, latin: 'Sponsus carissimus', when: 'mẫu số 06', k: 5 });
    return out.map((s, i) => ({ ...s, k: [0, 1, 2, 3, 4, 5][i], col: PAL[i % 6] }));
  }

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier();
    const sp = specimens(c);
    el.innerHTML = `<div class="hb-stage">
      <canvas class="hb-amb" aria-hidden="true"></canvas>
      <div class="hb-desk"><div class="hb-tilt"><div class="hb-book">
        <div class="hb-page"><p class="hb-pg"><span>Trang 01</span><span>mẫu thu thập</span></p>
          <div class="hb-grid">${sp.map((s, i) => `<div class="hb-sp" style="--r:${[-8, 6, -5, 9, -7, 5][i]}deg;--fx:${[-40, 30, -20, 40, -30, 24][i]}vw;--fr:${[-200, 160, -140, 210, -180, 150][i]}deg;--d:${i}"><div class="hb-sp-in"><i class="tape a"></i><i class="tape b"></i><span class="hb-lfw">${leafSVG(s.k, s.col)}</span>
            <p class="hb-lab"><b>${e(s.latin)}</b><span>${e(s.when)}</span></p></div></div>`).join('')}</div></div>
        <div class="hb-cover"><div class="face front"><span class="stitch" aria-hidden="true"></span><div class="hb-plate">
            <p class="hb-to">Gửi ${e(c.guest)}</p>
            <h1 class="hb-names"><span>${e(D.bride.name).replace(' ', '&nbsp;')}</span><i aria-hidden="true">&amp;</i><span>${e(D.groom.name).replace(' ', '&nbsp;')}</span></h1>
            <p class="hb-date">${c.d} · ${c.m} · ${c.y}</p></div></div><div class="face back" aria-hidden="true"></div></div>
      </div></div>
      <button class="hb-ribbon" type="button" aria-label="Kéo dải ruy băng để mở sổ"><i></i></button></div>
      <p class="hb-egg" role="status"></p>
      <div class="hb-ui"><p class="hb-hint">Kéo dải ruy băng xuống để mở sổ</p><button class="open-btn" type="button">Mở sổ</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.hb-stage'), book = q('.hb-book'), tiltEl = q('.hb-tilt'), rib = q('.hb-ribbon'), cov = q('.hb-cover');
    let go = false, music = false;
    const amb = leafLayer(q('.hb-amb'), 8, .6);
    const offTilt = M.tilt(v => { wind.x = v.x; tiltEl.style.transform = `rotateX(${v.y * -5}deg) rotateY(${v.x * 8}deg)`; });
    const clean = () => { amb.stop(); offTilt(); };
    const spEls = [...el.querySelectorAll('.hb-sp')];

    const wow = () => {
      if (go) return; go = true; stage.classList.add('go'); rib.style.transform = ''; cov.style.transform = '';
      M.requestTilt(); if (!music) { music = true; EA.music(); }
      M.haptic('tap'); M.tone('whoosh');
      c.after(150, () => { M.tone('thud'); });
      c.after(1500, () => spEls.forEach((s, i) => c.after(i * 200, () => {
        s.classList.add('peel'); M.haptic(i % 2 ? 'tap' : 'crack'); M.tone('click');
        const lab = s.querySelector('.hb-lab b'); M.reveal(lab, { mode: 'letters', stagger: 26 });
      })));
      c.after(3300, () => { stage.classList.add('fly'); M.tone('whoosh'); startEdge(); edge.burst(18); });
      c.after(4300, () => { M.haptic('success'); M.tone('chime'); stage.classList.add('out'); });
      c.after(4700, () => { open(); html.classList.add('hb-open'); c.after(800, clean); });
    };
    // pull the ribbon: the cover follows a little, release past the middle to open
    M.drag(rib, { axis: 'y', distance: 90, onMove: p => { if (go) return; rib.style.transform = `translateY(${p * 70}px)`; cov.style.transform = `translateZ(3px) rotateY(${-p * 22}deg)`; stage.classList.add('pulling'); },
      onEnd: p => { if (go) return; if (p > .55) wow(); else { rib.style.transform = ''; cov.style.transform = ''; stage.classList.remove('pulling'); } } });
    rib.addEventListener('click', () => { if (!go) wow(); });
    q('.open-btn').addEventListener('click', wow, { once: true });
    // easter egg: tap the brass corner on the cover for a note from the margin
    book.addEventListener('dblclick', () => { if (go) return; const eg = q('.hb-egg'); eg.textContent = c.p.get('insideJoke', 'Mẫu vật này được ép bằng rất nhiều yêu thương.'); eg.classList.add('on'); M.haptic('success'); M.tone('chime'); setTimeout(() => eg.classList.remove('on'), 4200); });
  });

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, p } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    const note = p.get('insideJoke', 'Mẫu vật này được ép bằng rất nhiều yêu thương.');
    return `<div class="hb-hero">
      <span class="hb-deco d1" aria-hidden="true">${leafSVG(1, PAL[3])}</span><span class="hb-deco d2" aria-hidden="true">${leafSVG(0, PAL[2])}</span><span class="hb-deco d3" aria-hidden="true">${leafSVG(5, PAL[0])}</span>
      <div class="hb-sheet">
        <p class="hb-no"><span>Mẫu vật số 001</span><span>${c.d}.${c.m}.${c.y}</span></p>
        <button class="hb-photo" type="button" aria-label="Lật mặt sau tấm ảnh"><span class="side front"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></span><span class="side back"><i>Ghi chú sau ảnh</i>${e(note)}</span><i class="tape a"></i><i class="tape b"></i></button>
        <h1 class="hb-names"><span>${e(cp.brideName).replace(' ', '&nbsp;')}</span><i aria-hidden="true">&times;</i><span>${e(cp.groomName).replace(' ', '&nbsp;')}</span></h1>
        <p class="headline">${c.t(nb(cp.headline))}</p>
        <dl class="hb-tab"><div><dt>Thu thập</dt><dd>${c.dow}, ${c.d}/${c.m}/${c.y}</dd></div>${cp.city ? `<div><dt>Nơi ép</dt><dd>${e(cp.city)}</dd></div>` : ''}</dl>
        ${past ? `<p class="hb-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  EA.section('story', ({ esc: e, mod }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    return `<div class="wrap">${head(e(mod.content.eyebrow || 'Chuyện tình'), e(mod.content.title || 'Chuyện của chúng mình'))}
      <div class="hb-chs">${chs.map((ch, i) => `<article class="hb-ch"><div class="pic">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}<i class="tape a"></i><i class="tape b"></i></div>
        <div class="tx"><span class="hb-lfi">${leafSVG(i + 1, PAL[(i + 2) % 6])}</span><p class="when">Thu thập ${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(nb(ch.text))}</p></div></article>`).join('')}</div>
      ${mod.content.quote ? `<p class="story-quote">${e(nb(mod.content.quote))}</p>` : ''}</div>`;
  });

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="wrap narrow">
    <span class="hb-lfi big" aria-hidden="true">${leafSVG(4, PAL[0])}</span>
    <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(nb(D.thanks))}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="hb-final" aria-live="polite"></div>
    <div class="actions center"><button class="btn" type="button" id="reopen">Mở lại cuốn sổ ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);

  // ---------- add-ons ----------
  function addSection(main, id, inner, afterSel, cls = '') {
    const s = document.createElement('section'); s.id = id; s.className = `sec hb-add m-${id} ${cls}`; s.innerHTML = `<div class="wrap">${inner}</div>`;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.lastElementChild).before(s);
    return s;
  }
  const AFTER = ['.m-story', '.m-saveDate', '.m-events'];
  const stamp = (txt, cls = '') => `<span class="hb-stamp ${cls}">${txt}</span>`;

  const leafList = () => EA.shared.list('leaf').catch(() => []);
  function wallHTML(list, e) { return list.map(l => `<li class="hb-wl" style="--r:${(((l.name || '').length * 37) % 17) - 8}deg">${leafSVG(l.k || 0, PAL[(l.c ?? 0) % 6])}<span>${e(l.name || '')}</span></li>`).join(''); }

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    setTimeout(() => { if (cov.hidden) { startEdge(); html.classList.add('hb-open'); } }, 80);

    // bộ mẫu vật
    const pl = places(c);
    if (pl.length) {
      const sec = addSection(main, 'collection', `${head('Bộ sưu tập', 'Những nơi mình đã đi qua', 'Mỗi nơi một mẫu vật, ép lại trong cuốn sổ của chúng mình.')}
        <div class="hb-coll">${pl.map(s => `<article class="hb-card"><i class="tape a"></i><i class="tape b"></i><span class="hb-lfw big">${leafSVG(s.k, PAL[s.k % 6])}</span>
          <p class="lat">${e(s.latin)}</p><p class="vi">${e(s.name)}</p><p class="meta">${e(s.when)}${s.lat != null ? `<br>${dms(s.lat, 'N', 'S')} ${dms(s.lng, 'E', 'W')}` : ''}</p>${stamp('Đã ép')}</article>`).join('')}</div>`, AFTER);
      sec.querySelectorAll('.hb-card').forEach((cd, i) => M.inView(cd, () => setTimeout(() => cd.classList.add('on'), i * 160), { threshold: .3 }));
    }

    // cây của chúng mình
    if (p.daysTogether != null) {
      const y0 = +p.raw.metDate.slice(0, 4), y1 = +c.y, N = Math.max(2, y1 - y0 + 1), mark = {};
      pl.forEach(s => { if (s.year) mark[s.year] = s.name; });
      let br = '';
      for (let i = 0; i < N; i++) {
        const y = 330 - i * (250 / (N - 1)), dir = i % 2 ? 1 : -1, L = 62 + (i % 3) * 14, x2 = 160 + dir * L, y2 = y - 34 - (i % 2) * 6, last = i === N - 1;
        br += `<g class="br" style="--i:${i}"><path class="bp" pathLength="1" d="M160 ${f1(y + 6)}C${160 + dir * 22} ${f1(y - 4)} ${f1(160 + dir * L * .7)} ${f1(y2 + 10)} ${f1(x2)} ${f1(y2)}"/>
          <g class="lv" transform="translate(${f1(x2)} ${f1(y2)}) rotate(${dir * 24})"><g class="lvs"><g transform="scale(${last ? .55 : .42})"><path d="${LEAVES[i % 3 ? 3 : 0].d}" fill="${last ? 'var(--gold)' : PAL[i % 3]}"/></g><g transform="rotate(${-dir * 60}) scale(.3)"><path d="${LEAVES[3].d}" fill="${PAL[(i + 1) % 3]}" opacity=".85"/></g></g></g>
          <text x="${f1(x2 + dir * 8)}" y="${f1(y2 - 16)}" text-anchor="middle">${y0 + i}</text></g>`;
      }
      const sec = addSection(main, 'tree', `${head('Mỗi năm một cành', 'Cây của chúng mình')}
        <div class="hb-tree"><svg viewBox="0 0 320 360" role="img" aria-label="Cái cây có ${N} cành, mỗi cành một năm bên nhau"><path class="tr" pathLength="1" d="M160 352C158 300 164 240 159 180C155 130 162 90 160 56"/>${br}</svg></div>
        <p class="hb-cap"><b>${p.daysTogether.toLocaleString('vi-VN')}</b> ngày bên nhau, mỗi năm thêm một cành.</p>
        ${Object.keys(mark).length ? `<ul class="hb-years">${Object.keys(mark).map(k => `<li><b>${k}</b> ${e(mark[k])}</li>`).join('')}</ul>` : ''}`, ['.m-collection', ...AFTER]);
      M.inView(sec.querySelector('.hb-tree'), () => { sec.classList.add('grow'); M.haptic('tap'); M.tone('pop'); }, { threshold: .4 });
    }

    // hồ sơ loài
    const T = p.raw.traits || {}, tb = T.bride || {}, tg = T.groom || {}, H = p.raw.hometowns || {};
    if (Object.keys(tb).length || Object.keys(tg).length || p.has('pet')) {
      const rh = r => r === 'night' ? 'Hoạt động về đêm' : r === 'morning' ? 'Hoạt động buổi sáng' : '';
      const card = (nm, full, t, home) => `<article class="hb-prof"><p class="lat">${nm === 'b' ? 'Sponsa' : 'Sponsus'}</p><h3>${e(full)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3>
        <dl>${rh(t.rhythm) ? `<div><dt>Nhịp sống</dt><dd>${rh(t.rhythm)}</dd></div>` : ''}${t.drink ? `<div><dt>Thức uống</dt><dd>${e(t.drink)}</dd></div>` : ''}${t.hobby ? `<div><dt>Sở thích</dt><dd>${e(t.hobby)}</dd></div>` : ''}${home ? `<div><dt>Quê quán</dt><dd>${e(home)}</dd></div>` : ''}</dl></article>`;
      const pet = p.has('pet.name') ? `<article class="hb-prof pet"><p class="lat">Socius</p><h3>${e(p.get('pet.name'))}</h3><dl><div><dt>Loài đồng hành</dt><dd>${e(p.get('pet.kind', 'thú cưng'))} của nhà mình</dd></div></dl></article>` : '';
      addSection(main, 'profiles', `${head('Hồ sơ loài', 'Hai cá thể và một người bạn nhỏ')}<div class="hb-profs">${Object.keys(tb).length ? card('b', c.data.bride.name, tb, H.bride) : ''}${Object.keys(tg).length ? card('g', c.data.groom.name, tg, H.groom) : ''}${pet}</div>`, ['.m-tree', '.m-collection', ...AFTER]);
    }

    // ép một chiếc lá trong sổ lưu bút
    const gb = main.querySelector('.m-guestbook .book');
    if (gb) {
      const form = gb.querySelector('form.wish-form'); let pick = Math.random() * 6 | 0;
      const fs = document.createElement('fieldset'); fs.className = 'hb-pick';
      fs.innerHTML = `<legend>Chọn một chiếc lá để ép vào sổ</legend>${LEAVES.map((L, i) => `<label title="Lá ${L.n}"><input type="radio" name="leaf" value="${i}"${i === pick ? ' checked' : ''}><span>${leafSVG(i, PAL[i])}</span></label>`).join('')}`;
      form.querySelector('button[type=submit]').before(fs);
      fs.addEventListener('change', () => { pick = +fs.querySelector('input:checked').value; M.tone('pop'); });
      const wall = document.createElement('div'); wall.className = 'hb-wall';
      wall.innerHTML = `<p class="label">Tường lá ép</p><ul></ul>`; gb.append(wall);
      const ul = wall.querySelector('ul'), couple = [{ name: c.data.bride.short, k: 4, c: 0 }, { name: c.data.groom.short, k: 1, c: 3 }];
      const draw = () => leafList().then(l => { ul.innerHTML = wallHTML([...couple, ...l.slice(-30)], e); });
      draw();
      EA.onGuestbook(async entry => {
        await EA.shared.add('leaf', { name: entry.name, k: pick, c: pick }); M.haptic('success'); M.tone('pop');
        await draw(); ul.lastElementChild?.classList.add('fresh'); wall.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'nearest' });
        pick = Math.random() * 6 | 0; fs.querySelector(`input[value="${pick}"]`).checked = true;
      });
    }

    // hiệu ứng lật trang & ảnh
    main.querySelector('.hb-photo')?.addEventListener('click', ev => { ev.currentTarget.classList.toggle('flip'); M.tone('click'); M.haptic('tap'); });
    const hero = main.querySelector('.hb-hero');
    if (hero) M.tilt(v => { hero.style.setProperty('--tx', v.x); hero.style.setProperty('--ty', v.y); });
  });

  // finale: the guest's own leaf is pressed into the last page
  EA.onRsvp(async (entry, c0) => {
    const th = document.getElementById('thanks'), box = th?.querySelector('.hb-final'); if (!box) return;
    const yes = entry.attending !== false, k = Math.random() * 6 | 0, nm = String(entry.name || '').replace(/[&<>"']/g, '');
    const d = new Date(); const when = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    box.innerHTML = `<div class="hb-newsp">${leafSVG(k, PAL[k], 'hb-fall')}<p class="lab"><b>Hospes ${nm}</b><span>${yes ? 'mẫu vật mới · thu thập' : 'vẫn ở trong sổ · thu thập'} ${when}</span></p>${stamp(yes ? 'Đã ép' : 'Gửi lời', yes ? '' : 'soft')}</div>`;
    html.classList.add('hb-finale'); M.haptic('success'); M.tone('chime');
    edge?.burst(26);
    setTimeout(() => th.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 700);
    setTimeout(() => box.firstElementChild?.classList.add('on'), M.reduced ? 0 : 1300);
  });
})();
