/**
 * BorderGlow — vanilla port of @react-bits/BorderGlow-JS-CSS
 */
(function () {
  'use strict';

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  const DEFAULTS = {
    edgeSensitivity: 30,
    glowColor: '40 80 80',
    backgroundColor: '#120F17',
    borderRadius: 28,
    glowRadius: 40,
    glowIntensity: 1,
    coneSpread: 25,
    animated: false,
    colors: ['#c084fc', '#f472b6', '#38bdf8'],
    fillOpacity: 0.5,
  };

  const BLOCKS = [
    { selector: '.solution' },
    { selector: '.benefit', borderRadius: 20 },
    { selector: '.process__step', borderRadius: 20 },
    { selector: '.connect__panel', borderRadius: 24 },
    { selector: '.trust__inner', borderRadius: 28 },
    { selector: '.problem__list li', borderRadius: 16, glowRadius: 20 },
    { selector: '.product__content', borderRadius: 24 },
    { selector: '.product__media', borderRadius: 24 },
    { selector: '.product__demo', borderRadius: 24 },
    { selector: '.about__content', borderRadius: 24 },
    { selector: '.about__portrait', borderRadius: 24 },
    { selector: '.examples-item', borderRadius: 20 },
  ];

  function parseHSL(hslStr) {
    const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    for (let i = 0; i < opacities.length; i++) {
      vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
    }
    return vars;
  }

  function buildGradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }

  function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
    const t0 = performance.now() + delay;
    function tick() {
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }
    setTimeout(() => requestAnimationFrame(tick), delay);
  }

  function getCenterOfElement(el) {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }

  function getEdgeProximity(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function applyOptions(el, options) {
    const glowVars = buildGlowVars(options.glowColor, options.glowIntensity);
    const gradientVars = buildGradientVars(options.colors);

    el.style.setProperty('--card-bg', options.backgroundColor);
    el.style.setProperty('--edge-sensitivity', String(options.edgeSensitivity));
    el.style.setProperty('--border-radius', `${options.borderRadius}px`);
    el.style.setProperty('--glow-padding', `${options.glowRadius}px`);
    el.style.setProperty('--cone-spread', String(options.coneSpread));
    el.style.setProperty('--fill-opacity', String(options.fillOpacity));

    Object.entries({ ...glowVars, ...gradientVars }).forEach(([key, value]) => {
      el.style.setProperty(key, value);
    });
  }

  function parseDataOptions(el) {
    const opts = {};
    if (el.dataset.borderGlowColors) {
      opts.colors = el.dataset.borderGlowColors.split(',').map((c) => c.trim());
    }
    if (el.dataset.borderGlowBg) opts.backgroundColor = el.dataset.borderGlowBg;
    if (el.dataset.borderGlowRadius) opts.borderRadius = Number(el.dataset.borderGlowRadius);
    if (el.dataset.borderGlowAnimated === 'true') opts.animated = true;
    return opts;
  }

  function bindPointer(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const edge = getEdgeProximity(el, x, y);
      const angle = getCursorAngle(el, x, y);
      el.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      el.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });

    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--edge-proximity', '0');
    });
  }

  function runSweepAnimation(el) {
    const angleStart = 110;
    const angleEnd = 465;
    el.classList.add('sweep-active');
    el.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({ duration: 500, onUpdate: (v) => el.style.setProperty('--edge-proximity', String(v)) });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => el.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`),
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => el.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`),
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => el.style.setProperty('--edge-proximity', String(v)),
      onEnd: () => el.classList.remove('sweep-active'),
    });
  }

  function applyBorderGlow(el, options) {
    if (el.classList.contains('border-glow-card')) return;

    const inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    while (el.firstChild) inner.appendChild(el.firstChild);

    const edgeLight = document.createElement('span');
    edgeLight.className = 'edge-light';
    edgeLight.setAttribute('aria-hidden', 'true');

    el.classList.add('border-glow-card');
    el.appendChild(edgeLight);
    el.appendChild(inner);

    applyOptions(el, options);
    bindPointer(el);

    if (options.animated && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      runSweepAnimation(el);
    }
  }

  function initBorderGlow() {
    BLOCKS.forEach(({ selector, ...overrides }) => {
      document.querySelectorAll(selector).forEach((el) => {
        applyBorderGlow(el, {
          ...DEFAULTS,
          ...overrides,
          ...parseDataOptions(el),
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBorderGlow);
  } else {
    initBorderGlow();
  }
})();
