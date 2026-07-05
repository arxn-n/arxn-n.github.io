/* Arun Govind — v2 site.js
   Layered starfield + shooting stars, scroll progress, reveals, nav. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sy = 0;
  addEventListener('scroll', () => { sy = window.scrollY; }, { passive: true });

  /* ---------- Starfield: two depth layers + occasional shooting star ---------- */
  const canvas = document.getElementById('sky');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, far = [], near = [], meteors = [];
    let nextMeteor = performance.now() + 4000;

    function make(count, depth) {
      return Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: depth * (Math.random() * 1.1 + 0.35),
        vx: (Math.random() - 0.5) * 0.05 * depth,
        tw: Math.random() * Math.PI * 2,
        sp: 0.6 + Math.random() * 0.9,
        gold: Math.random() < 0.07, depth
      }));
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const base = Math.min(220, Math.floor((w * h) / 9000));
      far = make(Math.floor(base * 0.65), 0.6);
      near = make(Math.floor(base * 0.35), 1.25);
    }
    function spawnMeteor() {
      const x = Math.random() * w * 0.8 + w * 0.15;
      meteors.push({ x, y: -20, vx: -(2.4 + Math.random() * 2), vy: 3.2 + Math.random() * 2, life: 1 });
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const layer of [far, near]) {
        const py = sy * (layer === far ? 0.06 : 0.14);
        for (const s of layer) {
          s.x += s.vx; if (s.x < -4) s.x = w + 4; if (s.x > w + 4) s.x = -4;
          const y = ((s.y - py) % h + h) % h;
          const a = (0.28 + 0.3 * Math.sin(t / 1000 * s.sp + s.tw)) * (s.depth > 1 ? 1 : 0.7);
          ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832);
          ctx.fillStyle = s.gold ? 'rgba(227,180,98,' + a + ')' : 'rgba(207,198,255,' + a + ')';
          ctx.fill();
        }
      }
      if (t > nextMeteor) { spawnMeteor(); nextMeteor = t + 6000 + Math.random() * 9000; }
      meteors = meteors.filter(m => m.life > 0);
      for (const m of meteors) {
        m.x += m.vx; m.y += m.vy; m.life -= 0.012;
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 16, m.y - m.vy * 16);
        g.addColorStop(0, 'rgba(244,223,178,' + (0.85 * Math.max(m.life, 0)) + ')');
        g.addColorStop(1, 'rgba(244,223,178,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath();
        ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 16, m.y - m.vy * 16); ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    addEventListener('resize', resize, { passive: true });
    resize(); requestAnimationFrame(frame);
  }

  /* ---------- Scroll progress ---------- */
  const bar = document.getElementById('progress');
  if (bar) {
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- Reveals ---------- */
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle'), links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', links.classList.toggle('open') ? 'true' : 'false');
  });
})();
