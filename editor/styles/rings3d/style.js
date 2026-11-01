// Nhẫn Cưới Không Gian 3D: hai chiếc nhẫn vàng và vàng hồng được vẽ bằng canvas 2D (không thư viện ngoài).
// Cover: kéo ngang để xoay, hai nhẫn bay vào nhau và khóa lại, lời khắc bên trong hiện lên, máy quay xuyên qua nhẫn.
// Hero: cầm nhẫn xoay bằng ngón tay để đọc lời khắc. Máy yếu / giảm chuyển động: khung tĩnh + nút đổi góc nhìn.
const MO = () => window.EAMotion || (window.EA && window.EA.motion);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const rnd = (a, b) => a + Math.random() * (b - a);
const sgn = x => (x < 0 ? -1 : 1);
const GOLD = [[0, 24, 15, 8], [.22, 88, 60, 24], [.48, 186, 140, 64], [.74, 232, 199, 124], [1, 255, 243, 205]];
const ROSE = [[0, 30, 17, 15], [.22, 94, 54, 42], [.48, 184, 124, 100], [.74, 234, 182, 156], [1, 255, 240, 230]];
const lut = stops => Array.from({ length: 256 }, (_, i) => {
  const t = i / 255; let k = 0;
  while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
  const a = stops[k], b = stops[k + 1], f = clamp((t - a[0]) / (b[0] - a[0]));
  return `rgb(${Math.round(lerp(a[1], b[1], f))},${Math.round(lerp(a[2], b[2], f))},${Math.round(lerp(a[3], b[3], f))})`;
});
const LUTS = [lut(GOLD), lut(ROSE)];

// ---- hình học: chiếc nhẫn là một siêu elip quét quanh trục (dải phẳng, mép bo) ----
const RING = { R: 1, T: .075, W: .17, N: 4 };
const bakeCache = {};
function bake(U, V) {
  const key = U + 'x' + V;
  if (bakeCache[key]) return bakeCache[key];
  const { R, T, W, N } = RING, nq = U * V;
  const prof = v => {
    const c = Math.cos(v), s = Math.sin(v);
    const a = T * sgn(c) * Math.abs(c) ** (2 / N), b = W * sgn(s) * Math.abs(s) ** (2 / N);
    const na = sgn(a) * Math.abs(a / T) ** (N - 1) / T, nb = sgn(b) * Math.abs(b / W) ** (N - 1) / W, l = Math.hypot(na, nb) || 1;
    return [a, b, na / l, nb / l];
  };
  const vp = new Float32Array(nq * 3), qp = new Float32Array(nq * 3), qn = new Float32Array(nq * 3);
  for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
    const k = (i * V + j) * 3, u = i / U * TAU, v = j / V * TAU;
    const [a, b] = prof(v);
    vp[k] = (R + a) * Math.cos(u); vp[k + 1] = (R + a) * Math.sin(u); vp[k + 2] = b;
    const uc = (i + .5) / U * TAU, vc = (j + .5) / V * TAU, [a2, b2, na, nb] = prof(vc);
    qp[k] = (R + a2) * Math.cos(uc); qp[k + 1] = (R + a2) * Math.sin(uc); qp[k + 2] = b2;
    qn[k] = na * Math.cos(uc); qn[k + 1] = na * Math.sin(uc); qn[k + 2] = nb;
  }
  return (bakeCache[key] = { U, V, vp, qp, qn });
}

const rotM = (rx, ry, rz) => {            // p -> Rz Ry Rx p
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  return [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx, sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx, -sy, cy * sx, cy * cx];
};
const mul = (a, b) => [0, 1, 2].flatMap(r => [0, 1, 2].map(c => a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]));

const QUAL = { high: [200, 26], mid: [132, 16], low: [96, 12] };
// tư thế "đọc lời khắc": nhẫn 1 mặt chính diện (nhìn xuyên lòng nhẫn lên thành trên), nhẫn 2 xoay ra trước
const POSES = { idle: { spin: .6, tilt: .3 }, read1: { spin: 0, tilt: -1.02 }, read2: { spin: 0, tilt: -1.02 - Math.PI / 2 }, side: { spin: -.9, tilt: .18 } };

