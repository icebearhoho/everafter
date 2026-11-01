// Hoa Ép Dịu Dàng: một cuốn sách khép lại trên những bông hoa tươi, mở ra trên cánh hoa ép xếp thành chữ cái đầu của hai người.
// Cover: kéo trang sách sang trái -> sách khép (hoa bị ép) -> vài tuần sau -> sách mở, cánh hoa ép xếp thành hai chữ cái -> thiệp mở.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const f1 = n => (+n).toFixed(1);
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const seeded = seed => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const first = s => (Array.from(String(s || '').trim())[0] || '').toLocaleUpperCase('vi');

// ---------- hoa vẽ bằng SVG ----------
const PRESSED = ['#b9645f', '#c98a7a', '#b8895a', '#bfa35c', '#7f8f5a', '#98a276', '#a9627a', '#d0ad8c'];
const FRESH = { peony: ['#e0546f', '#b83a58'], coral: ['#f06f45', '#c94e2a'], cosmos: ['#f6b92b', '#d8921a'], daisy: ['#ffffff', '#e5ddd0'], blush: ['#f49ab0', '#d8708c'] };
const petalD = (r, round) => { const w = r * round; return `M0 0C${f1(-w)} ${f1(-r * .25)} ${f1(-w * 1.05)} ${f1(-r * .9)} 0 ${f1(-r)}C${f1(w * 1.05)} ${f1(-r * .9)} ${f1(w)} ${f1(-r * .25)} 0 0Z`; };
// một bông hoa nhiều cánh, hai lớp
const bloom = (x, y, r, o = {}) => {
  const { n = 6, c = '#e0546f', c2, center = '#f4b82e', rot = 0, round = .52, stroke = 'rgba(60,30,30,.28)', op = 1, veins = false } = o;
  const d = petalD(r, round), d2 = petalD(r * .7, round * 1.05);
  let s = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})" opacity="${op}">`;
  for (let k = 0; k < n; k++) s += `<path d="${d}" transform="rotate(${f1(360 / n * k)})" fill="${c2 || c}" stroke="${stroke}" stroke-width=".7"/>`;
  for (let k = 0; k < n; k++) s += `<path d="${d2}" transform="rotate(${f1(360 / n * (k + .5))})" fill="${c}" stroke="${stroke}" stroke-width=".5"/>`;
  if (veins) for (let k = 0; k < n; k++) s += `<path d="M0 ${f1(-r * .15)}L0 ${f1(-r * .8)}" transform="rotate(${f1(360 / n * k)})" stroke="${stroke}" stroke-width=".5" fill="none"/>`;
  return s + `<circle r="${f1(r * .17)}" fill="${center}" stroke="${stroke}" stroke-width=".5"/></g>`;
};
const leaf = (x, y, len, rot, fill, o = {}) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})"><path d="M0 0C${f1(len * .3)} ${f1(-len * .22)} ${f1(len * .75)} ${f1(-len * .2)} ${f1(len)} 0C${f1(len * .75)} ${f1(len * .2)} ${f1(len * .3)} ${f1(len * .22)} 0 0Z" fill="${fill}" stroke="${o.stroke || 'rgba(40,60,30,.4)'}" stroke-width=".6"/><path d="M0 0L${f1(len * .9)} 0" stroke="${o.stroke || 'rgba(40,60,30,.4)'}" stroke-width=".5"/></g>`;

