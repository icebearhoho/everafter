// Giữa 8 tỷ người: hàng nghìn chấm trôi nổi -> nhấn giữ, chúng gom thành quả địa cầu -> phóng đến nơi hai người gặp nhau.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => Math.round(n).toLocaleString('vi-VN');
const fmt1 = n => (Math.round(n * 10) / 10).toLocaleString('vi-VN');
const D2R = Math.PI / 180;
// Dân số thế giới theo năm hiện tại (8,0 tỷ năm 2022, +70 triệu mỗi năm), tự cập nhật hằng năm.
const WORLD = Math.round((8.0e9 + (new Date().getFullYear() - 2022) * 7.0e7) / 1e7) * 1e7;
const COA = '#ff5a4e', COB = '#2f6bff';
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
// Mặt nạ đất liền 180x90 (mỗi ô 2 độ), 1 bit/ô.
const MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf8Af/AAAAAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAADgAAAAAAAAAAAABf+f///4AA+AAAAAB8AAAAAAAAAABwAz4f///wAAYAAAEAAGAAAAAAAAAAAPi/wAf//wAAAAADAAf/4AHAAAAAAAH4n38AP//gAAAAAMBD///8DAAAADwACfw3/gP//gAAA4AMH///////gAAf////59jwH/+AAAP/gA//////////8P//////h+H/gAAAf/z///////////M///////n8D8A+AA+/f///////////AP/////4g4D4AAAH9/////////////Af/////gHgA4AAAP5///////////PwAHgP///gH0AAAAAH4/////////+CMAADAB///4H+AAAAGCx/////////8A8AAAAA////n/gAAAODj/////////wA4AAAAAf///v/wAAAbP///////////AwAAAAAP/////wAAAH////////////AAAAAAAH////8YAAAB///////////9AAAAAAAD////8EAAAB///////////9AAAAAAAD////+AAAAB//5fP//////4AAAAAAAD////gAAAAPxvwPP//////jAAAAAAAD////AAAAAfib//n/////+CAAAAAAAD///+AAAAAfADf/n////+MCAAAAAAAB///8AAAAAOeRP/3/////mOAAAAAAAA///8AAAAAH+AA///////E8AAAAAAAAf//wAAAAAP/gB///////hgAAAAAAAAP//gAAAAAf/7////////gAAAAAAAAAH/gwAAAAAf////f/////gAAAAAAAAAF+AQAAAAB///+/v/////AAAAAAAAAAC+AAAAAAD/////0X////AAAAAAAAAAAeAQAAAAD////f/D///8gAAAAAAAAAAfEEAAAAH////v/B/z/QAAAAAAAAAAAPMBgAAAD////v+A/B+gAAAAAAAAAAAD8AAAAAD////34AeB/AgAAAAAAAAAAAPAAAAAH////3wAcAfggAAAAAAAAAAADAAAAAD////+AAcAfgAAAAAAAAAAAABDwAAAD////9wAMATAYAAAAAAAAAAAA//AAAB/////gAOAQAIAAAAAAAAAAAAH/gAAA/////gACAIAIAAAAAAAAAAAAH/8AAAfH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAcOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAP//gAAAD//4AAAAMeggAAAAAAAAAAAP//8AAAB//wAAAAGdg+AAAAAAAAAAAf///AAAA//wAAAACAAPkAAAAAAAAAAP///gAAA//wAAAABwAHwAAAAAAAAAAP///AAAA//wAAAAAAIDYAAAAAAAAAAH///AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//xgAAAAAPxgAAAAAAAAAAA//+AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/wAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/4AAAAf/DAAAAAH//8AAAAAAAAAAAf/AAAAAf+CAAAAAH//8AAAAAAAAAAA//AAAAAf8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/4AAAAAAAAAAAAACAH4AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB/AAAAAAAAAAAAAAAAAAAGAAAAAAAAB+AAAAAAAAAAAAAAAAAQAMAAAAAAAAB8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
let _bits = null;
const isLand = (lat, lng) => {
  if (!_bits) { const s = atob(MASK); _bits = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) _bits[i] = s.charCodeAt(i); }
  const x = Math.min(179, Math.floor((lng + 180) / 2)), y = Math.min(89, Math.floor((90 - lat) / 2)), i = y * 180 + x;
  return (_bits[i >> 3] >> (7 - (i & 7))) & 1;
};
// Các điểm hình cầu (Fibonacci) chỉ giữ lại phần đất liền: [lat, lng] radian.
const landPoints = n => {
  const out = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const s = 1 - 2 * (i + .5) / n, lat = Math.asin(s) / D2R, lng = ((ga * i / D2R) % 360 + 360) % 360 - 180;
    if (isLand(lat, lng)) out.push([lat * D2R, lng * D2R]);
  }
  return out;
};
// Phép chiếu trực giao: trả [x, y, độ sâu z>0 là mặt trước]
const proj = (lat, lng, lam0, phi0) => {
  const dl = lng - lam0, cl = Math.cos(dl), cp = Math.cos(lat), sp = Math.sin(lat), c0 = Math.cos(phi0), s0 = Math.sin(phi0);
  return [cp * Math.sin(dl), c0 * sp - s0 * cp * cl, s0 * sp + c0 * cp * cl];
};
const vec = (lat, lng) => [Math.cos(lat) * Math.cos(lng), Math.cos(lat) * Math.sin(lng), Math.sin(lat)];
const toLL = v => [Math.asin(clamp(v[2], -1, 1)), Math.atan2(v[1], v[0])];
const slerp = (a, b, u) => {
  const d = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
  if (d < 1e-6) return a;
  const s = Math.sin(d), k1 = Math.sin((1 - u) * d) / s, k2 = Math.sin(u * d) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
};
const kmRad = (a, b) => {
  const h = Math.sin((b[0] - a[0]) / 2) ** 2 + Math.cos(a[0]) * Math.cos(b[0]) * Math.sin((b[1] - a[1]) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
// Điểm trên cung lớn từ A đến B tại u (0..1), nâng lên như đường bay.
const arcAt = (A, B, u, lam0, phi0) => {
  const ll = toLL(slerp(vec(A[0], A[1]), vec(B[0], B[1]), u)), p = proj(ll[0], ll[1], lam0, phi0), h = 1 + .16 * Math.sin(Math.PI * u);
  return { x: p[0] * h, y: p[1] * h, z: p[2], ll };
};
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// Bản đồ phố về đêm, vẽ một lần ra canvas ẩn; mỗi cặp đôi một thành phố khác nhau (hạt giống = toạ độ).
function cityMap(w, h, seed) {
  const cv = document.createElement('canvas'), dp = Math.min(1.5, devicePixelRatio || 1);
  cv.width = Math.round(w * dp); cv.height = Math.round(h * dp);
  const g = cv.getContext('2d'), R = mulberry(Math.floor(seed * 1000) % 2147483647 || 7);
  g.scale(dp, dp);
  const th = (R() - .5) * .8, cx = w / 2, cy = h / 2, diag = Math.hypot(w, h);
  const line = (x1, y1, x2, y2, wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  g.save(); g.translate(cx, cy); g.rotate(th);
  // sông
  g.strokeStyle = 'rgba(47,107,255,.16)'; g.lineWidth = 54; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-diag / 2, diag * .12); g.bezierCurveTo(-diag * .2, -diag * .06, diag * .1, diag * .22, diag / 2, diag * .05); g.stroke();
  g.strokeStyle = 'rgba(120,160,255,.22)'; g.lineWidth = 1.2; g.stroke();
  for (const [step, wd, al, glow] of [[34, .7, .16, 0], [136, 1.6, .38, 1]]) {
    for (let a = 0; a < 2; a++) {
      for (let k = -diag / 2; k < diag / 2; k += step) {
        let p = -diag / 2;
        while (p < diag / 2) {
          const len = 50 + R() * 190, on = R() < (step > 100 ? .92 : .8);
          if (on) {
            const x1 = a ? k : p, y1 = a ? p : k, x2 = a ? k : p + len, y2 = a ? p + len : k;
            if (glow) line(x1, y1, x2, y2, wd * 5, `rgba(255,190,140,${al * .12})`);
            line(x1, y1, x2, y2, wd, `rgba(${glow ? '255,214,170' : '140,165,225'},${al})`);
          }
          p += len;
        }
      }
    }
  }
  g.restore();
  g.strokeStyle = 'rgba(255,205,150,.3)'; g.lineWidth = 2;
  g.beginPath(); g.arc(cx, cy, Math.min(w, h) * .34, 0, 7); g.stroke();
  line(0, h * .08, cx, cy, 2.2, 'rgba(255,214,170,.36)'); line(w, h * .94, cx, cy, 2.2, 'rgba(255,214,170,.36)');
  for (let i = 0; i < 420; i++) {
    const x = R() * w, y = R() * h; g.fillStyle = `rgba(255,${200 + R() * 40 | 0},${150 + R() * 60 | 0},${.15 + R() * .4})`; g.fillRect(x, y, 1.6, 1.6);
  }
  return { cv, w, h };
}

let stopCover = () => {};

// Toạ độ gặp nhau + hai quê (nếu có) từ personality; thiếu thì dùng giá trị mặc định mà không khẳng định gì.
function geo(c) {
  const P = c.p, met = P.get('metPin'), hp = P.get('hometownPins', {});
  const okp = p => p && isFinite(p.lat) && isFinite(p.lng);
  const hasMet = okp(met), hasHome = okp(hp.bride) && okp(hp.groom);
  const M0 = hasMet ? [met.lat * D2R, met.lng * D2R] : [16 * D2R, 107.5 * D2R];
  const HA = hasHome ? [hp.bride.lat * D2R, hp.bride.lng * D2R] : [M0[0] + 1.1 * D2R, M0[1] - 1.3 * D2R];
  const HB = hasHome ? [hp.groom.lat * D2R, hp.groom.lng * D2R] : [M0[0] - .9 * D2R, M0[1] + 1.4 * D2R];
  const v = [vec(...HA), vec(...HB), vec(...M0)].reduce((s, a) => [s[0] + a[0], s[1] + a[1], s[2] + a[2]], [0, 0, 0]);
  const cen = Math.hypot(...v) > .2 ? toLL(v.map(x => x / Math.hypot(...v))) : M0;
  return { hasMet, hasHome, M0, HA, HB, cen, km: hasHome ? kmRad(HA, HB) : null,
    city: hasMet ? P.get('metCity', '') : '', place: hasMet ? P.get('metPlace', '') : '' };
}

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c, G = geo(c), days = c.p.daysTogether;
  const stops = []; let ended = false;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  el.classList.add('bl-cover');
  el.innerHTML = `
    <canvas class="bl-cv" aria-hidden="true"></canvas>
    <div class="bl-ui">
      <div class="bl-top">
        <p class="bl-to">Gửi ${e(c.guest)}</p>
        <p class="bl-count"><span class="num">${fmt(WORLD)}</span> người</p>
        <p class="bl-line">Giữa ngần ấy con người trên Trái Đất…</p>
      </div>
      <div class="bl-mid" aria-live="polite">
        <p class="bl-k">Nơi hai chấm gặp nhau</p>
        ${G.city ? `<p class="bl-city">${e(G.city)}</p>` : ''}
        ${G.place ? `<p class="bl-pl">${e(G.place)}</p>` : ''}
      </div>
      <p class="bl-dist" aria-hidden="true"></p>
      <div class="bl-bot">
        <p class="bl-found">…chỉ có hai người tìm thấy nhau</p>
        <p class="bl-names"><b class="a">${e(D.bride.name).replace(' ', '&nbsp;')}</b> <i>&amp;</i> <b class="b">${e(D.groom.name).replace(' ', '&nbsp;')}</b></p>
        <p class="bl-date">${c.d} · ${c.m} · ${c.y}</p>
        <p class="bl-hint">Nhấn giữ trên màn hình để gom cả thế giới về một điểm</p>
        <button class="open-btn" type="button">Tìm nhau</button>
      </div>
    </div>`;
  const $ = s => el.querySelector(s), cv = $('canvas'), g = cv.getContext('2d'), numEl = $('.num'), distEl = $('.bl-dist');
  const dpr = Math.min(2, devicePixelRatio || 1) * (M.tier === 'low' ? .8 : 1);
  let W = 0, H = 0, dots = [], land = [], map = null, stars = [];
  const S = { g: 0, gT: 0, z: 0, tr: 0, dark: 0, mt: 0, fl: 0 };
  const ca = { x: 0, y: 0 }, cb = { x: 0, y: 0 };
  let running = false, begun = false, arrived = false, sparks = [], ring0 = 0, tilt = { x: 0, y: 0 };

  const build = () => {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const nFib = Math.round(clamp(M.scale(9500) * Math.min(1, W * H / 700000), M.tier === 'low' ? 2200 : 3400, 9500));
    land = landPoints(nFib);
    const total = Math.round(Math.max(land.length * 1.35, M.scale(2600) * Math.min(1, W * H / 520000)));
    dots = Array.from({ length: total }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H, x0: 0, y0: 0, vx: rnd(-.14, .14), vy: rnd(-.14, .14), r: rnd(.8, 2),
      ti: i < land.length ? i : -1, st: Math.random(), sw: rnd(-.3, .3), a0: rnd(.35, .7), dp: rnd(.2, 1)
    }));
    stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(.4, 1.3), p: rnd(0, 6.28) }));
    map = cityMap(Math.round(W * 1.5), Math.round(H * 1.25), G.hasMet ? G.M0[0] + G.M0[1] : 3.3);
    ca.x = W * .2; ca.y = H * .44; cb.x = W * .8; cb.y = H * .56;
  };
  build();
  const onResize = () => { if (!running) build(); };
  addEventListener('resize', onResize); stops.push(() => removeEventListener('resize', onResize));
  if (M.tier !== 'low') stops.push(M.tilt(p => { tilt = p; }));

  const glow = (x, y, r, col, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 4);
    gr.addColorStop(0, col); gr.addColorStop(.25, col.replace(/[\d.]+\)$/, '.35)')); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, 7); g.fill(); g.globalAlpha = 1;
  };
  const dot = (x, y, r, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1; };

  const frame = (t, dt) => {
    if (ended) return;
    if (!running) S.g += (S.gT - S.g) * (1 - Math.exp(-dt / 90)); else S.g = S.gT;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dk = S.dark, eg = ease(clamp(S.g)), ez = ease(clamp(S.z));
    g.fillStyle = `rgb(${lerp(247, 9, dk) | 0},${lerp(247, 12, dk) | 0},${lerp(244, 22, dk) | 0})`; g.fillRect(0, 0, W, H);
    const R0 = Math.min(W * .36, H * .24), R = R0 * Math.exp(Math.log(46) * ez), cx = W / 2, cy = lerp(H * .47, H * .5, ez);
    const lam0 = lerp(G.cen[1] - (1 - eg) * 2.4, G.M0[1], ez), phi0 = lerp(G.cen[0] * .8 + .12, G.M0[0], ez);
    const sk = dk * (1 - clamp(ez * 2)); // sao
    if (sk > .02) for (const s of stars) dot(s.x * W, s.y * H, s.r, '#cfd8ff', sk * (.4 + .4 * Math.sin(t * .002 + s.p)));
    // khối cầu và quầng khí quyển
    const gl = eg * (1 - clamp((ez - .3) / .4));
    if (gl > .02) {
      const gr = g.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R);
      gr.addColorStop(0, `rgba(48,70,140,${.5 * dk * gl})`); gr.addColorStop(1, `rgba(12,18,44,${.7 * dk * gl})`);
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      g.strokeStyle = `rgba(140,172,255,${.4 * dk * gl})`; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    }
    // vòng gợi ý trước khi giữ
    if (!running && S.g < .6) {
      g.strokeStyle = `rgba(20,22,26,${.22 * (1 - S.g * 1.6)})`; g.setLineDash([3, 7]); g.lineDashOffset = -t * .01;
      g.beginPath(); g.arc(cx, cy, R0 * (1 - S.g * .1), 0, 7); g.stroke(); g.setLineDash([]);
    }
    // đám đông
    const gv = lerp(120, 205, dk), col = `rgb(${gv | 0},${(gv + 6) | 0},${(gv + 18) | 0})`;
    g.fillStyle = col;
    const fade = 1 - clamp((ez - .35) / .5), big = 1 + 1.4 * ez;
    for (const d of dots) {
      if (S.g < .995) { d.x = (d.x + d.vx * dt * .06 + W) % W; d.y = (d.y + d.vy * dt * .06 + H) % H; }
      let x = d.x + tilt.x * 8 * d.dp * (1 - eg), y = d.y + tilt.y * 8 * d.dp * (1 - eg), a = d.a0, r = d.r;
      if (eg > 0) {
        if (d.ti >= 0) {
          const gi = clamp(eg * 1.4 - d.st * .4), e2 = ease(gi), p = land[d.ti], q = proj(p[0], p[1], lam0, phi0);
          const tx = cx + q[0] * R, ty = cy - q[1] * R, dx = tx - x, dy = ty - y, k = Math.sin(Math.PI * e2) * d.sw;
          x += dx * e2 - dy * k; y += dy * e2 + dx * k;
          const front = q[2] > 0 ? .35 + .65 * q[2] : 0;
          a = lerp(a, front * .95, e2) * fade; r = lerp(r, 1.5 * big, e2);
          if (r > 3.4) r = 3.4;
        } else a *= 1 - clamp(eg * 2.2);
      }
      if (a < .02) continue;
      g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    // bản đồ phố
    const ca2 = clamp((ez - .5) / .4);
    if (ca2 > 0) {
      const sc = lerp(.55, 1, ease(ca2));
      g.save(); g.globalAlpha = ca2; g.translate(cx, cy); g.scale(sc, sc); g.drawImage(map.cv, -map.w / 2, -map.h / 2, map.w, map.h); g.restore();
      const vg = g.createRadialGradient(cx, cy, Math.min(W, H) * .2, cx, cy, Math.max(W, H) * .62);
      vg.addColorStop(0, 'rgba(9,12,22,0)'); vg.addColorStop(1, `rgba(9,12,22,${.95 * ca2})`);
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
      glow(cx, cy, 30, 'rgba(255,214,170,.5)', .5 * ca2);
      if (!arrived && ca2 > .6) { arrived = true; el.classList.add('arrived'); }
    }
    // hai chấm màu: chạy trên cung lớn từ hai quê về nơi gặp nhau
    const u = ease(clamp(S.tr));
    const heads = [[G.HA, COA, ca], [G.HB, COB, cb]].map(([H0, colr, idle]) => {
      let x, y, vis = 1;
      if (S.g < .999 && !S.tr) {
        const gi = clamp(eg * 1.4 - .1), e2 = ease(gi), q = proj(H0[0], H0[1], lam0, phi0);
        const tx = cx + q[0] * R, ty = cy - q[1] * R;
        x = lerp(idle.x, tx, e2); y = lerp(idle.y, ty, e2); vis = lerp(1, q[2] > 0 ? 1 : 0, e2);
      } else {
        const p = arcAt(H0, G.M0, u, lam0, phi0);
        x = cx + p.x * R; y = cy - p.y * R; vis = p.z > -.05 ? 1 : 0;
        if (S.tr > 0) { // vệt đường bay
          g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = colr; g.lineWidth = 1.6; g.globalAlpha = .75 * (1 - ez * .3);
          g.beginPath(); const n = 40;
          for (let i = 0; i <= n; i++) { const q = arcAt(H0, G.M0, u * i / n, lam0, phi0); const px = cx + q.x * R, py = cy - q.y * R; i ? g.lineTo(px, py) : g.moveTo(px, py); }
          g.stroke(); g.restore();
        }
      }
      if (!running && !S.g) { const pul = 1 + .35 * Math.sin(t * .004 + (colr === COA ? 0 : 2)); glow(x, y, 7 * pul, colr === COA ? 'rgba(255,90,78,.5)' : 'rgba(47,107,255,.5)', .5); }
      return { x, y, vis, colr, ll: S.tr ? arcAt(H0, G.M0, u, lam0, phi0).ll : null };
    });
    const mt = ease(clamp(S.mt));
    for (const h of heads) {
      if (h.vis < .02) continue;
      let { x, y } = h; const sep = 8 * (1 - mt);
      if (mt > 0) { x = cx + (h.colr === COA ? -1 : 1) * sep; y = cy; }
      g.save(); g.globalCompositeOperation = dk > .5 ? 'lighter' : 'source-over';
      glow(x, y, 6 + mt * 4, h.colr === COA ? 'rgba(255,90,78,.6)' : 'rgba(47,107,255,.6)', .85);
      dot(x, y, 5 + mt * 3.5, h.colr, 1); g.restore();
    }
    // khoảng cách còn lại giữa hai chấm / ngày bên nhau
    if (heads[0].ll && S.tr && !S.mt) {
      if (G.km) distEl.innerHTML = `Cách nhau <b>${fmt(kmRad(heads[0].ll, heads[1].ll))}</b> km`;
      el.classList.toggle('has-dist', !!G.km);
    }
    // sóng và tia lửa khi gặp nhau
    if (S.mt > 0) {
      const rt = clamp((performance.now() - ring0) / 1300);
      for (let i = 0; i < 3; i++) {
        const k = clamp(rt * 1.2 - i * .18); if (k <= 0) continue;
        g.strokeStyle = [COA, COB, '#ffffff'][i]; g.globalAlpha = (1 - k) * .8; g.lineWidth = 2;
        g.beginPath(); g.arc(cx, cy, 10 + ease(k) * Math.min(W, H) * .42, 0, 7); g.stroke();
      }
      g.globalAlpha = 1;
      g.save(); g.globalCompositeOperation = 'lighter';
      for (const s of sparks) {
        s.x += s.vx * dt * .06; s.y += s.vy * dt * .06; s.vx *= .985; s.vy *= .985; s.l -= dt;
        if (s.l > 0) dot(s.x, s.y, s.r, s.c, clamp(s.l / 900));
      }
      g.restore();
    }
    if (S.fl > 0) { g.fillStyle = `rgba(247,247,244,${S.fl})`; g.fillRect(0, 0, W, H); }
    // bộ đếm nhân loại
    if (!running || S.g < 1) numEl.textContent = S.g <= 0 ? fmt(WORLD) : fmt(Math.max(2, WORLD * Math.pow(1 - S.g, 6)));
  };
  const stopLoop = M.loop(frame, { el: cv });
  stops.push(stopLoop);
  if (M.reduced) frame(0, 16);

  // ---- cử chỉ: nhấn giữ để gom, đủ lâu thì tự chạy tiếp ----
  const begin = () => { if (begun) return; begun = true; EA.music(); M.requestTilt(); };
  let tickK = 0;
  M.hold(cv, 1300, {
    onProgress: p => {
      if (running) return;
      S.gT = p; if (p > 0) begin();
      const k = Math.floor(p * 4); if (k !== tickK) { tickK = k; if (k > 0) { M.haptic('tap'); M.tone('click'); } }
    },
    onDone: () => run()
  });
  const btn = $('.open-btn');
  btn.addEventListener('click', () => { begin(); run(); });

  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function run() {
    if (running || ended) return;
    running = true; begin();
    el.classList.add('running');
    if (M.reduced) { setTimeout(open, 600); return; }
    M.tone('whoosh'); M.haptic('tap');
    if (S.gT < 1) await M.tween(S.gT, 1, 300 + (1 - S.gT) * 1000, 'inOut', v => { S.gT = v; });
    if (ended) return;
    el.classList.add('night'); M.tone('thud'); M.haptic('thud');
    M.tween(0, 1, 800, 'out', v => { S.dark = v; });
    const zp = M.tween(0, 1, 2100, 'inOut', v => { S.z = v; });
    await wait(250);
    const tp = M.tween(0, 1, 1900, 'inOut', v => { S.tr = v; });
    await Promise.all([zp, tp]);
    if (ended) return;
    // gặp nhau
    S.mt = .001; ring0 = performance.now();
    for (let i = 0; i < Math.round(M.scale(46)); i++) {
      const a = Math.random() * 6.283, sp = rnd(.6, 3.4);
      sparks.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(.8, 2.2), l: rnd(500, 1100), c: ['#ff8a80', '#8fb0ff', '#ffffff'][i % 3] });
    }
    M.tone('chime'); M.haptic('success');
    el.classList.add('met');
    M.tween(0, 1, 700, 'out', v => { S.mt = v; });
    if (days != null) M.tween(0, days, 1400, 'out', v => { distEl.innerHTML = `<b>${fmt(v)}</b> ngày bên nhau`; });
    else distEl.innerHTML = '<b>Hai chấm</b> đã tìm thấy nhau';
    el.classList.add('has-dist');
    await wait(1700);
    if (ended) return;
    await M.tween(0, 1, 380, 'out', v => { S.fl = v; });
    open();
    setTimeout(stopCover, 1200);
  }
});

EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c;
  return `<div class="wrap">
  <div class="bl-hero">
    <div class="stat">
      <p class="label">Xác suất hai người gặp nhau</p>
      <p class="odds" tabindex="0"><span>1</span><small>/ ${fmt(WORLD)}</small></p>
      <h1 class="bl-hn"><span class="a">${e(cp.brideName).replace(' ', '&nbsp;')}</span> <span class="plus">+</span> <span class="b">${e(cp.groomName).replace(' ', '&nbsp;')}</span> <span class="eq">= 1</span></h1>
      <p class="headline">${c.t(cp.headline)}</p>
      <p class="hero-date">${c.dateText} · ${e(cp.city)}</p>
      ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    </div>
    <figure class="bl-photo"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" fetchpriority="high"><figcaption>n = 2</figcaption></figure>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Dữ liệu', 'Hành trình, theo từng điểm dữ liệu')}
  <ol class="datapoints">
    ${(mod.content.chapters || []).map((ch, i, all) => `
      <li style="--p:${Math.round((i + 1) / all.length * 100)}%">
        <p class="dp-id">#${String(i + 1).padStart(2, '0')} · ${e(ch.date)}</p>
        <div class="bar" aria-hidden="true"><span></span></div>
        <h3>${e(ch.title)}</h3>
        <p>${e(ch.text)}</p>
      </li>`).join('')}
  </ol>
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Điểm hẹn', 'Hai toạ độ, một ngày')}
  <div class="coords">
    ${D.events.map((ev, i) => `
      <article class="coord">
        <p class="dp-id">Điểm hẹn ${String(i + 1).padStart(2, '0')}</p>
        <p class="c-time">${e(ev.time)}</p>
        <h3>${e(ev.title)}</h3>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('gallery', ({ data: D, ui }) => `<div class="wrap">
  ${ui.head('Bộ dữ liệu', 'Khoảnh khắc được ghi lại')}
  <div class="bl-grid">${D.photos.map((p, i) => ui.photo(p, i, `<span class="img-id" aria-hidden="true">IMG_${String(i + 1).padStart(3, '0')}</span>`)).join('')}</div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('RSVP', 'Trở thành một trong những người có mặt')}
  <div class="bl-rsvp"><p class="plus-one">+1</p>${ui.rsvpForm()}</div>
  <div class="bl-guests" aria-live="polite"></div>
</div>`);

