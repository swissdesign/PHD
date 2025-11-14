  const logo = document.querySelector('.logo');
const bgPanorama = document.querySelector('.bg-panorama');
const bgImage = document.getElementById('bg-image');

let scrollProgress = 0; // value between 0 and 1
let lastTouchY = null;

// Background image list
const bgImages = [
  'assets/images/backgrounds/pano1.jpg',
  'assets/images/backgrounds/pano2.jpg',
  'assets/images/backgrounds/pano3.jpg',
  'assets/images/backgrounds/pano4.jpg',
  'assets/images/backgrounds/pano5.jpg',
  'assets/images/backgrounds/pano6.jpg'
];
let currentBgIndex = 0;

// Initial image
bgImage.src = bgImages[0];

// Switch image every 10 seconds with 3s crossfade
setInterval(() => {
  // Fade out
  bgImage.classList.add('fade-out');

  setTimeout(() => {
    // Switch image when faded out
    currentBgIndex = (currentBgIndex + 1) % bgImages.length;
    bgImage.src = bgImages[currentBgIndex];

    // Fade in again
    bgImage.classList.remove('fade-out');
  }, 3000); // 3 seconds fade duration
}, 10000); // 10 seconds total
// Clamp helper
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Update both logo and background
function updateVisuals(progress) {
  const offsetNormalized = (progress - 0.5) * 2; // -1 to 1
  const clamped = clamp(offsetNormalized, -1, 1);
  const absProgress = Math.abs(clamped);

  // Logo transform
  const maxShiftVW = 50;
  const offsetX = clamped * maxShiftVW;
  logo.style.transform = `translateX(${offsetX}vw)`;

  // Logo fill color
  const r = Math.round(29 + (0 - 29) * absProgress);
  const g = Math.round(29 + (123 - 29) * absProgress);
  const b = Math.round(27 + (255 - 27) * absProgress);
  logo.style.fill = `rgb(${r}, ${g}, ${b})`;

  // Logo size
  const size = 400 - (200 * absProgress); // from 400px down to 200px
  logo.style.width = `${size}px`;

  // Opacity fade
  logo.style.opacity = `${1 - absProgress}`;

  // Background image translate
  updateBackground(progress);
}

// Background parallax movement
function updateBackground(progress) {
  const maxOffset = bgImage.offsetWidth - window.innerWidth;
  const offset = clamp(progress * maxOffset, 0, maxOffset);
  bgImage.style.transform = `translateX(${-offset}px)`;
}

// Scroll via mouse
window.addEventListener('wheel', (e) => {
  scrollProgress += e.deltaY * 0.0015;
  scrollProgress = clamp(scrollProgress, 0, 1);
  updateVisuals(scrollProgress);
}, { passive: false });

// Scroll via touch
window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    lastTouchY = e.touches[0].clientY;
  }
});
window.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && lastTouchY !== null) {
    const deltaY = lastTouchY - e.touches[0].clientY;
    scrollProgress += deltaY * 0.003;
    scrollProgress = clamp(scrollProgress, 0, 1);
    updateVisuals(scrollProgress);
    lastTouchY = e.touches[0].clientY;
  }
}, { passive: false });

// Prevent actual page scroll
window.addEventListener('scroll', (e) => {
  window.scrollTo(0, 0);
});

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
