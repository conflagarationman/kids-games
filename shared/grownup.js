// Grown-up play-time timer, shared by every page. One clock across all the games (localStorage, key below).
// API: KidsGrownup.register({ setVolume(v), pause() })  - a game calls this once;
//      KidsGrownup.mountPanel(container)                - renders the "Play time" controls (any [data-kg-panel] is mounted automatically).
(() => {
  if (window.KidsGrownup) return;

  const KEY = 'kidsGames.grownup.v1';
  const DEBUG = /[?&]debug/.test(location.search), FAST = DEBUG && /[?&]fast/.test(location.search); // fast: a minute lasts a second
  const MIN = 60000, WIND = 2 * MIN, AWAY = 6 * 3600 * 1000, TICK = 500, SAVE_MS = 5000, MAX_STEP = 1500;
  const DIM_MAX = 0.25, VOL_MIN = 0.6;
  const PRESETS = [10, 15, 20, 30, 45, 60], SHOWS = ['ring', 'ring+minutes', 'hidden'];
  const SHOW_LABELS = { ring: 'Ring', 'ring+minutes': 'Ring + minutes', hidden: 'Hidden' };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- State ----------
  let st = { limit: 0, show: 'ring', remainingMs: 0, lastTick: Date.now(), state: 'playing' };
  let lastSave = 0;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const save = () => { lastSave = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  function adopt(o) {
    if (!o || typeof o !== 'object') return false;
    const lim = Math.round(+o.limit);
    st.limit = lim >= 5 && lim <= 120 ? lim : 0;
    st.show = SHOWS.includes(o.show) ? o.show : 'ring';
    st.remainingMs = clamp(+o.remainingMs || 0, 0, 24 * 3600 * 1000);
    st.lastTick = +o.lastTick || 0;
    return true;
  }
  const stateFor = () => !st.limit ? 'playing' : st.remainingMs <= 0 ? 'goodnight' : st.remainingMs <= WIND ? 'winding' : 'playing';
  const windP = () => st.state === 'goodnight' ? 1 : st.state === 'winding' ? 1 - st.remainingMs / WIND : 0;
  const minutesLeft = () => Math.ceil(st.remainingMs / MIN);
  function newSession() { st.remainingMs = st.limit * MIN; st.lastTick = Date.now(); }

  // The clock only counts while a page is visible; a long gap (sleeping tablet) counts for at most MAX_STEP.
  function account(now) {
    const gap = now - st.lastTick;
    if (st.limit && gap > AWAY) newSession(); // a new day: no reset needed
    else if (st.limit && st.state !== 'goodnight' && gap > 0) st.remainingMs = Math.max(0, st.remainingMs - Math.min(gap, MAX_STEP) * (FAST ? 60 : 1));
    st.lastTick = now;
  }
  function tick() {
    if (document.hidden || !st.limit) return;
    account(Date.now());
    update();
    if (Date.now() - lastSave >= SAVE_MS) save();
  }
  function refresh() { // coming back to the page, or another page changed the settings
    if (adopt(read())) { const now = Date.now(); if (st.limit && now - st.lastTick > AWAY) newSession(); st.lastTick = now; }
    update();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (st.limit) { account(Date.now()); save(); } } else refresh();
  });
  addEventListener('pagehide', () => { if (st.limit) { account(Date.now()); save(); } });
  addEventListener('storage', e => { if (e.key === KEY) refresh(); });

  // ---------- Game hook ----------
  let hook = null, sentV = 1;
  const call = (fn, ...a) => { try { hook && hook[fn] && hook[fn](...a); } catch (e) {} };
  function register(h) {
    hook = h || null;
    if (st.state === 'goodnight') call('pause'); else if (sentV !== 1) call('setVolume', sentV);
  }

  // ---------- Pieces ----------
  const SPARK = '<svg viewBox="-12 -12 24 24"><path d="M0-11Q1.6-2.4 11 0Q1.6 2.4 0 11Q-1.6 2.4-11 0Q-1.6-2.4 0-11Z"/></svg>';
  const el = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; };

  // ---------- Countdown ring (26px, never a control) ----------
  const C = 2 * Math.PI * 9.5;
  let ring = null, arc, ringG, moonG, lab;
  function ensureRing() {
    if (ring) return;
    ring = el('kg-ring', `<svg viewBox="0 0 26 26" aria-hidden="true"><defs><mask id="kgRm"><rect width="26" height="26" fill="#fff"/><circle cx="18" cy="9.5" r="7.6" fill="#000"/></mask></defs>
      <circle cx="13" cy="13" r="13" fill="rgba(43,45,92,.3)"/>
      <g class="ringG"><circle cx="13" cy="13" r="9.5" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3.4"/>
      <circle class="arc" cx="13" cy="13" r="9.5" fill="none" stroke="#fff3bf" stroke-width="3.4" stroke-linecap="round" transform="rotate(-90 13 13)" stroke-dasharray="${C}" stroke-dashoffset="0"/></g>
      <g class="moon" style="opacity:0"><circle cx="12.5" cy="13.5" r="9" fill="#ffe9a3" mask="url(#kgRm)"/>
      <path class="twinkle" d="M21 1.6Q21.4 4.2 24 4.6Q21.4 5 21 7.6Q20.6 5 18 4.6Q20.6 4.2 21 1.6Z" fill="#fff3bf"/></g></svg><b></b>`);
    arc = ring.querySelector('.arc'); ringG = ring.querySelector('.ringG'); moonG = ring.querySelector('.moon'); lab = ring.querySelector('b');
    document.body.appendChild(ring);
  }
  function renderRing(p) {
    const want = st.limit > 0 && st.show !== 'hidden' && st.state !== 'goodnight';
    if (!want) { if (ring) ring.classList.remove('on'); return; }
    ensureRing(); ring.classList.add('on');
    arc.style.strokeDashoffset = C * (1 - clamp(st.remainingMs / (st.limit * MIN), 0, 1));
    const m = clamp(p * 8, 0, 1); // ring hands over to the moon in the first part of the wind-down
    ringG.style.opacity = 1 - m; moonG.style.opacity = m; moonG.style.transform = `scale(${(0.55 + 0.5 * p).toFixed(3)})`;
    lab.textContent = st.show === 'ring+minutes' && p === 0 ? minutesLeft() : '';
  }

  // ---------- Dusk tint ----------
  let dim = null;
  function renderDim(p) {
    if (!dim) { if (!p) return; dim = el('kg-dim'); document.body.appendChild(dim); dim.offsetWidth; }
    dim.style.opacity = (DIM_MAX * p).toFixed(3);
  }

  // ---------- Goodnight scene ----------
  const MOON = `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><mask id="kgNm"><rect width="200" height="200" fill="#fff"/><circle cx="134" cy="80" r="74" fill="#000"/></mask>
    <radialGradient id="kgNg" cx="30%" cy="30%" r="85%"><stop offset="0" stop-color="#fffbe3"/><stop offset="1" stop-color="#ffd780"/></radialGradient></defs>
    <g mask="url(#kgNm)"><circle cx="92" cy="108" r="80" fill="url(#kgNg)"/><circle cx="50" cy="132" r="11" fill="#f0c066" opacity=".5"/><circle cx="64" cy="70" r="7" fill="#f0c066" opacity=".45"/><circle cx="36" cy="100" r="5" fill="#f0c066" opacity=".45"/></g>
    <path d="M30 112q7 8 15 0" fill="none" stroke="#b98a3e" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="30" cy="128" rx="8" ry="5.5" fill="#ff9fb8" opacity=".6"/></svg>`;
  // Dozy: an original sleepy little cloud-lamb in a nightcap, hugging a star
  const FRIEND = `<svg viewBox="0 0 300 260" aria-hidden="true">
    <ellipse cx="150" cy="246" rx="118" ry="13" fill="rgba(20,10,60,.28)"/>
    <g fill="#fffaff" stroke="#e8def9" stroke-width="3">
      <circle cx="82" cy="182" r="44"/><circle cx="218" cy="182" r="44"/><circle cx="116" cy="214" r="38"/><circle cx="184" cy="214" r="38"/><circle cx="150" cy="176" r="58"/></g>
    <g fill="#fffaff"><circle cx="82" cy="182" r="41"/><circle cx="218" cy="182" r="41"/><circle cx="116" cy="214" r="35"/><circle cx="184" cy="214" r="35"/><circle cx="150" cy="176" r="55"/></g>
    <path d="M226 188 q22 -16 14 -40" fill="none" stroke="#fff" stroke-width="0"/>
    <ellipse cx="96" cy="122" rx="15" ry="22" fill="#ffc2b8" transform="rotate(24 96 122)"/><ellipse cx="204" cy="122" rx="15" ry="22" fill="#ffc2b8" transform="rotate(-24 204 122)"/>
    <circle cx="150" cy="128" r="52" fill="#ffe7cf" stroke="#fff" stroke-width="4"/>
    <path d="M122 126q10 9 20 0M158 126q10 9 20 0" fill="none" stroke="#2b2d5c" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M124 124l-5 -4M176 124l5 -4" stroke="#2b2d5c" stroke-width="3" stroke-linecap="round"/>
    <circle cx="118" cy="146" r="9" fill="#ff9fc0" opacity=".65"/><circle cx="182" cy="146" r="9" fill="#ff9fc0" opacity=".65"/>
    <path d="M143 148q7 6 14 0" fill="none" stroke="#c4566e" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M104 98C108 62 168 44 214 80 L200 106C170 88 134 92 104 98Z" fill="#ff8fc7" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M112 74q36-22 78-6" fill="none" stroke="#ffb8de" stroke-width="5" stroke-linecap="round"/>
    <rect x="98" y="94" width="108" height="17" rx="8.5" fill="#fff6c4" stroke="#fff" stroke-width="2"/>
    <path transform="translate(218 84) scale(.95)" d="M0-17 5-5 18-5 8 3 12 16 0 8-12 16-8 3-18-5-5-5Z" fill="#ffd23f" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>
    <g transform="translate(150 206)"><path d="M0-30 9-10 31-10 13 4 20 27 0 14-20 27-13 4-31-10-9-10Z" fill="#ffd23f" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-34 -4q12 -16 26 -2M34 -4q-12 -16 -26 -2" fill="none" stroke="#ffe7cf" stroke-width="13" stroke-linecap="round"/></g></svg>
    <span class="kg-zz">z</span><span class="kg-zz">z</span><span class="kg-zz">Z</span>`;
  let night = null, gear, mini, sky, ac = null, outG = null, lullabyWanted = false, lulling = false;
  function ensureNight() {
    if (night) return;
    night = el('kg-night');
    sky = el('kg-sky');
    // a fixed handful of stars, spread with a golden-ratio sequence so they never clump
    for (let i = 0; i < 46; i++) {
      const s = el('kg-star', SPARK);
      s.style.cssText = `left:${(i * 61.8 + 7) % 100}%;top:${(i * 38.2 * 1.7 + (i % 5) * 9) % 78}%;--s:${[10, 14, 18, 24][i % 4]}px;--d:${2 + (i % 7) * 0.45}s;--l:${-(i % 9) * 0.6}s`;
      sky.appendChild(s);
    }
    const moon = el('kg-moon', MOON);
    const hill = el('kg-hill');
    const scene = el('kg-scene');
    scene.appendChild(el('kg-friend', FRIEND));
    const h = document.createElement('h1'); h.className = 'kg-title'; h.textContent = 'Goodnight!';
    scene.appendChild(h);
    night.append(sky, moon, hill, scene);
    gear = document.createElement('button');
    gear.className = 'kg-gear'; gear.setAttribute('aria-label', 'Grown-up settings (press and hold)'); gear.innerHTML = '⚙️<span class="ring"></span>';
    night.appendChild(gear);
    document.body.appendChild(night);
    // taps sparkle; they never bring the game back
    let lastSpark = 0, lastNote = 0;
    const spark = (e, sound) => {
      const now = performance.now();
      if (now - lastSpark < 70 || sky.querySelectorAll('.kg-spark').length > 30) return;
      lastSpark = now;
      const s = el('kg-spark', SPARK); s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.color = ['#fff2a8', '#ffd0ec', '#cfe6ff', '#d9ccff'][(Math.random() * 4) | 0];
      s.addEventListener('animationend', () => s.remove());
      sky.appendChild(s);
      if (sound && now - lastNote > 140) { lastNote = now; tinkle(); }
    };
    night.addEventListener('pointerdown', e => { if (e.target.closest('.kg-gear')) return; e.preventDefault(); e.stopPropagation(); wakeAudio(); spark(e, true); });
    night.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') { e.stopPropagation(); if (!e.target.closest('.kg-gear')) spark(e, false); } });
    // the same press-and-hold as every game's gear
    let holdT = null;
    const endHold = () => { gear.classList.remove('holding'); clearTimeout(holdT); };
    gear.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); gear.classList.add('holding'); clearTimeout(holdT); holdT = setTimeout(() => { endHold(); openMini(); }, 1500); });
    gear.addEventListener('pointerup', endHold); gear.addEventListener('pointerleave', endHold); gear.addEventListener('pointercancel', endHold);
    night.offsetWidth;
  }
  function openMini() {
    if (!mini) {
      mini = el('kg-mini', `<div class="kg-card"><h2>Bedtime</h2><p>Press and hold the ⚙️ to get back here.</p><div class="kg-grid">
        <button class="kg-btn" data-a="5">⏰ +5 minutes</button><button class="kg-btn" data-a="15">⏰ +15 minutes</button>
        <button class="kg-btn" data-a="new">🌙 New session</button><button class="kg-btn" data-a="off">🔓 Turn the limit off</button></div>
        <button class="kg-btn close" data-a="close">Back to bedtime</button></div>`);
      mini.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'), a = b && b.dataset.a;
        if (e.target === mini || a === 'close') { mini.classList.remove('open'); return; }
        if (!a) return;
        if (a === 'off') { st.limit = 0; newSession(); }
        else if (a === 'new') newSession();
        else st.remainingMs += +a * MIN;
        mini.classList.remove('open'); st.lastTick = Date.now(); update(); save();
      });
      document.body.appendChild(mini);
    }
    mini.classList.add('open');
  }

  // ---------- Lullaby: a music-box tune of a few bars, quiet, then silence ----------
  function wakeAudio() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; return false; }
    if (!outG) {
      outG = ac.createGain(); outG.gain.value = 1;
      const lim = ac.createDynamicsCompressor();
      lim.threshold.value = -12; lim.knee.value = 6; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.25;
      outG.connect(lim); lim.connect(ac.destination);
    }
    if (lullabyWanted && ac.state === 'running') { lullabyWanted = false; lullaby(); }
    return true;
  }
  function note(t, midi, dur, vol) {
    const f = 440 * Math.pow(2, (midi - 69) / 12), g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(outG);
    [[1, 1], [2, 0.22], [3, 0.06]].forEach(([m, a]) => { // a soft music-box: the note plus a couple of quiet overtones
      const o = ac.createOscillator(), og = ac.createGain();
      o.type = 'sine'; o.frequency.value = f * m; og.gain.value = a; o.connect(og).connect(g); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function tinkle() {
    if (!wakeAudio() || !ac || ac.state !== 'running') return;
    note(ac.currentTime, [84, 86, 88, 91, 93][(Math.random() * 5) | 0], 1.1, 0.035);
  }
  function lullaby() {
    // beats at 3/4: [midi, beats]; C pentatonic, gently falling
    const tune = [[64, 1], [67, 1], [69, 1], [67, 2], [64, 1], [62, 1], [64, 1], [67, 1], [60, 3],
      [69, 1], [72, 1], [69, 1], [67, 2], [64, 1], [62, 1], [64, 1], [62, 1], [60, 3.5]];
    const beat = 0.95; let t = ac.currentTime + 0.4, bar = 0;
    outG.gain.cancelScheduledValues(ac.currentTime); outG.gain.setValueAtTime(1, ac.currentTime);
    for (const [m, b] of tune) {
      note(t, m + 12, Math.max(1.4, b * beat * 1.6), 0.06);
      if (bar % 3 === 0) note(t, m - 24 < 36 ? m - 12 : m - 24, 2.6, 0.05); // a low note under the start of each bar
      bar += b; t += b * beat;
    }
    outG.gain.setValueAtTime(1, t); outG.gain.linearRampToValueAtTime(0, t + 2.2); // then silence
    lulling = true;
  }
  function hush() { lullabyWanted = false; if (ac && outG) { try { outG.gain.cancelScheduledValues(ac.currentTime); outG.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} } lulling = false; }

  // ---------- Putting it together ----------
  let nightOn = false, firstUpdate = true;
  function update() {
    const prev = st.state;
    st.state = stateFor();
    const p = windP();
    renderRing(p); renderDim(p);
    const v = 1 - (1 - VOL_MIN) * p;
    if (st.state !== 'goodnight' && Math.abs(v - sentV) > 0.004) { sentV = v; call('setVolume', v); }
    const wantNight = st.state === 'goodnight';
    if (wantNight && !nightOn) {
      nightOn = true; ensureNight();
      night.classList.toggle('quick', firstUpdate); night.classList.add('on');
      call('pause');
      if (!firstUpdate) { lullabyWanted = true; wakeAudio(); }
    } else if (!wantNight && nightOn) {
      nightOn = false; if (night) night.classList.remove('on'); if (mini) mini.classList.remove('open');
      hush(); call('setVolume', sentV);
    }
    firstUpdate = false;
    if (prev !== st.state) save();
    syncPanels();
  }

  // ---------- "Play time" controls (shared by the games' panels and the home page) ----------
  const panels = new Set();
  function setLimit(n) {
    n = n ? clamp(Math.round(n / 5) * 5, 5, 120) : 0;
    if (n === st.limit) return;
    st.limit = n; newSession(); update(); save();
  }
  function mountPanel(box) {
    if (!box || box.dataset.kgMounted) return;
    box.dataset.kgMounted = '1'; box.classList.add('kg-sec'); panels.add(box);
    box.innerHTML = `<div class="kg-label">⏰ Play time</div><div class="kg-left"></div>
      <div class="kg-chips"><button type="button" class="kg-btn" data-lim="0">Off</button>${PRESETS.map(m => `<button type="button" class="kg-btn" data-lim="${m}">${m}</button>`).join('')}</div>
      <div class="kg-step"><button type="button" class="kg-btn" data-step="-5" aria-label="5 minutes less">−</button><span class="kg-len"></span><button type="button" class="kg-btn" data-step="5" aria-label="5 minutes more">+</button></div>
      <div class="kg-label">Countdown</div>
      <div class="kg-chips kg-show">${SHOWS.map(s => `<button type="button" class="kg-btn" data-show="${s}">${SHOW_LABELS[s]}</button>`).join('')}</div>
      <button type="button" class="kg-btn wide" data-new>🌙 Start a new session now</button>`;
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.lim != null) setLimit(+b.dataset.lim);
      else if (b.dataset.step) setLimit(st.limit ? st.limit + +b.dataset.step : (+b.dataset.step > 0 ? 5 : 0));
      else if (b.dataset.show) { st.show = b.dataset.show; update(); save(); }
      else if (b.hasAttribute('data-new')) { newSession(); update(); save(); }
    });
    syncPanels();
  }
  function syncPanels() {
    for (const box of panels) {
      if (!box.isConnected) { panels.delete(box); continue; }
      box.querySelectorAll('[data-lim]').forEach(b => b.classList.toggle('on', +b.dataset.lim === st.limit));
      box.querySelectorAll('[data-show]').forEach(b => b.classList.toggle('on', b.dataset.show === st.show));
      box.querySelector('.kg-len').textContent = st.limit ? st.limit + ' min' : 'Off';
      box.querySelector('.kg-left').textContent = !st.limit ? 'No limit. Play as long as you like.'
        : st.state === 'goodnight' ? "Time's up." : minutesLeft() + ' min left';
    }
  }

  // ---------- Keep the game behind the goodnight scene quiet ----------
  ['pointerdown', 'pointermove', 'click', 'dblclick', 'keydown'].forEach(type => addEventListener(type, e => {
    if (st.state !== 'goodnight') return;
    const t = e.target;
    if (t && t.closest && t.closest('.kg-night, .kg-mini, #panel')) return;
    e.stopImmediatePropagation(); e.preventDefault();
  }, true));

  // ---------- Start ----------
  function init() {
    const o = read();
    if (adopt(o)) { const now = Date.now(); if (st.limit && now - st.lastTick > AWAY) newSession(); st.lastTick = now; }
    st.state = stateFor();
    update();
    document.querySelectorAll('[data-kg-panel]').forEach(mountPanel);
    setInterval(tick, TICK);
  }
  window.KidsGrownup = { register, mountPanel };
  if (DEBUG) window.__grownup = () => ({ limit: st.limit, show: st.show, remainingMs: st.remainingMs, lastTick: st.lastTick, state: st.state,
    windProgress: windP(), volume: sentV, minutesLeft: minutesLeft(), fast: FAST, hook: !!hook, night: nightOn, lullaby: lulling });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