// Dựng cảnh nhẫn trên một canvas. opt: { tier, texts:[a,b], inset (px chừa cho chữ), cyFrac }
function makeRings(canvas, opt = {}) {
  const M = MO(), g = canvas.getContext('2d');
  const tier = opt.tier || M.tier, still = !!opt.still;
  const [U, V] = QUAL[tier] || QUAL.mid, B = bake(U, V), nq = U * V;
  const S = { mix: opt.linked ? 1 : 0, enter: opt.enter ?? 1, spin: POSES.idle.spin, tilt: POSES.idle.tilt, fly: 0, flash: 0, shock: 0, engrave: opt.engrave ?? 1, light: 0, vs: 0, vt: 0, auto: !still, zoom: 1, shake: 0, free: 0, reading: 0, tx: 0, ty: 0 };
  const sparks = [];
  let W = 0, H = 0, dpr = 1, alive = true, stopLoop = null, dirty = true;
  const verts = [new Float32Array(nq * 2), new Float32Array(nq * 2)];
  const cache = { p: [new Float32Array(nq * 3), new Float32Array(nq * 3)], n: [new Float32Array(nq * 3), new Float32Array(nq * 3)] };
  const keys = new Float32Array(nq * 2 + 128), order = [];
  const texts = opt.texts || ['', ''];
  const FONT = 'italic 500 100px "Cormorant Garamond", Georgia, serif';
  let glyphs = null;
  const buildGlyphs = () => {
    g.save(); g.font = FONT;
    glyphs = texts.map((t, ki) => {
      const chars = Array.from(String(t || '').normalize('NFC')), items = chars.map(ch => ({ ch, w: g.measureText(ch).width / 100 }));
      const sp = .06, tot = items.reduce((s, x) => s + x.w + sp, -sp), rad = RING.R - RING.T;
      const gh = Math.min(.32, 3 * rad / Math.max(.01, tot));
      let cum = 0; const span = tot * gh / rad;
      items.forEach(x => { x.u = Math.PI / 2 + (ki ? -.28 : .5) + span / 2 - (cum + x.w / 2) * gh / rad; cum += x.w + sp; });
      return { items, gh, rad };
    });
    g.restore(); dirty = true;
  };
  const ready = () => { try { return document.fonts.load('italic 500 100px "Cormorant Garamond"').then(buildGlyphs, buildGlyphs); } catch { buildGlyphs(); } };
  ready();

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(tier === 'low' ? 1 : 2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    W = w; H = h; dirty = true;
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null; ro && ro.observe(canvas);
  resize();

  const D0 = 8;
  const pair = () => {   // vị trí / góc xoay của hai nhẫn theo mix (0: tách rời, 1: lồng vào nhau)
    const tall = W / H < .85, m = S.mix, e = m * m * (3 - 2 * m);
    const A0 = tall ? [-.5, .95, .3] : [-1.75, .38, .4], B0 = tall ? [.5, -.95, -.2] : [1.75, -.3, -.2];
    const A1 = [-.56, 0, 0], B1 = [.56, 0, 0];
    const rA = [lerp(.5, 0, e), lerp(.7, 0, e), lerp(.2, 0, e)], rB = [lerp(1.2, Math.PI / 2, e), lerp(-.6, 0, e), lerp(-.3, 0, e)];
    const lift = Math.sin(m * Math.PI) * .25;
    return [{ p: A0.map((v, i) => lerp(v, A1[i], e)).map((v, i) => (i === 2 ? v + lift : v)), r: rA }, { p: B0.map((v, i) => lerp(v, B1[i], e)).map((v, i) => (i === 2 ? v - lift : v)), r: rB }];
  };

  function render(now) {
    if (!W || !H) return;
    const time = now || performance.now();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const inset = opt.inset ? opt.inset() : 0, availH = H - inset;
    const unit = Math.min(W * .5 / 1.95, availH * .5 / 1.8) * S.zoom * (opt.fit || 1);
    const sway = still ? 0 : Math.sin(time * .0004) * .1;
    const spin = S.spin + S.tx * .35 + (1 - S.enter) * 7, tilt = S.tilt + sway + S.ty * .25;
    const G = mul(rotM(tilt, 0, 0), rotM(0, spin, 0));
    const zBack = (1 - S.enter) ** 2 * 16, D = D0 - S.fly * 5.3 + (1 - S.enter) * 4;
    const f = unit * D0, cx = W / 2 + (S.shake ? rnd(-1, 1) * S.shake : 0), cy = (opt.cyFrac ? availH * opt.cyFrac : availH / 2) + (S.shake ? rnd(-1, 1) * S.shake : 0);
    const P = pair(), L1 = [Math.sin(S.light) * .9, .6, .75], l1 = Math.hypot(...L1);
    L1[0] /= l1; L1[1] /= l1; L1[2] /= l1;
    const H1 = [L1[0], L1[1], L1[2] + 1], h1 = Math.hypot(...H1); H1[0] /= h1; H1[1] /= h1; H1[2] /= h1;
    const items = []; let cnt = 0;
    const rings = [0, 1].map(k => {
      const R = mul(G, rotM(...P[k].r)), t0 = P[k].p;
      const tx = G[0] * t0[0] + G[1] * t0[1] + G[2] * t0[2], ty = G[3] * t0[0] + G[4] * t0[1] + G[5] * t0[2], tz = G[6] * t0[0] + G[7] * t0[1] + G[8] * t0[2] - zBack;
      return { R, tx, ty, tz };
    });
    rings.forEach((rg, k) => {
      const { R, tx, ty, tz } = rg, vx = verts[k], vp = B.vp, qp = B.qp, qn = B.qn, cp = cache.p[k], cn = cache.n[k];
      for (let i = 0; i < nq; i++) {
        const a = i * 3, x = vp[a], y = vp[a + 1], z = vp[a + 2];
        const X = R[0] * x + R[1] * y + R[2] * z + tx, Y = R[3] * x + R[4] * y + R[5] * z + ty, Z = R[6] * x + R[7] * y + R[8] * z + tz;
        const w = Math.max(.25, D - Z);
        vx[i * 2] = cx + f * X / w; vx[i * 2 + 1] = cy - f * Y / w;
        const x2 = qp[a], y2 = qp[a + 1], z2 = qp[a + 2];
        cp[a] = R[0] * x2 + R[1] * y2 + R[2] * z2 + tx; cp[a + 1] = R[3] * x2 + R[4] * y2 + R[5] * z2 + ty; cp[a + 2] = R[6] * x2 + R[7] * y2 + R[8] * z2 + tz;
        const nx = qn[a], ny = qn[a + 1], nz = qn[a + 2];
        cn[a] = R[0] * nx + R[1] * ny + R[2] * nz; cn[a + 1] = R[3] * nx + R[4] * ny + R[5] * nz; cn[a + 2] = R[6] * nx + R[7] * ny + R[8] * nz;
      }
      for (let i = 0; i < nq; i++) {
        const a = i * 3, px = cache.p[k][a], py = cache.p[k][a + 1], pz = cache.p[k][a + 2];
        const tcx = -px, tcy = -py, tcz = D - pz;
        if (cn[a] * tcx + cn[a + 1] * tcy + cn[a + 2] * tcz <= 0 || tcz < .3) continue;
        keys[cnt] = tcz; items.push(k * nq + i); cnt++;
      }
    });
    // chữ khắc bên trong lòng nhẫn
    const gl = [];
    if (glyphs && S.engrave > .01) rings.forEach((rg, k) => {
      const G0 = glyphs[k]; if (!G0) return;
      const { R, tx, ty, tz } = rg, rad = G0.rad;
      G0.items.forEach(it => {
        const cu = Math.cos(it.u), su = Math.sin(it.u);
        const X = R[0] * rad * cu + R[1] * rad * su + tx, Y = R[3] * rad * cu + R[4] * rad * su + ty, Z = R[6] * rad * cu + R[7] * rad * su + tz;
        const nx = -cu, ny = -su, NX = R[0] * nx + R[1] * ny, NY = R[3] * nx + R[4] * ny, NZ = R[6] * nx + R[7] * ny;
        const vis = NX * -X + NY * -Y + NZ * (D - Z);
        const len = Math.hypot(X, Y, D - Z); if (vis / len < .12 || D - Z < .3) return;
        const dir = (dx, dy, dz) => {          // vector hướng thế giới -> vector màn hình trên một đơn vị dài
          const X2 = X + dx * .05, Y2 = Y + dy * .05, Z2 = Z + dz * .05, w1 = D - Z, w2 = Math.max(.25, D - Z2);
          return [(f * X2 / w2 - f * X / w1) / .05, -(f * Y2 / w2 - f * Y / w1) / .05];
        };
        const tl = [su, -cu, 0], tv = dir(R[0] * tl[0] + R[1] * tl[1], R[3] * tl[0] + R[4] * tl[1], R[6] * tl[0] + R[7] * tl[1]);
        const uv = dir(R[2], R[5], R[8]);
        const w1 = D - Z, ix = cx + f * X / w1, iy = cy - f * Y / w1;
        keys[cnt] = w1 - .004; items.push(-1 - gl.length); cnt++;
        gl.push({ it, k, tv, uv, ix, iy, gh: G0.gh, a: clamp((vis / len - .12) / .25) });
      });
    });
    const idx = new Uint32Array(items.length).map((_, i) => i);
    idx.sort((a, b) => keys[b] - keys[a]);
    g.lineJoin = 'round'; g.lineWidth = .8;
    const ph = S.light;
    for (let ii = 0; ii < idx.length; ii++) {
      const id = items[idx[ii]];
      if (id < 0) {
        const o = gl[-1 - id], sc = o.gh / 100, flip = -1;
        g.save();
        g.setTransform(dpr * o.tv[0] * sc, dpr * o.tv[1] * sc, dpr * o.uv[0] * sc * flip, dpr * o.uv[1] * sc * flip, dpr * o.ix, dpr * o.iy);
        g.font = FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.globalAlpha = o.a * S.engrave;
        g.fillStyle = 'rgba(255,238,200,.55)'; g.fillText(o.it.ch, 0, 2.2);
        g.fillStyle = '#3a2410'; g.fillText(o.it.ch, 0, 0);
        g.restore();
        continue;
      }
      const k = id >= nq ? 1 : 0, q = id - k * nq, a = q * 3, n = cache.n[k];
      const nx = n[a], ny = n[a + 1], nz = n[a + 2];
      const dif = Math.max(0, nx * L1[0] + ny * L1[1] + nz * L1[2]), sp = Math.max(0, nx * H1[0] + ny * H1[1] + nz * H1[2]) ** 22;
      const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
      const band = Math.exp(-(((ry * .9 + rx * .45) - .42 + .5 * Math.sin(ph * .8)) ** 2) / .2);
      const band2 = Math.exp(-(((ry * .6 - rx * .5) + .62 + .4 * Math.cos(ph * .6)) ** 2) / .18);
      const sky = .5 + .5 * ry, ground = clamp(-ry * .9) * .22;
      const s = .12 + .22 * dif + .28 * sky * (rz > -.2 ? 1 : .6) + .5 * band + .3 * band2 + .55 * sp - ground + S.flash * .35;
      g.fillStyle = g.strokeStyle = LUTS[k][clamp(s) * 255 | 0];
      const i0 = Math.floor(q / V), j0 = q % V, i1 = (i0 + 1) % U, j1 = (j0 + 1) % V;
      const vx = verts[k], A = (i0 * V + j0) * 2, Bq = (i1 * V + j0) * 2, C = (i1 * V + j1) * 2, Dq = (i0 * V + j1) * 2;
      g.beginPath(); g.moveTo(vx[A], vx[A + 1]); g.lineTo(vx[Bq], vx[Bq + 1]); g.lineTo(vx[C], vx[C + 1]); g.lineTo(vx[Dq], vx[Dq + 1]); g.closePath(); g.fill(); g.stroke();
    }
    // ánh sáng: bùng sáng, sóng xung kích, tia lửa
    const jx = cx + f * rings[0].tx / 1 * 0, jy = cy;
    if (S.flash > .01 || S.shock > 0) {
      g.globalCompositeOperation = 'lighter';
      if (S.flash > .01) {
        const r = unit * (2.2 + S.flash * 1.4), gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, `rgba(255,244,214,${.85 * S.flash})`); gr.addColorStop(.35, `rgba(255,210,130,${.35 * S.flash})`); gr.addColorStop(1, 'rgba(255,190,100,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      }
      if (S.shock > 0 && S.shock < 1) {
        g.strokeStyle = `rgba(255,232,170,${.7 * (1 - S.shock)})`; g.lineWidth = 2.2 * (1 - S.shock) + .5;
        g.beginPath(); g.arc(cx, cy, unit * (.5 + 3.2 * S.shock), 0, TAU); g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
    }
    if (sparks.length) {
      g.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life -= 1; if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.x += s.vx; s.y += s.vy; s.vy += .05; s.vx *= .985;
        const al = clamp(s.life / s.max), r = s.r * (.5 + al);
        const gr = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4);
        gr.addColorStop(0, `rgba(255,240,200,${al})`); gr.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, r * 4, 0, TAU); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }
    return { cx, cy, unit };
  }

  let last = null;
  const draw = now => { last = render(now); dirty = false; };
  const step = (t, dt) => {
    const k = dt / 16.7;
    S.light += dt * .0007;
    if (S.auto && !S.dragging) S.spin += .0042 * k * (S.reading ? 0 : 1);
    S.spin += S.vs * k; S.tilt += S.vt * k; S.vs *= Math.pow(.94, k); S.vt *= Math.pow(.92, k);
    if (S.free > 0) { S.free -= dt; } else if (!S.dragging && !S.reading && S.auto) S.tilt += (POSES.idle.tilt - S.tilt) * .01 * k;
    if (S.shake > .05) S.shake *= Math.pow(.9, k); else S.shake = 0;
    draw(performance.now());
  };
  const start = () => { if (!still && !stopLoop) stopLoop = M.loop(step, { el: canvas }); };
  const stop = () => { stopLoop && stopLoop(); stopLoop = null; };
  if (still) draw(); else start();

  const api = {
    S, draw: () => draw(), start, stop, sparks,
    get alive() { return alive; },
    get box() { return last; },
    request() { if (still) requestAnimationFrame(() => draw()); },
    kick(vs, vt = 0) { S.vs = clamp(S.vs + vs, -.3, .3); S.vt = clamp(S.vt + vt, -.2, .2); S.free = 3500; },
    burst(n, x, y, speed = 6) {
      for (let i = 0; i < M.scale(n) + 2; i++) { const a = rnd(0, TAU), v = rnd(.3, 1) * speed; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rnd(30, 70), max: 70, r: rnd(.8, 2.4) }); }
    },
    pose(name, ms = 900) {
      const T = typeof name === 'string' ? POSES[name] : name, fs = S.spin, ft = S.tilt;
      const sp = T.spin + Math.round((fs - T.spin) / TAU) * TAU;
      S.reading = name === 'read1' || name === 'read2' ? 1 : 0; S.vs = S.vt = 0;
      return M.tween(0, 1, still ? 0 : ms, 'inOut', p => { S.spin = lerp(fs, sp, p); S.tilt = lerp(ft, T.tilt, p); if (still) dirty = true; }).then(() => { if (still) draw(); });
    },
    tween(key, to, ms, ease = 'inOut') { const from = S[key]; return M.tween(from, to, ms, ease, v => { S[key] = v; if (still) dirty = true; }).then(() => { S[key] = to; if (still) draw(); }); },
    dispose() { alive = false; stop(); ro && ro.disconnect(); }
  };
  return api;
}

