/**
 * Цифровой Агент Х — Main Script
 * Navigation · Scroll · Reveal
 */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

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

  /* --- Section tabs --- */
  const tabButtons = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');
  const tabByHash = {
    hero: 'home',
    play: 'home',
    solutions: 'home',
    problem: 'home',
    work: 'projects',
    card: 'services',
    emenu: 'services',
    catalog: 'services',
    sites: 'services',
    nfc: 'services',
    prices: 'services',
    benefits: 'services',
    process: 'services',
    trust: 'services',
    faq: 'faq',
    connect: 'contact',
  };

  function showTab(name) {
    if (!panels.length || !name) return;
    tabButtons.forEach((btn) => {
      if (!btn.dataset.tab) return;
      btn.classList.toggle('is-active', btn.dataset.tab === name);
    });
    panels.forEach((panel) => {
      const on = panel.dataset.panel === name;
      panel.classList.toggle('is-on', on);
      if (on) panel.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
    });
  }

  const hashByTab = {
    home: 'hero',
    services: 'card',
    projects: 'work',
    faq: 'faq',
    contact: 'connect',
  };

  tabButtons.forEach((btn) => {
    if (btn.tagName !== 'BUTTON' && btn.tagName !== 'A') return;
    if (!panels.length) return;
    btn.addEventListener('click', (e) => {
      if (!btn.dataset.tab) return;
      if (btn.getAttribute('href') && btn.getAttribute('href').indexOf('#') !== 0 && !btn.getAttribute('href').startsWith('#')) return;
      e.preventDefault();
      showTab(btn.dataset.tab);
      const id = hashByTab[btn.dataset.tab];
      if (id) history.replaceState(null, '', '#' + id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* --- Smooth anchor offset for fixed header --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const panel = target.closest('[data-panel]');
      if (panel) showTab(panel.dataset.panel);
      history.replaceState(null, '', id);
      const headerH = header ? header.offsetHeight : 0;
      requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  });

  function applyHash() {
    const hashId = window.location.hash.replace('#', '');
    if (!hashId || !tabByHash[hashId]) return;
    showTab(tabByHash[hashId]);
    const target = document.getElementById(hashId);
    if (!target) return;
    const headerH = header ? header.offsetHeight : 0;
    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: Math.max(0, top) });
    });
  }

  window.addEventListener('hashchange', applyHash);
  applyHash();

  /* --- Role scene --- */
  const playRoot = document.getElementById('playStage');
  if (playRoot) {
    const scenes = {
      card: {
        nowImg: 'images/play-card-now.webp',
        fixImg: 'images/play-card-fix.webp',
        href: '#card',
        more: 'Смотреть визитки',
        now: {
          kicker: 'Сейчас',
          line: 'В кармане остаётся бумага.',
          aside: 'Встреча кончилась. Вечером карточку не откроют — и так и не узнают, кто вы и чем полезны.'
        },
        stay: {
          kicker: 'И так сойдёт',
          line: 'Бумага и правда «сойдёт».',
          aside: 'До той встречи, после которой гость захочет написать — и не найдёт вас.'
        },
        fix: {
          kicker: 'Проще для гостя',
          line: 'Касание метки или скан QR.',
          aside: 'И получает не строчку на картоне, а вас целиком: кто вы, чем живёт дело, как связаться и что вы делаете. Встреча заканчивается, а страница остаётся в телефоне.'
        },
        have: {
          kicker: 'Уже есть',
          line: 'Электронная визитка уже работает на вас.',
          aside: 'Гость не ищет вас в кармане. Вы уже знакомитесь в том темпе, в каком живёт его телефон. Дальше можно посмотреть живые работы и решить, чего не хватает вашей.'
        }
      },
      menu: {
        nowImg: 'images/play-menu-now.webp',
        fixImg: 'images/play-menu-fix.webp',
        href: '#emenu',
        more: 'Смотреть меню',
        now: {
          kicker: 'Сейчас',
          line: 'Зал полный. Гость ждёт, когда до него дойдут.',
          aside: 'Официантов не хватает. Пока на него не посмотрят, заказ стоит. Ожидание кажется длиннее, чем есть.'
        },
        stayImg: 'images/play-menu-stay.webp',
        stay: {
          kicker: 'И так сойдёт',
          line: 'Бумажное меню остаётся.',
          aside: 'А гость может уйти, не дождавшись.'
        },
        fix: {
          kicker: 'Проще для гостя',
          line: 'Меню в вашем стиле открывается с метки или QR.',
          aside: 'Гость не ждёт официанта: уже собирает заказ, особенно когда посадка полная и рук в зале не хватает. Ощущение «когда меня заметят» уходит. Блюда с фото проще добавить — чек часто вырастает на 15–20%. Как получить эту разницу именно у вас, покажу на разборе.'
        },
        have: {
          kicker: 'Уже есть',
          line: 'Электронное меню уже на столе.',
          aside: 'Гость не листает чужую папку. Посмотрите живые залы: можно усилить своё, не начиная с нуля.'
        }
      },
      catalog: {
        nowImg: 'images/play-catalog-now.webp',
        fixImg: 'images/play-catalog-fix.webp',
        href: '#catalog',
        more: 'Смотреть каталоги',
        now: {
          kicker: 'Сейчас',
          line: 'Ассортимент уехал в переписку.',
          aside: 'Клиент листает сообщения и не понимает, что из этого ему. На лице — вопрос, не покупка.'
        },
        stay: {
          kicker: 'И так сойдёт',
          line: 'Прайс так и живёт в чате.',
          aside: 'Нужный товар ищут между сообщениями. Покупка откладывается.'
        },
        fix: {
          kicker: 'Проще для клиента',
          line: 'Это не файл, который теряется в переписке.',
          aside: 'Большой ассортимент или маленький собран в понятный каталог. Клиент не тонет в позициях: находит товар и описание к нему. Покупка проще, доверия больше. Вы уже позаботились о своём клиенте?'
        },
        have: {
          kicker: 'Уже есть',
          line: 'Каталог уже собран.',
          aside: 'Клиенту не нужно собирать вас по чатам. Посмотрите, как это выглядит у других — и что можно добавить у себя.'
        }
      }
    };
    const roles = document.querySelectorAll('.play__role');
    const kicker = document.getElementById('playKicker');
    const line = document.getElementById('playLine');
    const aside = document.getElementById('playAside');
    const shot = document.getElementById('playShot');
    const choices = document.getElementById('playChoices');
    const nav = document.getElementById('playNav');
    const back = document.getElementById('playBack');
    const anyway = document.getElementById('playAnyway');
    const more = document.getElementById('playMore');
    let role = '';

    function paint(path) {
      const scene = scenes[role];
      const beat = scene[path];
      [kicker, line, aside].forEach((el) => {
        el.classList.remove('is-swap');
        void el.offsetWidth;
        el.classList.add('is-swap');
      });
      kicker.textContent = beat.kicker;
      line.textContent = beat.line;
      aside.textContent = beat.aside;
      const imgKey = path === 'have' ? 'fixImg' : path + 'Img';
      shot.src = scene[imgKey] || scene.nowImg;
      const atStart = path === 'now';
      choices.hidden = !atStart;
      nav.hidden = atStart;
      anyway.hidden = path !== 'stay';
      more.hidden = path === 'stay';
      if (path === 'have') {
        more.href = '#work';
        more.textContent = 'Вдохновиться работами';
      } else {
        more.href = scene.href;
        more.textContent = scene.more;
      }
    }

    function openRole(name) {
      const item = document.querySelector('.play__item[data-role="' + name + '"]');
      const same = role === name && !playRoot.hidden && playRoot.parentElement === item;
      roles.forEach((btn) => {
        const on = btn.dataset.role === name && !same;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-expanded', String(on));
      });
      if (same) {
        playRoot.hidden = true;
        role = '';
        return;
      }
      role = name;
      item.appendChild(playRoot);
      paint('now');
      playRoot.hidden = false;
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    roles.forEach((btn) => btn.addEventListener('click', () => openRole(btn.dataset.role)));
    choices.addEventListener('click', (e) => {
      const path = e.target.closest('[data-path]');
      if (!path || !role) return;
      paint(path.dataset.path);
    });
    back.addEventListener('click', () => paint('now'));
    anyway.addEventListener('click', () => paint('fix'));
  }

  /* --- Category filters: визитки открываются только по выбранной категории --- */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const filters = group.querySelectorAll('[data-filter]');
    const items = group.querySelectorAll('[data-cat]');
    if (!filters.length || !items.length) return;

    const apply = (cat) => {
      filters.forEach((b) => {
        const active = Boolean(cat) && b.dataset.filter === cat;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      items.forEach((item) => {
        const card = item.closest('.case, .examples-item') || item;
        if (card.dataset.feature === 'show') return;
        const key = item.dataset.cat || item.dataset.category;
        card.classList.toggle('is-hidden', !cat || key !== cat);
      });
      group.querySelectorAll('.work__group').forEach((block) => {
        if (block.dataset.feature === 'show') {
          block.hidden = false;
          return;
        }
        const cards = [...block.querySelectorAll('.case, .examples-item')];
        const any = cards.some((card) => !card.classList.contains('is-hidden'));
        block.hidden = !any;
      });
    };

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.classList.contains('is-active') ? '' : btn.dataset.filter;
        apply(next);
      });
    });
    apply('');
  });

  /* «Х» — один оборот по часовой, каждый раз при касании экрана */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const spinMark = () => {
      document.querySelectorAll('.logo__x, .logo__x-spin img').forEach((el) => {
        el.classList.remove('is-spin');
        void el.offsetWidth;
        el.classList.add('is-spin');
      });
    };
    document.addEventListener('pointerdown', spinMark);
  }

  /* --- Lazy load fallback for older browsers --- */
  if (!('loading' in HTMLImageElement.prototype)) {
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
  }
})();
