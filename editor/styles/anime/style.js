// Anime Thanh Xuân: một bản "opening" của tập cuối. Giữ nút phát -> đường tốc độ, hai khung nhân vật cắt vào, logo tập cuối đập xuống, hoa anh đào bung.
// Add-ons (chỉ hiện khi có dữ liệu): bảng nhân vật (chỉ số hài hước), nhạc mở đầu, bối cảnh quay phim, linh vật, credit kết phim sau RSVP.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const nb = s => String(s ?? '').replace(/ /g, ' ');
const nf = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

// ---- hoa anh đào: vẽ bằng canvas, rơi chậm ("5 cm/giây"), nghiêng theo gió / độ nghiêng máy ----
const PETAL_COLORS = ['255,183,201', '255,205,216', '246,146,176'];
function petals(cv, M, wind, count, opts = {}) {
  return M.particles(cv, {
    count,
    init(p, i, w, h) {
      p.x = rnd(0, w); p.y = opts.burst ? p.y : rnd(-h * .1, h); p.s = rnd(4, 9); p.rot = rnd(0, 6.28); p.vr = rnd(-.0016, .0016);
      p.vy = rnd(.018, .04); p.vx = rnd(-.012, .006); p.ph = rnd(0, 6.28); p.col = PETAL_COLORS[i % 3]; p.a = rnd(.55, .95); p.z = rnd(.5, 1.2);
    },
    step(p, dt, w, h) {
      p.ph += dt * .0018;
      p.x += (p.vx + wind.x * .05 * p.z + Math.sin(p.ph) * .012) * dt; p.y += (p.vy + Math.abs(wind.y) * .02) * dt * p.z;
      p.rot += p.vr * dt + wind.x * .001 * dt;
      if (p.y > h + 20 || p.x < -30 || p.x > w + 30) { if (p.burst) return false; p.y = -14; p.x = rnd(0, w); }
    },
    draw(g, p) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, .55 + .45 * Math.cos(p.ph));
      g.fillStyle = `rgba(${p.col},${p.a})`;
      g.beginPath(); g.moveTo(0, -p.s); g.bezierCurveTo(p.s * .9, -p.s * .8, p.s * .8, p.s * .7, 0, p.s); g.bezierCurveTo(-p.s * .8, p.s * .7, -p.s * .9, -p.s * .8, 0, -p.s); g.fill();
      g.restore();
    }
  });
}

let stopCover = () => {};