// ---- kéo để xoay (dùng chung cho cover và hero) ----
function attachSpin(rings, canvas, { onTap, onDrag, onEnd } = {}) {
  const S = rings.S; let id = null, x0 = 0, y0 = 0, lx = 0, ly = 0, t0 = 0, moved = 0;
  const down = e => { if (id != null) return; id = e.pointerId; x0 = lx = e.clientX; y0 = ly = e.clientY; t0 = performance.now(); moved = 0; S.dragging = true; S.reading = 0; S.vs = S.vt = 0; canvas.setPointerCapture?.(id); };
  const move = e => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    S.spin += dx * .012; S.tilt = clamp(S.tilt + dy * .008, -2.9, 1.3); S.vs = dx * .012 * .6; S.vt = dy * .008 * .5; S.free = 3500;
    rings.request(); onDrag && onDrag(e.clientX - x0, e.clientY - y0, dx, dy);
  };
  const up = e => {
    if (e.pointerId !== id) return; id = null; S.dragging = false;
    const dt = performance.now() - t0;
    if (moved < 8 && dt < 400) onTap && onTap(e); else onEnd && onEnd(e.clientX - x0, e.clientY - y0, dt);
  };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.classList.add('r3-grab');
  return () => { ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((n, i) => canvas.removeEventListener(n, [down, move, up, up][i])); };
}

