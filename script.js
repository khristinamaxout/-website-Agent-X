/**
 * Цифровой Агент Х — Main Script
 * Navigation · Scroll · Reveal · Form
 */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const form = document.getElementById('contactForm');

  /* --- Mobile menu --- */
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      burger.classList.toggle('burger--active');
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });

    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* --- Header scroll state --- */
  if (header) {
    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 32);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Subtle parallax on ambient --- */
  const ambient = document.querySelector('.ambient');
  if (ambient && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      ambient.style.transform = `translateY(${window.scrollY * 0.04}px)`;
    }, { passive: true });
  }

  /* --- Showcase card tilt --- */
  const showcaseCards = document.querySelectorAll('.showcase-card, .examples-item');
  if (showcaseCards.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showcaseCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const phone = card.querySelector('.phone__frame');
        if (phone) {
          phone.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        const phone = card.querySelector('.phone__frame');
        if (phone) phone.style.transform = '';
      });
    });
  }

  /* --- Scroll reveal --- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* --- Smooth anchor offset for fixed header --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --- Contact form --- */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fields = form.querySelectorAll('[required]');
      let valid = true;

      fields.forEach((field) => {
        const wrap = field.closest('.form-field');
        if (!field.value.trim()) {
          valid = false;
          wrap?.classList.add('form-field--error');
        } else {
          wrap?.classList.remove('form-field--error');
        }
      });

      if (!valid) return;

      const existing = form.querySelector('.form-success');
      existing?.remove();

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error('form submit failed');

        const msg = document.createElement('div');
        msg.className = 'form-success';
        msg.setAttribute('role', 'status');
        msg.textContent = 'Заявка отправлена. Проверьте почту agent-x@internet.ru.';
        form.prepend(msg);
        form.reset();
        setTimeout(() => msg.remove(), 6000);
      } catch (err) {
        const msg = document.createElement('div');
        msg.className = 'form-success form-success--error';
        msg.setAttribute('role', 'alert');
        msg.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.';
        form.prepend(msg);
        setTimeout(() => msg.remove(), 6000);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* --- Examples page filters --- */
  const filters = document.querySelectorAll('.examples-filter');
  const items = document.querySelectorAll('.examples-item');

  if (filters.length && items.length) {
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filters.forEach((b) => b.classList.toggle('is-active', b === btn));
        items.forEach((item) => {
          const match = cat === 'all' || item.dataset.category === cat;
          item.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* --- Lazy load images --- */
  if ('loading' in HTMLImageElement.prototype) return;

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if (lazyImages.length && 'IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imgObserver.observe(img));
  }
})();
