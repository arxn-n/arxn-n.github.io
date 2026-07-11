/* Arun Govind — data-first engine
   Seeded Monte Carlo portfolio cloud + efficient frontier hero,
   scroll progress, reveals, mobile nav. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- deterministic PRNG (mulberry32) ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- hero: Monte Carlo cloud + efficient frontier ---------- */
  const canvas = document.getElementById('frontier');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, pts = [], t0 = null;
    const N = 1400;                       /* rendered points (represents the 10k) */
    const DUR = reduced ? 0 : 2400;       /* frontier draw duration */

    /* risk (x) 0..1, return (y) 0..1 in chart space; cloud under a concave frontier */
    function frontierY(x) {              /* concave: high slope early, flattens */
      return 0.16 + 0.74 * Math.sqrt(Math.max(x - 0.06, 0) / 0.94);
    }
    function build() {
      const r = rng(20260711);
      pts = [];
      for (let i = 0; i < N; i++) {
        const x = 0.07 + Math.pow(r(), 0.75) * 0.88;
        const fy = frontierY(x);
        const depth = Math.pow(r(), 0.5);          /* 0=on frontier, 1=deep */
        const y = fy - depth * (fy - 0.05) * (0.25 + 0.75 * r());
        pts.push({ x, y, a: 0.14 + 0.5 * (1 - depth) * r(), d: r() });
      }
    }
    function X(x) { return 60 + x * (w - 110); }
    function Y(y) { return h - 70 - y * (h - 150); }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw(now) {
      if (t0 === null) t0 = now;
      const k = DUR ? Math.min((now - t0) / DUR, 1) : 1;      /* 0..1 progress */
      const ease = 1 - Math.pow(1 - k, 3);
      ctx.clearRect(0, 0, w, h);

      /* axes */
      ctx.strokeStyle = 'rgba(147,160,184,.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0) - 14, Y(0)); ctx.lineTo(X(1) + 10, Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), Y(0) + 14); ctx.lineTo(X(0), Y(1) - 10); ctx.stroke();
      ctx.font = '10px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(92,104,128,.9)';
      for (let i = 1; i <= 4; i++) {
        const gx = X(i / 4.4);
        ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx, Y(0) + 5); ctx.stroke();
        const gy = Y(i / 4.4);
        ctx.beginPath(); ctx.moveTo(X(0), gy); ctx.lineTo(X(0) - 5, gy); ctx.stroke();
      }

      /* cloud (fades in with progress) */
      for (const p of pts) {
        if (p.d > ease) continue;
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 1.4, 0, 6.2832);
        ctx.fillStyle = 'rgba(111,214,232,' + (p.a * Math.min(ease * 1.4, 1)) + ')';
        ctx.fill();
      }

      /* frontier curve (draws left→right) */
      ctx.strokeStyle = 'rgba(111,214,232,.95)'; ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 140, upto = Math.floor(steps * ease);
      for (let i = 0; i <= upto; i++) {
        const x = 0.06 + (i / steps) * 0.9;
        const px = X(x), py = Y(frontierY(x));
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();

      /* max-Sharpe marker (appears at 70% progress) */
      if (ease > 0.7) {
        const mx = 0.34, my = frontierY(mx);
        const pulse = reduced ? 0 : (Math.sin(now / 500) + 1) / 2;
        ctx.beginPath(); ctx.arc(X(mx), Y(my), 5 + pulse * 2.5, 0, 6.2832);
        ctx.strokeStyle = 'rgba(232,180,94,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(X(mx), Y(my), 3, 0, 6.2832);
        ctx.fillStyle = '#e8b45e'; ctx.fill();
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(243,217,168,.95)';
        ctx.fillText('MAX SHARPE 1.47', X(mx) + 12, Y(my) - 8);
      }
      if (!reduced || k < 1) requestAnimationFrame(draw);
    }

    addEventListener('resize', () => { resize(); t0 = null; requestAnimationFrame(draw); }, { passive: true });
    resize(); requestAnimationFrame(draw);
  }

  /* ---------- scroll progress ---------- */
  const bar = document.getElementById('progress');
  if (bar) {
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- reveals ---------- */
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', links.classList.toggle('open') ? 'true' : 'false');
  });
})();
