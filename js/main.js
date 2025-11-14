

// mobile shake secret funktion -> Iam (Contacts page)
  let lastX, lastY, lastZ, moveCounter = 0;

  window.addEventListener('devicemotion', function(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x;
    const y = acc.y;
    const z = acc.z;

    if (typeof lastX !== 'undefined') {
      const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);

      if (delta > 25) { // Adjust sensitivity here
        moveCounter++;
      } else {
        moveCounter = Math.max(0, moveCounter - 1);
      }

      if (moveCounter > 3) {
        moveCounter = 0;

        // ✅ Haptic feedback before redirect
        if ("vibrate" in navigator) navigator.vibrate(100);

        // ✅ Redirect to /iam
        window.location.href = "/iam";
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  }, true);