// =====================================================================================================
// COVER
// =====================================================================================================
EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  el.className = 'cover an'; el.style.cssText = '';
  const nick = k => c.p.get(`traits.${k}.nickname`, '');
  const sub = k => c.p.get(`traits.${k}.hobby`, '') ? `Sở trường: ${c.p.get(`traits.${k}.hobby`)}` : (k === 'bride' ? 'Nữ chính của tập cuối' : 'Nam chính của tập cuối');
  const panel = (k, role, who) => `<div class="an-ci ${k[0]}" aria-hidden="true"><div class="ci-in"><i class="ci-letter">${e((who.short || who.name).trim().charAt(0))}</i><p class="ci-role">${role}</p><p class="ci-name">${e(nb(who.short || who.name))}</p><p class="ci-sub">${nick(k) ? `“${e(nick(k))}” · ` : ''}${e(sub(k))}</p></div></div>`;
  el.innerHTML = `
    <div class="an-sky" aria-hidden="true"><i class="an-sun"></i><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i><canvas class="an-petals ea-mo-canvas"></canvas></div>
    <div class="an-sl a" aria-hidden="true"></div><div class="an-sl b" aria-hidden="true"></div><div class="an-streaks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    ${panel('bride', 'Nữ chính', D.bride)}${panel('groom', 'Nam chính', D.groom)}
    <div class="an-card">
      <p class="an-ep"><span>Tập cuối</span></p>
      <h1 class="an-title">Ngày chúng mình cưới</h1>
      <p class="an-cast">${e(nb(D.bride.short))} <span>×</span> ${e(nb(D.groom.short))}</p>
      <p class="an-to">Gửi ${e(c.guest)} · khởi chiếu ${c.d}.${c.m}.${c.y}</p>
      <button class="open-btn an-play" type="button"><i class="ring"></i><span class="pl">${c.icon('play')}</span><span class="tx">Giữ để phát tập cuối</span></button>
    </div>
    <div class="an-logo" aria-hidden="true"><p class="lg-ep">Tập cuối</p><p class="lg-title">Ngày chúng mình cưới</p><p class="lg-date">Khởi chiếu ${c.d}.${c.m}.${c.y}</p></div>
    <div class="an-flash" aria-hidden="true"></div>`;

  const $ = s => el.querySelector(s);
  const btn = $('.open-btn');
  const S = { ended: false, locked: false, music: false, wind: { x: 0, y: 0 } };
  const stops = [];
  stopCover = () => { S.ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));

  const sp = petals($('.an-petals'), M, S.wind, 34);
  stops.push(() => sp.stop());
  if (M.tier !== 'low' && !c.reduced) stops.push(M.tilt(({ x, y }) => { S.wind.x = x; S.wind.y = y * .5; el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); }));

  const setP = v => el.style.setProperty('--p', clamp(v).toFixed(3));
  setP(0);
  const play = async () => {
    if (S.locked || S.ended) return;
    S.locked = true;
    if (!S.music) { S.music = true; EA.music(); M.requestTilt(); }
    if (c.reduced) { open(); return; }
    const cl = n => el.classList.add(n);
    cl('go'); M.tone('whoosh'); M.haptic('tap');
    await wait(380); if (S.ended) return;
    cl('s1'); M.tone('click'); M.haptic('tap');
    await wait(720); if (S.ended) return;
    cl('s2'); M.tone('click'); M.haptic('tap');
    await wait(820); if (S.ended) return;
    cl('s3'); M.tone('thud'); M.haptic('thud');
    sp.burst(80, (p, i, w, h) => { p.burst = true; p.x = w * .5 + rnd(-30, 30); p.y = h * .46 + rnd(-30, 30); p.s = rnd(5, 11); p.rot = rnd(0, 6.28); p.vr = rnd(-.004, .004); p.ph = rnd(0, 6.28); p.col = PETAL_COLORS[i % 3]; p.a = 1; p.z = 1; const a = rnd(0, 6.28), v = rnd(.15, .7); p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - .1; });
    await wait(1000); if (S.ended) return;
    M.tone('chime'); M.haptic('success');
    await wait(500); if (S.ended) return;
    cl('wash');
    await wait(480);
    open();
  };

  // gesture: giữ nút phát (vòng tròn đầy dần); chạm nhanh thì nút tự nạp
  let held = false;
  M.hold(btn, 650, {
    onProgress: p => { setP(p); if (p > 0 && p < 1) held = true; },
    onDone: () => { play(); },
    onCancel: () => { setP(0); }
  });
  btn.addEventListener('click', async () => {
    if (S.locked) return;
    if (held) { held = false; if (S.locked) return; }
    M.haptic('tap'); M.tone('click');
    await M.tween(0, 1, 420, 'out', setP);
    play();
  });
});

// =====================================================================================================
// SECTIONS
// =====================================================================================================
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  const egg = c.p.has('pet.name') || c.p.has('insideJoke');
  return `<div class="kv">
  <div class="an-sky" aria-hidden="true"><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i></div>
  <div class="wrap kv-inner">
    <figure class="kv-panel"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></figure>
    <div class="kv-text">
      <p class="ep">Tập cuối · ${c.y}</p>
      <h1 class="kv-title">${egg ? '<button class="kv-egg" type="button" aria-label="Chạm ba lần để gọi nhân vật bí mật">' : '<span class="kv-egg">'}<span>${e(nb(cp.brideName))}</span><span class="x">×</span><span>${e(nb(cp.groomName))}</span>${egg ? '</button>' : '</span>'}</h1>
      <p class="bubble">${c.t(cp.headline)}</p>
      <p class="hero-date">${c.dow} · ${c.dateText}</p>
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
  </div>
</div>`;
});

