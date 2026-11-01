// Rạp Chiếu Phim: đêm công chiếu chuyện của chúng mình.
// Cover: tấm vé trước tấm màn nhung. Kéo cuống vé để xé -> màn mở, đèn chiếu bật, leader 5-4-3-2-1, trailer ảnh -> thiệp.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const qp = new URLSearchParams(location.search);
// số bàn của khách (?table=7 hoặc ?ban=7) -> số ghế trên vé
const TABLE = (qp.get('table') || qp.get('ban') || '').replace(/[^0-9A-Za-z-]/g, '').slice(0, 4);
const GENRE = { traditional: 'Truyền thống', romantic: 'Lãng mạn', playful: 'Hài hước', artsy: 'Nghệ thuật', adventurous: 'Phiêu lưu', minimal: 'Tối giản' };
const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}/${m[2]}/${m[1]}` : `${m[2]}/${m[1]}`) : ''; };

// bụi trong chùm sáng: dùng cho cover và hero
const dustFor = (M, cv, gain) => M.particles(cv, {
  count: 70,
  init: (p, i, w, h) => {
    p.x = rnd(0, w); p.y = p.seen ? h + 4 : rnd(0, h); p.seen = 1;
    p.vx = rnd(-.012, .012); p.vy = -rnd(.006, .03); p.r = rnd(.5, 1.9); p.a = rnd(.3, .9); p.ph = rnd(0, 6.28);
  },
  step: (p, dt, w) => { p.x += p.vx * dt; p.y += p.vy * dt; return p.y > -6 && p.x > -6 && p.x < w + 6; },
  draw: (g, p) => {
    const a = gain() * p.a * (.55 + .45 * Math.sin(p.life * .0016 + p.ph));
    if (a < .02) return;
    g.globalAlpha = a; g.fillStyle = '#ffeec6'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill(); g.globalAlpha = 1;
  }
});

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const ph = i => e(D.photos[i]?.src || c.config.couple.heroImage || '');
  const ev = D.events[D.events.length - 1] || {};
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  el.className = 'cover cn-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <div class="cn-hall" aria-hidden="true">
      <div class="cn-screen">
        <div class="cn-leader"><i class="sw"></i><i class="ring"></i><i class="ring r2"></i><i class="cross"></i><b class="num">5</b></div>
        <div class="cn-trailer">
          ${[0, 1, 2].map(i => `<div class="fr" data-k="${i}"><img src="${ph(i)}" alt="" onerror="this.style.display='none'"><p class="cap"></p></div>`).join('')}
        </div>
        <div class="cn-bars"></div><div class="cn-grain"></div>
      </div>
      <div class="cn-beam"></div>
      <canvas class="cn-dust ea-mo-canvas"></canvas>
      <svg class="cn-heads" viewBox="0 0 400 130" preserveAspectRatio="xMidYMax meet">
        <g fill="#060405" stroke="rgba(255,226,170,.38)" stroke-width="1.2">
          <rect x="-6" y="92" width="56" height="48" rx="12"/><rect x="62" y="96" width="56" height="44" rx="12"/><rect x="282" y="96" width="56" height="44" rx="12"/><rect x="350" y="92" width="56" height="48" rx="12"/>
          <g transform="rotate(5 178 90)"><circle cx="178" cy="62" r="16"/><circle cx="168" cy="47" r="7.5"/><path d="M146 132 C146 102 160 90 178 90 C196 90 210 102 210 132Z"/></g>
          <g transform="rotate(-5 226 90)"><circle cx="226" cy="60" r="17"/><path d="M192 132 C192 100 208 88 226 88 C244 88 260 100 260 132Z"/></g>
        </g>
      </svg>
      <div class="cn-curtain l"></div><div class="cn-curtain r"></div>
      <div class="cn-pelmet"></div>
      <div class="cn-spot"></div>
      <div class="cn-flash"></div>
    </div>
    <div class="cn-front">
      <p class="cn-now">Công chiếu một ngày duy nhất</p>
      <div class="cn-ticket">
        <div class="tk-main">
          <div class="tk-top"><span>Vé mời</span><span class="tk-no">Số ${c.d}${c.m}</span></div>
          <p class="tk-pre">Trân trọng kính mời đến buổi công chiếu</p>
          <h1 class="tk-names" aria-label="${e(D.bride.short)} và ${e(D.groom.short)}"><span>${e(D.bride.short)}</span><i>&amp;</i><span>${e(D.groom.short)}</span></h1>
          <p class="tk-sub">Phần tiếp theo của chuyện chúng mình</p>
          <dl class="tk-dl">
            <div><dt>Ngày</dt><dd>${c.d}.${c.m}.${c.y}</dd></div>
            <div><dt>Suất</dt><dd>${e(ev.time || '')}</dd></div>
            <div><dt>Rạp</dt><dd>${e((c.config.couple.city || '').replace(/^TP\.\s*/, '').replace(/ /g, '\u00a0'))}</dd></div>
          </dl>
          <p class="tk-to">Gửi ${e(c.guest)}</p>
        </div>
        <button class="tk-stub" type="button" aria-label="Xé cuống vé để mở thiệp">
          <i class="perf"></i><i class="tear"></i>
          <span class="bc" aria-hidden="true"></span>
          <span class="seat"><small>${TABLE ? 'Bàn số' : 'Ghế đôi'}</small><b>${TABLE ? e(TABLE) : c.icon('heart')}</b></span>
        </button>
      </div>
      <p class="cn-hint">Kéo cuống vé xuống để xé</p>
      <button class="open-btn" type="button">Xé vé</button>
    </div>
    <p class="cn-egg" role="status" hidden></p>`;

  const $ = s => el.querySelector(s);
  const stub = $('.tk-stub'), ticket = $('.cn-ticket'), dustCv = $('.cn-dust'), egg = $('.cn-egg');
  const S = { beam: 0 };
  let state = 'idle', ended = false, began = false, skip = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  const begin = viaButton => {
    if (began) return; began = true;
    if (!viaButton) EA.music();
    M.requestTilt();
  };

  // ---- ambient: bụi bay trong ánh đèn, bóng đèn marquee nhấp nháy, vé nghiêng theo tay ----
  const dust = dustFor(M, dustCv, () => .35 + S.beam * .65);
  stops.push(() => dust.stop());
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (state === 'idle') { ticket.style.setProperty('--tx', x); ticket.style.setProperty('--ty', y); } }));

  // ---- easter egg: chạm 3 lần vào tên -> cảnh đầu tiên chúng mình gặp nhau ----
  let taps = 0, tapT = 0, eggT = 0;
  $('.tk-names').addEventListener('click', () => {
    const now = Date.now(); taps = now - tapT < 1500 ? taps + 1 : 1; tapT = now;
    M.tone('pop'); M.haptic('tap');
    if (taps < 3) return; taps = 0;
    const met = c.p.get('metDate'), place = c.p.get('metPlace'), n = c.p.daysTogether;
    const bits = [];
    if (met) bits.push(`Cảnh đầu tiên được quay ngày ${dmy(met)}${place ? `, ${place}` : ''}.`);
    if (n) bits.push(`Đã ${fmt(n)} ngày kể từ tiếng “action” ấy.`);
    if (!bits.length && nick('bride') && nick('groom')) bits.push(`Vai chính: ${nick('bride')} và ${nick('groom')}.`);
    if (!bits.length) return;
    egg.textContent = bits.join(' '); egg.hidden = false; egg.classList.remove('show'); void egg.offsetWidth; egg.classList.add('show');
    M.tone('chime'); M.haptic('success');
    clearTimeout(eggT); eggT = setTimeout(() => { egg.hidden = true; }, 5200);
  });

  // ---- gesture: kéo cuống vé để xé ----
  const setTear = (p, dx, dy) => {
    stub.style.setProperty('--tp', p.toFixed(3));
    stub.style.setProperty('--dx', `${clamp(dx, -10, 70).toFixed(1)}px`);
    stub.style.setProperty('--dy', `${clamp(dy, 0, 120).toFixed(1)}px`);
  };
  let lastTick = 0;
  const finishWow = async () => {
    if (ended) return;
    el.classList.add('flash'); M.tone('chime');
    await wait(300);
    if (ended) return;
    open();
    setTimeout(stopCover, 1400);
  };
  const run = async () => {
    // 1. cuống vé bay đi, vé trượt xuống
    state = 'busy'; el.classList.add('busy');
    M.haptic('crack'); M.tone('whoosh');
    if (!M.reduced && stub.animate) {
      const cur = getComputedStyle(stub).transform;
      stub.animate([{ transform: cur === 'none' ? 'none' : cur, opacity: 1 }, { transform: 'translate(150px, 470px) rotate(64deg)', opacity: 0 }],
        { duration: 720, easing: 'cubic-bezier(.5,0,.9,.55)', fill: 'forwards' });
    } else stub.style.opacity = '0';
    if (M.reduced) { open(); return; }
    skip = false;
    let skipNow; const skipP = new Promise(r => { skipNow = r; });
    const go = async ms => { await Promise.race([wait(ms), skipP]); return !(skip || ended); };
    el.addEventListener('pointerdown', () => { if (state === 'busy') { skip = true; skipNow(); } });
    await go(380); if (skip) return finishWow();
    el.classList.add('leave');                       // vé rơi khỏi khung hình
    await go(260); if (skip) return finishWow();
    // 2. màn nhung mở, đèn chiếu bật
    el.classList.add('open', 'lit'); M.tone('whoosh'); M.haptic('tap');
    M.tween(0, 1, 900, 'out', v => { S.beam = v; });
    await go(760); if (skip) return finishWow();
    // 3. leader 5-4-3-2-1
    const ld = $('.cn-leader'), num = $('.cn-leader .num');
    el.classList.add('leader');
    for (let n = 5; n >= 1; n--) {
      num.textContent = n; num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop');
      M.tone(n === 1 ? 'thud' : 'click'); M.haptic(n === 1 ? 'thud' : 'tap');
      M.tween(0, 360, 330, 'out', v => ld.style.setProperty('--a', `${v}deg`));
      if (!await go(335)) return finishWow();
    }
    // 4. trailer ảnh
    el.classList.remove('leader'); el.classList.add('trailer');
    const caps = ['Một câu chuyện có thật', `${D.bride.short} &amp; ${D.groom.short}`.replace('&amp;', '&'), `Công chiếu ${c.d}.${c.m}.${c.y}`];
    const frs = [...el.querySelectorAll('.fr')];
    for (let i = 0; i < 3; i++) {
      frs[i].querySelector('.cap').textContent = caps[i];
      frs.forEach((f, j) => f.classList.toggle('on', j === i));
      M.tone(i === 2 ? 'chime' : 'click'); M.haptic('tap');
      if (!await go(470)) return finishWow();
    }
    finishWow();
  };

  M.drag(stub, {
    axis: 'xy', distance: 120,
    onMove: (p, dx, dy) => {
      if (state !== 'idle') return;
      if (!began) begin();
      el.classList.add('pulling');
      setTear(p, dx, dy);
      const k = Math.floor(p * 8);
      if (k !== lastTick) { lastTick = k; if (k > 0) { M.haptic('tap'); M.tone('click'); } }
      if (p >= 1) run();
    },
    onEnd: p => {
      if (state !== 'idle') return;
      if (p >= .62) return run();
      el.classList.remove('pulling'); lastTick = 0;
      const dx0 = parseFloat(stub.style.getPropertyValue('--dx')) || 0, dy0 = parseFloat(stub.style.getPropertyValue('--dy')) || 0;
      M.tween(p, 0, 360, 'spring', v => setTear(v, dx0 * v / Math.max(p, .001), dy0 * v / Math.max(p, .001)));
    }
  });
  stub.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && state === 'idle') { ev.preventDefault(); begin(); run(); } });
  $('.open-btn').addEventListener('click', () => { if (state !== 'idle') return; begin(true); run(); });
  stub.focus?.({ preventScroll: true });
});

