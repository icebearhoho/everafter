// Thiệp hồng hoàng gia: the cover is a sealed red envelope. Hold the gold wax seal until it cracks; the flap opens,
// the card rises in gold dust and fills the screen. The page then keeps the opened envelope as its header.
// All artwork is original (CSS/SVG/canvas).

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- original artwork ----------
const FLORAL = `<svg class="floral" viewBox="0 0 160 110" aria-hidden="true">
  <g fill="none" stroke="#9b8657" stroke-width="1.3" stroke-linecap="round">
    <path d="M2 4 C40 10 70 26 96 52 C112 68 128 80 158 86"/>
    <path d="M30 12 C36 26 34 40 24 52"/><path d="M62 30 C74 34 80 46 78 60"/><path d="M104 60 C104 72 98 82 88 90"/>
  </g>
  <g fill="#b7a578">
    <ellipse cx="22" cy="8" rx="9" ry="3.6" transform="rotate(18 22 8)"/><ellipse cx="46" cy="20" rx="9" ry="3.4" transform="rotate(34 46 20)"/>
    <ellipse cx="34" cy="34" rx="8" ry="3.2" transform="rotate(-70 34 34)"/><ellipse cx="80" cy="44" rx="9" ry="3.4" transform="rotate(50 80 44)"/>
    <ellipse cx="78" cy="58" rx="8" ry="3" transform="rotate(-80 78 58)"/><ellipse cx="118" cy="72" rx="9" ry="3.2" transform="rotate(26 118 72)"/>
    <ellipse cx="100" cy="80" rx="7" ry="3" transform="rotate(-60 100 80)"/><ellipse cx="140" cy="82" rx="8" ry="3" transform="rotate(10 140 82)"/>
  </g>
  ${[[24, 52, 7], [66, 30, 5.5], [90, 90, 6.5], [128, 78, 4.5], [8, 26, 4]].map(([x, y, r]) =>
    `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="${r * .55}" ry="${r}" cy="${-r * .8}" transform="rotate(${a})" fill="#f4efe6" stroke="#cbbd97" stroke-width=".6"/>`).join('')}<circle r="${r * .38}" fill="#c9a45c"/></g>`).join('')}
</svg>`;
const ROSE = `<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#8a6526" stroke-width="1.4" stroke-linecap="round">
  <path d="M20 20 c2 -2 4 0 2 2 c-3 3 -7 0 -5 -4 c3 -5 10 -3 10 3 c0 7 -9 10 -14 5 c-6 -6 -1 -16 8 -15 c9 1 13 11 8 18"/>
  <path d="M12 30 c3 2 7 3 11 2"/><path d="M10 12 c-2 3 -2 6 -1 9"/>
</g></svg>`;
// scalloped wax edge
const SEAL_CLIP = `polygon(${Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2, r = i % 2 ? 46 : 50; return `${(50 + Math.cos(a) * r).toFixed(2)}% ${(50 + Math.sin(a) * r).toFixed(2)}%`; }).join(',')})`;
const ICONS = {
  car: '<path d="M3 14l2-5.5h14L21 14v4.5h-2.5v-2h-13v2H3z"/><circle cx="7.5" cy="14.5" r="1.2"/><circle cx="16.5" cy="14.5" r="1.2"/>',
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  ring: '<circle cx="12" cy="14.5" r="5.5"/><path d="M9 5.5 12 3l3 2.5-3 3z"/>',
  camera: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7.5 10 5h4l1.5 2.5"/>',
  cake: '<path d="M4 20h16v-7H4z"/><path d="M4 16.5c2.5 1.5 4.5 1.5 6 0s4-1.5 6 0 3 1 4 .5"/><path d="M12 13V9.5"/><path d="M12 5.5c1 1 1 2.2 0 2.8-1-.6-1-1.8 0-2.8z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
};
const ICON_ORDER = ['car', 'home', 'car', 'ring', 'camera', 'cake'];
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${ICONS[name] || ICONS.heart}</svg>`;
const HY = '<span class="hy" aria-hidden="true">囍</span>';
const ICO_OK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICO_NO = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const CORNERS = '<span class="orn tl"></span><span class="orn tr"></span><span class="orn bl"></span><span class="orn br"></span>';

document.documentElement.classList.add('rs-page');

// ---------- 1. the opened envelope header (the cover leaves the card here) ----------
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e } = c;
  const half = (cls, clip) => `<span class="half ${cls}"><span class="face" style="clip-path:${clip}"><i>囍</i></span></span>`;
  return `<div class="rs-top is-open">
  ${FLORAL}${FLORAL.replace('class="floral"', 'class="floral r"')}
  <canvas class="rs-dust ea-mo-canvas" aria-hidden="true"></canvas>
  <p class="rs-kicker">Thiệp</p>
  <h1 class="rs-title">Mời Cưới</h1>
  <p class="rs-to">Trân trọng kính mời <b>${e(c.guest)}</b></p>
  <div class="env-btn">
    <span class="env" aria-hidden="true">
      <span class="env-back"></span>
      <span class="env-photo"><img src="${e(cp.heroImage)}" alt="" fetchpriority="high"></span>
      <span class="env-front"></span>
      <span class="env-flap"></span>
    </span>
    <button class="wax-bits" type="button" aria-label="Hai mảnh sáp niêm phong đã vỡ">${half('l', CLIP_L)}${half('r', CLIP_R)}</button>
  </div>
  <p class="rs-names">${e(cp.groomName)} <span class="heart">${icon('heart')}</span> ${e(cp.brideName)}</p>
  <p class="rs-date">${HY}<b>${c.d}.${c.m}.${c.y}</b>${HY}</p>
</div>`;
});

