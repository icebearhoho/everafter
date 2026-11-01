// Bìa Tạp Chí "Lứa Đôi": tạp chí cưới. Vuốt để lật từng trang, các trang ruột lướt qua rất nhanh rồi dừng ở
// bìa chuyên đề của riêng bạn, tiêu đề tự gõ ra từ hồ sơ cặp đôi. Cuộn trang = lật trang.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dmyLong = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : ''; };
const BAR = (() => { let h = 7, o = ''; for (let i = 0, x = 0; i < 26; i++) { h = (h * 33 + 11) % 97; const w = 1 + (h % 3); o += `<rect x="${x}" y="0" width="${w}" height="30"/>`; x += w + 1 + (h % 2); } return o; })();
const ARROW = '<svg class="ea-icon" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

// Tiêu đề bìa viết từ hồ sơ (thiếu hồ sơ thì dùng câu mặc định)
function coverLines(c) {
  const P = c.p, D = c.data, cp = c.config.couple, out = [];
  const pr = P.get('proposal');
  if (pr) {
    const ib = pr.indexOf(D.bride.short), ig = pr.indexOf(D.groom.short);
    const who = ib >= 0 && (ig < 0 || ib < ig) ? D.bride.short : D.groom.short;
    out.push({ k: 'Độc quyền', t: `${who} đã cầu hôn thế nào` });
  }
  if (P.has('metPlace')) out.push({ k: 'Chuyện chưa kể', t: `Lần đầu gặp nhau ở ${P.get('metPlace')}` });
  if (P.daysTogether != null) out.push({ k: 'Con số', t: `${fmt(P.daysTogether)} ngày bên nhau, và hơn thế nữa` });
  if (P.has('song.title')) out.push({ k: 'Nhạc nền', t: `Bài hát của đôi mình: “${P.get('song.title')}”` });
  if (P.has('pet.name')) out.push({ k: 'Thành viên thứ ba', t: `${P.get('pet.name')}, chú ${P.get('pet.kind', 'bé cưng')} làm chứng cho tình yêu` });
  const pl = P.get('places', []); if (pl.length > 1) out.push({ k: 'Hành trình', t: `${pl.length} điểm đến, một lời hẹn ước` });
  if (P.has('insideJoke')) out.push({ k: 'Hậu trường', t: 'Bí mật sau trò đùa chỉ hai người hiểu' });
  [{ k: 'Số đặc biệt', t: `Hôn lễ ngày ${c.d}.${c.m}.${c.y}${cp.city ? ` tại ${cp.city}` : ''}` }, { k: 'Độc quyền', t: 'Bộ ảnh cưới lần đầu công bố' }, { k: 'Thư mời', t: `Gửi riêng tới ${c.guest}` }].forEach(x => { if (out.length < 3) out.push(x); });
  return out.slice(0, 4);
}

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c, lines = coverLines(c);
  const photo = e(D.photos[0]?.src || c.config.couple.heroImage || '');
  const photo2 = e(D.photos[1]?.src || photo);
  const issue = `Số cưới · Tháng ${+c.m} · ${c.y}`;
  const mast = '<p class="logo">Lứa Đôi</p>';
  const leaves = [
    `<div class="pg p-toc"><p class="pk">Trong số này</p><ol>${['Thư ngỏ từ hai nhân vật chính', 'Chuyện tình trong ba chương', 'Phỏng vấn độc quyền', 'Ngày vui và lịch trình', 'Phiếu trả lời'].map((t, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${t}</span></li>`).join('')}</ol></div>`,
    `<div class="pg p-photo"><img src="${photo2}" alt=""><p class="big">${c.d}</p><p class="pk">${c.dow} · Tháng ${+c.m}</p></div>`,
    `<div class="pg p-quote"><p class="pk">Lời trích</p><p class="qt">${e(D.quote || 'Hai con người, một hành trình.')}</p></div>`,
    `<div class="pg p-qa"><p class="pk">Phỏng vấn</p><p class="q">Điều gì khiến hai bạn chắc chắn?</p><p class="a">Chỉ cần nhìn nhau, mọi thứ đã rõ.</p><p class="q">Một lời khuyên cho ngày cưới?</p><p class="a">Cứ cười thật nhiều.</p></div>`,
    `<div class="pg p-news"><p class="pk">Tin nóng</p><p class="hd">Cô dâu và chú rể chính thức nói lời “đồng ý”</p><p class="ds">Ngày ${c.d}.${c.m}.${c.y}</p></div>`
  ];
  el.className = 'cover ed-cover'; el.style.cssText = '';
  el.innerHTML = `
    <div class="ed-desk" aria-hidden="true"></div>
    <div class="mag" id="mag">
      <section class="pg base" aria-label="Bìa chuyên đề dành riêng cho ${e(c.guest)}">
        <img class="bg" src="${photo}" alt="">
        <header class="mast">${mast}<p class="issue">${issue}</p></header>
        <div class="stk" aria-hidden="true"><span>Dành riêng cho</span><b>${e(c.guest)}</b></div>
        <ul class="cl">${lines.map(l => `<li><small>${e(l.k)}</small><span class="cl-t">${e(l.t)}</span></li>`).join('')}</ul>
        <h2 class="names">${e(D.bride.short)}<em>&amp;</em>${e(D.groom.short)}</h2>
        <footer class="foot"><p class="fd">${c.dow}, ${c.d}.${c.m}.${c.y}</p><svg class="bar" viewBox="0 0 80 30" aria-hidden="true">${BAR}</svg></footer>
      </section>
      ${leaves.map((h, i) => `<div class="leaf" style="--i:${i + 1}">${h}<i class="shade"></i></div>`).join('')}
      <div class="leaf front" style="--i:0">
        <div class="pg">
          <img class="bg" src="${photo}" alt="">
          <header class="mast">${mast}<p class="issue">${issue}</p></header>
          <div class="lines"><p><small>Gửi riêng</small>${e(c.guest)}</p><p><small>${c.dow}</small>${c.d}.${c.m}.${c.y}</p></div>
          <h1 class="names">${e(D.bride.short)}<em>&amp;</em>${e(D.groom.short)}</h1>
          <p class="hint">${M.reduced ? 'Chạm để lật trang' : 'Vuốt sang trái để lật trang'}</p>
          <button class="open-btn" type="button">Lật trang ${ARROW}</button>
          <i class="gloss" aria-hidden="true"></i>
        </div>
        <i class="shade"></i>
      </div>
    </div>`;
  const $ = s => el.querySelector(s), mag = $('#mag'), front = $('.leaf.front');
  const stops = []; let ended = false, started = false, musicOn = false;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  const bgs = [...el.querySelectorAll('img.bg')];
  if (!M.reduced && M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!started) { mag.style.setProperty('--rx', (-y * 3).toFixed(2) + 'deg'); mag.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg'); mag.style.setProperty('--px', (x * -8).toFixed(1) + 'px'); } }));

  const begin = () => { if (musicOn) return; musicOn = true; EA.music(); M.requestTilt(); $('.hint').classList.add('gone'); };
  async function riffle() {
    if (started || ended) return;
    started = true; begin(); mag.classList.add('riffle');
    mag.style.setProperty('--rx', '0deg'); mag.style.setProperty('--ry', '0deg');
    M.tone('whoosh');
    const n = 6, step = 150;
    for (let i = 0; i < n; i++) wait(i * step + 120).then(() => { if (!ended) { M.haptic('tap'); M.tone('click'); } });
    await wait(n * step + 520); if (ended) return;
    // hạ cánh trên bìa chuyên đề: dập dấu, gõ tiêu đề
    M.tone('thud'); M.haptic('thud'); mag.classList.add('landed');
    wait(250).then(() => { if (!ended) { mag.classList.add('stamp'); M.haptic('crack'); } });
    const items = [...el.querySelectorAll('.cl-t')];
    if (M.reduced) items.forEach(t => t.classList.add('ea-mo-on'));
    else items.forEach((t, i) => wait(300 + i * 480).then(() => { if (!ended) { M.reveal(t, { mode: 'write', stagger: 22 }); M.tone('click'); } }));
    el.querySelectorAll('.cl li').forEach((li, i) => wait(250 + i * 480).then(() => li.classList.add('on')));
    await wait(M.reduced ? 500 : 800 + items.length * 480 + 900); if (ended) return;
    M.tone('chime'); M.haptic('success');
    mag.classList.add('lift');
    await wait(650); if (ended) return;
    open(); setTimeout(stopCover, 1000);
  }
  // kéo: góc lật của bìa theo ngón tay, thả quá 30% thì lật liên tiếp
  const dist = Math.min(innerWidth * .7, 300);
  stops.push(M.drag(mag, {
    axis: 'x', distance: dist, invert: true,
    onMove: (p, dx) => { if (started) return; begin(); front.style.setProperty('--a', (-clamp(-dx / dist) * 95).toFixed(1) + 'deg'); front.classList.add('scrub'); },
    onEnd: p => {
      if (started) return;
      if (p > .3) { front.classList.remove('scrub'); front.style.removeProperty('--a'); riffle(); }
      else if (p > 0.02) { front.classList.remove('scrub'); front.style.removeProperty('--a'); }
      else { front.classList.remove('scrub'); }
    }
  }));
  $('.open-btn').addEventListener('click', ev => { ev.stopPropagation(); riffle(); }, { once: true });
  mag.addEventListener('click', ev => { if (ev.detail > 0 && !ev.target.closest('.open-btn') && (M.reduced || M.tier === 'low')) riffle(); });
  mag.addEventListener('keydown', ev => { if (ev.key === 'ArrowLeft') riffle(); });
});

// -------------------- các phần của thiệp --------------------
EA.section('events', ({ data: D, esc: e, ui, dow, d, m }) => `<div class="wrap">
  ${ui.head('Ngày vui', 'Ngày chúng mình thành đôi')}
  <div class="feature">
    ${D.events.map((ev, i) => `
      <article class="story">
        <p class="bignum">${e(ev.time)}</p>
        <div>
          <p class="label">Chương ${i + 1} · ${e(ev.label)}</p>
          <h3>${e(ev.title)}</h3>
          <p class="dek">${dow}, ${d} tháng ${+m}. Tại <strong>${e(ev.place)}</strong>, ${e(ev.address)}.</p>
          ${ui.actions(ev)}
        </div>
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Bộ ảnh', 'Khoảnh khắc của chúng mình')}
  <div class="spread">
    ${D.photos.map((p, i) => `<figure>${ui.photo(p, i)}<figcaption>Hình ${String(i + 1).padStart(2, '0')}. ${e(p.caption)}</figcaption></figure>`).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <ol class="index">
    ${D.itinerary.map(it => `<li><time>${e(it.time)}</time><strong>${e(it.title)}</strong><span>${e(it.note)}</span></li>`).join('')}
  </ol>
</div>`);

EA.section('letter', ({ data: D, esc: e, guest, dateText }) => `<div class="wrap">
  <div class="ed-letter">
    <header><p class="kicker">Thư ngỏ · ${dateText}</p><h1 class="display">Một lời mời từ chúng mình</h1></header>
    <div class="cols">
      <p class="drop">Gửi ${e(guest)}, ${e(D.letter[0])}</p>
      ${D.letter.slice(1).map(p => `<p>${e(p)}</p>`).join('')}
      <p class="highlight">${e(D.letterHighlight)}</p>
    </div>
    <p class="byline">${e(D.bride.name)} <span class="amp">&amp;</span> ${e(D.groom.name)}</p>
  </div>
</div>`);

EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Cẩm nang', 'Hỏi nhanh, đáp gọn')}
  <div class="interview">
    ${D.faq.map(f => `<p class="q"><b>Hỏi</b>${e(f.q)}</p><p class="a"><b>Đáp</b>${e(f.a)}</p>`).join('')}
  </div>
</div>`);

EA.section('quote', ({ data: D, esc: e }) => `<div class="wrap">
  <blockquote class="pull">${e(D.quote)}</blockquote>
  <p class="eyebrow">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
</div>`);

EA.section('contact', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Liên hệ', 'Ban biên tập')}
  <dl class="masthead">
    ${[['Cô dâu', D.bride], ['Chú rể', D.groom]].map(([r, p]) => `<div><dt>${r}</dt><dd>${e(p.name)}</dd><dd><a href="tel:${e(p.phone.replace(/\s/g, ''))}">${e(p.phone)}</a></dd></div>`).join('')}
  </dl>
</div>`);

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c, lines = coverLines(c);
  const issue = c.p.daysTogether != null ? fmt(c.p.daysTogether) : '01';
  return `<div class="wrap">
  <div class="ed-hero">
    <div class="ed-hero-txt">
      <p class="kicker"><button class="ed-issue" type="button" aria-label="Số báo">Số ${issue}</button> · ${c.dateText}</p>
      <h1 class="ed-names">${e(cp.brideShortName)}<br><em>&amp;</em> ${e(cp.groomShortName)}</h1>
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="hero-date">${c.dow} · ${e(cp.city)}</p>
      <ul class="ed-lines" aria-label="Trong số này">${lines.map(l => `<li><small>${e(l.k)}</small>${e(l.t)}</li>`).join('')}</ul>
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
    <figure class="ed-hero-img"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><figcaption>Ảnh bìa. ${e(cp.brideName)} &amp; ${e(cp.groomName)}</figcaption></figure>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Chuyện của chúng mình')}
  <div class="ed-story">
    ${(mod.content.chapters || []).map((ch, i) => `
      <article class="ed-ch">
        <p class="ed-ch-no">${String(i + 1).padStart(2, '0')}</p>
        <div>
          <p class="label">Chương ${i + 1} · ${e(ch.date)}</p>
          <h3>${e(ch.title)}</h3>
          <p class="dek">${e(ch.text)}</p>
        </div>
        ${ch.image ? `<figure><img src="${e(ch.image)}" alt="" loading="lazy"><figcaption>Hình ${String(i + 1).padStart(2, '0')}</figcaption></figure>` : ''}
      </article>`).join('')}
  </div>
  ${mod.content.quote ? `<blockquote class="pull">${e(mod.content.quote)}</blockquote>` : ''}
</div>`);