// ---- layouts: bảng suất chiếu và danh sách credits ----
EA.section('events', ({ data: D, esc: e, ui, d, m }) => `<div class="wrap">
  ${ui.head('Lịch chiếu', 'Các suất chiếu ngày cưới')}
  <div class="board">
    <p class="board-top">Suất chiếu · ${d}/${m}</p>
    ${D.events.map(ev => `
      <article class="show">
        <p class="st">${e(ev.time)}</p>
        <div class="sd">
          <h3>${e(ev.title)}</h3>
          <p>${e(ev.place)} · ${e(ev.address)}</p>
          <p class="tag">${e(ev.label)}</p>
        </div>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Kịch bản', 'Một ngày dài như một cuốn phim')}
  <dl class="credits">
    ${D.itinerary.map(it => `<div><dt>${e(it.time)}</dt><dd><strong>${e(it.title)}</strong><span>${e(it.note)}</span></dd></div>`).join('')}
  </dl>
  <p class="credits-end">Đạo diễn &amp; diễn viên chính<br><strong>${e(D.bride.name)} · ${e(D.groom.name)}</strong></p>
</div>`);

// ---- thêm: cuộn phim ảnh, diễn viên, trivia, hết phim ----
EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Hậu trường', 'Những thước phim không lời')}
  <div class="reel" tabindex="0" aria-label="Ảnh, cuộn ngang">
    ${D.photos.map((p, i) => ui.photo(p, i, `<span class="frame-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}A</span>`)).join('')}
  </div>
</div>`);

EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Có thể bạn chưa biết', 'Những điều nên biết trước giờ chiếu')}
  ${D.faq.map((f, i) => `<details class="trivia"><summary><span class="tn">#${i + 1}</span>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('')}
</div>`);

EA.section('contact', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Diễn viên chính', 'Gọi cho đoàn làm phim')}
  <div class="cast">
    ${[['Cô dâu', D.bride, 1], ['Chú rể', D.groom, 2]].map(([r, p, i]) => `
      <div class="cast-card">
        <img src="${e(D.photos[i]?.src)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <p class="role">Vai ${r}</p>
        <p class="pname">${e(p.name.replace(/ /g, ' '))}</p>
        <a class="btn" href="tel:${e(p.phone.replace(/\s/g, ''))}">Gọi ${e(p.phone)}</a>
      </div>`).join('')}
  </div>
</div>`);