// bó hoa tươi trên trang trái (viewBox 200 x 300)
function bouquet() {
  const stem = (x2, y2, cx) => `<path d="M100 244C${cx} 200 ${x2} ${y2 + 60} ${x2} ${y2}" stroke="#3f6a34" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const fl = [
    { x: 100, y: 92, r: 40, o: { n: 8, c: FRESH.peony[0], c2: FRESH.peony[1], center: '#f6c64a' }, cx: 100 },
    { x: 48, y: 140, r: 29, o: { n: 6, c: FRESH.coral[0], c2: FRESH.coral[1], center: '#fbe38a', rot: 14 }, cx: 70 },
    { x: 152, y: 134, r: 30, o: { n: 8, c: FRESH.cosmos[0], c2: FRESH.cosmos[1], center: '#b4561b', rot: 8 }, cx: 130 },
    { x: 70, y: 62, r: 22, o: { n: 10, c: FRESH.daisy[0], c2: FRESH.daisy[1], center: '#f1b321', round: .3 }, cx: 80 },
    { x: 140, y: 64, r: 22, o: { n: 6, c: FRESH.blush[0], c2: FRESH.blush[1], center: '#fff2b8', rot: 30 }, cx: 120 },
    { x: 100, y: 168, r: 22, o: { n: 5, c: '#fff4f0', c2: '#f3c2cc', center: '#e9a23a', rot: 20, round: .6 }, cx: 100 }
  ];
  const dots = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * 6.28; return `<circle cx="${f1(100 + Math.cos(a) * (62 + (i % 3) * 8))}" cy="${f1(112 + Math.sin(a) * (62 + (i % 4) * 5))}" r="${i % 3 ? 2.6 : 3.4}" fill="#fff" stroke="rgba(60,60,50,.3)" stroke-width=".5"/>`; }).join('');
  return `<svg viewBox="0 0 200 300" class="bq" aria-hidden="true">
    <g class="sw s3">${fl.map(f => stem(f.x, f.y, f.cx)).join('')}</g>
    <g class="sw s2">${leaf(100, 214, 62, -150, '#4d8040')}${leaf(100, 214, 62, -30, '#5a9048')}${leaf(98, 186, 50, -165, '#3f6f35')}${leaf(102, 186, 50, -15, '#4d8040')}${leaf(98, 150, 40, -128, '#5a9048')}${leaf(102, 150, 40, -52, '#4d8040')}</g>
    <g class="sw s1">${dots}</g>
    ${fl.map((f, i) => `<g class="sw s${i % 3 + 1}">${bloom(f.x, f.y, f.r, f.o)}</g>`).join('')}
    <g><path d="M100 236c-14-10-28-6-34 4 12 8 28 4 34-4zM100 236c14-10 28-6 34 4-12 8-28 4-34-4z" fill="#a43a52" stroke="rgba(60,20,30,.4)" stroke-width=".7"/><circle cx="100" cy="238" r="5" fill="#8a2e44"/><path d="M96 242l-8 30M104 242l8 30" stroke="#a43a52" stroke-width="3.5" stroke-linecap="round"/></g>
  </svg>`;
}

// chữ cái đầu: lấy mẫu điểm bên trong chữ rồi rải cánh hoa ép lên đó (viewBox 160 x 220)
function letterPoints(ch, W = 160, H = 220) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  let fs = 290; const face = s => `700 ${s}px "Cormorant Garamond", Georgia, serif`;
  g.font = face(fs); const mw = g.measureText(ch).width; if (mw > W * .9) fs *= W * .9 / mw;
  const cx = W / 2, base = H * .9;
  g.font = face(fs); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#000'; g.fillText(ch, cx, base);
  const px = g.getImageData(0, 0, W, H).data;
  const a = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? 0 : px[((y | 0) * W + (x | 0)) * 4 + 3];
  const pts = [], step = 3.6;
  for (let y = 2; y < H; y += step) for (let x = 2; x < W; x += step) {
    const jx = x + rnd(-1, 1), jy = y + rnd(-1, 1);
    if (a(jx, jy) < 140) continue;
    const edge = a(jx - 3, jy) < 90 || a(jx + 3, jy) < 90 || a(jx, jy - 3) < 90 || a(jx, jy + 3) < 90;
    pts.push({ x: jx, y: jy, edge });
  }
  return { pts, fs, cx, base };
}
function pressedLetter(ch, seedKey) {
  const R = seeded(hash(seedKey)), { pts, fs, cx, base } = letterPoints(ch), P = () => PRESSED[(R() * PRESSED.length) | 0];
  const ink = 'rgba(70,45,35,.4)';
  const items = pts.map(p => {
    const rot = R() * 360, d = (p.y / 220 * 520 + R() * 160) | 0;
    let svg;
    const k = R();
    if (p.edge) svg = k < .6 ? `<ellipse rx="2.6" ry="4.6" fill="${P()}" stroke="${ink}" stroke-width=".4"/>` : k < .85 ? `<circle r="1.9" fill="#f4eadb" stroke="${ink}" stroke-width=".4"/>` : leaf(0, 0, 7, 0, '#7f8f5a', { stroke: ink });
    else if (k < .14) svg = bloom(0, 0, 5.6, { n: 5, c: P(), c2: P(), center: '#d9a441', round: .6, stroke: ink });
    else if (k < .5) svg = `<path d="${petalD(9 + R() * 4, .5)}" fill="${P()}" stroke="${ink}" stroke-width=".4"/>`;
    else if (k < .76) svg = leaf(0, 0, 8 + R() * 4, 0, R() < .5 ? '#7f8f5a' : '#98a276', { stroke: ink });
    else svg = `<ellipse rx="3.2" ry="5.6" fill="${P()}" stroke="${ink}" stroke-width=".4"/>`;
    return `<g class="pp" style="--d:${d}ms" transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(rot)})"><g>${svg}</g></g>`;
  });
  const outline = `<text class="pl-o" x="${f1(cx)}" y="${f1(base)}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-weight="700" font-size="${f1(fs)}" fill="none" stroke="rgba(70,45,35,.55)" stroke-width="1" stroke-dasharray="3 2">${ch}</text>`;
  return `<svg viewBox="0 0 160 220" class="pl" aria-hidden="true" role="img">${outline}${items.join('')}</svg>`;
}