// ---- nội dung lời khắc: từ hero.content.engraving (mảng 2 chuỗi) hoặc từ hồ sơ cặp đôi ----
const dmy = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
function engravings(c) {
  const mc = (c.mods.hero && c.mods.hero.content) || {}, P = c.p, D = c.data;
  if (Array.isArray(mc.engraving) && mc.engraving.filter(Boolean).length) return [mc.engraving[0] || '', mc.engraving[1] || mc.engraving[0] || ''];
  const nb = P.get('traits.bride.nickname'), ng = P.get('traits.groom.nickname');
  const a = nb && ng ? `${nb} & ${ng}` : `${D.bride.short} & ${D.groom.short}`;
  const wd = `${c.d}.${c.m}.${c.y}`, met = dmy(P.get('metDate'));
  return [a, met ? `${met} – ${wd}` : wd];
}

let stopCover = () => {};

EA.cover((el, c, open) => {
  stopCover();
  const M = MO(), { data: D, esc: e } = c;
  const still = M.tier === 'low' || M.reduced;
  el.className = 'cover r3-cover'; el.style.cssText = '';
  el.innerHTML = `
    <div class="r3-bg" aria-hidden="true"><i class="neb n1"></i><i class="neb n2"></i><i class="neb n3"></i><canvas class="r3-stars ea-mo-canvas"></canvas></div>
    <canvas class="ring-canvas" role="img" aria-label="Hai chiếc nhẫn cưới. Kéo ngang để xoay hai chiếc nhẫn vào nhau."></canvas>
    <div class="r3-overlay">
      <p class="r3-to">Gửi ${e(c.guest)}</p>
      <h1 class="r3-names">${e(D.bride.short)} <span>&amp;</span> ${e(D.groom.short)}</h1>
      <p class="r3-date">${c.d} · ${c.m} · ${c.y}</p>
      <p class="r3-hint">${still ? 'Chạm để hai chiếc nhẫn tìm thấy nhau' : 'Kéo ngang để xoay hai chiếc nhẫn vào nhau'}</p>
      <button class="open-btn" type="button">Trao nhẫn</button>
    </div>
    <div class="r3-fade" aria-hidden="true"></div>`;
  const $ = s => el.querySelector(s), canvas = $('.ring-canvas'), ov = $('.r3-overlay'), hint = $('.r3-hint');
  const stops = []; let ended = false, locked = false, musicOn = false;
  stopCover = () => { ended = true; stops.splice(0).forEach(f => { try { f(); } catch { /* */ } }); };
  const wait = ms => new Promise(r => c.after(ms, r));

  const stars = M.particles($('.r3-stars'), {
    count: 90,
    init: (s, i, w, h) => { s.x = rnd(0, w); s.y = rnd(0, h); s.r = rnd(.4, 1.5); s.sp = rnd(.0008, .003); s.ph = rnd(0, 6.28); s.a = rnd(.35, 1); s.warm = Math.random() < .3; },
    step: () => {},
    draw: (g, s) => { const tw = .5 + .5 * Math.sin(s.life * s.sp + s.ph); g.globalAlpha = s.a * tw; g.fillStyle = s.warm ? '#ffe3a8' : '#fff'; g.beginPath(); g.arc(s.x, s.y, s.r, 0, TAU); g.fill(); g.globalAlpha = 1; }
  });
  stops.push(() => stars.stop());

  const inset = () => ov.offsetHeight + 10;
  const rings = makeRings(canvas, { still, enter: 0, texts: engravings(c), engrave: 0, inset, fit: 1.05, cyFrac: .5 });
  stops.push(() => rings.dispose());
  const S = rings.S;
  // bay vào: nhẫn từ xa lao tới và trôi lơ lửng
  c.after(100, () => rings.tween('enter', 1, still ? 0 : 1700, 'out').then(() => { if (!ended) rings.S.auto = !still; }));
  if (!still) { const off = M.tilt(({ x, y }) => { if (!locked) { S.tx = x; S.ty = y; } }); stops.push(off); }

  const begin = () => { if (musicOn) return; musicOn = true; EA.music(); M.requestTilt(); hint.classList.add('gone'); };
  let ticks = 0;
  async function lock() {
    if (locked || ended) return;
    locked = true; begin(); el.classList.add('giving'); S.dragging = false; S.auto = false;
    M.tone('whoosh');
    const from = S.mix;
    const toRead = rings.pose('read1', 1900);
    S.vs = 0;
    await Promise.all([M.tween(from, 1, 1150, 'inOut', v => { S.mix = v; S.spin += .05 * (1 - v) * 3; if (still) rings.draw(); }), wait(0)]);
    if (ended) return;
    // chạm khóa
    M.tone('thud'); M.haptic('thud'); S.shake = 7;
    S.flash = 1; S.shock = .001;
    const bx = rings.box;
    if (bx) rings.burst(46, bx.cx, bx.cy, 7);
    if (still) rings.draw();
    M.tween(1, 0, 900, 'out', v => { S.flash = v; }); M.tween(0, 1, 1100, 'out', v => { S.shock = v; });
    wait(150).then(() => { M.tone('chime'); M.haptic('success'); });
    rings.tween('engrave', 1, 900, 'out');
    await toRead; if (ended) return;
    await wait(still ? 500 : 700); if (ended) return;
    // máy quay xuyên qua nhẫn, ánh vàng tràn màn hình
    el.classList.add('flying'); M.tone('whoosh');
    await Promise.all([rings.tween('fly', 1, 950, 'inOut'), wait(250).then(() => M.tween(0, 1, 700, 'inOut', v => { S.flash = v * .7; }))]);
    if (ended) return;
    open();
    setTimeout(stopCover, 1000);
  }
  // kéo ngang -> hai nhẫn tiến lại gần nhau; thả tay khi đủ gần -> khóa
  const dist = () => Math.min(innerWidth * .55, 260);
  if (!still) {
    const off = attachSpin(rings, canvas, {
      onDrag: dx => {
        if (locked) return; begin();
        const p = clamp(Math.abs(dx) / dist()); S.mix = Math.max(S.mix, p * .9); S.auto = false;
        const k = Math.floor(p * 5); if (k !== ticks) { ticks = k; if (k > 0) { M.haptic('tap'); M.tone('click'); } }
      },
      onEnd: (dx, dy, dt) => {
        if (locked) return;
        const p = clamp(Math.abs(dx) / dist()), fast = Math.abs(dx) / Math.max(60, dt) > 1.1;
        if (p > .55 || (fast && p > .25)) lock();
        else { rings.tween('mix', 0, 700, 'out'); S.auto = true; ticks = 0; }
      },
      onTap: () => { if (locked) return; begin(); M.tone('pop'); M.haptic('tap'); rings.kick(.14); }
    });
    stops.push(off);
  } else {
    canvas.addEventListener('click', () => lock(), { once: true });
  }
  $('.open-btn').addEventListener('click', () => lock(), { once: true });
  // có thể điều khiển bằng bàn phím trên canvas
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ' || ev.key.startsWith('Arrow')) { ev.preventDefault(); lock(); } });
});

