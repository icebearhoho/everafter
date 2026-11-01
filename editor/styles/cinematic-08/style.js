// Giấy Dó Shadow Theatre: an oil lamp lights behind handmade paper, two shadow puppets walk together under lotus and moon, and bow.
(function () {
  const M = EA.motion, html = document.documentElement;
  const R = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const wait = ms => new Promise(r => setTimeout(r, M.reduced ? 0 : ms));
  const setTier = () => { html.dataset.gdTier = M.tier; };
  const INK = '#2a140e';

  // the double-happiness glyph is a single CJK accent: fetch just that character
  if (!document.getElementById('gd-hy')) {
    const l = Object.assign(document.createElement('link'), { id: 'gd-hy', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&text=%E5%9B%8D&display=swap' });
    document.head.appendChild(l);
  }
  const HY = '<span class="gd-hy" aria-hidden="true">囍</span>';

  // giấy dó: long pale fibres on warm paper, painted once and reused as a tile
  (function paper() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
    g.fillStyle = '#f0e3cc'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 320; i++) {
      const x = R(0, 256), y = R(0, 256), a = R(0, TAU), l = R(8, 38);
      g.strokeStyle = Math.random() < .55 ? `rgba(255,250,236,${R(.18, .5)})` : `rgba(120,86,48,${R(.04, .11)})`; g.lineWidth = R(.4, 1.1);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const id = g.getImageData(0, 0, 256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const n = (Math.random() - .5) * 9; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
    g.putImageData(id, 0, 0);
    try { html.style.setProperty('--gd-paper', `url(${cv.toDataURL('image/png')})`); } catch { /* tainted */ }
  })();

  // ---------- puppet art: profile silhouettes with punched lace, facing right in a 100 x 190 box ----------
  const PROPS = {
    guitar: `<g transform="translate(0,-4) rotate(-28)"><ellipse cx="0" cy="22" rx="11" ry="9"/><ellipse cx="0" cy="8" rx="8" ry="7"/><rect x="-1.8" y="-34" width="3.6" height="42"/><rect x="-3.5" y="-43" width="7" height="10" rx="2"/><circle class="cut" cx="0" cy="15" r="3"/></g>`,
    brush: `<g transform="rotate(16)"><rect x="-1.2" y="-48" width="2.4" height="54"/><path d="M-3 -48Q0 -68 3 -48Z"/></g>`,
    book: `<g transform="translate(2,-14) rotate(-8)"><rect x="-9" y="-10" width="18" height="24" rx="1.5"/><path class="cutl" d="M-6 -5H6M-6 0H6M-6 5H3"/></g>`,
    camera: `<g transform="translate(0,-10)"><rect x="-11" y="-8" width="22" height="15" rx="2"/><rect x="-5" y="-12" width="9" height="5"/><circle class="cut" cx="0" cy="0" r="4"/></g>`,
    bike: `<g transform="translate(8,-6) scale(.9)" fill="none" stroke="${INK}" stroke-width="2"><circle cx="-14" cy="12" r="10"/><circle cx="14" cy="12" r="10"/><path d="M-14 12L-2-2 8 12h6M-2-2h8l8 14M-4-6h6"/></g>`,
    pot: `<g transform="translate(2,-8)"><path d="M-10-4H10V8Q10 14 4 14H-4Q-10 14-10 8Z"/><rect x="-12" y="-6" width="24" height="3" rx="1.5"/><path d="M-4-10q2-4 0-8M3-10q2-4 0-8" fill="none" stroke="${INK}" stroke-width="1.6"/></g>`,
    fan: `<g transform="translate(0,-10) rotate(-10)"><path d="M0 8L-16-16A22 22 0 0 1 16-16Z"/><path class="cutl" d="M0 8L-8-17M0 8L0-19M0 8L8-17"/></g>`
  };
  const propFor = txt => {
    const t = String(txt || '').toLowerCase(); if (!t) return '';
    if (/guitar|đàn|ghi-ta|nhạc/.test(t)) return 'guitar';
    if (/vẽ|tranh|màu|họa|hoạ/.test(t)) return 'brush';
    if (/sách|đọc/.test(t)) return 'book';
    if (/ảnh|chụp|nhiếp|camera/.test(t)) return 'camera';
    if (/xe đạp|đạp xe|bike|cycling/.test(t)) return 'bike';
    if (/nấu|bếp|bánh/.test(t)) return 'pot';
    return 'fan';
  };
  const holes = (cx, ys, n, gap) => ys.map(y => Array.from({ length: n }, (_, i) => `<circle class="cut" cx="${cx + (i - (n - 1) / 2) * gap}" cy="${y}" r="1.9"/>`).join('')).join('');
  function puppetInner(kind, prop) {
    const groom = kind === 'groom';
    const head = groom
      ? `<ellipse cx="56" cy="38" rx="11" ry="13"/><path d="M66 36l5 3-5 2z"/><path d="M43 34C41 14 52 6 63 10c8 3 8 16 4 21l-5-7c-4-2-10 0-12 10Z"/><path class="cutl" d="M47 14Q56 6 65 14"/>`
      : `<ellipse cx="54" cy="38" rx="10" ry="12"/><path d="M63 36l4.500 3-4.500 2z"/><circle cx="41" cy="31" r="9"/><path d="M43 29C45 17 63 17 64 30c-6-6-14-6-21-1Z"/><circle class="cut" cx="41" cy="31" r="2.200"/>`;
    const body = groom
      ? `<rect x="52" y="48" width="8" height="9"/><path d="M45 54H67L71 70C73 100 79 140 85 179H27C33 140 39 100 42 70Z"/><path class="cutl" d="M56 58V176"/>${holes(56, [96, 116, 136, 156], 5, 9)}<path class="cut" d="M56 60l4 4-4 4-4-4z"/><path class="cutl" d="M32 170H80"/>`
      : `<rect x="52" y="48" width="6" height="10"/><path d="M47 55H62L65 70C66 90 69 110 76 179H22C30 130 44 100 44 70Z"/><path d="M30 140Q8 160 4 184L26 182Z"/><path class="cutl" d="M52 62V176"/>${holes(54, [100, 120, 140, 158], 4, 9)}<path class="cut" d="M54 60l3 4-3 4-3-4z"/><path class="cutl" d="M26 172H74"/>`;
    const arm = `<g class="arm"><path d="M${groom ? 58 : 54} 58H${groom ? 69 : 64}L${groom ? 73 : 69} 100L${groom ? 63 : 59} 103Z"/><circle cx="${groom ? 68 : 64}" cy="104" r="4.200"/><g transform="translate(${groom ? 68 : 64} 104)">${PROPS[prop] || ''}</g></g>`;
    return { body: `<g class="bod">${body}${head}${arm}</g>`, feet: `<path class="f1" d="M32 178h20l5 8H30z"/><path class="f2" d="M56 178h20l5 8H54z"/>` };
  }
  function puppetG(kind, prop) { const p = puppetInner(kind, prop); return `<g class="pp ${kind}" fill="${INK}"><path d="M44 120V260" stroke="${INK}" stroke-width="2.200"/><g class="feet">${p.feet}</g>${p.body}</g>`; }
  const petG = kind => /chó|cún|dog/i.test(kind)
    ? `<g class="pet" fill="${INK}"><path d="M4 44C0 30 6 20 16 18c10-2 20 4 22 26Z"/><circle cx="26" cy="12" r="8"/><path d="M33 13l9 3-1 5-8-1z"/><path d="M19 8q-6 2-4 14l7-6z"/><path class="tail" d="M5 40C-6 38-6 24 2 22" fill="none" stroke="${INK}" stroke-width="3"/></g>`
    : `<g class="pet" fill="${INK}"><path d="M6 44C0 30 6 18 16 16c10-2 18 6 18 28Z"/><circle cx="24" cy="12" r="8"/><path d="M17 7l2-9 5 7zM26 5l5-7 1 10z"/><path class="tail" d="M6 40C-8 40-8 22 2 22" fill="none" stroke="${INK}" stroke-width="3"/></g>`;
  const miniPuppet = (kind, prop) => `<svg class="gd-mini" viewBox="0 -4 100 200" aria-hidden="true">${puppetG(kind, prop).replace('<path d="M44 120V260" stroke', '<path d="M44 120V200" stroke')}</svg>`;

  // lotus foreground (silhouette) with flowers that bloom
  const lotus = (x, y, s) => `<g class="fl" style="transform-origin:${x}px ${y}px" transform="translate(${x} ${y}) scale(${s})"><path d="M0 0C-8-14-8-30 0-42 8-30 8-14 0 0Z"/><path d="M0 0C-8-14-8-30 0-42 8-30 8-14 0 0Z" transform="rotate(-38)"/><path d="M0 0C-8-14-8-30 0-42 8-30 8-14 0 0Z" transform="rotate(38)"/><path d="M0 0C-7-12-7-24 0-34 7-24 7-12 0 0Z" transform="rotate(-70)"/><path d="M0 0C-7-12-7-24 0-34 7-24 7-12 0 0Z" transform="rotate(70)"/></g>`;
  const LOTUS = `<svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="${INK}">
    <g class="lv"><ellipse cx="38" cy="116" rx="52" ry="10"/><ellipse cx="338" cy="118" rx="62" ry="11"/><ellipse cx="124" cy="126" rx="40" ry="8"/><ellipse cx="262" cy="127" rx="36" ry="7"/><ellipse cx="392" cy="106" rx="34" ry="8"/></g>
    <g stroke="${INK}" stroke-width="2.400" fill="none"><path d="M44 118Q40 96 46 76"/><path d="M342 120Q350 98 340 70"/><path d="M118 126Q110 104 116 92"/><path d="M270 127Q282 108 276 96"/></g>
    ${lotus(46, 76, 1.3)}${lotus(340, 70, 1.5)}${lotus(116, 92, .85)}${lotus(276, 96, .8)}
    <g class="bud"><path d="M392 106Q384 90 396 80Q404 92 396 106Z"/><path d="M8 110Q0 96 10 86Q18 98 10 110Z"/></g></svg>`;

  // ---------- the stage: paper, moon, puppets, lotus, lamp ----------
  function stageHTML(dark) {
    return `<div class="gd-paper"></div>
      <i class="gd-moon" aria-hidden="true"></i>
      <div class="gd-puppets"><svg viewBox="40 0 320 340" overflow="visible" aria-hidden="true"><g class="rk"></g></svg></div>
      <div class="gd-lotus" aria-hidden="true">${LOTUS}</div>
      <div class="gd-glow" aria-hidden="true"></div>
      ${dark ? '<div class="gd-dark" aria-hidden="true"></div>' : '<div class="gd-dark out-only" aria-hidden="true"></div>'}
      <button class="gd-lamp" type="button" aria-label="Ngọn đèn dầu"><svg viewBox="0 0 60 80" aria-hidden="true"><ellipse class="halo" cx="30" cy="30" rx="26" ry="30"/><path class="flame" d="M30 8C22 20 20 28 24 36 26 40 34 40 36 36 40 28 38 20 30 8Z"/><path class="core" d="M30 22C27 28 27 33 30 36 33 33 33 28 30 22Z"/><path class="bowl" d="M12 46H48C48 56 40 60 30 60S12 56 12 46Z"/><path class="stem" d="M26 60H34L36 70H24Z M18 70H42V74H18Z"/></svg></button>`;
  }
  // wires puppets into `root` (a .gd-stage) and returns the controller
  function makeScene(root, c, o = {}) {
    const g = root.querySelector('.rk'), bride = c.p.get('traits.bride.hobby', ''), groom = c.p.get('traits.groom.hobby', '');
    g.innerHTML = petPetHTML(c) + `<g class="pw gm">${puppetG('groom', propFor(groom))}</g><g class="pw br">${puppetG('bride', propFor(bride))}</g>`;
    const pw = { g: g.querySelector('.gm'), b: g.querySelector('.br') }, pet = g.querySelector('.pet-w');
    const bod = { g: pw.g.querySelector('.bod'), b: pw.b.querySelector('.bod') }, arm = { g: pw.g.querySelector('.arm'), b: pw.b.querySelector('.arm') };
    const feet = { g: [...pw.g.querySelectorAll('.f1,.f2')], b: [...pw.b.querySelectorAll('.f1,.f2')] };
    const S = { xg: 130, xb: 270, ag: 0, ab: 0, walk: 0, vis: 1, sway: 0, ph: 0 };
    const narrow = (root.clientWidth || innerWidth) < 600, FIN = narrow ? { g: 130, b: 270 } : { g: 146, b: 254 };
    const place = () => {
      const bob = S.walk ? Math.abs(Math.sin(S.ph)) * -3 : 0, sw = S.sway;
      const one = (k, x, dir, a) => {
        pw[k].setAttribute('transform', `translate(${x + (dir > 0 ? -50 : 50)} ${110 + bob}) scale(${dir} 1)`);
        bod[k].setAttribute('transform', `rotate(${a + sw * (dir)} 56 150)`);
        arm[k].setAttribute('transform', `rotate(${S.walk ? Math.sin(S.ph) * 9 * dir : 0} ${dir > 0 ? 62 : 58} 60)`);
        feet[k][0].setAttribute('transform', `translate(${S.walk ? Math.sin(S.ph) * 5 : 0} ${S.walk ? -Math.max(0, Math.sin(S.ph)) * 3 : 0})`);
        feet[k][1].setAttribute('transform', `translate(${S.walk ? -Math.sin(S.ph) * 5 : 0} ${S.walk ? -Math.max(0, -Math.sin(S.ph)) * 3 : 0})`);
        pw[k].style.opacity = clamp((k === 'g' ? x + 60 : 460 - x) / 90) * S.vis;
      };
      one('g', S.xg, 1, S.ag); one('b', S.xb, -1, S.ab);
      if (pet) pet.style.opacity = clamp((S.xg - 100) / 50) * S.vis;
    };
    const api = {
      S, place,
      final() { S.xg = FIN.g; S.xb = FIN.b; S.walk = 0; place(); },
      start() { S.xg = -64; S.xb = 464; S.walk = 0; S.vis = 1; place(); },
      async walkIn(ms) {
        S.walk = 1; const x0g = S.xg, x0b = S.xb;
        await M.tween(0, 1, ms, 'inOut', t => { S.xg = x0g + (FIN.g - x0g) * t; S.xb = x0b + (FIN.b - x0b) * t; S.ph = t * 17; place(); });
        S.walk = 0; place();
      },
      async bow(times = 1, deep = 24) {
        for (let i = 0; i < times; i++) {
          await M.tween(0, 1, 520, 'inOut', t => { S.ag = S.ab = deep * Math.sin(t * Math.PI / 2); place(); });
          await M.tween(0, 1, 560, 'inOut', t => { S.ag = S.ab = deep * Math.cos(t * Math.PI / 2) * (i < times - 1 ? 1 : 1); place(); });
          S.ag = S.ab = 0; place(); if (i < times - 1) await wait(120);
        }
      }
    };
    api.final();
    return api;
  }
  const petPetHTML = c => {
    const kind = c.p.get('pet.kind', ''), nm = c.p.get('pet.name', '');
    if (!nm && !kind) return '';
    if (!/mèo|cat|chó|cún|dog/i.test(kind)) return '';
    return `<g class="pet-w" transform="translate(180 256)">${petG(kind)}</g>`;
  };

  // ---------- page-wide: fireflies (and gold paper in the finale) ----------
  let fly = null, flyCv = null;
  function startFlies() {
    if (fly || M.reduced) return;
    flyCv = Object.assign(document.createElement('canvas'), { className: 'gd-fly' }); flyCv.setAttribute('aria-hidden', 'true'); document.body.appendChild(flyCv);
    fly = M.particles(flyCv, {
      count: 26,
      init(p) {
        if (p.conf) return;
        p.x = R(0, flyCv.clientWidth || 400); p.y = R(0, flyCv.clientHeight || 800); p.r = R(1.2, 2.6); p.ph = R(0, TAU); p.vx = R(-.008, .008); p.vy = R(-.012, .004);
      },
      step(p, dt, w, h) {
        if (p.conf) { p.x += p.vx * dt + Math.sin(p.life * .004 + p.ph) * .03 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; return p.y < h + 20; }
        p.x += p.vx * dt + Math.sin(p.life * .0006 + p.ph) * .012 * dt; p.y += p.vy * dt;
        return p.y > -10 && p.x > -10 && p.x < w + 10;
      },
      draw(g, p) {
        if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.col; g.fillRect(-p.s, -p.s * .6, p.s * 2, p.s * 1.2); g.restore(); return; }
        const a = .35 + .6 * Math.abs(Math.sin(p.life * .0014 + p.ph)), rr = p.r * 5;
        const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr); gr.addColorStop(0, `rgba(255,214,120,${a})`); gr.addColorStop(1, 'rgba(255,190,80,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, rr, 0, TAU); g.fill();
      }
    });
  }
  const confetti = () => fly?.burst(70, p => {
    p.conf = true; p.x = R(0, flyCv.clientWidth); p.y = R(-120, -10); p.vx = R(-.03, .03); p.vy = R(.05, .15); p.s = R(3, 6); p.rot = R(0, TAU); p.vr = R(-.006, .006); p.ph = R(0, TAU);
    p.col = ['#d0a65e', '#e6c27a', '#a8292f', '#f3d9a0'][Math.random() * 4 | 0];
  });

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c;
    setTier(); html.classList.remove('gd-open');
    el.innerHTML = `<div class="gd-stage">
      ${stageHTML(true)}
      <div class="gd-hang">
        <div class="gd-plaque"><span class="gd-seal">${HY}</span>
          <p class="gd-to">Gửi ${e(c.guest)}</p>
          <h1 class="gd-names"><span class="n">${e(D.bride.name)}</span><span class="n2"><i aria-hidden="true">&amp;</i> ${e(D.groom.name)}</span></h1>
          <p class="gd-date">${c.d} · ${c.m} · ${c.y}</p></div>
        <div class="gd-tassel" aria-hidden="true"><i class="cord"></i><i class="knob"></i><i class="fringe"></i></div>
      </div>
      <p class="gd-egg" role="status"></p>
      <div class="gd-ui"><p class="gd-hint">Kéo tua đỏ để thắp đèn</p><button class="open-btn" type="button">Thắp đèn</button></div>
      <i class="gd-frame" aria-hidden="true"></i>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.gd-stage'), dark = q('.gd-dark'), tassel = q('.gd-tassel');
    const sc = makeScene(stage, c); sc.start();
    let lit = 0, go = false, music = false;
    const paint = () => {
      const w = stage.clientWidth, h = stage.clientHeight, far = Math.hypot(w / 2, h) * 1.05, r = lit * far;
      dark.style.background = lit >= 1 ? 'transparent' : `radial-gradient(circle at 50% calc(100% - 160px), rgba(16,8,5,0) ${r}px, rgba(16,8,5,${.94 - lit * .1}) ${r + 140}px)`;
      stage.style.setProperty('--lit', lit.toFixed(3));
    };
    paint();
    const stopTilt = M.tilt(v => { stage.style.setProperty('--tx', v.x.toFixed(3)); stage.style.setProperty('--ty', v.y.toFixed(3)); });
    const light = async () => {
      if (go) return; go = true; M.requestTilt(); if (!music) { music = true; EA.music(); }
      stage.classList.add('acting');
      M.haptic('tap'); M.tone('click'); stage.classList.add('struck'); M.tone('whoosh'); M.haptic('success');
      const lighting = M.tween(0, 1, 1500, 'out', v => { lit = v; paint(); });
      await wait(450); stage.classList.add('rise', 'bloom'); M.tone('pop');
      const walk = sc.walkIn(1900);
      await walk; M.tone('chime'); M.haptic('tap');
      await sc.bow(2, 13);
      await lighting; lit = 1; paint();
      await wait(200); open(); html.classList.add('gd-open'); setTier(); stopTilt();
    };
    // pull the red tassel
    M.drag(tassel, {
      axis: 'y', distance: 90,
      onMove(p) { if (go) return; stage.classList.add('pulling'); tassel.style.setProperty('--pull', `${p * 70}px`); stage.style.setProperty('--ember', p.toFixed(2)); if (!music) { music = true; EA.music(); } },
      onEnd(p) {
        stage.classList.remove('pulling');
        if (go) return;
        if (p > .8) { M.tween(70, 0, 420, 'spring', v => tassel.style.setProperty('--pull', `${v}px`)); light(); }
        else M.tween(p * 70, 0, 380, 'spring', v => tassel.style.setProperty('--pull', `${v}px`));
      }
    });
    q('.open-btn').addEventListener('click', async () => {
      if (go) return;
      await M.tween(0, 70, 260, 'inOut', v => tassel.style.setProperty('--pull', `${v}px`)); M.tween(70, 0, 420, 'spring', v => tassel.style.setProperty('--pull', `${v}px`)); light();
    });
    // easter egg: the unlit lamp ember gives a hint
    const egg = q('.gd-egg'); let eggT = 0;
    q('.gd-lamp').addEventListener('click', () => {
      if (go) return; egg.textContent = 'Kéo tua đỏ phía trên, đèn sẽ sáng.'; egg.classList.add('on'); M.tone('pop'); clearTimeout(eggT); eggT = setTimeout(() => egg.classList.remove('on'), 2400);
    });
  });

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const LAMPMINI = '<svg class="gd-lmini" viewBox="0 0 60 80" aria-hidden="true"><ellipse class="halo" cx="30" cy="30" rx="26" ry="30"/><path class="flame" d="M30 8C22 20 20 28 24 36 26 40 34 40 36 36 40 28 38 20 30 8Z"/><path class="bowl" d="M12 46H48C48 56 40 60 30 60S12 56 12 46Z"/><path class="stem" d="M26 60H34L36 70H24Z M18 70H42V74H18Z"/></svg>';

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c;
    const past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="gd-hero">
      <div class="gd-stage hero lit" role="img" aria-label="${e(cp.brideName)} và ${e(cp.groomName)}, hai bóng rối cúi chào dưới ánh đèn">
        ${stageHTML(false)}
        <div class="gd-hang"><div class="gd-plaque"><span class="gd-seal">${HY}</span>
          <p class="gd-to">Đêm rối bóng đôi lứa</p>
          <h1 class="gd-names"><span class="n">${e(cp.brideName)}</span><span class="n2"><i aria-hidden="true">&amp;</i> ${e(cp.groomName)}</span></h1>
          <p class="gd-date">${c.d} · ${c.m} · ${c.y}</p></div></div>
        <p class="gd-egg" role="status"></p>
        <i class="gd-frame" aria-hidden="true"></i>
      </div>
      <div class="gd-copy">
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="gd-dow">${c.dow}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="gd-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
        <p class="gd-scroll">Cuộn xuống để nghe chuyện ${EA.icon('down')}</p>
      </div></div>`;
  });

  // story: đèn kéo quân, the lantern whose silhouettes ride round the candle
  const MOT = [
    `<path d="M32 56C12 52 6 34 13 20 20 30 26 34 32 38 38 34 44 30 51 20 58 34 52 52 32 56Z"/><path d="M32 12C23 24 23 40 32 52 41 40 41 24 32 12Z"/>`,
    `<path d="M6 34Q26 8 54 22Q40 26 32 40Z"/><ellipse cx="30" cy="42" rx="15" ry="6"/><path d="M42 40Q56 38 52 22" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="52" cy="19" r="3.600"/><path d="M55 19l7 2-7 1zM24 48v10M32 48v10" stroke="currentColor" stroke-width="2"/>`,
    `<path d="M5 34A27 27 0 0 1 59 34Q50 29 45 34 39 29 32 34 25 29 19 34 13 29 5 34Z"/><path d="M32 34V52a4.500 4.500 0 0 1-9 0M32 8V4" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round"/>`,
    `<path d="M8 44H56L49 54H15Z"/><path d="M32 8V42L52 42Z"/><path d="M31 6V44" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="16" r="7"/>`,
    `<g stroke="currentColor" stroke-width="3.600" fill="none"><path d="M20 62V8M32 62V14M44 62V4"/></g><path d="M20 24Q34 16 44 24Q32 30 20 24ZM32 36Q18 28 8 36Q20 42 32 36ZM44 18Q54 10 62 18Q52 24 44 18Z"/>`,
    `<ellipse cx="32" cy="34" rx="15" ry="19"/><rect x="21" y="12" width="22" height="6" rx="2"/><rect x="21" y="50" width="22" height="6" rx="2"/><path d="M32 56V62M28 62H36" stroke="currentColor" stroke-width="2.400"/><circle class="cut" cx="32" cy="34" r="5"/>`
  ];
  EA.section('story', ({ esc: e, mod, d, m, y }) => {
    const chs = mod.content.chapters || [];
    if (!chs.length) return '';
    return `<div class="wrap">
      ${head('Đèn kéo quân', e(mod.content.title || 'Chuyện của chúng mình'), 'Kéo nhẹ để xoay đèn, hoặc chạm một chương để dừng lại.')}
      <div class="gd-lantern" tabindex="0" aria-label="Đèn kéo quân xoay quanh ngọn nến">
        <i class="roof" aria-hidden="true"></i>
        <div class="lbody"><i class="lglow" aria-hidden="true"></i>${chs.map((ch, i) => `<span class="it" data-i="${i}"><svg viewBox="0 0 64 64" fill="${INK}" color="${INK}" aria-hidden="true">${MOT[i % MOT.length]}</svg></span>`).join('')}
          <i class="candle" aria-hidden="true"></i></div>
        <i class="base" aria-hidden="true"></i>
      </div>
      <div class="gd-cap" aria-live="polite"><p class="cdate"></p><h3 class="ctitle"></h3><p class="ctext"></p></div>
      <div class="gd-nav" role="group" aria-label="Chọn chương">${chs.map((ch, i) => `<button type="button" data-i="${i}">${i + 1}</button>`).join('')}<button type="button" class="pp" data-pp aria-label="Tạm dừng">${EA.icon('pause')}</button></div>
      <script type="application/json" class="gd-chs">${JSON.stringify(chs.map(ch => ({ date: ch.date, title: ch.title, text: ch.text }))).replace(/</g, '\\u003c')}</script>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
    </div>`;
  });

  EA.section('rsvp', ({ ui, mod, esc: e }) => `<div class="wrap narrow">
    ${head('Thắp đèn đáp lời', e(mod.content.title || 'Bạn sẽ đến chứ?'), 'Bạn gật đầu, ngọn đèn nhỏ này sẽ sáng lên cho bạn.')}
    <div class="gd-rlamp">${LAMPMINI}</div>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod }) => `<div class="wrap narrow">
    <div class="gd-hybig" aria-hidden="true">${HY}</div>
    <p class="eyebrow">Lời cảm ơn</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Thắp lại ngọn đèn ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);


  // core's default English eyebrows become Vietnamese when module data doesn't supply one
  const EYEBROWS = { events: ['Save the date', 'Ngày vui'], schedule: ['Wedding itinerary', 'Lịch trình'], saveDate: ['Save the date', 'Lưu ngày vui'], party: ['Wedding party', 'Người đồng hành'], video: ['Wedding film', 'Thước phim'], gallery: ['A glimpse of us', 'Khoảnh khắc'], dressCode: ['Dress code & notes', 'Trang phục và lưu ý'], faq: ['Wedding guide', 'Cẩm nang'], quote: ['A note from us', 'Lời nhắn'], registry: ['Gift registry', 'Gợi ý quà'], guestbook: ['Guestbook', 'Sổ lưu bút'], contact: ['Contact', 'Liên hệ'] };
  const viEyebrows = main => Object.entries(EYEBROWS).forEach(([id, [en, vi]]) => { const el = main.querySelector(`#${id} .eyebrow`); if (el && el.textContent.trim() === en) el.textContent = vi; });
  // a photo that fails to load never shows the browser's broken icon: hide it and let the themed placeholder behind it show
  const guardImages = main => {
    const bad = img => { img.style.display = 'none'; img.parentElement?.classList.add('nophoto'); };
    main.addEventListener('error', ev => { if (ev.target.tagName === 'IMG') bad(ev.target); }, true);
    main.querySelectorAll('img').forEach(img => { if (img.complete && img.naturalWidth === 0 && img.src) bad(img); });
  };

  function addSection(main, id, htmlStr, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec gd-add m-${id}`; s.innerHTML = htmlStr;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') || main.querySelector('.m-thanks'))?.before(s);
    return s;
  }
  const km = n => Math.round(n).toLocaleString('vi-VN');

  // lantern behaviour
  function wireLantern(sec) {
    const lan = sec.querySelector('.gd-lantern'); if (!lan) return;
    const items = [...lan.querySelectorAll('.it')], N = items.length, chs = JSON.parse(sec.querySelector('.gd-chs').textContent);
    const cd = sec.querySelector('.cdate'), ct = sec.querySelector('.ctitle'), cx = sec.querySelector('.ctext'), cap = sec.querySelector('.gd-cap');
    const btns = [...sec.querySelectorAll('.gd-nav button[data-i]')], pp = sec.querySelector('[data-pp]');
    let th = 0, cur = -1, auto = !M.reduced, resumeT = 0, drag = null, vis = true;
    const step = TAU / N;
    const setCap = i => {
      if (i === cur) return; cur = i; cap.classList.remove('in');
      setTimeout(() => { cd.textContent = chs[i].date; ct.textContent = chs[i].title; cx.textContent = chs[i].text; cap.classList.add('in'); }, cur < 0 || M.reduced ? 0 : 180);
      btns.forEach((b, k) => b.classList.toggle('on', k === i));
    };
    const draw = t => {
      const W = lan.clientWidth, Rx = W * .34;
      let best = 0, bz = -2;
      items.forEach((it, i) => {
        const a = th + i * step, z = Math.cos(a), x = Math.sin(a) * Rx, f = (z + 1) / 2;
        const s = .55 + .45 * f, bob = M.tier === 'low' || M.reduced ? 0 : Math.sin(t * .006 + i * 1.7) * 3 * f;
        it.style.transform = `translate(-50%,0) translate(${x.toFixed(1)}px,${bob.toFixed(1)}px) scale(${s.toFixed(3)})`;
        it.style.opacity = (.22 + .78 * f).toFixed(2); it.style.zIndex = Math.round(f * 10); it.classList.toggle('back', z < 0);
        if (z > bz) { bz = z; best = i; }
      });
      setCap(best);
    };
    const target = i => { let to = -i * step, d = ((to - th) % TAU + TAU) % TAU; if (d > Math.PI) d -= TAU; return th + d; };
    const goTo = i => { auto = false; pp.classList.add('off'); const to = target(i), from = th; M.tween(from, to, 700, 'inOut', v => { th = v; draw(0); }); M.tone('pop'); M.haptic('tap'); };
    btns.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.i)));
    pp.addEventListener('click', () => { auto = !auto; pp.classList.toggle('off', !auto); pp.setAttribute('aria-label', auto ? 'Tạm dừng' : 'Xoay tiếp'); });
    lan.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') goTo((cur + 1) % N); if (ev.key === 'ArrowLeft') goTo((cur + N - 1) % N); });
    lan.addEventListener('pointerdown', ev => { drag = { x: ev.clientX, th, auto }; auto = false; lan.setPointerCapture?.(ev.pointerId); lan.classList.add('grab'); });
    lan.addEventListener('pointermove', ev => { if (drag) { th = drag.th + (ev.clientX - drag.x) * .012; draw(0); } });
    const up = () => { if (!drag) return; lan.classList.remove('grab'); const a = drag.auto; drag = null; clearTimeout(resumeT); if (a && !pp.classList.contains('off')) resumeT = setTimeout(() => { auto = true; }, 2200); };
    lan.addEventListener('pointerup', up); lan.addEventListener('pointercancel', up);
    M.inView(sec, () => {}, { once: false });
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(lan);
    th = 0; draw(0);
    M.loop((t, dt) => { if (!vis) return; if (auto && !drag) { th += dt * .00026; draw(t); } else if (M.tier !== 'low' && !M.reduced) draw(t); });
  }

  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier(); viEyebrows(main); guardImages(main);
    setTimeout(() => { if (cov.hidden) { html.classList.add('gd-open'); startFlies(); } }, 80);
    new MutationObserver(() => { if (html.classList.contains('gd-open')) startFlies(); }).observe(html, { attributes: true, attributeFilter: ['class'] });
    document.body.insertAdjacentHTML('beforeend', '<div class="gd-lampglow" aria-hidden="true"></div>');

    // hero stage: live puppets, tilt shifts the shadows, tap the puppets to bow, tap the flame to blow it out
    const hs = main.querySelector('.gd-stage.hero');
    if (hs) {
      const sc = makeScene(hs, c); let busy = false, outT = 0;
      const egg = hs.querySelector('.gd-egg');
      const doBow = async () => { if (busy) return; busy = true; M.tone('pop'); M.haptic('tap'); await sc.bow(1, 14); busy = false; };
      hs.querySelector('.gd-puppets').addEventListener('click', doBow);
      M.inView(hs, () => setTimeout(() => { if (html.classList.contains('gd-open')) doBow(); }, 900), { threshold: .5, once: true });
      hs.querySelector('.gd-lamp').addEventListener('click', () => {
        if (hs.classList.contains('out')) return;
        hs.classList.add('out'); M.tone('whoosh'); M.haptic('thud');
        egg.textContent = p.get('insideJoke', 'Ối, tắt đèn rồi! Hai bóng vẫn đứng cạnh nhau.'); egg.classList.add('on');
        clearTimeout(outT); outT = setTimeout(() => { hs.classList.remove('out'); egg.classList.remove('on'); M.tone('chime'); M.haptic('success'); }, 3600);
      });
      M.loop(t => { if (!M.reduced) { sc.S.sway = Math.sin(t / 1100) * .9; if (!busy) sc.place(); } }, { el: hs });
      M.tilt(v => { hs.style.setProperty('--tx', v.x.toFixed(3)); hs.style.setProperty('--ty', v.y.toFixed(3)); });
      if (!M.reduced) M.scrollProgress(hs, pr => { hs.style.setProperty('--sp', pr.toFixed(3)); });
    }

    const st = main.querySelector('.m-story'); if (st) wireLantern(st);

    // hai chiếc bóng: hobbies as props, nicknames, drinks, rhythm
    const tr = k => ({ nick: p.get(`traits.${k}.nickname`, ''), hobby: p.get(`traits.${k}.hobby`, ''), drink: p.get(`traits.${k}.drink`, ''), rh: p.get(`traits.${k}.rhythm`, '') });
    const tb = tr('bride'), tg = tr('groom');
    if ([tb, tg].some(t => t.hobby || t.nick || t.drink)) {
      const card = (kind, label, t, name) => `<article class="gd-duo"><div class="stage">${miniPuppet(kind, propFor(t.hobby))}</div>
        <p class="role">${label}</p><h3>${e(name)}${t.nick ? ` <small>“${e(t.nick)}”</small>` : ''}</h3>
        <ul>${t.hobby ? `<li><b>Sở thích</b>${e(t.hobby)}</li>` : ''}${t.drink ? `<li><b>Thức uống</b>${e(t.drink)}</li>` : ''}${t.rh ? `<li><b>Nhịp sống</b>${t.rh === 'night' ? 'Cú đêm' : 'Dậy sớm'}</li>` : ''}</ul></article>`;
      const petKind = p.get('pet.kind', ''), petName = p.get('pet.name', '');
      addSection(main, 'duo', `<div class="wrap">
        ${head('Hai chiếc bóng', 'Mỗi người mang theo một niềm vui')}
        <div class="gd-duos">${card('groom', 'Chú rể', tg, c.data.groom.name)}${card('bride', 'Cô dâu', tb, c.data.bride.name)}</div>
        ${petName ? `<p class="gd-petnote"><svg viewBox="-4 -6 50 56" aria-hidden="true">${petG(petKind)}</svg><span>${e(petName)}${petKind ? `, chú ${e(petKind)} nhỏ` : ''}, luôn đứng giữa hai bóng.</span></p>` : ''}
      </div>`, ['.m-story', '.m-families']);
    }

    // sợi tơ hồng between the two hometowns
    const hb = p.get('hometowns.bride', ''), hg = p.get('hometowns.groom', '');
    if (hb && hg) {
      const dist = c.p.kmBetween(p.get('hometownPins.bride'), p.get('hometownPins.groom'));
      const sec = addSection(main, 'thread', `<div class="wrap narrow">
        ${head('Sợi tơ hồng', 'Hai miền quê, một sợi chỉ đỏ')}
        <div class="gd-thread"><svg viewBox="0 0 360 150" aria-hidden="true">
          <path class="th" d="M44 52C100 130 260 130 316 52" fill="none" stroke="#a8292f" stroke-width="3" stroke-linecap="round" pathLength="1"/>
          <g class="kn"><circle cx="44" cy="52" r="9"/><circle cx="316" cy="52" r="9"/></g>
          <path class="sl" d="M180 108q-14-16 0-26 14 10 0 26z"/></svg>
          <p class="a">${e(hb)}</p><p class="b">${e(hg)}</p></div>
        ${dist ? `<p class="gd-km"><b data-n="${Math.round(dist)}">0</b> km</p>` : ''}
        <p class="sub">${p.daysTogether != null ? `${km(p.daysTogether)} ngày đã thắt sợi tơ ấy chặt hơn.` : 'Dù xa mấy, tơ hồng vẫn nối hai đầu.'}</p>
      </div>`, ['.m-duo', '.m-story', '.m-families']);
      const th = sec.querySelector('.th'), num = sec.querySelector('[data-n]');
      M.inView(sec, () => {
        sec.classList.add('drawn');
        if (num) M.tween(0, +num.dataset.n, 2000, 'out', v => { num.textContent = km(v); });
      }, { threshold: .4 });
    }

    // the lamp in the RSVP lights when the answer is yes
    main.querySelectorAll('form.rsvp-form').forEach(form => form.addEventListener('change', () => {
      const yes = form.attending.value === 'yes', l = main.querySelector('.gd-rlamp');
      if (l && l.classList.contains('lit') !== yes) { l.classList.toggle('lit', yes); if (yes) { M.tone('pop'); M.haptic('tap'); } }
    }));
    const th = main.querySelector('.m-thanks');
    if (th) M.inView(th, () => th.classList.add('seen'), { threshold: .3 });
  });

  // finale: the double-happiness glyph lights up, gold paper falls, the lamp flares
  EA.onRsvp(() => {
    html.classList.add('gd-finale'); M.haptic('success'); M.tone('chime'); setTimeout(() => M.tone('pop'), 280);
    startFlies(); confetti(); setTimeout(confetti, 700);
    const fl = document.createElement('div'); fl.className = 'gd-flare'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 1800);
    setTimeout(() => document.getElementById('thanks')?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 1000);
  });
})();
