// Washi Ikebana Zen: "Nhất kỳ nhất hội" - one meeting, one lifetime.
// Cover: washi paper, a pencil-faint circle. Press and hold (slow breath): a sumi brush draws the ensō in ONE stroke,
//        three stems are placed one by one in a shallow dish, then a vermilion hanko with the couple's initials stamps down.
// Everything is inline SVG / CSS. The only CJK glyphs are a few kanji loaded with a separate &text= font link.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/washi_zen_couple_1790233224595.jpg';
  const photoOf = c => {
    const h = c.config.couple.heroImage || '';
    return !h || /picsum\.photos/.test(h) ? PHOTO : h;
  };
  const DOWS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // kanji glyphs only (separate link, not the registry fonts entry)
  try {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500&display=swap&text=' +
      encodeURIComponent('一期会二三四五和敬清寂円相');
    document.head.appendChild(l);
  } catch { /* offline */ }

  document.body.insertAdjacentHTML('beforeend', `<svg class="ws-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
    <filter id="ws-ink" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ws-stamp" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 4.2 -1.05" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="s"/><feGaussianBlur in="s" stdDeviation=".35"/></filter>
  </defs></svg>`);

  // ---------- the ensō: one brush stroke, drawn as a variable-width polygon so it can grow with p (0..1) ----------
  const TH0 = -1.9, SWEEP = 5.8, CX = 242, CY = 256, R0 = 188;
  const widthAt = t => {
    const up = t < .07 ? .2 + .8 * Math.sin(t / .07 * Math.PI / 2) : 1;
    const down = t > .52 ? 1 - .8 * Math.pow((t - .52) / .48, 1.35) : 1;
    return 27 * up * down * (1 + .07 * Math.sin(t * 23));
  };
  const pt = (t, off) => {
    const a = TH0 + SWEEP * t, r = R0 * (1.03 - .09 * t + .012 * Math.sin(t * 9)) + off;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  };
  const BRISTLES = [[-.38, 1.05], [-.2, 1.02], [-.02, 1.07], [.16, 1.0], [.33, 1.04], [.45, .98]];
  function ensoPaths(p) {
    const n = Math.max(2, Math.ceil(150 * p)), out = [], inn = [];
    for (let i = 0; i <= n; i++) {
      const t = Math.min(p, i / 150), w = widthAt(t) / 2;
      out.push(pt(t, w)); inn.push(pt(t, -w));
    }
    const f = a => a.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L');
    const body = p <= 0 ? '' : 'M' + f(out) + 'L' + f(inn.reverse()) + 'Z';
    const bris = BRISTLES.map(([u, e]) => {
      const tEnd = p * e, a = [];
      if (tEnd <= .45) return '';
      for (let t = .45; t <= tEnd; t += .01) a.push(pt(t, u * widthAt(Math.min(t, 1)) * 1.1));
      return 'M' + f(a);
    });
    return { body, bris };
  }
  const ensoSVG = (cls = '', extra = '', p = 1) => {
    const s = ensoPaths(p);
    return `<svg class="ws-enso ${cls}" viewBox="0 0 500 500" aria-hidden="true" focusable="false">
      <circle class="ws-guide" cx="250" cy="250" r="188"/>
      <g class="ws-ink"><path class="wet" d="${s.body}"/><path class="body" filter="url(#ws-ink)" d="${s.body}"/>
      <g class="bris">${s.bris.map(d => `<path d="${d}"/>`).join('')}</g></g>${extra}</svg>`;
  };
  const paintEnso = (svg, p) => {
    const s = ensoPaths(p);
    svg.querySelector('.wet').setAttribute('d', s.body);
    svg.querySelector('.body').setAttribute('d', s.body);
    svg.querySelectorAll('.bris path').forEach((el, i) => el.setAttribute('d', s.bris[i] || ''));
  };

  // ---------- ikebana in a shallow dish: shin (tall), soe (leaning), hikae (low) ----------
  const VASE = `<g class="ws-vase">
    <g class="ws-dish"><ellipse cx="250" cy="402" rx="82" ry="11" class="rim"/><path d="M168 402 Q250 438 332 402 Q320 428 250 432 Q180 428 168 402Z" class="bowl"/><path d="M196 401 Q250 410 304 401" class="water"/></g>
    <g class="ws-stem s1"><path class="st" pathLength="1" d="M250 400 C253 330 244 245 262 152"/>
      <g class="bl" transform="translate(263 140)"><g class="petals">${[0, 72, 144, 216, 288].map(r => `<ellipse rx="15" ry="24" transform="rotate(${r}) translate(0 -13)"/>`).join('')}</g><circle r="6.5" class="ctr"/><path class="sta" d="M-4 -3l-3 -6M0 -4v-8M4 -3l3 -6"/></g></g>
    <g class="ws-stem s2"><path class="st" pathLength="1" d="M246 400 C238 345 214 292 176 240"/>
      <g class="bl lf"><path d="M228 308 C196 292 160 300 136 332 C168 322 202 322 228 308Z"/><path d="M214 286 C198 258 170 244 138 252 C164 262 190 270 214 286Z"/><path d="M234 346 C262 326 296 326 318 346 C290 346 258 350 234 346Z"/></g>
      <g class="bl" transform="translate(174 238)"><circle r="8" class="bud"/><path d="M-2 6l-5 10" class="tw"/></g></g>
    <g class="ws-stem s3"><path class="st" pathLength="1" d="M258 400 C270 364 300 334 338 314"/>
      <g class="bl lf"><path d="M284 354 C300 330 330 322 356 332 C334 342 308 350 284 354Z"/></g>
      <g class="bl" transform="translate(340 311)"><circle r="10" class="bud"/><circle r="3" class="ctr"/></g></g>
  </g>`;

  // ---------- hanko ----------
  const initials = (c, who) => {
    const D = c.data[who], nm = String(D.short || D.name || '').trim().split(/\s+/).pop() || '?';
    return Array.from(nm)[0].toUpperCase();
  };
  const initOf = name => {
    const w = String(name || '').trim().split(/\s+/).filter(Boolean);
    const first = w[0] ? Array.from(w[0])[0] : '?', last = w.length > 1 ? Array.from(w[w.length - 1])[0] : '';
    return [first.toUpperCase(), (last || '').toUpperCase()];
  };
  const hankoSVG = (a, b, shape = 'sq') => {
    const frame = {
      sq: '<rect x="3" y="3" width="94" height="94" rx="7"/><rect x="11" y="11" width="78" height="78" rx="3" class="in"/>',
      round: '<circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="38" class="in"/>',
      oval: '<rect x="14" y="2" width="72" height="96" rx="36"/><rect x="21" y="9" width="58" height="82" rx="29" class="in"/>'
    }[shape] || '';
    const txt = shape === 'round'
      ? `<text x="30" y="64" class="ch" text-anchor="middle">${esc(a)}</text><text x="70" y="64" class="ch" text-anchor="middle">${esc(b)}</text><path d="M50 30v40" class="dv"/>`
      : `<text x="50" y="45" class="ch" text-anchor="middle">${esc(a)}</text><text x="50" y="83" class="ch" text-anchor="middle">${esc(b || '')}</text>`;
    return `<svg class="ws-hk-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g filter="url(#ws-stamp)">${frame}${txt}</g></svg>`;
  };

  // ---------- small helpers ----------
  const DIV = `<svg class="ws-brush" viewBox="0 0 200 12" aria-hidden="true"><path d="M2 7 C40 3 80 9 120 5 S180 6 198 4 C150 9 110 10 70 9 S20 9 2 7Z"/></svg>`;
  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="ws-hd"><span class="ws-eb">${mc.eyebrow != null && mc.eyebrow !== '' ? esc(mc.eyebrow) : eyebrow}</span>
      <h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${DIV}${sub ? `<p class="ws-sub">${sub}</p>` : ''}</header>`;
  };
  const kj = s => `<span class="kj" lang="ja">${s}</span>`;
  const fmtDate = iso => iso ? iso.split('-').reverse().join('.') : '';

  // run fn once the cover is gone (or at once when there is no cover)
  const opened = [];
  const whenOpen = fn => setTimeout(() => {
    const cv = document.getElementById('cover');
    if (cv && !cv.hidden && !cv.classList.contains('is-leaving')) opened.push(fn); else fn();
  }, 0);
  const flushOpen = () => { while (opened.length) { try { opened.shift()(); } catch (e) { console.error(e); } } };

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const A = initials(c, 'bride'), B = initials(c, 'groom');
    el.innerHTML = `<div class="ws-cover">
      <div class="ws-petals" aria-hidden="true">${Array.from({ length: Math.max(3, Math.round(M.scale(9))) }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
      <div class="ws-vert" aria-hidden="true">${kj('一期一会')}</div>
      <header class="ws-ch">
        <p class="ws-eyebrow">Thư mời hôn lễ</p>
        <h1 class="ws-names"><span>${e(D.bride.name.replace(' ', ' '))}</span><i class="va">và</i><span>${e(D.groom.name.replace(' ', ' '))}</span></h1>
      </header>
      <div class="ws-mid"><div class="ws-stage">
        ${ensoSVG('is-cover', VASE, 0)}
        <div class="ws-hanko" aria-hidden="true">${hankoSVG(A, B)}</div>
        <button class="ws-hold" type="button" aria-label="Nhấn giữ vòng tròn và thở chậm để mở thiệp"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="fill" cx="50" cy="50" r="49" transform="rotate(-90 50 50)"/></svg></button>
        <p class="ws-breath" aria-live="polite"><span class="in">Hít vào</span><span class="out">Thở ra</span></p>
      </div></div>
      <footer class="ws-cf">
        <p class="ws-date">${c.dow} · <b>${c.dateText}</b></p>
        <p class="ws-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="ws-hint">Nhấn giữ vòng tròn, thở chậm để mở thiệp</p>
        <p class="ws-gloss">${kj('一期一会')} <span>Nhất kỳ nhất hội · một lần gặp gỡ</span></p>
        <button class="open-btn" type="button">Mở thiệp</button>
      </footer>
    </div>`;
    const root = el.querySelector('.ws-cover'), svg = el.querySelector('.ws-enso'), stage = el.querySelector('.ws-stage');
    const hold = el.querySelector('.ws-hold'), openBtn = el.querySelector('.open-btn');
    const stems = [...svg.querySelectorAll('.ws-stem')], hanko = el.querySelector('.ws-hanko');
    const ring = hold.querySelector('.fill');
    ring.style.strokeDasharray = '308'; ring.style.strokeDashoffset = '308';

    // the brush follows a smoothed target so releasing early lifts it back gently
    let target = 0, cur = 0, started = false, last = 0, raf = 0;
    const frame = now => {
      raf = 0;
      const dt = Math.min(64, now - (last || now)); last = now;
      cur += (target - cur) * Math.min(1, dt * (target > cur ? .012 : .006));
      if (Math.abs(target - cur) < .0008) cur = target;
      paintEnso(svg, cur);
      ring.style.strokeDashoffset = (308 * (1 - cur)).toFixed(1);
      root.style.setProperty('--hp', cur.toFixed(3));
      if (cur !== target) raf = requestAnimationFrame(frame); else last = 0;
    };
    const setTarget = v => { target = v; if (!raf) raf = requestAnimationFrame(frame); };

    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    const finish = () => {
      // stems are placed one by one, then the hanko, then the card opens
      let t = 350;
      stems.forEach((s, i) => {
        c.after(t + i * 760, () => { s.classList.add('placed'); M.tone('click'); M.haptic('tap'); });
      });
      const tH = t + stems.length * 760 + 500;
      c.after(tH, () => {
        root.classList.add('stamped'); hanko.classList.add('on');
        M.tone('thud'); M.haptic('thud');
      });
      c.after(tH + 1250, () => { offTilt(); M.tone('chime'); open(); flushOpen(); });
    };
    const go = viaHold => {
      if (started) return;
      started = true;
      openBtn.disabled = true; hold.disabled = true;
      root.classList.remove('is-holding'); root.classList.add('is-drawn');
      if (viaHold) EA.music();
      M.requestTilt();
      if (!viaHold) M.tone('whoosh');
      if (c.reduced) { cur = target = 1; paintEnso(svg, 1); ring.style.strokeDashoffset = 0; finish(); return; }
      setTarget(1);
      const wait = () => cur >= .999 ? finish() : setTimeout(wait, 60);
      wait();
    };
    M.hold(hold, 1700, {
      onProgress: p => { if (!started) setTarget(p * .96); },
      onDone: () => go(true)
    });
    hold.addEventListener('pointerdown', () => { if (started) return; M.requestTilt(); M.haptic('tap'); M.tone('click'); root.classList.add('is-holding'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => hold.addEventListener(ev, () => root.classList.remove('is-holding')));
    openBtn.addEventListener('click', () => go(false));
  });

  // ======================= SECTIONS =======================
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content;
    return `<div class="ws-hero">
      <div class="ws-hpetals" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
      <p class="ws-eb">${e(mc.eyebrow || 'Ngày chung đôi')}</p>
      <div class="ws-ring" data-draw>
        <div class="ws-photo"><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"></div>
        ${ensoSVG('is-hero')}
      </div>
      <h1 class="ws-names"><span>${e(D.bride.name.replace(' ', ' '))}</span><i class="va">và</i><span>${e(D.groom.name.replace(' ', ' '))}</span></h1>
      ${cp.headline ? `<p class="ws-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="ws-datebtn" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.lunarDate ? `<em>${e(cp.lunarDate)}</em>` : ''}${cp.city ? `<span>${e(cp.city)}</span>` : ''}</button>
      <p class="ws-egg" aria-live="polite"></p>
      ${mc.showCountdown !== false ? ui.countdown() : ''}
      <p class="ws-breathcap" aria-hidden="true"><span>Hít vào</span><span>Thở ra</span></p>
    </div>`;
  });

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c;
    const mc = mod.content;
    const days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    const A = initials(c, 'bride'), B = initials(c, 'groom');
    return `<div class="wrap narrow">
      <div class="ws-letter">
        <div class="ws-sidek" aria-hidden="true">${kj('一期一会')}<small>Nhất kỳ nhất hội</small></div>
        <span class="ws-eb">Thư mời</span>
        <div class="ws-salute">${t(mc.greeting || 'Kính gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>${DIV}
        ${D.letter.slice(0, 2).map(p => `<p class="ws-p">${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="ws-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p class="ws-p">${t(p)}</p>`).join('')}
        <div class="ws-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></div>
      </div>
      ${days != null && days > 0 ? `<div class="ws-ichigo" data-days="${days}">
        <p class="ws-gl">${kj('一期一会')} <span>Ichigo ichie – một lần gặp gỡ</span></p>
        <div class="ws-num"><span class="n">0</span><span class="u">ngày bên nhau</span></div>
        <p class="ws-since">Từ ngày ${fmtDate(met)}${place ? ` · ${e(place)}` : ''}</p>
        <p class="ws-breaths">Khoảng <b>${Math.round(days * 21600 / 1e6).toLocaleString('vi-VN')} triệu</b> nhịp thở đã trôi qua, mỗi nhịp là một lần gặp không bao giờ lặp lại.</p>
      </div>` : ''}
      <div class="ws-hankostudio">
        <p class="ws-gl"><span>Con dấu của chúng mình</span></p>
        <div class="ws-hk-pad"><div class="ws-hk" data-a="${e(A)}" data-b="${e(B)}">${hankoSVG(A, B, 'sq')}</div></div>
        <div class="ws-chips" role="group" aria-label="Chọn kiểu con dấu">
          ${[['sq', 'Vuông'], ['round', 'Tròn'], ['oval', 'Bầu dục']].map(([k, l], i) => `<button type="button" data-shape="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}
          <button type="button" class="stampit">Đóng dấu</button>
        </div>
      </div>
    </div>`;
  });

  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="ws-fam"><span class="ws-tab">${label}</span>
      <span class="r">Ông</span><span class="nm">${e(f.father)}</span><span class="r">Bà</span><span class="nm">${e(f.mother)}</span>
      ${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? c.p.kmBetween(pins.groom, pins.bride) : null;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="ws-famgrid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="ws-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="ws-stones">
        <div class="ws-stonerow" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
        <div class="ws-ends"><span>${e(homes.groom || '')}</span><span>${e(homes.bride || '')}</span></div>
        <p class="ws-km">${km ? `Hai quê cách nhau khoảng <b>${(Math.round(km / 10) * 10).toLocaleString('vi-VN')} km</b>` : 'Hai quê, một mái nhà'}<small>Từng bước chân đặt xuống như những phiến đá trong vườn trà, dẫn về cùng một ngôi nhà.</small></p>
      </div>` : ''}
    </div>`;
  });

  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    const NUM = ['一', '二', '三', '四', '五'];
    const dateOf = ev => {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : D.date;
      const [y, m, d] = iso.split('-');
      return `${DOWS[new Date(`${iso}T12:00:00+07:00`).getUTCDay()]}, ${d}/${m}/${y}`;
    };
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi', 'Mỗi buổi gặp là một lần duy nhất')}
      <ol class="ws-evs">${D.events.map((ev, i) => `<li class="ws-ev"><article>
        <span class="ws-evn" aria-hidden="true">${kj(NUM[i] || '会')}</span>
        <p class="ws-evtag">${e(ev.label)}</p><h3>${e(ev.title)}</h3>
        <p class="ws-evt"><b>${e(ev.time)}</b> · ${dateOf(ev)}</p>
        ${ev.lunar ? `<p class="ws-evl">${e(ev.lunar)}</p>` : ''}
        <p class="ws-evp"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>
        ${ui.actions(ev)}</article></li>`).join('')}</ol>
    </div>`;
  });

  // schedule: the day told as a tea ceremony (wa kei sei jaku), plus the two bowls of the couple
  EA.section('schedule', c => {
    const { data: D, esc: e } = c;
    const KJ = [['和', 'Hòa', 'hòa thuận'], ['敬', 'Kính', 'tôn kính'], ['清', 'Thanh', 'thanh tịnh'], ['寂', 'Tịch', 'tĩnh lặng']];
    const rows = D.itinerary.map((it, i) => {
      const k = KJ[i] || ['会', 'Hội', 'gặp gỡ'];
      return `<li><span class="ws-seal" aria-hidden="true">${kj(k[0])}</span><time>${e(it.time)}</time>
        <div><strong>${e(it.title)}</strong><span>${e(it.note)}</span><em>${k[1]} · ${k[2]}</em></div></li>`;
    }).join('');
    const tb = c.p.get('traits.bride', {}), tg = c.p.get('traits.groom', {});
    const bowl = (who, tr) => tr.drink || tr.hobby ? `<figure class="ws-bowl"><svg viewBox="0 0 120 90" aria-hidden="true"><g class="steam"><path d="M46 30c-8-8 8-14 0-24"/><path d="M62 32c-8-8 8-14 0-26"/><path d="M78 30c-8-8 8-14 0-24"/></g><path class="b" d="M14 38h92c0 28-18 46-46 46S14 66 14 38Z"/><path class="t" d="M20 40h80"/></svg>
      <figcaption><b>${e(who)}</b>${tr.drink ? `<span>${e(tr.drink)}</span>` : ''}${tr.hobby ? `<small>${e(tr.hobby)}</small>` : ''}</figcaption></figure>` : '';
    const bowls = bowl(D.bride.short || D.bride.name, tb) + bowl(D.groom.short || D.groom.name, tg);
    return `<div class="wrap narrow">
      ${head(c, 'Trà đạo ngày vui', 'Trình tự một ngày trọn vẹn', 'Bốn tinh thần của trà đạo: hòa, kính, thanh, tịch')}
      <ol class="ws-tea">${rows}</ol>
      <p class="ws-gloss2">${kj('和敬清寂')} <span>Hòa · Kính · Thanh · Tịch</span></p>
      ${bowls ? `<div class="ws-bowls"><p class="ws-gl"><span>Hai chén trà của chúng mình</span></p><div class="ws-bowlrow">${bowls}</div></div>` : ''}
    </div>`;
  });

  EA.section('quote', c => {
    const { esc: e, data: D } = c;
    const q = c.p.get('quote', null);
    const text = q?.text || D.quote;
    const song = c.p.get('song', null);
    return `<div class="wrap narrow ws-quote">
      <div class="ws-ghost" aria-hidden="true">${ensoSVG('is-ghost')}</div>
      <span class="ws-eb">${e(c.mod.content.eyebrow || 'Lời nhắn')}</span>
      <blockquote>${e(text)}</blockquote>
      ${q?.author ? `<cite>${e(q.author)}</cite>` : ''}
      ${song?.title ? `<p class="ws-song">Bản nhạc của chúng mình: <b>${e(song.title)}</b>${song.artist ? ` · ${e(song.artist)}` : ''}</p>` : ''}
    </div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một chén trà, một lời hồi đáp')}
    <div class="ws-rsvp">${c.ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="ws-bye">
      <span class="ws-eb">${e(mod.content.eyebrow || 'Lời cảm ơn')}</span>
      <div class="ws-byering">${ensoSVG('is-bye', VASE.replace(/<g class="ws-stem/g, '<g class="ws-stem placed'))}
        <div class="ws-hanko big" aria-hidden="true">${hankoSVG(initials(c, 'bride'), initials(c, 'groom'))}</div></div>
      <p class="ws-byel">Hẹn gặp <b>${e(guest)}</b> trong một lần gặp gỡ duy nhất</p>
      <p class="ws-byet">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="ws-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="ws-bd">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Mở lại thiệp ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  const VI_EB = { saveDate: ['Lưu ngày vui', null], party: ['Những người đồng hành', null], video: ['Thước phim', null], gallery: ['Khoảnh khắc', null],
    dressCode: ['Trang phục & lưu ý', null], faq: ['Cần biết', null], gift: ['Mừng cưới', null], registry: ['Gợi ý quà tặng', null], guestbook: ['Sổ lưu bút', null],
    contact: ['Liên hệ', null], story: ['Chuyện tình', null] };
  const drawOnView = (el, svg, ms, M) => {
    if (M.reduced) return;
    paintEnso(svg, 0);
    M.inView(el, () => whenOpen(() => M.tween(0, 1, ms, 'inOut', v => paintEnso(svg, v))), { threshold: .35 });
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    // English eyebrows from core's default layouts -> Vietnamese
    Object.entries(VI_EB).forEach(([id, [eb]]) => {
      const h = main.querySelector(`#${id} .head .eyebrow`);
      if (h && /^[A-Za-z &;]+$/.test(h.textContent.trim())) h.textContent = eb;
    });

    // hero ensō is painted by the brush once the card is open
    main.querySelectorAll('.ws-ring').forEach(r => drawOnView(r, r.querySelector('.ws-enso'), 3400, M));
    const ghost = main.querySelector('.ws-ghost .ws-enso');
    if (ghost) drawOnView(ghost.parentElement, ghost, 3600, M);
    const bye = main.querySelector('.ws-byering');
    if (bye) {
      const sv = bye.querySelector('.ws-enso'), hk = bye.querySelector('.ws-hanko');
      if (!M.reduced) { paintEnso(sv, 0); hk.classList.remove('on'); sv.classList.add('hide-vase'); }
      else hk.classList.add('on');
      M.inView(bye, () => {
        M.tween(0, 1, 3000, 'inOut', v => paintEnso(sv, v)).then(() => {
          sv.classList.remove('hide-vase');
          c.after(500, () => { hk.classList.add('on'); M.tone('thud'); M.haptic('tap'); });
        });
      }, { threshold: .5 });
    }

    // easter egg: tap the date 3 times -> the day you met
    const dateBtn = main.querySelector('.ws-datebtn'), egg = main.querySelector('.ws-egg');
    if (dateBtn && egg) {
      let taps = 0, timer = 0;
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100);
        M.tone('click');
        if (taps >= 3) {
          taps = 0;
          const met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
          egg.innerHTML = met ? `Chúng mình gặp nhau ngày <b>${fmtDate(met)}</b>${place ? ` · ${esc(place)}` : ''}.<br><small>${kj('一期一会')} Một lần gặp gỡ, một đời trân trọng.</small>`
            : `${kj('一期一会')} Một lần gặp gỡ, một đời trân trọng.`;
          egg.classList.add('on'); M.haptic('success'); M.tone('chime');
        }
      });
    }

    // Ichigo ichie counter
    const ich = main.querySelector('.ws-ichigo');
    if (ich) M.inView(ich, () => {
      ich.classList.add('on');
      const n = ich.querySelector('.n'), to = +ich.dataset.days;
      M.tween(0, to, 3200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .4 });

    // hanko studio
    const hk = main.querySelector('.ws-hk');
    if (hk) {
      const stamp = () => { hk.classList.remove('stamp'); void hk.offsetWidth; hk.classList.add('stamp'); M.tone('thud'); M.haptic('thud'); };
      main.querySelectorAll('.ws-chips [data-shape]').forEach(b => b.addEventListener('click', () => {
        main.querySelectorAll('.ws-chips [data-shape]').forEach(x => x.setAttribute('aria-pressed', x === b));
        hk.innerHTML = hankoSVG(hk.dataset.a, hk.dataset.b, b.dataset.shape);
        hk.dataset.shape = b.dataset.shape; stamp();
      }));
      main.querySelector('.stampit')?.addEventListener('click', stamp);
      M.inView(hk, () => c.after(300, stamp), { threshold: .8 });
    }

    // stepping stones and tea bowls
    ['.ws-stones', '.ws-bowls', '.ws-tea'].forEach(s => { const el = main.querySelector(s); if (el) M.inView(el, () => el.classList.add('on'), { threshold: .35 }); });
  });

  // finale after RSVP: the guest's own hanko stamps inside a freshly drawn ensō
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    const name = String(entry?.name || '').trim() || 'Quý khách';
    const [a, b] = initOf(name);
    const yes = entry?.attending !== false;
    const o = document.createElement('div');
    o.className = 'ws-fin';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Cảm ơn bạn');
    o.innerHTML = `<div class="ws-finc">
      <div class="ws-finring">${ensoSVG('is-fin', '', 0)}<div class="ws-hanko big">${hankoSVG(a, b, 'round')}</div></div>
      <p class="ws-fint">${yes ? `Cảm ơn <b>${esc(name)}</b>` : `Chúng mình hiểu rồi, <b>${esc(name)}</b>`}</p>
      <p class="ws-fins">${yes ? 'Một lần gặp gỡ, một đời trân trọng. Hẹn bạn trong ngày vui.' : 'Mong sẽ có dịp gặp bạn vào một ngày khác.'}</p>
      <button class="btn ghost" type="button">Đóng</button>
      ${Array.from({ length: 12 }, (_, i) => `<i class="pt" style="--i:${i}"></i>`).join('')}
    </div>`;
    document.body.appendChild(o);
    const sv = o.querySelector('.ws-enso'), hk = o.querySelector('.ws-hanko');
    const close = () => { o.classList.add('out'); setTimeout(() => o.remove(), 700); };
    o.querySelector('button').addEventListener('click', close);
    o.addEventListener('click', ev => { if (ev.target === o) close(); });
    requestAnimationFrame(() => o.classList.add('in'));
    if (M?.reduced) { paintEnso(sv, 1); hk.classList.add('on'); }
    else M.tween(0, 1, 2400, 'inOut', v => paintEnso(sv, v)).then(() => { hk.classList.add('on'); M.tone('thud'); M.haptic('success'); });
    M?.tone('chime');
    setTimeout(close, 9000);
  });
})();