// -------------------- các phần của thiệp --------------------
EA.section('hero', c => {
  const { config: { couple: cp }, esc: e, ui } = c, eg = engravings(c);
  return `<div class="r3-hero">
  <div class="r3-stage">
    <canvas class="ring-canvas hero-rings" role="img" aria-label="Hai chiếc nhẫn cưới 3D. Kéo để xoay và đọc lời khắc bên trong."></canvas>
    <div class="r3-ctrl">
      <button class="r3-chip" type="button" data-act="read">Đọc lời khắc</button>
      <button class="r3-chip ghost" type="button" data-act="center" aria-label="Đưa nhẫn về giữa">Về giữa</button>
    </div>
    <p class="drag-hint">Kéo để xoay nhẫn</p>
  </div>
  <div class="r3-copy">
    <p class="eyebrow">Hai chiếc nhẫn · Một lời hứa</p>
    <h1 class="couple"><span>${e(cp.brideName)}</span><span class="amp">&amp;</span><span>${e(cp.groomName)}</span></h1>
    <p class="headline">${c.t(cp.headline)}</p>
    <p class="hero-date">${c.dow} · ${c.dateText}</p>
    <dl class="r3-engr" aria-label="Lời khắc bên trong hai chiếc nhẫn">
      <div><dt><i class="dot g"></i>Nhẫn vàng, khắc bên trong</dt><dd>${e(eg[0])}</dd></div>
      <div><dt><i class="dot r"></i>Nhẫn vàng hồng, khắc bên trong</dt><dd>${e(eg[1])}</dd></div>
    </dl>
    ${c.mod.content.showCountdown !== false ? ui.countdown() : ''}
    <figure class="r3-photo"><img src="${e(cp.heroImage)}" alt="${e(cp.brideName)} và ${e(cp.groomName)}" loading="lazy"></figure>
  </div>
</div>`;
});