EA.section('thanks', ({ data: D, esc: e, dateText, icon }) => `<div class="wrap narrow">
  <p class="the-end">Hết phim</p>
  <p class="eyebrow">nhưng câu chuyện chỉ vừa bắt đầu</p>
  <p class="end-note">${e(D.thanks)}</p>
  <p class="kicker">${dateText}</p>
  <button class="btn" type="button" id="reopen">Xem lại từ đầu ${icon('replay')}</button>
</div>`);

// ---- v3: áp phích phim, storyboard, quầy vé ----
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  const q = c.p.get('quote.text'), joke = c.p.get('insideJoke');
  return `<div class="cn-poster">
  <img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high" onerror="this.style.visibility='hidden'">
  <canvas class="cn-hdust ea-mo-canvas" aria-hidden="true"></canvas>
  <div class="cn-poster-txt">
    <p class="cn-pre">Một câu chuyện có thật</p>
    <h1 class="cn-title">${e(cp.brideShortName)} <span>&amp;</span> ${e(cp.groomShortName)}</h1>
    ${q ? `<p class="cn-tag">“${e(q)}”</p>` : ''}
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="cn-release">Khởi chiếu ${c.d}.${c.m}.${c.y} · <span class="nw">${e(cp.city)}</span></p>
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    <p class="cn-billing">Với sự tham gia của ${e(cp.brideName.replace(/ /g, ' '))} · ${e(cp.groomName.replace(/ /g, ' '))} · gia đình hai bên · và bạn</p>
    ${joke ? `<p class="cn-subtitle"><span>${e(joke)}</span></p>` : ''}
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Những cảnh quay đầu tiên', 'Từng khung hình của chúng mình')}
  <div class="storyboard" tabindex="0" aria-label="Câu chuyện, cuộn ngang">
    ${(mod.content.chapters || []).map((ch, i) => `
      <article class="scene">
        <p class="scene-no">Cảnh ${String(i + 1).padStart(2, '0')} · ${e(ch.date)}</p>
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : ''}
        <h3>${e(ch.title)}</h3>
        <p>${e(ch.text)}</p>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Giữ chỗ', 'Quầy vé: giữ một chỗ cho bạn')}
  <div class="box-office"><p class="bo-top">Quầy vé · Vào cửa miễn phí</p>${ui.rsvpForm()}</div>