// loài hoa theo nơi chốn (herbarium)
const SPECIES = [
  { keys: ['da lat'], name: 'Cẩm tú cầu', kind: 'hydrangea' },
  { keys: ['hoi an', 'hue'], name: 'Hoa giấy', kind: 'bougain' },
  { keys: ['ha noi', 'nam dinh', 'hai phong'], name: 'Cúc họa mi', kind: 'daisy' },
  { keys: ['can tho', 'ben tre', 'vinh long', 'dong thap', 'an giang', 'mekong'], name: 'Hoa sen', kind: 'lotus' },
  { keys: ['sai gon', 'ho chi minh', 'thu vien', 'tphcm'], name: 'Hoa mai', kind: 'plum' }
];
const WILD = { name: 'Hoa dại', kind: 'wild' };
const speciesFor = (name, i) => SPECIES.find(s => s.keys.some(k => norm(name).includes(k))) || (i % 2 ? WILD : SPECIES[2]);
function specimen(kind, seedKey) {
  const R = seeded(hash(seedKey)), st = 'rgba(70,45,35,.35)';
  const stem = '<path d="M50 132C48 100 52 74 50 46" stroke="#6f8450" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  const lv = leaf(50, 112, 28, -150, '#8a9a64', { stroke: st }) + leaf(50, 96, 24, -28, '#7c8d58', { stroke: st });
  let top = '';
  if (kind === 'hydrangea') {
    for (let i = 0; i < 17; i++) { const a = i * 2.4, rr = Math.sqrt(i) * 6.3; top += bloom(50 + Math.cos(a) * rr, 36 + Math.sin(a) * rr * .9, 7.5, { n: 4, c: ['#8a8fc4', '#a89bc8', '#7f9ac0'][i % 3], c2: '#6f7fb0', center: '#f2e6b0', round: .75, rot: R() * 90, stroke: st }); }
  } else if (kind === 'bougain') {
    for (let i = 0; i < 5; i++) { const a = i * 1.25 + .3; top += `<path d="M0 0L-9 -22Q0 -28 9 -22Z" transform="translate(${f1(50 + Math.cos(a) * 15)} ${f1(40 + Math.sin(a) * 15)}) rotate(${f1(a * 57.3 + 90)})" fill="${['#b0457a', '#c4609a', '#a23a6e'][i % 3]}" stroke="${st}" stroke-width=".6"/>`; }
    top += '<circle cx="50" cy="40" r="3" fill="#f6e9c8"/>';
  } else if (kind === 'lotus') {
    top = bloom(50, 52, 32, { n: 9, c: '#e8a6b4', c2: '#cf7c92', center: '#e6b64a', round: .36, stroke: st, veins: true });
  } else if (kind === 'daisy') {
    top = bloom(50, 38, 27, { n: 16, c: '#f5efe2', c2: '#dcd2bd', center: '#d9a22a', round: .2, stroke: st });
  } else if (kind === 'plum') {
    for (let i = 0; i < 3; i++) top += bloom(36 + i * 14, 44 - (i % 2) * 16, 14, { n: 5, c: '#e6b93a', c2: '#c8962a', center: '#9a5a1a', round: .82, rot: R() * 70, stroke: st });
  } else {
    for (let i = 0; i < 5; i++) top += bloom(36 + R() * 28, 18 + i * 14, 8, { n: 5, c: ['#8f9bd0', '#b79bc9', '#e3a9b6'][i % 3], c2: '#7d86b4', center: '#f4e3a0', round: .7, stroke: st });
  }
  return `<svg viewBox="0 0 100 140" class="spec" aria-hidden="true">${stem}${lv}${top}</svg>`;
}

