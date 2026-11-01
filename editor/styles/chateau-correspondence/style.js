// Château Correspondence: một bức thư viết tay dưới ánh nến.
// Cover: tờ giấy để sẵn trên bàn gỗ, cây bút lông ngỗng cạnh lọ mực. Kéo bút xuống giấy (hoặc bấm "Mở thư"):
//   bút viết TÊN KHÁCH bằng nét chữ thật (phông script, vẽ viền từng chữ cái rồi đổ mực), rồi sáp đỏ nhỏ xuống và dấu ấn đóng xuống.
// Page: letter-paper sections, candle flicker over the paper, partner letters in envelopes, RSVP as a reply letter.
// All artwork is CSS / inline SVG. No external images besides the couple's own photo.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const safe = fn => { try { return fn(); } catch { return null; } };
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const graphemes = s => seg ? Array.from(seg.segment(s), x => x.segment) : (s.normalize('NFC').match(/\P{M}\p{M}*/gu) || []);
  const initial = s => (String(s || '').trim().split(/\s+/).pop() || '?').charAt(0).toUpperCase();
  const SCRIPT = '"Pinyon Script"';

  document.body.insertAdjacentHTML('beforeend', `<svg class="cc-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="cc-wax" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#d4504a"/><stop offset=".5" stop-color="#a8322d"/><stop offset="1" stop-color="#6e1618"/></radialGradient>
    <linearGradient id="cc-fea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#cdbfa3"/></linearGradient>
    <filter id="cc-rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
  </defs></svg>`);

  // ---------- artwork ----------
  const WAX_PATH = 'M50 4 C60 3 66 9 74 10 C84 12 92 18 92 30 C98 38 98 48 94 56 C98 68 90 78 82 82 C76 92 66 96 56 94 C48 99 38 97 30 92 C20 92 12 84 12 74 C4 66 3 54 8 46 C4 36 10 24 20 20 C24 10 36 6 50 4Z';
  const seal = (txt, cls = '') => `<svg class="cc-seal ${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="${WAX_PATH}" fill="url(#cc-wax)"/><path d="${WAX_PATH}" fill="none" stroke="#5a0f12" stroke-opacity=".5" stroke-width="1.4"/>
    <circle cx="50" cy="50" r="31" fill="none" stroke="#7a1d20" stroke-width="2.2"/><circle cx="50" cy="50" r="27" fill="none" stroke="#e9a09a" stroke-opacity=".35" stroke-width="1"/>
    <text x="50" y="60" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="600" font-size="30" fill="#5a0f12" stroke="#e9a09a" stroke-opacity=".5" stroke-width=".6">${esc(txt)}</text>
    <path d="M22 32 C28 20 40 14 52 14" fill="none" stroke="#f3b3ac" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>`;
  const QUILL = `<svg viewBox="0 0 90 120" aria-hidden="true"><path d="M86 2 C60 6 34 30 14 100 C40 82 62 60 70 38 C74 26 80 12 86 2Z" fill="url(#cc-fea)" stroke="#8d7c5c" stroke-width="1.2"/>
    <path d="M84 4 C58 28 30 62 8 114" fill="none" stroke="#7a6a4c" stroke-width="1.6"/><path d="M70 22 l-14 6 M62 38 l-14 6 M52 54 l-12 6 M42 70 l-10 6 M36 28 l12 8 M26 52 l10 6" stroke="#a89878" stroke-width=".9" stroke-linecap="round"/>
    <path d="M10 106 L5 117 L16 110Z" fill="#2b1d17"/></svg>`;
  const flame = () => `<span class="cc-flame" aria-hidden="true"><i></i><b></b></span>`;
  const candle = (cls = '') => `<span class="cc-candle ${cls}" aria-hidden="true">${flame()}<span class="cc-wax-body"></span></span>`;
  const CAMEO = `<svg class="cc-cameo" viewBox="0 0 120 150" aria-hidden="true"><path d="M20 150 C18 120 30 110 46 104 C40 96 38 88 40 78 C34 76 32 70 36 66 C34 54 40 44 52 42 C62 40 70 46 72 56 C74 60 76 64 74 68 L78 72 L72 76 L72 84 C70 90 66 96 62 100 C74 106 88 112 92 150Z" fill="#cdb98f" opacity=".8"/><path d="M60 150 C60 126 68 118 82 112 C78 104 78 96 82 88 C78 86 78 80 82 76 C82 66 88 60 96 62 C104 64 108 72 106 80 L110 86 L104 88 L104 96 C102 102 98 108 94 112 C104 118 112 126 112 150Z" fill="#b59f74" opacity=".9"/></svg>`;
  const DIV = `<span class="cc-rule" aria-hidden="true"><i></i>${seal('', 'mini')}<i></i></span>`;

  // ---------- real handwriting: each grapheme's outline is traced by the pen, then the ink floods in ----------
  function writer(host, text, o = {}) {
    const ns = 'http://www.w3.org/2000/svg', W = o.W || 520, fs0 = o.fs || 72;
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'cc-hand'); svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);
    const mk = (t, x, y, fs) => { const e = document.createElementNS(ns, 'text'); e.setAttribute('x', x); e.setAttribute('y', y); e.setAttribute('font-size', fs); e.setAttribute('font-family', `${SCRIPT}, 'Snell Roundhand', cursive`); e.textContent = t; return e; };
    let fs = fs0, lines = [], units = [];
    const measure = (s, f) => { const t = mk(s, 0, 0, f); svg.appendChild(t); const w = t.getComputedTextLength(); t.remove(); return w; };
    const layout = () => {
      svg.innerHTML = ''; units = [];
      const words = String(text).trim().split(/\s+/);
      fs = fs0; let one = measure(words.join(' '), fs);
      if (one > W - 20) fs = Math.max(o.min || 44, fs0 * (W - 20) / one);
      lines = []; let cur = '';
      words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && measure(t, fs) > W - 20) { lines.push(cur); cur = w; } else cur = t; });
      if (cur) lines.push(cur);
      const lh = fs * 1.2, H = Math.ceil(lines.length * lh + fs * .5);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      lines.forEach((ln, li) => {
        const t = mk('', 0, fs * .95 + li * lh, fs); t.setAttribute('class', 'cc-ink');
        graphemes(ln).forEach(g => { const s = document.createElementNS(ns, 'tspan'); s.textContent = g; t.appendChild(s); units.push(s); });
        svg.appendChild(t);
        const w = t.getComputedTextLength(); t.setAttribute('x', ((W - w) / 2).toFixed(1));
      });
      const L = fs * 6;
      units.forEach(u => { u.style.strokeDasharray = L; u.style.strokeDashoffset = L; u.style.fillOpacity = 0; u.dataset.L = L; });
      units.forEach(u => { u.dataset.on = /\S/.test(u.textContent) ? 1 : 0; });
      return svg;
    };
    const set = (u, p) => { const L = +u.dataset.L; u.style.strokeDashoffset = (L * (1 - clamp(p / .62))).toFixed(1); u.style.fillOpacity = clamp((p - .5) / .5).toFixed(2); };
    const showAll = () => units.forEach(u => { u.style.strokeDashoffset = 0; u.style.fillOpacity = 1; });
    // play: resolves when the last letter is inked. onTip({x,y,done}) gets the pen position in SVG px (screen via svg.getScreenCTM()).
    const play = (ms, onTip) => new Promise(res => {
      const reduced = window.EAMotion?.reduced;
      if (reduced || !units.length) { showAll(); onTip?.(null); return res(); }
      const real = units.filter(u => u.dataset.on === '1'), n = real.length, per = ms * .3, t0 = performance.now();
      const bb = real.map(u => u.getBBox());
      const tick = now => {
        const t = now - t0; let cur = 0;
        real.forEach((u, i) => { const st = i / n * (ms - per), p = clamp((t - st) / per); set(u, p); if (p > 0 && p < 1) cur = i; });
        const i = cur, b = bb[i], st = i / n * (ms - per), p = clamp((t - st) / per);
        onTip?.({ x: b.x + b.width * (.15 + .75 * p), y: b.y + b.height * (.55 + Math.sin(t / 70) * .06) });
        if (t < ms) requestAnimationFrame(tick); else { units.forEach(u => set(u, 1)); onTip?.(null); res(); }
      };
      requestAnimationFrame(tick);
    });
    return { svg, layout, play, showAll, units: () => units };
  }
  const fontsReady = (txt) => Promise.race([Promise.all([document.fonts.load(`72px ${SCRIPT}`, txt), document.fonts.load('600 28px "Cormorant Garamond"', 'Aa')]), new Promise(r => setTimeout(r, 1800))]).catch(() => {});

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const guest = c.guest, mono = `${initial(D.bride.short || D.bride.name)}&${initial(D.groom.short || D.groom.name)}`;
    el.innerHTML = `<div class="cc-cover">
      <div class="cc-wood"></div><div class="cc-glow" aria-hidden="true"></div>${candle('cc-c-cover')}
      <div class="cc-stage">
        <div class="cc-sheet" style="--rot:-1.2deg"><div class="cc-sheet-in">
          <span class="cc-crest" aria-hidden="true">${seal(mono, 'mini')}</span>
          <p class="cc-lh-names"><span>${e(D.bride.name)}</span><i>&amp;</i><span>${e(D.groom.name)}</span></p>
          <p class="cc-lh-date">${c.dow} · ${c.dateText}</p>
          <i class="cc-hr"></i>
          <p class="cc-dear">Kính gửi</p>
          <div class="cc-name"></div>
          <p class="cc-after">trân trọng kính mời bạn đến chung vui<br>trong ngày chúng mình thành đôi</p>
          <span class="cc-puddle"></span><span class="cc-stamp">${seal(mono)}</span><span class="cc-splash"></span>
        </div><i class="cc-shade"></i></div>
        <div class="cc-ink-well" aria-hidden="true"><i></i></div>
        <div class="cc-quill" role="button" tabindex="0" aria-label="Kéo cây bút xuống tờ giấy để mở thư">${QUILL}</div>
      </div>
      <div class="cc-foot">
        <p class="cc-to">Thư gửi <b>${e(guest)}</b></p>
        <p class="cc-hint">Kéo cây bút lông xuống tờ giấy</p>
        <button class="open-btn" type="button">Mở thư</button>
      </div></div>`;
    const root = el.querySelector('.cc-cover'), stage = el.querySelector('.cc-stage'), quill = el.querySelector('.cc-quill'), well = el.querySelector('.cc-ink-well');
    const nameHost = el.querySelector('.cc-name'), sheet = el.querySelector('.cc-sheet');
    const W = writer(nameHost, guest, { W: 520, fs: 78, min: 46 });
    let ready = false;
    fontsReady(guest).then(() => { W.layout(); root.classList.add('is-ready'); ready = true; ghost(); });
    // pencil guide of the name before the pen touches the paper (the name stays readable on the cover)
    const ghost = () => W.units().forEach(u => { u.style.strokeDasharray = '3 5'; u.style.strokeDashoffset = 0; u.style.fillOpacity = .1; });
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    // quill position: tip (px inside .cc-stage)
    const QW = 62, QH = 84; // CSS size of the quill; tip at its lower-left
    const rel = (r, s) => ({ x: r.left - s.left, y: r.top - s.top });
    const restTip = () => { const r = well.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: r.left - s.left + r.width * .45, y: r.top - s.top + r.height * .35 }; };
    let tip = { x: 0, y: 0 };
    const putTip = (x, y) => { tip = { x, y }; quill.style.transform = `translate(${(x - QW * .06).toFixed(1)}px, ${(y - QH * .97).toFixed(1)}px) rotate(${(-4 + (x - restTipX) * .01).toFixed(1)}deg)`; };
    let restTipX = 0;
    const toRest = () => { const t = restTip(); restTipX = t.x; putTip(t.x, t.y); };
    requestAnimationFrame(() => requestAnimationFrame(toRest)); addEventListener('resize', () => { if (!started) toRest(); });
    const svgToStage = pt => { const s = W.svg, m = s.getScreenCTM(), sp = stage.getBoundingClientRect(); return { x: m.a * pt.x + m.c * pt.y + m.e - sp.left, y: m.b * pt.x + m.d * pt.y + m.f - sp.top }; };

    let started = false;
    const go = async () => {
      if (started) return; started = true;
      root.classList.add('is-writing'); EA.music(); M.requestTilt(); M.tone('click'); M.haptic('tap');
      if (!ready) { W.layout(); ready = true; }
      W.units().forEach(u => { u.style.strokeDasharray = u.dataset.L; u.style.strokeDashoffset = u.dataset.L; u.style.fillOpacity = 0; });
      const reduced = c.reduced;
      const first = W.units().find(u => u.dataset.on === '1');
      const bb = first ? first.getBBox() : { x: 20, y: 40, height: 40 };
      const dest = svgToStage({ x: bb.x, y: bb.y + bb.height * .6 });
      // 1. the pen travels to the first letter (0.5s)
      const from = { ...tip };
      await M.tween(0, 1, 520, 'out', k => putTip(from.x + (dest.x - from.x) * k, from.y + (dest.y - from.y) * k - Math.sin(k * Math.PI) * 26));
      root.classList.add('is-inking');
      // 2. real handwriting (<= 2.1s)
      const n = graphemes(guest).length, ms = clamp(n * 120, 1100, 2100);
      let tick = 0;
      await W.play(ms, p => { if (p) { const q = svgToStage(p); putTip(q.x, q.y); if (++tick % 5 === 0) M.tone('click'); } });
      // flourish: pen glides under the name
      root.classList.add('is-written');
      const r = well.getBoundingClientRect();
      await M.tween(0, 1, 380, 'inOut', k => { const q = svgToStage({ x: bb.x + 20, y: bb.y + bb.height * .95 }); putTip(tip.x + (q.x - tip.x) * k * .2, tip.y + (q.y - tip.y) * k * .2 - k * 18); });
      // 3. the pen returns to the inkwell while the line below appears
      const t0 = restTip(), p0 = { ...tip };
      M.tween(0, 1, 560, 'inOut', k => putTip(p0.x + (t0.x - p0.x) * k, p0.y + (t0.y - p0.y) * k - Math.sin(k * Math.PI) * 30));
      root.classList.add('is-after');
      await new Promise(r2 => c.after(520, r2));
      // 4. wax drips, then the seal is pressed
      root.classList.add('is-wax'); M.tone('whoosh');
      await new Promise(r2 => c.after(440, r2));
      root.classList.add('is-stamp'); M.haptic('crack'); M.tone('thud');
      c.after(120, () => { M.haptic('thud'); });
      c.after(520, () => { M.tone('chime'); M.haptic('success'); root.classList.add('is-sealed'); });
      c.after(1250, () => { root.classList.add('is-lift'); });
      c.after(1750, () => { offTilt(); open(); });
    };
    M.drag(quill, {
      axis: 'xy', distance: 120,
      onMove(p, dx, dy) { if (started) return; const t = restTip(); putTip(t.x + dx, t.y + dy); root.classList.toggle('is-near', p > .5); },
      onEnd(p) { if (started) return; if (p >= .6) go(); else { const t = restTip(), f = { ...tip }; root.classList.remove('is-near'); M.tween(0, 1, 380, 'out', k => putTip(f.x + (t.x - f.x) * k, f.y + (t.y - f.y) * k)); } }
    });
    quill.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    quill.addEventListener('pointerdown', () => { M.requestTilt(); M.tone('click'); M.haptic('tap'); });
    el.querySelector('.open-btn').addEventListener('click', () => { el.querySelector('.open-btn').disabled = true; go(); });
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const t = c.mod?.content?.title, s = c.mod?.content?.sub, b = c.mod?.content?.eyebrow;
    return `<header class="head"><p class="eyebrow">${b != null ? esc(b) : eb}</p><h2 class="title">${t != null && t !== '' ? esc(t) : title}</h2>${(s ?? sub) ? `<p class="sub">${s != null ? esc(s) : sub}</p>` : ''}${DIV}</header>`;
  };
  const monoOf = c => `${initial(c.data.bride.short || c.data.bride.name)}&${initial(c.data.groom.short || c.data.groom.name)}`;

  // ---- hero: letterhead + cameo portrait + candle ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, ph = cp.heroImage || '', joke = c.p.get('insideJoke', '');
    return `<div class="cc-hero">
      <div class="cc-hero-top">${candle('cc-c-hero')}<span class="cc-hero-crest">${seal(monoOf(c))}</span></div>
      <p class="cc-eyebrow">${e(mc.eyebrow || 'Thư mời cưới')}</p>
      <h1 class="cc-names"><span>${e(D.bride.name)}</span><i>&amp;</i><span>${e(D.groom.name)}</span></h1>
      <div class="cc-oval"><div class="cc-oval-in">${CAMEO}${ph ? `<img src="${e(ph)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}</div></div>
      ${cp.headline ? `<p class="cc-headline">${c.t(cp.headline)}</p>` : ''}
      <p class="cc-date"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}${cp.lunarDate ? `<em>${e(cp.lunarDate)}</em>` : ''}</p>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
      <p class="cc-secret" aria-live="polite"><span>${e(joke || 'Những bức thư tình hay nhất đều viết dưới ánh nến.')}</span></p>
    </div>`;
  });

  // ---- invitation: the letter + letters between partners ----
  const ENV = c => {
    const p = c.p, L = p.get('letters', {}), D = c.data, items = [];
    const bs = D.bride.short || D.bride.name, gs = D.groom.short || D.groom.name;
    if (L.bride) items.push({ t: `Thư của ${bs}`, to: gs, text: L.bride, sig: p.get('traits.bride.nickname', bs), n: initial(bs) });
    if (L.groom) items.push({ t: `Thư của ${gs}`, to: bs, text: L.groom, sig: p.get('traits.groom.nickname', gs), n: initial(gs) });
    const pr = p.get('proposal', '');
    if (pr) items.push({ t: 'Lá thư cầu hôn', to: bs, text: pr, sig: gs, n: '?', prop: true });
    return items;
  };
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, p = c.p;
    const days = p.daysTogether, met = p.get('metDate', ''), city = p.get('metCity', ''), place = p.get('metPlace', '');
    const metTxt = met ? met.split('-').reverse().join('.') : '';
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? '' : c.guest;
    const env = ENV(c);
    return `<div class="wrap narrow">
      <article class="cc-letter-page">
        <span class="cc-fold" aria-hidden="true"></span>
        <p class="cc-kick">${c.dateText}</p>
        <p class="cc-salute">${guest ? `Gửi ${e(guest)},` : t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2 class="title">${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        ${DIV}
        ${D.letter.slice(0, 2).map(x => `<p>${t(x)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="cc-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(x => `<p>${t(x)}</p>`).join('')}
        <p class="cc-closing">Thân mến,</p><p class="cc-sig">${e(D.bride.short || D.bride.name)} &amp; ${e(D.groom.short || D.groom.name)}</p>
      </article>
      ${days != null && days > 0 ? `<div class="cc-post" data-days="${days}"><span class="cc-pm" aria-hidden="true"><b>${met ? c.p.raw.metDate.slice(0, 4) : ''}</b><small>${e(city || 'Bưu cục')}</small></span>
        <div><p class="cc-post-n"><span class="n">0</span> ngày thư từ</p><p class="cc-post-s">Từ ngày ${metTxt}${place ? ` · ${e(place)}` : ''}, mỗi ngày bên nhau là một lá thư chưa gửi.</p></div></div>` : ''}
      ${env.length ? `<div class="cc-letters"><header class="head"><p class="eyebrow">Thư riêng</p><h3 class="title">${env.length > 1 ? 'Thư tay hai người trao nhau' : env[0].t}</h3><p class="sub">Chạm vào phong bì để bóc dấu sáp</p></header>
        <div class="cc-env-grid">${env.map((m, i) => `<article class="cc-env${m.prop ? ' prop' : ''}" data-i="${i}">
          <button class="cc-env-btn" type="button" aria-expanded="false" aria-label="Mở ${e(m.t)}"><span class="cc-env-back"></span><span class="cc-env-paper"></span><span class="cc-env-front"><small>Gửi</small><b>${e(m.to)}</b></span><span class="cc-env-flap"></span>${seal(m.n, 'cc-env-seal')}</button>
          <div class="cc-lbody"><div class="cc-lbody-in"><p class="cc-lt">${e(m.t)}</p><p class="cc-ltxt">${e(m.text)}</p><p class="cc-lsig">${e(m.sig)}</p></div></div></article>`).join('')}</div></div>` : ''}
    </div>`;
  });

  // ---- rsvp: a reply letter ----
  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Thư hồi âm', 'Bạn sẽ đến chứ?', 'Viết lại cho chúng mình vài dòng nhé')}
    <div class="rsvp-card cc-reply"><span class="cc-fold" aria-hidden="true"></span><p class="cc-reply-to">Gửi ${esc(c.data.bride.short || c.data.bride.name)} &amp; ${esc(c.data.groom.short || c.data.groom.name)},</p>${c.ui.rsvpForm()}</div>
  </div>`);

  // ---- thanks ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod, p } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const song = p.get('song', null), pet = p.get('pet', null);
    return `<div class="wrap narrow cc-bye">
      <p class="eyebrow">${e(mod.content.eyebrow || 'Lời cảm ơn')}</p>
      ${seal(monoOf(c), 'cc-bye-seal')}
      <h2 class="title">Hẹn gặp ${e(guest)} ngày vui</h2>
      <p class="cc-thx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="cc-sig big">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      ${song?.lyric ? `<p class="cc-ps"><b>Tái bút</b>“${e(song.lyric)}”<small>${e(song.title || '')}${song.artist ? ` · ${e(song.artist)}` : ''}</small></p>` : ''}
      ${pet?.name ? `<p class="cc-paw"><svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="9" cy="17" rx="3.6" ry="4.6"/><ellipse cx="16" cy="10" rx="3.6" ry="4.8"/><ellipse cx="25" cy="10" rx="3.6" ry="4.8"/><ellipse cx="32" cy="17" rx="3.6" ry="4.6"/></svg>${e(pet.name)}${pet.kind ? ` (${e(pet.kind)})` : ''} cũng ký tên bằng dấu chân</p>` : ''}
      <p class="cc-bdate">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Đọc lại từ đầu ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
    </div>`;
  });

  // ======================= behaviours =======================
  EA.afterRender((c, main) => {
    const M = c.motion;
    const EN = { 'Love story': 'Chuyện tình', 'Save the date': 'Ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khoảnh khắc', 'Dress code & notes': 'Trang phục & lưu ý', 'Wedding guide': 'Cẩm nang', 'Gift registry': 'Gợi ý quà', 'Guestbook': 'Sổ lưu bút', 'Contact': 'Liên hệ', 'A note from us': 'Lời nhắn', 'RSVP': 'Phản hồi' };
    main.querySelectorAll('.eyebrow').forEach(n => { const k = n.textContent.trim(); if (EN[k]) n.textContent = EN[k]; });

    // candle flicker over the paper (a warm glow that breathes; static on low-tier / reduced motion)
    if (!document.querySelector('.cc-flicker')) {
      document.body.insertAdjacentHTML('beforeend', '<div class="cc-flicker" aria-hidden="true"></div>');
      const fl = document.querySelector('.cc-flicker');
      if (!c.reduced && M.tier !== 'low') {
        let v = .7, tg = .7, nx = 0;
        M.loop((t, dt) => { if (t > nx) { tg = .55 + Math.random() * .45; nx = t + 80 + Math.random() * 160; } v += (tg - v) * Math.min(1, dt / 90); fl.style.opacity = v.toFixed(3); });
      } else fl.style.opacity = '.75';
    }

    // easter egg: tap the candle 3 times to blow it out; invisible ink appears by the last glow
    const hero = main.querySelector('.cc-hero'), cd = hero?.querySelector('.cc-candle');
    if (cd) {
      let taps = 0, timer = 0;
      cd.setAttribute('role', 'button'); cd.setAttribute('tabindex', '0'); cd.setAttribute('aria-label', 'Thổi nến');
      const act = () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1300); M.tone('click');
        if (taps >= 3) {
          taps = 0; document.body.classList.add('cc-dark'); hero.classList.add('is-out'); M.tone('whoosh'); M.haptic('success');
          setTimeout(() => { document.body.classList.remove('cc-dark'); hero.classList.remove('is-out'); M.tone('pop'); }, 5200);
        }
      };
      cd.addEventListener('click', act); cd.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); act(); } });
    }

    // thư từ: count-up
    const post = main.querySelector('.cc-post');
    if (post) M.inView(post, () => { post.classList.add('on'); const n = post.querySelector('.n'); M.tween(0, +post.dataset.days, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });

    // envelopes: tap breaks the seal, the flap opens, the letter unfolds and is read out
    main.querySelectorAll('.cc-env').forEach(env => {
      const b = env.querySelector('.cc-env-btn'), body = env.querySelector('.cc-lbody'), txt = env.querySelector('.cc-ltxt');
      b.addEventListener('click', () => {
        const open = !env.classList.contains('open');
        env.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
        if (open) { M.tone('thud'); M.haptic('crack'); if (!txt.dataset.done) { txt.dataset.done = 1; c.after(700, () => M.reveal(txt, { mode: 'words', stagger: 55 })); } }
        else M.tone('click');
      });
    });
    main.querySelectorAll('.cc-letters, .cc-post').forEach(n => M.inView(n, () => n.classList.add('on'), { threshold: .2 }));

    // closing seal presses itself when the thank-you comes into view
    const bye = main.querySelector('.cc-bye');
    if (bye) M.inView(bye, () => { bye.classList.add('on'); M.tone('thud'); M.haptic('tap'); }, { threshold: .5 });
  });

  // finale: the reply is sealed. The guest's name is written live on a small sheet and the wax is pressed.
  EA.onRsvp(async (entry, c) => {
    const M = EA.motion, name = String(entry?.name || '').trim() || 'bạn';
    const yes = !(entry && entry.attending === false);
    const ov = document.createElement('div'); ov.className = 'cc-final'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Thư hồi âm đã được gửi');
    ov.innerHTML = `<div class="cc-final-sheet"><p class="cc-final-k">${yes ? 'Chúng mình đã nhận thư của' : 'Cảm ơn thư của'}</p><div class="cc-final-name"></div>
      <p class="cc-final-t">${yes ? 'Hẹn gặp bạn trong ngày vui.' : 'Chúng mình sẽ nhớ tấm lòng của bạn.'}</p><span class="cc-final-seal">${seal(c ? monoOf(c) : 'L&B')}</span><button class="btn ghost" type="button">Đóng thư</button></div>`;
    document.body.appendChild(ov);
    const host = ov.querySelector('.cc-final-name');
    const w = writer(host, name, { W: 420, fs: 64, min: 40 });
    await fontsReady(name); w.layout();
    requestAnimationFrame(() => ov.classList.add('on'));
    const close = () => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 600); };
    ov.querySelector('button').addEventListener('click', close);
    ov.addEventListener('click', ev => { if (ev.target === ov) close(); });
    await new Promise(r => setTimeout(r, M?.reduced ? 0 : 500));
    await w.play(Math.min(1800, 900 + name.length * 80));
    ov.classList.add('sealed'); M?.tone('thud'); M?.haptic('success'); setTimeout(() => M?.tone('chime'), 260);
    setTimeout(close, 6500);
  });
})();
