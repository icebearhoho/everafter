// Tropical Destination: your boarding pass to the wedding.
// Cover: a boarding pass prints out of a slot. Wow: drag the brass stamp onto it (or tap): ĐÃ XÁC NHẬN is stamped, the pass flies off,
// a split-flap board spells the couple's names, and two planes fly from the hometowns to the venue.
// Ongoing: waves + monstera/palm parallax (scroll + tilt), split-flap board that re-spells the names. All art is CSS / inline SVG.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/tropical_dest_couple_1790233307535.jpg';
  const PW = 1200, PH = 896;
  const placeholder = s => !s || /picsum\.photos/.test(s);
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return placeholder(h) ? PHOTO : h; };
  const up = s => String(s ?? '').normalize('NFC').toLocaleUpperCase('vi');
  const strip = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  const fmtKm = n => (Math.round(n / 10) * 10).toLocaleString('vi-VN');

  // crops of the couple photo (x, y, w, h in source px) used where a real photo is not supplied
  const CROPS = { duo: [330, 30, 620, 840], face: [430, 90, 380, 380], bouquet: [470, 300, 420, 420], sea: [0, 0, 960, 540], hib: [0, 520, 520, 376], deck: [180, 380, 760, 516] };
  const crop = (name, cls = '') => {
    const [x, y, w, h] = CROPS[name];
    return `<span class="tp-crop ${cls}" style="aspect-ratio:${w}/${h}"><img src="${PHOTO}" alt="" loading="lazy" style="width:${(PW / w * 100).toFixed(2)}%;left:${(-x / w * 100).toFixed(2)}%;top:${(-y / h * 100).toFixed(2)}%"></span>`;
  };

  // ---------- svg artwork ----------
  const wave = (w, amp, len, y) => `M0 ${y} q${len / 4} ${-amp} ${len / 2} 0` + ` t${len / 2} 0`.repeat(Math.round(w / (len / 2)) - 1) + ` V200 H0Z`;
  const waveSvg = (cls, fill, amp, len, y) => `<svg class="tp-wv ${cls}" viewBox="0 0 ${len * 4} 200" preserveAspectRatio="none" aria-hidden="true"><path d="${wave(len * 4, amp, len, y)}" fill="${fill}"/></svg>`;
  const palm = () => {
    let d = '';
    const B = t => [t * 200, -t * t * 62 - t * 8], T = t => { const dx = 200, dy = -2 * t * 62 - 8, l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
    for (let i = 1; i <= 26; i++) {
      const t = i / 27, [bx, by] = B(t), [tx, ty] = T(t), len = 74 * Math.pow(Math.sin(Math.PI * Math.min(1, t * .92 + .05)), .8) + 6;
      [1, -1].forEach(s => {
        const nx = -ty * s, ny = tx * s, ex = bx + nx * len + tx * len * .55, ey = by + ny * len + ty * len * .55 + len * .22;
        d += `M${bx.toFixed(1)} ${by.toFixed(1)}Q${(bx + nx * len * .5 + tx * 4).toFixed(1)} ${(by + ny * len * .5 + ty * 4 - 3).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${(bx + nx * len * .55 + tx * len * .1).toFixed(1)} ${(by + ny * len * .55 + ty * len * .1 + 5).toFixed(1)} ${bx.toFixed(1)} ${(by + 1.4).toFixed(1)}Z`;
      });
    }
    return d;
  };
  document.body.insertAdjacentHTML('beforeend', `<svg class="tp-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="tp-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58b27e"/><stop offset=".55" stop-color="#2c8057"/><stop offset="1" stop-color="#175c3f"/></linearGradient>
    <linearGradient id="tp-pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f6c4a"/><stop offset="1" stop-color="#45a672"/></linearGradient>
    <mask id="tp-mk" maskUnits="userSpaceOnUse" x="-8" y="-8" width="116" height="116"><path d="M50 84C34 94 8 82 5 56 2 28 24 6 52 5 80 6 99 30 95 58 92 84 66 94 50 84Z" fill="#fff"/>
      <path d="M-4 28L35 42M-4 52L33 57M4 76L35 68M104 28L65 42M104 52L67 57M96 76L65 68" stroke="#000" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="39" cy="22" r="3.4"/><circle cx="61" cy="22" r="3.4"/><circle cx="41" cy="72" r="2.6"/><circle cx="59" cy="72" r="2.6"/></mask>
    <symbol id="tp-mon" viewBox="0 0 100 112"><path d="M50 84C50 96 48 105 45 112" stroke="#175c3f" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g mask="url(#tp-mk)"><path d="M50 84C34 94 8 82 5 56 2 28 24 6 52 5 80 6 99 30 95 58 92 84 66 94 50 84Z" fill="url(#tp-lg)"/>
      <path d="M50 84V10M50 70L20 58M50 56L16 44M50 42L24 28M50 70L80 58M50 56L84 44M50 42L76 28" stroke="rgba(255,255,255,.28)" stroke-width="1.2" fill="none"/></g></symbol>
    <symbol id="tp-palm" viewBox="-6 -100 232 150"><path d="${palm()}" fill="url(#tp-pg)"/><path d="M0 -8Q100 -70 200 -70" stroke="#1b5a3d" stroke-width="2.4" fill="none"/></symbol>
    <symbol id="tp-plane" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></symbol>
    <symbol id="tp-hib" viewBox="0 0 60 60"><g fill="#ee6d52"><ellipse cx="30" cy="14" rx="10" ry="14"/><ellipse cx="30" cy="14" rx="10" ry="14" transform="rotate(72 30 30)"/><ellipse cx="30" cy="14" rx="10" ry="14" transform="rotate(144 30 30)"/><ellipse cx="30" cy="14" rx="10" ry="14" transform="rotate(216 30 30)"/><ellipse cx="30" cy="14" rx="10" ry="14" transform="rotate(288 30 30)"/></g><circle cx="30" cy="30" r="6" fill="#9c2b1d"/><path d="M30 30L36 8" stroke="#ffd36a" stroke-width="2.4" stroke-linecap="round"/></symbol>
  </defs></svg>`);
  const leaf = (cls, sym, vb) => `<svg class="tp-lf ${cls}" viewBox="${vb}" aria-hidden="true"><use href="#${sym}"/></svg>`;
  const mon = cls => leaf(cls, 'tp-mon', '0 0 100 112');
  const pal = cls => leaf(cls, 'tp-palm', '-6 -100 232 150');
  const PLANE = cls => `<svg class="tp-pl ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#tp-plane"/></svg>`;
  const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- split-flap board ----------
  const FLAPCH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const cellHTML = ch => `<span class="fc" data-c="${esc(ch)}"><span class="h t"><s>${esc(ch)}</s></span><span class="h b"><s>${esc(ch)}</s></span><span class="h t f1"><s></s></span><span class="h b f2"><s></s></span></span>`;
  const flapHTML = (text, o = {}) => {
    const t = up(text).trim();
    const n = Math.max(...t.split(/\s+/).map(w => w.length), 1);
    const words = t.split(/\s+/).filter(Boolean);
    return `<span class="tp-flap ${o.cls || ''}" data-text="${esc(t)}" role="text" aria-label="${esc(text)}" style="--n:${o.n || Math.min(14, Math.max(7, t.length))}">${words.map(w => `<span class="fw">${[...w].map(ch => cellHTML(o.blank === false ? ch : ' ')).join('')}</span>`).join('')}</span>`;
  };
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setCell = (cell, ch) => {
    cell.dataset.c = ch;
    cell.querySelectorAll('.t:not(.f1) s, .b:not(.f2) s, .f2 s').forEach(s => { s.textContent = ch; });
  };
  const flipCell = (cell, ch) => {
    const old = cell.dataset.c;
    cell.dataset.c = ch;
    cell.querySelector('.t:not(.f1) s').textContent = ch;
    cell.querySelector('.f1 s').textContent = old;
    cell.querySelector('.f2 s').textContent = ch;
    cell.classList.remove('go'); void cell.offsetWidth; cell.classList.add('go');
    setTimeout(() => { cell.querySelector('.b:not(.f2) s').textContent = ch; }, 92);
  };
  // spell `text` into an existing flap element (rebuilds cells if the shape changed)
  const spell = (root, text, o = {}) => {
    const t = up(text).trim();
    if (root.dataset.text !== t) {
      const tpl = document.createElement('template');
      tpl.innerHTML = flapHTML(text, { cls: root.className.replace('tp-flap', '').trim(), n: +root.style.getPropertyValue('--n') || undefined });
      const nr = tpl.content.firstElementChild; root.replaceWith(nr); root = nr;
    }
    const cells = [...root.querySelectorAll('.fc')], chars = [...t.replace(/\s+/g, '')];
    if (reducedMotion()) { cells.forEach((cell, i) => setCell(cell, chars[i] || ' ')); return root; }
    cells.forEach((cell, i) => {
      let n = 3 + ((i * 7) % 5) + (o.rolls || 0);
      const run = () => {
        if (n-- > 0) { flipCell(cell, FLAPCH[(Math.random() * FLAPCH.length) | 0]); if (o.tick && i % 3 === 0) o.tick(); setTimeout(run, 78); }
        else flipCell(cell, chars[i] || ' ');
      };
      setTimeout(run, (o.delay || 0) + i * 52);
    });
    return root;
  };

  // ---------- trip data (hometowns -> venue) ----------
  const codeOf = name => {
    const w = strip(name).replace(/^tp\.?\s*/i, '').split(/\s+/).filter(Boolean);
    let s = w.map(x => x[0]).join('');
    if (s.length < 3) s += (w[w.length - 1] || '').slice(1, 1 + 3 - s.length);
    return (s + 'XXX').slice(0, 3).toUpperCase();
  };
  const tripOf = c => {
    const P = c.p, cp = c.config.couple, D = c.data, last = D.events[D.events.length - 1] || {};
    const homes = P.get('hometowns', {}), pins = P.get('hometownPins', {});
    const destName = cp.city || last.place || 'Nơi tổ chức';
    const destPin = P.get('venuePin', P.get('metPin', null));
    const from = ['bride', 'groom'].filter(k => homes[k]).map(k => {
      const km = pins[k] && destPin ? c.p.kmBetween(pins[k], destPin) : null;
      return { who: k === 'bride' ? 'Nhà gái' : 'Nhà trai', name: homes[k], code: codeOf(homes[k]), pin: pins[k] || null, km };
    });
    const real = from.length > 0;
    if (!real) from.push({ who: 'Bạn', name: 'Nhà của bạn', code: 'NHA', pin: null, km: null });
    // two hometowns with the same name would draw one route
    const uniq = from.filter((f, i) => from.findIndex(g => strip(g.name) === strip(f.name)) === i);
    return { from: uniq, real, dest: { name: destName, code: codeOf(destName), pin: destPin }, venue: last };
  };
  const flightNo = c => `TN${c.d}${c.m}`;
  const seatOf = c => `${+c.d}${'ABCDEF'[(+c.m) % 6]}`;
  const bcBars = seed => { let h = 7; for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0; let x = 0, out = ''; for (let i = 0; i < 46; i++) { h = (h * 1103515245 + 12345) >>> 0; const w = 1 + (h >>> 16) % 3; if (i % 2 === 0) out += `<rect x="${x}" y="0" width="${w}" height="40"/>`; x += w + 1; } return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">${out}</svg>`; };

  const seaHTML = () => `<div class="tp-sea" aria-hidden="true">${waveSvg('w3', 'rgba(111,197,193,.55)', 14, 160, 40)}${waveSvg('w2', 'rgba(36,128,134,.8)', 12, 130, 60)}${waveSvg('w1', '#0f5157', 10, 100, 84)}</div>`;

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc, P = c.p;
    const trip = tripOf(c), o1 = trip.from[0];
    const ev0 = D.events[0] || {};
    const names = `<span class="nb">${e(D.bride.name)}</span> <i>&amp;</i> <span class="nb">${e(D.groom.name)}</span>`;
    const venue = trip.venue.place || trip.dest.name;
    el.innerHTML = `<div class="tp-cover">
      <div class="tp-skyc" aria-hidden="true"><i class="sun"></i><i class="cl a"></i><i class="cl b"></i><i class="day"></i></div>
      <div class="tp-lfs" aria-hidden="true">${mon('m1')}${mon('m2')}${pal('p1')}${pal('p2')}${mon('m3')}</div>
      ${seaHTML()}
      <p class="tp-ceb">Gửi <b>${e(c.guest)}</b>, mời bạn lên chuyến bay đến ngày chung đôi</p>
      <div class="tp-slot" aria-hidden="true"></div>
      <div class="tp-pass" role="group" aria-label="Thẻ lên máy bay của ${e(c.guest)}">
        <div class="tp-pm">
          <div class="tp-ph">${PLANE('')}<b>Bay Trăm Năm</b><span>Thẻ lên máy bay</span></div>
          <div class="tp-rt"><div><b>${o1.code}</b><span>${e(o1.name)}</span></div><div class="ln" aria-hidden="true"><i></i>${PLANE('')}<i></i></div><div class="r"><b>${trip.dest.code}</b><span>${e(trip.dest.name)}</span></div></div>
          <p class="tp-nm">${names}</p>
          <dl class="tp-fd">
            <div class="w2"><dt>Hành khách</dt><dd>${e(c.guest)}</dd></div>
            <div><dt>Chuyến bay</dt><dd>${flightNo(c)}</dd></div>
            <div><dt>Ngày</dt><dd>${c.d}.${c.m}.${c.y}</dd></div>
            <div><dt>Giờ</dt><dd>${e(ev0.time || '')}</dd></div>
            <div><dt>Ghế</dt><dd>${seatOf(c)}</dd></div>
            <div class="w3 vn"><dt>Cổng đến</dt><dd>${e(venue)}</dd></div>
          </dl>
          <svg class="tp-stamp" viewBox="0 0 140 140" aria-hidden="true"><defs><path id="tp-arc" d="M70 70m-50 0a50 50 0 1 1 100 0a50 50 0 1 1-100 0"/></defs>
            <circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="70" cy="70" r="56" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <text font-size="13.5" font-weight="700" letter-spacing="2.4" fill="currentColor"><textPath href="#tp-arc" startOffset="0">ĐÃ XÁC NHẬN · ĐẾN DỰ TIỆC · </textPath></text>
            <path d="M44 72l18 18 36-40" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="tp-perf" aria-hidden="true"></div>
        <div class="tp-stub"><span class="bc">${bcBars(c.guest + c.d)}</span><span class="sn">${flightNo(c)} · ${seatOf(c)}</span></div>
      </div>
      <div class="tp-stampbar">
        <button class="tp-handle" type="button" aria-label="Kéo con dấu lên thẻ để xác nhận"><svg viewBox="0 0 80 96" aria-hidden="true"><defs><linearGradient id="tp-br" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98234"/><stop offset=".45" stop-color="#f7dc93"/><stop offset="1" stop-color="#9a6a24"/></linearGradient></defs>
          <ellipse cx="40" cy="26" rx="22" ry="22" fill="url(#tp-br)"/><rect x="33" y="40" width="14" height="28" rx="4" fill="url(#tp-br)"/><rect x="8" y="66" width="64" height="16" rx="5" fill="#16393b"/><rect x="8" y="62" width="64" height="8" rx="4" fill="url(#tp-br)"/><ellipse cx="32" cy="18" rx="7" ry="9" fill="rgba(255,255,255,.35)"/></svg></button>
        <p class="tp-hint">Kéo con dấu lên thẻ, hoặc chạm vào nút bên dưới</p>
      </div>
      <button class="open-btn" type="button">Đóng dấu và cất cánh</button>
      <p class="tp-cdate">${c.dow} · ${c.dateText}</p>
      <div class="tp-flash" aria-hidden="true"></div>
      <div class="tp-board" aria-hidden="true"><p>Chuyến bay ${flightNo(c)} · ${e(trip.dest.name)}</p>
        ${flapHTML(D.bride.name, { cls: 'big', n: Math.max(D.bride.name.length, D.groom.name.length) })}<span class="am">và</span>${flapHTML(D.groom.name, { cls: 'big', n: Math.max(D.bride.name.length, D.groom.name.length) })}
        <p class="dt">${c.dow} · ${c.dateText}</p></div>
      <svg class="tp-fl" aria-hidden="true"></svg>
      <div class="tp-pins" aria-hidden="true"></div>
    </div>`;
    const root = el.querySelector('.tp-cover'), pass = el.querySelector('.tp-pass'), handle = el.querySelector('.tp-handle');
    const openBtn = el.querySelector('.open-btn'), board = el.querySelector('.tp-board'), svg = el.querySelector('.tp-fl'), pins = el.querySelector('.tp-pins');
    if (M.tier === 'low') root.classList.add('is-low');
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });
    // the pass prints out of the slot
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('printed')));

    const fly = () => {
      const W = root.clientWidth, H = root.clientHeight, ns = 'http://www.w3.org/2000/svg';
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
      const dest = { x: W * .5, y: H * .54 }, n = trip.from.length;
      const starts = n === 1 ? [{ x: W * .16, y: H * .9 }] : [{ x: W * .12, y: H * .9 }, { x: W * .88, y: H * .92 }];
      pins.innerHTML = `<span class="pn dst" style="left:${dest.x}px;top:${dest.y}px"><i></i><b>${e(trip.dest.name)}</b></span>` + trip.from.map((f, i) =>
        `<span class="pn org ${i ? 'r' : ''}" style="left:${starts[i].x}px;top:${starts[i].y}px"><i></i><b>${e(f.name)}</b>${f.km ? `<small class="km" data-km="${Math.round(f.km / 10) * 10}">0 km</small>` : ''}</span>`).join('');
      void pins.offsetWidth; pins.classList.add('on');
      const legs = starts.map((s, i) => {
        const cx = i ? W * .96 : W * .02, cy = H * .5 - i * H * .04;
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', `M${s.x} ${s.y} Q${cx} ${cy} ${dest.x} ${dest.y}`); path.setAttribute('class', 'trail');
        const len = path.getTotalLength(); path.style.strokeDasharray = `7 9`; svg.appendChild(path);
        const mask = document.createElementNS(ns, 'path'); mask.setAttribute('d', path.getAttribute('d')); mask.setAttribute('class', 'trail solid'); mask.style.strokeDasharray = len; mask.style.strokeDashoffset = len; svg.appendChild(mask);
        const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'pln'); g.innerHTML = '<use href="#tp-plane" width="34" height="34" x="-17" y="-17"/>'; svg.appendChild(g);
        return { path, mask, g, len, i };
      });
      const kms = [...pins.querySelectorAll('.km')];
      return M.tween(0, 1, 1600, 'inOut', t => {
        legs.forEach(L => {
          const p = L.path.getPointAtLength(L.len * t), q = L.path.getPointAtLength(Math.min(L.len, L.len * t + 2));
          const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90;
          L.g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang}) scale(${1 - t * .25})`);
          L.mask.style.strokeDashoffset = L.len * (1 - t);
        });
        kms.forEach(k => { k.textContent = Math.round(+k.dataset.km * t).toLocaleString('vi-VN') + ' km'; });
      });
    };

    let started = false;
    const go = () => {
      if (started) return;
      started = true; openBtn.disabled = true; handle.disabled = true;
      EA.music(); M.requestTilt();
      root.classList.add('is-go');
      c.after(0, () => { handle.style.transition = 'transform .2s cubic-bezier(.5,0,.8,.4)'; handle.style.transform = `translateY(${-root.dist}px)`; });
      c.after(210, () => { root.classList.add('stamped'); M.haptic('thud'); M.tone('thud'); });
      c.after(520, () => root.classList.add('lifted'));
      c.after(800, () => { root.classList.add('boarding'); M.tone('whoosh'); });
      c.after(1150, () => {
        const tick = () => M.tone('click');
        spell(board.querySelectorAll('.tp-flap')[0], D.bride.name, { tick, rolls: 2 });
        spell(board.querySelectorAll('.tp-flap')[1], D.groom.name, { tick, rolls: 2, delay: 260 });
        M.haptic('crack');
      });
      c.after(2100, () => { root.classList.add('flying'); M.tone('whoosh'); fly().then(() => { root.classList.add('landed'); M.tone('chime'); M.haptic('success'); }); });
      c.after(4200, () => { offTilt(); open(); });
    };
    root.dist = 150;
    M.drag(handle, {
      axis: 'y', distance: 150, invert: true,
      onMove: p => { handle.style.transition = 'none'; handle.style.transform = `translateY(${-p * 150}px)`; if (p > .02) root.classList.add('is-drag'); },
      onEnd: p => { if (p > .5) go(); else if (!started) { handle.style.transition = 'transform .35s cubic-bezier(.3,1.4,.5,1)'; handle.style.transform = ''; root.classList.remove('is-drag'); } }
    });
    handle.addEventListener('click', () => go());
    openBtn.addEventListener('click', () => go());
    handle.addEventListener('pointerdown', () => { M.requestTilt(); M.haptic('tap'); M.tone('click'); });
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="tp-hd"><span class="tp-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</span><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${sub ? `<span class="tp-sub">${sub}</span>` : ''}</header>`;
  };
  const skyBits = () => `<div class="tp-hsky" aria-hidden="true"><i class="sun"></i><i class="cl a"></i><i class="cl b"></i></div>`;

  // ---- hero: the couple through the cabin window + a split-flap board ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, trip = tripOf(c);
    const nn = Math.max(D.bride.name.length, D.groom.name.length);
    return `<div class="tp-hero">
      ${skyBits()}
      <div class="tp-hlf" aria-hidden="true">${pal('p1 par')}${mon('m1 par')}${mon('m2 par')}${pal('p2 par')}${leaf('hb par', 'tp-hib', '0 0 60 60')}</div>
      <div class="tp-hwrap">
        <p class="tp-eb on-dark">${e(mc.eyebrow || 'Chuyến bay đến ngày chung đôi')}</p>
        <div class="tp-win"><div class="tp-wi"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"><i class="tp-blind"></i>${PLANE('tp-wpl')}</div></div>
        <div class="tp-names" aria-label="${e(D.bride.name)} và ${e(D.groom.name)}">
          <p class="lbl">Cô dâu</p>${flapHTML(D.bride.name, { cls: 'big', n: nn, blank: false })}
          <p class="lbl">Chú rể</p>${flapHTML(D.groom.name, { cls: 'big', n: nn, blank: false })}
        </div>
        ${cp.headline ? `<p class="tp-headline">${c.t(cp.headline)}</p>` : ''}
        <button class="tp-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(trip.dest.name)}</span>` : ''}</button>
        ${mc.showCountdown !== false ? ui.countdown() : ''}
      </div>
      ${seaHTML()}
    </div>`;
  });

  // ---- invitation: the letter + giờ bay chung (needs metDate) ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether;
    const met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <article class="tp-letter">
        <span class="tp-eb">Thư mời</span>
        <p class="tp-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
        ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
        <p class="sg">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
      </article>
      ${days ? `<div class="tp-days" data-days="${days}">
        <span class="tp-eb">Tổng thời gian bay chung</span>
        ${flapHTML(String(days), { cls: 'num', n: 6 })}
        <p>ngày bên nhau, tính từ ${met.split('-').reverse().join('.')}${place ? ` · ${e(place)}` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  // ---- story: four postcards + split-flap list of places ----
  EA.section('story', c => {
    const { esc: e, mod } = c, s = mod.content, chs = s.chapters || [];
    const crops = ['face', 'deck', 'bouquet', 'sea'];
    const places = c.p.get('places', []);
    const prev = places.map((pl, i) => i && pl.lat != null && places[i - 1].lat != null ? c.p.kmBetween(places[i - 1], pl) : null);
    return `<div class="wrap">
      ${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="tp-pc">
        ${chs.map((ch, i) => `<li class="tp-postcard"><figure>${ch.image && !placeholder(ch.image) ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : crop(crops[i % 4])}<i class="stm" aria-hidden="true">${PLANE('')}</i></figure>
          <div><span class="tp-tag">${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}
      </ol>
      ${s.quote ? `<p class="tp-sq">${e(s.quote)}</p>` : ''}
      ${places.length ? `<div class="tp-places" id="tp-places">
        <span class="tp-eb on-dark">Những nơi mình đã cùng đi qua</span>
        <h3>${places.length} điểm đến, một hành trình</h3>
        <ol class="tp-pb">${places.map((pl, i) => `<li><span class="no">${String(i + 1).padStart(2, '0')}</span>${flapHTML(pl.name, { cls: 'pl', n: 15 })}<span class="mt">${pl.date ? e(pl.date.split('-').reverse().join('.')) : ''}${prev[i] ? ` · ${fmtKm(prev[i])} km` : ''}</span></li>`).join('')}</ol>
        <p class="tp-pn">Tiếp theo: <b>ngày chung đôi</b></p>
      </div>` : ''}
    </div>`;
  });

  // ---- events: one boarding pass per ceremony + travel info for out-of-town guests ----
  const TRAVEL_RX = /sân bay|khách sạn|lưu trú|di chuyển|ở xa|taxi|grab|đỗ xe|đậu xe|xe buýt|ga tàu|bến xe/i;
  const mapSvg = (trip, sid) => {
    const pts = [...trip.from.map(f => f.pin), trip.dest.pin].filter(Boolean);
    if (pts.length < 2 || !trip.dest.pin) return '';
    const W = 320, H = 250, pad = 38;
    const lats = pts.map(p => p.lat), lngs = pts.map(p => p.lng);
    let dLat = Math.max(...lats) - Math.min(...lats), dLng = Math.max(...lngs) - Math.min(...lngs);
    const k = Math.cos(Math.PI * (lats.reduce((a, b) => a + b, 0) / lats.length) / 180);
    dLng *= k; if (dLng < dLat * .55) dLng = dLat * .55;
    const sc = Math.min((W - pad * 2) / dLng, (H - pad * 2) / dLat), cx = (Math.max(...lngs) + Math.min(...lngs)) / 2, cy = (Math.max(...lats) + Math.min(...lats)) / 2;
    const P = p => [W / 2 + (p.lng - cx) * k * sc, H / 2 - (p.lat - cy) * sc];
    const [dx, dy] = P(trip.dest.pin);
    const legs = trip.from.filter(f => f.pin).map((f, i) => {
      const [x, y] = P(f.pin), mx = (x + dx) / 2 + (i ? 46 : -46), my = (y + dy) / 2;
      const d = `M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}`;
      return `<path id="${sid}${i}" d="${d}" class="rt"/><use href="#tp-plane" width="22" height="22" x="-11" y="-11" class="mp"><animateMotion dur="${5 + i}s" repeatCount="indefinite" rotate="auto" path="${d}"/></use>
        <g class="pn"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/><text x="${(x + (x > W / 2 ? -10 : 10)).toFixed(1)}" y="${(y + (Math.hypot(x - dx, y - dy) < 60 ? 22 : 4)).toFixed(1)}" text-anchor="${x > W / 2 ? 'end' : 'start'}">${esc(f.name)}</text></g>`;
    }).join('');
    const reduced = reducedMotion();
    return `<svg class="tp-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lộ trình từ quê hai họ về nơi tổ chức">
      ${Array.from({ length: 7 }, (_, i) => `<path d="M0 ${20 + i * 36}H${W}" class="gr"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<path d="M${30 + i * 65} 0V${H}" class="gr"/>`).join('')}
      ${reduced ? legs.replace(/<animateMotion[^>]*\/>/g, '') : legs}
      <g class="pn d"><circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="7"/><circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="13" class="ring"/><text x="${dx.toFixed(1)}" y="${(dy - 20).toFixed(1)}" text-anchor="middle">${esc(trip.dest.name)}</text></g>
    </svg>`;
  };
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c, trip = tripOf(c);
    const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dateOf = ev => { const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date; const [y, m, d] = iso.split('-'); return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`; };
    const tips = (c.mods.faq?.content?.items || []).filter(f => TRAVEL_RX.test(f.q + ' ' + f.a)).slice(0, 4);
    const last = D.events[D.events.length - 1];
    const reach = trip.from.filter(f => f.km);
    const hrs = km => km > 350 ? `khoảng ${Math.max(1, Math.round(km / 700 + .8))} giờ bay` : `khoảng ${Math.max(1, Math.round(km / 55))} giờ đi xe`;
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Lịch bay của ngày chung đôi')}
      <div class="tp-tix">
        ${D.events.map((ev, i) => `<article class="tp-tk">
          <div class="top"><span>${PLANE('')}Thẻ lên máy bay</span><b>${flightNo(c)}-${i + 1}</b></div>
          <div class="bd">
            <h3>${e(ev.title)}</h3><p class="lb">${e(ev.label)}</p>
            <dl><div><dt>Giờ</dt><dd class="tm">${e(ev.time)}</dd></div><div><dt>Ngày</dt><dd>${dateOf(ev)}</dd></div></dl>
            <p class="pl"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>
            ${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}
          </div>
          <div class="pf" aria-hidden="true"></div>
          <div class="ft">${ui.actions(ev)}</div>
        </article>`).join('')}
      </div>
      <div class="tp-travel">
        <span class="tp-eb">Dành cho khách đi xa</span>
        <h3>${trip.real ? 'Hai quê, một điểm đến' : 'Thông tin đi lại'}</h3>
        ${mapSvg(trip, 'tpr')}
        ${reach.length ? `<ul class="tp-km">${reach.map(f => `<li><b>${e(f.name)}</b><span>cách ${e(trip.dest.name)} khoảng ${fmtKm(f.km)} km, ${hrs(f.km)}</span></li>`).join('')}</ul>` : ''}
        ${tips.length ? `<div class="tp-tips">${tips.map(f => `<div><h4>${e(f.q)}</h4><p>${e(f.a)}</p></div>`).join('')}</div>` : ''}
        ${last ? `<div class="actions center"><a class="btn" href="${ui.mapUrl(last)}" target="_blank" rel="noopener">Chỉ đường đến ${e(last.place)}</a></div>` : ''}
      </div>
    </div>`;
  });

  // ---- dress code as a packing list ----
  EA.section('dressCode', c => {
    const { data: D, esc: e } = c;
    const items = [...D.dressCode.map(s => ({ t: `Chọn trang phục tông ${s.name}`, sw: s.color })), ...D.notes.map(n => ({ t: n }))];
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('tp-pack') || '[]'); } catch { /* none */ }
    return `<div class="wrap narrow">
      ${head(c, 'Trang phục và lưu ý', 'Hành lý của bạn', 'Soạn đồ trước chuyến đi, chạm để đánh dấu')}
      <div class="tp-bag">
        <div class="tp-lt"><span class="hole"></span><b>Hành lý xách tay</b><span>${e(c.guest)} · ${flightNo(c)}</span></div>
        <ul class="tp-pack">${items.map((it, i) => `<li><label><input type="checkbox" data-i="${i}"${saved.includes(i) ? ' checked' : ''}><span class="bx">${ICON_CHECK}</span>${it.sw ? `<i class="sw" style="background:${e(it.sw)}"></i>` : ''}<span class="tx">${e(it.t)}</span></label></li>`).join('')}</ul>
        <p class="tp-ready"><b>Sẵn sàng cất cánh</b><span class="ct">0/${items.length}</span></p>
        <svg class="tp-ok" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="70" cy="70" r="56" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M44 72l18 18 36-40" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>`;
  });

  // ---- gallery: postcards ----
  EA.section('gallery', c => {
    const keys = ['sea', 'duo', 'bouquet', 'hib', 'face', 'deck'];
    return `<div class="wrap">
      ${head(c, 'Khoảnh khắc', 'Bưu thiếp từ thiên đường')}
      <div class="tp-cards">${c.data.photos.map((p, i) => placeholder(p.src)
        ? `<figure class="tp-card" style="--r:${[-2.2, 1.8, -1.2, 2.4][i % 4]}deg">${crop(keys[i % keys.length])}<figcaption>${esc(p.caption)}</figcaption><i class="stm" aria-hidden="true">${PLANE('')}</i></figure>`
        : `<div class="tp-card" style="--r:${[-2.2, 1.8, -1.2, 2.4][i % 4]}deg">${c.ui.photo(p, i)}<i class="stm" aria-hidden="true">${PLANE('')}</i></div>`).join('')}</div>
    </div>`;
  });

  // ---- thanks: landing ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, trip = tripOf(c);
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    const song = c.p.get('song', null);
    return `<div class="tp-bye">
      ${skyBits()}
      <div class="tp-hlf" aria-hidden="true">${mon('m1 par')}${pal('p1 par')}${pal('p2 par')}${mon('m2 par')}</div>
      <div class="tp-byew">
        <span class="tp-eb on-dark">Lời cảm ơn</span>
        <p class="tp-landing">Máy bay sắp hạ cánh tại ${e(trip.dest.name)}</p>
        ${flapHTML('Hẹn gặp ' + guest, { cls: 'big', n: Math.max(12, ('Hẹn gặp ' + guest).split(' ').reduce((m, w) => Math.max(m, w.length), 0)) })}
        <p class="tx">${e(D.thanks)}</p>
        ${mod.content.signature ? `<p class="sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
        ${song ? `<p class="song">Bản nhạc trên chuyến bay: <b>${e(song.title)}</b>${song.artist ? ` · ${e(song.artist)}` : ''}</p>` : ''}
        <div class="actions center">
          <button class="btn" type="button" id="reopen">Bay lại từ đầu ${EA.icon('replay')}</button>
          <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
        </div>
        <p class="tp-bd">${c.dow} · ${c.dateText}</p>
      </div>
      ${seaHTML()}
    </div>`;
  });

  // ======================= behaviours =======================
  const EN_EYEBROWS = { 'Love story': 'Chuyện tình', 'Save the date': 'Ghi nhớ ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khoảnh khắc', 'Dress code & notes': 'Trang phục và lưu ý', 'Wedding guide': 'Cẩm nang', RSVP: 'Xác nhận tham dự', 'Gift registry': 'Gợi ý quà', Guestbook: 'Sổ lưu bút', Contact: 'Liên hệ', 'Thank you': 'Lời cảm ơn', 'A note from us': 'Lời nhắn', 'Save our date': 'Ngày chung đôi' };

  EA.afterRender((c, main) => {
    const M = c.motion;
    // core ships English default eyebrows: localise any that remain
    main.querySelectorAll('.eyebrow').forEach(n => { const t = n.textContent.trim(); if (EN_EYEBROWS[t]) n.textContent = EN_EYEBROWS[t]; });
    // tier-aware: calm the idle sway on weak devices
    const tierSync = () => document.documentElement.classList.toggle('tp-low', M.tier === 'low');
    tierSync(); setTimeout(tierSync, 2500);

    // scroll parallax for leaves and waves in hero / thanks
    main.querySelectorAll('.tp-hero, .tp-bye').forEach(sc => M.scrollProgress(sc, p => sc.style.setProperty('--sp', ((p - .5) * 2).toFixed(3))));
    M.tilt(({ x, y }) => { main.style.setProperty('--tx', x.toFixed(3)); main.style.setProperty('--ty', y.toFixed(3)); });

    // split-flap: spell each board when it scrolls into view
    main.querySelectorAll('.tp-flap').forEach(f => {
      if (f.closest('.tp-names')) return;
      const text = f.dataset.text, ph = f.closest('.tp-pb');
      M.inView(f, () => spell(f, text, { delay: ph ? 100 : 200, rolls: ph ? 0 : 2 }), { threshold: .6 });
    });
    // hero board re-spells now and then
    if (main.querySelector('.tp-names') && !c.reduced) {
      let k = 0;
      setInterval(() => {
        if (document.hidden || scrollY > innerHeight * .8 || M.tier === 'low') return;
        const f = main.querySelectorAll('.tp-names .tp-flap')[k++ % 2];
        if (f) spell(f, f.dataset.text, { rolls: 0 });
      }, 7000);
    }

    // easter egg: tap the names three times, the board flips to the nicknames (or the lunar date)
    const board = main.querySelector('.tp-names');
    if (board) {
      let taps = 0, t0 = 0, shown = false;
      const nb = c.p.get('traits.bride.nickname', ''), ng = c.p.get('traits.groom.nickname', ''), lunar = c.config.couple.lunarDate;
      board.addEventListener('click', () => {
        taps++; clearTimeout(t0); t0 = setTimeout(() => { taps = 0; }, 1200); M.tone('click');
        if (taps < 3) return; taps = 0; shown = !shown;
        const rows = board.querySelectorAll('.tp-flap');
        const A = shown ? (nb || c.data.bride.name) : c.data.bride.name, B = shown ? (ng || (nb ? c.data.groom.name : lunar || c.data.groom.name)) : c.data.groom.name;
        const lbl = board.querySelectorAll('.lbl');
        lbl[0].textContent = shown && nb ? 'Ở nhà gọi là' : 'Cô dâu'; lbl[1].textContent = shown && (ng || lunar) ? (ng ? 'Ở nhà gọi là' : 'Âm lịch') : 'Chú rể';
        spell(rows[0], A, { rolls: 3, tick: () => M.tone('click') }); spell(rows[1], B, { rolls: 3, delay: 200 });
        M.haptic('success'); M.tone('chime');
      });
    }

    // packing list: tick items, remember them, stamp when everything is packed
    const bag = main.querySelector('.tp-bag');
    if (bag) {
      const boxes = [...bag.querySelectorAll('input')], ct = bag.querySelector('.ct');
      const sync = quiet => {
        const n = boxes.filter(b => b.checked).length;
        ct.textContent = `${n}/${boxes.length}`;
        const done = n === boxes.length;
        if (done && !bag.classList.contains('all') && !quiet) { M.haptic('success'); M.tone('chime'); }
        bag.classList.toggle('all', done);
        try { localStorage.setItem('tp-pack', JSON.stringify(boxes.map((b, i) => b.checked ? i : -1).filter(i => i >= 0))); } catch { /* ignore */ }
      };
      boxes.forEach(b => b.addEventListener('change', () => { M.tone('pop'); M.haptic('tap'); sync(); }));
      sync(true);
    }

    // route map and travel block draw in
    const tr = main.querySelector('.tp-travel');
    if (tr) M.inView(tr, () => tr.classList.add('on'), { threshold: .3 });
    const pc = main.querySelectorAll('.tp-postcard, .tp-card');
    pc.forEach(n => M.inView(n, () => n.classList.add('in'), { threshold: .25 }));
    const tk = main.querySelectorAll('.tp-tk');
    tk.forEach(n => M.inView(n, () => n.classList.add('in'), { threshold: .2 }));
  });

  // finale after RSVP: the pass is checked in, a plane crosses the sky, hibiscus petals fall
  EA.onRsvp((entry, c) => {
    const M = EA.motion, yes = !(entry && entry.attending === false);
    const name = String(entry?.name || '').trim() || 'Quý khách';
    const trip = c ? tripOf(c) : null;
    const wrap = document.createElement('div');
    wrap.className = 'tp-fin';
    wrap.innerHTML = `<div class="tp-fin-bg"></div>${PLANE('tp-fin-pl')}
      <div class="tp-fin-pass" role="status"><div class="hd">${PLANE('')}<b>Bay Trăm Năm</b></div>
        <p class="sm">${yes ? 'Đã làm thủ tục lên máy bay' : 'Cảm ơn bạn đã báo'}</p>
        <p class="nm">${esc(name)}</p>
        <p class="rt">${yes ? (trip ? `Hẹn gặp bạn tại ${esc(trip.dest.name)}` : 'Hẹn gặp bạn ngày vui') : 'Chúng mình sẽ nhớ bạn lắm'}</p>
        ${yes ? `<svg class="tp-fin-st" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="64" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="70" cy="70" r="56" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M44 72l18 18 36-40" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
        <button class="btn" type="button">Đóng</button></div>
      ${yes ? Array.from({ length: 14 }, (_, i) => `<svg class="tp-petal" viewBox="0 0 60 60" aria-hidden="true" style="--x:${(i * 7.3 + 4) % 100}vw;--d:${(i % 5) * .45}s;--s:${22 + (i % 4) * 8}px"><use href="#tp-hib"/></svg>`).join('') : ''}`;
    document.body.appendChild(wrap);
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 600); };
    wrap.querySelector('.btn').addEventListener('click', close);
    wrap.addEventListener('click', ev => { if (ev.target === wrap || ev.target.classList.contains('tp-fin-bg')) close(); });
    setTimeout(close, 9000);
    M?.haptic('success'); M?.tone('chime'); setTimeout(() => M?.tone('whoosh'), 250); setTimeout(() => M?.tone('thud'), 900);
  });
})();
