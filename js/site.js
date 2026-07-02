/* Arun Govind — site.js
   Custom starfield (no external libs), scroll reveals, mobile nav. */

(function () {
  'use strict';

  /* ---------- Starfield with constellation lines near the cursor ---------- */
  const canvas = document.getElementById('sky');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let stars = [], w = 0, h = 0, dpr = 1;
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 130;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor((w * h) / 11000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        tw: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.08
      }));
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < -5) s.x = w + 5; if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5; if (s.y > h + 5) s.y = -5;
        const alpha = 0.35 + 0.35 * Math.sin(t / 900 + s.tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? 'rgba(216,180,111,' + alpha + ')'
          : 'rgba(201,192,255,' + alpha + ')';
        ctx.fill();
      }
      // constellation lines near cursor
      for (const s of stars) {
        const dx = s.x - mouse.x, dy = s.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(139,124,246,' + (0.22 * (1 - d / LINK_DIST)) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });
    resize();
    requestAnimationFrame(frame);
  }

  /* ---------- Scroll reveals ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();
