// Ký Ức Polaroid: máy ảnh lấy liền nhả ra một tấm polaroid. Lắc điện thoại (hoặc chạm, hoặc xoa lên ảnh) để rửa ảnh nhanh hơn.
// Bìa luôn hiện ở trạng thái "đã rửa một nửa" để lời mời đọc được ngay cả khi chưa ai lắc.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const NB = s => String(s || '').replace(/ /g, ' ');
const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const pretty = s => { const m = String(s).match(/^(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : String(s); };

// ảnh giả từ tên địa điểm (khi chưa có ảnh thật): trời, núi, nước
const skyArt = (name, label) => {
  const h = hash(name) % 360, h2 = (h + 40) % 360;
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><defs><linearGradient id="s${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h} 55% 72%)"/><stop offset=".6" stop-color="hsl(${h2} 70% 82%)"/><stop offset="1" stop-color="hsl(${h2} 60% 90%)"/></linearGradient></defs><rect width="100" height="100" fill="url(#s${h})"/><circle cx="${30 + h % 40}" cy="34" r="11" fill="#fff6dc" opacity=".9"/><path d="M0 70L22 48l16 18 18-26 24 30 20-16V100H0z" fill="hsl(${h} 30% 38%)" opacity=".85"/><path d="M0 82q25-10 50 0t50 0V100H0z" fill="hsl(${h2} 35% 30%)"/></svg>`;
};
// một tấm polaroid đang "rửa": --d chạy từ 0 đến 1
const devPol = ({ art, img, cap, stamp, cls = '' }) => `<figure class="mp dev ${cls}" style="--d:0"><div class="ph">${art || ''}${img ? `<img src="${img}" alt="" loading="lazy">` : ''}<i class="fog"></i></div><figcaption><span class="cp">${cap}</span>${stamp ? `<span class="st">${stamp}</span>` : ''}</figcaption></figure>`;
const develop = (el, ms = 2400) => { const M = MO(); return M.tween(0, 1, ms, 'out', v => el.style.setProperty('--d', v.toFixed(3))); };

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const photo = D.photos[1]?.src || D.photos[0]?.src || '';
  document.documentElement.classList.toggle('pl-low', M.tier === 'low');
  el.className = 'cover pl-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <div class="pl-table">
      <div class="cam" aria-hidden="true"><i class="stripe"></i><i class="lens"></i><i class="eye"></i><i class="slot"></i></div>
      <div class="pl-slide">
        <figure class="pol dev" style="--d:.42">
          <span class="tape" aria-hidden="true"></span>
          <div class="ph"><div class="art"></div>${photo ? `<img src="${e(photo)}" alt="">` : ''}<i class="fog"></i><i class="flash"></i></div>
          <figcaption>
            <span class="nm">${NB(D.bride.name)}<br>&amp; ${NB(D.groom.name)}</span>
            <span class="st">${c.dateText}</span>
            <span class="to">Gửi ${e(c.guest)}</span>
          </figcaption>
        </figure>
      </div>
      <p class="hint">Lắc điện thoại để rửa ảnh. Hoặc chạm, hoặc xoa lên ảnh.</p>
      <button class="open-btn" type="button">Rửa ảnh</button>
    </div>`;
  const $ = s => el.querySelector(s);
  const pol = $('.pol'), slide = $('.pl-slide'), hint = $('.hint');
  $('.art').innerHTML = skyArt(D.bride.name + D.groom.name, '');
  const S = { p: .42, t: .42, boost: 0 };
  let locked = false, ended = false, musicOn = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const setD = v => pol.style.setProperty('--d', v.toFixed(3));
  const begin = () => { if (!musicOn) { musicOn = true; EA.music(); M.requestTilt(); } };
  const wiggle = () => { slide.classList.remove('wig'); void slide.offsetWidth; slide.classList.add('wig'); };
  const push = (n, quiet) => {
    if (locked) return; begin();
    S.t = Math.min(1, S.t + n);
    if (!quiet) { wiggle(); M.tone('pop'); M.haptic('tap'); }
    hint.classList.add('gone');
  };

  // động cơ nhả ảnh: chạy một lần khi bìa hiện
  if (!M.reduced) { slide.classList.add('eject'); stops.push(() => {}); setTimeout(() => { slide.classList.remove('eject'); slide.classList.add('rest'); }, 1900); }
  else slide.classList.add('rest');

  // vòng lặp rửa ảnh: tự nhích chậm tới 70% rồi dừng, phần còn lại phải do khách lắc/chạm/xoa
  stops.push(M.loop((t, dt) => {
    if (locked) return;
    if (S.boost) S.t = 1;
    else S.t = Math.max(S.t, Math.min(.7, S.t + dt * .00004));
    if (M.reduced && S.boost) S.p = 1; else S.p += (S.t - S.p) * (S.boost ? .04 : .05);
    setD(S.p);
    if (S.t >= 1 && S.p > .985) complete();
  }, { el }));

  // cử chỉ 1: lắc (devicemotion). Cử chỉ 2: chạm. Cử chỉ 3: xoa (kéo qua lại) trên ảnh.
  stops.push(M.shake(() => push(.3)));
  let lx = null, ly = 0, acc = 0;
  pol.addEventListener('pointerdown', ev => { lx = ev.clientX; ly = ev.clientY; acc = 0; pol.setPointerCapture?.(ev.pointerId); });
  pol.addEventListener('pointermove', ev => {
    if (lx == null) return;
    const d = Math.hypot(ev.clientX - lx, ev.clientY - ly); lx = ev.clientX; ly = ev.clientY; acc += d;
    if (acc > 120) { acc = 0; push(.12); } else push(d / 1500, true);
  });
  const up = () => { lx = null; };
  pol.addEventListener('pointerup', up); pol.addEventListener('pointercancel', up);
  pol.addEventListener('click', ev => { if (ev.detail) push(.1); });
  pol.tabIndex = -1;
  $('.open-btn').addEventListener('click', () => { if (locked) return; begin(); M.tone('whoosh'); S.boost = 1; hint.classList.add('gone'); }, { once: true });

  // easter egg: chạm 4 lần vào cuộn máy ảnh? -> chạm ba lần vào ống kính, "tách" một tiếng
  let lt = 0, ln = 0;
  $('.cam').style.pointerEvents = 'auto';
  $('.cam').addEventListener('click', () => {
    const now = Date.now(); ln = now - lt < 1200 ? ln + 1 : 1; lt = now; M.tone('click'); M.haptic('tap');
    if (ln >= 3) { ln = 0; $('.flash').classList.remove('go'); void $('.flash').offsetWidth; $('.flash').classList.add('go'); M.tone('pop'); M.haptic('success'); wiggle(); }
  });

  async function complete() {
    if (locked || ended) return;
    locked = true; setD(1);
    M.tone('chime'); M.haptic('success');
    $('.flash').classList.add('go'); el.classList.add('done');
    if (M.reduced) { setTimeout(open, 700); return; }
    await new Promise(r => setTimeout(r, 1500));
    if (ended) return;
    open(); setTimeout(stopCover, 1200);
  }
});

// ---- bố cục: bảng ghim, sổ tay, thẻ ghi chú, tin nhắn ----
const PEN = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/></svg>';
EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Khoảnh khắc của chúng mình')}
  <p class="drag-note">${PEN} kéo ảnh để sắp xếp lại bảng ghim nhé</p>
  <div class="board">
    ${D.photos.map((p, i) => ui.photo(p, i, '<span class="pin" aria-hidden="true"></span>')).join('')}
  </div>
</div>`);

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <div class="notepad">
    <p class="pad-title">Việc cần làm ngày ${e(D.date.split('-').reverse().join('/'))}</p>
    <ul class="todo">
      ${D.itinerary.map((it, i) => `<li><span class="box${i === 0 ? ' on' : ''}" aria-hidden="true"></span><time>${e(it.time)}</time> <strong>${e(it.title)}</strong> <span class="n">${e(it.note)}</span></li>`).join('')}
    </ul>
  </div>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ghi vào lịch', 'Ghi vào lịch nhé!')}
  <div class="index-cards">
    ${D.events.map(ev => `
      <article class="icard">
        <span class="tape" aria-hidden="true"></span>
        <p class="when">${e(ev.time)} <small>${ui.evDate(ev).split('· ')[1]}</small></p>
        <h3>${e(ev.title)}</h3>
        <p>Tại ${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('notes', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Lưu ý', 'Nhớ giùm chúng mình nha')}
  <div class="stickies">
    <div class="sticky palette"><p class="st-title">Mặc màu gì?</p>
      <ul>${D.dressCode.map(s => `<li><span class="dot" style="background:${e(s.color)}"></span>${e(s.name)}</li>`).join('')}</ul>
    </div>
    ${D.notes.map(n => `<div class="sticky"><p>${e(n)}</p></div>`).join('')}
  </div>
</div>`);

EA.section('faq', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Hỏi đáp', 'Bạn hỏi, chúng mình trả lời')}
  <div class="chat">
    ${D.faq.map(f => `<p class="bubble me">${e(f.q)}</p><p class="bubble them">${e(f.a)}</p>`).join('')}
  </div>
</div>`);

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="pl-hero">
    <figure class="pl-big"><span class="tape" aria-hidden="true"></span>
      <div class="ph"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><i class="flash"></i></div>
      <figcaption>${e(cp.brideShortName)} &amp; ${e(cp.groomShortName)}</figcaption>
    </figure>
    <div class="pl-note">
      <p class="scribble">Sắp cưới rồi!!</p>
      <h1 class="couple"><span>${NB(cp.brideName)}</span><span class="amp">&amp;</span><span>${NB(cp.groomName)}</span></h1>
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="circled">${c.d}.${c.m}.${c.y}</p>
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
  </div>
</div>`;
});

// bức tường kỷ niệm: ảnh treo trên dây bằng kẹp gỗ
EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Bức tường kỷ niệm', 'Cuốn sổ của chúng mình')}
  <div class="wall story">
    ${(mod.content.chapters || []).map((ch, i) => `
      <article class="hang" style="--r:${[-3, 2, -1.5, 3][i % 4]}deg;--i:${i}">
        <span class="clip" aria-hidden="true"></span>
        <figure class="mp"><div class="ph">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</div><figcaption><span class="cp">${e(ch.title)}</span><span class="st">${e(ch.date)}</span></figcaption></figure>
        <p class="note">${e(ch.text)}</p>
      </article>`).join('')}
  </div>
  ${mod.content.quote ? `<p class="story-quote">“${e(mod.content.quote)}”</p>` : ''}
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi đáp', 'Điền giúp chúng mình nhé')}
  <div class="notebook"><span class="rings" aria-hidden="true"></span>${ui.rsvpForm()}</div>
</div>`);

// sổ lưu bút: khách thêm cả ảnh polaroid của riêng mình
EA.section('guestbook', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Sổ lưu bút', 'Dán một tấm polaroid của bạn')}
  ${mod.content.prompt ? `<p class="sub">${e(mod.content.prompt)}</p>` : ''}
  <form class="pl-wish" novalidate>
    <label class="field"><span>Tên của bạn</span><input name="name" required maxlength="60" autocomplete="name"></label>
    <label class="field"><span>Lời chúc</span><textarea name="message" rows="3" required maxlength="300"></textarea></label>
    <div class="pl-file"><label class="btn ghost" for="plfile">Thêm ảnh của bạn</label><input id="plfile" name="photo" type="file" accept="image/*"><span class="fn" aria-live="polite"></span></div>
    <p class="form-error" role="alert" hidden></p>
    <button class="btn" type="submit">Dán lên tường</button>
  </form>
  <div class="gb-wall"></div>
</div>`);

// ---- add-ons + hạt phim + finale ----
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  document.documentElement.classList.toggle('pl-low', M.tier === 'low');
  const adds = [];

  // 1. Những nơi mình đã đi qua
  const places = P.get('places', []);
  if (places.length) {
    adds.push(['places', `<div class="wrap">
      <header class="head"><p class="eyebrow">Những nơi mình đã đi qua</p><h2 class="title">Mỗi chuyến đi là một tấm ảnh</h2></header>
      <div class="wall">${places.map((pl, i) => `<article class="hang" style="--r:${[2, -3, 1.5, -2][i % 4]}deg;--i:${i}"><span class="clip" aria-hidden="true"></span>
        <figure class="mp"><div class="ph">${skyArt(pl.name, e(pl.name))}</div><figcaption><span class="cp">${e(pl.name)}</span>${pl.date ? `<span class="st">${e(pretty(pl.date))}</span>` : ''}</figcaption></figure></article>`).join('')}</div></div>`]);
  }

  // 2. Băng cassette bài hát của đôi mình
  if (P.has('song.title')) {
    const s = P.get('song', {});
    adds.push(['mixtape', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Bài hát của đôi mình</p><h2 class="title">Cuộn băng mình thu riêng</h2></header>
      <div class="tape-deck"><div class="cass"><i class="reel l"></i><i class="reel r"></i><div class="lab"><span>${e(s.title)}</span></div><i class="win"></i></div></div>
      <p class="by">${e(s.title)}${s.artist ? ` · ${e(s.artist)}` : ''}</p>
      ${s.lyric ? `<p class="lyric">${e(s.lyric)}</p>` : ''}
    </div>`]);
  }

  // 3. Chuyện chỉ hai đứa hiểu + hồ sơ hai đứa
  const tb = P.get('traits.bride', {}), tg = P.get('traits.groom', {});
  if (P.has('insideJoke') || tb.nickname || tg.nickname) {
    const card = (who, t, name) => (t.nickname || t.drink || t.hobby) ? `<div class="sticky"><p class="st-title">${e(t.nickname || name)}</p><ul>${t.drink ? `<li>Hay uống: ${e(t.drink)}</li>` : ''}${t.hobby ? `<li>Thích: ${e(t.hobby)}</li>` : ''}</ul></div>` : '';
    adds.push(['inside', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hồ sơ hai đứa</p><h2 class="title">Chuyện chỉ hai đứa hiểu</h2></header>
      <div class="inside">
        ${card('bride', tb, D.bride.short)}
        ${P.has('insideJoke') ? `<div class="icard joke"><span class="tape" aria-hidden="true"></span><p>${e(P.get('insideJoke'))}</p></div>` : ''}
        ${card('groom', tg, D.groom.short)}
      </div></div>`]);
  }

  let prev = main.querySelector('#story') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} pl-add`; s.innerHTML = html;
    if (prev) prev.insertAdjacentElement('afterend', s); else main.appendChild(s);
    prev = s;
  });
  // ảnh rơi nhẹ vào chỗ khi cuộn tới
  main.querySelectorAll('.wall').forEach(w => M.inView(w, () => w.classList.add('in'), { threshold: .12 }));

  // bảng ghim: kéo thả
  const board = main.querySelector('.board');
  if (board) {
    let moved = false, z = 5;
    board.addEventListener('click', ev => { if (moved) { ev.stopPropagation(); ev.preventDefault(); moved = false; } }, true);
    board.querySelectorAll('.photo').forEach(p => {
      let start = null, pos = { x: 0, y: 0 };
      p.style.touchAction = 'none';
      p.addEventListener('pointerdown', ev => { start = { x: ev.clientX - pos.x, y: ev.clientY - pos.y, ox: ev.clientX, oy: ev.clientY }; p.setPointerCapture(ev.pointerId); p.style.zIndex = ++z; p.classList.add('lifted'); moved = false; });
      p.addEventListener('pointermove', ev => {
        if (!start) return;
        if (Math.abs(ev.clientX - start.ox) + Math.abs(ev.clientY - start.oy) > 6) moved = true;
        pos = { x: ev.clientX - start.x, y: ev.clientY - start.y }; p.style.translate = `${pos.x}px ${pos.y}px`;
      });
      const end = () => { start = null; p.classList.remove('lifted'); };
      p.addEventListener('pointerup', end); p.addEventListener('pointercancel', end);
    });
  }

  // hạt phim phủ lên toàn trang (đứng yên nếu giảm chuyển động hoặc máy yếu)
  document.body.insertAdjacentHTML('beforeend', '<div class="pl-grain" aria-hidden="true"></div>');

  // polaroid nghiêng nhẹ theo máy
  if (!M.reduced && M.tier !== 'low') {
    const bigs = [...main.querySelectorAll('.pl-big')];
    if (bigs.length) M.tilt(({ x, y }) => bigs.forEach(b => { b.style.setProperty('--tx', (x * 5).toFixed(2) + 'deg'); b.style.setProperty('--ty', (-y * 4).toFixed(2) + 'deg'); }));
  }

  // easter egg: chạm ba lần vào ảnh lớn -> đèn flash, một tấm polaroid biệt danh rơi xuống góc
  const big = main.querySelector('.pl-big');
  if (big) {
    let n = 0, t0 = 0;
    big.addEventListener('click', () => {
      const now = Date.now(); n = now - t0 < 1200 ? n + 1 : 1; t0 = now; M.tone('click');
      if (n < 3) return; n = 0;
      const fl = big.querySelector('.flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
      M.tone('pop'); M.haptic('success');
      const nb = P.get('traits.bride.nickname'), ng = P.get('traits.groom.nickname');
      const cap = nb && ng ? `${e(nb)} &amp; ${e(ng)}` : 'Cười lên nào!';
      document.querySelector('.egg-pol')?.remove();
      document.body.insertAdjacentHTML('beforeend', `<div class="egg-pol">${devPol({ art: skyArt(cap, ''), cap, stamp: c.dateText })}</div>`);
      const ep = document.querySelector('.egg-pol'); develop(ep.firstElementChild, 2000);
      setTimeout(() => ep.classList.add('bye'), 4200); setTimeout(() => ep.remove(), 5000);
    });
  }

  // sổ lưu bút polaroid
  const wall = main.querySelector('.gb-wall'), form = main.querySelector('form.pl-wish');
  if (wall && form) {
    const samples = c.mods.guestbook?.content?.samples || [];
    const item = (w, fresh) => `<div class="gb ${fresh ? 'fresh' : ''}" style="--r:${(((hash(w.name + w.message) % 70) - 35) / 10).toFixed(1)}deg">${devPol({ art: w.img ? '' : skyArt(w.name, ''), img: w.img || '', cap: e(w.name), stamp: '' }).replace('</figcaption>', `<span class="msg">${e(w.message)}</span></figcaption>`)}</div>`;
    const draw = async () => {
      const mine = await EA.shared.list('polaroid');
      const all = [...mine.slice().reverse(), ...samples];
      wall.innerHTML = all.map(w => item(w)).join('');
      wall.querySelectorAll('.mp').forEach(m => m.style.setProperty('--d', 1));
    };
    draw();
    const fileIn = form.querySelector('input[type=file]'), fn = form.querySelector('.fn');
    fileIn.addEventListener('change', () => { fn.textContent = fileIn.files[0]?.name || ''; });
    const shrink = file => new Promise(res => {
      if (!file) return res('');
      const r = new FileReader();
      r.onerror = () => res('');
      r.onload = () => {
        const im = new Image();
        im.onerror = () => res('');
        im.onload = () => {
          const S = 420, k = Math.max(S / im.width, S / im.height), w = im.width * k, h = im.height * k, cv = document.createElement('canvas');
          cv.width = cv.height = S; cv.getContext('2d').drawImage(im, (S - w) / 2, (S - h) / 2, w, h);
          res(cv.toDataURL('image/jpeg', .72));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const name = form.name.value.trim(), message = form.message.value.trim(), err = form.querySelector('.form-error');
      if (!name || !message) { err.textContent = 'Bạn điền giúp mình tên và lời chúc nhé.'; err.hidden = false; return; }
      err.hidden = true;
      const img = await shrink(fileIn.files[0]);
      await EA.shared.add('polaroid', { name, message, img });
      await EA.store('guestbook', { name, message });
      wall.insertAdjacentHTML('afterbegin', item({ name, message, img }, true));
      const m = wall.querySelector('.gb.fresh .mp'); M.tone('pop'); M.haptic('success');
      develop(m, 2600).then(() => wall.querySelector('.gb.fresh')?.classList.remove('fresh'));
      form.reset(); fn.textContent = '';
    });
  }

  // finale: sau RSVP, một tấm polaroid "đã nhận" nhả ra và tự rửa
  EA.onRsvp(entry => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('rsvp-pol')) return;
        const no = entry && entry.attending === 'no';
        const cap = no ? 'Hẹn gặp bạn dịp khác' : `${e(entry?.name || c.guest)} sẽ đến!`;
        const img = D.photos[2]?.src || D.photos[0]?.src || '';
        done.insertAdjacentHTML('beforebegin', `<div class="rsvp-pol">${devPol({ art: skyArt(cap, ''), img: e(img), cap, stamp: c.dateText, cls: 'big' })}<i class="heart">${c.icon('heart')}</i></div>`);
        const rp = done.previousElementSibling; develop(rp.firstElementChild, 2600);
      });
    }, 40);
  });
});
