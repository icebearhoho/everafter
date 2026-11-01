// Midnight Garden: the night-blooming quỳnh (Epiphyllum). Cover: a pitch-dark garden. The guest's finger is a firefly; wherever it flies it
// lights hidden flowers (a canvas darkness mask), each one blooms as it is found, and when the garden is awake the hoa quỳnh opens in time-lapse
// and the names appear. After: drifting fireflies, wishes as fireflies, flower meanings. All art is generated SVG / canvas.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, pad = n => String(n).padStart(2, '0');
  const rng = seed => { let h = 2166136261; for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; };
  const hasPhoto = h => h && !/picsum\.photos/.test(h);

  document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="mgPeony" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c8527f"/><stop offset=".55" stop-color="#ec8fb0"/><stop offset="1" stop-color="#fbd6e2"/></linearGradient>
    <linearGradient id="mgLily" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfe39a"/><stop offset=".3" stop-color="#fffbe8"/><stop offset="1" stop-color="#f6efd6"/></linearGradient>
    <linearGradient id="mgOrch" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9a3f9e"/><stop offset=".5" stop-color="#d79ae0"/><stop offset="1" stop-color="#f6e1f6"/></linearGradient>
    <linearGradient id="mgLip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c1f7c"/><stop offset="1" stop-color="#d84aa0"/></linearGradient>
    <linearGradient id="mgLotus" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3f6"/><stop offset=".6" stop-color="#f7b2c6"/><stop offset="1" stop-color="#e8628c"/></linearGradient>
    <linearGradient id="mgWhite" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f1e5b8"/><stop offset=".35" stop-color="#fffdf2"/><stop offset="1" stop-color="#fffefb"/></linearGradient>
    <linearGradient id="mgSep" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f2dca0"/><stop offset="1" stop-color="#e9a9a0"/></linearGradient>
    <linearGradient id="mgSep2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fbeec6"/><stop offset="1" stop-color="#f3c7b4"/></linearGradient>
    <linearGradient id="mgLeaf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0f2a1e"/><stop offset="1" stop-color="#2f6a4a"/></linearGradient>
    <linearGradient id="mgLeaf2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0b2118"/><stop offset="1" stop-color="#1f4b37"/></linearGradient>
    <radialGradient id="mgGlow"><stop offset="0" stop-color="#fff2b8" stop-opacity=".55"/><stop offset=".5" stop-color="#e9d9a6" stop-opacity=".16"/><stop offset="1" stop-color="#e9d9a6" stop-opacity="0"/></radialGradient>
  </defs></svg>`);

  // ---------- flower generator ----------
  const PC = {}, pet = (L, W) => PC[L + ',' + W] ||= `M0 0C${W} ${-L * .22} ${W * 1.1} ${-L * .8} 0 ${-L}C${-W * 1.1} ${-L * .8} ${-W} ${-L * .22} 0 0Z`;
  const ring = (n, L, W, fill, o = {}) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (360 / n * i + (o.rot || 0)).toFixed(1);
      s += `<path d="${pet(L, W)}" transform="rotate(${a})"${o.sw ? ` stroke="${o.stroke}" stroke-width="${o.sw}"` : ''}/>`;
      if (o.vein) s += `<path d="M0 ${-L * .12}L0 ${-L * .72}" transform="rotate(${a})" stroke="rgba(176,146,84,.45)" stroke-width=".7" fill="none"/>`;
    }
    return `<g class="rg" style="--d:${o.d || 0}s;--rr:${o.rr || -25}deg" fill="${fill}">${s}</g>`;
  };
  const stamens = (n, L0, L1, d, col = '#f1e2a0', tip = '#e9b94c') => {
    const r = rng('st' + n + L1); let s = '';
    for (let i = 0; i < n; i++) { const a = (360 / n * i + r() * 8).toFixed(1), l = L0 + r() * (L1 - L0); s += `<g transform="rotate(${a})"><path d="M0 0L0 ${-l.toFixed(1)}" stroke="${col}" stroke-width=".8" fill="none"/><circle cy="${-l.toFixed(1)}" r="1.7" fill="${tip}"/></g>`; }
    return `<g class="rg" style="--d:${d}s;--rr:50deg">${s}</g>`;
  };
  const QB = () => `<circle class="gl" r="200" fill="url(#mgGlow)"/>
    ${ring(18, 128, 5.5, 'url(#mgSep)', { rr: -40 })}${ring(16, 112, 7, 'url(#mgSep2)', { rot: 11, d: .15, rr: 30 })}
    ${ring(14, 92, 19, 'url(#mgWhite)', { d: .5, rr: -20, vein: 1, sw: .6, stroke: 'rgba(190,160,100,.4)' })}${ring(14, 84, 17, 'url(#mgWhite)', { rot: 12.8, d: .75, rr: 18, vein: 1, sw: .6, stroke: 'rgba(190,160,100,.4)' })}
    ${ring(12, 66, 15, 'url(#mgWhite)', { d: 1, rr: -14, vein: 1, sw: .5, stroke: 'rgba(190,160,100,.35)' })}${ring(10, 48, 12, 'url(#mgWhite)', { rot: 18, d: 1.25, rr: 12 })}
    ${stamens(54, 18, 40, 1.5)}<circle r="5" fill="#f2d57a"/><path d="M0 -9L2 -2 9 0 2 2 0 9-2 2-9 0-2-2Z" fill="#fff6c4"/>`;
  const quynh = cls => `<g class="mgq ${cls || ''}">${QB()}</g>`;
  const FL = {
    peony: () => ring(9, 46, 25, 'url(#mgPeony)') + ring(8, 40, 23, 'url(#mgPeony)', { rot: 20, d: .12 }) + ring(7, 33, 20, 'url(#mgPeony)', { rot: 8, d: .24 }) + ring(6, 26, 17, 'url(#mgPeony)', { rot: 30, d: .36 }) + ring(5, 19, 13, 'url(#mgPeony)', { d: .48 }) + `<circle r="4.5" fill="#f3c96a"/>`,
    lily: () => ring(3, 58, 15, 'url(#mgLily)') + ring(3, 58, 15, 'url(#mgLily)', { rot: 60, d: .1 }) + stamens(6, 14, 28, .3, '#d9e6a8', '#c98a3a') + `<circle r="4" fill="#a8c46a"/>`,
    orchid: () => ring(1, 50, 16, 'url(#mgOrch)', { rot: 0 }) + ring(1, 46, 15, 'url(#mgOrch)', { rot: 125, d: .05 }) + ring(1, 46, 15, 'url(#mgOrch)', { rot: -125, d: .05 }) + ring(1, 44, 31, 'url(#mgOrch)', { rot: 78, d: .12 }) + ring(1, 44, 31, 'url(#mgOrch)', { rot: -78, d: .12 }) + ring(1, 24, 12, 'url(#mgLip)', { rot: 180, d: .2 }) + `<circle r="5" fill="#fff6fb"/>`,
    lotus: () => ring(9, 56, 16, 'url(#mgLotus)') + ring(8, 48, 16, 'url(#mgLotus)', { rot: 20, d: .12 }) + ring(7, 40, 15, 'url(#mgLotus)', { rot: 8, d: .24 }) + ring(6, 30, 13, 'url(#mgLotus)', { rot: 30, d: .36 }) + `<circle r="7" fill="#f1d36b"/><circle r="3" fill="#d9a93c"/>`,
    jasmine: () => [[-16, 6], [15, -4], [1, -23]].map(([x, y], i) => `<g transform="translate(${x} ${y})">${ring(5, 15, 7, '#fffdf4', { d: i * .12, rr: -30 })}<circle r="2.4" fill="#f3d77a"/></g>`).join('') + `<ellipse cx="-30" cy="-12" rx="3" ry="7" fill="#eef3df" transform="rotate(-30 -30 -12)"/><ellipse cx="28" cy="12" rx="3" ry="7" fill="#eef3df" transform="rotate(40 28 12)"/>`
  };
  const flower = (kind, x, y, s, i) => `<g class="fl" data-i="${i}" transform="translate(${x} ${y}) scale(${s})"><circle class="fg" r="84" fill="url(#mgGlow)"/><g class="mgq">${FL[kind]()}</g></g>`;
  const leaf = (L, W, f = 'mgLeaf') => `<path d="M0 0C${W} ${-L * .3} ${W * .75} ${-L * .8} 0 ${-L}C${-W * .75} ${-L * .8} ${-W} ${-L * .3} 0 0Z" fill="url(#${f})"/><path d="M0 -2L0 ${-L * .85}" stroke="rgba(160,220,170,.22)" stroke-width="1" fill="none"/>`;
  const fan = (x, y, n, L, spread, base, seed, f) => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const a = base + spread * (i / Math.max(1, n - 1) - .5) + (r() - .5) * 10, l = L * (.7 + r() * .4); s += `<g transform="translate(${x} ${y}) rotate(${a.toFixed(1)})">${leaf(l, l * .26, f)}</g>`; } return s; };
  const vine = (x0, y0, x1, y1, sag, n, seed) => {
    const r = rng(seed), cx = (x0 + x1) / 2 + sag, cy = (y0 + y1) / 2; let s = `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" stroke="#1d4733" stroke-width="2" fill="none"/>`;
    for (let i = 1; i <= n; i++) { const t = i / (n + 1), x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1; s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(i % 2 ? 62 : -62) + (r() - .5) * 30})">${leaf(16 + r() * 8, 5, 'mgLeaf2')}</g>`; }
    return s;
  };
  // hidden flowers [kind, x, y, scale]; index 5 is the quỳnh bud
  const SPOTS = [['peony', 78, 372, .95], ['lily', 322, 346, .95], ['orchid', 92, 196, .95], ['lotus', 318, 188, .85], ['jasmine', 204, 92, 1.25]];
  const BUD = [200, 296];
  const scene = () => `<svg class="mg-svg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <g class="bg">${fan(-30, 330, 9, 190, 120, 70, 'a', 'mgLeaf2')}${fan(430, 330, 9, 190, 120, -70, 'b', 'mgLeaf2')}${fan(-170, 220, 7, 170, 80, 80, 'c', 'mgLeaf2')}${fan(570, 220, 7, 170, 80, -80, 'd', 'mgLeaf2')}
      ${fan(-20, -20, 7, 200, 80, 148, 'e', 'mgLeaf')}${fan(420, -20, 7, 200, 80, -148, 'f', 'mgLeaf')}${vine(120, -10, 150, 120, -30, 6, 'v1')}${vine(290, -10, 262, 140, 24, 7, 'v2')}</g>
    <g class="stems"><path d="M200 560C196 470 204 380 200 296" stroke="#1d4733" stroke-width="3" fill="none"/><path d="M78 372C90 440 140 500 200 540M322 346C310 430 260 500 200 540" stroke="#173a2a" stroke-width="2.4" fill="none"/></g>
    <g class="fls">${SPOTS.map((f, i) => flower(f[0], f[1], f[2], f[3], i)).join('')}</g>
    <g class="fl q" data-i="5" transform="translate(${BUD[0]} ${BUD[1]}) scale(.9)"><g class="bud"><path d="M0 -26C-14 -8-12 22 0 46 12 22 14 -8 0 -26Z" fill="#e7cf9a"/><path d="M0 -26C-14 -8-12 22 0 46M0 -26C14 -8 12 22 0 46" stroke="#c89a6a" fill="none"/></g>${quynh()}</g>
    <g class="front">${fan(-14, 570, 8, 150, 100, 28, 'g', 'mgLeaf')}${fan(414, 570, 8, 150, 100, -28, 'h', 'mgLeaf')}${fan(200, 600, 7, 120, 150, 0, 'i', 'mgLeaf2')}</g></svg>`;

  // ---------- moon phase (synodic) ----------
  const moonOf = (y, m, d) => {
    const jd = Date.UTC(+y, +m - 1, +d, 12) / 864e5 + 2440587.5, age = (((jd - 2451550.1) % 29.530588853) + 29.530588853) % 29.530588853, ph = age / 29.530588853;
    const f = (1 - Math.cos(2 * Math.PI * ph)) / 2, names = ['Trăng non', 'Trăng lưỡi liềm', 'Trăng thượng huyền', 'Trăng khuyết', 'Trăng rằm', 'Trăng khuyết', 'Trăng hạ huyền', 'Trăng lưỡi liềm'];
    return { age, ph, f, name: names[Math.round(ph * 8) % 8] };
  };
  const moonSVG = (mo, R = 40, cls = '') => {
    const wax = mo.ph < .5, p = wax ? mo.ph : 1 - mo.ph, rx = R * Math.cos(2 * Math.PI * p);
    return `<svg class="mg-moonsvg ${cls}" viewBox="${-R - 6} ${-R - 6} ${2 * R + 12} ${2 * R + 12}" aria-hidden="true"><circle r="${R}" fill="#1b2b24" stroke="rgba(233,217,166,.25)"/><g${wax ? '' : ' transform="scale(-1 1)"'}><path d="M0 ${-R}A${R} ${R} 0 0 1 0 ${R}A${Math.abs(rx).toFixed(1)} ${R} 0 0 ${rx > 0 ? 0 : 1} 0 ${-R}Z" fill="#f4ecc8"/></g></svg>`;
  };

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc;
    el.innerHTML = `<div class="mg-cover"><div class="mg-bgg"></div><div class="mg-scene">${scene()}</div>
      <canvas class="mg-dark" aria-hidden="true"></canvas><div class="mg-vig"></div><canvas class="mg-fx" aria-hidden="true"></canvas><i class="mg-ring" aria-hidden="true"></i>
      <div class="mg-top"><p class="mg-hint">Ngón tay của bạn là một chú đom đóm. Hãy bay qua khu vườn để thắp sáng những đóa hoa đang ngủ.</p>
        <div class="mg-count" aria-live="polite"><span class="dots">${SPOTS.map(() => '<i></i>').join('')}</span><b>0/${SPOTS.length}</b></div>
        <div class="mg-time" aria-hidden="true"><b>21:00</b><span>Quỳnh nở về đêm</span></div></div>
      <div class="mg-names" aria-hidden="true"><span class="n">${e(D.bride.name)}</span><span class="a">và</span><span class="n">${e(D.groom.name)}</span></div>
      <div class="mg-foot"><div class="mg-fade"><p class="mg-sm">${e(D.bride.name)} <i>và</i> ${e(D.groom.name)}</p></div>
        <p class="mg-date">${c.dow} · ${c.dateText}</p><p class="mg-guest">Gửi <b>${e(c.guest)}</b></p>
        <div class="mg-fade"><button class="open-btn" type="button">Thắp đom đóm</button></div></div></div>`;
    const root = el.querySelector('.mg-cover'), svg = root.querySelector('.mg-svg'), dark = root.querySelector('.mg-dark'), fx = root.querySelector('.mg-fx'), ringEl = root.querySelector('.mg-ring');
    const gd = dark.getContext('2d'), gf = fx.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    const fls = [...root.querySelectorAll('.fl')], dots = [...root.querySelectorAll('.mg-count i')], cnt = root.querySelector('.mg-count b'), hint = root.querySelector('.mg-hint');
    let W = 0, H = 0, R = 90, pts = [], bud = { x: 0, y: 0 }, found = 0, bloomed = false, auto = false, hover = 0, budT = 0, t0 = 0;
    const lit = SPOTS.map(() => 0), ptr = { x: 0, y: 0, on: false, seen: false }, fly = { x: 0, y: 0 }, trail = [];
    const sprite = (() => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,220,1)'); gr.addColorStop(.18, 'rgba(236,244,140,.85)'); gr.addColorStop(.5, 'rgba(206,227,120,.2)'); gr.addColorStop(1, 'rgba(206,227,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s; })();
    const amb = Array.from({ length: Math.round(16 * (M.tier === 'high' ? 1 : M.tier === 'mid' ? .6 : .3)) }, (_, i) => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28, s: .6 + Math.random() * .8, ph: Math.random() * 6.28, r: 120 + Math.random() * 90 }));
    const layout = () => {
      const r0 = root.getBoundingClientRect(); W = r0.width; H = r0.height; R = clamp(Math.min(W, H) * .21, 72, 112);
      [dark, fx].forEach(cv => { cv.width = W * dpr; cv.height = H * dpr; });
      gd.setTransform(dpr, 0, 0, dpr, 0, 0); gd.globalCompositeOperation = 'source-over'; gd.fillStyle = 'rgba(3,7,5,.975)'; gd.fillRect(0, 0, W, H);
      const ctm = svg.getScreenCTM(), P = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; const z = q.matrixTransform(ctm); return { x: z.x - r0.left, y: z.y - r0.top }; };
      pts = SPOTS.map(s => P(s[1], s[2])); bud = P(BUD[0], BUD[1]);
      ringEl.style.left = bud.x + 'px'; ringEl.style.top = bud.y + 'px';
      const sc = root.querySelector('.mg-scene'); sc.style.transformOrigin = `${bud.x}px ${bud.y - sc.getBoundingClientRect().top + r0.top}px`;
      sc.style.setProperty('--zx', (W / 2 - bud.x) + 'px'); sc.style.setProperty('--zy', (H * .36 - bud.y) + 'px');
      if (!ptr.seen) { fly.x = W / 2; fly.y = H * .66; }
    };
    const stamp = (x, y, k = .5) => { const g = gd; g.globalCompositeOperation = 'destination-out'; const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(.55, `rgba(0,0,0,${k * .6})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); };
    const found1 = i => {
      const f = fls[i]; if (f.classList.contains('found')) return; f.classList.add('found'); dots[i]?.classList.add('on'); found++; cnt.textContent = `${found}/${SPOTS.length}`;
      M.haptic('tap'); M.tone('pop'); root.classList.toggle('ready', found >= 3);
      if (found >= 3) hint.textContent = 'Vườn đã thức giấc. Đưa đom đóm tới nụ quỳnh ở giữa vườn.';
      else if (found === 1) hint.textContent = 'Tuyệt! Còn những đóa hoa khác đang ngủ trong bóng tối.';
    };
    const lastS = { x: -1, y: -1 };
    const frame = (t, dt) => {
      const T = t / 1000; t0 = t;
      if (!ptr.seen && !auto) { fly.x = W / 2 + Math.sin(T * .8) * W * .26; fly.y = H * .66 + Math.sin(T * 1.6) * 34; }
      else { const k = 1 - Math.pow(.0009, dt / 1000); fly.x += (ptr.x - fly.x) * k; fly.y += (ptr.y - fly.y) * k; }
      const active = !bloomed && (ptr.on || auto || hover);
      if (active) {
        const dx = fly.x - lastS.x, dy = fly.y - lastS.y, d = Math.hypot(dx, dy), step = R * .3, n = lastS.x < 0 ? 1 : Math.max(1, Math.ceil(d / step));
        for (let i = 1; i <= n; i++) stamp(lastS.x < 0 ? fly.x : lastS.x + dx * i / n, lastS.x < 0 ? fly.y : lastS.y + dy * i / n, .42);
        lastS.x = fly.x; lastS.y = fly.y;
        pts.forEach((p, i) => { if (Math.hypot(p.x - fly.x, p.y - fly.y) < R * .8) { lit[i] += dt; if (lit[i] > 320) found1(i); } });
        if (found >= 3 && Math.hypot(bud.x - fly.x, bud.y - fly.y) < R * .6) { budT += dt; if (budT > 650) bloom(); } else budT = Math.max(0, budT - dt);
      } else lastS.x = -1;
      // draw fx
      gf.setTransform(dpr, 0, 0, dpr, 0, 0); gf.clearRect(0, 0, W, H); gf.globalCompositeOperation = 'lighter';
      amb.forEach(a => {
        const sp = c.reduced ? 0 : 1;
        if (bloomed) { const g = a.a + T * .5 * a.s; a.x = lerp(a.x, (bud.x + Math.cos(g) * a.r * 1.25) / W, .02); a.y = lerp(a.y, (bud.y + Math.sin(g) * a.r * .95) / H, .02); }
        else { a.a += (Math.random() - .5) * .12 * sp; a.x += Math.cos(a.a) * .00012 * dt * a.s * sp; a.y += Math.sin(a.a) * .00012 * dt * a.s * sp; if (a.x < -.05) a.x = 1.05; if (a.x > 1.05) a.x = -.05; if (a.y < .05 || a.y > .97) a.a = -a.a; }
        gf.globalAlpha = (.35 + .65 * Math.max(0, Math.sin(T * 2 * a.s + a.ph))) * .8; gf.drawImage(sprite, a.x * W - 9, a.y * H - 9, 18, 18);
      });
      if (!bloomed) {
        trail.push({ x: fly.x, y: fly.y, l: 1 }); for (let i = trail.length - 1; i >= 0; i--) { const q = trail[i]; q.l -= dt / 700; if (q.l <= 0) trail.splice(i, 1); else { gf.globalAlpha = q.l * .55; const s = 26 * q.l + 6; gf.drawImage(sprite, q.x - s / 2, q.y - s / 2, s, s); } }
        gf.globalAlpha = 1; gf.drawImage(sprite, fly.x - 38, fly.y - 38, 76, 76);
        const wing = Math.sin(T * 40) * .5 + .5; gf.globalAlpha = .55; gf.fillStyle = '#e8f6ff'; gf.beginPath(); gf.ellipse(fly.x - 5, fly.y - 6, 5, 2 + wing * 2, -.6, 0, 6.3); gf.ellipse(fly.x + 5, fly.y - 6, 5, 2 + wing * 2, .6, 0, 6.3); gf.fill();
        gf.globalAlpha = 1; gf.fillStyle = '#fffbd0'; gf.beginPath(); gf.arc(fly.x, fly.y, 3.2, 0, 6.3); gf.fill();
      }
    };
    const to = ev => { const r = root.getBoundingClientRect(); ptr.x = ev.clientX - r.left; ptr.y = ev.clientY - r.top; if (!ptr.seen) { ptr.seen = true; fly.x = ptr.x; fly.y = ptr.y; } };
    root.addEventListener('pointerdown', ev => { if (ev.target.closest('.open-btn')) return; to(ev); ptr.on = true; root.setPointerCapture?.(ev.pointerId); M.requestTilt(); if (!root.dataset.m) { root.dataset.m = 1; EA.music(); root.classList.add('playing'); } });
    root.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse') { hover = 1; } if (ptr.on || ev.pointerType === 'mouse') to(ev); });
    const up = () => { ptr.on = false; }; root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    root.addEventListener('pointerleave', () => { hover = 0; });
    const stop = M.loop(frame);
    window.addEventListener('resize', layout);

    // ---- the quỳnh blooms in time-lapse ----
    function bloom() {
      if (bloomed) return; bloomed = true; ptr.on = false; hover = 0; EA.music();
      root.classList.add('blooming'); M.haptic('success'); M.tone('whoosh');
      fls.forEach((f, i) => { if (i < 5 && !f.classList.contains('found')) f.classList.add('found'); });
      const mx = Math.hypot(Math.max(bud.x, W - bud.x), Math.max(bud.y, H - bud.y)) * 1.05;
      M.tween(0, 1, c.reduced ? 0 : 1500, 'out', k => { gd.globalCompositeOperation = 'destination-out'; const gr = gd.createRadialGradient(bud.x, bud.y, 0, bud.x, bud.y, mx * k + 1); gr.addColorStop(0, '#000'); gr.addColorStop(.85, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); gd.fillStyle = gr; gd.fillRect(0, 0, W, H); }).then(() => { dark.style.display = 'none'; });
      c.after(350, () => { root.querySelector('.fl.q').classList.add('found'); root.querySelector('.fl.q .mgq').classList.add('open'); M.tone('chime'); });
      const tm = root.querySelector('.mg-time b');
      c.after(600, () => M.tween(0, 1, c.reduced ? 0 : 2400, 'inOut', k => { const mm = 21 * 60 + Math.round(k * 180); tm.textContent = pad(Math.floor(mm / 60) % 24) + ':' + pad(mm % 60); if (k >= 1) root.querySelector('.mg-time span').textContent = 'Nửa đêm, quỳnh nở trọn'; }));
      c.after(2600, () => { root.classList.add('shown'); M.haptic('thud'); M.tone('pop'); root.querySelectorAll('.mg-names .n').forEach((n, i) => M.reveal(n, { mode: 'letters', stagger: 70, delay: i * 500 })); });
      c.after(4600, () => { stop(); window.removeEventListener('resize', layout); open(); setTimeout(() => { el.innerHTML = ''; }, 1500); });
    }
    // fallback button: a firefly flies through every flower and the bud for the guest
    root.querySelector('.open-btn').addEventListener('click', () => {
      if (auto || bloomed) return; auto = true; EA.music(); M.requestTilt(); ptr.seen = true; root.classList.add('playing');
      if (c.reduced) { SPOTS.forEach((s, i) => found1(i)); return bloom(); }
      const path = [...pts, bud]; let i = 0; ptr.x = path[0].x; ptr.y = path[0].y;
      const next = () => { if (bloomed) return; i++; if (i >= path.length) { SPOTS.forEach((s, j) => found1(j)); return void c.after(250, bloom); } ptr.x = path[i].x; ptr.y = path[i].y; setTimeout(next, 300); };
      setTimeout(next, 300);
    });
    layout(); c.after(120, layout);
    document.fonts?.ready.then(layout);
  });

  // ---------- shared ----------
  const MEAN = {
    quynh: ['Hoa quỳnh', 'Chỉ nở một đêm, thơm cả bóng tối. Là tình yêu biết chờ đợi và trân trọng từng khoảnh khắc.', 'q'],
    peony: ['Mẫu đơn', 'Sự đủ đầy, ấm no và một mái nhà luôn nở hoa.', 'peony'], lily: ['Loa kèn', 'Sự tinh khôi và lời hứa trọn đời của người trao nhau chiếc nhẫn.', 'lily'],
    orchid: ['Lan hồ điệp', 'Bầy bướm đậu trên cành: duyên dáng, bền bỉ, thủy chung.', 'orchid'], lotus: ['Hoa sen', 'Mọc từ bùn mà vẫn thơm: giản dị, thanh cao, nở lúc bình minh.', 'lotus'],
    jasmine: ['Hoa nhài', 'Nhỏ bé mà thơm nức khi đêm xuống: tình yêu dịu dàng, âm thầm.', 'jasmine']
  };
  const miniFlower = k => `<svg viewBox="${k === 'q' ? '-140 -140 280 280' : '-70 -70 140 140'}" aria-hidden="true"><g class="mgq open static">${k === 'q' ? QB() : FL[k]()}</g></svg>`;
  const flowerFor = (side, t, c) => {
    if (t?.rhythm === 'night') return side === 'bride' ? 'jasmine' : 'quynh';
    if (t?.rhythm === 'morning') return side === 'bride' ? 'lotus' : 'orchid';
    return side === 'bride' ? 'peony' : 'lily';
  };
  const head = (c, eb, title, sub) => { const mc = c.mod?.content || {}; return `<header class="mg-hd"><span class="mg-eb">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</span><h2>${mc.title != null ? esc(mc.title) : title}</h2><i class="mg-rule"></i>${sub ? `<p>${sub}</p>` : ''}</header>`; };
  const wreath = () => {
    const r = rng('wr'); let s = ''; const RX = 132, RY = 172, N = 26;
    for (let i = 0; i < N; i++) { const a = i / N * 6.283, x = 150 + Math.cos(a) * RX, y = 190 + Math.sin(a) * RY, rot = a * 180 / Math.PI + 90 + (i % 2 ? 24 : -24); s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})">${leaf(34 + r() * 14, 10, i % 2 ? 'mgLeaf' : 'mgLeaf2')}</g>`; }
    [[0, -1, 'peony', .3], [.95, -.3, 'jasmine', .55], [-.95, -.3, 'jasmine', .55], [.9, .7, 'lotus', .26], [-.9, .7, 'orchid', .28], [0, 1, 'lily', .3]].forEach(([u, v, k, sc]) => { const a = Math.atan2(v * RY, u * RX); s += `<g transform="translate(${(150 + Math.cos(a) * RX).toFixed(1)} ${(190 + Math.sin(a) * RY).toFixed(1)}) scale(${sc})"><g class="mgq open static">${FL[k]()}</g></g>`; });
    return `<svg class="mg-wreath" viewBox="0 0 300 380" aria-hidden="true">${s}</svg>`;
  };

  // ---------- hero ----------
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content, ph = hasPhoto(cp.heroImage) ? cp.heroImage : '', mo = moonOf(c.y, c.m, c.d);
    return `<div class="mg-hero"><button class="mg-moon" type="button" aria-label="Trăng ngày cưới. Chạm ba lần để ước">${moonSVG(mo, 34)}<span class="mg-wish" role="status"></span></button>
      <p class="mg-eb">${e(mc.eyebrow || 'Hân hoan kính báo tin mừng')}</p>
      <div class="mg-oval"><div class="in${ph ? '' : ' ea-nophoto'}">${ph ? `<img src="${e(ph)}" alt="${e(D.bride.name)} và ${e(D.groom.name)}" fetchpriority="high">` : ''}<svg class="art" viewBox="-150 -150 300 300" aria-hidden="true"><rect x="-150" y="-150" width="300" height="300" fill="#0a1812"/><g class="mgq open static">${QB()}</g></svg></div>${wreath()}</div>
      <h1 class="mg-hnames"><span>${e(D.bride.name)}</span><span class="va">và</span><span>${e(D.groom.name)}</span></h1>
      ${cp.headline ? `<p class="mg-headline">${c.t(cp.headline)}</p>` : ''}
      <p class="mg-hdate"><b>${c.dow} · ${c.d}.${c.m}.${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>${cp.lunarDate ? `<p class="mg-lunar">${e(cp.lunarDate)}</p>` : ''}
      ${mc.showCountdown !== false ? ui.countdown() : ''}</div>`;
  });

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether, met = String(c.p.get('metDate', '')).split('-').reverse().join('.'), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow"><div class="mg-letter"><span class="mg-fl l"><svg viewBox="-60 -60 120 120" aria-hidden="true"><g class="mgq open static">${FL.jasmine()}</g></svg></span>
      <div class="mg-salute">${t(mc.greeting || 'Gửi {guestName},')}</div><h2>${e(mc.title || 'Một lời mời từ chúng mình')}</h2><i class="mg-rule"></i>
      ${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}${D.letterHighlight ? `<p class="mg-hl">${t(D.letterHighlight)}</p>` : ''}${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}
      <p class="mg-sign">Thân mến,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p></div>
      ${days > 0 ? `<div class="mg-days" data-days="${days}"><div class="n">${days.toLocaleString('vi-VN')}</div><div class="u">đêm có nhau dưới cùng một bầu trời</div><p>${met ? `Từ ${met}` : ''}${place ? ` · ${e(place)}` : ''}</p></div>` : ''}</div>`;
  });

  EA.section('story', c => {
    const { esc: e, mod } = c, mc = mod.content, tr = c.p.get('traits', {}) || {};
    const meaning = (k, who) => { const m = MEAN[k]; return `<article class="mg-mean"><div class="fi">${miniFlower(m[2])}</div><span>${who}</span><h3>${m[0]}</h3><p>${m[1]}</p></article>`; };
    const kb = flowerFor('bride', tr.bride), kg = flowerFor('groom', tr.groom), bn = c.data.bride.short || c.data.bride.name, gn = c.data.groom.short || c.data.groom.name;
    const ex = (t, nm) => t?.nickname ? `${nm} (${e(t.nickname)})` : nm;
    return `<div class="wrap">${head(c, 'Chuyện tình', 'Chuyện của chúng mình')}
      <ol class="mg-chap">${(mc.chapters || []).map(ch => `<li><div class="ph${ch.image ? '' : ' ea-nophoto'}">${ch.image ? `<img src="${e(ch.image)}" alt="" loading="lazy">` : ''}</div><div class="tx"><span>${e(ch.date)}</span><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${mc.quote ? `<p class="mg-sq">${e(mc.quote)}</p>` : ''}
      <h3 class="mg-h3">Ngôn ngữ của loài hoa</h3><p class="mg-lead">Mỗi đóa hoa trong vườn này mang một lời nhắn cho hai bạn.</p>
      <div class="mg-means">${meaning('quynh', 'Hoa của đêm cưới')}${meaning(kb, ex(tr.bride, e(bn)))}${meaning(kg === 'quynh' ? 'jasmine' : kg, ex(tr.groom, e(gn)))}</div></div>`;
  });

  EA.section('events', c => {
    const { data: D, esc: e, ui } = c, mo = moonOf(c.y, c.m, c.d), pct = Math.round(mo.f * 100);
    return `<div class="wrap narrow">${head(c, 'Ghi nhớ ngày vui', 'Ngày chúng mình thành đôi', 'Những giờ phút dưới ánh trăng')}
      <div class="mg-moon2">${moonSVG(mo, 44)}<div><span class="mg-eb">Trăng đêm cưới</span><b>${mo.name}, sáng ${pct}%</b><p>Ngày ${c.d}.${c.m}.${c.y}, mặt trăng ${c.mods.events?.content?.events?.[0]?.lunar ? 'ở ' + e(String(c.mods.events.content.events[0].lunar).replace(/^Nhằm\s*/i, '')) : `tuổi ${Math.round(mo.age)} ngày`}.</p></div></div>
      <ol class="mg-ev">${D.events.map(ev => `<li><div class="tm">${e(ev.time)}</div><article><span class="tag">${e(ev.label)}</span><h3>${e(ev.title)}</h3><p class="pl"><b>${e(ev.place)}</b><br>${e(ev.address)}</p>${ev.lunar ? `<p class="lu">${e(ev.lunar)}</p>` : ''}${ui.actions(ev)}</article></li>`).join('')}</ol></div>`;
  });

  EA.section('gallery', c => `<div class="wrap">${head(c, 'Khoảnh khắc', 'Khoảnh khắc của chúng mình')}<div class="mg-gal">${c.data.photos.map((p, i) => c.ui.photo(p, i)).join('')}</div></div>`);

  EA.section('quote', c => {
    const q = c.p.get('quote', null), txt = c.data.quote || q?.text, song = c.p.get('song', null), pet = c.p.get('pet', null);
    return `<div class="wrap narrow"><span class="mg-eb">${esc(c.mod.content.eyebrow || 'Lời mời')}</span>
      ${txt ? `<blockquote>${esc(txt)}</blockquote>${q?.author && !c.data.quote ? `<cite>${esc(q.author)}</cite>` : ''}` : ''}
      <div class="mg-extras">${song?.title ? `<div class="mg-card"><small>Bài hát của hai đứa</small><b>${esc(song.title)}</b>${song.artist ? `<span>${esc(song.artist)}</span>` : ''}${song.lyric ? `<em>${esc(song.lyric)}</em>` : ''}</div>` : ''}
      ${pet?.name ? `<div class="mg-card"><small>Thành viên bốn chân</small><b>${esc(pet.name)}</b><span>${esc(pet.kind || '')} cũng thức khuya ngắm đom đóm</span></div>` : ''}</div></div>`;
  });

  EA.section('rsvp', c => `<div class="wrap narrow">${head(c, 'Xác nhận tham dự', 'Bạn sẽ đến chứ?', 'Một chú đom đóm mang tên bạn sẽ bay vào vườn')}<div class="mg-rsvp">${c.ui.rsvpForm()}</div></div>`);

  EA.section('guestbook', c => `<div class="wrap narrow">${head(c, 'Lời chúc', 'Vườn đom đóm', c.mod.content.prompt ? esc(c.mod.content.prompt) : 'Mỗi lời chúc là một chú đom đóm.')}
    <div class="mg-meadow" aria-label="Những lời chúc hóa thành đom đóm"></div><p class="mg-wtip" role="status">Chạm vào một chú đom đóm để đọc lời chúc.</p><div class="mg-book">${c.ui.wishForm()}</div></div>`);

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest;
    return `<div class="mg-bye"><div class="q"><svg viewBox="-150 -150 300 300" aria-hidden="true"><g class="mgq open static">${QB()}</g></svg></div>
      <span class="mg-eb">Lời cảm ơn</span><h2>Hẹn gặp <b>${e(guest)}</b> khi quỳnh nở</h2><p>${e(D.thanks)}</p>${mod.content.signature ? `<p class="sig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="mg-bdate">${c.dow} · ${c.dateText}</p><div class="actions center"><button class="btn" type="button" id="reopen">Thắp lại đom đóm ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div></div>`;
  });

  // ---------- behaviours ----------
  const wishFlies = async (main, fresh) => {
    const box = main.querySelector('.mg-meadow'); if (!box) return;
    let list = [...(EA.list('guestbook') || []), ...(main.__samples || [])];
    try { list = list.concat(await EA.shared.list('fireflies') || []); } catch { /* local */ }
    const seen = new Set(); list = list.filter(w => { const k = (w.name || '') + '|' + (w.message || ''); if (!w.message || seen.has(k)) return false; seen.add(k); return true; }).slice(-30);
    box.innerHTML = list.map((w, i) => { const r = rng((w.name || '') + (w.message || '')); const isNew = fresh && w === fresh; return `<button class="mg-wf${isNew ? ' new' : ''}" type="button" style="left:${(8 + r() * 82).toFixed(1)}%;top:${(10 + r() * 74).toFixed(1)}%;--dx:${(r() * 60 - 30).toFixed(0)}px;--dy:${(r() * 40 - 20).toFixed(0)}px;--du:${(5 + r() * 5).toFixed(1)}s;--dl:-${(r() * 6).toFixed(1)}s" data-i="${i}" aria-label="Lời chúc của ${esc(w.name || 'một người bạn')}"><i></i></button>`; }).join('');
    const tip = main.querySelector('.mg-wtip');
    box.querySelectorAll('.mg-wf').forEach((b, i) => b.addEventListener('click', () => { tip.innerHTML = `<q>${esc(list[i].message)}</q><br><b>${esc(list[i].name || '')}</b>`; box.querySelectorAll('.on').forEach(x => x.classList.remove('on')); b.classList.add('on'); EA.motion?.tone('pop'); }));
    if (fresh) { const idx = list.indexOf(fresh); if (idx >= 0) box.querySelectorAll('.mg-wf')[idx]?.click(); }
  };
  EA.afterRender((c, main) => {
    const M = c.motion; main.__samples = c.mods.guestbook?.content?.samples || [];
    wishFlies(main);
    // drifting fireflies over the whole page
    const cv = document.createElement('canvas'); cv.className = 'mg-ff'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const g = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1); let W = 0, H = 0;
    const fit = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }; fit(); addEventListener('resize', fit);
    const sp = document.createElement('canvas'); sp.width = sp.height = 32; { const s = sp.getContext('2d'), gr = s.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,220,1)'); gr.addColorStop(.25, 'rgba(226,240,140,.7)'); gr.addColorStop(1, 'rgba(206,227,120,0)'); s.fillStyle = gr; s.fillRect(0, 0, 32, 32); }
    const n = Math.round(34 * (M.tier === 'high' ? 1 : M.tier === 'mid' ? .5 : .2)), fl = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28, s: .5 + Math.random(), ph: Math.random() * 6.28, z: 4 + Math.random() * 5 }));
    const draw = (t, dt) => { g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; const sc = scrollY * .00004; fl.forEach(f => { if (!c.reduced) { f.a += (Math.random() - .5) * .1; f.x += Math.cos(f.a) * .00005 * dt * f.s; f.y += Math.sin(f.a) * .00005 * dt * f.s - sc * 0; if (f.x < -.05) f.x = 1.05; if (f.x > 1.05) f.x = -.05; if (f.y < -.05) f.y = 1.05; if (f.y > 1.05) f.y = -.05; } g.globalAlpha = .2 + .5 * Math.max(0, Math.sin(t * .002 * f.s + f.ph)); g.drawImage(sp, f.x * W - f.z, f.y * H - f.z, f.z * 2, f.z * 2); }); };
    if (c.reduced) draw(1000, 0); else M.loop(draw);
    // flowers bloom as they scroll in
    main.querySelectorAll('.mg-mean, .mg-letter, .mg-bye').forEach(el => M.inView(el, () => el.classList.add('on'), { threshold: .3 }));
    const dd = main.querySelector('.mg-days');
    if (dd) M.inView(dd, () => { dd.classList.add('on'); const nn = dd.querySelector('.n'), to = +dd.dataset.days; M.tween(0, to, 2200, 'out', v => { nn.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .4 });
    // easter egg: three taps on the moon -> a shooting star and a wish
    const moon = main.querySelector('.mg-moon'), wish = main.querySelector('.mg-wish');
    if (moon) {
      let k = 0, tm = 0;
      moon.addEventListener('click', () => {
        k++; clearTimeout(tm); tm = setTimeout(() => { k = 0; }, 1000); M.tone('click');
        if (k >= 3) { k = 0; wish.textContent = c.p.get('insideJoke', '') || 'Một vì sao vừa băng qua. Điều ước của bạn đã được nghe.'; moon.classList.add('go'); M.haptic('success'); M.tone('chime'); setTimeout(() => moon.classList.remove('go'), 5600); }
      });
    }
    main.querySelectorAll('.mg-wf').forEach(() => {});
  });
  EA.onGuestbook((entry) => { try { EA.shared.add('fireflies', { name: entry.name, message: entry.message }); } catch { /* local */ } const m = document.getElementById('inv'); setTimeout(() => wishFlies(m, null), 50); EA.motion?.tone('chime'); });

  // finale after RSVP: the quỳnh blooms over the page and a firefly with the guest's name joins the garden
  EA.onRsvp(entry => {
    const M = EA.motion, name = String(entry?.name || '').trim() || 'bạn';
    if (entry && entry.attending === false) return;
    try { EA.shared.add('fireflies', { name, message: entry.note || 'Mình sẽ có mặt trong đêm hoa nở!' }); } catch { /* local */ }
    const o = document.createElement('div'); o.className = 'mg-finale';
    o.innerHTML = `<svg viewBox="-170 -170 340 340" aria-hidden="true"><g class="mgq">${QB()}</g></svg>${Array.from({ length: 22 }, (_, i) => `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 2.4).toFixed(1)}s;--s:${(5 + Math.random() * 3).toFixed(1)}s"></i>`).join('')}<div class="msg"><small>Cảm ơn bạn</small><b></b><span>Một chú đom đóm mang tên bạn vừa bay vào vườn quỳnh</span></div>`;
    o.querySelector('b').textContent = name; document.body.appendChild(o);
    M.haptic('success'); M.tone('chime');
    requestAnimationFrame(() => { o.classList.add('on'); setTimeout(() => o.querySelector('.mgq').classList.add('open'), 250); });
    setTimeout(() => M.tone('pop'), 1400);
    setTimeout(() => { o.classList.remove('on'); setTimeout(() => o.remove(), 1000); }, 5600);
    setTimeout(() => wishFlies(document.getElementById('inv'), null), 300);
  });
})();
