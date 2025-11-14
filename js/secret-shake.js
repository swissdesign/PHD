/* =====================================
   SECRET SHAKE NAVIGATION
   Redirects mobile users to hidden pages
   when a shake gesture is detected.
   ===================================== */
(function () {
  'use strict';

  const target = document.body ? document.body.dataset.shakeTarget : null;
  if (!target) {
    return;
  }

  const shakeThreshold = 25;
  const requiredMoves = 3;
  const viewportLimit = 800;

  let lastX;
  let lastY;
  let lastZ;
  let moveCounter = 0;
  let listenerAttached = false;

  function shouldEnable() {
    return typeof window.DeviceMotionEvent !== 'undefined' && window.innerWidth < viewportLimit;
  }

  function handleMotion(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) {
      return;
    }

    const { x, y, z } = acceleration;

    if (typeof lastX !== 'undefined') {
      const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);

      if (delta > shakeThreshold) {
        moveCounter += 1;
      } else {
        moveCounter = Math.max(0, moveCounter - 1);
      }

      if (moveCounter > requiredMoves) {
        moveCounter = 0;
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        window.location.href = target;
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  }

  function enableShake() {
    if (listenerAttached || !shouldEnable()) {
      return;
    }

    window.addEventListener('devicemotion', handleMotion, true);
    listenerAttached = true;
  }

  function disableShake() {
    if (!listenerAttached) {
      return;
    }

    window.removeEventListener('devicemotion', handleMotion, true);
    listenerAttached = false;
    moveCounter = 0;
    lastX = lastY = lastZ = undefined;
  }

  function handleResize() {
    if (shouldEnable()) {
      enableShake();
    } else {
      disableShake();
    }
  }

  handleResize();
  window.addEventListener('resize', handleResize);
})();