// ---------- cover ----------
let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const nameA = D.bride.short || D.bride.name, nameB = D.groom.short || D.groom.name;
  const iniA = first(nameA), iniB = first(nameB);
  const nick = k => c.p.get(`traits.${k}.nickname`, '');

  el.className = 'cover bk-cover';
  el.style.cssText = '';
  el.innerHTML = `
    <canvas class="bk-fx ea-mo-canvas" aria-hidden="true"></canvas>
    <div class="bk-wrap">
      <p class="bk-k">Thiệp mời</p>
      <div class="bk" aria-label="Cuốn sách ép hoa của ${e(nameA)} và ${e(nameB)}">
        <i class="bk-board l" aria-hidden="true"></i><i class="bk-board r" aria-hidden="true"></i>
        <section class="pg left">
          <button class="fresh" type="button" aria-label="Bó hoa tươi. Chạm ba lần để hoa rụng cánh">${bouquet()}</button>
          <div class="pressed-wrap" aria-hidden="true"></div>
          <p class="to">Gửi ${e(c.guest)}</p>
          <i class="gut" aria-hidden="true"></i><i class="shade" aria-hidden="true"></i>
        </section>
        <section class="pg right under" aria-hidden="true"><i class="gut"></i></section>
        <div class="lf" role="group" aria-label="Trang sách. Kéo sang trái để khép sách">
          <div class="face front">
            <p class="lk">Thiệp mời cưới</p>
            <p class="ln">${e(nameA)}</p><p class="la">&amp;</p><p class="ln">${e(nameB)}</p>
            <p class="ld">${c.d} · ${c.m} · ${c.y}</p>
            <i class="gut" aria-hidden="true"></i><i class="lshade" aria-hidden="true"></i>
          </div>
          <div class="face back" aria-hidden="true">
            <span class="cl-frame"></span><p class="cl-mono">${e(D.monogram)}</p><p class="cl-t">Hoa ép</p><span class="rib"></span>
          </div>
        </div>
        <p class="tip" hidden></p>
      </div>
      <p class="bk-cap" aria-live="polite"><span></span></p>
      <p class="bk-hint">Kéo trang sách sang trái để ép những bông hoa này</p>
      <button class="open-btn" type="button">Ép hoa</button>
    </div>`;

  const $ = s => el.querySelector(s);
  const bk = $('.bk'), leafEl = $('.lf'), cap = $('.bk-cap span'), hint = $('.bk-hint'), tip = $('.tip');
  const frontFace = $('.face.front'), pressedWrap = $('.pressed-wrap'), fresh = $('.fresh');
  const S = { a: 0, f: 0 };           // a: góc trang (0..1), f: độ khép
  let locked = false, ended = false, musicOn = false;
  const stops = [];
  stopCover = () => { ended = true; stops.splice(0).forEach(fn => { try { fn(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));
  const setA = v => {
    S.a = clamp(v);
    const sm = x => x * x * (3 - 2 * x);
    S.f = sm(clamp((S.a - .15) / .85));
    el.style.setProperty('--a', S.a.toFixed(4)); el.style.setProperty('--f', S.f.toFixed(4));
  };
  setA(0);

  // chữ ép được dựng sẵn (đợi font) để lúc lật ra là có ngay
  const ready = (async () => {
    try { await Promise.race([document.fonts.load('700 120px "Cormorant Garamond"', `${iniA}${iniB}ABCĐ`), new Promise(r => setTimeout(r, 1600))]); } catch { /* */ }
    return { L: pressedLetter(iniA, nameA + c.y), B: pressedLetter(iniB, nameB + c.y) };
  })();

  // ambient: cánh hoa trôi nhẹ + nghiêng máy -> bó hoa lệch nhẹ
  const fx = $('.bk-fx');
  const col = ['#f49ab0', '#fbd5dc', '#f6b92b', '#ffffff', '#c9d8b6'];
  const sp = M.particles(fx, {
    count: 16,
    init: (p, i, w, h) => { p.x = rnd(0, w); p.y = rnd(-h * .2, h); p.vy = rnd(.012, .03); p.s = rnd(5, 10); p.r = rnd(0, 6.28); p.vr = rnd(-.0014, .0014); p.ph = rnd(0, 6.28); p.c = col[(Math.random() * col.length) | 0]; p.o = rnd(.35, .7); },
    step: (p, dt, w, h) => { p.y += p.vy * dt; p.x += Math.sin(p.life * .0007 + p.ph) * .25; p.r += p.vr * dt; if (p.y > h + 20) return false; },
    draw: (g, p) => { g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = p.o; g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.s * .5, p.s, 0, 0, 6.2832); g.fill(); g.restore(); }
  });
  stops.push(() => sp.stop());
  if (M.tier !== 'low') stops.push(M.tilt(({ x, y }) => { if (!locked) { el.style.setProperty('--tx', x.toFixed(3)); el.style.setProperty('--ty', y.toFixed(3)); } }));

  // easter egg: chạm ba lần vào bó hoa -> hoa rụng cánh, hiện biệt danh
  let taps = 0, tapT = 0, tipTimer = 0;
  fresh.addEventListener('click', () => {
    if (locked) return;
    M.tone('pop'); M.haptic('tap');
    const now = Date.now(); taps = now - tapT < 1500 ? taps + 1 : 1; tapT = now;
    fresh.classList.remove('wob'); void fresh.offsetWidth; fresh.classList.add('wob');
    sp.burst(8, (p, i, w, h) => { p.x = w / 2 + rnd(-60, 60); p.y = h * .3; p.vy = rnd(.05, .12); p.s = rnd(6, 11); p.r = rnd(0, 6.28); p.vr = rnd(-.003, .003); p.ph = rnd(0, 6.28); p.c = col[(Math.random() * 3) | 0]; p.o = .85; });
    if (taps < 3) return;
    taps = 0;
    const a = nick('bride'), b = nick('groom');
    tip.textContent = a && b ? `${a} và ${b}` : `Hoa này nở dành cho ${c.guest}`;
    tip.hidden = false; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
    M.tone('chime'); M.haptic('success');
    clearTimeout(tipTimer); tipTimer = setTimeout(() => { tip.hidden = true; }, 2800);
  });

  // ---- gesture: kéo trang sách sang trái ----
  let lastStep = 0;
  const progress = v => {
    setA(v);
    const k = Math.floor(S.a * 6);
    if (k !== lastStep) { lastStep = k; if (k > 0 && k < 6) { M.haptic('tap'); if (k === 1) M.tone('whoosh'); } }
  };
  const begin = () => { if (musicOn) return; musicOn = true; EA.music(); M.requestTilt(); hint.classList.add('gone'); };
  const bookW = () => bk.clientWidth;

  async function finish() {
    if (locked || ended) return;
    locked = true; begin(); el.classList.add('busy');
    el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
    if (M.reduced) return reduced();
    // 1. khép sách
    M.tone('whoosh');
    await M.tween(S.a, 1, 260 + 760 * (1 - S.a), 'inOut', progress);
    if (ended) return;
    el.classList.add('closed');
    M.tone('thud'); M.haptic('thud');
    sp.burst(18, (p, i, w, h) => { p.x = w / 2 + rnd(-90, 90); p.y = h * .46 + rnd(-40, 40); p.vy = rnd(.03, .09); p.s = rnd(6, 11); p.r = rnd(0, 6.28); p.vr = rnd(-.004, .004); p.ph = rnd(0, 6.28); p.c = col[(Math.random() * 4) | 0]; p.o = .9; });
    // 2. ép: sách nén lại, giấy ngả màu, "vài tuần sau"
    cap.textContent = 'Đang ép hoa…'; el.classList.add('pressing');
    await wait(520); if (ended) return;
    cap.textContent = 'Vài tuần sau…'; el.classList.add('aged'); M.tone('click');
    const { L, B } = await ready;
    pressedWrap.innerHTML = L;
    // chữ thứ hai nằm ở mặt trước của trang sách (đang úp xuống)
    frontFace.innerHTML = `<div class="pressed-wrap">${B}</div><i class="gut" aria-hidden="true"></i><i class="lshade" aria-hidden="true"></i>`;
    el.classList.add('swapped');
    await wait(620); if (ended) return;
    // 3. mở sách trên cánh hoa ép
    cap.textContent = ''; el.classList.remove('pressing', 'closed');
    M.tone('whoosh');
    setTimeout(() => { if (!ended) el.classList.add('bloomed'); }, 420);
    const fly = M.tween(1, 0, 1250, 'inOut', progress);
    setTimeout(() => {
      if (ended) return;
      M.tone('chime'); M.haptic('success');
      sp.burst(26, (p, i, w, h) => { p.x = w / 2 + rnd(-130, 130); p.y = h * .5 + rnd(-90, 90); p.vy = rnd(-.01, .02); p.s = rnd(3, 6); p.r = 0; p.vr = 0; p.ph = rnd(0, 6.28); p.c = '#f6e3a8'; p.o = .95; });
    }, 980);
    await fly; if (ended) return;
    cap.textContent = `${nameA} & ${nameB}`; el.classList.add('named');
    await wait(850); if (ended) return;
    el.classList.add('lift');
    await wait(400); if (ended) return;
    open();
    setTimeout(stopCover, 1200);
  }
  async function reduced() {
    const { L, B } = await ready;
    pressedWrap.innerHTML = L;
    frontFace.innerHTML = `<div class="pressed-wrap">${B}</div><i class="gut" aria-hidden="true"></i>`;
    setA(0); el.classList.add('swapped', 'bloomed', 'aged', 'named');
    cap.textContent = `${nameA} & ${nameB}`;
    setTimeout(() => { if (!ended) open(); }, 700);
  }

  let base = 0, moved = false;
  leafEl.addEventListener('pointerdown', () => { if (locked) return; base = S.a; moved = false; begin(); });
  M.drag(leafEl, {
    axis: 'x', distance: 1, invert: true,
    onMove: (_p, dx) => { if (locked) return; if (Math.abs(dx) > 6) moved = true; if (moved) progress(base - dx / (bookW() * .5)); },
    onEnd: () => {
      if (locked || !moved) return;
      if (S.a >= .38) finish(); else M.tween(S.a, 0, 450, 'out', setA);
    }
  });
  leafEl.setAttribute('tabindex', '0');
  leafEl.addEventListener('keydown', ev => { if (ev.key === 'ArrowLeft' && !locked) { ev.preventDefault(); begin(); finish(); } });
  $('.open-btn').addEventListener('click', () => { locked || finish(); }, { once: true });
});