EA.section('invitation', ({ data: D, esc: e, mod, t, icon }) => `<div class="wrap narrow">
  <div class="vn">
    <p class="vn-name">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
    <div class="vn-box">
      <p class="vn-greet">${t(mod.content.greeting || 'Gửi {guestName},')}</p>
      ${D.letter.map(p => `<p>${t(p)}</p>`).join('')}
      <p class="vn-hl">${t(D.letterHighlight)}</p>
      <span class="vn-next" aria-hidden="true">${icon('down')}</span>
    </div>
  </div>
</div>`);

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Tập phim', 'Danh sách tập phim')}
  <ol class="episodes">
    ${(mod.content.chapters || []).map((ch, i) => `
      <li class="episode">
        <div class="thumb">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}<span class="ep-no">#${String(i + 1).padStart(2, '0')}</span></div>
        <div class="ep-info"><p class="air">Phát sóng · ${e(ch.date)}</p><h3>Tập ${i + 1}: ${e(ch.title)}</h3><p>${e(ch.text)}</p></div>
      </li>`).join('')}
  </ol>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Tập tiếp theo', 'Tập tiếp theo')}
  <div class="previews">
    ${D.events.map((ev, i) => `
      <article class="preview">
        <span class="stamp-soon" aria-hidden="true">Sắp chiếu!</span>
        <p class="ep">Phần ${i + 1}</p>
        <p class="pv-time">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Trang truyện', 'Trang truyện của chúng mình')}
  <div class="manga">${D.photos.map((p, i) => ui.photo(p, i)).join('')}</div>
</div>`);

EA.section('rsvp', ({ ui, icon }) => `<div class="wrap narrow">
  ${ui.head('Lựa chọn', 'Bạn chọn gì?')}
  <div class="vn choice-box">
    <p class="vn-name">Lựa chọn quan trọng</p>
    <div class="vn-box">${ui.rsvpForm().replace('Mình sẽ đến', 'Mình sẽ đến chung vui!').replace('Tiếc quá, mình không đến được', 'Lần này mình bận mất rồi…').replace('Gửi phản hồi', 'Xác nhận lựa chọn')}</div>
  </div>
</div>`);

// =====================================================================================================
// ADD-ONS
// =====================================================================================================
const section = (id, html) => { const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} addon`; s.innerHTML = html; return s; };
const placeAfter = (main, ids, nodes) => { for (const id of ids) { const ref = main.querySelector('#' + id); if (ref) { let at = ref; nodes.forEach(n => { at.after(n); at = n; }); return true; } } return false; };
const fmtDate = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${+m[3]}/${+m[2]}/${m[1]}` : `${+m[2]}/${m[1]}`) : String(s || ''); };

