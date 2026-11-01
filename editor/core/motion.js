// everafter motion kit. Plain IIFE, no deps. Exposes window.EAMotion (core.js attaches it as EA.motion / c.motion).
// Times passed to loop callbacks (t, dt) are in milliseconds. Everything degrades to instant when `reduced`.
(function () {
  if (window.EAMotion) return;
  const doc = document;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const noop = () => {};
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = rmq.matches;
  (rmq.addEventListener ? rmq.addEventListener.bind(rmq, 'change') : rmq.addListener.bind(rmq))(e => { reduced = e.matches; });
  const store = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

  // ---------- tier ----------
  const TIERS = ['low', 'mid', 'high'], FACTOR = { high: 1, mid: .55, low: .25 };
  let tier = (() => {
    const nav = navigator, mem = nav.deviceMemory, cores = nav.hardwareConcurrency || 4;
    if (nav.connection?.saveData) return 'low';
    if ((mem && mem <= 2) || cores <= 2) return 'low';
    if ((mem && mem <= 4) || cores <= 4) return 'mid';
    return 'high';
  })();
  const downgrade = () => { const i = TIERS.indexOf(tier); if (i > 0) tier = TIERS[i - 1]; };
  // 1s fps probe after load: sustained slowness lowers the tier (never raises it).
  (function probe() {
    let n = 0, t0 = 0, tries = 0;
    const tick = now => {
      if (doc.hidden) { n = 0; t0 = 0; return void setTimeout(() => requestAnimationFrame(tick), 500); }
      if (!t0) t0 = now;
      n++;
      if (now - t0 >= 1000) {
        const fps = n * 1000 / (now - t0);
        if (fps < 24) { tier = 'low'; } else if (fps < 42) downgrade();
        if (++tries < 2 && fps < 55) { n = 0; t0 = 0; } else return;
      }
      requestAnimationFrame(tick);
    };
    const start = () => setTimeout(() => requestAnimationFrame(tick), 600);
    doc.readyState === 'complete' ? start() : addEventListener('load', start, { once: true });
  })();

  // ---------- loop ----------
  function loop(fn, opts = {}) {
    let raf = 0, last = 0, t0 = 0, on = true, visible = true, io = null;
    const tick = now => {
      raf = 0;
      if (!on) return;
      if (doc.hidden || !visible) { last = 0; return; }       // paused; resumed by wake()
      if (!t0) t0 = now;
      const dt = last ? Math.min(100, now - last) : 16;
      last = now;
      fn(now - t0, dt);
      if (on) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (on && !raf && !doc.hidden && visible) raf = requestAnimationFrame(tick); };
    if (opts.el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; wake(); });
      io.observe(opts.el);
    }
    doc.addEventListener('visibilitychange', wake);
    wake();
    return function stop() {
      on = false; cancelAnimationFrame(raf); raf = 0;
      doc.removeEventListener('visibilitychange', wake); io?.disconnect();
    };
  }

  // ---------- tilt ----------
  const tiltSubs = new Set();
  const tilt_ = { x: 0, y: 0, tx: 0, ty: 0, gyro: false, stopLoop: null, listening: false, baseB: null };
  function onOrient(e) {
    if (e.gamma == null || e.beta == null) return;
    tilt_.gyro = true;
    if (tilt_.baseB == null) tilt_.baseB = e.beta;
    const b = e.beta - clamp(tilt_.baseB, 20, 70);
    tilt_.tx = clamp(e.gamma / 30, -1, 1);
    tilt_.ty = clamp(b / 30, -1, 1);
  }
  function onPointer(e) {
    if (tilt_.gyro) return;
    tilt_.tx = clamp(e.clientX / innerWidth * 2 - 1, -1, 1);
    tilt_.ty = clamp(e.clientY / innerHeight * 2 - 1, -1, 1);
  }
  function startTilt() {
    if (tilt_.listening) return;
    tilt_.listening = true;
    addEventListener('deviceorientation', onOrient);
    addEventListener('pointermove', onPointer, { passive: true });
    tilt_.stopLoop = loop(() => {
      tilt_.x += (tilt_.tx - tilt_.x) * .12; tilt_.y += (tilt_.ty - tilt_.y) * .12;
      const v = { x: +tilt_.x.toFixed(4), y: +tilt_.y.toFixed(4) };
      tiltSubs.forEach(f => f(v));
    });
  }
  function stopTilt() {
    tilt_.listening = false; tilt_.baseB = null; tilt_.stopLoop?.();
    removeEventListener('deviceorientation', onOrient); removeEventListener('pointermove', onPointer);
  }
  function tilt(fn) {
    if (reduced) { fn({ x: 0, y: 0 }); return noop; }
    tiltSubs.add(fn); startTilt();
    return () => { tiltSubs.delete(fn); if (!tiltSubs.size) stopTilt(); };
  }
  async function requestTilt() {
    let ok = true;
    try {
      for (const T of [window.DeviceOrientationEvent, window.DeviceMotionEvent]) {
        if (T && typeof T.requestPermission === 'function') ok = (await T.requestPermission()) === 'granted' && ok;
      }
    } catch { ok = false; }
    return ok;
  }

  // ---------- haptic + tone ----------
  const VIB = { tap: [8], thud: [34], crack: [10, 30, 22], success: [14, 40, 14, 40, 30] };
  function haptic(kind = 'tap') {
    try {
      const H = window.Capacitor?.Plugins?.Haptics;
      if (H) {
        if (kind === 'success') return void H.notification?.({ type: 'SUCCESS' });
        return void H.impact?.({ style: kind === 'tap' ? 'LIGHT' : kind === 'thud' ? 'HEAVY' : 'MEDIUM' });
      }
      navigator.vibrate?.(VIB[kind] || VIB.tap);
    } catch { /* unsupported */ }
  }
  let actx = null, unlocked = false;
  const unlock = () => {
    unlocked = true;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
    } catch { /* no WebAudio */ }
  };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, unlock, { capture: true, passive: true }));
  // [type, f0, f1, dur, gain, delay]
  const TONES = {
    pop: [['sine', 520, 220, .12, .18, 0]],
    click: [['square', 1800, 900, .03, .05, 0]],
    thud: [['sine', 110, 40, .28, .4, 0]],
    chime: [['sine', 880, 880, .9, .12, 0], ['sine', 1320, 1320, .8, .08, .09], ['sine', 1760, 1760, .7, .05, .18]],
    whoosh: 'noise'
  };
  function tone(kind = 'pop') {
    if (!unlocked || !actx || store('everafter:muted') === true) return;
    try {
      const t = actx.currentTime, def = TONES[kind] || TONES.pop;
      if (def === 'noise') {
        const len = actx.sampleRate * .4, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
        src.buffer = buf; f.type = 'bandpass'; f.Q.value = .8;
        f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3200, t + .35);
        g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .4);
        src.connect(f); f.connect(g); g.connect(actx.destination); src.start(t); return;
      }
      def.forEach(([type, f0, f1, dur, gain, delay]) => {
        const o = actx.createOscillator(), g = actx.createGain(), s = t + delay;
        o.type = type; o.frequency.setValueAtTime(f0, s);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, s + dur);
        g.gain.setValueAtTime(gain, s); g.gain.exponentialRampToValueAtTime(.0001, s + dur);
        o.connect(g); g.connect(actx.destination); o.start(s); o.stop(s + dur + .02);
      });
    } catch { /* ignore audio errors */ }
  }

  // ---------- gestures ----------
  // drag: p = progress 0..1 along `distance` (px, default 160) on `axis` ('x' | 'y' | 'xy', default 'y').
  function drag(el, o = {}) {
    const axis = o.axis || 'y', dist = o.distance || 160;
    let id = null, x0 = 0, y0 = 0;
    el.classList.add('ea-mo-drag');
    const prog = (dx, dy) => clamp((axis === 'x' ? dx : axis === 'y' ? dy : Math.hypot(dx, dy)) / dist * (o.invert ? -1 : 1), 0, 1);
    const down = e => { if (id != null) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; el.setPointerCapture?.(id); el.classList.add('is-dragging'); };
    const move = e => { if (e.pointerId !== id) return; const dx = e.clientX - x0, dy = e.clientY - y0; o.onMove?.(prog(dx, dy), dx, dy); };
    const end = e => {
      if (e.pointerId !== id) return;
      const p = prog(e.clientX - x0, e.clientY - y0); id = null; el.classList.remove('is-dragging'); o.onEnd?.(p);
    };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    return () => {
      el.classList.remove('ea-mo-drag', 'is-dragging');
      ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((n, i) => el.removeEventListener(n, [down, move, end, end][i]));
    };
  }

  function hold(el, ms, o = {}) {
    let t0 = 0, raf = 0, active = false;
    el.classList.add('ea-mo-hold');
    const frame = () => {
      raf = 0; if (!active) return;
      const p = clamp((performance.now() - t0) / ms);
      o.onProgress?.(p);
      if (p >= 1) { active = false; o.onDone?.(); } else raf = requestAnimationFrame(frame);
    };
    const start = () => { if (active) return; active = true; t0 = performance.now(); o.onProgress?.(0); raf = requestAnimationFrame(frame); };
    const cancel = () => { if (!active) return; active = false; cancelAnimationFrame(raf); o.onProgress?.(0); o.onCancel?.(); };
    const kd = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } };
    const ku = e => { if (e.key === ' ' || e.key === 'Enter') cancel(); };
    const nm = e => e.preventDefault();
    el.addEventListener('pointerdown', start);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, cancel));
    el.addEventListener('keydown', kd); el.addEventListener('keyup', ku); el.addEventListener('contextmenu', nm);
    return () => {
      cancel(); el.classList.remove('ea-mo-hold');
      el.removeEventListener('pointerdown', start);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.removeEventListener(n, cancel));
      el.removeEventListener('keydown', kd); el.removeEventListener('keyup', ku); el.removeEventListener('contextmenu', nm);
    };
  }

  function swipe(el, dir, fn) {
    let x0 = 0, y0 = 0, t0 = 0, id = null;
    const down = e => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp; };
    const up = e => {
      if (e.pointerId !== id) return; id = null;
      const dx = e.clientX - x0, dy = e.clientY - y0, ax = Math.abs(dx), ay = Math.abs(dy);
      if (Math.max(ax, ay) < 40 || e.timeStamp - t0 > 800) return;
      const d = ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (d === dir) fn(e);
    };
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up); };
  }

  // shake: fires fn() on a strong devicemotion spike (call requestTilt() in a gesture first on iOS).
  function shake(fn, o = {}) {
    const limit = o.threshold || 16; let last = 0, lm = null;
    const h = e => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      const m = Math.hypot(a.x || 0, a.y || 0, a.z || 0), now = Date.now();
      if (lm != null && Math.abs(m - lm) > limit && now - last > 900) { last = now; fn(); }
      lm = m;
    };
    addEventListener('devicemotion', h);
    return () => removeEventListener('devicemotion', h);
  }

  // ---------- canvas helpers ----------
  function fit(cv) {
    const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w, h, dpr };
  }

  // wipe: erase-to-reveal. The style paints the cover layer on the canvas first (via the 2d ctx), then calls this.
  // Returns { reveal(), off() }. onProgress(p) p = fraction of cells erased; auto-completes (reveal) at `done` (default .6).
  function wipe(cv, o = {}) {
    const g = cv.getContext('2d'), radius = o.radius || 28, done = o.done ?? .6;
    cv.classList.add('ea-mo-wipe');
    let down = false, lx = 0, ly = 0, finished = false, lastCheck = 0;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    const scale = () => cv.width / (cv.clientWidth || cv.width);
    const progress = () => {
      const N = 24, img = g.getImageData(0, 0, cv.width, cv.height).data; let cleared = 0;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = Math.floor((i + .5) / N * cv.width), y = Math.floor((j + .5) / N * cv.height);
        if (img[(y * cv.width + x) * 4 + 3] < 40) cleared++;
      }
      return cleared / (N * N);
    };
    const reveal = () => {
      if (finished) return; finished = true;
      if (reduced) { g.clearRect(0, 0, cv.width, cv.height); o.onProgress?.(1); return; }
      cv.style.transition = 'opacity .5s'; cv.style.opacity = '0';
      setTimeout(() => g.clearRect(0, 0, cv.width, cv.height), 520); o.onProgress?.(1);
    };
    const erase = (x, y) => {
      g.save(); g.globalCompositeOperation = 'destination-out'; g.lineCap = g.lineJoin = 'round';
      g.lineWidth = radius * 2 * scale(); g.beginPath(); g.moveTo(lx, ly); g.lineTo(x, y); g.stroke(); g.restore();
      lx = x; ly = y;
    };
    const dn = e => { down = true; cv.setPointerCapture?.(e.pointerId); [lx, ly] = pos(e); erase(lx + .01, ly); };
    const mv = e => {
      if (!down || finished) return; const [x, y] = pos(e); erase(x, y);
      const now = performance.now();
      if (now - lastCheck > 120) {
        lastCheck = now;
        let p = 0; try { p = progress(); } catch { /* tainted canvas */ }
        o.onProgress?.(p); if (p >= done) reveal();
      }
    };
    const up = () => { down = false; };
    cv.addEventListener('pointerdown', dn); cv.addEventListener('pointermove', mv);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    return {
      reveal,
      off() { cv.classList.remove('ea-mo-wipe'); ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((n, i) => cv.removeEventListener(n, [dn, mv, up, up][i])); }
    };
  }

  // particles: init(p, i, w, h) sets fields on a fresh particle; step(p, dt, w, h) advances it (return false to recycle,
  // burst particles are removed instead); draw(ctx, p). Coordinates are CSS px. Returns { stop, burst(n, init), w, h }.
  function particles(cv, o = {}) {
    const g = cv.getContext('2d'); let size = fit(cv); const list = [];
    const api = { get w() { return size.w; }, get h() { return size.h; } };
    const spawn = (init, i, burst) => { const p = { burst: !!burst, life: 0 }; init?.(p, i, size.w, size.h); list.push(p); return p; };
    const n = Math.max(1, Math.round((o.count || 60) * FACTOR[tier]));
    for (let i = 0; i < n; i++) spawn(o.init, i);
    const render = dt => {
      g.setTransform(size.dpr, 0, 0, size.dpr, 0, 0); g.clearRect(0, 0, size.w, size.h);
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i]; p.life += dt;
        if (o.step?.(p, dt, size.w, size.h) === false) { if (p.burst) { list.splice(i, 1); continue; } o.init?.(p, i, size.w, size.h); p.life = 0; }
        o.draw?.(g, p);
      }
    };
    const onResize = () => { size = fit(cv); };
    addEventListener('resize', onResize);
    let stopLoop = noop;
    if (reduced) render(0); else stopLoop = loop((t, dt) => render(dt), { el: cv });
    return Object.assign(api, {
      stop() { stopLoop(); removeEventListener('resize', onResize); g.clearRect(0, 0, cv.width, cv.height); },
      burst(count = 20, init = o.init) {
        if (reduced) return;
        const k = Math.max(1, Math.round(count * FACTOR[tier]));
        for (let i = 0; i < k; i++) spawn(init, i, true);
      }
    });
  }

  // ---------- text reveal ----------
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const graphemes = s => seg ? Array.from(seg.segment(s), x => x.segment) : (s.normalize('NFC').match(/\P{M}\p{M}*/gu) || []);
  // reveal: modes 'letters' | 'words' | 'write'. stagger ms per unit (default 40, words 90), delay ms. Returns a Promise.
  function reveal(el, o = {}) {
    const mode = o.mode || 'letters', stagger = o.stagger ?? (mode === 'words' ? 90 : 40), delay = o.delay || 0;
    if (!el.dataset.eaText) el.dataset.eaText = el.textContent;
    let idx = 0;
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 1) { if (!/^(SCRIPT|STYLE|BR)$/.test(ch.tagName)) walk(ch); return; }
        if (ch.nodeType !== 3 || !ch.nodeValue) return;
        const frag = doc.createDocumentFragment();
        ch.nodeValue.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return void frag.appendChild(doc.createTextNode(part));
          const w = doc.createElement('span'); w.className = 'ea-mo-w'; w.setAttribute('aria-hidden', 'true');
          const unit = (txt) => {
            const s = doc.createElement('span'); s.className = 'ea-mo-ch'; s.style.setProperty('--i', idx++); s.textContent = txt; return s;
          };
          if (mode === 'words') { const s = unit(part); w.appendChild(s); w.classList.remove('ea-mo-w'); w.classList.add('ea-mo-w'); }
          else graphemes(part).forEach(gph => w.appendChild(unit(gph)));
          frag.appendChild(w);
        });
        ch.replaceWith(frag);
      });
    };
    el.setAttribute('aria-label', el.dataset.eaText.trim());
    if (reduced) { el.classList.add('ea-mo-on'); return Promise.resolve(); }
    walk(el);
    el.classList.toggle('ea-mo-write', mode === 'write');
    el.style.setProperty('--ea-stagger', stagger + 'ms'); el.style.setProperty('--ea-delay', delay + 'ms');
    void el.offsetWidth;
    requestAnimationFrame(() => el.classList.add('ea-mo-on'));
    return new Promise(res => setTimeout(res, delay + idx * stagger + 650));
  }

  // ---------- observers ----------
  function inView(el, fn, o = {}) {
    const once = o.once !== false;
    if (!('IntersectionObserver' in window)) { fn(el); return noop; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { fn(e.target); if (once) io.disconnect(); }
    }), { threshold: o.threshold ?? .25 });
    io.observe(el);
    return () => io.disconnect();
  }

  // scrollProgress: fn(p) with p 0 (element just entering from below) .. 1 (fully left through the top).
  function scrollProgress(el, fn) {
    let raf = 0;
    const calc = () => {
      raf = 0; const r = el.getBoundingClientRect(), vh = innerHeight;
      fn(clamp((vh - r.top) / (vh + r.height)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); on();
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }

  // ---------- tween ----------
  const ease = {
    inOut: t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2,
    out: t => 1 - (1 - t) ** 3,
    outBack: t => { const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
    spring: t => t === 0 || t === 1 ? t : 1 - Math.cos(t * 4.5 * Math.PI) * Math.exp(-6 * t)
  };
  function tween(from, to, ms, easing, onUpdate) {
    const f = typeof easing === 'function' ? easing : ease[easing] || ease.inOut;
    return new Promise(res => {
      if (reduced || ms <= 0) { onUpdate?.(to); return res(); }
      const t0 = performance.now();
      const tick = now => {
        const k = clamp((now - t0) / ms);
        onUpdate?.(from + (to - from) * (k >= 1 ? 1 : f(k)));
        k >= 1 ? res() : requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  window.EAMotion = {
    get tier() { return tier; },
    get reduced() { return reduced; },
    scale: n => n * FACTOR[tier],
    loop, tilt, requestTilt, haptic, tone, drag, hold, swipe, shake, wipe, particles, reveal, inView, scrollProgress, tween, ease
  };
  if (window.EA) window.EA.motion = window.EAMotion;
})();