const dmy = s => { const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} tháng ${+m[2]} năm ${m[1]}` : ''; };
const ym = s => { const m = String(s).match(/^(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : ''; };
const NS = 'http://www.w3.org/2000/svg';

EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, G = geo(c);
  const reduced = M.reduced;

  // ---- lưới chấm ở hero: né ngón tay, hai chấm màu quay quanh nhau, nghiêng máy thì xê dịch ----
  const hero = main.querySelector('.m-hero');
  if (hero && !reduced) {
    const cv = document.createElement('canvas'); cv.className = 'field'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
    const g = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    let W, H, dots = [], px = -999, py = -999, tl = { x: 0, y: 0 };
    const init = () => {
      W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = W < 500 || M.tier === 'low' ? 26 : 18; dots = [];
      for (let x = 10; x < W; x += step) for (let y = 10; y < H; y += step) dots.push({ hx: x, hy: y, x, y, k: Math.random() });
    };
    init(); new ResizeObserver(init).observe(hero);
    hero.addEventListener('pointermove', ev => { const r = hero.getBoundingClientRect(); px = ev.clientX - r.left; py = ev.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { px = py = -999; });
    if (M.tier !== 'low') M.tilt(p => { tl = p; });
    M.loop((t) => {
      g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(138,143,156,.5)';
      for (const d of dots) {
        const dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy), push = dist < 90 ? (90 - dist) / 90 * 26 : 0;
        const tx = d.hx + (dist ? dx / dist : 0) * push + tl.x * 6 * d.k + Math.sin(t * .0006 + d.hy) * 1.2, ty = d.hy + (dist ? dy / dist : 0) * push + tl.y * 6 * d.k;
        d.x += (tx - d.x) * .18; d.y += (ty - d.y) * .18;
        g.fillRect(d.x - 1, d.y - 1, 2, 2);
      }
      const cx = W * .5, cy = Math.min(H * .16, 110), a = t / 900;
      [[COA, 0], [COB, Math.PI]].forEach(([col, o]) => {
        g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 14;
        g.beginPath(); g.arc(cx + Math.cos(a + o) * 22, cy + Math.sin(a + o) * 10, 5, 0, 7); g.fill(); g.shadowBlur = 0;
      });
    }, { el: hero });
  }

  // ---- easter egg: chạm ba lần vào "1" ----
  const odds = main.querySelector('.odds');
  if (odds) {
    let n = 0, last = 0, chip = null;
    const hit = () => {
      const now = Date.now(); n = now - last < 1800 ? n + 1 : 1; last = now; M.tone('pop'); M.haptic('tap');
      if (n < 3) return; n = 0;
      const md = P.get('metDate'), txt = md ? `${dmy(md)}: ngày hai chấm gặp nhau` : 'Chấm số 1 và chấm số 2 đã gặp nhau';
      chip?.remove(); chip = document.createElement('p'); chip.className = 'bl-chip'; chip.setAttribute('role', 'status'); chip.textContent = txt;
      odds.insertAdjacentElement('afterend', chip); M.tone('chime'); M.haptic('success');
      setTimeout(() => chip?.remove(), 4200);
    };
    odds.addEventListener('click', hit);
    odds.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hit(); } });
  }

  // ---- add-on: thẻ xác suất ----
  const cards = [];
  const n = P.daysTogether;
  if (n != null && P.has('metDate')) cards.push({ k: 'Bên nhau', v: n, u: 'ngày', t: `khoảng ${fmt(n * 24)} giờ. Mỗi ngày là một lần chọn lại nhau.` });
  const hs = P.get('hometowns', {});
  if (G.km && hs.bride && hs.groom) cards.push({ k: 'Hai quê', v: Math.round(G.km / 10) * 10, u: 'km', t: `giữa ${e(hs.bride)} và ${e(hs.groom)}, vậy mà hai chấm vẫn chạm nhau.` });
  const places = (P.get('places', []) || []).filter(p => isFinite(p.lat) && isFinite(p.lng));
  if (places.length > 1) {
    let tot = 0; for (let i = 1; i < places.length; i++) tot += kmRad([places[i - 1].lat * D2R, places[i - 1].lng * D2R], [places[i].lat * D2R, places[i].lng * D2R]);
    cards.push({ k: 'Đã đi cùng nhau', v: Math.round(tot / 10) * 10, u: 'km', t: `qua ${places.length} điểm đến trên bản đồ của hai người.` });
  }
  if (P.has('song.title')) cards.push({ k: 'Bài hát chung', s: e(P.get('song.title')), t: `${e(P.get('song.artist', ''))}${P.has('song.lyric') ? ` · “${e(P.get('song.lyric'))}”` : ''}` });
  if (P.has('pet.name')) cards.push({ k: 'Chấm thứ ba', s: e(P.get('pet.name')), t: `${e(P.get('pet.kind', 'thành viên nhỏ'))} của cả hai, đã giữ sẵn một chỗ trong ảnh cưới.` });
  if (P.has('insideJoke')) cards.push({ k: 'Chuyện riêng', s: 'Chỉ hai chấm hiểu', t: e(P.get('insideJoke')), wide: 1 });
  const adds = [];
  if (cards.length) adds.push(['odds-add', 'hero', `<div class="wrap">
    <header class="head"><p class="eyebrow">Xác suất</p><h2 class="title">Những con số rất ngẫu nhiên</h2></header>
    <div class="pb">${cards.slice(0, 5).map(x => `<article class="pc${x.wide ? ' wide' : ''}"><p class="label">${x.k}</p>${x.v != null ? `<p class="pv"><b class="num" data-n="${x.v}">${fmt(x.v)}</b><small>${x.u}</small></p>` : `<p class="ps">${x.s}</p>`}<p class="pt">${x.t}</p></article>`).join('')}</div>
  </div>`]);

  // ---- add-on: nơi hai chấm gặp nhau (quả địa cầu thu nhỏ) ----
  if (G.hasMet) {
    const place = G.place, city = G.city, md = P.get('metDate');
    adds.push(['meetmap', 'story', `<div class="wrap">
      <header class="head"><p class="eyebrow">Toạ độ</p><h2 class="title">Nơi hai chấm gặp nhau</h2></header>
      <div class="mm"><canvas class="mm-cv" aria-hidden="true"></canvas>
        <div class="mm-t">
          ${city ? `<p class="mm-c">${e(city)}</p>` : ''}${place ? `<p class="mm-p">${e(place)}</p>` : ''}
          <p class="mm-xy">${fmt1(P.get('metPin.lat'))}° B, ${fmt1(P.get('metPin.lng'))}° Đ</p>
          ${md ? `<p class="mm-d">${dmy(md)}</p>` : ''}
          ${G.km ? `<p class="mm-km">Từ ${fmt(G.km)} km xuống còn 0 km.</p>` : ''}
        </div></div>
    </div>`]);
  }
  // ---- add-on: các điểm đến ----
  if (places.length > 1) {
    const la = places.map(p => p.lat), lo = places.map(p => p.lng);
    const minA = Math.min(...la), maxA = Math.max(...la), minO = Math.min(...lo), maxO = Math.max(...lo), cl = Math.cos((minA + maxA) / 2 * D2R);
    const dx = Math.max((maxO - minO) * cl, .05), dy = Math.max(maxA - minA, .05), k = Math.min(300 / dx, 180 / dy), ox = 200 - dx * k / 2, oy = 140 - dy * k / 2;
    const pts = places.map(p => [ox + (p.lng - minO) * cl * k, oy + (maxA - p.lat) * k]);
    const path = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
    adds.push(['journey', 'story', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hành trình</p><h2 class="title">Mỗi nơi đi qua là một toạ độ</h2></header>
      <svg class="jy" viewBox="0 0 400 280" role="img" aria-label="${places.map(p => e(p.name)).join(', ')}">
        <path class="jp" d="${path}" pathLength="1" fill="none"/>
        ${pts.map((q, i) => `<g class="jd" style="--i:${i}"><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="5" fill="${i % 2 ? COB : COA}"/><circle class="rp" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="5" fill="none" stroke="${i % 2 ? COB : COA}"/></g>`).join('')}
      </svg>
      <ol class="jl">${places.map((p, i) => `<li style="--i:${i}"><span class="dp-id">${ym(p.date) || '#' + (i + 1)}</span><b>${e(p.name)}</b></li>`).join('')}</ol>
    </div>`]);
  }
  const anchors = { hero: main.querySelector('#hero'), story: main.querySelector('#story') || main.querySelector('#families') || main.querySelector('#hero') };
  const last = {};
  adds.forEach(([id, at, html]) => {
    const s = document.createElement('section'); s.id = id; s.className = `sec m-${id} bl-add`; s.innerHTML = html;
    const ref = last[at] || anchors[at]; if (ref) ref.insertAdjacentElement('afterend', s); else main.appendChild(s);
    last[at] = s;
  });
  main.querySelectorAll('.pc .num').forEach(x => {
    if (!reduced) x.textContent = '0';
    M.inView(x, () => M.tween(0, +x.dataset.n, 1800, 'out', v => { x.textContent = fmt(v); }).then(() => { x.textContent = fmt(+x.dataset.n); }), { threshold: .5 });
  });
  main.querySelectorAll('.jy, .jl').forEach(x => M.inView(x, () => x.classList.add('on'), { threshold: .35 }));

  // quả địa cầu thu nhỏ
  const mm = main.querySelector('.mm-cv');
  if (mm) {
    const g = mm.getContext('2d'), pts = landPoints(M.tier === 'low' ? 1800 : 3200), dpr = Math.min(2, devicePixelRatio || 1);
    let W, H;
    const size = () => { W = mm.clientWidth; H = mm.clientHeight; mm.width = W * dpr; mm.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const draw = t => {
      const R = Math.min(W, H) * .42, cx = W / 2, cy = H / 2, lam = G.M0[1] + (reduced ? 0 : Math.sin(t * .0004) * .35) - .1, phi = G.M0[0] * .8;
      g.clearRect(0, 0, W, H);
      const gr = g.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R);
      gr.addColorStop(0, '#2c3d78'); gr.addColorStop(1, '#0b1226'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
      g.fillStyle = '#cfdcff';
      for (const p of pts) { const q = proj(p[0], p[1], lam, phi); if (q[2] <= 0) continue; g.globalAlpha = .25 + .7 * q[2]; g.fillRect(cx + q[0] * R - .8, cy - q[1] * R - .8, 1.6, 1.6); }
      g.globalAlpha = 1;
      for (const [H0, col] of [[G.HA, COA], [G.HB, COB]]) {
        if (!G.hasHome) break;
        g.strokeStyle = col; g.lineWidth = 1.4; g.globalAlpha = .85; g.beginPath();
        for (let i = 0; i <= 36; i++) { const q = arcAt(H0, G.M0, i / 36, lam, phi), x = cx + q.x * R, y = cy - q.y * R; i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke(); g.globalAlpha = 1;
        const q = proj(H0[0], H0[1], lam, phi); if (q[2] > 0) { g.fillStyle = col; g.beginPath(); g.arc(cx + q[0] * R, cy - q[1] * R, 3.5, 0, 7); g.fill(); }
      }
      const q = proj(G.M0[0], G.M0[1], lam, phi);
      if (q[2] > 0) {
        const x = cx + q[0] * R, y = cy - q[1] * R, k = (t % 1800) / 1800;
        g.strokeStyle = '#fff'; g.globalAlpha = 1 - k; g.beginPath(); g.arc(x, y, 4 + k * 22, 0, 7); g.stroke(); g.globalAlpha = 1;
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
      }
    };
    if (reduced) draw(0); else M.loop(draw, { el: mm });
  }

  // ---- add-on + finale: mỗi RSVP thêm một chấm ----
  const gw = main.querySelector('.bl-guests');
  if (gw) {
    const render = async (fresh) => {
      const list = (await EA.shared.list('guestdot')).slice(-40);
      const N = list.length, rings = Math.max(1, Math.ceil(N / 14));
      let dotsSvg = '';
      list.forEach((x, i) => {
        const ring = i % rings, per = Math.ceil(N / rings), idx = Math.floor(i / rings), r = 62 + ring * 28 + (idx % 2) * 6;
        const a = idx / per * 6.2832 + ring * .7, px = 200 + Math.cos(a) * r * 1.4, py = 130 + Math.sin(a) * r * .95;
        const isNew = fresh && i === N - 1;
        dotsSvg += `<g class="gd${isNew ? ' new' : ''}"><line x1="200" y1="130" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${3 + Math.min(3, x.plus || 0)}"><title>${e(x.name || 'Khách')}</title></circle></g>`;
      });
      if (!N) for (let i = 0; i < 9; i++) { const a = i / 9 * 6.2832; dotsSvg += `<circle class="ghost" cx="${(200 + Math.cos(a) * 92).toFixed(1)}" cy="${(130 + Math.sin(a) * 66).toFixed(1)}" r="3.5"/>`; }
      gw.innerHTML = `<p class="label">Những chấm sáng đã có mặt</p>
        <svg viewBox="0 0 400 260" role="img" aria-label="${N} khách đã xác nhận, mỗi người là một chấm nối về cô dâu chú rể">
          ${dotsSvg}<circle cx="190" cy="130" r="9" fill="${COA}" style="mix-blend-mode:multiply"/><circle cx="210" cy="130" r="9" fill="${COB}" style="mix-blend-mode:multiply"/></svg>
        <p class="gl-n">${N ? `${fmt(N)} chấm đã sáng lên.` : 'Chấm của bạn sẽ sáng lên ở đây.'}</p>`;
    };
    render(false);
    EA.onRsvp(async entry => {
      M.tone('chime'); M.haptic('success');
      if (entry.attending) await EA.shared.add('guestdot', { name: entry.name, plus: entry.plus || 0 });
      await render(true);
      setTimeout(() => gw.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }), 200);
    });
  }
});