// --- Bảng nhân vật: chỉ số hài hước ---
const characters = c => {
  const P = c.p, e = c.esc;
  if (!P.has('traits.bride') && !P.has('traits.groom')) return null;
  const card = (k, who, role) => {
    if (!P.has(`traits.${k}`)) return '';
    const name = who.short || who.name, T = P.get(`traits.${k}`, {});
    const h = hash(name + k);
    const rows = [['Dễ thương', 93 + h % 7]];
    rows.push(['Nấu ăn', 4 + (h >>> 3) % 30]);
    if (T.rhythm) rows.push([T.rhythm === 'morning' ? 'Dậy sớm' : 'Cày đêm', 96 + (h >>> 5) % 4]);
    if (T.drink) rows.push([`Mê ${T.drink.toLowerCase()}`, 100]);
    if (T.hobby) rows.push([`Tài lẻ: ${T.hobby.toLowerCase()}`, 82 + (h >>> 7) % 14]);
    return `<article class="ch ${k}">
      <p class="ch-role">${role}</p>
      <h3 class="ch-name">${e(nb(name))}</h3>
      ${T.nickname ? `<p class="ch-nick">Biệt danh: “${e(T.nickname)}”</p>` : ''}
      <ul class="ch-stats">${rows.map(([l, v], i) => `<li style="--v:${v};--i:${i}"><span class="sl">${e(l)}</span><b>${v}</b><i class="bar"><u></u></i></li>`).join('')}</ul>
    </article>`;
  };
  return section('characters', `<div class="wrap">
    ${c.ui.head('Nhân vật', 'Bảng nhân vật chính')}
    <div class="chars">${card('bride', c.data.bride, 'Nữ chính')}${card('groom', c.data.groom, 'Nam chính')}</div>
    <p class="ch-note">Chỉ số do chính hai nhân vật tự chấm, không khiếu nại.</p>
  </div>`);
};

// --- Nhạc mở đầu ---
const opening = c => {
  const s = c.p.get('song'); if (!s?.title) return null;
  const e = c.esc, words = String(s.lyric || '').split(/\s+/).filter(Boolean);
  return section('oping', `<div class="wrap narrow">
    ${c.ui.head('Nhạc phim', 'Nhạc mở đầu của chúng mình')}
    <div class="op">
      <div class="op-top"><span class="op-ico">${c.icon('note')}</span><div><p class="op-title">${e(s.title)}</p>${s.artist ? `<p class="op-artist">${e(s.artist)}</p>` : ''}</div></div>
      ${words.length ? `<p class="op-lyric">${words.map((w, i) => `<span style="--i:${i}">${e(w)}</span>`).join(' ')}</p>` : ''}
      <div class="op-bar" aria-hidden="true"><u></u></div>
      <p class="op-time" aria-hidden="true"><span>1:24</span><span>3:57</span></p>
    </div>
  </div>`);
};

// --- Bối cảnh quay phim: địa điểm + hai quê ---
const locations = c => {
  const P = c.p, e = c.esc, places = (P.get('places', []) || []).filter(x => x?.name);
  const ht = P.get('hometowns'), pins = P.get('hometownPins');
  if (!places.length && !(ht?.bride && ht?.groom)) return null;
  let prev = null;
  const items = places.map((pl, i) => {
    let km = '';
    if (prev && pl.lat != null) { const d = P.kmBetween(prev, pl); if (d > 1) km = `<span class="lc-km">cách bối cảnh trước ${nf(d)} km</span>`; }
    if (pl.lat != null) prev = pl;
    return `<li><span class="lc-no">${String(i + 1).padStart(2, '0')}</span><div><h3>${e(pl.name)}</h3><p>${pl.date ? `Quay ngày ${fmtDate(pl.date)}` : ''}${km ? `<br>${km}` : ''}</p></div></li>`;
  }).join('');
  const dist = pins?.bride && pins?.groom ? P.kmBetween(pins.bride, pins.groom) : null;
  const home = ht?.bride && ht?.groom ? `<p class="lc-home"><b>${e(ht.bride)}</b><span class="lc-arrow" aria-hidden="true"></span><b>${e(ht.groom)}</b></p><p class="lc-homesub">${dist ? `Hai quê cách nhau ${nf(dist)} km, và chúng mình vẫn tìm thấy nhau.` : 'Hai quê khác nhau, một nhà chung.'}</p>` : '';
  return section('locations', `<div class="wrap narrow">
    ${c.ui.head('Bối cảnh', 'Địa điểm quay phim')}
    ${items ? `<ol class="lc">${items}</ol>` : ''}${home}
  </div>`);
};