EA.section('story', ({ esc: e, ui, mod }) => `<div class="wrap">
  ${ui.head('Chuyện của chúng mình', 'Những vòng tròn của chúng mình')}
  <ol class="orbits">
    ${(mod.content.chapters || []).map((ch, i) => `
      <li><span class="o-ring ${i % 2 ? 'rose' : ''}" aria-hidden="true">${i + 1}</span><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></li>`).join('')}
  </ol>
  ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
</div>`);

EA.section('events', ({ data: D, esc: e, ui }) => `<div class="wrap">
  ${ui.head('Ngày vui', 'Ngày trao nhẫn')}
  <div class="r3-events">
    ${D.events.map(ev => `
      <article class="r3-ev">
        <span class="mini-ring" aria-hidden="true"></span>
        <p class="label">${e(ev.label)}</p>
        <h3>${e(ev.title)}</h3>
        <p class="ev-time">${e(ev.time)}</p>
        <p>${e(ev.place)}<br><span class="addr">${e(ev.address)}</span></p>
        ${ui.actions(ev)}
      </article>`).join('')}
  </div>
</div>`);

EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
  ${ui.head('Xác nhận tham dự', 'Bạn sẽ chứng kiến khoảnh khắc trao nhẫn chứ?')}
  <div class="r3-rsvp">${ui.rsvpForm()}</div>