// ---------- 2. families, names, portrait, three photos ----------
EA.section('families', ({ data: D, esc: e, config: { couple: cp } }) => {
  const p = D.photos;
  return `<div class="rs-fam-block">
  <div class="rs-banner" aria-hidden="true"><i class="hole"></i><span>囍</span></div>
  <div class="rs-fam-right">
    <p class="rs-vert">Thiệp<br>Mời<br>Cưới</p>
    <div class="rs-fams">
      <p class="lbl">Nhà trai:</p><p>Ông: ${e(D.groomFamily.father)}</p><p>Bà: ${e(D.groomFamily.mother)}</p>
      <hr>
      <p class="lbl">Nhà gái:</p><p>Ông: ${e(D.brideFamily.father)}</p><p>Bà: ${e(D.brideFamily.mother)}</p>
    </div>
  </div>
</div>
<div class="rs-pair">
  <p class="n1">${e(D.groom.name)}</p><p class="amp">&amp;</p><p class="n2">${e(D.bride.name)}</p>
</div>
<figure class="rs-portrait"><img src="${e(p[0]?.src || cp.heroImage)}" alt="" loading="lazy"></figure>
<p class="rs-tagline">${e(cp.headline)}</p>
<div class="rs-trio">${p.slice(1, 4).map((ph, i) => `<img src="${e(ph.src)}" alt="" loading="lazy" style="--i:${i}">`).join('')}</div>`;
});

// ---------- 3. invitation ----------
EA.section('invitation', ({ data: D, t, mod }) => `<div class="wrap narrow">
  <p class="rs-h">Trân trọng kính mời!</p>
  ${D.letter.map(p => `<p class="rs-p">${t(p)}</p>`).join('')}
</div>`);

// ---------- 4. events with an in-place Nhà gái / Nhà trai switch ----------
const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
// An event may have its own "date" (YYYY-MM-DD); otherwise it uses the wedding date.
const evDate = (ev, c) => {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : c.data.date;
  const [y, m, d] = iso.split('-');
  return { y, m, d, dow: DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()] };
};

EA.section('events', c => {
  const { data: D, esc: e, ui, side } = c;
  const showTabs = side === 'all' && D.hasSides;
  return `<div class="wrap narrow">
  ${showTabs ? `<div class="rs-tabs" role="tablist" aria-label="Chọn nhà">
    <button type="button" role="tab" data-tab="bride" aria-selected="true">Nhà gái</button>
    <button type="button" role="tab" data-tab="groom" aria-selected="false">Nhà trai</button>
  </div>` : ''}
  <div class="rs-evcard" data-show="${side === 'groom' ? 'groom' : 'bride'}">
    ${D.events.map(ev => { const { y, m, d, dow } = evDate(ev, c); return `
      <article class="rs-ev" data-side="${e(ev.side || 'both')}">
        <h3>${e(ev.title)}</h3>
        <p class="at">Vào lúc: ${e(ev.time)}</p>
        <p class="dow">${dow}</p>
        <p class="strip">Tháng ${m} <i>|</i> <b>${d}</b> <i>|</i> ${y}</p>
        ${ev.lunar ? `<p class="lunar">(${e(ev.lunar)})</p>` : ''}
        <p class="addr">${e(ev.address)}</p>
        <a class="map" href="${ui.mapUrl(ev)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>Xem bản đồ</a>
      </article>`; }).join('')}
  </div>
</div>`;
});

// ---------- 5. dress code ----------
EA.section('dressCode', ({ data: D, esc: e }) => `<div class="wrap narrow">
  <p class="rs-h">Dress code</p>
  <p class="rs-sub">Màu sắc trang phục gợi ý</p>
  <ul class="rs-swatches">${D.dressCode.map(s => `<li style="background:${e(s.color)}" title="${e(s.name)}"><span class="sr-only">${e(s.name)}</span></li>`).join('')}</ul>
</div>`);