// --- Linh vật ---
const mascot = c => {
  const pet = c.p.get('pet'); if (!pet?.name) return null;
  const e = c.esc;
  return section('mascot', `<div class="wrap narrow">
    ${c.ui.head('Nhân vật phụ', 'Linh vật của phim')}
    <div class="mc-card"><span class="mc-face" aria-hidden="true"><i class="e l"></i><i class="e r"></i><i class="n"></i></span>
      <div><p class="ch-role">Xuất hiện mọi tập</p><h3>${e(pet.name)}</h3><p>${pet.kind ? `Thể loại: ${e(pet.kind)}. ` : ''}Không có thoại nhưng được yêu nhất đoàn phim.</p></div></div>
  </div>`);
};

// --- Easter egg: gọi nhân vật bí mật ---
let eggEl = null;
const secret = c => {
  const mo = c.motion, e = c.esc, pet = c.p.get('pet'), joke = c.p.get('insideJoke');
  eggEl?.remove();
  const d = document.createElement('div');
  d.className = 'an-egg'; d.setAttribute('role', 'status');
  d.innerHTML = `<p class="eg-tag">Nhân vật bí mật xuất hiện!</p>${joke ? `<p class="eg-text">${e(joke)}</p>` : `<p class="eg-text">${e(pet.name)}${pet.kind ? ` (${e(pet.kind)})` : ''} vừa nhảy vào khung hình.</p>`}`;
  document.body.appendChild(d);
  requestAnimationFrame(() => d.classList.add('on'));
  mo.tone('pop'); mo.haptic('success');
  eggEl = d;
  const off = () => { d.classList.remove('on'); setTimeout(() => d.remove(), 450); removeEventListener('pointerdown', off, true); };
  setTimeout(() => addEventListener('pointerdown', off, true), 400);
  setTimeout(off, 6500);
};

// --- Credit kết phim sau RSVP ---
const credits = (c, entry) => {
  const e = c.esc, yes = entry.attending !== false, P = c.p, s = P.get('song'), pet = P.get('pet');
  document.querySelector('.an-fin')?.remove();
  const row = (k, v) => `<p class="cr-row"><span>${k}</span><b>${v}</b></p>`;
  const f = document.createElement('div');
  f.className = 'an-fin'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-label', 'Credit kết phim');
  f.innerHTML = `<canvas class="an-fall ea-mo-canvas" aria-hidden="true"></canvas>
    <div class="cr-roll"><div class="cr-in">
      <p class="cr-title">Ngày chúng mình cưới</p><p class="cr-sub">Tập cuối</p>
      ${row('Diễn viên chính', `${e(nb(c.data.bride.name))}<br>${e(nb(c.data.groom.name))}`)}
      ${row(yes ? 'Khách mời đặc biệt' : 'Khán giả thân yêu', e(entry.name || c.guest))}
      ${s?.title ? row('Nhạc mở đầu', `${e(s.title)}${s.artist ? `<br>${e(s.artist)}` : ''}`) : ''}
      ${pet?.name ? row('Linh vật', e(pet.name)) : ''}
      ${row('Địa điểm quay', e(c.config.couple.city || ''))}
      ${row('Khởi chiếu', `${c.d}.${c.m}.${c.y}`)}
      <p class="cr-end">${yes ? 'Hẹn gặp bạn ở buổi công chiếu!' : 'Cảm ơn bạn đã xem hết tập cuối.'}</p>
    </div></div>
    <button class="btn cr-close" type="button">Đóng</button>`;
  document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.add('on')));
  const mo = c.motion, sp = petals(f.querySelector('.an-fall'), mo, { x: 0, y: 0 }, 30);
  mo.tone('whoosh'); mo.haptic('success');
  const close = () => { f.classList.remove('on'); sp.stop(); setTimeout(() => f.remove(), 600); };
  f.querySelector('.cr-close').addEventListener('click', close);
  f.querySelector('.cr-close').focus({ preventScroll: true });
};
EA.onRsvp(entry => { const c = window.__anCtx; if (c) credits(c, entry); });

