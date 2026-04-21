/* ================================
   MARQUEE — infinite JS scroll
================================ */
function initMarquee(track, pxPerFrame) {
  if (!track) return;
  track.style.animation = 'none';
  const half = track.scrollWidth / 2;
  let x = pxPerFrame < 0 ? 0 : -half;

  (function tick() {
    x += pxPerFrame;
    if (pxPerFrame < 0 && x <= -half) x = 0;
    if (pxPerFrame > 0 && x >= 0)    x = -half;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  })();
}

window.addEventListener('DOMContentLoaded', () => {
  initMarquee(document.querySelector('.marquee-track:not(.marquee-track--clients)'), -0.5);
  initMarquee(document.querySelector('.marquee-track--clients'), 0.5);

  // Hero video: force play on mobile (browsers may block autoplay attribute)
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(() => {});
  }
});

/* ================================
   NAVIGATION
================================ */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('navList');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navList.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navList?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Active link
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') === page) link.classList.add('active');
});

/* ================================
   SCROLL REVEAL
================================ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('revealed'), i * 90);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

/* ================================
   STAGGER GRID CHILDREN
================================ */
document.querySelectorAll('.services-grid, .values-grid, .stats-grid').forEach(grid => {
  [...grid.children].forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
  });
});

/* ================================
   COUNTER ANIMATION
================================ */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.count);
    const dur    = 1400;
    const start  = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(ease * target);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* ================================
   PORTFOLIO FILTER
================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item[data-cat]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.style.transition = 'opacity .3s ease, transform .3s ease';
      if (show) {
        item.style.display = '';
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = '';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => { item.style.display = 'none'; }, 300);
      }
    });
  });
});

/* ================================
   PORTFOLIO VIDEO — hover preview + lightbox
================================ */
// Hover: muted preview in card
document.querySelectorAll('.portfolio-item__video').forEach(video => {
  const item = video.closest('.portfolio-item');
  item.addEventListener('mouseenter', () => { video.load(); video.play(); });
  item.addEventListener('mouseleave', () => { video.pause(); video.load(); });
});

// Lightbox
(function () {
  const lb       = document.getElementById('videoLightbox');
  if (!lb) return;
  const lbVideo  = lb.querySelector('.lightbox__video');
  const lbCat    = lb.querySelector('.lightbox__cat');
  const lbTitle  = lb.querySelector('.lightbox__title');
  const lbClose  = lb.querySelector('.lightbox__close');
  const lbBg     = lb.querySelector('.lightbox__backdrop');

  function open(src, cat, title) {
    lbVideo.src = src;
    lbCat.textContent   = cat   || '';
    lbTitle.textContent = title || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbVideo.play();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();
  }

  lbClose.addEventListener('click', close);
  lbBg.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.portfolio-item[data-video-src]').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const src   = item.dataset.videoSrc;
      const cat   = item.querySelector('.portfolio-item__cat')?.textContent;
      const title = item.querySelector('.portfolio-item__title')?.textContent;
      open(src, cat, title);
    });
  });
})();

/* ================================
   INTERACTIVE PROCESS
================================ */
(function () {
  const steps   = document.querySelectorAll('.process-step');
  const panels  = document.querySelectorAll('.process-panel');
  const lines   = document.querySelectorAll('.process-step__line');
  const fill    = document.querySelector('.process-progress-fill');

  if (!steps.length) return;

  const AUTO_DELAY = 8000;
  let current = 0;
  let timer   = null;
  let started = false;

  function updateDoneLines(index) {
    lines.forEach((ln, i) => {
      ln.classList.toggle('done', i < index);
    });
  }

  function goTo(index) {
    steps[current].classList.remove('active');
    panels[current].classList.remove('active');
    steps.forEach((s, i) => s.classList.toggle('done', i < index));
    updateDoneLines(index);

    current = index;
    steps[current].classList.add('active');
    steps[current].classList.remove('done');
    panels[current].classList.add('active');

    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.transition = `width ${AUTO_DELAY}ms linear`;
          fill.style.width = '100%';
        });
      });
    }
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => {
      goTo((current + 1) % steps.length);
    }, AUTO_DELAY);
  }

  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      if (i === current) return;
      goTo(i);
      clearInterval(timer);
      startAuto();
    });
  });

  const section = document.querySelector('.process-interactive');
  if (section) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        goTo(0);
        startAuto();
        obs.disconnect();
      }
    }, { threshold: 0.25 });
    obs.observe(section);
  }
})();

/* ================================
   CONTACT FORM
================================ */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const orig = btn.textContent;
    btn.textContent = 'Verzonden! ✓';
    btn.style.background = '#2e7d45';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}
