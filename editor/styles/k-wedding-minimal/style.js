// K-Wedding Minimal ("Nhật ký bốn khung"): a four-cut photo booth.
// Cover: a booth with a lens. Wow: tap the lens (or the primary button): four flashes, a shutter count 1/4..4/4 and a photo strip
// drops out of the slot one frame at a time, then the card opens. After: clean editorial slides, the story in four frames,
// and a four-cut frame maker guests can fill with their own photos and save. All art is CSS / canvas; only the couple's photo is used.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/k_wedding_couple_1790233343594.jpg';
  const PW = 1200, PH = 896;
  const placeholder = s => !s || /picsum\.photos/.test(s);
  // The artwork has baked-in lettering at the top-left and bottom-right corners: every crop stays clear of x<335,y<280 and x>915,y>725.
  const CROPS = {
    duo: [340, 30, 560, 866], up: [380, 60, 520, 520], face: [520, 120, 330, 330], hands: [540, 330, 300, 300], gown: [330, 400, 520, 496],
    p1: [400, 40, 420, 525], p2: [520, 110, 320, 400], p3: [530, 320, 300, 375], p4: [350, 520, 300, 375],
    m1: [340, 70, 600, 423], m2: [480, 110, 420, 296], m3: [500, 310, 360, 254], m4: [320, 440, 590, 416]
  };
  const crop = (name, cls = '') => {
    const [x, y, w, h] = CROPS[name];
    return `<span class="kw-crop ${cls}" style="aspect-ratio:${w}/${h}"><img src="${PHOTO}" alt="" loading="lazy" style="width:${(PW / w * 100).toFixed(2)}%;left:${(-x / w * 100).toFixed(2)}%;top:${(-y / h * 100).toFixed(2)}%"></span>`;
  };
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return placeholder(h) ? null : h; };
  const CAM = '<svg class="kw-cam" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
  const pad2 = n => String(n).padStart(2, '0');

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const frames = ['up', 'face', 'hands', 'gown'];
    el.innerHTML = `<div class="kw-cover">
      <div class="kw-lines" aria-hidden="true"><i></i><i></i></div>
      <p class="kw-top"><span>Nhật ký bốn khung</span><span>${c.d}.${c.m}.${c.y}</span></p>
      <div class="kw-left">
        <p class="kw-gs">Gửi <b>${e(c.guest)}</b></p>
        <h1 class="kw-nm"><span>${e(D.bride.name)}</span><i>và</i><span>${e(D.groom.name)}</span></h1>
        <p class="kw-dt"><span>${c.dow}</span>${c.dateText}</p>
        <div class="kw-act">
          <p class="kw-hint">Chạm vào ống kính: bốn tấm ảnh sẽ rơi ra, rồi thiệp mở.</p>
          <button class="open-btn" type="button">${CAM}<span>Chụp và mở thiệp</span></button>
        </div>
      </div>
      <div class="kw-right">
        <div class="kw-booth" aria-hidden="false">
          <span class="led" aria-hidden="true"></span><span class="lcd" aria-live="polite">0/4</span>
          <button class="kw-lens" type="button" aria-label="Bấm chụp để mở thiệp"><i></i><i></i><i></i></button>
          <i class="slot" aria-hidden="true"></i>
        </div>
        <div class="kw-out" aria-hidden="true">
          <div class="kw-ghost">${[1, 2, 3, 4].map(n => `<i>${pad2(n)}</i>`).join('')}</div>
          <div class="kw-strip">${frames.map((f, i) => `<div class="kw-sf" style="--i:${i}">${crop(f)}</div>`).join('')}<p>${e(D.bride.short || D.bride.name)} + ${e(D.groom.short || D.groom.name)}<br>${c.d}.${c.m}.${c.y}</p></div>
        </div>
      </div>
      <div class="kw-flash" aria-hidden="true"></div>
    </div>`;
    const root = el.querySelector('.kw-cover'), lens = el.querySelector('.kw-lens'), lcd = el.querySelector('.lcd'), openBtn = el.querySelector('.open-btn');
    const sfs = [...el.querySelectorAll('.kw-sf')], flash = el.querySelector('.kw-flash');
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });
    root.style.setProperty('--k', 0);
    let started = false;
    const shot = n => {
      root.style.setProperty('--k', n);
      lcd.textContent = `${n}/4`;
      flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on');
      sfs[n - 1].classList.add('dev');
      M.tone('click'); M.haptic(n === 4 ? 'success' : 'tap');
      if (n === 4) c.after(180, () => M.tone('chime'));
    };
    const go = () => {
      if (started) return;
      started = true; openBtn.disabled = true; lens.disabled = true;
      EA.music(); M.requestTilt();
      root.classList.add('is-go');
      [450, 1200, 1950, 2700].forEach((t, i) => c.after(t, () => shot(i + 1)));
      c.after(4000, () => { offTilt(); open(); });
    };
    lens.addEventListener('click', go);
    openBtn.addEventListener('click', go);
    lens.addEventListener('pointerdown', () => { M.requestTilt(); M.tone('pop'); });
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="kw-hd"><span class="kw-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</span><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${sub ? `<p class="kw-sub">${sub}</p>` : ''}</header>`;
  };

  // ---- hero: slide 01 ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, ph = photoOf(c);
    return `<div class="kw-hero">
      <div class="kw-bar"><span>Nhật ký bốn khung</span><span>${c.d}.${c.m}.${c.y}</span></div>
      <div class="kw-hgrid">
        <figure class="kw-ph">
          <div class="kw-pi">${ph ? `<img src="${e(ph)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : crop('duo', 'hero').replace('loading="lazy"', 'fetchpriority="high"')}</div>
          <figcaption><button class="kw-exp" type="button" aria-label="Khung số 24">KHUNG 24A</button><span>35 MM · 400</span></figcaption>
          <aside class="kw-bonus" aria-live="polite"><b>Khung bonus</b><span>${e(c.p.get('insideJoke', 'Cảm ơn bạn đã tìm ra khung hình bí mật của chúng mình.'))}</span></aside>
        </figure>
        <div class="kw-ht">
          <p class="kw-eb">${e(mc.eyebrow || 'Ngày chung đôi')}</p>
          <h1 class="kw-names" aria-label="${e(D.bride.name)} và ${e(D.groom.name)}"><span class="a">${e(D.bride.name)}</span><span class="am">và</span><span class="b">${e(D.groom.name)}</span></h1>
          ${cp.headline ? `<p class="kw-hl">${c.t(cp.headline)}</p>` : ''}
          <div class="kw-date"><span>${c.dow}</span><b>${c.d}<i>/</i>${c.m}<i>/</i>${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</div>
          ${mc.showCountdown !== false ? ui.countdown() : ''}
        </div>
      </div>
    </div>`;
  });

  const RHY = { morning: 'Người của buổi sáng', night: 'Cú đêm chính hiệu' };
  const traitRows = (c, who) => {
    const g = k => c.p.get(`traits.${who}.${k}`, '');
    return [['Biệt danh', g('nickname')], ['Nhịp sống', RHY[g('rhythm')] || ''], ['Thức uống', g('drink')], ['Sở thích', g('hobby')]].filter(r => r[1]);
  };

  // ---- invitation: letter + days together + profiles + song ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether;
    const met = c.p.get('metDate', ''), place = c.p.get('metPlace', ''), song = c.p.get('song', null);
    const tb = traitRows(c, 'bride'), tg = traitRows(c, 'groom');
    const pet = c.p.get('pet', null);
    return `<div class="wrap">
      <article class="kw-letter">
        <span class="kw-eb">Thư mời</span>
        <p class="kw-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        <div class="kw-lbody">
          ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
          ${D.letterHighlight ? `<p class="hl">${t(D.letterHighlight)}</p>` : ''}
          ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
          <p class="sg">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
        </div>
      </article>
      ${days ? `<div class="kw-days" data-days="${days}"><span class="kw-eb">Số lần bấm máy</span><div class="lcdn"><b class="n">0</b><span>ngày bên nhau</span></div>
        <p>Từ ${met.split('-').reverse().join('.')}${place ? `, ${e(place)}` : ''}: mỗi ngày là một khung hình.</p></div>` : ''}
      ${tb.length || tg.length ? `<div class="kw-prof"><span class="kw-eb">Hồ sơ hai người</span>
        <div class="cols">${[[D.bride.name, 'Cô dâu', tb], [D.groom.name, 'Chú rể', tg]].map(([n, r, rows]) => `<div><small>${r}</small><b>${e(n)}</b><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></div>`).join('')}</div>
        ${pet && pet.name ? `<p class="pet">Thành viên thứ ba: ${e(pet.kind || 'bé')} <b>${e(pet.name)}</b></p>` : ''}</div>` : ''}
      ${song && song.title ? `<div class="kw-song"><span class="kw-eb">Bản nhạc của hai đứa</span><b>${e(song.title)}</b>${song.artist ? `<i>${e(song.artist)}</i>` : ''}${song.lyric ? `<blockquote>${e(song.lyric)}</blockquote>` : ''}</div>` : ''}
    </div>`;
  });

  // ---- story: four frames ----
  EA.section('story', c => {
    const { esc: e, mod, p } = c, s = mod.content;
    let fr = (s.chapters || []).slice(0, 4).map(ch => ({ date: ch.date, title: ch.title, text: ch.text, image: ch.image }));
    if (!fr.length && (p.has('metDate') || p.has('places') || p.has('proposal'))) {
      const pl = p.get('places', []), met = p.get('metDate', '');
      fr = [
        { date: met ? met.split('-').slice(0, 2).reverse().join(' · ') : '', title: 'Lần đầu gặp nhau', text: p.get('metPlace', '') ? `Tại ${p.get('metPlace')}${p.get('metCity') ? ', ' + p.get('metCity') : ''}.` : 'Một ngày bình thường bỗng đặc biệt.' },
        pl[1] ? { date: String(pl[1].date || '').split('-').reverse().join(' · '), title: 'Chuyến đi đầu tiên', text: pl[1].name } : { title: 'Những ngày thường', text: 'Cùng nhau đi qua thật nhiều ngày bình thường.' },
        { title: 'Lời cầu hôn', text: p.get('proposal', 'Một câu hỏi và một cái gật đầu.') },
        { date: `${c.m} · ${c.y}`, title: 'Ngày chung đôi', text: 'Chương tiếp theo, và chúng mình muốn viết nó cùng bạn.' }
      ];
    }
    const keys = ['p1', 'p2', 'p3', 'p4'];
    return `<div class="wrap">
      ${head(c, 'Chuyện tình', 'Chuyện của chúng mình trong bốn khung')}
      <ol class="kw-f4">${fr.map((f, i) => `<li class="kw-f">
        <figure>${f.image && !placeholder(f.image) ? `<span class="kw-crop" style="aspect-ratio:4/5"><img src="${e(f.image)}" alt="" loading="lazy" style="width:100%;left:0;top:0;height:100%;object-fit:cover"></span>` : crop(keys[i % 4])}<i class="fl" aria-hidden="true"></i><span class="no">${pad2(i + 1)}/${pad2(fr.length)}</span></figure>
        <div>${f.date ? `<time>${e(f.date)}</time>` : ''}<h3>${e(f.title)}</h3><p>${e(f.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="kw-sq">${e(s.quote)}</p>` : ''}
    </div>`;
  });

  // ---- events: clean schedule ----
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dateOf = ev => { const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date; const [y, m, d] = iso.split('-'); return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`; };
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Lịch của ngày chung đôi')}
      <ol class="kw-ev">${D.events.map((ev, i) => `<li>
        <span class="no">${pad2(i + 1)}</span>
        <div class="tm"><b>${e(ev.time)}</b><span>${dateOf(ev)}</span></div>
        <div class="bd"><h3>${e(ev.title)}</h3><p class="lb">${e(ev.label)}</p><p class="pl"><b>${e(ev.place)}</b><br>${e(ev.address)}</p>${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}${ui.actions(ev)}</div>
      </li>`).join('')}</ol>
    </div>`;
  });

  // ---- gallery: slides + four-cut maker ----
  EA.section('gallery', c => {
    const keys = ['m1', 'p2', 'm3', 'p4', 'm2', 'p1'];
    const n = c.data.photos.length;
    return `<div class="wrap">
      ${head(c, 'Khoảnh khắc', 'Khoảnh khắc của chúng mình')}
    </div>
    <div class="kw-slides" tabindex="0" aria-label="Ảnh của chúng mình, vuốt ngang để xem">${c.data.photos.map((p, i) => `<figure class="kw-sl">${placeholder(p.src)
      ? `${crop(['p1', 'p2', 'p3', 'p4'][i % 4])}` : c.ui.photo(p, i)}<figcaption><span>${pad2(i + 1)}/${pad2(n)}</span>${esc(p.caption)}</figcaption></figure>`).join('')}</div>
    <div class="wrap">
      <div class="kw-maker" id="kw-maker">
        <span class="kw-eb">Khung bốn ảnh của bạn</span>
        <h3>Tự chụp một khung cho riêng mình</h3>
        <p class="kw-sub">Chạm vào từng ô để chọn ảnh của bạn, rồi lưu khung về máy. Ảnh chỉ nằm trên điện thoại của bạn, không bị gửi đi đâu.</p>
        <div class="kw-mk">
          <div class="kw-cv"><canvas width="600" height="1800" aria-label="Khung bốn ảnh xem trước"></canvas>${[0, 1, 2, 3].map(i => `<button class="kw-slot" type="button" data-i="${i}" aria-label="Chọn ảnh cho khung ${i + 1}"><span>${i + 1}</span></button>`).join('')}</div>
          <div class="kw-ctl">
            <fieldset class="kw-col"><legend>Màu khung</legend>${[['ivory', '#f6f2ec', 'Kem'], ['blush', '#f1e1dc', 'Hồng phấn'], ['ink', '#332f2c', 'Nâu đen']].map(([k, v, l], i) => `<label><input type="radio" name="kwc" value="${k}"${i ? '' : ' checked'}><i style="background:${v}"></i><span>${l}</span></label>`).join('')}</fieldset>
            <button class="btn" type="button" data-act="multi">Chọn nhiều ảnh</button>
            <button class="btn" type="button" data-act="save">Lưu khung ảnh</button>
            <button class="btn ghost" type="button" data-act="share" hidden>Chia sẻ</button>
            <button class="btn ghost" type="button" data-act="reset">Dùng ảnh của hai bạn</button>
            <p class="kw-msg" role="status"></p>
          </div>
          <input type="file" accept="image/*" hidden data-one><input type="file" accept="image/*" multiple hidden data-many>
        </div>
      </div>
    </div>`;
  });

  // ---- thanks ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="kw-bye">
      <span class="kw-eb">Lời cảm ơn</span>
      <p class="kw-cnt">4/4</p>
      <h2>Cảm ơn <i>${e(guest)}</i></h2>
      <p class="kw-tx">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="kw-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="kw-bd">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Chụp lại từ đầu ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
    </div>`;
  });

  // ======================= behaviours =======================
  const EN_EYEBROWS = { 'Love story': 'Chuyện tình', 'Save the date': 'Ghi nhớ ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khoảnh khắc', 'Dress code & notes': 'Trang phục và lưu ý', 'Wedding guide': 'Cẩm nang', RSVP: 'Xác nhận tham dự', 'Gift registry': 'Gợi ý quà', Guestbook: 'Sổ lưu bút', Contact: 'Liên hệ', 'Thank you': 'Lời cảm ơn', 'A note from us': 'Lời nhắn', 'Save our date': 'Ngày chung đôi' };
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const fromFile = async f => { try { return await createImageBitmap(f); } catch { return loadImg(URL.createObjectURL(f)); } };

  const maker = (c, root) => {
    const cv = root.querySelector('canvas'), g = cv.getContext('2d'), msg = root.querySelector('.kw-msg');
    const defaults = [[340, 70, 600, 423], [480, 110, 420, 296], [500, 310, 360, 254], [320, 440, 590, 416]];
    const FW = 528, FH = 372, X0 = 36, Y0 = 36, GAP = 20;
    const slots = [0, 1, 2, 3].map(i => ({ img: null, rect: defaults[i] }));
    let base = null, theme = 'ivory';
    const COL = { ivory: ['#f6f2ec', '#332f2c', '#7a6b60'], blush: ['#f1e1dc', '#3b2d2a', '#85625b'], ink: ['#332f2c', '#f6f2ec', '#bfb3a8'] };
    const draw = () => {
      const [bg, fg, soft] = COL[theme];
      g.fillStyle = bg; g.fillRect(0, 0, 600, 1800);
      slots.forEach((s, i) => {
        const y = Y0 + i * (FH + GAP), src = s.img || base;
        g.save(); g.beginPath(); g.rect(X0, y, FW, FH); g.clip(); g.fillStyle = '#d9d1c6'; g.fillRect(X0, y, FW, FH);
        if (src) {
          let sx, sy, sw, sh;
          if (s.img) { const iw = s.img.width, ih = s.img.height, k = Math.max(FW / iw, FH / ih); sw = FW / k; sh = FH / k; sx = (iw - sw) / 2; sy = (ih - sh) / 2; }
          else [sx, sy, sw, sh] = s.rect;
          g.drawImage(src, sx, sy, sw, sh, X0, y, FW, FH);
        }
        g.restore();
      });
      const fy = Y0 + 4 * FH + 3 * GAP + 56;
      g.textAlign = 'center'; g.fillStyle = fg; g.font = 'italic 500 50px "Cormorant Garamond", Georgia, serif';
      g.fillText(`${c.data.bride.short || c.data.bride.name} và ${c.data.groom.short || c.data.groom.name}`, 300, fy);
      g.fillStyle = soft; g.font = '500 24px "IBM Plex Mono", monospace';
      g.fillText(`${c.d}.${c.m}.${c.y}`, 300, fy + 50);
    };
    const ready = Promise.all([loadImg(PHOTO).then(i => { base = i; }).catch(() => {}), document.fonts?.load('italic 500 50px "Cormorant Garamond"').catch(() => {}), document.fonts?.load('500 24px "IBM Plex Mono"').catch(() => {})]).then(draw);
    const set = async (i, f) => { try { slots[i].img = await fromFile(f); draw(); } catch { msg.textContent = 'Không đọc được ảnh này, bạn thử ảnh khác nhé.'; } };
    const one = root.querySelector('[data-one]'), many = root.querySelector('[data-many]');
    let target = 0;
    root.querySelectorAll('.kw-slot').forEach(b => b.addEventListener('click', () => { target = +b.dataset.i; one.value = ''; one.click(); }));
    one.addEventListener('change', () => { if (one.files[0]) { set(target, one.files[0]); msg.textContent = ''; c.motion.tone('pop'); } });
    many.addEventListener('change', async () => { const fs = [...many.files].slice(0, 4); for (let i = 0; i < fs.length; i++) await set(i, fs[i]); if (fs.length) { msg.textContent = fs.length < 4 ? `Đã chọn ${fs.length} ảnh, các ô còn lại giữ ảnh của hai bạn.` : ''; c.motion.tone('pop'); } });
    root.querySelector('[data-act=multi]').addEventListener('click', () => { many.value = ''; many.click(); });
    root.querySelector('[data-act=reset]').addEventListener('click', () => { slots.forEach(s => { s.img = null; }); draw(); msg.textContent = ''; });
    root.querySelectorAll('[name=kwc]').forEach(r => r.addEventListener('change', () => { theme = r.value; draw(); }));
    const blob = () => new Promise(ok => cv.toBlob(ok, 'image/png'));
    const name = `khung-4-anh-${String(c.data.bride.short || 'a').toLowerCase().replace(/\s+/g, '-')}-${String(c.data.groom.short || 'b').toLowerCase().replace(/\s+/g, '-')}.png`;
    root.querySelector('[data-act=save]').addEventListener('click', async () => {
      await ready; const b = await blob(); if (!b) return;
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: name }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      msg.textContent = 'Đã lưu khung ảnh. Gắn thẻ chúng mình khi đăng nhé!'; c.motion.haptic('success'); c.motion.tone('chime');
    });
    const sh = root.querySelector('[data-act=share]');
    try { if (navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })) sh.hidden = false; } catch { /* no share */ }
    sh.addEventListener('click', async () => { const b = await blob(); try { await navigator.share({ files: [new File([b], name, { type: 'image/png' })], title: 'Khung ảnh từ đám cưới' }); } catch { /* cancelled */ } });
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    main.querySelectorAll('.eyebrow').forEach(n => { const t = n.textContent.trim(); if (EN_EYEBROWS[t]) n.textContent = EN_EYEBROWS[t]; });

    // hero: names write themselves, photo drifts
    const nm = main.querySelector('.kw-names');
    if (nm) { nm.querySelectorAll('span').forEach(s => { s.dataset.t = s.textContent; }); M.reveal(nm.querySelector('.a'), { mode: 'letters', stagger: 45, delay: 200 }); M.reveal(nm.querySelector('.b'), { mode: 'letters', stagger: 45, delay: 650 }); }
    const hero = main.querySelector('.kw-hero');
    if (hero) M.scrollProgress(hero, p => hero.style.setProperty('--sp', ((p - .5) * 2).toFixed(3)));

    // easter egg: tap KHUNG 24A three times for the bonus frame
    const exp = main.querySelector('.kw-exp'), bonus = main.querySelector('.kw-bonus');
    if (exp && bonus) { let taps = 0, t0 = 0; exp.addEventListener('click', () => { taps++; clearTimeout(t0); t0 = setTimeout(() => { taps = 0; }, 1300); M.tone('click'); if (taps >= 3) { taps = 0; bonus.classList.toggle('on'); M.tone('chime'); M.haptic('success'); } }); }

    // days together as a shutter counter
    const days = main.querySelector('.kw-days');
    if (days) M.inView(days, () => { days.classList.add('on'); const n = days.querySelector('.n'), to = +days.dataset.days; M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });

    // story frames drop one by one
    main.querySelectorAll('.kw-f').forEach((f, i) => M.inView(f, () => { f.style.transitionDelay = `${(i % 4) * 120}ms`; f.classList.add('in'); M.tone('click'); }, { threshold: .3 }));
    main.querySelectorAll('.kw-ev li, .kw-prof, .kw-song, .kw-maker').forEach(n => M.inView(n, () => n.classList.add('in'), { threshold: .15 }));

    const mk = main.querySelector('.kw-maker'); if (mk) maker(c, mk);

    // slide pager (02 / 19) once the hero has scrolled away
    const secs = [...main.querySelectorAll('.sec')];
    let pager = document.querySelector('.kw-pager');
    if (!pager) { pager = document.createElement('div'); pager.className = 'kw-pager'; pager.setAttribute('aria-hidden', 'true'); document.body.appendChild(pager); }
    const upd = () => {
      let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .45) cur = i; });
      pager.textContent = `${pad2(cur + 1)} / ${pad2(secs.length)}`; pager.classList.toggle('on', scrollY > innerHeight * .7);
    };
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  });

  // finale after RSVP: a fresh photo strip prints with the guest's name
  EA.onRsvp((entry, c) => {
    const M = EA.motion, yes = !(entry && entry.attending === false), name = String(entry?.name || '').trim() || 'Quý khách';
    const w = document.createElement('div'); w.className = 'kw-fin';
    const ks = ['up', 'face', 'hands', 'gown'];
    w.innerHTML = `<div class="kw-fin-bg"></div><div class="kw-flash on"></div>
      <div class="kw-fin-c" role="status"><div class="kw-fin-strip">${ks.map((k, i) => `<div class="kw-sf dev" style="--i:${i}">${crop(k)}</div>`).join('')}<p>${esc(name)}<br>${yes ? 'đã xác nhận<br>' : ''}${c ? `${c.d}.${c.m}.${c.y}` : ''}</p></div>
        <h3>${yes ? 'Khung hình của bạn đã sẵn sàng' : 'Cảm ơn bạn đã báo'}</h3><p>${yes ? 'Hẹn gặp bạn ngày vui.' : 'Chúng mình sẽ nhớ bạn lắm.'}</p>
        <div class="acts"><a class="btn" href="#kw-maker">Tạo khung ảnh của bạn</a><button class="btn ghost" type="button">Đóng</button></div></div>`;
    document.body.appendChild(w);
    const close = () => { w.classList.add('out'); setTimeout(() => w.remove(), 600); };
    w.querySelector('button').addEventListener('click', close); w.querySelector('a').addEventListener('click', close);
    w.addEventListener('click', ev => { if (ev.target.classList.contains('kw-fin-bg')) close(); });
    setTimeout(close, 12000);
    [0, 450, 900, 1350].forEach(t => setTimeout(() => M?.tone('click'), t)); M?.haptic('success'); setTimeout(() => M?.tone('chime'), 1500);
  });
})();
