// One Take: a clapperboard snaps, then the whole invitation plays as one continuous dolly shot.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  const setTier = () => { html.dataset.otTier = M.tier; };
  const wait = ms => new Promise(r => setTimeout(r, M.reduced ? 0 : ms));
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } } };

  // film grain tile, generated once and shared by the cover and the page
  (function grain() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 140;
    const g = cv.getContext('2d'), id = g.createImageData(140, 140);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 90; }
    g.putImageData(id, 0, 0);
    try { html.style.setProperty('--ot-grain', `url(${cv.toDataURL('image/png')})`); } catch { /* tainted */ }
  })();

  // ---------- cover: the clapperboard ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier();
    el.innerHTML = `<div class="ot-stage">
      <div class="ot-set" aria-hidden="true"><i class="ot-spot"></i><canvas class="ot-dust"></canvas></div>
      <div class="ot-grain" aria-hidden="true"></div>
      <i class="ot-lbx t" aria-hidden="true"></i><i class="ot-lbx b" aria-hidden="true"></i>
      <div class="ot-world">
        <p class="ot-to">Gửi ${e(c.guest)}</p>
        <h1 class="ot-title"><span class="n">${e(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(D.groom.name)}</span></h1>
        <div class="ot-clap">
          <div class="ot-sticks" aria-hidden="true"><i class="ot-arm"></i><i class="ot-base"></i></div>
          <div class="ot-board">
            <p class="ot-row"><span class="k">Cảnh</span><span class="v">Đám cưới</span></p>
            <p class="ot-row take"><span class="k">Take</span><span class="v"><b class="tk">1</b> <em>(và duy nhất)</em></span></p>
            <p class="ot-row"><span class="k">Ngày quay</span><span class="v">${c.d} · ${c.m} · ${c.y}</span></p>
            <p class="ot-row"><span class="k">Máy quay</span><span class="v">${e(c.config.couple.city || 'Một ngày không lặp lại')}</span></p>
          </div>
        </div>
      </div>
      <i class="ot-flare" aria-hidden="true"></i><i class="ot-flash" aria-hidden="true"></i>
      <p class="ot-egg" role="status"></p>
      <div class="ot-ui"><p class="ot-hint">Kéo thanh clapper xuống để bắt đầu</p><button class="open-btn" type="button">Bắt đầu quay</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.ot-stage'), world = q('.ot-world'), arm = q('.ot-arm'), clap = q('.ot-clap');
    const dust = q('.ot-dust'), egg = q('.ot-egg'), tk = q('.tk');
    const OPEN = -24; let ang = OPEN, go = false, music = false, eggT = 0, idle = true;
    const setArm = a => { ang = a; arm.style.transform = `rotate(${a}deg)`; };
    setArm(OPEN);

    // ambient: dust motes drifting through the spotlight; sparks when the sticks meet
    const parts = M.particles(dust, {
      count: 46,
      init(p) {
        if (p.spark) return;
        p.x = R(0, dust.clientWidth || 400); p.y = R(0, dust.clientHeight || 800); p.r = R(.6, 1.9); p.a = R(.12, .5);
        p.vx = R(-.006, .006); p.vy = R(-.012, -.002); p.ph = R(0, 6.28);
      },
      step(p, dt, w, h) {
        if (p.spark) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .0016 * dt; return p.life < p.ttl; }
        p.x += p.vx * dt + Math.sin(p.life * .0007 + p.ph) * .01 * dt; p.y += p.vy * dt;
        return p.y > -6 && p.x > -6 && p.x < w + 6;
      },
      draw(g, p) {
        if (p.spark) { g.fillStyle = `rgba(255,${200 + (p.life % 50)},120,${1 - p.life / p.ttl})`; g.fillRect(p.x, p.y, 2, 2); return; }
        g.fillStyle = `rgba(255,226,170,${p.a * (.6 + .4 * Math.sin(p.life * .002 + p.ph))})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
    });
    const stopTilt = M.tilt(v => { if (!go) { world.style.setProperty('--tx', `${v.x * -7}px`); world.style.setProperty('--ty', `${v.y * -5}px`); } });
    const cleanup = () => { parts.stop(); stopTilt(); };

    const sparks = () => {
      const s = stage.getBoundingClientRect(), b = q('.ot-sticks').getBoundingClientRect();
      parts.burst(34, p => {
        p.spark = true; p.x = b.left - s.left + R(0, b.width); p.y = b.top - s.top + b.height * .55;
        const a = R(-Math.PI * .95, -Math.PI * .05), v = R(.06, .34); p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.ttl = R(380, 860);
      });
    };
    const snap = () => {
      setArm(0); stage.classList.add('snap');
      M.haptic('crack'); M.tone('thud'); sparks();
      setTimeout(() => stage.classList.remove('snap'), 520);
    };
    const act = async () => {
      if (go) return; go = true; stage.classList.add('acting'); M.requestTilt();
      if (!music) { music = true; EA.music(); }
      if (ang < -1 && !M.reduced) { const a0 = ang; await M.tween(a0, 0, 150 + Math.abs(a0) * 4, t => t * t * t, setArm); }
      snap();
      await wait(480); stage.classList.add('rolling'); M.haptic('tap');
      await wait(380); M.tone('whoosh'); stage.classList.add('pushing');
      await wait(980); open(); setTier(); html.classList.add('ot-open'); M.haptic('success'); M.tone('chime');
      c.after(900, cleanup);
    };

    // drag the top stick down; letting go early springs it back up
    M.drag(q('.ot-sticks'), {
      axis: 'y', distance: 110,
      onMove(p) { if (go) return; idle = false; stage.classList.add('dragging'); setArm(OPEN * (1 - p)); if (!music) { music = true; EA.music(); } },
      onEnd(p) {
        stage.classList.remove('dragging');
        if (go) return;
        if (p > .72) act(); else M.tween(ang, OPEN, 380, 'spring', setArm).then(() => { idle = true; });
      }
    });
    q('.open-btn').addEventListener('click', act);

    // easter egg: ask for a second take
    tk.addEventListener('click', () => {
      if (go) return;
      tk.textContent = '2'; tk.classList.add('no'); M.haptic('thud'); M.tone('pop');
      egg.textContent = 'Không có Take 2 đâu nhé. Chỉ một lần thôi!'; egg.classList.add('on');
      clearTimeout(eggT); eggT = setTimeout(() => { tk.textContent = '1'; tk.classList.remove('no'); egg.classList.remove('on'); }, 2600);
    });
    tk.setAttribute('role', 'button'); tk.setAttribute('tabindex', '0'); tk.setAttribute('aria-label', 'Take 1');
    tk.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tk.click(); } });

    // a small invitation to touch the sticks while nobody has yet
    if (!c.reduced) M.loop(t => { if (idle && !go) setArm(OPEN + Math.sin(t / 650) * -2.2); }, { el: stage });
  });

  // ---------- helpers ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const holes = n => `<i class="ot-holes" aria-hidden="true">${'<b></b>'.repeat(n)}</i>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="ot-hero">
      <div class="ot-shot"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
      <div class="ot-leak" aria-hidden="true"></div>
      <div class="ot-vf" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
      <div class="ot-hero-in">
        <p class="eyebrow">Một cảnh quay, không có lần thứ hai</p>
        <h1 class="ot-title"><span class="n">${e(cp.brideName)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(cp.groomName)}</span></h1>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="ot-date">${c.dow} · ${c.d}.${c.m}.${c.y}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="ot-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
        <p class="ot-scroll">Cuộn để máy quay đi tiếp ${EA.icon('down')}</p>
      </div>
    </div>`;
  });

  // story: each chapter is a scene in a film frame
  EA.section('story', ({ esc: e, mod, d, m, y }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    return `<div class="wrap">
      ${head('Các cảnh quay', e(mod.content.title || 'Chuyện của chúng mình'))}
      <div class="ot-scenes">
        ${chs.map((ch, i) => `<article class="ot-scene">
          <figure class="ot-frame">${holes(14)}
            <div class="ot-pic">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}<span class="ot-fno">${pad(i + 1)}A</span></div>
            ${holes(14)}</figure>
          <div class="ot-sc-body"><p class="ot-slug">Cảnh ${i + 1} · ${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
        </article>`).join('')}
        <article class="ot-scene last"><div class="ot-sc-body"><p class="ot-slug">Cảnh cuối · ${+d} tháng ${+m}, ${y}</p><h3>Cảnh có bạn trong khung hình</h3><p>Máy quay chỉ chạy một lần. Chúng mình muốn bạn ở đó.</p></div></article>
      </div>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
    </div>`;
  });

  // gallery: contact sheet of film frames; guests vote for their favourite scene
  EA.section('gallery', ({ data: D, esc: e, ui, mod }) => {
    if (!D.photos.length) return '';
    return `<div class="wrap">
      ${head('Hậu trường', e(mod.content.title || 'Khoảnh khắc của chúng mình'), 'Chạm vào cảnh bạn thích nhất để bình chọn. Mỗi người một lá phiếu.')}
      <div class="ot-sheet">${D.photos.map((p, i) => `<figure class="ot-ph">${holes(8)}${ui.photo(p, i, `<span class="ot-gno">${pad(i + 1)}A</span>`)}${holes(8)}
        <button class="ot-vote" type="button" data-i="${i}" aria-pressed="false"><span class="lb">Chọn cảnh này</span><b class="ct">0</b></button></figure>`).join('')}</div>
      <p class="ot-voted" role="status" hidden></p>
    </div>`;
  });

  EA.section('rsvp', ({ ui, mod, esc: e }) => `<div class="wrap narrow">
    ${head('Phân vai', e(mod.content.title || 'Bạn sẽ đến chứ?'), 'Chúng mình đã để dành cho bạn một vai trong cảnh quay duy nhất.')}
    <p class="ot-role">Vai của bạn <b>Khách mời đặc biệt</b></p>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  // thanks: end credits roll as you scroll
  EA.section('thanks', c => {
    const { data: D, esc: e, p, mod, dateText } = c;
    const fam = f => `Ông ${e(f.father)} · Bà ${e(f.mother)}`;
    const nick = k => p.get(`traits.${k}.nickname`, '');
    const sub = k => [nick(k) ? `“${e(nick(k))}”` : '', p.get(`traits.${k}.drink`, ''), p.get(`traits.${k}.hobby`, '')].filter(Boolean).map(x => e(x.replace(/^“|”$/g, ''))).join(' · ');
    const cast = (role, name, k) => `<div class="ot-cr"><p class="role">${role}</p><p class="who">${e(name)}</p>${sub(k) ? `<p class="cap">${sub(k)}</p>` : ''}</div>`;
    const places = p.get('places', []);
    return `<div class="ot-credits"><div class="ot-stick"><div class="ot-roll">
      <p class="ot-c-eyebrow">Cảnh quay duy nhất</p>
      <p class="ot-c-big">Một bộ phim của<br>${e(D.bride.name)} <span class="amp">&amp;</span> ${e(D.groom.name)}</p>
      <div class="ot-cgroup"><p class="gt">Diễn viên chính</p>${cast('Cô dâu', D.bride.name, 'bride')}${cast('Chú rể', D.groom.name, 'groom')}</div>
      <div class="ot-cgroup"><p class="gt">Cùng sự tham gia của hai gia đình</p>
        <div class="ot-cr"><p class="role">${e(D.brideFamily.label || 'Nhà gái')}</p><p class="who">${fam(D.brideFamily)}</p></div>
        <div class="ot-cr"><p class="role">${e(D.groomFamily.label || 'Nhà trai')}</p><p class="who">${fam(D.groomFamily)}</p></div></div>
      <div class="ot-cgroup star"><p class="gt">Khách mời đặc biệt</p><p class="ot-guest" id="ot-guest">${e(c.guest)}</p><p class="cap">Không có bạn, cảnh này chỉ là một khung hình trống</p></div>
      ${p.has('pet.name') ? `<div class="ot-cgroup"><p class="gt">Diễn viên không thù lao</p><div class="ot-cr"><p class="who">${e(p.get('pet.name'))}</p><p class="cap">${e(p.get('pet.kind', 'thú cưng'))} đồng hành</p></div></div>` : ''}
      ${p.has('song.title') ? `<div class="ot-cgroup"><p class="gt">Nhạc phim</p><div class="ot-cr"><p class="who">${e(p.get('song.title'))}</p>${p.has('song.artist') ? `<p class="cap">${e(p.get('song.artist'))}</p>` : ''}</div></div>` : ''}
      ${places.length ? `<div class="ot-cgroup"><p class="gt">Bối cảnh</p><div class="ot-cr"><p class="who">${places.map(x => e(x.name)).join('<br>')}</p></div></div>` : ''}
      <div class="ot-end">
        <p class="ot-c-note">Không có cảnh nào phải quay lại.</p>
        <p class="mono">${e(D.monogram)}</p>
        <p>${e(D.thanks)}</p>
        ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
        <p class="kicker">${dateText}</p>
        <div class="actions center"><button class="btn" type="button" id="reopen">Xem lại từ đầu ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
      </div>
    </div></div></div>`;
  });


  // core's default English eyebrows become Vietnamese when module data doesn't supply one
  const EYEBROWS = { events: ['Save the date', 'Ngày vui'], schedule: ['Wedding itinerary', 'Lịch trình'], saveDate: ['Save the date', 'Lưu ngày vui'], party: ['Wedding party', 'Người đồng hành'], video: ['Wedding film', 'Thước phim'], gallery: ['A glimpse of us', 'Khoảnh khắc'], dressCode: ['Dress code & notes', 'Trang phục và lưu ý'], faq: ['Wedding guide', 'Cẩm nang'], quote: ['A note from us', 'Lời nhắn'], registry: ['Gift registry', 'Gợi ý quà'], guestbook: ['Guestbook', 'Sổ lưu bút'], contact: ['Contact', 'Liên hệ'] };
  const viEyebrows = main => Object.entries(EYEBROWS).forEach(([id, [en, vi]]) => { const el = main.querySelector(`#${id} .eyebrow`); if (el && el.textContent.trim() === en) el.textContent = vi; });
  // a photo that fails to load never shows the browser's broken icon: hide it and let the themed placeholder behind it show
  const guardImages = main => {
    const bad = img => { img.style.display = 'none'; img.parentElement?.classList.add('nophoto'); };
    main.addEventListener('error', ev => { if (ev.target.tagName === 'IMG') bad(ev.target); }, true);
    main.querySelectorAll('img').forEach(img => { if (img.complete && img.naturalWidth === 0 && img.src) bad(img); });
  };

  function addSection(main, id, html, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec ot-add m-${id}`; s.innerHTML = html;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.querySelector('.m-thanks'))?.before(s);
    return s;
  }
  const fmtDate = iso => { const [y, m, d] = String(iso).split('-'); return d ? `${d}.${m}.${y}` : m ? `${m}/${y}` : y; };

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier(); viEyebrows(main); guardImages(main);
    setTimeout(() => { if (cov.hidden) html.classList.add('ot-open'); }, 80);

    // fixed camera chrome: letterbox, viewfinder HUD, timecode, sprocket edges, grain
    document.body.insertAdjacentHTML('beforeend', `<div class="ot-chrome" aria-hidden="true">
      <div class="ot-bar t"><span class="rec"><i></i>REC</span><span class="sc">Cảnh 1 · Take 1</span><span class="tc">00:00:00:00</span><u class="ph"></u></div>
      <div class="ot-bar b"></div><div class="ot-spr l"></div><div class="ot-spr r"></div><div class="ot-grain fx"></div></div>`);
    const tc = document.querySelector('.ot-tc,.ot-bar .tc'), ph = document.querySelector('.ot-bar .ph');
    const sprL = document.querySelector('.ot-spr.l'), sprR = document.querySelector('.ot-spr.r');

    // roll the credits: measured height drives the pinned scroll distance
    const cred = main.querySelector('.ot-credits'), stick = cred?.querySelector('.ot-stick'), roll = cred?.querySelector('.ot-roll');
    const credit = { len: 0 };
    const measure = () => {
      if (!cred) return;
      if (M.reduced) { cred.classList.add('flat'); return; }
      const vh = innerHeight; credit.len = roll.offsetHeight + 40; cred.style.height = `${vh + credit.len}px`; stick.style.height = `${vh}px`;
    };
    const rollCredits = () => {
      if (!cred || cred.classList.contains('flat')) return;
      const r = cred.getBoundingClientRect(), vh = innerHeight, pr = clamp(-r.top / Math.max(1, r.height - vh));
      roll.style.transform = `translate3d(0,${(vh * .85 - pr * (credit.len + vh * .85 - vh * .06)).toFixed(1)}px,0)`;
    };

    // dolly: sections drift and breathe with the scroll, the frame counter runs
    const secs = [...main.querySelectorAll('.sec:not(.m-thanks)')], vis = new Set();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => { en.isIntersecting ? vis.add(en.target) : vis.delete(en.target); }), { rootMargin: '10% 0px' });
      secs.forEach(s => io.observe(s));
    } else secs.forEach(s => vis.add(s));
    const heroImg = main.querySelector('.ot-shot img');
    let tick = 0;
    const frame = () => {
      tick = 0;
      const y = scrollY, vh = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh), pr = clamp(y / max);
      const frames = Math.round(pr * 96 * 24);
      if (tc) tc.textContent = `${pad(frames / 86400)}:${pad((frames / 1440) % 60)}:${pad((frames / 24) % 60)}:${pad(frames % 24)}`;
      if (ph) ph.style.transform = `scaleX(${pr.toFixed(4)})`;
      const off = (-y * .5) % 56; if (sprL) { sprL.style.backgroundPositionY = sprR.style.backgroundPositionY = `${off.toFixed(1)}px`; }
      if (!M.reduced && M.tier !== 'low') {
        vis.forEach(s => {
          const w = s.firstElementChild; if (!w || s.classList.contains('m-hero')) return;
          const r = s.getBoundingClientRect(), k = clamp(((r.top + Math.min(r.height, vh) / 2) - vh / 2) / (vh * .75), -1, 1);
          w.style.transform = `translate3d(0,${(k * 22).toFixed(1)}px,0) scale(${(1 - Math.abs(k) * .028).toFixed(4)})`;
        });
        if (heroImg && y < vh * 1.2) heroImg.style.transform = `translate3d(0,${(y * .18).toFixed(1)}px,0) scale(${(1.04 + pr * 2.2).toFixed(4)})`;
      }
      rollCredits();
    };
    const sched = () => { if (!tick) tick = requestAnimationFrame(frame); };
    addEventListener('scroll', sched, { passive: true }); addEventListener('resize', () => { measure(); sched(); });
    measure(); frame(); setTimeout(() => { measure(); frame(); }, 900); document.fonts?.ready?.then(() => { measure(); frame(); });
    M.tilt(v => { if (heroImg && scrollY < innerHeight && !M.reduced) main.querySelector('.ot-hero-in')?.style.setProperty('--tx', `${(v.x * 8).toFixed(1)}px`); });

    // runtime = days together
    if (p.daysTogether != null) {
      const sec = addSection(main, 'runtime', `<div class="wrap narrow">
        ${head('Thời lượng phim', 'Một cảnh quay dài suốt nhiều năm')}
        <p class="ot-run" aria-label="${p.daysTogether} ngày"><b data-n="${p.daysTogether}">0</b><span>ngày quay liên tục, không cắt</span></p>
        <dl class="ot-slate"><div><dt>Khởi quay</dt><dd>${fmtDate(p.raw.metDate)}${p.has('metPlace') ? `<br><small>${e(p.get('metPlace'))}</small>` : ''}</dd></div>
        <div><dt>Đóng máy</dt><dd>${c.d}.${c.m}.${c.y}<br><small>Hôn lễ</small></dd></div></dl>
      </div>`, ['.m-story', '.m-events']);
      const num = sec.querySelector('[data-n]');
      M.inView(sec, () => M.tween(0, p.daysTogether, 2200, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); }), { threshold: .4 });
    }

    // locations as screenplay sluglines
    const places = p.get('places', []);
    if (places.length) {
      const inside = /thư viện|quán|nhà|cafe|cà phê|rạp|trường|bếp/i;
      addSection(main, 'locations', `<div class="wrap narrow">
        ${head('Bối cảnh', 'Những nơi máy quay đã đi qua')}
        <ol class="ot-slugs">${places.map((x, i) => `<li><span class="no">${pad(i + 1)}</span><div><p class="sl">${inside.test(x.name) ? 'Nội.' : 'Ngoại.'} ${e(x.name)}</p>${x.date ? `<p class="dt">${fmtDate(x.date)}</p>` : ''}</div></li>`).join('')}</ol>
      </div>`, ['.m-runtime', '.m-story', '.m-events']);
    }

    // the cut scene: the inside joke and the proposal
    if (p.has('insideJoke') || p.has('proposal')) {
      addSection(main, 'outtake', `<div class="wrap narrow">
        ${head('Cảnh bị cắt', 'Những cảnh không lên phim')}
        ${p.has('insideJoke') ? `<blockquote class="ot-cut"><span class="tag">Cảnh bị cắt</span>${e(p.get('insideJoke'))}</blockquote>` : ''}
        ${p.has('proposal') ? `<div class="ot-cut hard"><span class="tag">Cảnh khó nhất</span><p>${e(p.get('proposal'))}</p></div>` : ''}
      </div>`, ['.m-locations', '.m-runtime', '.m-gallery', '.m-story']);
    }

    // vote for the best scene
    const sheet = main.querySelector('.ot-sheet');
    if (sheet) {
      const btns = [...sheet.querySelectorAll('.ot-vote')], note = main.querySelector('.ot-voted');
      let mine = store.get('ot-vote');
      const paint = list => {
        const n = {}; list.forEach(v => { n[v.i] = (n[v.i] || 0) + 1; });
        if (mine != null) n[mine] = Math.max(n[mine] || 0, 1);
        const top = Math.max(0, ...Object.values(n));
        btns.forEach(b => {
          const i = +b.dataset.i; b.querySelector('.ct').textContent = n[i] || 0;
          b.setAttribute('aria-pressed', mine === i); b.classList.toggle('mine', mine === i); b.classList.toggle('top', top > 0 && n[i] === top);
          b.querySelector('.lb').textContent = mine === i ? 'Cảnh bạn chọn' : 'Chọn cảnh này';
        });
      };
      EA.shared.list('ot-vote').then(paint).catch(() => paint([]));
      btns.forEach(b => b.addEventListener('click', async () => {
        if (mine != null) { note.hidden = false; note.textContent = 'Bạn đã bình chọn rồi. Cảm ơn bạn!'; return; }
        mine = +b.dataset.i; store.set('ot-vote', mine); M.haptic('success'); M.tone('pop');
        await EA.shared.add('ot-vote', { i: mine, by: c.guest });
        paint(await EA.shared.list('ot-vote')); note.hidden = false; note.textContent = 'Phiếu của bạn đã được ghi lại.';
      }));
    }

    // call-sheet role line follows the name field
    main.querySelectorAll('form.rsvp-form').forEach(form => form.addEventListener('input', () => {
      const n = form.elements['name']?.value.trim(), role = main.querySelector('.ot-role b'); if (role) role.textContent = n ? `${n}, khách mời đặc biệt` : 'Khách mời đặc biệt';
    }));
  });

  // finale: "Cắt! Đạt rồi." and the guest's name goes into the credits
  EA.onRsvp((entry, c) => {
    const cut = document.createElement('div'); cut.className = 'ot-cut-card'; cut.setAttribute('role', 'status');
    const yes = entry.attending !== false, name = c.esc(entry.name || c.guest);
    cut.innerHTML = `<div class="ot-mini"><i class="bar"></i><div class="bd"><b>${yes ? 'Cắt! Đạt rồi.' : 'Cắt. Hẹn gặp lần sau.'}</b><span>${yes ? `${name} đã có tên trong danh sách diễn viên.` : `${name}, chúng mình vẫn giữ tên bạn trong phần cảm ơn.`}</span></div></div>`;
    document.body.appendChild(cut); void cut.offsetWidth; cut.classList.add('on');
    M.haptic('success'); M.tone('thud'); setTimeout(() => M.tone('chime'), 260);
    const g = document.getElementById('ot-guest'); if (g) g.textContent = entry.name || c.guest;
    html.classList.add('ot-finale');
    setTimeout(() => { cut.classList.remove('on'); setTimeout(() => cut.remove(), 700); }, M.reduced ? 2600 : 3000);
    setTimeout(() => document.querySelector('.ot-credits')?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'start' }), 900);
  });
})();
