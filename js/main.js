// ============================================
// ONEMANCREW - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar Scroll Effect ----
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ---- Set Active Nav Link ----
  const navLinks = document.querySelectorAll('.navbar__link');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === currentPath || (currentPath === '' && href === '/') || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    }
  });

  // ---- Mobile Menu ----
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Scroll Animations ----
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  }

  // ---- Scroll Arrow (hero) ----
  const scrollArrow = document.querySelector('.hero__scroll');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      const target = document.querySelector('#main-content') || document.querySelector('.stats-bar');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => openItem.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1800;
          const start = performance.now();
          const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  }

  // ---- Video Modal ----
  const videoModal = document.getElementById('videoModal');
  const videoPlayer = document.getElementById('videoModalPlayer');
  const videoModalClose = document.getElementById('videoModalClose');
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');

  if (videoModal && videoPlayer) {
    document.querySelectorAll('.portfolio-card[data-video]').forEach(card => {
      card.addEventListener('click', () => {
        const src = card.getAttribute('data-video');
        videoPlayer.src = src;
        videoModal.classList.add('is-open');
        videoPlayer.play();
      });
    });

    const closeModal = () => {
      videoModal.classList.remove('is-open');
      videoPlayer.pause();
      videoPlayer.src = '';
    };

    videoModalClose.addEventListener('click', closeModal);
    videoModalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ---- Form submission ----
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const originalHTML = btn.innerHTML;
      btn.textContent = 'Verzenden...';
      btn.disabled = true;

      const data = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        btn.textContent = 'Bericht verzonden! ✓';
        btn.style.background = '#22c55e';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        btn.textContent = 'Er ging iets mis. Probeer opnieuw.';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }
    });
  }

});
