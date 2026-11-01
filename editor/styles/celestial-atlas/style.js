// Celestial Atlas: an old star atlas that unfolds, and your own places become a constellation named after you.
// Cover: a navy cloth atlas with gold foil. Wow: the board lifts, the folded chart opens in three panels, each place the couple
// has been (personality.places, metPin, then the wedding) lights up as a star and ink lines draw between them.
// Pages: every section is an engraved plate that turns in as you scroll. All artwork is inline SVG / CSS; no external images.
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const isDemo = h => !h || /picsum\.photos/.test(h);
  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
  const shortOf = (p, fb) => (p.short || String(p.name || fb).trim().split(/\s+/).pop() || fb);
  const clip = (s, n = 16) => { s = String(s); if (s.length <= n) return s; const w = s.split(/\s+/); let o = ''; for (const x of w) { if ((o + ' ' + x).trim().length > n) break; o = (o + ' ' + x).trim(); } return (o || s.slice(0, n)) + '…'; };
  const dms = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return `${d}°${String(m).padStart(2, '0')}' ${v >= 0 ? pos : neg}`; };
  const fmtYM = d => { const m = String(d || '').match(/^(\d{4})-(\d{2})/); return m ? `${m[2]}/${m[1]}` : String(d || '').replace(/\s*·\s*/, '/'); };
  const rng = seed => { let h = 2166136261; for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; };

  // ---------- the constellation model: stars from travel pins (or story chapters), ending on the wedding ----------
  const W = 300, H = 340;
  const modelOf = c => {
    if (c._ca) return c._ca;
    const P = c.p, ok = v => v && isFinite(v.lat) && isFinite(v.lng);
    const places = (P.get('places', []) || []).filter(ok).slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const met = P.get('metPin', null);
    if (ok(met) && !places.some(p => Math.abs(p.lat - met.lat) < .05 && Math.abs(p.lng - met.lng) < .05))
      places.unshift({ name: P.get('metPlace', 'Nơi chúng mình gặp nhau'), lat: met.lat, lng: met.lng, date: String(P.get('metDate', '')).slice(0, 7) });
    let pts = [], geo = false;
    if (places.length >= 2) {
      geo = true;
      const la = places.map(p => p.lat), lo = places.map(p => p.lng), a = Math.min(...la), b = Math.max(...la), l = Math.min(...lo), r = Math.max(...lo);
      pts = places.map((p, i) => ({ name: p.name, date: fmtYM(p.date), lat: p.lat, lng: p.lng, x: 8 + (r > l ? (p.lng - l) / (r - l) : .5) * .74 * W, y: .2 * H + (b > a ? 1 - (p.lat - a) / (b - a) : .5) * .76 * H, kind: i === 0 ? 'met' : 'place' }));
    } else {
      const ch = (c.mods.story?.content?.chapters || []).slice(0, 6), pat = [[.12, .86], [.4, .62], [.18, .42], [.52, .34], [.7, .6], [.62, .86]];
      pts = ch.map((x, i) => ({ name: x.title, date: fmtYM(x.date), x: pat[i][0] * W, y: pat[i][1] * H, kind: i === 0 ? 'met' : 'place' }));
    }
    pts.push({ name: 'Ngày cưới', date: `${c.d}.${c.m}.${c.y}`, x: .9 * W, y: .06 * H, kind: 'wed' });
    pts.forEach((p, i) => { p.n = i; if (geo && i > 0 && pts[i - 1].lat != null && p.lat != null) p.km = Math.round(c.p.kmBetween(pts[i - 1], p)); });
    const km = pts.reduce((t, p) => t + (p.km || 0), 0);
    const B = shortOf(c.data.bride, 'Cô dâu'), G = shortOf(c.data.groom, 'Chú rể');
    return (c._ca = { pts, geo, km, name: `${B}–${G}`, first: pts[0] });
  };

  const STAR = 'M0 -9 L1.5 -1.5 L9 0 L1.5 1.5 L0 9 L-1.5 1.5 L-9 0 L-1.5 -1.5Z M0 -4.5 L4.5 0 L0 4.5 L-4.5 0Z';
  const starG = (p, labels) => {
    const s = p.kind === 'wed' ? 1.55 : p.kind === 'met' ? 1.2 : 1, side = p.x < W * .5 ? 1 : -1;
    return `<g class="ca-st ${p.kind}" data-i="${p.n}" style="--k:${p.n}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><g class="in"><circle class="halo" r="${15 * s}"/><path class="ray" d="${STAR}" transform="scale(${s})"/><circle class="ctr" r="${2.1 * s}"/>${p.kind === 'wed' ? '<circle class="ring" r="17"/>' : ''}</g>${labels ? `<text class="no" y="${-13 * s}" text-anchor="middle">${ROM[p.n] || p.n + 1}</text><text class="lb" x="${side * (13 * s + 3)}" y="5" text-anchor="${side > 0 ? 'start' : 'end'}">${esc(clip(p.name))}</text>` : ''}</g>`;
  };
  const constG = (m, labels) => {
    const ln = m.pts.slice(1).map((p, i) => { const a = m.pts[i]; return `<path class="ca-ln" pathLength="1" style="--k:${i + 1}" d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${p.x.toFixed(1)} ${p.y.toFixed(1)}"/>`; }).join('');
    return ln + m.pts.map(p => starG(p, labels)).join('');
  };
  const bgStars = (seed, w, h, n) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, s = .5 + r() * 1.3; o += r() > .9 ? `<path class="sp" d="M${x.toFixed(1)} ${(y - 4).toFixed(1)}L${(x + 1).toFixed(1)} ${(y - 1).toFixed(1)}L${(x + 4).toFixed(1)} ${y.toFixed(1)}L${(x + 1).toFixed(1)} ${(y + 1).toFixed(1)}L${x.toFixed(1)} ${(y + 4).toFixed(1)}L${(x - 1).toFixed(1)} ${(y + 1).toFixed(1)}L${(x - 4).toFixed(1)} ${y.toFixed(1)}L${(x - 1).toFixed(1)} ${(y - 1).toFixed(1)}Z"/>` : `<circle class="bs${i % 4 === 0 ? ' tw' : ''}" style="--d:${(r() * 5).toFixed(1)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}"/>`; } return o; };
  const grat = (cx, cy, rs) => rs.map(r => `<circle class="gr" cx="${cx}" cy="${cy}" r="${r}"/>`).join('') + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line class="gr" x1="${(cx + Math.cos(a) * 36).toFixed(1)}" y1="${(cy + Math.sin(a) * 36).toFixed(1)}" x2="${(cx + Math.cos(a) * rs[rs.length - 1]).toFixed(1)}" y2="${(cy + Math.sin(a) * rs[rs.length - 1]).toFixed(1)}"/>`; }).join('');
  const rose = (x, y) => `<g transform="translate(${x} ${y})" class="rose"><circle r="22" fill="none" class="gr"/><path d="M0 -26L5 -5L26 0L5 5L0 26L-5 5L-26 0L-5 -5Z"/><path d="M0 -17L2 -2L17 0L2 2L0 17L-2 2L-17 0L-2 -2Z" transform="rotate(45)" opacity=".6"/><text y="-30" text-anchor="middle">B</text></g>`;

  // the whole chart (one third of it is shown per folded panel)
  const chart = (c, m) => `<svg class="ca-svg chart" viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <rect class="bd" x="12" y="12" width="376" height="576" fill="none"/><rect class="bd2" x="19" y="19" width="362" height="562" fill="none"/>
    <g class="ticks">${Array.from({ length: 36 }, (_, i) => `<path d="M${22 + i * 10} 12v7M${22 + i * 10} 581v7"/>`).join('')}${Array.from({ length: 55 }, (_, i) => `<path d="M12 ${28 + i * 10}h7M381 ${28 + i * 10}h7"/>`).join('')}</g>
    <g>${bgStars(c.data.bride.name + c.data.groom.name, 400, 600, 70)}</g>
    <g>${grat(200, 300, [70, 130, 190])}<ellipse class="gr dash" cx="200" cy="300" rx="190" ry="76" transform="rotate(-23 200 300)"/></g>
    ${rose(62, 536)}
    <text class="ti" x="200" y="62" text-anchor="middle">BẢN ĐỒ SAO</text><text class="ti2" x="200" y="90" text-anchor="middle">của ${esc(shortOf(c.data.bride, ''))} và ${esc(shortOf(c.data.groom, ''))}</text>
    <g transform="translate(50 130)">${constG(m, true)}</g>
    <text class="ca-cn" x="200" y="552" text-anchor="middle">Chòm sao ${esc(m.name)}</text>
  </svg>`;

  // ======================= COVER =======================
  EA.cover((el, c, open) => {
    const M = c.motion, D = c.data, e = c.esc, m = modelOf(c), B = D.bride, G = D.groom;
    el.innerHTML = `<div class="ca-cover">
      <div class="ca-dust" aria-hidden="true"></div>
      <div class="ca-stage">
        <div class="ca-zoom"><div class="ca-book">
          <div class="ca-sheet">
            <div class="p1"><div class="face">${chart(c, m)}</div></div>
            <div class="p2"><div class="face fr">${chart(c, m).replace('class="ca-svg chart"', 'class="ca-svg chart" style="top:-100%"')}</div><div class="face bk"></div>
              <div class="p3"><div class="face fr">${chart(c, m).replace('class="ca-svg chart"', 'class="ca-svg chart" style="top:-200%"')}<div class="foldcap"><b>Bản đồ sao</b><i>của ${e(shortOf(B, ''))} và ${e(shortOf(G, ''))}</i></div></div><div class="face bk"></div></div>
            </div><i class="crease c1"></i><i class="crease c2"></i>
          </div>
          <div class="ca-board"><div class="f">
            <i class="frame"></i>
            <svg class="orn" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 4 L34 26 L56 30 L34 34 L30 56 L26 34 L4 30 L26 26Z" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="30" cy="30" r="4" fill="currentColor"/></svg>
            <p class="k">Tập bản đồ sao</p>
            <h1 class="nm" aria-label="${e(B.name)} và ${e(G.name)}"><span>${e(B.name.replace(/ /g, ' '))}</span><i>&amp;</i><span>${e(G.name.replace(/ /g, ' '))}</span></h1>
            <p class="dt">${c.dow} · ${c.dateText}</p>
            <p class="gu">Gửi <b>${e(c.guest)}</b></p>
          </div><div class="b"></div></div>
        </div></div>
        <button class="open-btn" type="button">Mở tập bản đồ</button>
        <p class="ca-hint">Chạm vào tập bản đồ hoặc kéo lên để mở</p>
      </div>
    </div>`;
    const root = el.querySelector('.ca-cover'), book = el.querySelector('.ca-book'), zoom = el.querySelector('.ca-zoom'), btn = el.querySelector('.open-btn');
    M.tilt(({ x, y }) => { book.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg'); book.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg'); });
    const light = i => root.querySelectorAll('.ca-st, .ca-ln').forEach(n => { if ((n.dataset.i ?? (n.getAttribute('style').match(/--k:(\d+)/) || [])[1]) == i) n.classList.add('on'); });
    let started = false;
    const go = () => {
      if (started) return; started = true; btn.disabled = true;
      EA.music(); M.requestTilt(); M.haptic('tap'); M.tone('whoosh');
      const r = book.getBoundingClientRect();
      zoom.style.setProperty('--dy', Math.round(innerHeight / 2 - (r.top + r.height / 2)) + 'px'); zoom.style.setProperty('--z', Math.max(1, Math.min(1.5, innerHeight * .9 / r.height, innerWidth * .97 / r.width)).toFixed(3));
      root.classList.add('is-opening');
      c.after(900, () => { root.classList.add('unfold'); M.haptic('thud'); M.tone('thud'); });
      const t0 = 1700, step = 300;
      m.pts.forEach((p, i) => c.after(t0 + i * step, () => { light(i); M.tone(p.kind === 'wed' ? 'chime' : 'pop'); if (i % 2 === 0) M.haptic('tap'); }));
      const tN = t0 + m.pts.length * step;
      c.after(tN - 200, () => { root.classList.add('named', 'zoom'); M.haptic('success'); });
      c.after(tN + 900, () => open());
    };
    btn.addEventListener('click', go); book.addEventListener('click', go);
    M.swipe(book, 'up', go);
  });

  // ======================= SECTIONS =======================
  const head = (c, eb, title, sub) => { const mc = c.mod?.content || {}; return `<header class="ca-hd"><p class="eyebrow">${mc.eyebrow != null ? esc(mc.eyebrow) : eb}</p><h2>${mc.title != null ? esc(mc.title) : title}</h2><span class="ca-rule" aria-hidden="true"></span>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`; };
  const ARCH = (c, m, own) => `<div class="ca-arch"><svg class="ca-svg night" viewBox="-22 -60 344 460" role="img" aria-label="Chòm sao ${esc(m.name)}: ${m.pts.length} vì sao">
      <defs><clipPath id="ca-arch-c"><path d="M-22 400V120A172 172 0 0 1 322 120V400Z"/></clipPath></defs>
      <g clip-path="url(#ca-arch-c)"><rect x="-22" y="-60" width="344" height="460" class="sky"/>${grat(150, 190, [60, 112, 164, 216])}${bgStars(m.name + 'h', 344, 400, 90).replace(/(cx|x)="([\d.]+)"/g, (s, k, v) => `${k}="${(+v - 22).toFixed(1)}"`)}${constG(m, false)}</g><path class="arc" d="M-22 400V120A172 172 0 0 1 322 120V400Z"/><path class="arc2" d="M-13 400V122A163 163 0 0 1 313 122V400Z"/>
    </svg><p class="cap"><span>Chòm sao</span><b>${esc(m.name)}</b></p>${own ? `<div class="ca-photo"><img src="${own}" alt=""></div>` : ''}</div>`;
  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui, data: D } = c, mc = c.mod.content, m = modelOf(c), own = !isDemo(cp.heroImage) ? e(cp.heroImage) : '';
    return `<div class="ca-hero">
      ${ARCH(c, m, own)}
      <div class="ca-htxt">
        <p class="eyebrow">${e(mc.eyebrow || 'Ngày chung đôi')}</p>
        <h1 class="ca-names"><span>${e(D.bride.name.replace(/ /g, ' '))}</span><i aria-hidden="true">&amp;</i><span>${e(D.groom.name.replace(/ /g, ' '))}</span></h1>
        ${cp.headline ? `<p class="ca-headline">${c.t(cp.headline)}</p>` : ''}
        <p class="ca-hdate"><span>${c.dow}</span><b>${c.d} . ${c.m} . ${c.y}</b>${cp.city ? `<span>${e(cp.city)}</span>` : ''}</p>
        ${cp.lunarDate ? `<p class="lunar">${e(cp.lunarDate)}</p>` : ''}
        ${mc.showCountdown !== false ? ui.countdown() : ''}
      </div></div>`;
  });

  EA.section('invitation', c => {
    const { data: D, esc: e, t, mod } = c, mc = mod.content, days = c.p.daysTogether, met = c.p.get('metDate', ''), place = c.p.get('metPlace', '');
    return `<div class="wrap narrow">
      <p class="eyebrow">Thư mời</p>
      <p class="ca-salute">${t(mc.greeting || 'Gửi {guestName},')}</p>
      <h2 class="ca-h">${e(mc.title || 'Một lời mời từ chúng mình')}</h2><span class="ca-rule" aria-hidden="true"></span>
      <div class="ca-letter">${D.letter.slice(0, 2).map(p => `<p>${t(p)}</p>`).join('')}${D.letterHighlight ? `<p class="ca-hl">${t(D.letterHighlight)}</p>` : ''}${D.letter.slice(2).map(p => `<p>${t(p)}</p>`).join('')}</div>
      <p class="ca-sign">Trân trọng,<b>${e(D.bride.name)} và ${e(D.groom.name)}</b></p>
      ${days > 0 ? `<div class="ca-days" data-days="${days}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="o" cx="60" cy="60" r="54"/><circle class="o d" cx="60" cy="60" r="46"/><path class="s" d="${STAR}" transform="translate(60 60) scale(2.2)"/></svg>
        <span class="n">${days.toLocaleString('vi-VN')}</span><span class="u">ngày cùng ngắm một bầu trời</span>${met ? `<p>Từ ${met.split('-').reverse().join('.')}${place ? ` · ${e(place)}` : ''}</p>` : ''}</div>` : ''}
    </div>`;
  });

  EA.section('families', c => {
    const { data: D, esc: e, mod } = c;
    const fam = (label, f) => `<article class="ca-fam"><span class="label">${e(f.label || label)}</span><p>Ông <b>${e(f.father)}</b></p><p>Bà <b>${e(f.mother)}</b></p>${f.address ? `<small>${e(f.address)}</small>` : ''}</article>`;
    const homes = c.p.get('hometowns', {}), pins = c.p.get('hometownPins', {});
    const km = pins.groom && pins.bride ? Math.round(c.p.kmBetween(pins.groom, pins.bride) / 10) * 10 : null;
    return `<div class="wrap">
      ${head(c, 'Hai bên gia đình', 'Trân trọng báo tin', e(mod.content.kicker || 'Trân trọng báo tin lễ thành hôn của'))}
      <div class="ca-fams">${fam('Nhà trai', D.groomFamily)}${fam('Nhà gái', D.brideFamily)}</div>
      ${D.announceNote ? `<p class="ca-note">${e(D.announceNote)}</p>` : ''}
      ${homes.bride || homes.groom ? `<div class="ca-homes"><svg class="ca-svg" viewBox="0 0 340 90" aria-hidden="true"><g class="gr-wrap"><path class="ca-ln home" pathLength="1" d="M40 58 Q170 -6 300 58"/></g><g class="ca-st home" transform="translate(40 58)"><g class="in"><circle class="halo" r="16"/><path class="ray" d="${STAR}" transform="scale(1.2)"/><circle class="ctr" r="2.4"/></g></g><g class="ca-st home" transform="translate(300 58)"><g class="in"><circle class="halo" r="16"/><path class="ray" d="${STAR}" transform="scale(1.2)"/><circle class="ctr" r="2.4"/></g></g></svg>
        <div class="ends"><span>${e(homes.bride || '')}</span><span>${e(homes.groom || '')}</span></div>
        ${km ? `<p>Hai quê cách nhau khoảng <b>${km.toLocaleString('vi-VN')} km</b>. Hai vì sao ở hai đầu đất nước, nay chung một chòm.</p>` : ''}</div>` : ''}
    </div>`;
  });

  const RHY = { morning: ['Sao Mai', 'thức dậy cùng ánh bình minh'], night: ['Sao Khuya', 'tỉnh táo cùng ánh trăng'] };
  EA.section('story', c => {
    const { esc: e, mod, ui } = c, s = mod.content, P = c.p, B = c.data.bride, G = c.data.groom, m = modelOf(c);
    const trait = (who, p) => { const t = P.get('traits.' + who, null); if (!t) return ''; const rows = [t.nickname && ['Biệt danh', t.nickname], t.rhythm && RHY[t.rhythm] && ['Nhịp sống', RHY[t.rhythm][0]], t.drink && ['Thức uống', t.drink], t.hobby && ['Sở thích', t.hobby]].filter(Boolean); return rows.length ? `<article class="ca-trait"><h3>${e(shortOf(p, ''))}</h3><dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${e(r[1])}</dd>`).join('')}</dl></article>` : ''; };
    const traits = trait('bride', B) + trait('groom', G);
    const song = P.get('song', null), pet = P.get('pet', null), lt = P.get('letters', null), prop = P.get('proposal', ''), joke = P.get('insideJoke', ''), q = P.get('quote', null);
    const fp = m.first, coord = m.geo && fp.lat != null ? `Xích vĩ ${dms(fp.lat, 'B', 'N')} · Kinh độ ${dms(fp.lng, 'Đ', 'T')}` : '';
    return `<div class="wrap">
      ${head(c, 'Tinh đồ', 'Chòm sao của chúng mình')}
      <div class="ca-night" data-const><svg class="ca-svg night" viewBox="-40 -20 380 400" role="img" aria-label="Chòm sao ${e(m.name)}">${grat(150, 190, [70, 120, 170, 220])}${bgStars(m.name + 's', 380, 400, 60).replace(/(cx|x)="([\d.]+)"/g, (a, k, v) => `${k}="${(+v - 40).toFixed(1)}"`)}${constG(m, true)}</svg>
        <p class="ca-cname"><span>Chòm sao</span><b>${e(m.name)}</b>${coord ? `<small>${coord}</small>` : ''}</p></div>
      <ol class="ca-cat">${m.pts.map(p => `<li data-i="${p.n}" tabindex="0"><span class="no">${ROM[p.n] || p.n + 1}</span><span class="nm"><b>${p.kind === 'wed' ? 'Sao Hôn Lễ' : e(p.name)}</b><small>${p.kind === 'wed' ? e(p.name) : p.kind === 'met' ? 'Ngôi sao đầu tiên' : 'Một điểm dừng'}${p.km ? ` · cách vì sao trước ${p.km.toLocaleString('vi-VN')} km` : ''}</small></span><time>${e(p.date)}</time></li>`).join('')}</ol>
      ${m.km ? `<p class="ca-tot">Tổng hành trình: khoảng <b>${m.km.toLocaleString('vi-VN')} km</b> qua ${m.pts.length} vì sao</p>` : ''}
      <h3 class="ca-bh">Nhật ký quan sát</h3>
      <ol class="ca-chap">${(s.chapters || []).map((ch, i) => `<li><figure class="ca-plate"><img src="${e(ch.image || '')}" alt="" loading="lazy"><figcaption>Hình ${ROM[i] || i + 1}</figcaption></figure><div><p class="label">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></div></li>`).join('')}</ol>
      ${s.quote ? `<p class="ca-sq">${e(s.quote)}</p>` : ''}
      ${traits ? `<h3 class="ca-bh">Hai ngôi sao đôi</h3><div class="ca-traits">${traits}</div>` : ''}
      ${song && song.title ? `<div class="ca-card ca-song"><p class="label">Bản nhạc của các vì sao</p><b>${e(song.title)}</b>${song.artist ? `<small>${e(song.artist)}</small>` : ''}${song.lyric ? `<q>${e(song.lyric)}</q>` : ''}</div>` : ''}
      ${pet && pet.name ? `<div class="ca-card"><p class="label">Vì sao nhỏ</p><b>${e(pet.name)}</b>${pet.kind ? `<small>một bé ${e(pet.kind)} cũng có tên trong tập bản đồ</small>` : ''}</div>` : ''}
      ${lt && (lt.bride || lt.groom) ? `<h3 class="ca-bh">Thư gửi nhau</h3><div class="ca-letters">${lt.bride ? `<article><span class="label">${e(shortOf(B, ''))} viết</span><p>${e(lt.bride)}</p></article>` : ''}${lt.groom ? `<article><span class="label">${e(shortOf(G, ''))} viết</span><p>${e(lt.groom)}</p></article>` : ''}</div>` : ''}
      ${prop ? `<div class="ca-card"><p class="label">Lời cầu hôn</p><p>${e(prop)}</p></div>` : ''}
      ${joke ? `<div class="ca-card"><p class="label">Chuyện chỉ hai đứa hiểu</p><p>${e(joke)}</p></div>` : ''}
      ${q && q.text ? `<blockquote class="ca-pq">${e(q.text)}${q.author ? `<cite>${e(q.author)}</cite>` : ''}</blockquote>` : ''}
    </div>`;
  });

  EA.section('thanks', c => {
    const { data: D, esc: e, mod } = c, guest = c.guest === (D.defaultGuest || 'Quý khách') ? 'Quý khách' : c.guest, m = modelOf(c);
    return `<div class="ca-bye wrap narrow">
      <p class="eyebrow">Lời cảm ơn</p>
      <svg class="ca-svg night mini" viewBox="-20 -10 340 360" aria-hidden="true">${constG(m, false)}</svg>
      <p class="ca-byeline">Hẹn gặp <b>${e(guest)}</b> ngày vui</p>
      <p class="ca-byetext">${e(D.thanks)}</p>
      ${mod.content.signature ? `<p class="ca-bsig">${e(mod.content.signature.replace('&', 'và'))}</p>` : ''}
      <p class="ca-bdate">${c.dow} · ${c.dateText}</p>
      <div class="actions center"><button class="btn" type="button" id="reopen">Mở lại tập bản đồ ${EA.icon('replay')}</button><a class="btn ghost" href="#top">${e((mod.content.backToTop || 'Về đầu trang').replace(/\s*[↑↺→←]\s*$/u, ''))} ${EA.icon('up')}</a></div>
    </div>`;
  });

  // ======================= behaviours =======================
  const EYE = { 'Love story': 'Chuyện tình', 'Save the date': 'Ngày vui', 'Wedding itinerary': 'Lịch trình', 'Wedding party': 'Người đồng hành', 'Wedding film': 'Thước phim', 'A glimpse of us': 'Khung hình', 'Dress code & notes': 'Trang phục', 'Dress code &amp; notes': 'Trang phục', 'Wedding guide': 'Cẩm nang', 'Gift registry': 'Gợi ý quà', 'Guestbook': 'Lưu bút', 'Contact': 'Liên hệ', 'RSVP': 'Phản hồi', 'A note from us': 'Lời nhắn', 'Thank you': 'Cảm ơn', 'Save our date': 'Ngày chung đôi' };
  const shoot = (n = 5) => { for (let i = 0; i < n; i++) { const s = document.createElement('i'); s.className = 'ca-shoot'; s.style.cssText = `top:${Math.round(Math.random() * 45)}vh;left:${Math.round(10 + Math.random() * 70)}vw;animation-delay:${(i * .28).toFixed(2)}s`; document.body.appendChild(s); setTimeout(() => s.remove(), 2200 + i * 300); } };

  EA.afterRender((c, main) => {
    const M = c.motion, root = document.documentElement; root.dataset.tier = M.tier;
    main.querySelectorAll('.eyebrow').forEach(el => { const k = el.innerHTML.trim(); if (EYE[k]) el.textContent = EYE[k]; });
    main.querySelectorAll('.fine a, .gift-item a').forEach(a => { a.innerHTML = a.innerHTML.replace(/\s*[↗→]\s*$/u, ''); });
    // plate numbers: "Bảng I" … at the foot of every page
    [...main.querySelectorAll('.sec')].forEach((s, i) => s.setAttribute('data-folio', `Bảng ${ROM[i] || i + 1}`));
    // each constellation lights star by star when it scrolls into view
    main.querySelectorAll('.ca-arch, .ca-night, .ca-bye, .ca-homes').forEach(el => M.inView(el, () => { c.after(250, () => { el.classList.add('lit'); M.tone('chime'); }); }, { threshold: .35 }));
    // catalogue rows highlight their star
    const nightSv = main.querySelector('.ca-night');
    main.querySelectorAll('.ca-cat li').forEach(li => { const on = v => { nightSv?.querySelectorAll(`.ca-st[data-i="${li.dataset.i}"]`).forEach(s => s.classList.toggle('hot', v)); li.classList.toggle('hot', v); }; li.addEventListener('mouseenter', () => on(true)); li.addEventListener('mouseleave', () => on(false)); li.addEventListener('focus', () => on(true)); li.addEventListener('blur', () => on(false)); li.addEventListener('click', () => { on(true); M.tone('pop'); setTimeout(() => on(false), 1600); }); });
    main.querySelectorAll('.ca-night .ca-st').forEach(st => st.addEventListener('click', () => { main.querySelector(`.ca-cat li[data-i="${st.dataset.i}"]`)?.click(); }));
    const days = main.querySelector('.ca-days');
    if (days) M.inView(days, () => { days.classList.add('on'); const n = days.querySelector('.n'), to = +days.dataset.days; M.tween(0, to, 2200, 'out', v => { n.textContent = Math.round(v).toLocaleString('vi-VN'); }); }, { threshold: .5 });
    // easter egg: tap the wedding star three times, shooting stars cross the page
    main.querySelectorAll('.ca-st.wed').forEach(st => { let taps = 0, tm = 0; st.style.cursor = 'pointer'; st.addEventListener('click', () => { taps++; clearTimeout(tm); tm = setTimeout(() => { taps = 0; }, 1100); M.tone('pop'); if (taps >= 3) { taps = 0; shoot(7); M.tone('chime'); M.haptic('success'); st.classList.add('flare'); setTimeout(() => st.classList.remove('flare'), 1800); } }); });
  });

  // finale after RSVP: the guest becomes a new star joined to the wedding star
  EA.onRsvp((entry, c) => {
    const M = (c && c.motion) || EA.motion, name = String(entry?.name || '').trim();
    if (entry && entry.attending === false) return;
    const m = modelOf(c), wp = m.pts[m.pts.length - 1], gx = Math.max(24, wp.x - 118), gy = wp.y + 52;
    const ov = document.createElement('div'); ov.className = 'ca-finale';
    ov.innerHTML = `<svg class="ca-svg night lit" viewBox="-40 -20 380 400" aria-hidden="true">${constG(m, false)}<path class="ca-ln guest" pathLength="1" d="M${gx} ${gy}L${wp.x} ${wp.y}"/><g class="ca-st guest on" transform="translate(${gx} ${gy})"><g class="in"><circle class="halo" r="22"/><path class="ray" d="${STAR}" transform="scale(1.4)"/><circle class="ctr" r="3"/></g></g></svg><p><span>Ngôi sao của ${esc(name || 'bạn')}</span><small>đã thắp sáng trong chòm sao ${esc(m.name)}</small></p>`;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('on'));
    shoot(4); M.haptic('success'); M.tone('chime'); setTimeout(() => M.tone('pop'), 700);
    setTimeout(() => ov.classList.remove('on'), 4200); setTimeout(() => ov.remove(), 5000);
  });
  EA.onGuestbook(() => { const M = EA.motion; shoot(2); M.tone('pop'); M.haptic('tap'); });
})();
