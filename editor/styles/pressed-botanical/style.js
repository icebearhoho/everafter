// Pressed Botanical: ngôn ngữ của loài hoa, ép phẳng vào trang giấy tái chế.
// Cover: mỗi người một nụ hoa sinh nhật. Nhấn giữ để hoa nở (time-lapse), rồi hai tấm ép carton hạ xuống, hoa dẹt lại thành hoa ép.
// Ongoing: cánh hoa trôi theo nhịp cuộn trang. Finale: mỗi RSVP thêm một bông vào bó hoa của khách mời.
// All artwork is inline SVG / CSS. No external images besides the couple's own photo.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHOTO = '../assets/images/couples/pressed-botanical.jpg';
  const photoOf = c => { const h = c.config.couple.heroImage || ''; return !h || /picsum\.photos/.test(h) ? PHOTO : h; };
  const nb = s => String(s ?? '').trim().replace(/ /g, ' ');
  const hash = s => { let h = 7; for (const ch of String(s).toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // recycled-paper grain: fibres + speckle, generated once and exposed as a CSS variable
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .36  0 0 0 0 .28  0 0 0 0 .18  0 0 0 .55 -.12"/></filter><rect width="260" height="260" filter="url(#n)"/><g stroke="#8a7550" stroke-opacity=".22" stroke-width=".6" fill="none" stroke-linecap="round"><path d="M12 40q12-6 26 2M120 22q16 8 30-4M200 90q-10 14-26 8M60 150q14 10 30 0M180 200q16-8 30 4M20 220q10-10 26-4M100 100q10 6 22 0M230 30q-6 10-18 12"/></g></svg>`;
    document.documentElement.style.setProperty('--pb-grain', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  } catch { /* css falls back to flat paper */ }

  // ---------- birth flowers: twelve months, drawn with petal rings ----------
  const R = (n, len, wid, shape, fill, edge, o = 0, rot = 0) => ({ n, len, wid, shape, fill, edge, o, rot });
  const FL = [
    { name: 'Cẩm chướng', kw: 'nồng hậu', mean: 'Tình yêu nồng hậu và lòng ngưỡng mộ', rings: [R(14, 66, 17, 'notch', '#dd8aa0', '#a64a67'), R(11, 50, 15, 'notch', '#e79ab0', '#b0566f', .12, 12), R(8, 32, 12, 'notch', '#f1b0c1', '#bf6a82', .24, 5)] },
    { name: 'Hoa tử la lan', kw: 'thủy chung', mean: 'Sự thủy chung và nét khiêm nhường dịu dàng', rings: [R(5, 64, 27, 'rnd', '#8d78c2', '#5d4a96'), R(5, 36, 15, 'rnd', '#a48fd2', '#6a579f', .14, 36)], ctr: ['#f1c94a', 8] },
    { name: 'Thủy tiên vàng', kw: 'hy vọng', mean: 'Khởi đầu mới và niềm hy vọng', rings: [R(6, 70, 23, 'tip', '#f4d04b', '#c79f1c'), R(6, 56, 19, 'tip', '#f8dc6a', '#cba626', .1, 30)], ctr: ['#f0a830', 17, '#b8741a'] },
    { name: 'Cúc họa mi', kw: 'tinh khôi', mean: 'Sự tinh khôi và niềm vui giản dị', rings: [R(20, 70, 7, 'ell', '#fbfaf4', '#b9b39c'), R(14, 56, 7, 'ell', '#fffef8', '#c4bda6', .12, 9)], ctr: ['#e8b92e', 13, '#a8801a'] },
    { name: 'Linh lan', kw: 'bình yên', mean: 'Hạnh phúc trở về và sự bình yên', rings: [R(6, 54, 21, 'rnd', '#f4efdd', '#b4ab8d'), R(6, 36, 15, 'rnd', '#fffdf3', '#c2b99e', .14, 30)], ctr: ['#a6ba93', 8, '#6f8860'] },
    { name: 'Hoa hồng', kw: 'say đắm', mean: 'Tình yêu say đắm và chân thành', rings: [R(7, 70, 31, 'rnd', '#c8546b', '#8f2f45'), R(6, 52, 26, 'rnd', '#d9677d', '#9b3a50', .12, 25), R(5, 36, 21, 'rnd', '#e5798e', '#a64558', .24, 10), R(4, 20, 15, 'rnd', '#ee8fa0', '#b0505f', .36, 40)] },
    { name: 'Phi yến', kw: 'cởi mở', mean: 'Trái tim cởi mở và tình yêu nhẹ nhàng', rings: [R(5, 62, 23, 'rnd', '#7d97d6', '#4a62a8'), R(5, 38, 14, 'rnd', '#a3b8e8', '#5870b4', .14, 36)], ctr: ['#f2eed8', 8, '#b8b08c'] },
    { name: 'Hoa anh túc', kw: 'mộng mơ', mean: 'Giấc mơ ngọt ngào và sự bình an', rings: [R(4, 68, 39, 'rnd', '#e0502d', '#a42f14'), R(4, 52, 32, 'rnd', '#ea6a42', '#b03a1a', .12, 45)], ctr: ['#3d2c24', 13, '#241812'] },
    { name: 'Cúc thạch thảo', kw: 'trìu mến', mean: 'Sự kiên nhẫn và tình cảm trìu mến', rings: [R(24, 68, 6, 'ell', '#b79ae0', '#7a5db0'), R(18, 56, 6, 'ell', '#c8b0ee', '#8767bb', .12, 7)], ctr: ['#eeb62c', 12, '#a67c14'] },
    { name: 'Cúc vạn thọ', kw: 'bền bỉ', mean: 'Đam mê rực rỡ và sự bền bỉ', rings: [R(16, 66, 16, 'notch', '#eb9a21', '#b3680c'), R(13, 52, 15, 'notch', '#f1ae35', '#bc730e', .1, 11), R(10, 38, 13, 'notch', '#f6c04c', '#c27d12', .2, 5), R(7, 22, 10, 'notch', '#d9701a', '#a24e0a', .3, 20)] },
    { name: 'Cúc đại đóa', kw: 'chân thành', mean: 'Lòng chân thành và sự trường thọ', rings: [R(26, 70, 8, 'ell', '#d9a3c8', '#a2699a'), R(22, 58, 8, 'ell', '#e6b9d5', '#ab74a3', .1, 6), R(18, 44, 8, 'ell', '#f1d0e3', '#b57fab', .2, 4), R(12, 28, 8, 'ell', '#f7dd8c', '#c8a23a', .3, 10)] },
    { name: 'Thủy tiên trắng', kw: 'đủ đầy', mean: 'Niềm hy vọng và sự đủ đầy', rings: [R(6, 68, 23, 'tip', '#fbfaf1', '#b8b19a'), R(6, 54, 19, 'tip', '#fffefa', '#c2bba4', .1, 30)], ctr: ['#f2b53a', 17, '#bd8620'] }
  ];
  const SHAPE = {
    ell: (l, w) => `M0 0C${-w} ${-l * .3} ${-w * .9} ${-l * .8} 0 ${-l}C${w * .9} ${-l * .8} ${w} ${-l * .3} 0 0Z`,
    rnd: (l, w) => `M0 0C${-w * 1.2} ${-l * .2} ${-w * 1.1} ${-l * .95} 0 ${-l}C${w * 1.1} ${-l * .95} ${w * 1.2} ${-l * .2} 0 0Z`,
    tip: (l, w) => `M0 0C${-w} ${-l * .4} ${-w * .5} ${-l * .85} 0 ${-l}C${w * .5} ${-l * .85} ${w} ${-l * .4} 0 0Z`,
    notch: (l, w) => `M0 0C${-w * .9} ${-l * .3} ${-w * 1.1} ${-l * .8} ${-w * .85} ${-l * .93}L${-w * .4} ${-l * .86}L0 ${-l * .96}L${w * .4} ${-l * .86}L${w * .85} ${-l * .93}C${w * 1.1} ${-l * .8} ${w * .9} ${-l * .3} 0 0Z`
  };
  const petals = f => f.rings.map((r, ri) => Array.from({ length: r.n }, (_, i) =>
    `<g class="pb-p" style="--a:${(i * 360 / r.n + r.rot).toFixed(1)};--o:${(r.o + (i % 2) * .03).toFixed(2)}"><path d="${SHAPE[r.shape](r.len, r.wid)}" fill="${r.fill}" stroke="${r.edge}" stroke-width=".9" stroke-opacity=".7"/><path d="M0 -4V${(-r.len * .78).toFixed(0)}" stroke="${r.edge}" stroke-opacity=".28" stroke-width=".8" fill="none"/></g>`).join('')).join('')
    + (f.ctr ? `<g class="pb-c" style="--o:.3"><circle r="${f.ctr[1]}" fill="${f.ctr[0]}" stroke="${f.ctr[2] || f.ctr[0]}" stroke-width="1"/><circle r="${(f.ctr[1] * .45).toFixed(1)}" cx="${(f.ctr[1] * .2).toFixed(1)}" cy="${(-f.ctr[1] * .15).toFixed(1)}" fill="#fff" opacity=".28"/></g>` : '');

  // static pressed symbols (bouquet, cards) reused through <use>
  document.body.insertAdjacentHTML('beforeend', `<svg class="pb-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${FL.map((f, i) => `<symbol id="pb-s${i}" viewBox="-100 -100 200 200">${petals(f)}</symbol>`).join('')}
    <symbol id="pb-lf" viewBox="0 0 60 120"><path d="M30 118C6 96 2 52 30 2c28 50 24 94 0 116Z" fill="#6f8a6d"/><path d="M30 112V10" stroke="#3f5a44" stroke-width="1.4" fill="none" opacity=".7"/></symbol></defs></svg>`);


  // a living plant: stem draws, leaves unfurl, the head blooms with --b (0..1) set by the cover or an observer
  const plant = (f, i) => {
    const bud = f.rings[0];
    return `<svg class="pb-plant" viewBox="0 36 200 294" aria-hidden="true">
      <path class="pb-stem" pathLength="1" d="M100 328C96 270 108 206 100 124" fill="none" stroke="#587058" stroke-width="3.2" stroke-linecap="round"/>
      <path class="pb-leaf" style="--o:.1;transform-origin:99px 262px" d="M99 262C66 258 44 236 38 212C66 214 90 232 99 262Z" fill="#74906f" stroke="#3f5a44" stroke-opacity=".5" stroke-width=".9"/>
      <path class="pb-leaf" style="--o:.2;transform-origin:102px 226px" d="M102 226C134 224 156 204 160 182C132 184 108 200 102 226Z" fill="#6a8767" stroke="#3f5a44" stroke-opacity=".5" stroke-width=".9"/>
      <g transform="translate(100,112) scale(.9)"><g class="pb-head">
        <g class="pb-bud"><path d="M0 22C-20 10-16-26 0-40C16-26 20 10 0 22Z" fill="${bud.fill}" stroke="${bud.edge}" stroke-width="1"/><path d="M-13 26C-18 6 0 14 0 24C0 14 18 6 13 26C6 32-6 32-13 26Z" fill="#6a8767" stroke="#3f5a44" stroke-opacity=".5" stroke-width=".8"/></g>
        ${petals(f)}</g></g></svg>`;
  };

  // ---------- flowers for the couple ----------
  const monthOf = v => {
    const s = String(v ?? '');
    const m = /^\d{4}-(\d{1,2})/.exec(s) || /^(\d{1,2})$/.exec(s);
    return m && +m[1] >= 1 && +m[1] <= 12 ? +m[1] : 0;
  };
  const birth = (c, who) => {
    const known = monthOf(c.p.get(`birthdays.${who}`) ?? c.p.get(`traits.${who}.birthday`) ?? c.p.get(`traits.${who}.birthMonth`));
    const name = c.data[who].short || c.data[who].name;
    const m = known || 1 + hash(c.data[who].name + who) % 12;
    return { who, name, m, known: !!known, i: m - 1, f: FL[m - 1] };
  };

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    const B = birth(c, 'bride'), G = birth(c, 'groom');
    const frame = (x, side) => `<figure class="pb-frame ${side}"><i class="pb-tape"></i><div class="pb-pl">${plant(x.f, x.i)}<i class="pb-plate"><b></b><b></b></i></div>
      <figcaption><small>Hoa của ${e(x.name)}</small><b class="pb-fname">${e(x.f.name)}</b></figcaption></figure>`;
    el.innerHTML = `<div class="pb-cover" style="--bloom:0">
      <div class="pb-top">
        <p class="pb-eyebrow">Trân trọng báo tin vui</p>
        <h1 class="pb-names"><span>${e(nb(D.bride.name))}</span><span class="va">và</span><span>${e(nb(D.groom.name))}</span></h1>
      </div>
      <div class="pb-stage">${frame(B, 'l')}${frame(G, 'r')}
        <button class="pb-hold" type="button" aria-label="Nhấn giữ để hai bông hoa nở"></button>
      </div>
      <div class="pb-foot">
        <div class="pb-dateline"><span>${c.dow}</span><i></i><b>${c.dateText}</b></div>
        <p class="pb-guest">Gửi <b>${e(c.guest)}</b></p>
        <p class="pb-hint"><svg class="pb-ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="trk" cx="20" cy="20" r="17"/><circle class="fill" cx="20" cy="20" r="17" transform="rotate(-90 20 20)"/></svg><span>Nhấn giữ để hoa nở</span></p>
        <button class="open-btn" type="button">Mở thiệp</button>
      </div>
      <canvas class="pb-dust" aria-hidden="true"></canvas>
    </div>`;
    const root = el.querySelector('.pb-cover'), hold = el.querySelector('.pb-hold'), openBtn = el.querySelector('.open-btn');
    const fill = el.querySelector('.pb-ring .fill'), CIRC = 2 * Math.PI * 17;
    fill.style.strokeDasharray = CIRC.toFixed(2);
    const setBloom = v => { root.style.setProperty('--bloom', v.toFixed(3)); fill.style.strokeDashoffset = (CIRC * (1 - v)).toFixed(2); };
    setBloom(0);

    // ambient: the buds breathe (css) and the specimen cards lean with tilt
    const offTilt = M.tilt(({ x, y }) => { root.style.setProperty('--tx', x.toFixed(3)); root.style.setProperty('--ty', y.toFixed(3)); });

    // paper dust when the boards land
    const dust = M.particles(el.querySelector('.pb-dust'), {
      count: 0, init(p) { if (!p.burst) p.dead = true; },
      step(p, dt) {
        if (p.dead) return true;
        const k = Math.pow(.95, dt / 16); p.vx *= k; p.vy = (p.vy + .0006 * dt) * k;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        return p.life < 1500;
      },
      draw(g, p) {
        if (p.dead) return;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = clamp(1 - p.life / 1500) * .7;
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
      }
    });
    const flecks = () => {
      const COL = ['#b59a68', '#cdb887', '#8fa088', '#e4d6b4', B.f.rings[0].fill, G.f.rings[0].fill];
      root.querySelectorAll('.pb-frame').forEach(fr => {
        const r = fr.getBoundingClientRect(), y = r.top + r.height * .6;
        [r.left + 6, r.right - 6].forEach((x, s) => dust.burst(18, p => {
          p.x = x; p.y = y + (Math.random() - .5) * 30; const a = (s ? -.25 : -2.9) + (Math.random() - .5) * .9, sp = .12 + Math.random() * .38;
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - .1; p.w = 2 + Math.random() * 4; p.h = 1 + Math.random() * 2.2; p.r = Math.random() * 6; p.vr = (Math.random() - .5) * .01;
          p.c = COL[(Math.random() * COL.length) | 0];
        }));
      });
    };

    let started = false, cur = 0, epoch = 0;
    const pressSeq = () => {
      root.classList.add('is-pressing'); M.tone('whoosh');
      c.after(560, () => { root.classList.add('is-pressed', 'is-shake'); M.haptic('crack'); M.tone('thud'); flecks(); });
      c.after(1500, () => { root.classList.add('is-lifted'); M.tone('click'); });
      c.after(1900, () => { root.classList.add('is-labels'); M.tone('chime'); M.haptic('success'); });
      c.after(3500, () => { offTilt(); open(); c.after(1500, () => dust.stop()); });
    };
    const go = viaHold => {
      if (started) return;
      started = true; epoch++; openBtn.disabled = true; root.classList.remove('is-holding');
      if (viaHold) EA.music();
      M.requestTilt();
      const my = epoch;
      M.tween(cur, 1, viaHold ? 300 : 2100, viaHold ? 'out' : 'inOut', v => { if (my === epoch) setBloom(v); }).then(() => {
        setBloom(1); M.tone('chime'); c.after(280, pressSeq);
      });
      if (!viaHold) { M.tone('pop'); M.haptic('tap'); }
    };
    M.hold(hold, 1700, {
      onProgress: p => {
        if (started) return;
        if (p === 0 && cur > 0) { const from = cur, my = ++epoch; M.tween(from, 0, 520, 'out', v => { if (my === epoch && !started) { cur = v; setBloom(v); } }); return; }
        epoch++; cur = p; setBloom(p);
      },
      onDone: () => go(true)
    });
    hold.addEventListener('pointerdown', () => { if (started) return; M.requestTilt(); M.haptic('tap'); M.tone('pop'); root.classList.add('is-holding'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => hold.addEventListener(ev, () => root.classList.remove('is-holding')));
    openBtn.addEventListener('click', () => go(false));
  });

  // ======================= SECTIONS =======================
  const DIV = `<svg class="pb-div" viewBox="0 0 160 16" aria-hidden="true"><path d="M2 8H66M94 8H158" stroke="currentColor" stroke-width="1" fill="none"/><path d="M80 2c5 3 8 5 0 12-8-7-5-9 0-12Z" fill="currentColor"/><circle cx="71" cy="8" r="1.6" fill="currentColor"/><circle cx="89" cy="8" r="1.6" fill="currentColor"/></svg>`;
  const head = (c, eyebrow, title, sub) => {
    const mc = c.mod?.content || {};
    return `<header class="pb-hd"><p class="pb-eb">${mc.eyebrow != null ? c.esc(mc.eyebrow) : eyebrow}</p><h2>${mc.title != null ? c.esc(mc.title) : title}</h2>${DIV}${sub ? `<p class="pb-sub">${sub}</p>` : ''}</header>`;
  };
  const pressedPlant = (x, cls = '') => `<div class="pb-press ${cls}" data-who="${x.who}" data-i="${x.i}">${plant(x.f, x.i)}</div>`;

  // ---- hero: the two pressed flowers either side of the photo, taped to the page ----
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c;
    const mc = c.mod.content, B = birth(c, 'bride'), G = birth(c, 'groom');
    return `<div class="pb-hero">
      <p class="pb-eb">${e(mc.eyebrow || 'Trân trọng báo tin vui')}</p>
      <div class="pb-spread">
        ${pressedPlant(B, 'l')}
        <figure class="pb-photo"><i class="pb-tape a"></i><i class="pb-tape b"></i><img src="${e(photoOf(c))}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high"><figcaption>${e(B.name)} · ${e(G.name)}</figcaption></figure>
        ${pressedPlant(G, 'r')}
      </div>
      <h1 class="pb-names"><span>${e(nb(D.bride.name))}</span><span class="va">và</span><span>${e(nb(D.groom.name))}</span></h1>
      ${cp.headline ? `<p class="pb-headline">${c.t(cp.headline)}</p>` : ''}
      <button class="pb-date" type="button" aria-label="${c.dow}, ngày ${+c.d} tháng ${+c.m} năm ${c.y}"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</button>
      <div class="pb-note" role="status" aria-live="polite" hidden></div>
      ${cp.lunarDate ? `<p class="pb-lunar">${e(cp.lunarDate)}</p>` : ''}
      ${mc.showCountdown !== false ? ui.countdown() : ''}
    </div>`;
  });

  // ---- invitation: the letter, the language of your flowers, and the vine of days together ----
  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content;
    const B = birth(c, 'bride'), G = birth(c, 'groom');
    const days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    const years = days ? Math.floor(days / 365.25) : 0;
    const card = x => `<article class="pb-fcard" data-i="${x.i}">
      <div class="pb-slip"><i class="pb-tape"></i><div class="pb-pl">${plant(x.f, x.i)}</div></div>
      <p class="pb-eb">Hoa của ${e(x.name)}</p><h3>${e(x.f.name)}</h3>
      <p class="pb-mean">${e(x.f.mean)}</p>${x.known ? `<small>Sinh tháng ${String(x.m).padStart(2, '0')}</small>` : ''}</article>`;
    return `<div class="wrap narrow">
      <div class="pb-sheet">
        <i class="pb-tape a"></i><i class="pb-tape b"></i>
        <span class="pb-eb">Thư mời</span>
        <div class="pb-salute">${t(mc.greeting || 'Gửi {guestName},')}</div>
        <h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2>${DIV}
        ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}
        ${D.letterHighlight ? `<p class="pb-hl">${t(D.letterHighlight)}</p>` : ''}
        ${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
        <div class="pb-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></div>
      </div>
      <div class="pb-lang">
        <header class="pb-hd"><p class="pb-eb">Ngôn ngữ của loài hoa</p><h3 class="pb-h3">Hai bông hoa, một lời nhắn</h3>${DIV}</header>
        <div class="pb-pair">${card(B)}${card(G)}</div>
        <p class="pb-both">Đặt cạnh nhau, <b>${e(B.f.kw)}</b> gặp <b>${e(G.f.kw)}</b>, và cùng nở trong một trang giấy.</p>
      </div>
      ${days != null && days > 0 ? `<div class="pb-vine" data-days="${days}" data-years="${years}">
        <svg viewBox="0 0 320 110" aria-hidden="true">
          <path class="vn" pathLength="1" d="M10 70C50 20 80 100 120 56S190 16 220 60 280 92 312 40" fill="none" stroke="#587058" stroke-width="2.6" stroke-linecap="round"/>
          ${Array.from({ length: Math.min(years, 9) }, (_, k) => { const t = (k + .6) / (Math.min(years, 9) + .2), x = 10 + t * 300, y = 56 + Math.sin(t * 9) * 26; return `<g class="bl" style="--k:${k}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(.17)"><use href="#pb-s${(k % 2 ? G : B).i}" x="-100" y="-100" width="200" height="200"/></g>`; }).join('')}
        </svg>
        <p class="pb-count"><span class="n">${days.toLocaleString('vi-VN')}</span><span class="u">ngày bên nhau</span></p>
        <p class="pb-since">Từ ngày ${met.split('-').reverse().join('.')}${place ? ` · ${e(place)}` : ''}${years ? `, mỗi năm một bông hoa nở thêm` : ''}</p>
      </div>` : ''}
    </div>`;
  });

  // ---- families: the two households + kraft tags for each of you ----
  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="pb-fam"><span class="pb-eb">${label}</span><span class="nm">Ông ${e(f.father)}</span><span class="nm">Bà ${e(f.mother)}</span>${f.address ? `<span class="ad">${e(f.address)}</span>` : ''}</article>`;
    const tr = who => {
      const t = c.p.get(`traits.${who}`, null); if (!t) return '';
      const nick = t.nickname, rows = [t.drink && ['Thức uống', t.drink], t.hobby && ['Sở thích', t.hobby], t.rhythm && ['Nhịp sống', t.rhythm === 'night' ? 'Cú đêm' : 'Người của buổi sáng']].filter(Boolean);
      if (!nick && !rows.length) return '';
      return `<article class="pb-tag"><i class="hole"></i><p class="pb-eb">${e(D[who].short || D[who].name)}</p>${nick ? `<h3>${e(nick)}</h3>` : ''}<dl>${rows.map(r => `<div><dt>${r[0]}</dt><dd>${e(r[1])}</dd></div>`).join('')}</dl></article>`;
    };
    const tags = tr('bride') + tr('groom');
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="pb-fam-grid">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      <p class="pb-couple"><span>${e(nb(D.groom.name))}</span><i>và</i><span>${e(nb(D.bride.name))}</span></p>
      ${D.announceNote ? `<p class="pb-fam-note">${e(D.announceNote)}</p>` : ''}
      ${tags ? `<div class="pb-tags" aria-label="Thẻ ghi chú của hai bạn">${tags}</div>` : ''}
    </div>`;
  });

  EA.section('gallery', c => `<div class="wrap">
    ${head(c, 'Khung hình hạnh phúc', 'Khoảnh khắc của chúng mình')}
    <div class="photos pb-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i, '<i class="pb-tape"></i>')).join('')}</div>
  </div>`);

  // ---- quote: a line to keep, and two letters tucked into envelopes ----
  EA.section('quote', c => {
    const { data: D, esc: e, p } = c;
    const q = p.get('quote', null), L = p.get('letters', null);
    const env = (who, label) => L?.[who] ? `<details class="pb-env"><summary><span>${label}</span></summary><p>${e(L[who])}</p></details>` : '';
    return `<div class="wrap narrow">
      ${head(c, 'Lời nhắn', 'Đôi dòng ép vào trang giấy')}
      <blockquote class="pb-quote">${e(D.quote)}</blockquote>
      ${q?.text ? `<p class="pb-pq">“${e(q.text)}”${q.author ? `<small>${e(q.author)}</small>` : ''}</p>` : ''}
      ${L ? `<div class="pb-envs">${env('bride', `Thư của ${e(D.bride.short || D.bride.name)}`)}${env('groom', `Thư của ${e(D.groom.short || D.groom.name)}`)}</div>` : ''}
    </div>`;
  });

  // ---- rsvp: the form, then the live bouquet of every guest who said yes ----
  EA.section('rsvp', c => `<div class="wrap narrow">
    ${head(c, 'Phản hồi', 'Bạn sẽ đến chứ?', 'Mỗi lời hồi đáp thêm một bông hoa vào bó của chúng mình')}
    <div class="pb-rsvp">${c.ui.rsvpForm()}</div>
    <figure class="pb-bq" aria-live="polite"><svg class="pb-bqs" viewBox="0 0 360 330" role="img" aria-label="Bó hoa của khách mời"></svg>
      <figcaption><b class="pb-bqn">0</b> bông hoa trong bó<span class="pb-bqnames"></span></figcaption></figure>
  </div>`);

  // ---- thanks: the pair pressed once more as the page closes ----
  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, B = birth(c, 'bride'), G = birth(c, 'groom');
    const guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="pb-bye">
      <span class="pb-eb">Lời cảm ơn</span>
      <div class="pb-wreath">${pressedPlant(B, 'l')}<p class="pb-mono">${e(D.monogram || `${D.bride.short} & ${D.groom.short}`)}</p>${pressedPlant(G, 'r')}</div>
      <p class="pb-bye-line">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="pb-bye-text">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="pb-bye-sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="pb-bye-date">${c.dow} · ${c.dateText}</p>
      <div class="actions center">
        <button class="btn" type="button" id="reopen">Ép thêm một lần ${EA.icon('replay')}</button>
        <a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a>
      </div>
    </div>`;
  });

  // ======================= behaviours =======================
  let drift = null, bouquetCtx = null;
  const bloomIn = (el, ms = 1900, press = true) => {
    const root = el.closest('.pb-press, .pb-slip, .pb-wreath') || el;
    el.classList.remove('is-pressed');
    return EAMotion.tween(0, 1, ms, 'inOut', v => el.style.setProperty('--bloom', v.toFixed(3))).then(() => {
      if (!press) return;
      el.style.removeProperty('--bloom'); el.classList.add('is-pressed');
    });
  };

  // bouquet geometry: phyllotaxis dome, newest on the outside edge
  const spot = j => { const r = 27 * Math.sqrt(j + .7), a = j * 2.39996; return [180 + Math.cos(a) * r * 1.12, 136 + Math.sin(a) * r * .86, 80 - Math.min(18, j * 1.1)]; };
  const drawBouquet = (svg, list, newest) => {
    const shown = list.slice(-18), N = shown.length, tie = [180, 298];
    const slots = shown.map((_, j) => spot(j));
    const stems = slots.map(([x, y], j) => `<path d="M${tie[0]} ${tie[1]}Q${(tie[0] + x) / 2 + (j % 2 ? 16 : -16)} ${(tie[1] + y) / 2 + 10} ${x.toFixed(0)} ${y.toFixed(0)}" stroke="#587058" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`).join('');
    const leaves = [[-64, 74], [-34, 92], [34, 92], [64, 74], [-86, 58], [86, 58]].map(([a, h], k) => `<use href="#pb-lf" x="${tie[0] - 17}" y="${tie[1] - h}" width="34" height="${h * .95}" transform="rotate(${a} ${tie[0]} ${tie[1]})" opacity="${k > 3 ? .8 : 1}"/>`).join('');
    const ghosts = N ? '' : [0, 1, 2, 3, 4].map(j => { const [x, y, s] = spot(j); return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(s * .42).toFixed(0)}" fill="none" stroke="#587058" stroke-opacity=".4" stroke-dasharray="3 5"/>`; }).join('');
    const blooms = [...shown].map((g, j) => ({ g, j })).reverse().map(({ g, j }) => {
      const [x, y, s] = slots[j], rot = (hash(g.name || String(j)) % 60) - 30, isNew = newest && j === N - 1;
      return `<g class="pb-bl${isNew ? ' new' : ''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g transform="rotate(${rot})"><title>${esc(g.name || 'Khách mời')}</title><use${isNew ? ' class="pop"' : ''} href="#pb-s${(g.k ?? hash(g.name || j)) % 12}" x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}"/></g>${isNew ? `<g class="pb-tg" transform="translate(0 ${s / 2 + 6})"><rect x="-44" y="-1" width="88" height="19" rx="3" fill="#d6bb86" stroke="#8d7240" stroke-width=".8"/><text y="12.5" text-anchor="middle" font-size="10.5" font-weight="600" fill="#2b3a30">${esc(nb(String(g.name).split(/\s+/).slice(-2).join(' ')).slice(0, 14))}</text></g>` : ''}</g>`;
    }).join('');
    const bow = `<path d="M${tie[0] - 16} ${tie[1] - 4}h32v12h-32z" fill="#c9ab72" stroke="#8d7240" stroke-width="1"/><path d="M${tie[0]} ${tie[1] + 2}c-18-12-30-2-30 8s16 6 30-8c14 14 30 18 30 8s-12-20-30-8z" fill="#d9bf88" stroke="#8d7240" stroke-width="1"/>`;
    svg.innerHTML = `${leaves}${stems}${bow}${ghosts}${blooms}`;
    const fig = svg.closest('.pb-bq');
    fig.querySelector('.pb-bqn').textContent = list.length.toLocaleString('vi-VN');
    const names = list.slice(-4).map(g => g.name).filter(Boolean);
    fig.querySelector('.pb-bqnames').textContent = names.length ? ` · gần đây: ${names.join(', ')}` : '';
    fig.classList.toggle('has', N > 0);
  };
  const loadBouquet = (main, newest) => {
    const svg = main.querySelector('.pb-bqs'); if (!svg) return;
    Promise.resolve(EA.shared.list('blooms')).then(l => drawBouquet(svg, (l || []).filter(x => x && x.name), newest)).catch(() => drawBouquet(svg, [], false));
  };

  EA.afterRender((c, main) => {
    const M = c.motion;
    bouquetCtx = c;

    // drifting petals: wind follows the scroll, in both birth-flower colours
    if (!M.reduced && !document.querySelector('.pb-drift')) {
      const cv = document.createElement('canvas'); cv.className = 'pb-drift'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
      const cols = [birth(c, 'bride'), birth(c, 'groom')].flatMap(x => x.f.rings.slice(0, 2).map(r => r.fill));
      let wind = 0, lastY = scrollY, tgt = 0;
      addEventListener('scroll', () => { const y = scrollY; tgt = clamp((y - lastY) * .08, -2.2, 2.2); lastY = y; }, { passive: true });
      M.loop(() => { wind += (tgt - wind) * .1; tgt *= .9; });
      const seed = (p, i, w, h) => {
        p.x = Math.random() * w; p.y = p.burst ? p.y : Math.random() * h; p.s = 5 + Math.random() * 6; p.r = Math.random() * 6.28; p.vr = (Math.random() - .5) * .0016;
        p.vy = .012 + Math.random() * .02; p.ph = Math.random() * 6.28; p.c = cols[(Math.random() * cols.length) | 0]; p.a = .32 + Math.random() * .3;
      };
      drift = M.particles(cv, {
        count: 14, init: seed,
        step(p, dt, w, h) {
          p.ph += dt * .0007; p.x += (Math.sin(p.ph) * .018 + wind * .05) * dt; p.y += (p.vy + Math.abs(wind) * .02) * dt + wind * .03 * dt; p.r += p.vr * dt + wind * .002;
          if (p.burst) { p.y += p.life * .00004 * dt; return p.life < 4200 && p.y < h + 20; }
          if (p.y > h + 20 || p.y < -30 || p.x < -30 || p.x > w + 30) { p.y = wind < 0 ? h + 10 : -14; p.x = Math.random() * w; return true; }
          return true;
        },
        draw(g, p) {
          g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = p.burst ? p.a * clamp(1 - p.life / 4200) : p.a; g.fillStyle = p.c;
          g.beginPath(); g.moveTo(0, -p.s); g.bezierCurveTo(p.s * .9, -p.s * .5, p.s * .7, p.s * .6, 0, p.s); g.bezierCurveTo(-p.s * .7, p.s * .6, -p.s * .9, -p.s * .5, 0, -p.s); g.fill(); g.restore();
        }
      });
    }

    // pressed plants in the page: they settle into place (and re-press) the first time they appear
    main.querySelectorAll('.pb-press, .pb-slip .pb-pl').forEach(el => {
      el.classList.add('is-pressed');
      if (!el.closest('.pb-hero')) M.inView(el, () => { if (M.reduced) return; el.classList.remove('is-pressed'); el.style.setProperty('--bloom', 0); bloomIn(el, 2000); }, { threshold: .55 });
    });

    // easter egg: tap the date three times -> one flower springs back to life and says hello
    const dateBtn = main.querySelector('.pb-date'), note = main.querySelector('.pb-note');
    if (dateBtn && note) {
      let taps = 0, timer = 0, busy = false;
      const alive = () => {
        if (busy) return; busy = true;
        const pick = main.querySelector('.pb-hero .pb-press.' + (Math.random() < .5 ? 'l' : 'r'));
        const x = birth(c, pick.dataset.who === 'groom' ? 'groom' : 'bride');
        const nick = c.p.get(`traits.${x.who}.nickname`, ''), joke = c.p.get('insideJoke', '');
        note.innerHTML = `<b>${c.esc(x.f.name)}</b> · ${c.esc(x.f.mean)}${nick ? `<br><i>${c.esc(nick)} gửi lời chào!</i>` : ''}${joke ? `<br><small>${c.esc(joke)}</small>` : ''}`;
        note.hidden = false; note.classList.add('on');
        pick.classList.remove('is-pressed'); pick.classList.add('is-alive');
        M.haptic('success'); M.tone('chime'); drift?.burst(26, (p, i, w, h) => { const r = pick.getBoundingClientRect(); p.x = r.left + r.width / 2 + (Math.random() - .5) * 60; p.y = r.top + r.height * .35; p.s = 5 + Math.random() * 6; p.r = Math.random() * 6; p.vr = (Math.random() - .5) * .004; p.vy = -.02; p.ph = Math.random() * 6; p.c = x.f.rings[0].fill; p.a = .6; });
        M.tween(0, 1, 1300, 'out', v => pick.style.setProperty('--bloom', v.toFixed(3))).then(() => c.after(3200, () => {
          pick.classList.remove('is-alive'); pick.style.removeProperty('--bloom'); pick.classList.add('is-pressed'); note.classList.remove('on'); c.after(500, () => { note.hidden = true; busy = false; }); M.tone('thud');
        }));
      };
      dateBtn.addEventListener('click', () => {
        taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 1100); M.tone('click');
        if (taps >= 3) { taps = 0; alive(); }
      });
    }

    // the vine grows and the days count up
    const vine = main.querySelector('.pb-vine');
    if (vine) M.inView(vine, () => {
      vine.classList.add('on');
      const n = vine.querySelector('.n'), to = +vine.dataset.days;
      M.tween(0, to, 2600, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .45 });

    // language of flowers: cards bloom in turn (handled by the plant observer); the pair line fades in
    main.querySelectorAll('.pb-both, .pb-tags').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .4 }));

    // thanks: the wreath is pressed again when it scrolls in
    const bye = main.querySelector('.pb-bye');
    if (bye) M.inView(bye, () => bye.classList.add('on'), { threshold: .5 });

    loadBouquet(main, false);
  });

  // finale: every "yes" adds a flower (its type chosen from the guest's name) to the shared bouquet
  EA.onRsvp((entry, c) => {
    const main = document.getElementById('inv'), M = EA.motion;
    if (!entry || entry.attending === false) return;
    const name = String(entry.name || '').trim() || 'Khách mời', k = hash(name) % 12;
    const done = Promise.resolve(EA.shared.add('blooms', { name, k })).catch(() => {});
    done.then(() => {
      const svg = main.querySelector('.pb-bqs'); if (!svg) return;
      Promise.resolve(EA.shared.list('blooms')).then(l => {
        const list = (l || []).filter(x => x && x.name);
        drawBouquet(svg, list, true);
        svg.closest('.pb-bq').classList.add('fresh');
        svg.closest('.pb-bq').scrollIntoView({ behavior: M?.reduced ? 'auto' : 'smooth', block: 'center' });
        M?.haptic('success'); M?.tone('chime'); setTimeout(() => M?.tone('pop'), 650);
        drift?.burst(30, (p, i, w, h) => { p.x = Math.random() * w; p.y = -10 - Math.random() * 60; p.s = 5 + Math.random() * 6; p.r = Math.random() * 6; p.vr = (Math.random() - .5) * .004; p.vy = .03 + Math.random() * .03; p.ph = Math.random() * 6; p.c = FL[k].rings[0].fill; p.a = .7; });
      });
    });
  });
})();