const SCISSORS = '<svg class="scissors" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8 7.5L21 17M8 16.5L21 7"/></svg>';
EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Phiếu trả lời', 'Cắt phiếu, gửi lại cho chúng mình')}
  <div class="coupon">${SCISSORS}${ui.rsvpForm()}</div>
</div>`);

// -------------------- thêm vào sau khi dựng trang --------------------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data, cp = c.config.couple;
  const bar = document.createElement('div');
  bar.className = 'ticker'; bar.setAttribute('aria-hidden', 'true');
  const items = [`${cp.brideName} & ${cp.groomName} chính thức nói lời “đồng ý”`, `Hôn lễ diễn ra ngày ${c.d}.${c.m}.${c.y}${cp.city ? ` tại ${cp.city}` : ''}`, ...coverLines(c).filter(l => l.k !== 'Số đặc biệt').map(l => `${l.k}: ${l.t}`), `Thư mời gửi riêng tới ${c.guest}`];
  const track = list => `<p>${list.map(t => `<span>${e(t)}</span>`).join('<i></i>')}</p>`;
  bar.innerHTML = `<span class="tk-label">Tin nóng</span><div class="tk-track">${track([...items, ...items])}</div>`;
  main.before(bar);

  // chữ tên ở trang đầu đậm dần khi cuộn
  const names = main.querySelector('.ed-names');
  if (names && !c.reduced) {
    let raf = 0;
    const upd = () => { raf = 0; const p = Math.min(1, scrollY / (innerHeight * .9)); names.style.fontVariationSettings = `'wght' ${Math.round(400 + p * 400)}`; };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(upd); }, { passive: true }); upd();
  }

  // ---- thêm các phần theo hồ sơ ----
  const adds = [], tb = P.get('traits.bride', {}), tg = P.get('traits.groom', {});
  const qa = [];
  if (P.has('metPlace') || P.has('metDate')) qa.push(['Hai bạn gặp nhau lần đầu ở đâu?', `${P.get('metPlace', 'Một nơi rất bình thường')}${P.get('metCity') ? `, ${P.get('metCity')}` : ''}${P.has('metDate') ? `, ngày ${dmyLong(P.get('metDate'))}` : ''}. Khi ấy chưa ai nghĩ đó là khởi đầu.`]);
  if (P.has('proposal')) qa.push(['Lời cầu hôn diễn ra thế nào?', P.get('proposal')]);
  if (P.has('insideJoke')) qa.push(['Trò đùa riêng của hai người là gì?', P.get('insideJoke')]);
  if (tb.drink && tg.drink) qa.push(['Mỗi sáng, ai uống gì?', `${D.bride.short}: ${tb.drink}. ${D.groom.short}: ${tg.drink}. Hai thế giới, một chiếc bàn.`]);
  if (P.has('song.title')) qa.push(['Bài hát của hai người?', `“${P.get('song.title')}”${P.has('song.artist') ? ` của ${P.get('song.artist')}` : ''}. ${P.get('song.lyric', '')}`.trim()]);
  if (qa.length >= 2) adds.push(['interview', `<div class="wrap narrow">
    <header class="head"><p class="eyebrow">Phỏng vấn độc quyền</p><h2 class="title">Cặp đôi của số báo này trả lời</h2><p class="sub">Ban biên tập thực hiện, tháng ${+c.m} năm ${c.y}</p></header>
    <div class="interview">${qa.map(([q, a]) => `<p class="q"><b>Hỏi</b>${e(q)}</p><p class="a"><b>Đáp</b>${e(a)}</p>`).join('')}</div></div>`]);

  const hasT = o => o.nickname || o.drink || o.hobby || o.rhythm;
  if (hasT(tb) && hasT(tg)) {
    const rhy = r => (r === 'morning' ? 'Người của buổi sáng' : r === 'night' ? 'Cú đêm' : '');
    const card = (name, role, t) => `<article class="face"><p class="face-no">${e(name.slice(0, 1))}</p><div><p class="label">${role}</p><h3>${e(name)}${t.nickname ? ` <small>“${e(t.nickname)}”</small>` : ''}</h3>
      <dl>${[['Thức uống', t.drink], ['Sở thích', t.hobby], ['Nhịp sống', rhy(t.rhythm)]].filter(r => r[1]).map(r => `<div><dt>${r[0]}</dt><dd>${e(r[1])}</dd></div>`).join('')}</dl></div></article>`;
    adds.push(['faces', `<div class="wrap">
      <header class="head"><p class="eyebrow">Gương mặt trang bìa</p><h2 class="title">Hai nhân vật chính</h2></header>
      <div class="faces">${card(D.bride.name, 'Cô dâu', tb)}${card(D.groom.name, 'Chú rể', tg)}</div></div>`]);
  }

  const nums = [];
  if (P.daysTogether != null) nums.push([P.daysTogether, 'ngày bên nhau']);
  const pl = P.get('places', []); if (pl.length) nums.push([pl.length, 'điểm đến cùng nhau']);
  const hp = P.get('hometownPins', {}); if (hp.bride && hp.groom) nums.push([Math.round(P.kmBetween(hp.bride, hp.groom) / 10) * 10, 'km giữa hai quê']);
  if (P.has('pet.name')) nums.push([1, `${P.get('pet.kind', 'bé cưng')} tên ${P.get('pet.name')}`]);
  if (nums.length >= 2) adds.push(['numbers', `<div class="wrap">
    <header class="head"><p class="eyebrow">Số liệu</p><h2 class="title">Số báo này trong những con số</h2></header>
    <div class="nums">${nums.map(([n, l]) => `<div class="num-c"><b class="num" data-n="${n}">${fmt(n)}</b><span>${e(l)}</span></div>`).join('')}</div></div>`]);

  const q = P.get('quote', {});
  if (q.text) adds.push(['pullq', `<div class="wrap"><blockquote class="pull">${e(q.text)}</blockquote>${q.author ? `<p class="eyebrow">${e(q.author)}, câu trích của số này</p>` : ''}</div>`]);

  let prev = main.querySelector('#story') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} ed-add`; s.innerHTML = html;
    if (prev) prev.insertAdjacentElement('afterend', s); else main.appendChild(s);
    prev = s;
  });
  main.querySelectorAll('.num').forEach(x => {
    const n = +x.dataset.n; if (!M.reduced) x.textContent = '0';
    M.inView(x, () => M.tween(0, n, 1800, 'out', v => { x.textContent = fmt(v); }).then(() => { x.textContent = fmt(n); }), { threshold: .6 });
  });

  // ban biên tập: cộng tác viên đặc biệt
  const mh = main.querySelector('.masthead');
  if (mh && P.has('pet.name')) mh.insertAdjacentHTML('beforeend', `<div class="cred"><dt>Cộng tác viên đặc biệt</dt><dd>${e(P.get('pet.name'))}</dd><dd class="role">${e(P.get('pet.kind', 'bé cưng'))}, giám đốc hình ảnh danh dự</dd></div>`);

  // easter egg: chạm ba lần vào "Số …" trên trang đầu
  const issueBtn = main.querySelector('.ed-issue');
  if (issueBtn) {
    let n = 0, t0 = 0, timer = 0;
    issueBtn.addEventListener('click', () => {
      const now = Date.now(); n = now - t0 < 1500 ? n + 1 : 1; t0 = now;
      if (n < 3) { M.tone('pop'); return; } n = 0;
      const days = P.daysTogether;
      const msg = days != null ? `Số báo này ra mắt sau ${fmt(days)} ngày kể từ lần đầu hai bạn gặp nhau, tức hơn ${Math.floor(days / 365)} năm.` : `Bạn vừa mở trang bí mật. Ban biên tập gửi lời cảm ơn tới ${c.guest}.`;
      let tip = document.querySelector('.ed-tip'); if (!tip) { tip = document.createElement('p'); tip.className = 'ed-tip'; tip.setAttribute('role', 'status'); document.body.appendChild(tip); }
      tip.textContent = msg; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
      M.tone('chime'); M.haptic('success'); clearTimeout(timer); timer = setTimeout(() => tip.classList.remove('show'), 5200);
    });
  }

  // finale: sau RSVP, con dấu "đã nhận phiếu" đóng xuống và bản tin mới chạy lên đầu dải tin nóng
  EA.onRsvp(entry => {
    M.tone('thud'); M.haptic('thud');
    const nm = (entry && entry.name) || c.guest;
    const p0 = bar.querySelector('.tk-track p');
    if (p0) p0.insertAdjacentHTML('afterbegin', `<span>Vừa nhận: ${e(nm)} ${entry && entry.attending === false ? 'chưa thể đến nhưng gửi lời chúc' : 'sẽ có mặt trong ngày vui'}</span><i></i>`);
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('ed-stamp')) return;
        done.insertAdjacentHTML('beforebegin', `<div class="ed-stamp" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="edst" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs><circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="1.5"/><text font-size="15" font-weight="600" letter-spacing="3" fill="currentColor"><textPath href="#edst" startOffset="0">ĐÃ NHẬN PHIẾU TRẢ LỜI · BAN BIÊN TẬP · </textPath></text><text x="100" y="96" text-anchor="middle" font-size="22" font-weight="700" fill="currentColor" font-style="italic">${e(String(nm).slice(0, 14))}</text><text x="100" y="124" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="2" fill="currentColor">${c.d}.${c.m}.${c.y}</text></svg></div>`);
      });
    }, 30);
  });
});