</div>`);

// ---------- ongoing motion + add-ons + finale (sau khi render) ----------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const short = k => D[k].short || D[k].name;

  // cuộn phim hai bên trang chạy theo thanh cuộn
  document.body.insertAdjacentHTML('beforeend', '<div class="cn-sprock l" aria-hidden="true"></div><div class="cn-sprock r" aria-hidden="true"></div>');
  const sp = [...document.querySelectorAll('.cn-sprock')];
  let raf = 0;
  const scrollFx = () => { raf = 0; const y = -(scrollY * .55) % 28; sp.forEach(s => { s.style.backgroundPosition = `center ${y}px`; }); };
  addEventListener('scroll', () => { raf ||= requestAnimationFrame(scrollFx); }, { passive: true });

  // hero: bụi trong chùm sáng máy chiếu, ảnh nghiêng theo tay
  const poster = main.querySelector('.cn-poster');
  if (poster) {
    poster.insertAdjacentHTML('beforeend', '<span class="projector" aria-hidden="true"></span>');
    const hd = poster.querySelector('.cn-hdust');
    if (hd) dustFor(M, hd, () => .8);
    if (M.tier !== 'low') M.tilt(({ x, y }) => { poster.style.setProperty('--tx', x); poster.style.setProperty('--ty', y); });
  }

  // credits hiện dần khi cuộn tới
  main.querySelectorAll('.credits > div').forEach((row, i) => {
    if (M.reduced) return row.classList.add('in');
    M.inView(row, () => setTimeout(() => row.classList.add('in'), (i % 3) * 90), { threshold: .4 });
  });

  // ---- add-ons ----
  const adds = {};
  const tr = k => P.get(`traits.${k}`, {});

  // 1) Thông tin phim: thể loại, thời lượng, bối cảnh, nhạc phim, diễn viên, địa điểm quay
  {
    const rows = [];
    const vibe = P.get('vibe', []).map(v => GENRE[v]).filter(Boolean);
    if (vibe.length) rows.push(['Thể loại', vibe.join(' · ')]);
    if (P.daysTogether != null && P.daysTogether > 0) rows.push(['Thời lượng', `<b class="num" data-n="${P.daysTogether}">${fmt(P.daysTogether)}</b> ngày, và vẫn đang quay`]);
    if (P.has('metPlace')) rows.push(['Bối cảnh', `${e(P.get('metPlace'))}${P.has('metCity') ? `, ${e(P.get('metCity'))}` : ''}`]);
    if (P.has('song.title')) rows.push(['Nhạc phim', `${e(P.get('song.title'))}${P.has('song.artist') ? ` · ${e(P.get('song.artist'))}` : ''}`]);
    const nb = P.get('traits.bride.nickname'), ng = P.get('traits.groom.nickname');
    if (nb || ng) rows.push(['Diễn viên chính', `${e(short('bride'))}${nb ? ` (${e(nb)})` : ''} &amp; ${e(short('groom'))}${ng ? ` (${e(ng)})` : ''}`]);
    if (P.has('pet.name')) rows.push(['Đặc biệt xuất hiện', `${e(P.get('pet.name'))}${P.has('pet.kind') ? `, vai ${e(P.get('pet.kind'))}` : ''}`]);
    const places = P.get('places', []);
    if (rows.length >= 2) {
      adds.filmcard = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Thông tin phim</p><h2 class="title">Phim của chúng mình</h2></header>
        <div class="fc">
          <div class="fc-top"><span class="rate">P</span><span>Phim dành cho mọi lứa tuổi</span></div>
          <dl>${rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>
          ${places.length >= 2 ? `<p class="fc-loc">Địa điểm quay</p><ul class="locs">${places.map(p => `<li><b>${e(p.name)}</b>${p.date ? `<span>${dmy(p.date)}</span>` : ''}</li>`).join('')}</ul>` : ''}
        </div></div>`;
    }
  }

  // 2) Kịch bản: cảnh cầu hôn + lời thoại từ hai bức thư
  {
    const prop = P.get('proposal'), lb = P.get('letters.bride'), lg = P.get('letters.groom');
    if (prop || lb || lg) {
      const dlg = (who, txt, dir) => txt ? `<div class="dlg"><p class="who">${e(who)}</p><p class="dir">(${dir})</p><p class="say">${e(txt)}</p></div>` : '';
      adds.script = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Kịch bản gốc</p><h2 class="title">Cảnh quay đáng nhớ nhất</h2></header>
        <div class="page">
          ${prop ? `<p class="slug">CẢNH CẦU HÔN${P.has('places') ? '' : ''}</p><p class="act" data-type>${e(prop)}</p>` : ''}
          ${dlg(short('bride').toUpperCase(), lb, 'khẽ cười')}
          ${dlg(short('groom').toUpperCase(), lg, 'thì thầm')}
          <p class="cut">CẮT. Vào nhạc.</p>
        </div></div>`;
    }
  }

  // 3) Số ghế = số bàn (chỉ khi link có ?table=)
  if (TABLE) {
    adds.seat = `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Chỗ ngồi của bạn</p><h2 class="title">Đã giữ chỗ cho ${e(c.guest)}</h2></header>
      <div class="seat-tk" tabindex="0"><div class="st-l"><small>Phòng chiếu</small><b>${e((D.events[D.events.length - 1] || {}).place || '')}</b><small>Suất</small><b>${e((D.events[D.events.length - 1] || {}).time || '')}</b></div><div class="st-r"><small>Bàn số</small><b>${e(TABLE)}</b></div></div>
    </div>`;
  }

  // 4) Quầy bắp nước: thức uống yêu thích của hai người
  {
    const items = [];
    ['bride', 'groom'].forEach((k, i) => {
      const t = tr(k);
      if (t.drink) items.push([`Combo ${short(k)}`, `${t.drink} và bắp rang ${i ? 'caramel' : 'bơ'}`, t.nickname || short(k)]);
    });
    if (items.length) {
      if (P.has('pet.name')) items.push([`Snack cho ${P.get('pet.name')}`, `kèm một cái vuốt ve${P.has('pet.kind') ? ` cho bé ${P.get('pet.kind')}` : ''}`, 'Miễn phí']);
      const hob = ['bride', 'groom'].map(k => tr(k).hobby).filter(Boolean);
      adds.combo = `<div class="wrap narrow">
        <header class="head"><p class="eyebrow">Quầy bắp nước</p><h2 class="title">Thực đơn trước giờ chiếu</h2></header>
        <div class="menu">
          <p class="mn-top">Bắp rang · Nước ngọt · Kỷ niệm</p>
          ${items.map(it => `<div class="mi"><div><h3>${e(it[0])}</h3><p>${e(it[1])}</p></div><span class="for">${e(it[2])}</span></div>`).join('')}
          ${hob.length ? `<p class="mn-foot">Giờ rảnh: ${hob.map(e).join(' · ')}</p>` : ''}
        </div></div>`;
    }
  }

  // chèn vào trang theo thứ tự quen thuộc
  const place = (id, html, after) => {
    if (!html) return;
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} cn-add`; s.innerHTML = html;
    const anchor = [].concat(after).map(a => main.querySelector(`#${a}`)).find(Boolean);
    if (anchor) anchor.insertAdjacentElement('afterend', s); else main.appendChild(s);
    return s;
  };
  place('filmcard', adds.filmcard, ['story', 'families', 'invitation', 'hero']);
  place('script', adds.script, ['filmcard', 'story', 'families', 'hero']);
  place('seat', adds.seat, ['events', 'schedule']);
  place('combo', adds.combo, ['gallery', 'faq', 'dressCode', 'events']);

  // thời lượng đếm lên, kịch bản gõ chữ
  const fc = main.querySelector('#filmcard .num');
  if (fc) {
    const n = +fc.dataset.n;
    if (!M.reduced) fc.textContent = '0';
    M.inView(fc, () => M.tween(0, n, 2200, 'out', v => { fc.textContent = fmt(v); }).then(() => { fc.textContent = fmt(n); }), { threshold: .6 });
  }
  const act = main.querySelector('#script .act');
  if (act) M.inView(act, () => M.reveal(act, { mode: 'write', stagger: 14 }), { threshold: .5 });
  // vé chỗ ngồi nghiêng theo ngón tay
  const st = main.querySelector('.seat-tk');
  if (st && !M.reduced) {
    st.addEventListener('pointermove', ev => { const r = st.getBoundingClientRect(); st.style.setProperty('--tx', ((ev.clientX - r.left) / r.width * 2 - 1).toFixed(2)); st.style.setProperty('--ty', ((ev.clientY - r.top) / r.height * 2 - 1).toFixed(2)); });
    st.addEventListener('pointerleave', () => { st.style.setProperty('--tx', 0); st.style.setProperty('--ty', 0); });
  }

  // ---- finale: sau RSVP, màn nhung khép lại, credits cuộn tên khách ----
  EA.onRsvp(entry => {
    M.tone('chime'); M.haptic('success');
    document.querySelector('.cn-end')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'cn-end'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', 'Hết phim');
    const guest = entry.attending ? 'Đã giữ chỗ' : 'Hẹn dịp khác';
    wrap.innerHTML = `<div class="ce-c l"></div><div class="ce-c r"></div>
      <div class="ce-roll"><div>
        <p class="s">${guest}</p>
        <p class="who">${e(entry.name || c.guest)}</p>
        <p class="s">${entry.attending ? 'cùng chúng mình trong đêm công chiếu' : 'cảm ơn bạn đã nhắn cho chúng mình'}</p>
        <p class="nm">${e(short('bride'))} &amp; ${e(short('groom'))}</p>
        <p class="s">${c.dateText}</p>
        <p class="fin">Hết phim</p>
      </div></div>
      <button class="btn ce-x" type="button">Đóng</button>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('on'));
    const x = wrap.querySelector('.ce-x'); x.focus({ preventScroll: true });
    const close = () => { wrap.classList.remove('on'); setTimeout(() => wrap.remove(), 700); };
    x.addEventListener('click', close);
    setTimeout(close, M.reduced ? 6000 : 9500);
  });
});