// =====================================================================================================
// after render
// =====================================================================================================
EA.afterRender((c, main) => {
  const mo = c.motion;
  window.__anCtx = c;
  document.documentElement.dataset.tier = mo.tier;

  // ---- invitation as a visual novel: types line by line, tap to continue ----
  const box = main.querySelector('.vn-box');
  if (box && !c.reduced && !box.closest('.choice-box')) {
    const lines = [...box.querySelectorAll('p')], texts = lines.map(p => p.textContent);
    lines.forEach(p => { p.textContent = ''; p.hidden = true; });
    box.insertAdjacentHTML('beforeend', '<p class="vn-tap">Chạm để tiếp tục</p>');
    const tap = box.querySelector('.vn-tap');
    let i = 0, ch = 0, timer = 0, started = false;
    const type = () => {
      if (i >= lines.length) { tap.textContent = 'Hết đoạn'; return; }
      lines[i].hidden = false; clearInterval(timer);
      const chars = Array.from(texts[i]);
      timer = setInterval(() => { ch++; lines[i].textContent = chars.slice(0, ch).join(''); if (ch >= chars.length) { clearInterval(timer); timer = 0; } }, 28);
    };
    const next = () => { if (timer) { clearInterval(timer); timer = 0; lines[i].textContent = texts[i]; ch = Array.from(texts[i]).length; return; } i++; ch = 0; type(); };
    box.addEventListener('click', () => { if (started) { mo.tone('click'); next(); } });
    new IntersectionObserver(([en], o) => { if (en.isIntersecting && !started) { started = true; o.disconnect(); type(); } }, { threshold: .5 }).observe(box);
  }

  // ---- add-ons ----
  const [ch, op, lc, mc] = [characters(c), opening(c), locations(c), mascot(c)];
  if (ch) placeAfter(main, ['invitation', 'hero'], [ch]);
  if (lc) placeAfter(main, ['story', 'families'], [lc]);
  const tail = [op, mc].filter(Boolean);
  if (tail.length) placeAfter(main, ['gallery', 'quote', 'events'], tail);
  main.querySelectorAll('.addon').forEach(s => { if (!mo.reduced) { s.classList.add('reveal'); mo.inView(s, () => s.classList.add('in'), { threshold: .12 }); } else s.classList.add('in'); });

  // ---- ongoing: sakura drift over the whole card, wind from scroll speed and tilt ----
  document.querySelector('.an-fixed')?.remove();
  const cv = document.createElement('canvas');
  cv.className = 'an-fixed ea-mo-canvas'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const wind = { x: 0, y: 0 };
  let ly = scrollY;
  addEventListener('scroll', () => { const dy = scrollY - ly; ly = scrollY; wind.y = clamp(dy / 40, -1, 1); }, { passive: true });
  if (!mo.reduced) {
    mo.tilt(({ x }) => { wind.x = x; wind.y *= .92; document.documentElement.style.setProperty('--tx', x); });
    petals(cv, mo, wind, mo.tier === 'low' ? 6 : 16);
  } else petals(cv, mo, wind, 8);

  // ---- stat bars fill when seen; opening progress runs ----
  main.querySelectorAll('.ch, .op').forEach(n => mo.inView(n, () => n.classList.add('go'), { threshold: .3 }));

  // ---- easter egg: ba lần chạm tên trong key visual ----
  const egg = main.querySelector('button.kv-egg');
  if (egg) { let n = 0, t0 = 0; egg.addEventListener('click', () => { const now = Date.now(); n = now - t0 < 1800 ? n + 1 : 1; t0 = now; mo.tone('pop'); mo.haptic('tap'); egg.classList.remove('hit'); void egg.offsetWidth; egg.classList.add('hit'); if (n >= 3) { n = 0; secret(c); } }); }

  // ---- key visual panel leans with tilt ----
  const kv = main.querySelector('.kv-panel');
  if (kv && !mo.reduced && mo.tier !== 'low') mo.tilt(({ x, y }) => { kv.style.setProperty('--kx', x); kv.style.setProperty('--ky', y); });
});