// ---------- 6. calendar + countdown ----------
EA.section('saveDate', c => {
  const { y, m, d, ui, data: D, esc: e } = c;
  const first = new Date(Date.UTC(+y, +m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(+y, +m, 0)).getUTCDate();
  const lead = (first + 6) % 7;
  const cells = [...Array(lead).fill(''), ...Array.from({ length: days }, (_, i) => i + 1)];
  return `<div class="wrap narrow">
  <div class="rs-cal-head"><p class="rs-script">Tháng ${m}</p><p class="yr">${y}</p></div>
  <div class="rs-cal" style="--bgimg:url('${e(new URL(D.photos[2]?.src || c.config.couple.heroImage || '', location.href).href)}')">
    <div class="rs-cal-grid" role="table" aria-label="Tháng ${+m} năm ${y}">
      ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w, i) => `<span class="w${i > 4 ? ' we' : ''}">${w}</span>`).join('')}
      ${cells.map((n, i) => `<span class="${(i % 7) > 4 ? 'we' : ''}${n === +d ? ' on' : ''}">${n === +d ? `${n}<i>${icon('heart')}</i>` : n ? String(n).padStart(2, '0') : ''}</span>`).join('')}
    </div>
  </div>
  <p class="rs-hearts" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<span class="${i % 2 ? 'o' : ''}">${icon('heart')}</span>`).join('')}</p>
  <p class="rs-count-lead">Cùng đếm ngược thời gian với chúng tôi nha!</p>
  ${ui.countdown()}
</div>`;
});

// ---------- 7. timeline ----------
EA.section('schedule', ({ data: D, esc: e }) => `<div class="wrap narrow">
  <p class="rs-script big">Timeline</p>
  <ol class="rs-tl">
    ${D.itinerary.map((it, i) => `<li><time>${e(it.time)}</time><span class="ic">${icon(it.icon || ICON_ORDER[i % ICON_ORDER.length])}</span><span class="tt">${e(it.title)}</span></li>`).join('')}
  </ol>
</div>`);

// ---------- 8. guestbook: sign, place the signature on the photo, write a wish ----------
EA.section('guestbook', ({ data: D, esc: e, config }) => `<div class="wrap narrow">
  <p class="rs-kicker">Sổ lưu bút</p>
  <p class="rs-script big">Gửi Lời Chúc</p>
  <p class="rs-divider" aria-hidden="true"><span>${icon('heart')}</span></p>
  <p class="rs-italic">Những lời chúc mừng hạnh phúc</p>
  <div class="rs-book">
    <div class="board"><img src="${e(D.photos[3]?.src || config.couple.heroImage)}" alt="Ảnh để khách ký tên"><div class="sigs"></div><p class="board-hint">Hãy là người đầu tiên ký tên!</p></div>
    <div class="place-bar" hidden>
      <label>Cỡ chữ ký <input type="range" min="14" max="50" step="1" aria-label="Cỡ chữ ký"></label>
      <div class="row"><button class="btn ghost" type="button" data-act="redo">Ký lại</button><button class="btn" type="button" data-act="here">Đặt ở đây</button></div>
    </div>
    <button class="btn sign-btn" type="button">${icon('heart')} Ký tên</button>
    <p class="steps"><b>1</b> Ký tên · <b>2</b> Chọn vị trí · <b>3</b> Viết lời chúc &amp; gửi</p>
    <ul class="rs-wishes"></ul>
  </div>
  <dialog class="sig-dlg">
    <form method="dialog" class="sig-step s1">
      <p class="rs-h">Ký tên của bạn</p>
      <canvas class="pad" width="600" height="300" aria-label="Khung ký tên, dùng ngón tay hoặc chuột để ký"></canvas>
      <div class="row"><button class="btn ghost" type="button" data-act="clear">Ký lại</button><button class="btn" type="button" data-act="next">Tiếp tục</button></div>
      <button class="x" value="cancel" aria-label="Đóng">×</button>
    </form>
    <form method="dialog" class="sig-step s3" hidden>
      <p class="rs-h">Lời chúc</p>
      <label class="field"><span>Tên của bạn</span><input name="name" required maxlength="60" autocomplete="name"></label>
      <label class="field"><span>Lời chúc</span><textarea name="message" rows="3" required maxlength="300"></textarea></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn" type="button" data-act="send">Gửi lời chúc</button>
      <button class="x" value="cancel" aria-label="Đóng">×</button>
    </form>
  </dialog>
</div>`);

// ---------- 9. album: magazine mosaic with the title inside the grid ----------
// Slots for the first photos; the rest continue in pairs.
const ALBUM_SLOTS = ['full', 'third', 'TITLE', 'tall', 'wide', 'side', 'half', 'half', 'half', 'half', 'full'];
EA.section('gallery', ({ data: D, ui }) => {
  let i = 0;
  const cells = ALBUM_SLOTS.map(slot => slot === 'TITLE'
    ? '<div class="alb-title"><p class="rs-script big">Album</p><span></span><p class="alb-sub">Ảnh cưới</p></div>'
    : (D.photos[i] ? `<div class="alb ${slot}">${ui.photo(D.photos[i], i++)}</div>` : '')).join('');
  const rest = D.photos.slice(i).map((p, k) => `<div class="alb half">${ui.photo(p, i + k)}</div>`).join('');
  return `<div class="rs-album">${cells}${rest}</div>`;
});

// ---------- 10. RSVP ----------
EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  <div class="rs-frame">${CORNERS}
    <p class="rs-thin">Xác Nhận Tham Dự</p>
    <div class="rs-rsvp">${ui.rsvpForm()
      .replace('Mình sẽ đến', `<i class="ok">${ICO_OK}</i><small>Có, tôi sẽ</small> tham dự`)
      .replace('Tiếc quá, mình không đến được', `<i class="no">${ICO_NO}</i><small>Rất tiếc,</small> chưa sắp xếp được`)}</div>
  </div>
</div>`);

// ---------- 11. gift: a red packet with coins falling in; tap opens the QR sheet ----------
const DL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>';
EA.section('gift', ({ esc: e, mod, config: { couple: cp } }) => {
  const accs = mod.content.accounts || [];
  const byRole = r => accs.find(a => (a.role || '').toLowerCase().includes(r));
  const col = (label, a, name) => a ? `
    <div class="qr-col">
      <p class="qr-lbl">${label}</p>
      <div class="qr-card">${a.qr ? `<img src="${e(a.qr)}" alt="Mã QR chuyển khoản ${e(a.bank)}">` : `<div class="qr-none"><b>${e(a.bank)}</b><span>${e(a.number)}</span><small>${e(a.owner)}</small></div>`}</div>
      ${a.qr ? `<a class="qr-dl" href="${e(a.qr)}" download>${DL_ICON} Tải mã QR</a>` : `<button class="qr-dl" type="button" data-copy="${e(a.number.replace(/\s/g, ''))}">${DL_ICON} Sao chép số TK</button>`}
      <p class="qr-name">${e(name)}</p>
    </div>` : '';
  return `<div class="wrap narrow">
  <div class="rs-frame">${CORNERS}
    <p class="rs-thin">Hộp Mừng Cưới</p>
    <button class="packet-btn" type="button" aria-haspopup="dialog" aria-label="Mở hộp mừng cưới">
      <span class="coins" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<i style="--i:${i}">$</i>`).join('')}</span>
      <span class="packet" aria-hidden="true"><span class="p-roof"></span><span class="p-ring"><span>囍</span></span><i class="d1"></i><i class="d2"></i><i class="d3"></i><i class="d4"></i></span>
    </button>
    <p class="rs-p small">${e(mod.content.message || 'Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi')}</p>
  </div>
  <dialog class="gift-dlg" aria-label="Mừng cưới">
    <button class="gift-x" type="button" aria-label="Đóng">×</button>
    <p class="gift-title">Mừng Cưới</p>
    <div class="qr-cols">${col('Chú rể', byRole('rể') || accs[1], cp.groomName)}${col('Cô dâu', byRole('dâu') || accs[0], cp.brideName)}</div>
  </dialog>