// ---------- layouts ----------
const LEAF = `<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 12 C12 0 30 0 38 12 C30 24 12 24 2 12Z" fill="#7f9a67"/><path d="M4 12 H34" stroke="#3f5e32" stroke-width="1"/></svg>`;
const SPRIG = `<svg viewBox="0 0 60 90" aria-hidden="true"><path d="M30 88 C30 60 30 40 30 12" stroke="#4d6a3a" stroke-width="1.5" fill="none"/>${[20, 36, 52, 68].map((y, i) => `<ellipse cx="${i % 2 ? 40 : 20}" cy="${y}" rx="10" ry="5" transform="rotate(${i % 2 ? -30 : 30} ${i % 2 ? 40 : 20} ${y})" fill="#7f9a67"/>`).join('')}<circle cx="30" cy="10" r="6" fill="#c9786f"/></svg>`;

EA.section('itinerary', ({ data: D, esc: e, ui }) => `<div class="wrap narrow">
  ${ui.head('Lịch trình', 'Một ngày thật vui')}
  <ol class="vine">
    ${D.itinerary.map(it => `<li><span class="leaf">${LEAF}</span><time>${e(it.time)}</time><strong>${e(it.title)}</strong><span class="n">${e(it.note)}</span></li>`).join('')}
  </ol>
</div>`);

