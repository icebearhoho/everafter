// Áo Trắng Học Đường: a paper airplane from the next desk lands on yours, unfolds into a note, and chalk writes "Kiểm tra bất ngờ!".
// Cover: flick the plane toward you. All artwork is CSS / SVG / canvas.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const PLANE = `<svg viewBox="0 0 120 80" aria-hidden="true"><g stroke-linejoin="round" stroke-width=".9">
  <polygon points="116,40 12,68 44,40" fill="#dfe6f3" stroke="#aab6cf"/><polygon points="116,40 12,12 44,40" fill="#fff" stroke="#b7c2d9"/>
  <polygon points="116,40 44,40 28,56" fill="#c9d3e8" stroke="#aab6cf"/><path d="M44 40 L116 40" stroke="#9aa8c4" fill="none"/>
  <path d="M30 20 L60 38 M24 30 L46 39" stroke="#c7d1e6" fill="none" stroke-width=".7"/></g></svg>`;
const PENCIL = `<svg viewBox="0 0 200 26" aria-hidden="true"><rect x="0" y="3" width="26" height="20" rx="3" fill="#e98fa0"/><rect x="26" y="3" width="10" height="20" fill="#b9c0c9"/><rect x="36" y="3" width="120" height="20" fill="#f2c230"/><path d="M36 9H156M36 17H156" stroke="#d9a712" stroke-width="1.5"/><polygon points="156,3 196,13 156,23" fill="#f3d8b0"/><polygon points="183,9.6 196,13 183,16.4" fill="#2b3340"/></svg>`;
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.5 1.4 6.6L12 17.2 6 20.5l1.4-6.6L2.5 9.4l6.6-.7z" fill="currentColor"/></svg>';
const PEN = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></svg>';
const ERASE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l9-10 7 6-6 7H8z"/><path d="M9 18l7-8"/></svg>';

// chalk / paper dust
function dustSys(M, cv, o = {}) {
  return M.particles(cv, {
    count: o.count || 40,
    init: (p, i, w, h) => { p.x = rnd(0, w); p.y = o.fall ? rnd(0, h) : rnd(0, h); p.r = rnd(.6, 1.9); p.vy = rnd(.004, .014); p.vx = rnd(-.006, .006); p.ph = rnd(0, 6.28); p.a = rnd(.25, .7); },
    step: (p, dt, w, h) => { p.x += (p.vx + Math.sin(p.life * .0006 + p.ph) * .008) * dt; p.y += p.vy * dt; return p.y < h + 6; },
    draw: (g, p) => { g.globalAlpha = p.a * (o.dim || 1); g.fillStyle = o.col || '#fff'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill(); g.globalAlpha = 1; }
  });
}

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c, cp = c.config.couple;
  el.className = 'cover sc-cover'; el.style.cssText = '';
  el.innerHTML = `
    <div class="sc-desk" aria-hidden="true">
      <i class="ink i1"></i><i class="ink i2"></i><i class="ink i3"></i>
      <span class="sc-carve">${e(D.bride.short)} + ${e(D.groom.short)}</span>
      <span class="sc-ruler"></span><span class="sc-pencil" data-d="14">${PENCIL}</span><span class="sc-eraser" data-d="10"></span>
    </div>
    <canvas class="sc-dust ea-mo-canvas" aria-hidden="true"></canvas>
    <div class="sc-stage">
      <p class="sc-next">Bạn cùng bàn vừa chuyền cho bạn một mẩu giấy</p>
      <div class="sc-book" aria-hidden="true">
        <p class="sc-to">Gửi ${e(c.guest)}</p>
        <div class="sc-label"><small>Vở học sinh · Môn Hạnh phúc</small><b>${e(cp.brideName)} <em>+</em> ${e(cp.groomName)}</b><span>${c.dow}, ${c.d}.${c.m}.${c.y}</span></div>
      </div>
      <svg class="sc-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M80 8 C 60 8, 74 40, 50 46"/></svg>
      <button class="sc-plane" type="button" aria-label="Máy bay giấy của bạn cùng bàn. Vuốt về phía mình để nhận"><span class="pl">${PLANE}</span></button>
      <div class="sc-note" aria-hidden="true">
        <div class="nb">
          <p class="n-to">Gửi ${e(c.guest)},</p>
          <p>Hồi đó ngồi chung bàn, tụi mình chuyền giấy suốt giờ Toán…</p>
          <p class="n-big">Giờ tụi mình cưới thật rồi nè!</p>
          <p class="n-sign">${e(D.bride.short)} &amp; ${e(D.groom.short)} · ${c.d}.${c.m}.${c.y}</p>
        </div>
        <div class="nf"><span>Gửi ${e(c.guest)}</span><i>đừng để cô thấy nha</i></div>
      </div>
      <p class="sc-hint">Vuốt máy bay giấy về phía bạn</p>
      <button class="open-btn" type="button">Bắt lấy mẩu giấy</button>
    </div>
    <div class="sc-board" aria-hidden="true"><div class="sc-bw"><p class="sc-chalk">Kiểm tra bất ngờ!</p><p class="sc-sub">Cả lớp cất sách vở, lấy giấy ra nào.</p></div><span class="sc-tray"></span></div>`;

  const $ = s => el.querySelector(s);
  const stage = $('.sc-stage'), plane = $('.sc-plane'), note = $('.sc-note'), chalk = $('.sc-chalk'), book = $('.sc-book');
  const stops = []; let launched = false, ended = false, started = false;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const gesture = () => { if (started) return; started = true; EA.music(); M.requestTilt(); };
  const sys = dustSys(M, $('.sc-dust'), { count: 34, dim: .55, col: '#fff7e0' }); stops.push(() => sys.stop());
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!launched) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } }));
  const rel = n => { const r = n.getBoundingClientRect(), s = stage.getBoundingClientRect(); return [r.left + r.width / 2 - s.left, r.top + r.height / 2 - s.top]; };

  // plane position is kept in stage px; the element is centred on (x, y)
  let home = [0, 0], pos = [0, 0], rot = -14, sc = 1;
  const place = () => { plane.style.transform = `translate(${pos[0].toFixed(1)}px, ${pos[1].toFixed(1)}px) translate(-50%, -50%) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`; };
  const setHome = () => { if (launched) return; const s = stage.getBoundingClientRect(); home = [s.width - Math.min(86, s.width * .24), 78 + (s.height > 600 ? 12 : 0)]; pos = home.slice(); place(); };
  setHome(); addEventListener('resize', setHome); stops.push(() => removeEventListener('resize', setHome));

  let down = null;
  plane.addEventListener('pointerdown', ev => { if (launched) return; gesture(); down = { x: ev.clientX, y: ev.clientY, t: ev.timeStamp }; plane.setPointerCapture(ev.pointerId); M.tone('click'); });
  plane.addEventListener('pointermove', ev => {
    if (!down || launched) return;
    const dx = ev.clientX - down.x, dy = ev.clientY - down.y;
    pos = [home[0] + dx, home[1] + dy]; rot = clamp(-14 + Math.atan2(dy, dx || 1) * 18, -50, 30); sc = 1 + clamp(dy / 500, 0, .3); place();
  });
  const release = ev => { if (!down || launched) return; down = null; launch(); };
  plane.addEventListener('pointerup', release); plane.addEventListener('pointercancel', () => { down = null; pos = home.slice(); rot = -14; sc = 1; place(); });
  plane.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); gesture(); launch(); } });
  $('.open-btn').addEventListener('click', () => { gesture(); launch(); }, { once: true });

  // the flight: a swooping curve with a little wobble, growing as it comes to your desk
  async function launch() {
    if (launched || ended) return; launched = true;
    el.classList.add('flying');
    M.haptic('tap'); M.tone('whoosh');
    const P0 = pos.slice(), [bx, by] = rel(book), P3 = [bx, by];
    const P1 = [P0[0] + 40, P0[1] + 150], P2 = [P3[0] + 150, P3[1] - 190];
    const bez = (t, i) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * P1[i] + 3 * (1 - t) * t * t * P2[i] + t ** 3 * P3[i];
    const r0 = rot;
    await M.tween(0, 1, 980, 'inOut', t => {
      const x = bez(t, 0), y = bez(t, 1), x2 = bez(Math.min(1, t + .02), 0), y2 = bez(Math.min(1, t + .02), 1);
      const wob = Math.sin(t * Math.PI * 3) * 22 * (1 - t);
      pos = [x, y + wob]; sc = 1 + 1.25 * t;
      const a = Math.atan2(y2 - y + .001, x2 - x + .001) * 180 / Math.PI;
      rot = a + Math.sin(t * 12) * 10 * (1 - t) - 20 * t;
      place();
    });
    if (ended) return;
    M.tone('pop'); M.haptic('thud');
    el.classList.add('landed');
    c.after(260, () => { el.classList.add('unfold1'); M.tone('click'); });
    c.after(640, () => { el.classList.add('unfold2'); M.tone('click'); M.haptic('tap'); });
    c.after(1300, () => el.classList.add('board-in'));
    c.after(1750, async () => {
      if (ended) return;
      M.tone('thud'); chalk.style.visibility = 'visible';
      let n = 0; const tick = setInterval(() => { if (++n > 14) clearInterval(tick); else if (n % 2) M.tone('click'); }, 55); stops.push(() => clearInterval(tick));
      await M.reveal(chalk, { mode: 'write', stagger: 48 });
      if (ended) return;
      el.classList.add('sub-in'); M.haptic('success'); M.tone('chime');
    });
    c.after(3350, () => { if (ended) return; open(); setTimeout(stopCover, 1200); });
  }
});

// ---- layouts ----
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui, p } = c;
  return `<div class="wrap">
  <div class="board">
    <canvas class="sc-hdust ea-mo-canvas" aria-hidden="true"></canvas>
    <p class="board-date">${c.dow}, ngày ${+c.d} tháng ${+c.m}</p>
    <p class="board-class">Lớp 12A1 · Bài học cuối cùng</p>
    <h1 class="chalk-names">${e(cp.brideName)} <span>+</span> ${e(cp.groomName)}</h1>
    <p class="chalk-line">${c.t(cp.headline)}</p>
    ${p.daysTogether != null ? `<p class="chalk-days">Bạn cùng bàn <b>${fmt(p.daysTogether)}</b> ngày, chưa nghỉ buổi nào</p>` : ''}
    <figure class="id-photo"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><figcaption>Ảnh thẻ · ${c.y}</figcaption></figure>
    <div class="chalk-count" data-countdown-wrap><p>Còn</p>${ui.countdown()}<p>là tới ngày cưới!</p></div>
    <button class="eraser" type="button" aria-label="Cái giẻ lau bảng"></button><span class="chalk-stick" aria-hidden="true"></span>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Học bạ tình yêu', 'Sổ liên lạc của chúng mình')}
  <div class="report">
    <div class="report-row report-head"><span>Năm</span><span>Nội dung</span><span>Nhận xét của giáo viên</span></div>
    ${(mod.content.chapters || []).map(ch => `
      <div class="report-row">
        <span class="yr">${e(ch.date)}</span>
        <span><strong>${e(ch.title)}</strong></span>
        <span class="red-pen">${e(ch.text)}</span>
      </div>`).join('')}
    <p class="grade" aria-label="Xếp loại: Xuất sắc">Xếp loại<br><b>Xuất sắc</b></p>
  </div>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Thời khoá biểu', 'Lịch học ngày cưới')}
  <div class="timetable">
    ${D.events.map((ev, i) => `
      <article class="period">
        <p class="tiet">Tiết ${i + 1}</p>
        <p class="p-time">${e(ev.time)}</p>
        <div class="p-body">
          <h3>${e(ev.title)}</h3>
          <p>${e(ev.place)} · ${e(ev.address)}</p>
          <p class="p-label">${e(ev.label)}</p>
        </div>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

// the wedding party as a class photo
EA.section('party', ({ esc: e, ui, mod }) => {
  const ppl = mod.content.people || [];
  const rows = [ppl.filter((_, i) => i % 2 === 0), ppl.filter((_, i) => i % 2 === 1)];
  return `<div class="wrap">
  ${ui.head('Ảnh tập thể', 'Ảnh lớp của chúng mình')}
  <figure class="classpic">
    <div class="cp-rows">${rows.map((r, k) => `<div class="cp-row r${k}">${r.map(pp => `<div class="cp-p"><img src="${e(pp.image || '')}" alt="" loading="lazy"><b>${e(pp.name)}</b><span>${e(pp.role)}${pp.note ? ` · ${e(pp.note)}` : ''}</span></div>`).join('')}</div>`).join('')}</div>
    <figcaption>Lớp 12A1 · Khoá chung đôi</figcaption>
  </figure>
</div>`;
});

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('RSVP', 'Điểm danh nào!')}
  <div class="roll">
    <p class="roll-title">Sổ điểm danh · Lớp tình yêu</p>
    ${ui.rsvpForm().replace('Mình sẽ đến', 'Có mặt!').replace('Tiếc quá, mình không đến được', 'Vắng mặt (có phép)').replace('Gửi phản hồi', 'Nộp bài')}
  </div>
</div>`);

EA.section('guestbook', ({ esc: e, ui, mod }) => `<div class="wrap narrow">
  ${ui.head('Lưu bút', 'Viết lưu bút cho tụi mình')}
  <div class="yearbook">
    ${mod.content.prompt ? `<p class="yb-prompt">${e(mod.content.prompt)}</p>` : ''}
    ${ui.wishForm()}
    <ul class="wish-list"></ul>
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Kỷ yếu', 'Ảnh kỷ yếu của hai đứa')}
  <div class="yb-grid">${D.photos.map((p, i) => ui.photo(p, i, `<span class="sticker" aria-hidden="true">${STAR}</span>`)).join('')}</div>
</div>`);

EA.section('thanks', ({ data: D, esc: e, dateText, mod, icon }) => `<div class="desk-edge" aria-hidden="true"><i class="ink i1"></i><i class="ink i2"></i></div>
  <div class="wrap narrow">
    <p class="eyebrow">${e(mod.content.eyebrow || 'Cảm ơn bạn')}</p>
    <p class="th-text">${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Mở lại mẩu giấy ${icon('replay')}</button></div>
  </div>`);

// ---- quiz, desk corner, doodle board, easter egg, finale ----
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data, cp = c.config.couple;
  const nick = k => P.get(`traits.${k}.nickname`, '');
  const adds = [];
  // seeded shuffle so the options stay put between renders
  const shuffle = (arr, seed) => { const a = arr.slice(); let s = seed * 9301 + 49297; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (right, pool, seed) => shuffle([right, ...pool.filter(x => x !== right).slice(0, 3)], seed);

  // 1. "Bài kiểm tra 15 phút" about the couple, built from what they told us
  const qs = [];
  const add = (q, right, pool) => { if (right) qs.push({ q, right: String(right), opts: pick(String(right), pool, qs.length + 3) }); };
  const yr = String(P.get('metDate', '')).slice(0, 4);
  add('Hai bạn gặp nhau lần đầu ở đâu?', P.get('metPlace'), ['Căng tin trường', 'Nhà sách Phương Nam', 'Quán trà sữa đầu ngõ', 'Sân bóng sau trường']);
  if (yr) add('Hai bạn quen nhau vào năm nào?', yr, [+yr - 1, +yr + 1, +yr - 2, +yr + 2].map(String));
  add(`${D.bride.short} thích uống gì nhất?`, P.get('traits.bride.drink'), ['Trà đào cam sả', 'Nước cam ép', 'Sinh tố bơ', 'Cà phê muối']);
  add(`Sở thích của ${D.groom.short} là gì?`, P.get('traits.groom.hobby'), ['Đá bóng', 'Câu cá', 'Đọc truyện tranh', 'Nấu ăn']);
  add(`Quê của ${D.groom.short} ở đâu?`, P.get('hometowns.groom'), ['Huế', 'Đà Nẵng', 'Hải Phòng', 'Vũng Tàu']);
  add('Bài hát của hai bạn là bài nào?', P.get('song.title'), ['Con đường mưa', 'Nơi này có anh', 'Ngày mai em đi', 'Lạc trôi']);
  add(`Bé ${P.get('pet.kind', 'cưng')} nhà hai bạn tên là gì?`, P.get('pet.name'), ['Bơ', 'Mực', 'Na', 'Lu']);
  add(`Biệt danh của ${D.groom.short}?`, nick('groom'), ['Tí', 'Bin', 'Cún', 'Sói']);
  if (qs.length >= 2) {
    const L = ['A', 'B', 'C', 'D'];
    adds.push(['quiz', 'story', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Bài kiểm tra bất ngờ</p><h2 class="title">Kiểm tra 15 phút</h2><p class="sub">Môn: Tình yêu của ${e(D.bride.short)} &amp; ${e(D.groom.short)}. Học sinh: ${e(c.guest)}.</p></header>
      <div class="exam" data-n="${qs.length}">
        ${qs.map((q, i) => `<fieldset class="qq" data-right="${e(q.right)}"><legend><b>Câu ${i + 1}.</b> ${e(q.q)}</legend>
          <div class="qo">${q.opts.map((o, k) => `<button type="button" class="qb" data-v="${e(o)}"><i>${L[k]}</i><span>${e(o)}</span></button>`).join('')}</div>
          <p class="qm" aria-live="polite"></p></fieldset>`).join('')}
        <div class="score" hidden><div class="mark"><small>Điểm</small><b>10</b></div><p class="cmt"></p></div>
      </div></div>`]);
  }

  // 2. "Giờ ra chơi": the song, the inside joke, the nicknames, as things left on the desk
  const jk = P.get('insideJoke'), ly = P.get('song.lyric'), nb = nick('bride'), ng = nick('groom');
  if (jk || ly || nb || ng) adds.push(['desk', 'quiz', `<div class="wrap">
    <header class="head"><p class="eyebrow">Giờ ra chơi</p><h2 class="title">Góc bàn học của tụi mình</h2></header>
    <div class="dk">
      ${ly ? `<div class="dk-note n1"><small>Bài hát chuyền tay</small><p>${e(ly)}</p><span>${e(P.get('song.title', ''))}${P.has('song.artist') ? ` · ${e(P.get('song.artist'))}` : ''}</span></div>` : ''}
      ${jk ? `<div class="dk-note n2"><small>Chuyện cả lớp đều biết</small><p>${e(jk)}</p><i class="ink"></i></div>` : ''}
      ${nb || ng ? `<div class="dk-tags">${[[nb, D.bride.short], [ng, D.groom.short]].filter(x => x[0]).map(x => `<div class="tag"><small>${e(x[1])} ở nhà gọi là</small><b>${e(x[0])}</b></div>`).join('')}</div>` : ''}
    </div></div>`]);
  adds.forEach(([id, after, html]) => {
    const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} sc-add`; s.innerHTML = html;
    (main.querySelector(`#${after}`) || main.querySelector('#hero')).insertAdjacentElement('afterend', s);
  });

  const exam = main.querySelector('.exam');
  exam?.addEventListener('click', ev => {
    const b = ev.target.closest('.qb'); const fs = b?.closest('.qq'); if (!b || fs.dataset.done) return;
    fs.dataset.done = '1';
    const ok = b.dataset.v === fs.dataset.right;
    fs.dataset.ok = ok ? '1' : '0';
    fs.querySelectorAll('.qb').forEach(x => { x.disabled = true; if (x.dataset.v === fs.dataset.right) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    fs.querySelector('.qm').textContent = ok ? 'Đúng rồi, cộng một điểm!' : `Chưa đúng. Đáp án là: ${fs.dataset.right}`;
    ok ? (M.tone('pop'), M.haptic('tap')) : (M.tone('click'), M.haptic('thud'));
    const all = [...exam.querySelectorAll('.qq')];
    if (all.every(q => q.dataset.done)) {
      const good = all.filter(q => q.dataset.ok === '1').length, n = all.length, g = Math.round(good / n * 20) / 2;
      const sc = exam.querySelector('.score'); sc.hidden = false; sc.querySelector('b').textContent = g % 1 ? g.toFixed(1).replace('.', ',') : g;
      sc.querySelector('.cmt').textContent = g >= 9 ? 'Xuất sắc! Mời bạn lên bàn tiệc nhận phần thưởng.' : g >= 6 ? 'Khá lắm. Đến tiệc nhớ chú ý nghe MC hơn nhé.' : 'Cần cố gắng thêm. Đến tiệc cô và hai bạn sẽ ôn lại cho.';
      sc.classList.add('in'); M.tone('chime'); M.haptic('success'); sc.scrollIntoView({ block: 'center', behavior: c.reduced ? 'auto' : 'smooth' });
    }
  });

  // chalkboard: dust, tilt-driven eraser, doodle pad
  const board = main.querySelector('.board'); if (!board) return;
  const hd = board.querySelector('.sc-hdust');
  dustSys(M, hd, { count: 36, fall: true, dim: .5 });
  if (M.tier !== 'low') M.tilt(({ x, y }) => { board.style.setProperty('--tx', x); board.style.setProperty('--ty', y); });
  board.insertAdjacentHTML('beforeend', `<canvas class="chalk-pad" aria-label="Bảng đen, vẽ bằng ngón tay khi bật chế độ vẽ"></canvas>
    <div class="chalk-tools"><button type="button" class="ct draw" aria-pressed="false">${PEN}<span>Vẽ lên bảng</span></button><button type="button" class="ct wipe">${ERASE}<span>Xoá</span></button></div>`);
  const cv = board.querySelector('.chalk-pad'), g = cv.getContext('2d');
  const fit = () => { const r = board.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); };
  fit(); new ResizeObserver(fit).observe(board);
  let on = false, dn = false, last = null;
  const drawBtn = board.querySelector('.draw'), lab = drawBtn.querySelector('span');
  drawBtn.addEventListener('click', () => { on = !on; board.classList.toggle('drawing', on); drawBtn.setAttribute('aria-pressed', on); lab.textContent = on ? 'Xong' : 'Vẽ lên bảng'; });
  board.querySelector('.wipe').addEventListener('click', () => g.clearRect(0, 0, cv.width, cv.height));
  const pt = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  cv.addEventListener('pointerdown', ev => { if (!on) return; dn = true; last = pt(ev); cv.setPointerCapture(ev.pointerId); });
  cv.addEventListener('pointermove', ev => {
    if (!dn) return; const p = pt(ev);
    g.strokeStyle = 'rgba(245,245,235,.85)'; g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(p[0] + Math.random() * 3 - 1.5, p[1] + Math.random() * 3 - 1.5, 1.2, 1.2); last = p;
  });
  cv.addEventListener('pointerup', () => { dn = false; });

  // easter egg: wipe the board three times with the eraser, the bell rings and a plane crosses the sky
  let n = 0, t0 = 0;
  const er = board.querySelector('.eraser');
  er.addEventListener('click', () => {
    const now = Date.now(); n = now - t0 < 2200 ? n + 1 : 1; t0 = now; M.tone('click'); M.haptic('tap');
    er.classList.remove('wob'); void er.offsetWidth; er.classList.add('wob');
    if (n < 3) return; n = 0;
    M.tone('chime'); M.haptic('success');
    const names = [nick('bride'), nick('groom')].filter(Boolean).join(' và ');
    const t = document.createElement('p'); t.className = 'sc-toast'; t.setAttribute('role', 'status');
    t.textContent = names ? `Reng reng! Giờ ra chơi. ${names} đang đợi bạn ở sân trường.` : 'Reng reng! Giờ ra chơi rồi, cả lớp ra sân nào.';
    document.body.appendChild(t); setTimeout(() => t.remove(), 3800);
    if (!c.reduced) { const p = document.createElement('span'); p.className = 'sc-fly'; p.innerHTML = PLANE; document.body.appendChild(p); setTimeout(() => p.remove(), 2600); }
  });

  // finale: the teacher stamps the paper and a few planes leave
  EA.onRsvp(() => {
    M.tone('thud'); M.haptic('crack');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling; if (!f.hidden || !done || done.previousElementSibling?.classList.contains('sc-stamp')) return;
        done.insertAdjacentHTML('beforebegin', `<div class="sc-stamp" aria-hidden="true"><b>10</b><small>Nộp bài</small></div>${c.reduced ? '' : [0, 1, 2].map(i => `<span class="sc-out" style="--i:${i}" aria-hidden="true">${PLANE}</span>`).join('')}`);
        done.classList.add('sc-done'); done.scrollIntoView({ block: 'center', behavior: c.reduced ? 'auto' : 'smooth' }); setTimeout(() => { M.tone('chime'); }, 450);
      });
    }, 40);
  });
});
