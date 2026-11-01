// Riviera Club: the signature cocktail.
// Cover: a striped cabana awning is rolled up. Drag its pull handle down: the awning unrolls, the pool lights ripple,
// then a cocktail named after the couple is poured layer by layer before the club opens.
// Hero: a members' card over a life-ring portrait (not a photo with text). Add-ons: signature drinks + recipes, mixing bar,
// pool-party lanes, song requests (EA.shared), cannonball easter egg, and a poured-drink RSVP finale.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const nb = s => String(s ?? '').trim().replace(/ /g, ' ');
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? '' : h; };
  const first = s => String(s || '').trim().split(/\s+/).pop() || '';
  const cocktailName = c => `${c.data.bride.short || first(c.data.bride.name)} & ${c.data.groom.short || first(c.data.groom.name)} Spritz`;
  const LAYER_COL = ['#e8433a', '#f4a13a', '#f3d95c', '#37bfd0'];

  document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <clipPath id="rv-clip"><path d="M30 20 H90 L84 190 Q83 202 72 202 H48 Q37 202 36 190 Z"/></clipPath>
    <linearGradient id="rv-sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".08"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
  </defs></svg>`);

  // ---------- artwork ----------
  const glassSVG = (named) => `<svg class="rv-glass" viewBox="0 -24 120 244" aria-hidden="true">
    <ellipse cx="60" cy="214" rx="34" ry="5" fill="rgba(7,50,62,.28)"/>
    <g clip-path="url(#rv-clip)">
      <rect x="20" y="20" width="80" height="190" fill="rgba(160,215,225,.38)"/>
      ${LAYER_COL.map((col, i) => `<rect class="ly" data-i="${i}" x="20" y="${202 - 46 * (i + 1) + 6}" width="80" height="46" fill="${col}" style="--k:0"/>`).join('')}
      <g class="ice" style="--g:0" fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.8)"><rect x="40" y="52" width="22" height="22" rx="4" transform="rotate(-12 51 63)"/><rect x="62" y="80" width="20" height="20" rx="4" transform="rotate(14 72 90)"/><rect x="44" y="108" width="18" height="18" rx="4" transform="rotate(8 53 117)"/></g>
      <rect x="20" y="20" width="80" height="190" fill="url(#rv-sh)"/>
    </g>
    <path d="M30 20 H90 L84 190 Q83 202 72 202 H48 Q37 202 36 190 Z" fill="none" stroke="#7fbfc8" stroke-width="2.6"/>
    <path d="M30 20 H90" stroke="#e9fbfd" stroke-width="3.4" stroke-linecap="round"/>
    <rect class="stream" x="58" y="-24" width="4" height="0" rx="2" fill="#e8433a"/>
    <g class="garn" style="--g:0"><path d="M72 6 L94 -20" stroke="#f08a5d" stroke-width="4" stroke-linecap="round"/><path d="M72 6 L94 -20" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 5"/>
      <circle cx="92" cy="22" r="17" fill="#f6a43c" stroke="#fff" stroke-width="2.5"/><path d="M92 22 L92 6 M92 22 L106 14 M92 22 L106 30 M92 22 L92 38 M92 22 L78 30 M92 22 L78 14" stroke="#fff" stroke-width="1.4"/>
      <circle cx="44" cy="22" r="5" fill="#fff" opacity=".8"/></g>
  </svg>${named ? `<p class="rv-gname" aria-live="polite"></p>` : ''}`;

  // controller for a glass: setMix(0..1) fills the four layers in turn
  const glassCtl = svg => {
    const lys = [...svg.querySelectorAll('.ly')], stream = svg.querySelector('.stream');
    const ice = svg.querySelector('.ice'), garn = svg.querySelector('.garn');
    return m => {
      lys.forEach((l, i) => l.style.setProperty('--k', clamp(m * 4 - i).toFixed(3)));
      const act = Math.min(3, Math.floor(m * 4 - 1e-6)), within = clamp(m * 4 - act);
      const top = 202 - 46 * act - 46 * within + 6;
      if (m > 0 && m < 1) { stream.setAttribute('y', -24); stream.setAttribute('height', Math.max(0, top + 24)); stream.setAttribute('fill', LAYER_COL[act]); }
      else stream.setAttribute('height', 0);
      ice.style.setProperty('--g', clamp((m - .6) / .3).toFixed(2));
      garn.style.setProperty('--g', clamp((m - .93) / .07).toFixed(2));
    };
  };

  // pool caustics: low-resolution interference pattern, drawn to a canvas and scaled up
  const caustics = (cv, M, o = {}) => {
    const g = cv.getContext('2d'); if (!g) return () => {};
    const SC = o.scale || 6; let w = 1, h = 1, img = null;
    const fit = () => { const r = cv.getBoundingClientRect(); w = Math.max(8, Math.round(r.width / SC)); h = Math.max(8, Math.round(r.height / SC)); cv.width = w; cv.height = h; img = g.createImageData(w, h); };
    fit(); addEventListener('resize', fit);
    const draw = t => {
      const d = img.data, k = .09;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const a = Math.sin(x * k * 1.7 + Math.sin(y * k * 1.3 + t * .9) * 1.6 + t * .6);
        const b = Math.sin(y * k * 1.9 + Math.sin(x * k * 1.1 - t * .7) * 1.7 - t * .5);
        const v = Math.pow(1 - Math.abs(Math.sin((a + b) * 1.45)), 7);
        const i = (y * w + x) * 4;
        d[i] = 220; d[i + 1] = 255; d[i + 2] = 250; d[i + 3] = Math.min(255, v * 255 * (o.gain ?? 1) * (o.get ? o.get() : 1));
      }
      g.putImageData(img, 0, 0);
    };
    let acc = 0;
    if (M.reduced) { draw(2.3); return () => removeEventListener('resize', fit); }
    const stop = M.loop((t, dt) => { acc += dt; if (acc < (M.tier === 'high' ? 33 : 66)) return; acc = 0; draw(performance.now() / 1000 * .9); }, { el: cv });
    return () => { stop(); removeEventListener('resize', fit); };
  };

  const AWN = (cls = '') => `<div class="rv-awn ${cls}"><i class="stripes"></i><i class="scallop"></i></div>`;
  const WAVE = `<svg viewBox="0 0 120 12" aria-hidden="true" class="rv-wave"><path d="M0 6 Q10 0 20 6 T40 6 T60 6 T80 6 T100 6 T120 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="rv-hd"><span class="rv-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eyebrow}</span><h2>${mc.title != null && mc.title !== '' ? esc(mc.title) : title}</h2>${WAVE}${(mc.sub ?? sub) ? `<p class="rv-sub">${esc(mc.sub ?? sub)}</p>` : ''}</header>`;
  };

  // recipes by keyword in the drink's name
  const RECIPES = [
    [/cà phê|cafe|coffee|cappu|latte/i, ['40 ml cà phê phin pha đậm', '20 ml sữa đặc, khuấy tan', 'Đầy ly đá viên', 'Một lát cam cho ngày nắng']],
    [/trà sữa/i, ['150 ml trà đen pha đậm, để nguội', '60 ml sữa tươi + 1 muỗng đường', 'Đá viên, trân châu nếu thích', 'Lắc 10 giây cho bọt mịn']],
    [/trà|tea/i, ['200 ml trà pha loãng, để nguội', 'Vài lát chanh hoặc đào', 'Mật ong cho vừa miệng', 'Nhiều đá']],
    [/cam|chanh|nước ép|ép/i, ['2 quả cam vắt tươi', '1 muỗng mật ong', 'Soda lạnh cho nhẹ vị', 'Lá bạc hà trang trí']],
    [/sinh tố|smoothie|bơ|xoài/i, ['1 chén trái cây chín', '100 ml sữa tươi', 'Đá xay mịn', 'Một muỗng sữa chua cho béo']],
    [/dừa/i, ['1 trái dừa xiêm lạnh', 'Một chút cơm dừa non', 'Đá nhỏ', 'Hút bằng ống tre']],
    [/bia|beer/i, ['1 chai bia lạnh', 'Ly đã ướp lạnh', 'Rót nghiêng 45 độ', 'Một lát chanh bên miệng ly']],
    [/rượu|vang|wine|cocktail|mojito/i, ['120 ml vang đã ướp lạnh', 'Một ít soda cho nhẹ', 'Lát cam, vài quả mọng', 'Cụng ly nhẹ nhàng']]
  ];
  const recipeOf = d => (RECIPES.find(r => r[0].test(d)) || [0, ['Chọn chiếc ly bạn thích nhất', 'Thêm đá viên', 'Rót thật chậm', 'Uống cùng người mình thương']])[1];

  const layersOf = c => {
    const P = c.p, b = c.data.bride.short || first(c.data.bride.name), g = c.data.groom.short || first(c.data.groom.name);
    return [
      { n: 'Siro lựu', note: 'tầng đỏ cho ngày đầu hẹn hò' },
      { n: P.get('traits.bride.drink', 'Nước cam tươi'), note: `hương vị của ${b}` },
      { n: P.get('traits.groom.drink', 'Chanh dây'), note: `hương vị của ${g}` },
      { n: 'Soda xanh hồ bơi', note: 'tầng sáng cho ngày chung đôi' }
    ];
  };

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc, name = cocktailName(c);
    el.innerHTML = `<div class="rv-cover" style="--p:0;--tx:0;--ty:0">
      <div class="rv-sky" aria-hidden="true"><i class="sun"></i></div>
      ${AWN('rv-awn-cv')}
      <button class="rv-pull" type="button" aria-label="Kéo mái che xuống" aria-valuenow="0"><i class="cord"></i><i class="ring"></i><span>Kéo mái che xuống</span></button>
      <div class="rv-deck">
        <div class="rv-cv-head">
          <p class="rv-eyebrow">Riviera Club · Tiệc cưới bên hồ bơi</p>
          <h1 class="rv-cvnames"><span>${e(nb(D.bride.name))}</span><i>và</i><span>${e(nb(D.groom.name))}</span></h1>
          <p class="rv-cvdate">${c.dow} · ${c.dateText}</p>
        </div>
        <div class="rv-glasswrap">${glassSVG(true)}</div>
      </div>
      <div class="rv-pool">
        <canvas class="rv-caus" aria-hidden="true"></canvas><i class="rv-glint" aria-hidden="true"></i>
        <div class="rv-foot">
          <p class="rv-guest">Gửi <b>${e(c.guest)}</b>, mời bạn vào câu lạc bộ</p>
          <button class="open-btn" type="button">Mở quán</button>
        </div>
      </div>
      <div class="rv-pop" aria-hidden="true"></div>
    </div>`;
    const root = el.querySelector('.rv-cover'), pull = el.querySelector('.rv-pull'), btn = el.querySelector('.open-btn');
    const gset = glassCtl(el.querySelector('.rv-glass')), gname = el.querySelector('.rv-gname');
    gname.textContent = '';
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });
    let light = .45;
    const offCaus = caustics(el.querySelector('.rv-caus'), M, { scale: 6, get: () => light });

    let p = 0, started = false, stepP = 0;
    const set = v => {
      p = clamp(v);
      root.style.setProperty('--p', p.toFixed(3));
      pull.setAttribute('aria-valuenow', Math.round(p * 100));
      const s = Math.floor(p * 4); if (s > stepP) { stepP = s; M.haptic('tap'); M.tone('click'); } if (s < stepP) stepP = s;
      light = .45 + p * .4;
    };
    set(0);

    const run = () => {
      if (started) return; started = true; btn.disabled = true;
      EA.music(); M.requestTilt(); root.classList.add('is-opening');
      M.tween(p, 1, c.reduced ? 1 : 520, 'out', set).then(() => {
        M.tone('whoosh'); M.haptic('thud'); root.classList.add('down');
        c.after(500, () => { root.classList.add('lit'); light = 1; });
        const dur = c.reduced ? 1 : 2500;
        c.after(700, () => {
          let lastStep = -1;
          M.tween(0, 1, dur, t => t, m => {
            gset(m);
            const st = Math.min(3, Math.floor(m * 4));
            if (st !== lastStep) { lastStep = st; M.tone('pop'); M.haptic('tap'); }
          }).then(() => {
            gname.textContent = name; root.classList.add('named');
            M.haptic('success'); M.tone('chime');
            c.after(1100, () => { offTilt(); open(); c.after(900, offCaus); });
          });
        });
      });
    };

    // drag the handle (or anywhere on the awning)
    let drag = null;
    const dist = () => Math.max(140, innerHeight * .24);
    pull.addEventListener('pointerdown', ev => { if (started) return; drag = { y: ev.clientY, p0: p }; pull.setPointerCapture?.(ev.pointerId); M.requestTilt(); pull.classList.add('is-dragging'); ev.preventDefault(); });
    pull.addEventListener('pointermove', ev => { if (drag && !started) set(drag.p0 + (ev.clientY - drag.y) / dist()); });
    const end = () => { if (!drag) return; const moved = Math.abs(p - drag.p0) > .03; drag = null; pull.classList.remove('is-dragging'); if (p >= .6) run(); else if (!moved) { M.tween(p, Math.min(1, p + .35), 260, 'out', set); } else M.tween(p, 0, 400, 'out', set); };
    pull.addEventListener('pointerup', end); pull.addEventListener('pointercancel', end);
    pull.addEventListener('keydown', ev => { if (ev.key === 'ArrowDown' || ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); run(); } });
    btn.addEventListener('click', run);
  });

  // ======================= SECTIONS =======================
  // ---- hero: members' card + life-ring portrait ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content, photo = photoOf(c);
    const since = c.p.get('metDate', '').slice(0, 4);
    return `<div class="rv-hero">
      ${AWN()}
      <canvas class="rv-herocaus" aria-hidden="true"></canvas>
      <div class="rv-hero-in">
        <p class="rv-eb">${e(mc.eyebrow || 'Riviera Club')}</p>
        <button class="rv-ring" type="button" aria-label="Phao cứu sinh, chạm 3 lần để nhảy xuống hồ"><span class="band" aria-hidden="true"></span><span class="in">
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="#bfe9ee"/><circle cx="50" cy="40" r="18" fill="#f6c453"/><path d="M0 62q12-8 25 0t25 0 25 0 25 0V100H0z" fill="#37bfd0"/><path d="M0 74q12-8 25 0t25 0 25 0 25 0V100H0z" fill="#1a8da0"/></svg>${photo ? `<img src="${e(photo)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}</span></button>
        <div class="rv-member">
          <span class="chip">Thẻ hội viên danh dự</span>
          <h1 class="rv-names"><span>${e(nb(D.bride.name))}</span><i>và</i><span>${e(nb(D.groom.name))}</span></h1>
          ${cp.headline ? `<p class="rv-headline">${c.t(cp.headline)}</p>` : ''}
          <dl class="rv-card"><div><dt>Ngày mở tiệc</dt><dd>${c.d}.${c.m}.${c.y}</dd></div><div><dt>Tại</dt><dd>${e(cp.city || 'Câu lạc bộ')}</dd></div><div><dt>${since ? 'Hội viên từ' : 'Hạng thẻ'}</dt><dd>${since || 'Vĩnh viễn'}</dd></div></dl>
        </div>
        <div class="rv-cd"><span class="rv-eb">Hồ bơi mở cửa sau</span>${mc.showCountdown !== false ? ui.countdown() : ''}</div>
        <p class="rv-splash" role="status" aria-live="polite"></p>
      </div>
    </div>`;
  });

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether;
    const place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <div class="rv-letter">
        ${AWN('sm')}
        <div class="rv-letter-in">
          <span class="rv-eb">Thư mời hội viên</span>
          <p class="rv-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
          <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>
          ${D.letter.slice(0, 2).map(p => `<p class="rv-p">${t(p)}</p>`).join('')}
          ${D.letterHighlight ? `<p class="rv-hl">${t(D.letterHighlight)}</p>` : ''}
          ${D.letter.slice(2).map(p => `<p class="rv-p">${t(p)}</p>`).join('')}
          <p class="rv-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
        </div>
      </div>
      ${days != null && days > 0 ? `<div class="rv-laps" data-days="${days}"><span class="rv-eb">Bơi cùng nhau</span><div class="n">${days.toLocaleString('vi-VN')}</div><div class="u">ngày, không một lần lên bờ</div>${place ? `<p>Từ buổi đầu ở ${e(place)}</p>` : ''}</div>` : ''}
    </div>`;
  });

  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f, k) => `<article class="rv-cab ${k}"><i class="top"></i><span class="rv-eb">${e(f.label || label)}</span>
      <p><small>Ông</small>${e(f.father)}</p><p><small>Bà</small>${e(f.mother)}</p>${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? c.p.kmBetween(pins.groom, pins.bride) : null;
    return `<div class="wrap">
      ${head(c, 'Hai gia đình', 'Trân trọng báo tin', mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của')}
      <div class="rv-cabs">${fam('Nhà trai', D.groomFamily, 'a')}${fam('Nhà gái', D.brideFamily, 'b')}</div>
      ${D.announceNote ? `<p class="rv-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="rv-coast"><span class="rv-eb">Hai bờ biển, một hồ bơi</span><div class="line"><span>${e(homes.groom || '')}</span>${km ? '<svg viewBox="0 0 200 30" aria-hidden="true"><path pathLength="1" d="M4 20 Q 24 4 44 20 T 84 20 T 124 20 T 164 20 T 196 20"/></svg>' : '<i></i>'}<span>${e(homes.bride || '')}</span></div>${km ? `<p>Cách nhau khoảng <b>${(Math.round(km / 10) * 10).toLocaleString('vi-VN')} km</b>, nhưng cùng một ly cocktail.</p>` : ''}</div>` : ''}
    </div>`;
  });

  // ---- story: lanes + the bar (signature cocktail, drink recipes) ----
  EA.section('story', c => {
    const { esc: e, mod } = c, s = mod.content, ch = s.chapters || [];
    const P = c.p, lay = layersOf(c), name = cocktailName(c);
    const b = c.data.bride.short || first(c.data.bride.name), g = c.data.groom.short || first(c.data.groom.name);
    const drinks = [['bride', b], ['groom', g]].filter(([k]) => P.has(`traits.${k}.drink`)).map(([k, who]) => ({ who, nick: P.get(`traits.${k}.nickname`, ''), drink: P.get(`traits.${k}.drink`), hobby: P.get(`traits.${k}.hobby`, '') }));
    return `<div class="wrap">
      ${head(c, 'Dòng chảy của chúng mình', 'Chuyện của chúng mình', 'Mỗi chương là một làn bơi.')}
      <ol class="rv-lanes">${ch.map((x, i) => `<li class="rv-lane" style="--c:${LAYER_COL[i % 4]}">
        <i class="buoy" aria-hidden="true"></i>
        <div class="tx"><span class="rv-eb">${e(x.date)}</span><h3>${e(x.title)}</h3><p>${e(x.text)}</p></div>
        ${x.image ? `<div class="im"><img src="${e(x.image)}" alt="" loading="lazy"></div>` : ''}</li>`).join('')}</ol>
      ${s.quote ? `<p class="rv-squote">${e(s.quote)}</p>` : ''}
      <div class="rv-bar">
        <header class="rv-hd mini"><span class="rv-eb">Quầy bar của chúng mình</span><h3>Ly signature mang tên hai bạn</h3></header>
        <div class="rv-lab">
          <div class="rv-labglass">${glassSVG(true)}</div>
          <div class="rv-labctl">
            <p class="rv-cname"><small>Công thức độc quyền</small><span>${e(name)}</span></p>
            <ol class="rv-lay" data-name="${e(name)}">${lay.slice().reverse().map((l, i) => `<li data-i="${3 - i}" style="--c:${LAYER_COL[3 - i]}"><i></i><b>${e(l.n)}</b><small>${e(l.note)}</small></li>`).join('')}</ol>
            <button class="rv-hold" type="button"><span class="fill"></span><span class="t">Nhấn giữ để rót từng tầng</span></button>
            <p class="rv-lab-tip" aria-live="polite"></p>
          </div>
        </div>
        ${drinks.length ? `<div class="rv-menu"><span class="rv-eb">Thực đơn đồ uống riêng</span><div class="grid">${drinks.map(d => `<article class="rv-dr"><span class="who">Ly của ${e(d.who)}${d.nick ? ` · ${e(d.nick)}` : ''}</span><h4>${e(d.drink)}</h4>
          <ol>${recipeOf(d.drink).map(r => `<li>${e(r)}</li>`).join('')}</ol>${d.hobby ? `<p class="fine">Uống cùng ${e(d.hobby.toLowerCase())}.</p>` : ''}</article>`).join('')}</div></div>` : ''}
      </div>
    </div>`;
  });

  // ---- events: cabana passes ----
  EA.section('events', c => {
    const { data: D, esc: e, ui } = c;
    return `<div class="wrap">
      ${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi', 'Cabana đã đặt, khăn tắm đã sẵn sàng.')}
      <div class="rv-passes">${D.events.map((ev, i) => `<article class="rv-pass" style="--c:${LAYER_COL[i % 4]}"><i class="top"></i>
        <span class="rv-eb">${e(ev.label)}</span><h3>${e(ev.title)}</h3>
        <p class="tm">${e(ev.time)}<small>${c.dow}, ${c.d}/${c.m}/${c.y}</small></p>
        <p class="pl"><b>${e(ev.place)}</b><span>${e(ev.address)}</span></p>${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}${ui.actions(ev)}</article>`).join('')}</div>
    </div>`;
  });

  // ---- schedule: the pool-party day ----
  EA.section('schedule', c => {
    const { data: D, esc: e } = c;
    return `<div class="wrap narrow">
      ${head(c, 'Pool party', 'Một ngày thật vui')}
      <ol class="rv-sched">${D.itinerary.map((it, i) => `<li style="--c:${LAYER_COL[i % 4]}"><time datetime="${e(it.time)}">${e(it.time)}</time><div><h3>${e(it.title)}</h3><p>${e(it.note || '')}</p></div></li>`).join('')}</ol>
    </div>`;
  });

  EA.section('gallery', c => `<div class="wrap">${head(c, 'Khung hình hạnh phúc', 'Khoảnh khắc của chúng mình')}
    <div class="rv-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  EA.section('quote', c => {
    const q = c.p.get('quote.text', '') || c.data.quote, by = c.p.get('quote.author', '');
    return `<div class="wrap narrow"><span class="rv-eb">${esc(c.mod.content.eyebrow || 'Lời nhắn từ bờ hồ')}</span><blockquote class="rv-bigq">${esc(q)}</blockquote>${by ? `<p class="rv-by">${esc(by)}</p>` : ''}</div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Một ly cocktail mang tên bạn đang đợi.')}
    <div class="rv-rsvp">${c.ui.rsvpForm()}</div></div>`);

  // ---- guestbook: wishes + the playlist ----
  EA.section('guestbook', c => `<div class="wrap narrow">
    ${head(c, 'Lời chúc và playlist', 'Sổ lưu bút bên hồ', c.mod.content.prompt)}
    <div class="rv-play"><span class="rv-eb">Yêu cầu bài hát cho DJ</span>
      <form class="rv-songform" novalidate><label class="field"><span>Tên bài hát</span><input name="title" maxlength="80" required placeholder="Ví dụ: Có chàng trai viết lên cây"></label>
      <label class="field"><span>Nghệ sĩ (không bắt buộc)</span><input name="artist" maxlength="60"></label>
      <p class="form-error" role="alert" hidden></p><button class="btn" type="submit">Thêm vào playlist</button></form>
      <ol class="rv-queue" aria-label="Playlist của buổi tiệc"></ol></div>
    <div class="book">${c.ui.wishForm()}<ul class="wish-list"></ul></div></div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c;
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="rv-dusk"><i class="sun" aria-hidden="true"></i><canvas class="rv-duskcaus" aria-hidden="true"></canvas>
      <div class="rv-dusk-in">
        <div class="rv-bulbs" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
        <span class="rv-eb">Hoàng hôn trên hồ bơi</span>
        <p class="rv-bye">Hẹn gặp <b>${e(guest)}</b> bên hồ bơi</p>
        <p class="rv-thx">${e(D.thanks)}</p>
        ${mod.content.signature ? `<p class="rv-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
        <p class="rv-date">${c.dow} · ${c.dateText}</p>
        <div class="actions center"><button class="btn" type="button" id="reopen">Cuộn lại mái che ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
      </div></div>`;
  });

  // ======================= behaviours =======================
  const queue = main => {
    const ol = main.querySelector('.rv-queue'); if (!ol) return;
    Promise.resolve(EA.shared.list('songs')).then(list => {
      const seed = [];
      const title = main.dataset.songTitle;
      if (title) seed.push({ title, artist: main.dataset.songArtist, by: 'Cô dâu và chú rể', pin: true });
      const all = seed.concat((list || []).filter(x => x && x.title).slice(-12));
      ol.innerHTML = all.map((s, i) => `<li class="${s.pin ? 'pin' : ''}"><b>${String(i + 1).padStart(2, '0')}</b><span><strong>${esc(s.title)}</strong>${s.artist ? ` · ${esc(s.artist)}` : ''}</span><small>${s.pin ? 'Bài của hai bạn' : esc(s.by || '')}</small></li>`).join('');
    }).catch(() => {});
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    const song = c.p.get('song.title', '');
    main.dataset.songTitle = song; main.dataset.songArtist = c.p.get('song.artist', '');
    // pool caustics behind the hero and the dusk scene
    [['.rv-herocaus', { scale: 8, gain: .55 }], ['.rv-duskcaus', { scale: 8, gain: .5 }]].forEach(([sel, o]) => { const cv = main.querySelector(sel); if (cv) caustics(cv, M, o); });

    // the mixing bar: hold to pour layer by layer
    const lab = main.querySelector('.rv-lab');
    if (lab) {
      const gset = glassCtl(lab.querySelector('.rv-glass')), gname = lab.querySelector('.rv-gname'), hold = lab.querySelector('.rv-hold'), fill = hold.querySelector('.fill'), tip = lab.querySelector('.rv-lab-tip');
      const items = [...lab.querySelectorAll('.rv-lay li')], name = lab.querySelector('.rv-lay').dataset.name, tt = hold.querySelector('.t');
      let m = 0, last = -1, done = false;
      const apply = v => {
        m = v; gset(m); fill.style.transform = `scaleX(${m})`;
        const st = Math.min(3, Math.floor(m * 4 - 1e-6)); items.forEach(li => li.classList.toggle('on', m > 0 && +li.dataset.i <= st));
        if (m > 0 && st !== last) { last = st; M.tone('pop'); M.haptic('tap'); }
      };
      const finish = () => {
        done = true; gname.textContent = name; lab.classList.add('done'); tt.textContent = 'Đổ ly khác';
        tip.textContent = 'Cạn ly! Chúc hai bạn trăm năm hạnh phúc.'; M.haptic('success'); M.tone('chime');
      };
      // hold ≈ 2.4 s; releasing early keeps what has been poured and the next hold continues
      let raf = 0, t0 = 0, base = 0;
      const tick = () => { raf = requestAnimationFrame(tick); const v = clamp(base + (performance.now() - t0) / 2400); apply(v); if (v >= 1) { cancelAnimationFrame(raf); raf = 0; finish(); } };
      const start = ev => { if (raf) return; if (done) { done = false; lab.classList.remove('done'); gname.textContent = ''; tip.textContent = ''; apply(0); tt.textContent = 'Nhấn giữ để rót từng tầng'; last = -1; } M.requestTilt(); base = m; t0 = performance.now(); raf = requestAnimationFrame(tick); hold.classList.add('is-held'); ev?.preventDefault?.(); };
      const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } hold.classList.remove('is-held'); };
      hold.addEventListener('pointerdown', start); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => hold.addEventListener(n, stop));
      hold.addEventListener('keydown', ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) start(ev); });
      hold.addEventListener('keyup', stop);
      if (c.reduced) hold.addEventListener('click', () => { apply(1); finish(); });
    }

    // song requests
    const form = main.querySelector('.rv-songform');
    if (form) {
      const err = form.querySelector('.form-error');
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        const title = form.title.value.trim();
        if (!title) { err.textContent = 'Bạn nhập tên bài hát nhé.'; err.hidden = false; return; }
        err.hidden = true;
        Promise.resolve(EA.shared.add('songs', { title, artist: form.artist.value.trim(), by: c.guest === (c.data.defaultGuest || 'Quý khách') ? '' : c.guest })).finally(() => { form.reset(); queue(main); M.tone('pop'); M.haptic('success'); });
      });
      queue(main);
    }

    // days together
    const laps = main.querySelector('.rv-laps');
    if (laps) M.inView(laps, () => { laps.classList.add('on'); const n = laps.querySelector('.n'), to = +laps.dataset.days; M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });
    main.querySelectorAll('.rv-lane, .rv-pass, .rv-cab, .rv-dr, .rv-sched li, .rv-coast').forEach(el => M.inView(el, () => el.classList.add('in'), { threshold: .2 }));

    // easter egg: tap the life ring three times for a cannonball
    const ring = main.querySelector('.rv-ring'), splash = main.querySelector('.rv-splash');
    if (ring) {
      let taps = 0, timer = 0;
      ring.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1200); M.tone('click');
        if (taps >= 3) {
          taps = 0; ring.classList.remove('bomb'); void ring.offsetWidth; ring.classList.add('bomb'); M.haptic('thud'); M.tone('thud');
          if (splash) { splash.textContent = 'Tõm! Ai nhảy xuống hồ đầu tiên vậy?'; splash.classList.add('on'); c.after(2800, () => splash.classList.remove('on')); }
          const sp = document.createElement('div'); sp.className = 'rv-drops'; sp.innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="--a:${(i / 14) * 360 + Math.random() * 10}deg;--d:${50 + Math.random() * 80}px"></i>`).join('');
          ring.appendChild(sp); setTimeout(() => sp.remove(), 1400);
        }
      });
    }

    // dusk: the sun sets, string lights come on
    const dusk = main.querySelector('.rv-dusk');
    if (dusk) M.inView(dusk, () => { dusk.classList.add('on'); dusk.querySelectorAll('.rv-bulbs i').forEach((b, i) => c.after(400 + i * 160, () => b.classList.add('lit'))); c.after(2000, () => M.tone('chime')); }, { threshold: .5 });
  });

  // finale: a glass is poured and named after the guest
  EA.onRsvp((entry, c) => {
    const M = EA.motion;
    if (entry && entry.attending === false) return;
    const name = String(entry?.name || '').trim() || c.guest;
    const ov = document.createElement('div');
    ov.className = 'rv-fin'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Ly cocktail dành cho bạn');
    ov.innerHTML = `<div class="rv-fin-card"><div class="rv-fin-awn">${AWN()}</div>
      <div class="rv-fin-glass">${glassSVG(false)}</div>
      <span class="rv-eb">Đã nhận phản hồi</span>
      <p class="t">Ly của <b>${esc(name)}</b> đã sẵn sàng</p>
      <p class="s">Hẹn gặp bạn bên hồ bơi ngày ${c.d}.${c.m}.${c.y}. Món đầu tiên: ${esc(cocktailName(c))}.</p>
      <button class="btn" type="button">Cạn ly</button>
      ${Array.from({ length: 10 }, (_, i) => `<i class="cit" style="--x:${(i * 37) % 100}%;--dl:${(i % 5) * .15}s;--r:${i * 40}deg"></i>`).join('')}</div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('on'));
    const set = glassCtl(ov.querySelector('.rv-glass'));
    M?.haptic('success'); M?.tone('whoosh');
    let last = -1;
    M?.tween(0, 1, c.reduced ? 1 : 2200, t => t, m => { set(m); const st = Math.min(3, Math.floor(m * 4)); if (st !== last) { last = st; M.tone('pop'); } }).then(() => { ov.classList.add('full'); M.tone('chime'); M.haptic('tap'); });
    const close = () => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 500); };
    ov.querySelector('.btn').addEventListener('click', close); ov.addEventListener('click', e2 => { if (e2.target === ov) close(); });
    document.addEventListener('keydown', function k(e2) { if (e2.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
    ov.querySelector('.btn').focus({ preventScroll: true });
  });
})();