EA.section('gallery', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Khoảnh khắc', 'Khoảnh khắc của chúng mình')}
  <div class="album">
    ${D.photos.map((p, i) => `<figure>${ui.photo(p, i)}<figcaption>${e(p.caption)}</figcaption></figure>`).join('')}
  </div>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ngày vui', 'Ngày chúng mình thành đôi')}
  <div class="herbarium">
    ${D.events.map((ev, i) => `
      <article class="specimen">
        <div class="sprig">${SPRIG}</div>
        <div>
          <p class="label">Mẫu số ${String(i + 1).padStart(2, '0')} · ${e(ev.label)}</p>
          <h3>${e(ev.title)}</h3>
          <p class="t">${ui.evDate(ev)}</p>
          <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
          ${ui.actions(ev)}
        </div>
      </article>`).join('')}
  </div>
</div>`);

EA.section('notes', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Trang phục &amp; lưu ý', 'Một chút lưu ý')}
  <div class="packets">
    ${D.dressCode.map(s => `<div class="packet"><span class="flap" style="background:${e(s.color)}"></span><p>${e(s.name)}</p></div>`).join('')}
  </div>
  <ul class="notelist leafy">${D.notes.map(n => `<li>${e(n)}</li>`).join('')}</ul>
</div>`);

EA.section('quote', ({ data: D, esc: e }) => `<div class="wrap narrow">
  <div class="framed">
    <span class="corner tl">${SPRIG}</span><span class="corner br">${SPRIG}</span>
    <p class="eyebrow">Lời nhắn</p>
    <blockquote>${e(D.quote)}</blockquote>
    <p class="sig">${e(D.bride.short)} &amp; ${e(D.groom.short)}</p>
  </div>
</div>`);

const WREATH = `<svg class="wreath" viewBox="0 0 200 200" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => {
  const a = i / 22 * Math.PI * 2, x = 100 + Math.cos(a) * 92, y = 100 + Math.sin(a) * 92, r = a * 180 / Math.PI + 90;
  return i % 5 === 0
    ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#c9786f"/>`
    : `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="9" transform="rotate(${(r + (i % 2 ? 30 : -30)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? '#7f9a67' : '#5f8250'}"/>`;
}).join('')}</svg>`;

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap narrow">
  <div class="bt-hero">
    <div class="bt-oval">${WREATH}<img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"></div>
    <p class="bt-script">${e(cp.brideShortName)} &amp; ${e(cp.groomShortName)}</p>
    <h1 class="couple bt-full"><span>${e(cp.brideName)}</span><span class="amp">và</span><span>${e(cp.groomName)}</span></h1>
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="hero-date">${c.dow} · ${c.dateText}</p>
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện tình', 'Những trang hoa ép')}
  <div class="pages">
    ${(mod.content.chapters || []).map(ch => `
      <article class="page-ep">
        ${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}
        <p class="bt-date">${e(ch.date)}</p>
        <h3>${e(ch.title)}</h3>
        <p>${e(ch.text)}</p>
        <span class="petal" aria-hidden="true"></span>
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Hồi âm', 'Gửi lời hồi âm')}
  <div class="garden-card">${WREATH}${ui.rsvpForm()}</div>
