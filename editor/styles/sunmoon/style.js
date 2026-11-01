// Nhật Nguyệt Giao Hòa: cô dâu là mặt trời, chú rể là mặt trăng (hoặc theo nhịp sống trong personality.traits).
// Cover: nửa ngày | nửa đêm. Kéo hai thiên thể lại gần nhau -> nhật thực toàn phần -> nhẫn kim cương -> thiệp mở.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const rnd = (a, b) => a + Math.random() * (b - a);

// Ai là mặt trời? Người "buổi sáng". Mặc định cô dâu.
function roles(c) {
  const br = c.p.get('traits.bride.rhythm'), gr = c.p.get('traits.groom.rhythm');
  const swap = (gr === 'morning' && br !== 'morning') || (br === 'night' && !gr);
  const sun = swap ? 'groom' : 'bride', moon = swap ? 'bride' : 'groom';
  return { sun, moon };
}

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const R = roles(c);
  const sunName = D[R.sun].short || D[R.sun].name, moonName = D[R.moon].short || D[R.moon].name;
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  document.documentElement.classList.toggle('sm-low', M.tier === 'low');

  el.className = 'cover sm-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <div class="sm-sky" aria-hidden="true">
      <div class="half day"><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i></div>
      <div class="half night"></div>
      <div class="sm-dusk"></div><div class="sm-dark"></div>
      <canvas class="sm-stars ea-mo-canvas"></canvas>
      <div class="sm-dawn"></div>
      <canvas class="sm-fx ea-mo-canvas"></canvas>
    </div>
    <div class="sm-stage">
      <div class="bd sunw">
        <button class="body sun" type="button" aria-label="Mặt trời của ${e(sunName)}. Kéo về phía mặt trăng"><i class="rays"></i><i class="glow"></i></button>
        <p class="bn">${e(sunName)}</p>
      </div>
      <div class="bd moonw">
        <button class="body moon" type="button" aria-label="Mặt trăng của ${e(moonName)}. Kéo về phía mặt trời"></button>
        <p class="bn">${e(moonName)}</p>
      </div>
      <div class="sm-ring" aria-hidden="true">
        <svg viewBox="0 0 100 100"><defs><linearGradient id="smg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset=".5" stop-color="#f6c35b"/><stop offset="1" stop-color="#c98a2e"/></linearGradient></defs>
          <circle class="r1" cx="50" cy="50" r="48" pathLength="1" fill="none" stroke="url(#smg)" stroke-width="2.6"/>
          <circle class="r2" cx="50" cy="50" r="44.6" pathLength="1" fill="none" stroke="#fff2c8" stroke-opacity=".55" stroke-width=".5"/>
          <g class="gem" transform="translate(81.5 14.8) rotate(35)"><path d="M0 -5.5 L4.4 -1.2 L0 5 L-4.4 -1.2 Z" fill="#fffaf0" stroke="#f6c35b" stroke-width=".7"/><path d="M-4.4 -1.2 H4.4 M0 -5.5 L-1.8 -1.2 L0 5 L1.8 -1.2 Z" fill="none" stroke="#f6c35b" stroke-width=".35"/></g>
        </svg>
        <div class="rn"><span>${e(D.bride.short || D.bride.name)}</span><i>&amp;</i><span>${e(D.groom.short || D.groom.name)}</span></div>
      </div>
      <p class="sm-tip" hidden></p>
    </div>
    <div class="sm-band">
      <p class="sm-to">Gửi ${e(c.guest)}</p>
      <p class="sm-date">${c.d} · ${c.m} · ${c.y}</p>
      <p class="sm-hint">Một người là ban ngày, một người là ban đêm. Kéo hai vì sao lại gần nhau.</p>
      <button class="open-btn" type="button">Hội ngộ</button>
    </div>`;

  const $ = s => el.querySelector(s);
  const stage = $('.sm-stage'), sunBtn = $('.body.sun'), moonBtn = $('.body.moon'), tip = $('.sm-tip');
  const stars = $('.sm-stars'), fx = $('.sm-fx');
  const S = { p: 0, dark: 0, cor: 0, bead: 0, u: 0, gl: 0, sc: 1 };
  let locked = false, ended = false, musicOn = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));

  const setDx = () => { el.style.setProperty('--dx', `${stage.clientWidth * .25}px`); };
  setDx(); addEventListener('resize', setDx); stops.push(() => removeEventListener('resize', setDx));
  const setP = v => { S.p = clamp(v); el.style.setProperty('--p', S.p.toFixed(4)); };
  setP(0);

  // ---- ambient: stars twinkle (right half always; left half as dusk falls), parallax on tilt ----
  const starDraw = (g, s) => {
    const half = s.x < stars.clientWidth / 2;
    const vis = half ? Math.max(clamp((S.p - .35) / .65) * .7, S.dark) : 1;
    if (vis < .02) return;
    const tw = .55 + .45 * Math.sin(s.life * s.sp + s.ph);
    g.globalAlpha = vis * tw * s.a;
    g.fillStyle = s.warm ? '#ffe9b8' : '#ffffff';
    g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.2832); g.fill();
    if (s.r > 1.4 && tw > .85) { g.fillRect(s.x - s.r * 3, s.y - .4, s.r * 6, .8); g.fillRect(s.x - .4, s.y - s.r * 3, .8, s.r * 6); }
    g.globalAlpha = 1;
  };
  const sp = M.particles(stars, {
    count: 110,
    init: (s, i, w, h) => { s.x = rnd(0, w); s.y = rnd(0, h * .72); s.r = rnd(.5, 1.9); s.sp = rnd(.0012, .004); s.ph = rnd(0, 6.28); s.a = rnd(.5, 1); s.warm = Math.random() < .25; },
    step: () => {}, draw: starDraw
  });
  stops.push(() => sp.stop());
  if (M.tier !== 'low') {
    const off = M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } });
    stops.push(off);
  }

  // ---- easter egg: ba lần chạm vào mặt trăng / mặt trời -> biệt danh ----
  const taps = { sun: { n: 0, t: 0 }, moon: { n: 0, t: 0 } };
  let tipTimer = 0;
  const tapBody = (which, btn) => {
    const k = which === 'sun' ? R.sun : R.moon, name = nick(k), T = taps[which], now = Date.now();
    M.tone('pop'); M.haptic('tap');
    T.n = now - T.t < 1800 ? T.n + 1 : 1; T.t = now;
    if (T.n < 3 || !name) return;
    T.n = 0;
    const r = btn.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    tip.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.7 6.6 7.1.6-5.4 4.7 1.7 7-6.1-3.8-6.1 3.8 1.7-7L2.2 8.7l7.1-.6z"/></svg><span>${e(name)}</span>`;
    tip.style.left = `${r.left + r.width / 2 - sr.left}px`; tip.style.top = `${Math.max(8, r.top - sr.top - 8)}px`;
    tip.hidden = false; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
    M.tone('chime'); M.haptic('success');
    clearTimeout(tipTimer); tipTimer = setTimeout(() => { tip.hidden = true; }, 2600);
  };

  // ---- gesture: kéo mặt trời / mặt trăng lại gần nhau ----
  const hint = $('.sm-hint');
  let lastTick = 0;
  const progress = v => {
    setP(v);
    const stepk = Math.floor(S.p * 5);
    if (stepk !== lastTick) { lastTick = stepk; if (stepk > 0) { M.haptic('tap'); M.tone('click'); } }
  };
  const begin = () => {
    if (!musicOn) { musicOn = true; EA.music(); M.requestTilt(); }
    hint.classList.add('gone');
  };
  const finish = async () => {
    if (locked || ended) return;
    locked = true; begin();
    el.classList.add('busy');
    M.tone('whoosh');
    await M.tween(S.p, 1, 260 + 900 * (1 - S.p), 'inOut', progress);
    if (!ended) eclipse();
  };
  const bind = (btn, which, dir) => {
    let base = 0, moved = false;
    btn.addEventListener('pointerdown', () => { if (locked) return; base = S.p; moved = false; begin(); });
    M.drag(btn, {
      axis: 'x', distance: 1,
      onMove: (_p, dx) => { if (locked) return; if (Math.abs(dx) > 6) moved = true; if (moved) progress(base + dir * dx / (stage.clientWidth * .25)); },
      onEnd: () => {
        if (locked) return;
        if (!moved) return tapBody(which, btn);
        if (S.p >= .5) finish(); else M.tween(S.p, 0, 500, 'out', setP);
      }
    });
    btn.addEventListener('click', ev => { if (ev.detail === 0) finish(); });
    btn.addEventListener('keydown', ev => {
      if (locked) return;
      const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      ev.preventDefault(); begin(); progress(S.p + d * dir * .16); if (S.p >= .98) finish();
    });
  };
  bind(sunBtn, 'sun', 1); bind(moonBtn, 'moon', -1);
  $('.open-btn').addEventListener('click', () => { locked || finish(); }, { once: true });

  // ---- nhật thực toàn phần: corona, hạt Baily, nhẫn kim cương, chiếc nhẫn cưới ----
  async function eclipse() {
    M.tone('thud'); M.haptic('thud');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    el.classList.add('is-total');
    if (M.reduced) {
      el.classList.add('ring-on', 'names-on');
      setTimeout(open, 700);
      return;
    }
    const dpr = Math.min(2, devicePixelRatio || 1) * (M.tier === 'low' ? .75 : 1);
    const fr = fx.getBoundingClientRect();
    fx.width = Math.round(fr.width * dpr); fx.height = Math.round(fr.height * dpr);
    const g = fx.getContext('2d');
    const D0 = moonBtn.offsetWidth, ringD = Math.min(innerWidth * .8, 330, stage.clientHeight * .78);
    const ratio = ringD / D0;
    const nRays = Math.max(10, Math.round(M.scale(44)));
    const rays = Array.from({ length: nRays }, (_, i) => ({ a: i / nRays * 6.2832 + rnd(-.05, .05), l: Math.random() ** 1.6, w: rnd(.018, .05), sp: rnd(.8, 2), ph: rnd(0, 6.28) }));
    const nBeads = M.tier === 'low' ? 4 : 7, beadsR = Array.from({ length: nBeads }, () => Math.random());
    const th = -Math.PI * .31;   // vị trí hạt kim cương trên vành
    const stopFx = M.loop(t => {
      const mr = moonBtn.getBoundingClientRect(), f2 = fx.getBoundingClientRect();
      const cx = mr.left + mr.width / 2 - f2.left, cy = mr.top + mr.height / 2 - f2.top, Rr = mr.width / 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, f2.width, f2.height);
      g.globalCompositeOperation = 'lighter';
      if (S.cor > .01) {
        const hr = Rr * (1.1 + .9 * S.cor);
        let gr = g.createRadialGradient(cx, cy, Rr * .97, cx, cy, hr);
        gr.addColorStop(0, `rgba(255,238,196,${.6 * S.cor})`); gr.addColorStop(.3, `rgba(255,204,120,${.2 * S.cor})`); gr.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, hr, 0, 6.2832); g.fill();
        for (const r of rays) {
          const len = Rr * (.22 + r.l * 1.15) * S.cor * (1 + .14 * Math.sin(t * .002 * r.sp + r.ph));
          const a = r.a + .015 * Math.sin(t * .0008 + r.ph), bx = cx + Math.cos(a) * Rr * .97, by = cy + Math.sin(a) * Rr * .97;
          const tx = cx + Math.cos(a) * (Rr + len), ty = cy + Math.sin(a) * (Rr + len), nx = -Math.sin(a) * Rr * r.w, ny = Math.cos(a) * Rr * r.w;
          const lg = g.createLinearGradient(bx, by, tx, ty);
          lg.addColorStop(0, `rgba(255,240,205,${.5 * S.cor})`); lg.addColorStop(1, 'rgba(255,210,140,0)');
          g.fillStyle = lg; g.beginPath(); g.moveTo(bx + nx, by + ny); g.lineTo(tx, ty); g.lineTo(bx - nx, by - ny); g.closePath(); g.fill();
        }
      }
      if (S.bead > .01) {
        const spread = .5 * (1 - S.u) ** 1.5 + .015;
        beadsR.forEach((rb, j) => {
          const a = th + (j - (nBeads - 1) / 2) * spread / (nBeads / 2) * (.7 + rb * .6);
          const x = cx + Math.cos(a) * Rr, y = cy + Math.sin(a) * Rr, rad = (1.1 + rb * 3.1) * (1 - S.u * .45) * S.bead;
          const bg = g.createRadialGradient(x, y, 0, x, y, rad * 5);
          bg.addColorStop(0, `rgba(255,252,235,${.95 * S.bead})`); bg.addColorStop(.25, `rgba(255,226,160,${.5 * S.bead})`); bg.addColorStop(1, 'rgba(255,210,140,0)');
          g.fillStyle = bg; g.beginPath(); g.arc(x, y, rad * 5, 0, 6.2832); g.fill();
        });
      }
      if (S.gl > .01) {
        const x = cx + Math.cos(th) * Rr, y = cy + Math.sin(th) * Rr, k = S.gl * (1 + .06 * Math.sin(t * .006));
        const hg = g.createRadialGradient(x, y, 0, x, y, 70 * k);
        hg.addColorStop(0, `rgba(255,255,245,${Math.min(1, S.gl)})`); hg.addColorStop(.2, `rgba(255,232,170,${.6 * S.gl})`); hg.addColorStop(1, 'rgba(255,210,140,0)');
        g.fillStyle = hg; g.beginPath(); g.arc(x, y, 70 * k, 0, 6.2832); g.fill();
        const star = (L, w, rot) => {
          g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = `rgba(255,252,240,${.9 * Math.min(1, S.gl)})`;
          g.beginPath(); g.moveTo(-L, 0); g.lineTo(0, -w); g.lineTo(L, 0); g.lineTo(0, w); g.closePath(); g.fill(); g.restore();
        };
        star(120 * k, 2.6, 0); star(80 * k, 2.2, Math.PI / 2); star(46 * k, 1.6, Math.PI / 4); star(46 * k, 1.6, -Math.PI / 4);
      }
      g.globalCompositeOperation = 'source-over';
    });
    stops.push(stopFx);
    const T = (d, fn) => wait(d).then(() => { if (!ended) fn(); });
    M.tween(0, 1, 700, 'out', v => { S.dark = v; });
    T(120, () => M.tween(1, ratio, 1500, 'inOut', v => { S.sc = v; el.style.setProperty('--sc', v); }));
    T(300, () => M.tween(0, 1, 1300, 'out', v => { S.cor = v; }));
    T(1150, () => { M.tween(0, 1, 250, 'out', v => { S.bead = v; }); M.tween(0, 1, 700, 'inOut', v => { S.u = v; }); });
    T(1830, () => M.tween(1, 0, 160, 'out', v => { S.bead = v; }));
    T(1750, () => {
      M.tone('chime'); M.haptic('success');
      M.tween(0, 1, 160, 'out', v => { S.gl = v; }).then(() => M.tween(1, .4, 800, 'out', v => { S.gl = v; }));
      M.tween(1, .15, 1000, 'inOut', v => { S.cor = v; });
    });
    T(1800, () => el.classList.add('ring-on'));
    T(2050, () => el.classList.add('names-on'));
    T(3650, () => el.classList.add('lift'));
    await wait(3850);
    if (ended) return;
    open();
    setTimeout(stopCover, 1200);
  }
});