</div>`;
});

// ---------- 12. closing photo ----------
EA.section('thanks', ({ esc: e, mod, config, icon: ic }) => `<figure class="rs-end">
  <img src="${e(mod.content.image || config.couple.heroImage)}" alt="" loading="lazy">
  <figcaption>Rất hân hạnh được đón tiếp</figcaption>
  <button class="rs-reopen" type="button" id="reopen">${ic('replay')} Mở lại thiệp</button>
</figure>`);

// ---------- behaviour ----------
EA.afterRender((c, main) => {
  // Nhà gái / Nhà trai tabs
  main.querySelectorAll('.rs-tabs').forEach(tabs => tabs.addEventListener('click', ev => {
    const b = ev.target.closest('[data-tab]'); if (!b) return;
    tabs.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    tabs.nextElementSibling.dataset.show = b.dataset.tab;
  }));

  // staggered reveal for the trio of photos and timeline rows
  if ('IntersectionObserver' in window && !c.reduced) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); } }), { threshold: .2 });
    main.querySelectorAll('.rs-trio, .rs-tl, .rs-album, .rs-cal, .rs-pair').forEach(el => io.observe(el));
  } else main.querySelectorAll('.rs-trio, .rs-tl, .rs-album, .rs-cal, .rs-pair').forEach(el => el.classList.add('seen'));

  // gift sheet
  const gdlg = main.querySelector('.gift-dlg');
  main.querySelector('.packet-btn')?.addEventListener('click', () => gdlg.showModal());
  gdlg?.addEventListener('click', e => { if (e.target === gdlg || e.target.closest('.gift-x')) gdlg.close(); });

  wireSignatures(c, main);
});

function wireSignatures(c, main) {
  const book = main.querySelector('.rs-book'); if (!book) return;
  const board = book.querySelector('.board'), sigs = board.querySelector('.sigs'), list = book.querySelector('.rs-wishes');
  const hint = board.querySelector('.board-hint'), place = book.querySelector('.place-bar');
  const dlg = main.querySelector('.sig-dlg'), pad = dlg.querySelector('.pad'), g = pad.getContext('2d');
  const samples = c.mods.guestbook?.content?.samples || [];
  let draft = null, ghost = null;

  const draw = () => {
    const all = EA.list('guestbook').filter(w => w.message);
    sigs.innerHTML = all.filter(w => w.sig).map(w => `<img src="${w.sig}" alt="Chữ ký của ${esc(w.name)}" style="left:${+w.x}%;top:${+w.y}%;width:${+(w.w || 26)}%">`).join('');
    hint.hidden = all.some(w => w.sig);
    list.innerHTML = [...all.slice().reverse(), ...samples].map(w => `<li><p>${esc(w.message)}</p><p class="by">— ${esc(w.name)}</p></li>`).join('')
      || '<li class="empty">Chưa có lời chúc nào. Hãy là người đầu tiên!</li>';
  };
  draw();

  // step 1: draw the signature
  let drawing = false, drew = false;
  const pos = e => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * pad.width / r.width, (e.clientY - r.top) * pad.height / r.height]; };
  const reset = () => { g.clearRect(0, 0, pad.width, pad.height); g.lineWidth = 5; g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#8f0f22'; drew = false; };
  pad.addEventListener('pointerdown', e => { drawing = true; pad.setPointerCapture(e.pointerId); g.beginPath(); g.moveTo(...pos(e)); });
  pad.addEventListener('pointermove', e => { if (!drawing) return; g.lineTo(...pos(e)); g.stroke(); drew = true; });
  pad.addEventListener('pointerup', () => { drawing = false; });
  const openPad = () => { reset(); dlg.querySelector('.s1').hidden = false; dlg.querySelector('.s3').hidden = true; dlg.showModal(); };
  book.querySelector('.sign-btn').addEventListener('click', openPad);

  // step 2: the signature sits on the photo; drag it anywhere, resize it, then confirm
  const apply = () => Object.assign(ghost.style, { left: draft.x + '%', top: draft.y + '%', width: draft.w + '%' });
  const startPlacing = () => {
    ghost = Object.assign(document.createElement('img'), { src: draft.sig, className: 'ghost', alt: 'Chữ ký của bạn, kéo để di chuyển' });
    Object.assign(draft, { x: 37, y: 45, w: 26 });
    board.appendChild(ghost); apply();
    board.classList.add('placing');
    hint.hidden = false; hint.textContent = 'Kéo chữ ký tới vị trí bạn thích';
    place.hidden = false; place.querySelector('input').value = draft.w;
    board.scrollIntoView({ behavior: c.reduced ? 'auto' : 'smooth', block: 'center' });
    let drag = null;
    ghost.addEventListener('pointerdown', e => {
      e.preventDefault(); ghost.setPointerCapture(e.pointerId);
      const r = board.getBoundingClientRect();
      drag = { dx: e.clientX - r.left - draft.x / 100 * r.width, dy: e.clientY - r.top - draft.y / 100 * r.height };
    });
    ghost.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = board.getBoundingClientRect(), gh = ghost.getBoundingClientRect();
      draft.x = Math.min(100 - gh.width / r.width * 100, Math.max(0, (e.clientX - r.left - drag.dx) / r.width * 100));
      draft.y = Math.min(100 - gh.height / r.height * 100, Math.max(0, (e.clientY - r.top - drag.dy) / r.height * 100));
      apply();
    });
    ghost.addEventListener('pointerup', () => { drag = null; });
    // resizing keeps the signature inside the photo
    place.querySelector('input').oninput = e => {
      draft.w = +e.target.value; apply();
      const r = board.getBoundingClientRect(), gh = ghost.getBoundingClientRect();
      draft.x = Math.min(draft.x, 100 - gh.width / r.width * 100);
      draft.y = Math.min(draft.y, 100 - gh.height / r.height * 100);
      apply();
    };
  };
  const stopPlacing = () => {
    ghost?.remove(); ghost = null; board.classList.remove('placing'); place.hidden = true;
    hint.textContent = 'Hãy là người đầu tiên ký tên!'; draw();
  };

  place.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'redo') { stopPlacing(); openPad(); }
    if (act === 'here') {
      draft.x = Math.round(draft.x * 10) / 10; draft.y = Math.round(draft.y * 10) / 10;
      board.classList.remove('placing'); place.hidden = true; hint.hidden = true;
      // step 3: the wish
      dlg.querySelector('.s1').hidden = true; dlg.querySelector('.s3').hidden = false;
      const f = dlg.querySelector('.s3'); if (c.guest !== c.data.defaultGuest) f.elements['name'].value = c.guest;
      dlg.showModal();
    }
  });

  dlg.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'clear') reset();
    if (act === 'next') { if (!drew) return; draft = { sig: pad.toDataURL('image/png') }; dlg.close(); startPlacing(); }
    if (act === 'send') {
      const f = dlg.querySelector('.s3'), name = f.elements['name'].value.trim(), message = f.message.value.trim();
      const err = f.querySelector('.form-error');
      if (!name || !message) { err.textContent = 'Điền tên và lời chúc giúp chúng tôi nhé.'; err.hidden = false; return; }
      err.hidden = true;
      EA.store('guestbook', { name, message, sig: draft.sig, x: draft.x, y: draft.y, w: draft.w })
        .then(() => { draft = null; f.reset(); dlg.close(); stopPlacing(); });
    }
  });
  // closing the wish dialog without sending returns to positioning
  dlg.addEventListener('cancel', () => { if (ghost) { board.classList.add('placing'); place.hidden = false; hint.hidden = false; } });
}

// ---------- motion helpers ----------
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const GOLD = ['#fff1c4', '#f6d27a', '#e9b94f', '#ffe39a'];

// gold dust: ambient motes drift up and settle; burst() throws a fan of glitter / coins from a point
function dustSpec(M, o = {}) {
  return {
    count: o.count || 60,
    init: (p, i, w, h) => {
      p.x = rnd(0, w); p.y = o.fall ? rnd(-h * .1, h * .6) : rnd(0, h); p.r = rnd(.7, 2.3); p.ph = rnd(0, 6.28); p.sp = rnd(.0012, .004);
      p.vx = rnd(-.008, .008); p.vy = (o.fall ? 1 : -1) * rnd(.006, .026); p.col = GOLD[(Math.random() * GOLD.length) | 0]; p.a = rnd(.35, 1);
    },
    step: (p, dt, w, h) => {
      if (p.burst) {
        p.vy += .00095 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        return p.life < p.ttl && p.y < h + 30;
      }
      p.x += (p.vx + Math.sin(p.life * .0007 + p.ph) * .01) * dt; p.y += p.vy * dt;
      if (o.fall && p.y > h * .86) p.a -= dt * .0006;       // settles and fades near the bottom
      return !(p.y < -10 || p.y > h + 10 || p.x < -10 || p.x > w + 10 || p.a <= 0);
    },
    draw: (g, p) => {
      if (p.burst) {
        const k = 1 - p.life / p.ttl; g.globalAlpha = clamp(k * 1.4) * p.a; g.fillStyle = p.col;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        if (p.coin) { g.scale(Math.abs(Math.cos(p.life * .01 + p.ph)) * .8 + .2, 1); g.beginPath(); g.arc(0, 0, p.r * 1.8, 0, 6.2832); g.fill(); g.strokeStyle = 'rgba(138,101,38,.8)'; g.lineWidth = 1; g.stroke(); }
        else { g.beginPath(); g.moveTo(0, -p.r * 2); g.lineTo(p.r * .7, 0); g.lineTo(0, p.r * 2); g.lineTo(-p.r * .7, 0); g.closePath(); g.fill(); }
        g.restore(); g.globalAlpha = 1; return;
      }
      const tw = .5 + .5 * Math.sin(p.life * p.sp * 3 + p.ph);
      g.globalAlpha = p.a * tw * (o.dim || 1); g.fillStyle = p.col;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill();
      if (p.r > 1.7 && tw > .8) { g.fillRect(p.x - p.r * 2.6, p.y - .4, p.r * 5.2, .8); g.fillRect(p.x - .4, p.y - p.r * 2.6, .8, p.r * 5.2); }
      g.globalAlpha = 1;
    }
  };
}
const burstInit = (x, y, coin) => (p) => {
  const a = rnd(-Math.PI * .95, -Math.PI * .05), s = rnd(.12, coin ? .5 : .62);
  p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.r = rnd(1.1, coin ? 3.4 : 2.8); p.ttl = rnd(1100, 2400); p.rot = rnd(0, 6.28); p.vr = rnd(-.01, .01);
  p.ph = rnd(0, 6.28); p.col = GOLD[(Math.random() * GOLD.length) | 0]; p.a = 1; p.coin = coin;
};

// a fixed full-screen layer for one-off bursts (RSVP finale, easter egg); removes itself when idle
let fxState = null;
function goldBurst(x, y, n = 70, coin = false) {
  const M = MO(); if (!M || M.reduced) return;
  if (!fxState) {
    const cv = document.createElement('canvas'); cv.className = 'rs-fx ea-mo-canvas'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const base = dustSpec(M, { count: 1 });
    const spec = {
      count: 1, init: p => { p.x = -99; p.y = -99; p.vx = p.vy = 0; p.r = 0; p.a = 0; p.ph = 0; p.sp = 0; p.col = '#fff'; },
      step: (p, dt) => (p.burst ? base.step(p, dt, innerWidth, innerHeight) : true), draw: (g, p) => { if (p.burst) base.draw(g, p); }
    };
    fxState = { cv, sys: M.particles(cv, spec), timer: 0 };
  }
  fxState.sys.burst(n, burstInit(x, y, coin));
  clearTimeout(fxState.timer);
  fxState.timer = setTimeout(() => { fxState.sys.stop(); fxState.cv.remove(); fxState = null; }, 3200);
}

// ---------- the wax seal: two halves along a jagged crack line ----------
const CRACK = 'M50 1 L45.5 18 L55 34 L44.5 52 L54 70 L47.5 86 L51 99';
const CLIP_L = 'polygon(0 0,50% 0,45.5% 18%,55% 34%,44.5% 52%,54% 70%,47.5% 86%,51% 100%,0 100%)';
const CLIP_R = 'polygon(50% 0,100% 0,100% 100%,51% 100%,47.5% 86%,54% 70%,44.5% 52%,55% 34%,45.5% 18%)';
const sealHalves = () => `<span class="half l"><span class="face" style="clip-path:${CLIP_L}"><i>囍</i></span></span><span class="half r"><span class="face" style="clip-path:${CLIP_R}"><i>囍</i></span></span>`;

// ---------- cover: hold the seal until it cracks ----------
let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  el.className = 'cover rc-cover'; el.style.cssText = '';
  el.innerHTML = `
    <canvas class="rc-dust ea-mo-canvas" aria-hidden="true"></canvas>
    <div class="rc-glow" aria-hidden="true"></div>
    <div class="rc-stage">
      <header class="rc-top"><p class="rc-kicker">Thiệp mời cưới</p><p class="rc-to">Gửi <b>${e(c.guest)}</b></p></header>
      <div class="rc-envwrap">
        <div class="rc-env">
          <span class="rc-back"></span>
          <span class="rc-card" aria-hidden="true"><span class="rc-card-in">
            <i class="hy">囍</i><small>Trân trọng kính mời</small>
            <b>${e(c.config.couple.groomName)}</b><em>&amp;</em><b>${e(c.config.couple.brideName)}</b>
            <small>${c.d} · ${c.m} · ${c.y}</small></span></span>
          <span class="rc-front"></span>
          <span class="rc-flap"></span>
          <button class="rc-seal" type="button" aria-label="Nhấn giữ con dấu son để bóc niêm phong">
            <svg class="rc-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" pathLength="1" fill="none"/></svg>
            <span class="face whole"><i>囍</i></span>${sealHalves()}
            <svg class="rc-crack" viewBox="0 0 100 100" aria-hidden="true"><path d="${CRACK}" pathLength="1"/><path class="b" d="M45 51 L30 58 L21 52 M55 34 L72 28 L81 36" pathLength="1"/></svg>
          </button>
        </div>
      </div>
      <footer class="rc-bot">
        <p class="rc-names">${e(c.config.couple.groomName)} <span>&amp;</span> ${e(c.config.couple.brideName)}</p>
        <p class="rc-date">${c.dow} · ${c.d}.${c.m}.${c.y}</p>
        <p class="rc-hint">Nhấn giữ con dấu son để bóc thiệp</p>
        <button class="open-btn" type="button">Bóc niêm phong</button>
      </footer>
    </div>
    <div class="rc-flash" aria-hidden="true"></div>`;

  const $ = s => el.querySelector(s);
  const seal = $('.rc-seal'), env = $('.rc-env'), card = $('.rc-card'), flash = $('.rc-flash'), hint = $('.rc-hint');
  const stops = []; let cracked = false, ended = false, started = false, tickAt = 0;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const setP = p => el.style.setProperty('--p', p.toFixed(3));
  const gesture = () => { if (started) return; started = true; EA.music(); M.requestTilt(); };

  // ambient: gold dust drifts up behind everything, the envelope leans with the phone
  const ds = dustSpec(M, { count: 70 });
  const sys = M.particles($('.rc-dust'), ds); stops.push(() => sys.stop());
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!cracked) { el.style.setProperty('--tx', x); el.style.setProperty('--ty', y); } }));

  const center = node => { const r = node.getBoundingClientRect(), f = el.getBoundingClientRect(); return [r.left + r.width / 2 - f.left, r.top + r.height / 2 - f.top]; };

  // 1) the hold: the seal trembles, a crack runs across it, a ring fills
  M.hold(seal, 1500, {
    onProgress: p => {
      if (cracked) return;
      el.classList.toggle('holding', p > 0);
      setP(p);
      const j = p * p * 2.6;
      el.style.setProperty('--jx', `${((Math.random() - .5) * j).toFixed(2)}px`); el.style.setProperty('--jy', `${((Math.random() - .5) * j).toFixed(2)}px`);
      const k = Math.floor(p * 5);
      if (p > 0 && k > tickAt) { tickAt = k; M.haptic(k >= 4 ? 'crack' : 'tap'); M.tone(k >= 4 ? 'thud' : 'click'); }
      if (p === 0) tickAt = 0;
    },
    onDone: () => crack(),
    onCancel: () => { if (cracked) return; seal.classList.remove('nudge'); void seal.offsetWidth; seal.classList.add('nudge'); hint.classList.add('hot'); }
  });
  seal.addEventListener('pointerdown', gesture);
  // accessible fallback: the visible button breaks the seal in one go
  $('.open-btn').addEventListener('click', () => { gesture(); if (!cracked) { M.tween(0, 1, c.reduced ? 0 : 520, 'inOut', setP).then(crack); } }, { once: true });

  // 2) the crack: flash + gold burst, seal halves fall, flap opens, card rises in gold dust, then fills the screen
  function crack() {
    if (cracked || ended) return; cracked = true;
    const [sx, sy] = center(seal);
    flash.style.left = `${sx}px`; flash.style.top = `${sy}px`;
    el.classList.add('cracked');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    M.haptic('crack'); M.tone('thud');
    sys.burst(90, burstInit(sx, sy, false));
    c.after(140, () => { M.tone('whoosh'); el.classList.add('flap-open'); });
    c.after(760, () => { el.classList.add('rise'); M.tone('chime'); M.haptic('success'); sys.burst(60, burstInit(...center(card), false)); });
    c.after(1500, () => el.classList.add('rise2'));
    c.after(2250, () => {
      const r = card.getBoundingClientRect(), f = el.getBoundingClientRect();
      const k = Math.min(f.width * .92 / r.width, f.height * .62 / r.height);
      el.style.setProperty('--fx', `${(f.left + f.width / 2 - (r.left + r.width / 2)).toFixed(1)}px`);
      el.style.setProperty('--fy', `${(f.top + f.height * .46 - (r.top + r.height / 2)).toFixed(1)}px`);
      el.style.setProperty('--fk', k.toFixed(3));
      el.classList.add('fly'); M.tone('whoosh');
    });
    c.after(3350, () => { M.haptic('success'); sys.burst(70, burstInit(...center(card), true)); });
    c.after(3900, () => { if (ended) return; open(); setTimeout(stopCover, 1200); });
  }
});

// ---------- add-ons, ambience, easter egg, finale (after render) ----------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data, cp = c.config.couple;
  const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}.${m[2]}.${m[1]}` : `${m[2]} · ${m[1]}`) : ''; };
  const nick = k => P.get(`traits.${k}.nickname`, '');
  const adds = [];

  // 1. Song Hỷ + monogram; hometowns and days together when the couple told us
  const ht = P.get('hometowns', {}), both = ht.bride && ht.groom;
  adds.push(['hy', 'families', `<div class="wrap">
    <p class="rs-kicker">Song Hỷ</p>
    <div class="hy-seal" role="img" aria-label="Chữ Song Hỷ với tên viết tắt ${e(D.monogram)}">
      <span class="hy-big" aria-hidden="true">囍</span>
      <span class="hy-mono" aria-hidden="true">${e(D.monogram)}</span>
    </div>
    ${both || P.daysTogether != null ? `<div class="hy-sides">
      ${both ? `<div><p class="lbl">Nhà trai</p><p class="town">${e(ht.groom)}</p></div><span class="hy-knot" aria-hidden="true">${c.icon('heart')}</span><div><p class="lbl">Nhà gái</p><p class="town">${e(ht.bride)}</p></div>` : ''}
    </div>` : ''}
    <p class="rs-p">${both ? `Hai miền quê, một mái nhà.` : 'Hai tên, một mái nhà.'}${P.daysTogether != null ? ` Đã bên nhau <b>${fmt(P.daysTogether)}</b> ngày để đi đến hôm nay.` : ''}</p>
  </div>`]);

  // 2. a spoken invitation from each set of parents (speech synthesis; text is always shown)
  const tts = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const fam = (side, label, who, child, other) => {
    const f = D[`${side}Family`]; if (!f || !f.father) return '';
    const msg = `Gia đình chúng tôi, ông ${f.father} và bà ${f.mother}, trân trọng kính mời ${c.guest} đến dự lễ thành hôn của ${who} chúng tôi, ${child}, và ${other}, vào ngày ${+c.d} tháng ${+c.m} năm ${c.y}. Sự hiện diện của ${c.guest} là niềm vinh hạnh của gia đình.`;
    return `<article class="vc" data-say="${e(msg)}">
      <p class="lbl">${e(f.label || label)}</p>
      <p class="vc-n">Ông ${e(f.father)} &amp; bà ${e(f.mother)}</p>
      ${tts ? `<button class="vc-play" type="button" aria-pressed="false" aria-label="Nghe lời mời của ${e(f.label || label)}"><span class="i-play">${c.icon('play')}</span><span class="i-stop">${c.icon('pause')}</span></button>
      <div class="vc-bars" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>` : ''}
      <p class="vc-t">${e(msg)}</p>
    </article>`;
  };
  const vcs = fam('groom', 'Nhà trai', 'con trai', cp.groomName, cp.brideName) + fam('bride', 'Nhà gái', 'con gái', cp.brideName, cp.groomName);
  if (vcs) adds.push(['voice', 'invitation', `<div class="wrap">
    <p class="rs-kicker">Lời mời từ hai họ</p><p class="rs-script">Lời mời của gia đình</p>
    <div class="vc-grid">${vcs}</div></div>`]);

  // 3. the red thread: how we met, where we went, the proposal (personality)
  const places = P.get('places', []).filter(p => p && p.name);
  const steps = [];
  if (P.has('metDate')) steps.push({ d: dmy(P.get('metDate')), t: 'Chúng mình gặp nhau', x: [P.get('metPlace', ''), P.get('metCity', '')].filter(Boolean).join(', ') });
  places.filter(p => p.name !== P.get('metPlace')).forEach(p => steps.push({ d: dmy(p.date || ''), t: p.name, x: '' }));
  if (P.has('proposal')) steps.push({ d: '', t: 'Lời cầu hôn', x: P.get('proposal') });
  if (steps.length) {
    steps.push({ d: `${c.d}.${c.m}.${c.y}`, t: 'Về chung một nhà', x: '' });
    adds.push(['thread', 'saveDate', `<div class="wrap">
      <p class="rs-kicker">Duyên khởi</p><p class="rs-script">Sợi chỉ hồng</p>
      ${P.daysTogether != null ? `<p class="rs-p th-days"><b>${fmt(P.daysTogether)}</b> ngày kể từ lần đầu gặp nhau</p>` : ''}
      <ol class="th"><i class="th-line" aria-hidden="true"></i>
        ${steps.map((s, i) => `<li style="--i:${i}"><span class="th-knot" aria-hidden="true">${c.icon('heart')}</span><div>${s.d ? `<time>${e(s.d)}</time>` : ''}<h3>${e(s.t)}</h3>${s.x ? `<p>${e(s.x)}</p>` : ''}</div></li>`).join('')}
      </ol></div>`]);
  }

  // 4. câu đối from the couple's song (or a quote)
  const lyric = P.get('song.lyric', '') || P.get('quote.text', '');
  if (lyric) {
    const txt = lyric.replace(/[.\s]+$/, ''), cut = txt.indexOf(','), mid = txt.split(' ');
    const a = cut > 0 ? txt.slice(0, cut) : mid.slice(0, Math.ceil(mid.length / 2)).join(' '), b = cut > 0 ? txt.slice(cut + 1).trim() : mid.slice(Math.ceil(mid.length / 2)).join(' ');
    const cap = P.has('song.title') ? `“${e(P.get('song.title'))}” · ${e(P.get('song.artist', ''))}` : e(P.get('quote.author', ''));
    adds.push(['couplet', 'gift', `<div class="wrap">
      <p class="rs-kicker">Đôi câu đối</p>
      <div class="cd"><blockquote class="cd-b">${e(a)}</blockquote><i class="cd-hy" aria-hidden="true">囍</i><blockquote class="cd-b">${e(b)}</blockquote></div>
      ${cap.replace(/[·\s]+$/, '') ? `<p class="rs-sub cd-cap">${cap}</p>` : ''}
    </div>`]);
  }
  adds.forEach(([id, after, html]) => {
    const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} rs-add`; s.innerHTML = html;
    const a = main.querySelector(`#${after}`) || main.lastElementChild; a.insertAdjacentElement('afterend', s);
  });

  // ---- voice cards
  let speaking = null;
  const stopSay = () => { try { speechSynthesis.cancel(); } catch { /* */ } if (speaking) { speaking.card.classList.remove('on'); speaking.btn.setAttribute('aria-pressed', 'false'); clearTimeout(speaking.t); speaking = null; } };
  main.querySelectorAll('.vc-play').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.vc');
    if (speaking && speaking.card === card) return stopSay();
    stopSay();
    M.tone('pop'); M.haptic('tap');
    const u = new SpeechSynthesisUtterance(card.dataset.say); u.lang = 'vi-VN'; u.rate = .92;
    const v = speechSynthesis.getVoices().find(x => /^vi/i.test(x.lang)); if (v) u.voice = v;
    const cur = { card, btn, t: setTimeout(stopSay, Math.min(40000, card.dataset.say.length * 75 + 1500)) };
    u.onend = u.onerror = () => { if (speaking === cur) stopSay(); };
    speaking = cur; card.classList.add('on'); btn.setAttribute('aria-pressed', 'true');
    try { speechSynthesis.speak(u); } catch { /* */ }
  }));
  addEventListener('pagehide', stopSay);

  // ---- ambient: gold dust settles over the hero; the envelope and Song Hỷ foil follow the tilt
  const top = main.querySelector('.rs-top'), cv = top?.querySelector('.rs-dust');
  if (cv) {
    M.particles(cv, dustSpec(M, { count: 46, fall: true, dim: .85 }));
    if (M.tier !== 'low') M.tilt(({ x, y }) => { top.style.setProperty('--tx', x); top.style.setProperty('--ty', y); main.style.setProperty('--tx', x); });
  }
  main.querySelectorAll('.hy-seal, .cd, .th, .vc-grid').forEach(n => M.inView(n, () => n.classList.add('in'), { threshold: .3 }));
  const th = main.querySelector('.th');
  if (th && M.tier !== 'low') M.scrollProgress(th, p => th.style.setProperty('--tp', clamp((p - .12) / .5).toFixed(3)));
  else th?.style.setProperty('--tp', 1);

  // ---- easter egg: tap the broken seal three times and it rains lộc
  let n = 0, t0 = 0;
  const pieces = top?.querySelector('.wax-bits');
  pieces?.addEventListener('click', () => {
    const now = Date.now(); n = now - t0 < 2000 ? n + 1 : 1; t0 = now; M.tone('pop'); M.haptic('tap');
    pieces.classList.remove('wob'); void pieces.offsetWidth; pieces.classList.add('wob');
    if (n < 3) return; n = 0;
    const r = pieces.getBoundingClientRect(); goldBurst(r.left + r.width / 2, r.top, 110, true);
    M.tone('chime'); M.haptic('success');
    const names = [nick('groom'), nick('bride')].filter(Boolean).join(' & ');
    const t = document.createElement('p'); t.className = 'rs-loc'; t.setAttribute('role', 'status');
    t.textContent = names ? `Phát lộc! ${names} gửi bạn một bao lì xì may mắn.` : 'Phát lộc! Chúc bạn một năm vạn sự như ý.';
    document.body.appendChild(t); setTimeout(() => t.remove(), 3600);
  });

  // ---- finale: the reply is sealed with a gold stamp
  EA.onRsvp(entry => {
    M.tone('thud'); M.haptic('crack');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling; if (!f.hidden || !done || done.previousElementSibling?.classList.contains('rs-stamp')) return;
        done.insertAdjacentHTML('beforebegin', `<div class="rs-stamp" aria-hidden="true"><span class="face"><i>囍</i></span></div>`);
        done.classList.add('rs-done');
        const r = f.parentElement.getBoundingClientRect(); done.scrollIntoView({ block: 'center', behavior: c.reduced ? 'auto' : 'smooth' });
        setTimeout(() => { const s = main.querySelector('.rs-stamp'); if (s) { const q = s.getBoundingClientRect(); goldBurst(q.left + q.width / 2, q.top + q.height / 2, 80, false); M.tone('chime'); } }, 520);
      });
    }, 40);
  });
});
