/* =====================================
   HOME HERO INTERACTIONS
   Handles panoramic background cycling
   and hero logo motion on scroll/touch.
   ===================================== */
(function () {
  'use strict';

  const logo = document.querySelector('.hero .logo');
  const bgImage = document.getElementById('bg-image');
  const panoramas = [
    'assets/images/backgrounds/pano1.jpg',
    'assets/images/backgrounds/pano2.jpg',
    'assets/images/backgrounds/pano3.jpg',
    'assets/images/backgrounds/pano4.jpg',
    'assets/images/backgrounds/pano5.jpg',
    'assets/images/backgrounds/pano6.jpg'
  ];

  if (!logo || !bgImage) {
    return;
  }

  let scrollProgress = 0;
  let lastTouchY = null;
  let currentBgIndex = 0;
  const heroMotionQuery = window.matchMedia('(min-width: 768px)');

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

  function handleWheel(event) {
    if (!heroMotionQuery.matches) {
      return;
    }

    event.preventDefault();
    scrollProgress = clamp(scrollProgress + event.deltaY * 0.0015, 0, 1);
    updateHero(scrollProgress);
  }

  function handleTouchStart(event) {
    if (!heroMotionQuery.matches || event.touches.length !== 1) {
      return;
    }

    lastTouchY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!heroMotionQuery.matches || event.touches.length !== 1 || lastTouchY === null) {
      return;
    }

    event.preventDefault();
    const deltaY = lastTouchY - event.touches[0].clientY;
    scrollProgress = clamp(scrollProgress + deltaY * 0.003, 0, 1);
    updateHero(scrollProgress);
    lastTouchY = event.touches[0].clientY;
  }

  function handleResize() {
    if (!heroMotionQuery.matches) {
      scrollProgress = 0;
      logo.style.transform = '';
      logo.style.width = '';
      logo.style.opacity = '';
      logo.style.fill = '';
      bgImage.style.transform = '';
    }
  }

  bgImage.src = panoramas[currentBgIndex];
  bgImage.addEventListener('load', () => updateHero(scrollProgress));
  updateHero(scrollProgress);
  window.setInterval(swapBackground, 10000);

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('resize', handleResize);
})();
