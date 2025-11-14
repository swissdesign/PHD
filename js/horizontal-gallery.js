/* =====================================
   HORIZONTAL GALLERY CONTROLLER
   Re-uses touch/wheel input to drive
   sideways galleries while keeping
   accessibility on mobile intact.
   ===================================== */
(function () {
  'use strict';

  const galleries = document.querySelectorAll('[data-horizontal-gallery]');
  if (!galleries.length) {
    return;
  }

  const desktopQuery = window.matchMedia('(min-width: 768px)');

  galleries.forEach(wrapper => initGallery(wrapper));

  function initGallery(wrapper) {
    const track = wrapper.querySelector('[data-horizontal-track]');
    if (!track) {
      return;
    }

    const nav = selectNav(wrapper.dataset.navTarget);
    let scrollProgress = 0;
    let lastTouchY = null;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function updateScroll(delta) {
      const maxScroll = Math.max(0, track.scrollWidth - window.innerWidth);
      scrollProgress = clamp(scrollProgress + delta, 0, maxScroll);
      track.style.transform = `translateX(${-scrollProgress}px)`;

      if (nav && maxScroll > 0) {
        const progressRatio = scrollProgress / maxScroll;
        updateNavOffset(nav, progressRatio);
      }
    }

    function handleWheel(event) {
      if (!desktopQuery.matches) {
        return;
      }

      event.preventDefault();
      updateScroll(event.deltaY * 1.2);
    }

    function handleTouchStart(event) {
      if (!desktopQuery.matches || event.touches.length !== 1) {
        return;
      }

      lastTouchY = event.touches[0].clientY;
    }

    function handleTouchMove(event) {
      if (!desktopQuery.matches || event.touches.length !== 1 || lastTouchY === null) {
        return;
      }

      event.preventDefault();
      const deltaY = lastTouchY - event.touches[0].clientY;
      updateScroll(deltaY * 3);
      lastTouchY = event.touches[0].clientY;
    }

    function handleResize() {
      if (!desktopQuery.matches) {
        scrollProgress = 0;
        track.style.transform = '';
        if (nav) {
          nav.style.transform = '';
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('resize', handleResize);
  }

  function selectNav(selector) {
    if (!selector) {
      return null;
    }
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn('[Gallery] Invalid nav selector', selector, error);
      return null;
    }
  }

  function updateNavOffset(nav, progressRatio) {
    const maxDrift = 200;
    const yOffset = progressRatio * maxDrift;
    nav.style.transform = `translateY(${yOffset}px)`;
  }
})();