</div>`);

// -------------------- thêm vào sau khi dựng trang --------------------
EA.afterRender((c, main) => {
  const M = MO(), e = c.esc, P = c.p, D = c.data;
  const monthYear = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})/); return m ? `Tháng ${+m[2]} · ${m[1]}` : ''; };

  // ---- hero: nhẫn sống, chạy sau khi thiệp mở ----
  const cv = main.querySelector('.hero-rings');
  if (cv) setTimeout(() => {
    const cover = document.getElementById('cover'), go = () => startHero(cv);
    if (!cover || cover.hidden) return go();
    const mo = new MutationObserver(() => { if (cover.hidden || cover.classList.contains('is-leaving')) { mo.disconnect(); go(); } });
    mo.observe(cover, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }, 0);

  function startHero(cv) {
    const stage = cv.parentElement, still = M.tier === 'low' || M.reduced;
    const rings = makeRings(cv, { still, linked: true, texts: engravings(c), fit: 1.0, cyFrac: .46 });
    stage.classList.toggle('is-still', still);
    const S = rings.S, read = stage.querySelector('[data-act=read]'), center = stage.querySelector('[data-act=center]');
    const eng = main.querySelector('.r3-engr');
    let which = 0;
    const mark = n => eng && [...eng.children].forEach((d, i) => d.classList.toggle('on', n === i));
    if (!still) {
      attachSpin(rings, cv, {
        onTap: () => { M.tone('pop'); M.haptic('tap'); rings.kick(.16, 0); tapCount(); },
        onEnd: () => {}
      });
      let lastY = scrollY;
      addEventListener('scroll', () => { rings.kick((scrollY - lastY) * .0009); lastY = scrollY; }, { passive: true });
      M.tilt(({ x, y }) => { S.tx = x; S.ty = y; });
      stage.querySelector('.drag-hint').hidden = false;
    } else {
      stage.querySelector('.drag-hint').hidden = true;
      cv.addEventListener('click', () => { tapCount(); });
    }
    read.addEventListener('click', async () => {
      which = still ? (which + 1) % 3 : which ^ 1;
      M.tone('click'); M.haptic('tap');
      const name = still ? ['idle', 'read1', 'read2'][which] : which ? 'read2' : 'read1';
      if (still) { cv.style.opacity = 0; await new Promise(r => setTimeout(r, M.reduced ? 0 : 160)); }
      await rings.pose(name, 1000);
      if (still) cv.style.opacity = 1;
      mark(name === 'read1' ? 0 : name === 'read2' ? 1 : -1);
      read.textContent = still ? (which === 0 ? 'Đọc lời khắc' : 'Đổi góc nhìn') : (which ? 'Nhẫn còn lại' : 'Đọc lời khắc');
    });
    center.addEventListener('click', async () => {
      M.tone('click'); S.vs = S.vt = 0; which = 0; mark(-1); read.textContent = 'Đọc lời khắc';
      await rings.pose('idle', 800); S.auto = !still;
    });
    // easter egg: chạm ba lần vào cặp nhẫn
    let taps = 0, tt = 0, tipT = 0;
    function tapCount() {
      const now = Date.now(); taps = now - tt < 1600 ? taps + 1 : 1; tt = now;
      if (taps < 3) return; taps = 0;
      const nb = P.get('traits.bride.nickname'), ng = P.get('traits.groom.nickname');
      const msg = nb && ng ? `${nb} & ${ng}` : P.daysTogether != null ? `Đã ${fmt(P.daysTogether)} ngày bên nhau` : `${D.bride.short} & ${D.groom.short}`;
      const bx = rings.box; if (bx) rings.burst(60, bx.cx, bx.cy, 7);
      S.flash = .9; S.shock = .001; M.tween(.9, 0, 900, 'out', v => { S.flash = v; }); M.tween(0, 1, 1000, 'out', v => { S.shock = v; });
      if (still) rings.draw();
      M.tone('chime'); M.haptic('success');
      let tip = stage.querySelector('.r3-tip'); if (!tip) { tip = document.createElement('p'); tip.className = 'r3-tip'; tip.setAttribute('role', 'status'); stage.appendChild(tip); }
      tip.textContent = msg; tip.classList.remove('show'); void tip.offsetWidth; tip.classList.add('show');
      clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('show'), 3200);
    }
    // lời khắc đầu tiên sáng lên khi nhẫn xoay tới tư thế đọc
    mark(-1);
  }

  // ---- thêm các phần theo hồ sơ cặp đôi ----
  const adds = [];
  const proposal = P.get('proposal');
  if (proposal) {
    adds.push(['ringbox', `<div class="wrap narrow">
      <header class="head"><p class="eyebrow">Hộp nhẫn</p><h2 class="title">Khoảnh khắc chiếc hộp mở ra</h2></header>
      <div class="rb-stage"><div class="rb" role="button" tabindex="0" aria-expanded="false" aria-label="Mở hộp nhẫn">
        <div class="rb-in"><i class="rb-glow"></i><span class="rb-r a"></span><span class="rb-r b"></span></div>
        <div class="rb-lid"><span class="rb-mono">${e(D.monogram || '')}</span></div>
      </div></div>
      <figure class="rb-story"><figcaption class="label">Lời cầu hôn${P.get('metCity') ? '' : ''}</figcaption><blockquote class="rb-text">${e(proposal)}</blockquote></figure>
    </div>`]);
  }
  const places = (P.get('places', []) || []).filter(p => p && p.name);
  if (places.length || P.daysTogether != null) {
    const n = P.daysTogether;
    adds.push(['journey', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hành trình</p><h2 class="title">Mỗi nơi đi qua là một vòng tròn</h2></header>
      ${n != null ? `<div class="jr-count" role="group" aria-label="${fmt(n)} ngày bên nhau"><b class="num" data-n="${n}">${fmt(n)}</b><span>ngày bên nhau</span></div>` : ''}
      ${places.length ? `<ol class="jr-list">${places.map((pl, i) => `<li class="${i % 2 ? 'rose' : ''}" style="--i:${i}"><span class="jr-ring" aria-hidden="true"></span><h3>${e(pl.name)}</h3>${pl.date ? `<p class="label">${monthYear(pl.date)}</p>` : ''}</li>`).join('')}</ol>` : ''}
    </div>`]);
  }
  const tb = P.get('traits.bride', {}), tg = P.get('traits.groom', {});
  const rhy = r => (r === 'morning' ? 'Người của buổi sáng' : r === 'night' ? 'Cú đêm' : '');
  const rows = [['Biệt danh', tb.nickname, tg.nickname], ['Thức uống', tb.drink, tg.drink], ['Sở thích', tb.hobby, tg.hobby], ['Nhịp sống', rhy(tb.rhythm), rhy(tg.rhythm)]].filter(r => r[1] || r[2]);
  if (rows.length && (tb.nickname || tb.drink || tb.hobby) && (tg.nickname || tg.drink || tg.hobby)) {
    adds.push(['duo', `<div class="wrap">
      <header class="head"><p class="eyebrow">Hai con người</p><h2 class="title">Hai chiếc nhẫn, hai cá tính</h2></header>
      <div class="duo">
        <div class="duo-h"><span class="duo-ring"></span><p class="duo-n">${e(D.bride.short)}</p></div>
        <div class="duo-h r"><span class="duo-ring rose"></span><p class="duo-n">${e(D.groom.short)}</p></div>
        ${rows.map((r, i) => `<div class="duo-c" style="--i:${i}"><span class="k">${r[0]}</span><span class="v">${e(r[1] || '—')}</span></div><div class="duo-c r" style="--i:${i}"><span class="k">${r[0]}</span><span class="v">${e(r[2] || '—')}</span></div>`).join('')}
      </div>
    </div>`]);
  }
  const song = P.get('song', {});
  if (song.lyric) {
    adds.push(['lyric', `<div class="wrap narrow">
      <p class="eyebrow">Dòng khắc thứ ba</p>
      <p class="ly-text">${e(song.lyric)}</p>
      <p class="ly-by">${e(song.title || '')}${song.artist ? ` · ${e(song.artist)}` : ''}</p>
    </div>`]);
  }
  let prev = main.querySelector('#story') || main.querySelector('#families') || main.querySelector('#hero');
  adds.forEach(([id, html]) => {
    const s = document.createElement('section');
    s.id = id; s.className = `sec m-${id} r3-add`; s.innerHTML = html;
    if (prev) prev.insertAdjacentElement('afterend', s); else main.appendChild(s);
    prev = s;
  });

  // hộp nhẫn: mở khi cuộn tới, hoặc khi chạm
  const rb = main.querySelector('.rb');
  if (rb) {
    const sec = rb.closest('.sec'), txt = sec.querySelector('.rb-text');
    let opened = false;
    const openBox = () => {
      if (opened) return; opened = true; rb.classList.add('open'); rb.setAttribute('aria-expanded', 'true'); rb.setAttribute('aria-label', 'Hộp nhẫn đã mở');
      M.tone('click'); M.haptic('tap'); setTimeout(() => { M.tone('chime'); M.haptic('success'); }, 500);
      sec.classList.add('opened');
      if (!M.reduced) setTimeout(() => M.reveal(txt, { mode: 'words', stagger: 45, delay: 200 }), 300);
    };
    if (!M.reduced) txt.style.minHeight = '1px';
    rb.addEventListener('click', openBox);
    rb.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openBox(); } });
    M.inView(rb, () => setTimeout(openBox, M.reduced ? 0 : 500), { threshold: .6 });
  }
  const jr = main.querySelector('.jr-count');
  if (jr) {
    const num = jr.querySelector('.num'), nn = +num.dataset.n;
    if (!M.reduced) num.textContent = '0';
    M.inView(jr, () => M.tween(0, nn, 1900, 'out', v => { num.textContent = fmt(v); }).then(() => { num.textContent = fmt(nn); }), { threshold: .5 });
  }
  const ly = main.querySelector('.ly-text');
  if (ly && !M.reduced) M.inView(ly, () => M.reveal(ly, { mode: 'write', stagger: 38 }), { threshold: .5 });

  // ---- finale: sau RSVP hai nhẫn lồng vào nhau ngay dưới lời cảm ơn ----
  EA.onRsvp(() => {
    M.tone('chime'); M.haptic('success');
    setTimeout(() => {
      main.querySelectorAll('form.rsvp-form').forEach(f => {
        const done = f.nextElementSibling;
        if (!f.hidden || !done || done.previousElementSibling?.classList.contains('r3-final')) return;
        const box = document.createElement('div'); box.className = 'r3-final'; box.setAttribute('aria-hidden', 'true');
        box.innerHTML = '<canvas class="ring-canvas"></canvas>';
        done.before(box);
        const still = M.tier === 'low' || M.reduced;
        const r = makeRings(box.firstChild, { still, enter: 0, texts: engravings(c), fit: 1.08, tier: M.tier === 'high' ? 'mid' : M.tier });
        r.S.mix = 0; r.S.spin = .5;
        r.tween('enter', 1, still ? 0 : 1000, 'out').then(() => r.tween('mix', 1, still ? 0 : 1100, 'inOut')).then(() => {
          const bx = r.box; M.tone('thud'); r.S.flash = 1; r.S.shock = .001; if (bx) r.burst(40, bx.cx, bx.cy, 6);
          M.tween(1, 0, 800, 'out', v => { r.S.flash = v; }); M.tween(0, 1, 1000, 'out', v => { r.S.shock = v; });
          if (still) r.draw();
          r.S.auto = !still;
        });
      });
    }, 30);
  });
});
