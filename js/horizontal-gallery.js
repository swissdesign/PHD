/* =====================================
   HORIZONTAL GALLERY CONTROLLER
   Re-uses touch/wheel input to drive
   sideways galleries while keeping
   accessibility on mobile intact.
   ===================================== */
(function () {
  'use strict';

  const WHEEL_SCROLL_MULTIPLIER = 1.2;
  const TOUCH_SCROLL_MULTIPLIER = 3;

  const wrappers = Array.from(document.querySelectorAll('[data-horizontal-gallery]'));
  if (!wrappers.length) {
    return;
  }

  const desktopQuery = window.matchMedia('(min-width: 768px)');
  const galleryStates = wrappers
    .map(createGalleryState)
    .filter(Boolean);

  if (!galleryStates.length) {
    return;
  }

  desktopQuery.addEventListener('change', handleViewportChange);
  window.addEventListener('resize', handleResize);

  function handleViewportChange() {
    galleryStates.forEach(state => state.onViewportChange());
  }

  function handleResize() {
    galleryStates.forEach(state => state.onResize());
  }

  function createGalleryState(wrapper) {
    const track = wrapper.querySelector('[data-horizontal-track]');
    if (!track) {
      return null;
    }

    const nav = selectNav(wrapper.dataset.navTarget);
    let scrollProgress = 0;
    let lastTouchY = null;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function calculateMaxScroll() {
      return Math.max(0, track.scrollWidth - wrapper.clientWidth);
    }

    function applyScroll() {
      const maxScroll = calculateMaxScroll();
      scrollProgress = clamp(scrollProgress, 0, maxScroll);

      if (maxScroll <= 0) {
        track.style.transform = '';
        if (nav) {
          nav.style.transform = '';
        }
        return;
      }

      track.style.transform = `translateX(${-scrollProgress}px)`;

      if (nav) {
        const progressRatio = scrollProgress / maxScroll;
        updateNavOffset(nav, progressRatio);
      }
    }

    function updateScroll(delta) {
      scrollProgress += delta;
      applyScroll();
    }

    function handleWheel(event) {
      if (!desktopQuery.matches) {
        return;
      }

      event.preventDefault();
      updateScroll(event.deltaY * WHEEL_SCROLL_MULTIPLIER);
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
      updateScroll(deltaY * TOUCH_SCROLL_MULTIPLIER);
      lastTouchY = event.touches[0].clientY;
    }

    function resetTouchState() {
      lastTouchY = null;
    }

    function syncNavWithNativeScroll() {
      if (!nav || desktopQuery.matches) {
        return;
      }

      const maxScroll = calculateMaxScroll();
      if (maxScroll <= 0) {
        nav.style.transform = '';
        return;
      }

      const progressRatio = wrapper.scrollLeft / maxScroll;
      updateNavOffset(nav, progressRatio);
    }

    function onViewportChange() {
      if (desktopQuery.matches) {
        wrapper.scrollLeft = 0;
        applyScroll();
        return;
      }

      scrollProgress = 0;
      track.style.transform = '';
      if (nav) {
        nav.style.transform = '';
      }
      syncNavWithNativeScroll();
    }

    function onResize() {
      if (desktopQuery.matches) {
        applyScroll();
      } else {
        syncNavWithNativeScroll();
      }
    }

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrapper.addEventListener('touchend', resetTouchState, { passive: true });
    wrapper.addEventListener('touchcancel', resetTouchState, { passive: true });
    wrapper.addEventListener('scroll', syncNavWithNativeScroll, { passive: true });

    onViewportChange();

    return {
      onViewportChange,
      onResize
    };
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
