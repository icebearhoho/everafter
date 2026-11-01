// Astrolabe Promise: brass rings spin and lock, then the stars rearrange into the real sky over the place and night you met.
(function () {
  const M = EA.motion, html = document.documentElement, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const R = (a, b) => a + Math.random() * (b - a);
  const sc = n => Math.max(1, Math.round(M.scale(n)));
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const setTier = () => { html.dataset.ayTier = M.tier; };

  // ---------- compact catalogue: ~170 brightest stars (J2000): name, RA hours, Dec degrees, magnitude ----------
  const CAT = 'Sirius,6.752,-16.72,-1.46;Canopus,6.399,-52.70,-.74;Arcturus,14.261,19.18,-.05;Rigil_Kent,14.660,-60.83,-.01;Vega,18.616,38.78,.03;Capella,5.278,45.99,.08;Rigel,5.242,-8.20,.13;Procyon,7.655,5.22,.34;Achernar,1.629,-57.24,.46;Betelgeuse,5.919,7.41,.50;Hadar,14.064,-60.37,.61;Altair,19.846,8.87,.76;Acrux,12.443,-63.10,.76;Aldebaran,4.599,16.51,.85;Antares,16.490,-26.43,1.06;Spica,13.420,-11.16,.97;Pollux,7.755,28.03,1.14;Fomalhaut,22.961,-29.62,1.16;Deneb,20.690,45.28,1.25;Mimosa,12.795,-59.69,1.25;Regulus,10.140,11.97,1.35;Adhara,6.977,-28.97,1.50;Castor,7.577,31.89,1.58;Gacrux,12.519,-57.11,1.64;Shaula,17.560,-37.10,1.62;Bellatrix,5.419,6.35,1.64;Elnath,5.438,28.61,1.65;Miaplacidus,9.220,-69.72,1.67;Alnilam,5.604,-1.20,1.69;Alnair,22.137,-46.96,1.74;Alnitak,5.679,-1.94,1.77;Alioth,12.900,55.96,1.77;Dubhe,11.062,61.75,1.79;Mirfak,3.405,49.86,1.80;Wezen,7.140,-26.39,1.83;Sargas,17.622,-43.00,1.87;Kaus_Australis,18.403,-34.38,1.85;Avior,8.375,-59.51,1.86;Alkaid,13.792,49.31,1.86;Menkalinan,5.992,44.95,1.90;Atria,16.811,-69.03,1.92;Alhena,6.629,16.40,1.93;Peacock,20.427,-56.74,1.94;Regor,8.159,-47.34,1.78;Mirzam,6.378,-17.96,1.98;Polaris,2.530,89.26,1.98;Alphard,9.460,-8.66,1.98;Hamal,2.120,23.46,2.00;Algieba,10.333,19.84,2.01;Diphda,.726,-17.99,2.04;Nunki,18.921,-26.30,2.05;Menkent,14.111,-36.37,2.06;Mirach,1.163,35.62,2.06;Alpheratz,.139,29.09,2.06;Rasalhague,17.582,12.56,2.07;Kochab,14.845,74.16,2.08;Saiph,5.796,-9.67,2.06;Almach,2.065,42.33,2.10;Denebola,11.818,14.57,2.14;Algol,3.136,40.96,2.12;Tiaki,22.711,-46.88,2.10;Muhlifain,12.692,-48.96,2.17;Naos,8.060,-40.00,2.25;Aspidiske,9.285,-59.28,2.25;Suhail,9.133,-43.43,2.21;Alphecca,15.578,26.71,2.23;Mizar,13.399,54.93,2.23;Sadr,20.370,40.26,2.23;Schedar,.675,56.54,2.24;Eltanin,17.943,51.49,2.24;Mintaka,5.533,-.30,2.23;Caph,.153,59.15,2.27;Dschubba,16.005,-22.62,2.29;Larawag,16.836,-34.29,2.29;Eps_Cen,13.665,-53.47,2.30;Eta_Cen,14.592,-42.16,2.30;Alpha_Lup,14.699,-47.39,2.30;Merak,11.031,56.38,2.37;Izar,14.750,27.07,2.37;Enif,21.736,9.88,2.39;Scheat,23.063,28.08,2.42;Ankaa,.438,-42.31,2.40;Kappa_Sco,17.708,-39.03,2.41;Sabik,17.173,-15.72,2.43;Phecda,11.897,53.69,2.44;Aludra,7.402,-29.30,2.45;Markab,23.079,15.21,2.49;Navi,.945,60.72,2.47;Aljanah,20.770,33.97,2.46;Alderamin,21.310,62.59,2.51;Menkar,3.038,4.09,2.53;Zeta_Oph,16.619,-10.57,2.56;Zosma,11.235,20.52,2.56;Zeta_Cen,13.926,-47.29,2.55;Arneb,5.545,-17.82,2.58;Ascella,19.043,-29.88,2.60;Zubeneschamali,15.283,-9.38,2.61;Acrab,16.091,-19.81,2.62;Phact,5.661,-34.07,2.64;Sheratan,1.911,20.81,2.64;Muphrid,13.911,18.40,2.68;Ruchbah,1.430,60.24,2.68;Lesath,17.512,-37.30,2.69;Kaus_Media,18.350,-29.83,2.70;Tarazed,19.771,10.61,2.72;Zubenelgenubi,14.848,-16.04,2.75;Porrima,12.694,-1.45,2.74;Yed_Prior,16.239,-3.69,2.74;Cebalrai,17.724,4.57,2.77;Kornephoros,16.503,21.49,2.77;Rastaban,17.507,52.30,2.79;Cursa,5.131,-5.09,2.79;Kaus_Borealis,18.466,-25.42,2.81;Vindemiatrix,13.036,10.96,2.83;Zeta_Her,16.688,31.60,2.81;Algenib,.220,15.18,2.83;Tau_Sco,16.598,-28.22,2.82;Zeta_Per,3.902,31.88,2.85;Delta_Cyg,19.750,45.13,2.87;Alcyone,3.790,24.11,2.87;Deneb_Algedi,21.784,-16.13,2.87;Epsilon_Per,3.964,40.01,2.89;Pi_Sco,15.981,-26.11,2.89;Gomeisa,7.452,8.29,2.90;Zaurak,3.967,-13.51,2.95;Sadalsuud,21.526,-5.57,2.90;Sigma_Sco,16.353,-25.59,2.90;Sadalmelik,22.096,-.32,2.96;Gamma_Per,3.080,53.51,2.90;Imai,12.252,-58.75,2.80;Alnasl,18.097,-30.42,2.98;Algenubi,9.764,23.77,2.98;Gienah,12.263,-17.54,2.59;Kraz,12.573,-23.40,2.65;Algorab,12.498,-16.52,2.94;Minkar,12.169,-22.62,3.02;Pherkad,15.345,71.83,3.05;Altais,19.209,67.66,3.07;Aldhibah,17.147,65.71,3.17;Alfirk,21.478,70.56,3.2;Errai,23.655,77.63,3.2;Tania_Australis,10.372,41.50,3.05;Talitha,8.987,48.04,3.14;Megrez,12.257,57.03,3.31;Muscida,8.504,60.72,3.35;Segin,1.907,63.67,3.37;Delta_And,.655,30.86,3.27;Albireo,19.512,27.96,3.08;Sheliak,18.835,33.36,3.52;Sulafat,18.982,32.69,3.25;Alshain,19.922,6.41,3.71;Mebsuta,6.732,25.13,3.06;Tejat,6.383,22.51,3.28;Alzirr,6.754,12.90,3.35;Wasat,7.335,21.98,3.53;Meissa,5.585,9.93,3.39;Furud,6.338,-30.06,3.0;Theta_Aur,5.995,37.21,2.6;Iota_Aur,4.950,33.17,2.7;Zeta_Tau,5.627,21.14,3.0;Ain,4.477,19.18,3.5;Gamma_Tau,4.330,15.63,3.65;Adhafera,10.278,23.42,3.44;Rasalas,9.879,26.01,3.88;Chertan,11.237,15.43,3.33;Seginus,14.535,38.31,3.04;Pi_Her,17.251,36.81,3.16;Eta_Her,16.715,38.92,3.5;Sarin,17.251,24.84,3.1;Mu1_Sco,16.864,-38.05,3.0;Zeta2_Sco,16.909,-42.36,3.6;Eta_Sco,17.202,-43.24,3.33;Iota1_Sco,17.793,-40.13,3.0;Phi_Sgr,18.761,-26.99,3.17;Tau_Sgr,19.116,-27.67,3.32;Heze,13.578,-.60,3.37;Dabih,20.350,-14.78,3.08;Skat,22.911,-15.82,3.27;Gruid_Gamma,21.899,-37.37,3.0;Beta_TrA,15.919,-63.43,2.85;Gamma_TrA,15.315,-68.68,2.87;Yildun,17.537,86.59,4.35;Eps_UMi,16.766,82.04,4.2;Zeta_UMi,15.734,77.79,4.3;Eta_UMi,16.292,75.76,5.0;Acamar,2.971,-40.30,3.2;Nihal,5.471,-20.76,2.84;Wazn,5.849,-35.77,3.1';
  const LINES = 'Betelgeuse-Meissa,Meissa-Bellatrix,Betelgeuse-Alnitak,Bellatrix-Mintaka,Alnitak-Alnilam,Alnilam-Mintaka,Alnitak-Saiph,Mintaka-Rigel,Dubhe-Merak,Merak-Phecda,Phecda-Megrez,Megrez-Dubhe,Megrez-Alioth,Alioth-Mizar,Mizar-Alkaid,Polaris-Yildun,Yildun-Eps_UMi,Eps_UMi-Zeta_UMi,Zeta_UMi-Eta_UMi,Eta_UMi-Pherkad,Pherkad-Kochab,Kochab-Zeta_UMi,Caph-Schedar,Schedar-Navi,Navi-Ruchbah,Ruchbah-Segin,Deneb-Sadr,Sadr-Albireo,Delta_Cyg-Sadr,Sadr-Aljanah,Vega-Sheliak,Sheliak-Sulafat,Sulafat-Vega,Tarazed-Altair,Altair-Alshain,Acrab-Dschubba,Dschubba-Sigma_Sco,Sigma_Sco-Antares,Antares-Tau_Sco,Antares-Larawag,Larawag-Mu1_Sco,Mu1_Sco-Zeta2_Sco,Zeta2_Sco-Eta_Sco,Eta_Sco-Sargas,Sargas-Iota1_Sco,Iota1_Sco-Kappa_Sco,Kappa_Sco-Shaula,Shaula-Lesath,Alnasl-Kaus_Australis,Kaus_Australis-Ascella,Ascella-Tau_Sgr,Tau_Sgr-Nunki,Nunki-Phi_Sgr,Phi_Sgr-Kaus_Media,Kaus_Media-Kaus_Borealis,Kaus_Borealis-Alnasl,Kaus_Media-Kaus_Australis,Acrux-Gacrux,Mimosa-Imai,Rigil_Kent-Hadar,Regulus-Algieba,Algieba-Adhafera,Adhafera-Rasalas,Rasalas-Algenubi,Algieba-Zosma,Zosma-Denebola,Zosma-Chertan,Chertan-Regulus,Castor-Pollux,Castor-Mebsuta,Mebsuta-Tejat,Pollux-Wasat,Wasat-Alzirr,Alzirr-Alhena,Sirius-Mirzam,Sirius-Wezen,Wezen-Adhara,Wezen-Aludra,Aldebaran-Gamma_Tau,Gamma_Tau-Ain,Aldebaran-Zeta_Tau,Zeta_Tau-Elnath,Markab-Scheat,Scheat-Alpheratz,Alpheratz-Algenib,Algenib-Markab,Alpheratz-Delta_And,Delta_And-Mirach,Mirach-Almach,Arcturus-Izar,Izar-Seginus,Arcturus-Muphrid,Zeta_Her-Eta_Her,Eta_Her-Pi_Her,Pi_Her-Sarin,Sarin-Kornephoros,Kornephoros-Zeta_Her,Gienah-Algorab,Algorab-Kraz,Kraz-Minkar,Minkar-Gienah,Mirfak-Algol,Mirfak-Gamma_Per,Mirfak-Epsilon_Per,Capella-Menkalinan,Menkalinan-Theta_Aur,Theta_Aur-Elnath,Elnath-Iota_Aur,Iota_Aur-Capella,Eltanin-Rastaban,Rastaban-Aldhibah,Aldhibah-Altais,Zubeneschamali-Zubenelgenubi,Spica-Porrima,Porrima-Vindemiatrix,Porrima-Heze,Heze-Spica,Procyon-Gomeisa';
  const STARS = CAT.split(';').map(s => { const a = s.split(','); return { n: a[0].replace(/_/g, ' '), ra: +a[1], de: +a[2], m: +a[3] }; });
  const IDX = {}; STARS.forEach((s, i) => { IDX[s.n] = i; });
  const SEG = LINES.split(',').map(l => l.split('-').map(n => IDX[n.replace(/_/g, ' ')])).filter(p => p[0] !== undefined && p[1] !== undefined);
  const WARM = /^(Betelgeuse|Antares|Aldebaran|Arcturus|Pollux|Alphard|Kochab|Schedar|Mirach|Eltanin|Sargas)$/, BLUE = /^(Rigel|Vega|Spica|Sirius|Regulus|Bellatrix|Achernar|Alnilam|Alnitak|Mintaka|Hadar|Mimosa|Acrux|Altair|Deneb|Adhara|Mirzam|Wezen|Saiph|Alioth)$/;
  STARS.forEach(s => { s.col = WARM.test(s.n) ? '255,196,150' : BLUE.test(s.n) ? '200,222,255' : '255,244,214'; s.ph = R(0, TAU); s.sp = R(.0012, .004); s.dl = Math.random(); });

  // ---------- real sky: RA/Dec (precessed from J2000) -> alt/az for a place, date and local hour ----------
  const julian = (y, mo, d, h) => { if (mo <= 2) { y--; mo += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + h / 24 + B - 1524.5; };
  function skyAt(date, hour, lat, lng) {
    const [y, mo, d] = date.split('-').map(Number), tz = Math.round(lng / 15), J = julian(y, mo, d, hour - tz), T = J - 2451545, yrs = T / 365.25;
    const lst = (280.46061837 + 360.98564736629 * T + lng) * D2R, phi = lat * D2R, pts = [];
    STARS.forEach((s, i) => {
      let ra = s.ra * 15 * D2R, de = s.de * D2R;
      const dra = (3.075 + 1.336 * Math.sin(ra) * Math.tan(de)) * 15 / 3600 * D2R * yrs, dde = 20.04 / 3600 * D2R * Math.cos(ra) * yrs;
      ra += dra; de += dde;
      const ha = lst - ra, alt = Math.asin(Math.sin(de) * Math.sin(phi) + Math.cos(de) * Math.cos(phi) * Math.cos(ha));
      const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(de) * Math.cos(phi)) + Math.PI;
      const r = (Math.PI / 2 - alt) / (Math.PI / 2);
      pts[i] = { s, i, alt: alt / D2R, az: az / D2R, x: -r * Math.sin(az), y: -r * Math.cos(az), up: alt > 0 };
    });
    const age = (((J - 2451550.1) / 29.530588853) % 1 + 1) % 1;
    return { pts, J, age, illum: (1 - Math.cos(TAU * age)) / 2 };
  }
  const moonName = a => a < .03 || a > .97 ? 'trăng non, đêm không trăng' : a < .22 ? 'trăng lưỡi liềm đầu tháng' : a < .28 ? 'trăng bán nguyệt, thượng huyền' : a < .47 ? 'trăng khuyết đang tròn dần' : a < .53 ? 'trăng tròn' : a < .72 ? 'trăng khuyết sau rằm' : a < .78 ? 'trăng bán nguyệt, hạ huyền' : 'trăng lưỡi liềm cuối tháng';
  function moonSvg(age) {
    const k = Math.cos(TAU * age), rx = Math.abs(k) * 20, wax = age < .5, sw = k > 0 ? 0 : 1;
    const lit = `M0 -20A20 20 0 0 1 0 20A${rx.toFixed(1)} 20 0 0 ${sw} 0 -20Z`;
    return `<svg class="ay-moon" viewBox="-24 -24 48 48" aria-hidden="true"><circle r="20" fill="#16264a" stroke="rgba(220,180,108,.55)" stroke-width="1.4"/><path d="${lit}" fill="#f4ecd0" ${wax ? '' : 'transform="scale(-1,1)"'}/></svg>`;
  }

  // ---------- sky painter: stars fly from `from` (polar around the centre) to their true place as k goes 0 -> 1 ----------
  const warmUp = (st) => { st.pts.forEach(p => { if (p.fr === undefined) { p.fr = Math.sqrt(Math.random()); p.fa = R(0, TAU); p.dl = Math.random() * .55; } }); return st; };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function makeDust(n) { const a = []; for (let i = 0; i < n; i++) a.push({ r: Math.sqrt(Math.random()), a: R(0, TAU), z: R(.3, 1.1), ph: R(0, TAU), sp: R(.001, .004) }); return a; }
  function paintSky(g, o) {
    const { cx, cy, rad, rot = 0, k = 1, t = 0, st, dust, far = 0, labels = false, lines = true, mx = 0, tw = true } = o;
    const home = (p, x, y) => ({ x: cx + rad * (x * Math.cos(rot) - y * Math.sin(rot)), y: cy + rad * (x * Math.sin(rot) + y * Math.cos(rot)) });
    if (dust) dust.forEach(d => {
      const a = d.a + rot * .7, rr = d.r * (far || rad), al = d.z * .5 * (tw ? .7 + .3 * Math.sin(t * d.sp + d.ph) : 1) * (o.dustA ?? 1);
      g.fillStyle = `rgba(214,226,250,${al})`; g.fillRect(cx + rr * Math.cos(a), cy + rr * Math.sin(a), d.z * 1.4, d.z * 1.4);
    });
    const pos = [];
    st.pts.forEach(p => {
      if (!p.up) return;
      const h = home(p, p.x, p.y);
      const e = k >= 1 ? 1 : ease(cl((k * 1.7 - p.dl) / 1));
      if (e >= 1) { pos[p.i] = { x: h.x, y: h.y, e }; return; }
      const fa = p.fa + t * .00006 * (far ? 1 : 2), fr = p.fr * (far || rad * 2.2);
      const fx = cx + fr * Math.cos(fa), fy = cy + fr * Math.sin(fa);
      pos[p.i] = { x: fx + (h.x - fx) * e, y: fy + (h.y - fy) * e, e };
    });
    if (lines && k > .55) {
      const la = cl((k - .55) / .45) * (o.lineA ?? .3);
      g.lineWidth = 1; g.strokeStyle = `rgba(141,168,208,${la})`; g.beginPath();
      SEG.forEach(([a, b]) => { const A = pos[a], B = pos[b]; if (A && B && A.e >= 1 && B.e >= 1) { g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); } });
      g.stroke();
    }
    st.pts.forEach(p => {
      const q = pos[p.i]; if (!q) return;
      const s = p.s, sz = cl(.7 + (3.3 - s.m) * .62, .7, 4.2) * (o.size || 1), a = (tw ? .82 + .18 * Math.sin(t * s.sp + s.ph) : 1) * cl(1.15 - p.alt * 0 + (p.alt < 12 && k >= 1 ? (p.alt - 12) / 30 : 0), .35, 1);
      if (s.m < 2.4) {
        const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, sz * 4.2);
        gr.addColorStop(0, `rgba(${s.col},${.5 * a})`); gr.addColorStop(1, `rgba(${s.col},0)`);
        g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, sz * 4.2, 0, TAU); g.fill();
      }
      g.fillStyle = `rgba(${s.col},${a})`; g.beginPath(); g.arc(q.x, q.y, sz, 0, TAU); g.fill();
      if (labels && k >= 1 && s.m < 1.3 && p.alt > 6) {
        g.font = `500 11px "Be Vietnam Pro", system-ui, sans-serif`; g.fillStyle = 'rgba(238,240,216,.88)'; const fl = q.x > cx + rad * .4; g.textAlign = fl ? 'right' : 'left'; g.fillText(s.n, q.x + (fl ? -sz - 5 : sz + 5), q.y + 4);
      }
    });
    return pos;
  }
  const fit = (cv, maxDpr) => { const dpr = Math.min(maxDpr, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } return { w, h, dpr }; };

  // ---------- where and when ----------
  const PLACES = [[/h[aà] n[oộ]i/i, 21.03, 105.85], [/[dđ][aà] n[aẵ]ng/i, 16.05, 108.2], [/hu[eế]/i, 16.46, 107.59], [/c[aầ]n th[oơ]/i, 10.04, 105.75]];
  function whereOf(c) {
    const pin = c.p.get('metPin', null), city = c.p.get('metCity', '') || c.config.couple.city || '';
    if (pin && typeof pin.lat === 'number' && typeof pin.lng === 'number') return { lat: pin.lat, lng: pin.lng, name: /h[oồ] chí minh|sài gòn|hcm/i.test(city) ? 'Sài Gòn' : city, exact: true };
    const f = PLACES.find(x => x[0].test(city));
    return f ? { lat: f[1], lng: f[2], name: city, exact: false } : { lat: 10.78, lng: 106.7, name: /h[oồ] chí minh|sài gòn|hcm/i.test(city) ? 'Sài Gòn' : city, exact: false };
  }
  const HOUR = 21;
  const fmtD = s => s.split('-').reverse().join('.');
  function skies(c) {
    const w = whereOf(c), out = {};
    if (c.p.has('metDate')) out.met = { ...w, date: c.p.raw.metDate, label: 'Bầu trời đêm ấy', st: warmUp(skyAt(c.p.raw.metDate, HOUR, w.lat, w.lng)) };
    out.wed = { ...w, date: c.data.date, label: 'Bầu trời đêm cưới', st: warmUp(skyAt(c.data.date, HOUR, w.lat, w.lng)) };
    return out;
  }
  const capOf = s => `${s.name ? s.name + ' · ' : ''}${fmtD(s.date)} · ${HOUR}:00`;

  // ---------- brass astrolabe (SVG, viewBox centred on the origin) ----------
  const ticks = (r, n, every, a, b) => { let d = ''; for (let i = 0; i < n; i++) { const an = i / n * TAU, l = i % every ? a : b, s = Math.sin(an), co = -Math.cos(an); d += `M${(r * s).toFixed(1)} ${(r * co).toFixed(1)}L${((r + l) * s).toFixed(1)} ${((r + l) * co).toFixed(1)}`; } return d; };
  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  function astro(uid, cls = '') {
    const g = `ayBr${uid}`;
    let num = ''; ROMAN.forEach((r, i) => { const a = i / 12 * TAU; num += `<text x="${(170 * Math.sin(a)).toFixed(1)}" y="${(-170 * Math.cos(a)).toFixed(1)}" transform="rotate(${i * 30} ${(170 * Math.sin(a)).toFixed(1)} ${(-170 * Math.cos(a)).toFixed(1)})" text-anchor="middle" dominant-baseline="central">${r}</text>`; });
    let teeth = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, s = Math.sin(a), co = -Math.cos(a), n = Math.sin(a + .1), nc = -Math.cos(a + .1); teeth += `M${(133 * s).toFixed(1)} ${(133 * co).toFixed(1)}L${(147 * (s + n) / 2 * 1.0).toFixed(1)} ${(147 * (co + nc) / 2).toFixed(1)}L${(133 * n).toFixed(1)} ${(133 * nc).toFixed(1)}`; }
    return `<svg class="ay-astro ${cls}" viewBox="-206 -240 412 446" role="img" aria-label="Chiếc thiên bàn bằng đồng" focusable="false">
      <defs><linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="-190" y1="-190" x2="190" y2="190"><stop offset="0" stop-color="#f6e0a4"/><stop offset=".35" stop-color="#c79f58"/><stop offset=".6" stop-color="#8d6b30"/><stop offset=".85" stop-color="#e2c27c"/><stop offset="1" stop-color="#a9823f"/></linearGradient></defs>
      <g class="ay-throne" fill="none" stroke="url(#${g})"><circle cx="0" cy="-226" r="12" stroke-width="5"/><path d="M-9 -210h18v10h-18z" fill="#b98f4a" stroke="none"/></g>
      <g class="ay-r1"><circle r="196" fill="none" stroke="url(#${g})" stroke-width="14"/><path d="${ticks(192, 72, 2, 3, 6)}" stroke="#3a2a0e" stroke-width="1" fill="none"/></g>
      <g class="ay-r2"><circle r="170" fill="none" stroke="url(#${g})" stroke-width="22"/><circle r="181" fill="none" stroke="#3a2a0e" stroke-opacity=".5" stroke-width=".8"/><circle r="159" fill="none" stroke="#3a2a0e" stroke-opacity=".5" stroke-width=".8"/><g fill="#2c200b" font-family="Cormorant Garamond, serif" font-weight="600" font-size="15">${num}</g></g>
      <g class="ay-r3"><circle r="132" fill="none" stroke="url(#${g})" stroke-width="12"/><path d="${teeth}" fill="#c79f58" stroke="#3a2a0e" stroke-width=".6" stroke-opacity=".6"/></g>
      <circle r="125" fill="none" stroke="url(#${g})" stroke-width="3"/>
      <g class="ay-plate" fill="none" stroke="#8da8d0" stroke-opacity=".32" stroke-width=".8" stroke-dasharray="2 4"><circle r="83"/><circle r="42"/><path d="M-125 0H125M0 -125V125"/></g>
      <g class="ay-card" fill="#dcb46c" font-family="Cormorant Garamond, serif" font-weight="600" font-size="15" text-anchor="middle"><text y="-110" dominant-baseline="central">B</text><text y="110" dominant-baseline="central">N</text><text x="-110" dominant-baseline="central">Đ</text><text x="110" dominant-baseline="central">T</text></g>
      <g class="ay-al"><path d="M0 -150L5 -138L2.5 -126H-2.5L-5 -138ZM0 150L5 138L2.5 126H-2.5L-5 138Z" fill="url(#${g})" stroke="#3a2a0e" stroke-width=".6"/><path d="M-1.6 -126V126H1.6Z" fill="url(#${g})"/><circle r="8" fill="url(#${g})" stroke="#3a2a0e" stroke-width=".8"/><circle r="2.5" fill="#2c200b"/></g>
    </svg>`;
  }

  // ---------- backdrop: the wedding-night sky behind the whole page, turned by scroll and tilt ----------
  let back = null, backCv = null, scrollY0 = 0, fin = null;
  function startBackdrop(c) {
    if (back || !backCv) return;
    const sk = skies(c).wed, dust = makeDust(sc(230)); let tx = 0, ty = 0, last = '';
    const off = M.tilt(v => { tx = v.x; ty = v.y; });
    const g = backCv.getContext('2d'), star = [];
    back = M.loop((t) => {
      const { w, h, dpr } = fit(backCv, 1.5);
      const rot = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 2.4 + (M.reduced ? 0 : t * .000012) + tx * .12;
      const key = `${w}${h}${rot.toFixed(4)}${fin ? t | 0 : M.tier === 'low' || M.reduced ? 0 : (t / 60) | 0}`;
      if (key === last) return; last = key;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const cx = w / 2 + tx * -10, cy = h * .42 + ty * -8, far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.02;
      paintSky(g, { cx, cy, rad: far, rot, st: sk.st, dust, far, k: 1, t, tw: M.tier !== 'low' && !M.reduced, lineA: .2, size: 1.1 });
      if (fin) drawFinale(g, w, h, t);
    });
    backCv._off = off;
  }
  function drawFinale(g, w, h, t) {
    if (fin.t0 === null) fin.t0 = t; const e = cl((t - fin.t0) / 2600), a = ease(e), cx = w / 2, cy = h * .46, sep = (1 - a) * Math.min(w * .36, 220);
    g.save(); g.globalCompositeOperation = 'lighter';
    [[-1, '240,196,230'], [1, '196,220,255']].forEach(([s, col]) => {
      const x = cx + s * sep, y = cy - (1 - a) * 40 * s, gr = g.createRadialGradient(x, y, 0, x, y, 46);
      gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 46, 0, TAU); g.fill();
    });
    if (e >= 1) { const p = cl((t - fin.t0 - 2600) / 1800), gr = g.createRadialGradient(cx, cy, 0, cx, cy, 40 + 220 * p); gr.addColorStop(0, `rgba(255,236,190,${.9 * (1 - p)})`); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 40 + 220 * p, 0, TAU); g.fill(); }
    g.restore();
  }
  function afterOpen(c) { setTier(); html.classList.add('ay-open'); startBackdrop(c); }

  // scroll-driven ring turning: one CSS var drives every ring on the page
  let sy = 0, raf = 0;
  addEventListener('scroll', () => { sy = scrollY; if (!raf) raf = requestAnimationFrame(() => { raf = 0; html.style.setProperty('--ay-s', Math.round(sy)); }); }, { passive: true });

  // ---------- cover ----------
  EA.cover((el, c, open) => {
    const { data: D, esc: e } = c, sk = skies(c), S = sk.met || sk.wed, hasMet = !!sk.met;
    setTier(); el.classList.remove('ay-lift');
    el.innerHTML = `<div class="ay-stage">
      <canvas class="ay-field" aria-hidden="true"></canvas>
      <div class="ay-txt">
        <p class="ay-to">Gửi ${e(c.guest)}</p>
        <h1 class="ay-names"><span class="n">${e(D.bride.name)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(D.groom.name)}</span></h1>
        <p class="ay-date">${c.dow} · ${c.d} · ${c.m} · ${c.y}</p>
      </div>
      <div class="ay-mid">${astro('c', 'ay-cover-astro')}<div class="ay-grab" aria-hidden="true"></div></div>
      <p class="ay-egg" role="status"></p>
      <div class="ay-ui"><p class="ay-hint">${hasMet ? 'Xoay chiếc vòng đồng để trở về đêm ấy' : 'Xoay chiếc vòng đồng để khóa bầu trời đêm cưới'}</p><p class="ay-cap" aria-live="polite">${e(S.label)} · ${e(capOf(S))}</p><button class="open-btn" type="button">Khóa bầu trời</button></div>
    </div>`;
    const q = s => el.querySelector(s), stage = q('.ay-stage'), cv = q('.ay-field'), svg = q('.ay-astro'), grab = q('.ay-grab'), g = cv.getContext('2d');
    const rings = [q('.ay-r1'), q('.ay-r2'), q('.ay-r3'), q('.ay-al')], mult = [1, -1.5, 2.2, 3.1], idle = [.004, -.006, .009, .013];
    const ang = [0, 0, 0, 0]; let go = false, music = false, k = 0, spin = 0, last = null, dragging = false, geo = { cx: 0, cy: 0, s: 1 };
    const dust = makeDust(sc(190));
    const apply = () => rings.forEach((r, i) => { r.style.transform = `rotate(${ang[i]}deg)`; });
    const measure = () => { const r = svg.getBoundingClientRect(), cr = cv.getBoundingClientRect(), s = r.width / 412; geo = { cx: r.left - cr.left + 206 * s, cy: r.top - cr.top + 240 * s, s }; };
    const stop = M.loop((t, dt) => {
      if (!cv.clientWidth) return;
      const { w, h, dpr } = fit(cv, 1.5); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      measure(); const pr = 125 * geo.s;
      if (!go && !dragging && !c.reduced) { idle.forEach((v, i) => { ang[i] += v * dt; }); apply(); }
      // the plate: a deep-blue disc the real sky will fill
      const pg = g.createRadialGradient(geo.cx, geo.cy, 0, geo.cx, geo.cy, pr); pg.addColorStop(0, '#0b2149'); pg.addColorStop(.8, '#071630'); pg.addColorStop(1, '#17305e');
      g.fillStyle = pg; g.beginPath(); g.arc(geo.cx, geo.cy, pr, 0, TAU); g.fill();
      const far = Math.hypot(w, h) * .55;
      paintSky(g, { cx: geo.cx, cy: geo.cy, rad: pr - 4, far, k, t, st: S.st, dust, dustA: 1 - k * .8, lines: true, labels: k >= 1, lineA: .55, size: Math.max(.8, geo.s * .9) });
    }, { el: stage });
    const offTilt = M.tilt(v => { cv.style.transform = `translate(${v.x * -8}px,${v.y * -6}px) scale(1.04)`; });
    const cleanup = () => { stop(); offTilt(); };

    // the wow: rings whirl and lock, then the true sky gathers inside the plate
    const wow = () => {
      if (go) return; go = true; stage.classList.add('going');
      M.requestTilt(); if (!music) { music = true; EA.music(); }
      M.haptic('tap'); M.tone('whoosh');
      const from = ang.slice(), to = from.map((a, i) => Math.round(a / 360) * 360 + (i % 2 ? -1 : 1) * (1080 + i * 360));
      const finish = () => { el.classList.add('ay-lift'); open(); afterOpen(c); c.after(1100, cleanup); };
      if (c.reduced) { rings.forEach(r => { r.style.transform = 'none'; }); k = 1; stage.classList.add('locked', 'seen'); c.after(300, finish); return; }
      M.tween(0, 1, 1450, 'out', v => { ang.forEach((_, i) => { ang[i] = from[i] + (to[i] - from[i]) * v; }); apply(); }).then(() => {
        ang.forEach((_, i) => { ang[i] = 0; }); rings.forEach(r => { r.style.transform = 'none'; });
        stage.classList.add('locked'); M.haptic('thud'); M.tone('click');
      });
      c.after(1050, () => {
        M.tween(0, 1, 2000, 'inOut', v => { k = v; });
        c.after(450, () => stage.classList.add('seen'));
        c.after(1700, () => { M.haptic('success'); M.tone('chime'); });
        c.after(2750, finish);
      });
    };
    // rotation gesture: turn the outer ring around the centre
    const angAt = ev => Math.atan2(ev.clientY - (svg.getBoundingClientRect().top + 240 * geo.s), ev.clientX - (svg.getBoundingClientRect().left + 206 * geo.s));
    grab.addEventListener('pointerdown', ev => { if (go) return; if (!music) { music = true; EA.music(); M.requestTilt(); } dragging = true; last = angAt(ev); grab.setPointerCapture?.(ev.pointerId); M.haptic('tap'); });
    grab.addEventListener('pointermove', ev => {
      if (!dragging || go) return;
      const a = angAt(ev); let d = a - last; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; last = a;
      spin += Math.abs(d); const deg = d / D2R; ang.forEach((_, i) => { ang[i] += deg * mult[i]; }); apply();
      if (Math.floor(spin / .52) !== Math.floor((spin - Math.abs(d)) / .52)) M.tone('click');
      if (spin > 4.9) { dragging = false; wow(); }
    });
    const up = () => { dragging = false; };
    grab.addEventListener('pointerup', up); grab.addEventListener('pointercancel', up);
    q('.open-btn').addEventListener('click', wow, { once: true });
    if (c.reduced) { rings.forEach(r => { r.style.transform = 'none'; }); }
  });

  // ---------- sections ----------
  const head = (eyebrow, title, sub) => `<header class="head"><p class="eyebrow">${eyebrow}</p><h2 class="title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</header>`;
  const chart = (id, s, extra = '') => `<figure class="ay-chart" data-sky="${id}">
      <div class="ay-disc"><canvas aria-hidden="true"></canvas>
        <svg class="ay-bezel" viewBox="-110 -110 220 220" aria-hidden="true"><defs><linearGradient id="ayBz${id}" gradientUnits="userSpaceOnUse" x1="-100" y1="-100" x2="100" y2="100"><stop offset="0" stop-color="#f6e0a4"/><stop offset=".4" stop-color="#c79f58"/><stop offset=".65" stop-color="#8d6b30"/><stop offset="1" stop-color="#e2c27c"/></linearGradient></defs>
          <g class="ay-rot"><circle r="100" fill="none" stroke="url(#ayBz${id})" stroke-width="12"/><path d="${ticks(97, 72, 2, 2.5, 5)}" stroke="#3a2a0e" stroke-width=".7" fill="none"/></g>
          <g fill="#f3e3b6" font-family="Cormorant Garamond, serif" font-weight="600" font-size="9" text-anchor="middle"><text y="-100" dominant-baseline="central">B</text><text y="100" dominant-baseline="central">N</text><text x="-100" dominant-baseline="central">Đ</text><text x="100" dominant-baseline="central">T</text></g></svg>
        <button class="ay-pin" type="button" aria-label="Điểm ngay trên đầu bạn, thiên đỉnh"><i></i></button>
      </div>
      <figcaption><b>${s.label}</b><span>${capOf(s)}</span>${extra}</figcaption>
    </figure>`;

  EA.section('hero', c => {
    const { config: { couple: cp }, esc: e, ui } = c, past = new Date(`${c.data.date}T23:59:00+07:00`) < Date.now();
    return `<div class="ay-hero">
      <div class="ay-hero-in">
        <p class="eyebrow">Hai vì sao giao nhau</p>
        <div class="ay-emblem">${astro('h', 'ay-spin')}<h1 class="ay-names"><span class="n">${e(cp.brideName)}</span><span class="amp" aria-hidden="true">&amp;</span><span class="n">${e(cp.groomName)}</span></h1></div>
        <p class="headline">${c.t(cp.headline)}</p>
        <p class="ay-hdate">${c.dow} · ${c.d} · ${c.m} · ${c.y}${cp.city ? ` · ${e(cp.city)}` : ''}</p>
        ${past ? `<p class="ay-home">Đã về chung một nhà · ${c.d}.${c.m}.${c.y}</p>` : c.mod.content.showCountdown !== false ? ui.countdown() : ''}
      </div>
    </div>`;
  });

  // story as a log of coordinates: each chapter is a star on one thread
  EA.section('story', ({ esc: e, mod, d, m, y }) => {
    const chs = mod.content.chapters || []; if (!chs.length) return '';
    const star = '<svg class="ay-node" viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0-10L2.4-2.4L10 0L2.4 2.4L0 10L-2.4 2.4L-10 0L-2.4-2.4Z" fill="currentColor"/></svg>';
    return `<div class="wrap">
      ${head('Nhật ký hành trình', e(mod.content.title || 'Chuyện của chúng mình'))}
      <ol class="ay-log">${chs.map((ch, i) => `<li class="ay-ent">${star}<article>
        ${ch.image ? `<div class="pic"><img src="${e(ch.image)}" alt="" loading="lazy"></div>` : ''}
        <p class="ay-when">${e(ch.date)}</p><h3>${e(ch.title)}</h3><p>${e(ch.text)}</p></article></li>`).join('')}
        <li class="ay-ent final">${star}<article><p class="ay-when">Điểm hẹn cuối cùng</p><h3>${+d} tháng ${+m}, ${y}</h3><p>Có bạn trong bầu trời của chúng mình thì mới trọn vẹn.</p></article></li></ol>
      ${mod.content.quote ? `<p class="story-quote">${e(mod.content.quote)}</p>` : ''}
    </div>`;
  });

  // RSVP: a small dial whose needle swings to the mark when the guest says yes
  EA.section('rsvp', ({ ui }) => `<div class="wrap narrow">
    ${head('Hẹn gặp bạn', 'Bạn sẽ đến chứ?', 'Chúng mình giữ cho bạn một chỗ dưới bầu trời hôm ấy')}
    <div class="ay-dial" aria-hidden="true"><svg viewBox="-60 -60 120 120"><circle r="52" fill="none" stroke="#c79f58" stroke-width="4"/><circle r="44" fill="none" stroke="rgba(220,180,108,.4)" stroke-width="1"/><path d="${ticks(46, 36, 3, 3, 6)}" stroke="#dcb46c" stroke-width="1" fill="none"/><path class="mark" d="M0 -58L4 -50H-4Z" fill="#f4e4b0"/><g class="needle"><path d="M0 -40L4 0L0 10L-4 0Z" fill="#dcb46c"/><circle r="4" fill="#f4e4b0"/></g></svg></div>
    <div class="rsvp-card">${ui.rsvpForm()}</div>
  </div>`);

  EA.section('thanks', ({ data: D, esc: e, dateText, mod, guest }) => `<div class="wrap narrow">
    <div class="ay-newstar" aria-hidden="true"><svg viewBox="-60 -60 120 120"><path class="ns" d="M0-46L9-9L46 0L9 9L0 46L-9 9L-46 0L-9-9Z" fill="#f4e4b0"/><circle r="3" fill="#fff"/></svg></div>
    <p class="eyebrow">Cảm ơn bạn</p>
    <p class="mono">${e(D.monogram)}</p>
    <p>${e(D.thanks)}</p>
    <p class="ay-finale-t" aria-live="polite">Một vì sao mới vừa sáng lên, mang tên ${e(guest)}.</p>
    ${mod.content.signature ? `<p class="signature">${e(mod.content.signature)}</p>` : ''}
    <p class="kicker">${dateText}</p>
    <div class="actions center"><button class="btn" type="button" id="reopen">Xoay lại thiên bàn ${EA.icon('replay')}</button><a class="btn ghost" href="#top">Về đầu trang ${EA.icon('up')}</a></div>
  </div>`);

  // ---------- add-ons ----------
  function addSection(main, id, inner, afterSel) {
    const s = document.createElement('section'); s.id = id; s.className = `sec ay-add m-${id}`; s.innerHTML = `<div class="wrap">${inner}</div>`;
    const ref = afterSel.map(x => main.querySelector(x)).find(Boolean);
    if (ref) ref.after(s); else (main.querySelector('.m-rsvp') ? main.querySelector('.m-rsvp').before(s) : main.appendChild(s));
    return s;
  }
  function wireChart(fig, s, c, egg) {
    const cv = fig.querySelector('canvas'), g = cv.getContext('2d'), pick = fig.querySelector('figcaption'), pin = fig.querySelector('.ay-pin');
    let k = M.reduced ? 1 : 0, pos = [], sel = -1, dirty = true, rot = 0;
    const dust = makeDust(sc(60)), base = pick.innerHTML;
    M.loop((t) => {
      const { w, h, dpr } = fit(cv, 1.75); if (!w) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 * .905;
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
      const bg = g.createRadialGradient(cx, cy, 0, cx, cy, r); bg.addColorStop(0, '#081a3c'); bg.addColorStop(.7, '#0a1f45'); bg.addColorStop(1, '#27437a');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(141,168,208,.22)'; g.setLineDash([2, 5]); g.lineWidth = 1; [1 / 3, 2 / 3].forEach(f => { g.beginPath(); g.arc(cx, cy, r * f, 0, TAU); g.stroke(); });
      g.beginPath(); g.moveTo(cx - r, cy); g.lineTo(cx + r, cy); g.moveTo(cx, cy - r); g.lineTo(cx, cy + r); g.stroke(); g.setLineDash([]);
      pos = paintSky(g, { cx, cy, rad: r * .985, rot, k, t, st: s.st, dust, far: r, labels: w > 260, lineA: .5, size: Math.max(.85, r / 150), tw: M.tier !== 'low' && !M.reduced });
      if (sel >= 0 && pos[sel]) { const q = pos[sel]; g.strokeStyle = '#f4e4b0'; g.lineWidth = 1.2; g.beginPath(); g.arc(q.x, q.y, 9, 0, TAU); g.stroke(); }
      g.restore();
    }, { el: fig });
    fig._k = v => { k = v; };
    cv.addEventListener('click', ev => {
      const rc = cv.getBoundingClientRect(), x = ev.clientX - rc.left, y = ev.clientY - rc.top; let best = -1, bd = 22;
      s.st.pts.forEach(p => { const q = pos[p.i]; if (!q) return; const dd = Math.hypot(q.x - x, q.y - y) - (3.5 - p.s.m) * .6; if (dd < bd) { bd = dd; best = p.i; } });
      sel = best;
      if (best >= 0) { const p = s.st.pts[best]; M.tone('pop'); pick.innerHTML = `<b>${p.s.n}</b><span>độ sáng ${p.s.m.toFixed(1).replace('.', ',')} · cao ${Math.round(p.alt)}° trên đường chân trời</span>`; }
      else pick.innerHTML = base;
    });
    pin.addEventListener('click', () => egg(fig));
  }
  EA.afterRender((c, main) => {
    const { p, esc: e } = c, cov = document.getElementById('cover');
    setTier();
    backCv = Object.assign(document.createElement('canvas'), { className: 'ay-back' }); backCv.setAttribute('aria-hidden', 'true'); document.body.prepend(backCv);
    setTimeout(() => { if (cov.hidden) afterOpen(c); }, 80);

    const sk = skies(c), met = sk.met, wed = sk.wed, moonOf = s => `<span class="ay-moonrow">${moonSvg(s.st.age)}<em>${moonName(s.st.age)}, sáng ${Math.round(s.st.illum * 100)}%</em></span>`;
    const brightest = s => { const b = s.st.pts.filter(x => x.up && x.alt > 12).sort((a, b) => a.s.m - b.s.m)[0]; return b ? `<span class="ay-bright">Sao sáng nhất trên trời: <b>${b.s.n}</b>, cao ${Math.round(b.alt)}°</span>` : ''; };
    const eggTxt = () => p.get('insideJoke', 'Ngay trên đỉnh đầu là nơi hai vì sao gặp nhau.');
    const egg = fig => {
      let box = fig.querySelector('.ay-egg2'); if (!box) { box = document.createElement('p'); box.className = 'ay-egg2'; box.setAttribute('role', 'status'); fig.querySelector('.ay-disc').after(box); }
      box.textContent = eggTxt(); box.classList.add('on'); M.haptic('success'); M.tone('chime'); clearTimeout(box._t); box._t = setTimeout(() => box.classList.remove('on'), 5200);
    };
    const days = p.daysTogether != null ? `<p class="ay-days" aria-label="${p.daysTogether} ngày, bầu trời đã quay ${p.daysTogether} vòng"><b data-n="${p.daysTogether}">0</b><span>vòng quay của bầu trời, kể từ đêm ấy</span></p>` : '';
    const sec = addSection(main, 'sky', `${head(met ? 'Hai bầu trời' : 'Bầu trời cưới', met ? 'Bầu trời đêm ấy, và đêm cưới' : 'Bầu trời đêm cưới', `Các vì sao đúng như chúng hiện trên ${e(met ? (met.name || 'nơi hai bạn gặp nhau') : (wed.name || 'bầu trời Việt Nam'))} lúc ${HOUR} giờ tối. Chạm vào một ngôi sao để biết tên.`)}
      ${days}
      <div class="ay-charts">${met ? chart('met', met, `${moonOf(met)}${brightest(met)}`) : ''}${chart('wed', wed, `${moonOf(wed)}${brightest(wed)}`)}</div>
      <p class="ay-legend">B: Bắc · Đ: Đông · N: Nam · T: Tây</p>`, ['.m-story', '.m-saveDate', '.m-events']);
    sec.querySelectorAll('.ay-chart').forEach(fig => { wireChart(fig, fig.dataset.sky === 'met' ? met : wed, c, egg); });
    M.inView(sec, () => {
      sec.querySelectorAll('.ay-chart').forEach((fig, i) => { if (!M.reduced) setTimeout(() => M.tween(0, 1, 2200, 'inOut', v => fig._k(v)), i * 500); else fig._k(1); });
      const num = sec.querySelector('[data-n]'); if (num) M.tween(0, +num.dataset.n, 2200, 'out', v => { num.textContent = Math.round(v).toLocaleString('vi-VN'); });
    }, { threshold: .25 });

    // two hometowns, one Polaris: its height above the horizon equals your latitude
    const hp = p.get('hometownPins', null), ht = p.get('hometowns', null);
    if (hp && hp.bride && hp.groom && ht) {
      const km = p.kmBetween(hp.bride, hp.groom), one = (who, label) => {
        const lat = hp[who].lat, a = lat * D2R, x = 90 * Math.cos(a), y = -90 * Math.sin(a);
        return `<div class="ay-quad"><svg viewBox="-8 -108 124 116" aria-hidden="true"><path d="M0 0H100A100 100 0 0 0 ${(100 * Math.cos(a)).toFixed(1)} ${(-100 * Math.sin(a)).toFixed(1)}Z" fill="rgba(220,180,108,.1)" stroke="rgba(220,180,108,.5)"/><path d="M0 0H100A100 100 0 0 0 0 -100Z" fill="none" stroke="#c79f58" stroke-width="2"/><path d="M0 0L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#f4e4b0" stroke-dasharray="3 3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#f4e4b0"/></svg><b>${Math.round(lat)}°</b><span>${label} · ${e(ht[who])}</span></div>`;
      };
      addSection(main, 'polaris', `${head('Hai quê, một ngôi sao', 'Sao Bắc Cực ở hai chân trời', 'Độ cao của sao Bắc Cực chính là vĩ độ nơi bạn đứng.')}
        <div class="ay-quads">${one('bride', 'Quê cô dâu')}${one('groom', 'Quê chú rể')}</div>
        ${km ? `<p class="ay-km">Hai quê cách nhau <b>${Math.round(km).toLocaleString('vi-VN')} km</b>, và cùng nhìn lên một ngôi sao.</p>` : ''}`, ['#sky', '.m-story']);
    }

    // the song runs round a brass ring
    if (p.has('song.title')) {
      const t = `${p.get('song.title')}${p.has('song.artist') ? ' · ' + p.get('song.artist') : ''}`, lyric = p.get('song.lyric', '');
      const sec2 = addSection(main, 'ost', `${head('Bài hát của hai đứa', 'Giai điệu của chúng mình')}
        <div class="ay-ring"><svg viewBox="-110 -110 220 220" aria-hidden="true"><defs><path id="ayTp" d="M-82 0a82 82 0 1 1 164 0a82 82 0 1 1 -164 0"/></defs><g class="ay-rot2"><circle r="100" fill="none" stroke="#c79f58" stroke-width="6"/><circle r="64" fill="none" stroke="rgba(220,180,108,.4)"/><text fill="#f4e4b0" font-family="Cormorant Garamond, serif" font-weight="600" font-size="15" letter-spacing="2"><textPath href="#ayTp" startOffset="0" textLength="508" lengthAdjust="spacing">${e(t + '  ·  ')}</textPath></text></g></svg><button class="ay-play" type="button" data-ost aria-label="Bật nhạc">${EA.icon('play')}</button></div>
        <p class="ay-lyric" aria-live="polite">${lyric ? e(lyric) : ''}</p>`, ['#polaris', '#sky', '.m-story']);
      sec2.querySelector('[data-ost]').addEventListener('click', ev => { EA.music(); M.tone('pop'); M.haptic('tap'); ev.currentTarget.innerHTML = EA.icon('note'); sec2.classList.add('playing'); });
    }

    main.querySelectorAll('form.rsvp-form').forEach(form => form.addEventListener('change', () => {
      const yes = form.attending.value === 'yes', d = main.querySelector('.ay-dial');
      if (d && d.classList.contains('lock') !== yes) { d.classList.toggle('lock', yes); if (yes) { M.tone('click'); M.haptic('tap'); } }
    }));
  });

  // finale: two stars drift together over the page and a new one, named for the guest, is born
  EA.onRsvp(() => {
    if (html.classList.contains('ay-finale')) return;
    html.classList.add('ay-finale'); M.haptic('success'); M.tone('chime');
    fin = { t0: null };
    const th = document.getElementById('thanks');
    setTimeout(() => th?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'center' }), 700);
  });
})();