</div>`);

// ---------- sau khi render: add-on, nhịp chuyển động, finale ----------
const onEmptyTap = (main, fn) => main.addEventListener('click', ev => {
  if (ev.target.closest('a, button, input, select, textarea, label, summary, details, dialog, canvas, .photo, img, iframe, .lt')) return;
  fn(ev.clientX, ev.pageY, ev);
});

EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const fxl = document.createElement('div'); fxl.className = 'fx-layer'; fxl.setAttribute('aria-hidden', 'true'); document.body.appendChild(fxl);
  const short = k => D[k].short || D[k].name;
  const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? (m[3] ? `${m[3]}.${m[2]}.${m[1]}` : `${m[2]}.${m[1]}`) : ''; };

  // --- vine lớn dần theo cuộn trang ---
  const vine = main.querySelector('.vine');
  if (vine && !c.reduced) {
    const items = vine.querySelectorAll('li');
    let raf = 0;
    const upd = () => {
      raf = 0;
      const r = vine.getBoundingClientRect(), p = clamp((innerHeight * .8 - r.top) / r.height);
      vine.style.setProperty('--grow', p.toFixed(3));
      items.forEach(li => li.classList.toggle('grown', li.offsetTop / vine.offsetHeight < p));
    };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(upd); }, { passive: true }); upd();
  } else vine?.querySelectorAll('li').forEach(li => li.classList.add('grown'));

  // --- add-on ---
  const adds = [];
  // 1. nhãn herbarium của chính hai người
  if (P.has('metDate') && P.daysTogether != null) {
    const n = P.daysTogether, place = P.get('metPlace', ''), city = P.get('metCity', '');
    adds.push(['label', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Nhãn mẫu vật</p><h2 class="title">Trang đầu tiên của cuốn sách</h2></header>
      <div class="tag" role="group" aria-label="Nhãn ép hoa của ${e(short('bride'))} và ${e(short('groom'))}">
        <span class="hole" aria-hidden="true"></span>
        <p class="tg-h">${e(short('bride'))} &amp; ${e(short('groom'))}</p>
        <dl>
          <div><dt>Ngày gặp</dt><dd>${dmy(P.get('metDate'))}</dd></div>
          ${place ? `<div><dt>Nơi gặp</dt><dd>${e(place)}${city ? `, ${e(city)}` : ''}</dd></div>` : ''}
          <div><dt>Đã bên nhau</dt><dd><b class="num" data-n="${n}">${fmt(n)}</b> ngày</dd></div>
          ${P.has('song.title') ? `<div><dt>Bài hát</dt><dd>${e(P.get('song.title'))}${P.has('song.artist') ? `, ${e(P.get('song.artist'))}` : ''}</dd></div>` : ''}
        </dl>
        <p class="tg-f">Mỗi ngày một cánh hoa, ép lại thành cuốn sách này.</p>
      </div></div>`]);
  }
  // 2. hoa từ những nơi mình đi qua
  const places = [];
  const hs = P.get('hometowns', {});
  if (hs.bride) places.push({ name: hs.bride, tag: `Quê ${short('bride')}` });
  if (hs.groom) places.push({ name: hs.groom, tag: `Quê ${short('groom')}` });
  (P.get('places', []) || []).slice(0, 4).forEach(pl => { if (pl.name && !places.some(x => norm(x.name) === norm(pl.name))) places.push({ name: pl.name, tag: pl.date ? `Hái tháng ${dmy(pl.date)}` : 'Một chặng đường', date: pl.date }); });
  if (places.length) {
    adds.push(['garden', `<div class="wrap">
      <header class="head"><p class="eyebrow">Tập mẫu vật</p><h2 class="title">Hoa từ những nơi mình đi qua</h2></header>
      <div class="hb">
        ${places.slice(0, 6).map((pl, i) => { const sp = speciesFor(pl.name, i); return `<figure class="hb-c" style="--i:${i}">
          <div class="hb-p">${specimen(sp.kind, pl.name)}<span class="tape" aria-hidden="true"></span></div>
          <figcaption><b>${e(sp.name)}</b><span>${e(pl.name)}</span><small>${e(pl.tag)}</small></figcaption></figure>`; }).join('')}
      </div></div>`]);
  }
  // 3. thư kẹp trong sách
  const lb = P.get('letters.bride'), lg = P.get('letters.groom');
  if (lb || lg) {
    const L = (who, txt, to) => txt ? `<article class="lt-w"><button class="lt" type="button" aria-expanded="false"><span class="lt-seal" aria-hidden="true"><svg viewBox="0 0 40 40">${bloom(20, 20, 17, { n: 5, c: '#c9786f', c2: '#a9564f', center: '#f3d27a', round: .62 })}</svg></span><span class="lt-who">Thư của ${e(short(who))}</span><span class="lt-to">gửi ${e(short(to))}</span><span class="lt-open">Mở thư</span></button><div class="lt-body"><div><p>${e(txt)}</p><p class="lt-sig">${e(short(who))}</p></div></div></article>` : '';
    adds.push(['letters', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Thư kẹp trong sách</p><h2 class="title">Hai lá thư nhỏ</h2><p class="sub">Chạm để mở từng lá thư.</p></header>
      <div class="lts">${L('bride', lb, 'groom')}${L('groom', lg, 'bride')}</div></div>`]);
  }
  let prev = main.querySelector('#story') || main.querySelector('#invitation') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} bt-add`; s.innerHTML = html;
    prev ? prev.insertAdjacentElement('afterend', s) : main.appendChild(s);
    prev = s;
  });
  main.querySelectorAll('.lt').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(on)); b.closest('.lt-w').classList.toggle('open', on);
    M.tone('click'); M.haptic('tap'); b.querySelector('.lt-open').textContent = on ? 'Gấp lại' : 'Mở thư';
  }));
  const lab = main.querySelector('#label');
  if (lab) {
    const nums = [...lab.querySelectorAll('.num')];
    if (!M.reduced) nums.forEach(x => { x.textContent = '0'; });
    M.inView(lab, () => nums.forEach(x => { const n = +x.dataset.n; M.tween(0, n, 1800, 'out', v => { x.textContent = fmt(v); }).then(() => { x.textContent = fmt(n); }); }), { threshold: .3 });
  }
  M.inView && main.querySelectorAll('.hb-c').forEach(f => M.inView(f, () => f.classList.add('in'), { threshold: .2 }));

  // --- lời chúc trong sổ lưu bút = những trang hoa ép ---
  const pressFlower = txt => {
    const R = seeded(hash(txt)), k = R(), P2 = () => PRESSED[(R() * PRESSED.length) | 0];
    const st = 'rgba(70,45,35,.35)';
    let g = '<path d="M30 62C29 46 31 30 30 18" stroke="#6f8450" stroke-width="1.6" fill="none"/>' + leaf(30, 46, 14, -150, '#8a9a64', { stroke: st });
    g += k < .5 ? bloom(30, 16, 12, { n: 5 + ((R() * 4) | 0), c: P2(), c2: P2(), center: '#d9a441', round: .55, stroke: st }) : bloom(30, 16, 11, { n: 8, c: P2(), c2: P2(), center: '#c98a2e', round: .3, stroke: st });
    return `<span class="wi-fl" aria-hidden="true"><svg viewBox="0 0 60 66">${g}</svg></span>`;
  };
  const decorate = list => list.querySelectorAll('.wish-item:not([data-pf])').forEach((li, i) => { li.dataset.pf = '1'; li.insertAdjacentHTML('afterbegin', pressFlower(li.textContent + i)); });
  main.querySelectorAll('.wish-list').forEach(list => {
    decorate(list);
    new MutationObserver(() => { const had = list.querySelector('.wish-item[data-pf]'); decorate(list); void had; }).observe(list, { childList: true });
  });
  EA.onGuestbook(() => {
    M.tone('click'); M.haptic('success');
    setTimeout(() => main.querySelectorAll('.wish-list').forEach(l => { const f = l.querySelector('.wish-item'); if (f) { f.classList.remove('just'); void f.offsetWidth; f.classList.add('just'); } }), 40);
  });

  // --- cánh hoa rơi nhẹ ở nền (tier-aware), gió theo cuộn trang và nghiêng máy ---
  if (!c.reduced && M.tier !== 'low') {
    const cv = document.createElement('canvas'); cv.className = 'bt-fall ea-mo-canvas'; cv.setAttribute('aria-hidden', 'true'); document.body.prepend(cv);
    let wind = 0, lastY = scrollY;
    const tcol = ['#f2b8c0', '#f8d9dc', '#cfdcbc', '#f3e0a8'];
    const fall = M.particles(cv, {
      count: 22,
      init: (p, i, w, h) => { p.x = rnd(0, w); p.y = p.life === 0 && i < 1e9 ? rnd(-h, h) : -20; p.vy = rnd(.014, .034); p.s = rnd(5, 9); p.r = rnd(0, 6.28); p.vr = rnd(-.0012, .0012); p.ph = rnd(0, 6.28); p.c = tcol[(Math.random() * 4) | 0]; p.o = rnd(.4, .75); },
      step: (p, dt, w, h) => { p.y += p.vy * dt; p.x += Math.sin(p.life * .0006 + p.ph) * .3 + wind * dt * .02; p.r += p.vr * dt; if (p.y > h + 24 || p.x < -30 || p.x > w + 30) { return false; } },
      draw: (g, p) => { g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = p.o; g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.s * .5, p.s, 0, 0, 6.2832); g.fill(); g.restore(); }
    });
    const off = M.tilt(({ x }) => { wind = wind * .9 + x * 6; });
    addEventListener('scroll', () => { const dy = scrollY - lastY; lastY = scrollY; wind = clamp(wind + dy * .05, -14, 14); }, { passive: true });
    void fall; void off;
    // vòng hoa ở hero xoay nhẹ theo nghiêng máy
    const wr = main.querySelector('.bt-oval .wreath');
    if (wr) M.tilt(({ x, y }) => { wr.style.transform = `rotate(${(x * 6).toFixed(2)}deg) translate(${(x * 4).toFixed(1)}px, ${(y * 3).toFixed(1)}px)`; });
  }

  // --- chạm khoảng trống: một bông hoa nở ---
  if (!c.reduced) {
    const colors = ['#e3868f', '#f3b3ba', '#c9d8b6', '#f6dd98'];
    onEmptyTap(main, (x, y) => {
      const f = document.createElement('span');
      f.className = 'bloom';
      f.style.cssText = `left:${x}px;top:${y}px;--c:${colors[(Math.random() * 4) | 0]};--r:${(Math.random() * 360) | 0}deg`;
      f.innerHTML = '<i></i><i></i><i></i><i></i><i></i><b></b>';
      fxl.appendChild(f); setTimeout(() => f.remove(), 2600);
    });
  }

  // --- finale: bông hoa của khách được ép vào sách ---
  EA.onRsvp(entry => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.nextElementSibling?.classList.contains('fin')) return;
        const name = entry?.name || c.guest;
        done.insertAdjacentHTML('afterend', `<div class="fin" role="status"><div class="fin-bk"><svg class="fin-fl" viewBox="0 0 100 100" aria-hidden="true">${bloom(50, 50, 38, { n: 8, c: '#e0546f', c2: '#b83a58', center: '#f6c64a' })}</svg><span class="fin-pg"></span></div><p>Bông hoa của ${e(name)} đã được ép vào cuốn sách của ${e(short('bride'))} và ${e(short('groom'))}.</p></div>`);
        const fin = f.parentElement.querySelector('.fin'); requestAnimationFrame(() => fin.classList.add('go'));
        if (!M.reduced) {
          const r = fin.getBoundingClientRect();
          for (let i = 0; i < 14; i++) {
            const b = document.createElement('span'); b.className = 'bloom';
            b.style.cssText = `left:${r.left + r.width / 2 + rnd(-120, 120)}px;top:${r.top + scrollY + rnd(-20, 60)}px;--c:${['#e3868f', '#f3b3ba', '#c9d8b6', '#f6dd98'][i % 4]};--r:${(Math.random() * 360) | 0}deg`;
            b.innerHTML = '<i></i><i></i><i></i><i></i><i></i><b></b>'; fxl.appendChild(b); setTimeout(() => b.remove(), 2600);
          }
        }
      });
    }, 30);
  });
});