const SUN = '<span class="ico sun-ico" aria-hidden="true"></span>';
const MOON = '<span class="ico moon-ico" aria-hidden="true"></span>';

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c, R = roles(c);
  const sunN = R.sun === 'bride' ? cp.brideName : cp.groomName, moonN = R.moon === 'bride' ? cp.brideName : cp.groomName;
  return `<div class="sm-hero">
  <div class="side day">${SUN}<p class="label">Mặt trời</p><h1 class="sm-name">${e(sunN)}</h1></div>
  <div class="side night">${MOON}<p class="label">Mặt trăng</p><p class="sm-name">${e(moonN)}</p></div>
  <div class="sm-center">
    <div class="sm-photo"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
  </div>
  <div class="sm-foot day">
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="hero-date">${c.dow} · ${c.dateText}</p>
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
  </div>
</div>`;
});

EA.section('families', c => {
  const { data: D, esc: e, mod } = c, R = roles(c);
  const fam = (k, label) => {
    const f = D[`${k}Family`];
    return `<p class="label">${e(f.label || label)}</p><p class="fam-n">Ông ${e(f.father)}</p><p class="fam-n">Bà ${e(f.mother)}</p><p class="addr">${e(f.address)}</p>`;
  };
  const lab = k => k === 'bride' ? 'Nhà gái' : 'Nhà trai';
  return `<div class="sm-split">
  <div class="side day">${SUN}${fam(R.sun, lab(R.sun))}</div>
  <div class="side night">${MOON}${fam(R.moon, lab(R.moon))}</div>
  <div class="sm-foot day">
    <p class="kicker">${e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}</p>
    <h2 class="couple"><span>${e(D.bride.name)}</span><span class="amp">&amp;</span><span>${e(D.groom.name)}</span></h2>
    <p class="note">${e(D.announceNote)}</p>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện của chúng mình', 'Ngày và đêm của chúng mình')}
  <ol class="daynight">
    ${(mod.content.chapters || []).map((ch, i) => `
      <li class="${i % 2 ? 'night' : 'day'}">
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <div>${i % 2 ? MOON : SUN}<p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
      </li>`).join('')}
  </ol>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ngày vui', 'Từ bình minh đến đêm trăng')}
  <div class="sm-events">
    ${D.events.map((ev, i) => `
      <article class="sm-ev ${i % 2 ? 'night' : 'day'}">
        ${i % 2 ? MOON : SUN}
        <p class="label">${e(ev.label)}</p>
        <p class="ev-time">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Sáng và tối')}
  <div class="sm-gallery">${D.photos.map((p, i) => `<div class="fr ${i % 2 ? 'night' : 'day'}">${ui.photo(p, i)}</div>`).join('')}</div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Xác nhận tham dự', 'Bạn sẽ đến vào lúc hoàng hôn chứ?')}
  <div class="twilight"><div class="tw-inner">${ui.rsvpForm()}</div></div>
</div>`);

// Lời cảm ơn: hai nửa ngày/đêm hòa làm một bầu trời hoàng hôn khi cuộn tới.
EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="mh d"></div><div class="mh n"></div><i class="mb s"></i><i class="mb m"></i>
  <div class="wrap narrow th-in">
    ${mod.content.image ? `<img class="thanks-img" src="${e(mod.content.image)}" alt="" loading="lazy">` : ''}
    <p class="eyebrow">${e(mod.content.eyebrow || 'Cảm ơn bạn')}</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center">
      <button class="btn" type="button" id="reopen">Mở lại tấm thiệp ${EA.icon('replay')}</button>
      <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
    </div>
  </div>`);

// ---------- add-ons + finale + ambient (sau khi render) ----------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, R = roles(c), P = c.p, D = c.data;
  const tr = k => P.get(`traits.${k}`, {});
  const short = k => D[k].short || D[k].name;
  const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : ''; };
  const setLow = () => document.documentElement.classList.toggle('sm-low', M.tier === 'low');
  setLow(); setTimeout(setLow, 1800);

  // đếm ngược: nếu ngày cưới đã qua
  const ev0 = D.events[0], target = new Date(`${D.date}T${ev0?.time || '00:00'}:00+07:00`);
  if (target < Date.now()) {
    main.querySelectorAll('.countdown').forEach(cd => {
      cd.outerHTML = `<div class="sm-home" role="status"><span class="ico-pair" aria-hidden="true"><i class="sun-ico"></i><i class="moon-ico"></i></span><p class="hm-t">Đã về chung một nhà</p><p class="hm-s">${e(short(R.sun))} &amp; ${e(short(R.moon))} · ${c.dateText}</p></div>`;
    });
  }

  // --- Hai thế giới ---
  const adds = [];
  const ts = tr(R.sun), tm = tr(R.moon);
  if (P.has('traits.bride') && P.has('traits.groom')) {
    const rhy = (t, dflt) => t.rhythm === 'morning' ? 'Người của buổi sáng' : t.rhythm === 'night' ? 'Cú đêm' : dflt;
    const rows = [];
    if (ts.rhythm || tm.rhythm) rows.push(['Nhịp sống', rhy(ts, 'Người của buổi sáng'), rhy(tm, 'Cú đêm')]);
    [['drink', 'Thức uống'], ['hobby', 'Sở thích'], ['nickname', 'Biệt danh']].forEach(([f, l]) => { if (ts[f] && tm[f]) rows.push([l, ts[f], tm[f]]); });
    if (rows.length) {
      adds.push(['worlds', `<div class="wrap">
        <header class="head"><p class="kicker">Hai thế giới</p><h2 class="title">Khác nhau như ngày và đêm</h2></header>
        <div class="wd">
          <div class="wd-h l">${SUN}<p class="wd-n">${e(short(R.sun))}</p></div>
          <div class="wd-h r">${MOON}<p class="wd-n">${e(short(R.moon))}</p></div>
          ${rows.map((r, i) => `<div class="cell l" style="--i:${i}"><span class="k">${r[0]}</span><span class="v">${e(r[1])}</span></div><div class="cell r" style="--i:${i}"><span class="k">${r[0]}</span><span class="v">${e(r[2])}</span></div>`).join('')}
          <p class="wd-foot">và vẫn chọn nhau mỗi ngày</p>
        </div></div>`]);
    }
  }

  // --- Ngày và đêm bên nhau ---
  if (P.has('metDate') && P.daysTogether != null) {
    const n = P.daysTogether, since = dmy(P.get('metDate')), place = P.get('metPlace', '');
    adds.push(['together', `<div class="wrap">
      <header class="head"><p class="kicker">Ngày và đêm bên nhau</p><h2 class="title" aria-label="${fmt(n)} bình minh · ${fmt(n)} đêm trăng">Mỗi ngày một bình minh, mỗi đêm một vầng trăng</h2></header>
      <div class="tg" role="group" aria-label="${fmt(n)} bình minh · ${fmt(n)} đêm trăng">
        <div class="tg-c">${SUN}<b class="num" data-n="${n}">${fmt(n)}</b><span>bình minh</span></div>
        <div class="tg-dot" aria-hidden="true">·</div>
        <div class="tg-c">${MOON}<b class="num" data-n="${n}">${fmt(n)}</b><span>đêm trăng</span></div>
      </div>
      <p class="tg-note">Kể từ ngày ${since}${place ? `, ở ${e(place)}` : ''}, đến ngày chúng mình về chung một nhà.</p>
    </div>`]);
  }

  // --- Bầu trời hai quê ---
  const hs = P.get('hometowns', {}), hp = P.get('hometownPins', {});
  if (hs.bride && hs.groom && hp.bride && hp.groom) {
    const km = Math.round(P.kmBetween(hp.bride, hp.groom) / 10) * 10;
    const A = hs[R.sun], B = hs[R.moon], city = c.config.couple.city || '';
    adds.push(['skies', `<div class="wrap">
      <header class="head"><p class="kicker">Bầu trời hai quê</p><h2 class="title">${e(A)} và ${e(B)}, một bầu trời</h2></header>
      <svg class="sk" viewBox="0 0 400 250" role="img" aria-label="Cách nhau ${fmt(km)} km, nay chung một mái nhà">
        <defs>
          <radialGradient id="skS" cx=".4" cy=".38"><stop offset="0" stop-color="#fff2c8"/><stop offset=".55" stop-color="#f6c35b"/><stop offset="1" stop-color="#e8963a"/></radialGradient>
          <radialGradient id="skM" cx=".6" cy=".4"><stop offset="0" stop-color="#fffdf4"/><stop offset=".6" stop-color="#e9e6da"/><stop offset="1" stop-color="#bdb8a6"/></radialGradient>
        </defs>
        <path id="skTop" class="arc-far" d="M76 64 Q200 -30 324 64" pathLength="1"/>
        <path id="skL" class="arc-l" d="M62 98 C62 168 118 204 196 204" pathLength="1"/>
        <path id="skR" class="arc-r" d="M338 98 C338 168 282 204 204 204" pathLength="1"/>
        <circle class="trav" r="3.4" fill="#fff6dc"><animateMotion dur="3.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#skTop"/></animateMotion></circle>
        <circle cx="62" cy="78" r="17" fill="url(#skS)" class="sk-s"/><circle cx="338" cy="78" r="17" fill="url(#skM)" class="sk-m"/>
        <text x="62" y="48" class="sk-t" text-anchor="middle">${e(A)}</text><text x="338" y="48" class="sk-t" text-anchor="middle">${e(B)}</text>
        <text x="200" y="12" class="sk-km" text-anchor="middle">${fmt(km)} km</text>
        <g class="house" transform="translate(200 196)"><path d="M-15 0 L0 -13 L15 0 V13 H-15 Z" fill="#fff2d6"/><path d="M-18 1 L0 -16 L18 1" fill="none" stroke="#f6c35b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="-4" y="3" width="8" height="10" rx="1.5" fill="#c9702a"/></g>
        ${city ? `<text x="200" y="236" class="sk-t" text-anchor="middle">${e(city)}</text>` : ''}
      </svg>
      <p class="sk-line">Cách nhau <b>${fmt(km)} km</b>, nay chung một mái nhà.</p>
    </div>`]);
  }

  const anchor = main.querySelector('#story') || main.querySelector('#families') || main.querySelector('#hero');
  let prev = anchor;
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} sm-add`; s.innerHTML = html;
    if (prev) prev.insertAdjacentElement('afterend', s); else main.appendChild(s);
    prev = s;
  });

  // đếm lên khi vào tầm nhìn
  const tg = main.querySelector('#together');
  if (tg) {
    const nums = [...tg.querySelectorAll('.num')];
    if (!M.reduced) nums.forEach(x => { x.textContent = '0'; });
    M.inView(tg, () => nums.forEach((x, i) => {
      const n = +x.dataset.n;
      M.tween(0, n, 2000 + i * 300, 'out', v => { x.textContent = fmt(v); }).then(() => { x.textContent = fmt(n); });
    }), { threshold: .3 });
  }

  // sun & moon cuộn theo trang (giữ từ bản cũ, nhỏ gọn)
  document.body.insertAdjacentHTML('beforeend', '<div class="arc" aria-hidden="true"><svg viewBox="0 0 100 54"><path d="M6 50 A44 44 0 0 1 94 50" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3"/><line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="1.2"/></svg><i class="s"></i><i class="m"></i></div>');
  const arc = document.querySelector('.arc'), s = arc.querySelector('.s'), m = arc.querySelector('.m');
  const at = (el, t) => { const a = Math.PI * (1 - t); el.style.left = `${50 + Math.cos(a) * 44}%`; el.style.top = `${(50 - Math.sin(a) * 44) / 54 * 100}%`; };
  let raf = 0;
  const upd = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
    at(s, Math.min(1, p * 2)); at(m, Math.max(0, p * 2 - 1));
    s.style.opacity = p < .5 ? 1 : 0; m.style.opacity = p >= .5 ? 1 : 0;
    arc.style.setProperty('--sky', p < .5 ? '#fff4dc' : '#1e2a4a');
    arc.classList.toggle('dark', p >= .5);
  };
  addEventListener('scroll', () => { raf ||= requestAnimationFrame(upd); }, { passive: true }); upd();

  // finale: sau RSVP, một mặt trời và một mặt trăng quay quanh nhau một vòng trên lời cảm ơn
  EA.onRsvp(() => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('sm-orbit')) return;
        done.insertAdjacentHTML('beforebegin', '<div class="sm-orbit" aria-hidden="true"><i class="o s"></i><i class="o m"></i></div>');
      });
    }, 30);
  });
});
