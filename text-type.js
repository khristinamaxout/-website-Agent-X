/**
 * TextType — vanilla port of @react-bits/TextType-JS-CSS
 * Colontitle logos only (header + footer brand).
 */
(function () {
  'use strict';

  const SELECTOR = '.logo[data-text-type]';
  const GOLDEN_CHARS = new Set(['Х', 'X']);

  const DEFAULTS = {
    typingSpeed: 75,
    pauseDuration: 1500,
    deletingSpeed: 50,
    showCursor: true,
    cursorCharacter: '_',
    loop: true,
    initialDelay: 0,
    startOnVisible: false,
    reverseMode: false,
    hideCursorWhileTyping: false,
  };

  function parseTexts(el) {
    const raw = el.dataset.textType;
    if (!raw) return ['Цифровой Агент Х'];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return raw.split('|').map((s) => s.trim()).filter(Boolean);
    }
  }

  function renderContent(contentEl, text) {
    let html = '';
    for (const char of text) {
      if (GOLDEN_CHARS.has(char)) {
        html += `<span class="logo__x">${char}</span>`;
      } else {
        html += char;
      }
    }
    contentEl.innerHTML = html;
  }

  function renderStaticLogo(el, text) {
    el.innerHTML = `<span class="text-type text-type--static">${text.split('').map((char) =>
      GOLDEN_CHARS.has(char) ? `<span class="logo__x">${char}</span>` : char
    ).join('')}</span>`;
  }

  function initTextType(el) {
    if (el.dataset.textTypeInit === 'true') return;

    const texts = parseTexts(el);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      renderStaticLogo(el, texts[0]);
      el.dataset.textTypeInit = 'true';
      return;
    }

    const options = {
      ...DEFAULTS,
      typingSpeed: Number(el.dataset.typingSpeed) || DEFAULTS.typingSpeed,
      pauseDuration: Number(el.dataset.pauseDuration) || DEFAULTS.pauseDuration,
      deletingSpeed: Number(el.dataset.deletingSpeed) || DEFAULTS.deletingSpeed,
      cursorCharacter: el.dataset.cursorCharacter || DEFAULTS.cursorCharacter,
      loop: el.dataset.loop !== 'false',
      startOnVisible: el.dataset.startOnVisible === 'true',
    };

    el.innerHTML = `
      <span class="text-type">
        <span class="text-type__content"></span>
        ${options.showCursor ? `<span class="text-type__cursor">${options.cursorCharacter}</span>` : ''}
      </span>
    `;

    el.dataset.textTypeInit = 'true';

    const contentEl = el.querySelector('.text-type__content');
    const cursorEl = el.querySelector('.text-type__cursor');

    let displayedText = '';
    let currentCharIndex = 0;
    let isDeleting = false;
    let currentTextIndex = 0;
    let isVisible = !options.startOnVisible;
    let timeoutId = null;

    function setCursorHidden(hidden) {
      if (cursorEl) cursorEl.classList.toggle('text-type__cursor--hidden', hidden);
    }

    function tick() {
      if (!isVisible) return;

      const currentText = texts[currentTextIndex];
      const processedText = options.reverseMode
        ? currentText.split('').reverse().join('')
        : currentText;

      if (isDeleting) {
        if (displayedText === '') {
          isDeleting = false;
          if (currentTextIndex === texts.length - 1 && !options.loop) return;
          currentTextIndex = (currentTextIndex + 1) % texts.length;
          currentCharIndex = 0;
          timeoutId = setTimeout(tick, options.pauseDuration);
        } else {
          timeoutId = setTimeout(() => {
            displayedText = displayedText.slice(0, -1);
            renderContent(contentEl, displayedText);
            setCursorHidden(options.hideCursorWhileTyping);
            tick();
          }, options.deletingSpeed);
        }
        return;
      }

      if (currentCharIndex < processedText.length) {
        timeoutId = setTimeout(() => {
          displayedText += processedText[currentCharIndex];
          renderContent(contentEl, displayedText);
          currentCharIndex += 1;
          setCursorHidden(options.hideCursorWhileTyping && currentCharIndex < processedText.length);
          tick();
        }, options.typingSpeed);
        return;
      }

      if (texts.length >= 1) {
        if (!options.loop && currentTextIndex === texts.length - 1) return;
        timeoutId = setTimeout(() => {
          isDeleting = true;
          setCursorHidden(options.hideCursorWhileTyping);
          tick();
        }, options.pauseDuration);
      }
    }

    function start() {
      isVisible = true;
      if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
        timeoutId = setTimeout(tick, options.initialDelay);
      } else {
        tick();
      }
    }

    if (options.startOnVisible && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              start();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    } else {
      start();
    }

    el.addEventListener('text-type:destroy', () => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  }

  function initAll() {
    document.querySelectorAll(SELECTOR).forEach(initTextType);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
