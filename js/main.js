/* =====================================
   HOME HERO INTERACTIONS
   Handles panoramic background cycling
   and hero logo motion linked to scroll progress.
   ===================================== */
(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  const logo = hero ? hero.querySelector('.logo') : null;
  const bgImage = document.getElementById('bg-image');
  const panoramas = [
    'assets/images/backgrounds/pano1.jpg',
    'assets/images/backgrounds/pano2.jpg',
    'assets/images/backgrounds/pano3.jpg',
    'assets/images/backgrounds/pano4.jpg',
    'assets/images/backgrounds/pano5.jpg',
    'assets/images/backgrounds/pano6.jpg'
  ];

  if (!hero || !logo || !bgImage) {
    return;
  }

  let scrollProgress = 0;
  let currentBgIndex = 0;
  const heroMotionQuery = window.matchMedia('(min-width: 768px)');
  let scheduledFrame = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function swapBackground() {
    currentBgIndex = (currentBgIndex + 1) % panoramas.length;
    bgImage.classList.add('fade-out');

    window.setTimeout(() => {
      bgImage.src = panoramas[currentBgIndex];
      bgImage.classList.remove('fade-out');
      updateHero(scrollProgress);
    }, 3000);
  }

  function updateBackground(progress) {
    const maxOffset = Math.max(0, bgImage.offsetWidth - window.innerWidth);
    const offset = clamp(progress * maxOffset, 0, maxOffset);
    bgImage.style.transform = `translateX(${-offset}px)`;
  }

  function updateHero(progress) {
    if (!heroMotionQuery.matches) {
      return;
    }

    const offsetNormalized = (progress - 0.5) * 2;
    const clamped = clamp(offsetNormalized, -1, 1);
    const absProgress = Math.abs(clamped);

    const maxShiftVW = 50;
    const offsetX = clamped * maxShiftVW;
    logo.style.transform = `translateX(${offsetX}vw)`;

    const r = Math.round(29 + (0 - 29) * absProgress);
    const g = Math.round(29 + (123 - 29) * absProgress);
    const b = Math.round(27 + (255 - 27) * absProgress);
    logo.style.fill = `rgb(${r}, ${g}, ${b})`;

    const size = 400 - (200 * absProgress);
    logo.style.width = `${size}px`;
    logo.style.opacity = String(1 - absProgress);

    updateBackground(progress);
  }

  function computeScrollProgress() {
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const heroOffset = hero.offsetTop || 0;
    const raw = (window.scrollY - heroOffset) / heroHeight;
    return clamp(raw, 0, 1);
  }

  function scheduleHeroUpdate() {
    if (!heroMotionQuery.matches) {
      return;
    }

    if (scheduledFrame !== null) {
      return;
    }

    scheduledFrame = window.requestAnimationFrame(() => {
      scrollProgress = computeScrollProgress();
      updateHero(scrollProgress);
      scheduledFrame = null;
    });
  }

  function handleResize() {
    if (!heroMotionQuery.matches) {
      scrollProgress = 0;
      logo.style.transform = '';
      logo.style.width = '';
      logo.style.opacity = '';
      logo.style.fill = '';
      bgImage.style.transform = '';
      return;
    }

    scrollProgress = computeScrollProgress();
    updateHero(scrollProgress);
  }

  function handleMediaChange(event) {
    if (!event.matches) {
      handleResize();
      return;
    }

    scrollProgress = computeScrollProgress();
    updateHero(scrollProgress);
  }

  bgImage.src = panoramas[currentBgIndex];
  bgImage.addEventListener('load', () => {
    if (heroMotionQuery.matches) {
      updateHero(scrollProgress);
    }
  });
  window.setInterval(swapBackground, 10000);

  window.addEventListener('scroll', scheduleHeroUpdate, { passive: true });
  window.addEventListener('resize', handleResize);

  if (typeof heroMotionQuery.addEventListener === 'function') {
    heroMotionQuery.addEventListener('change', handleMediaChange);
  } else if (typeof heroMotionQuery.addListener === 'function') {
    heroMotionQuery.addListener(handleMediaChange);
  }

  handleResize();
})();
