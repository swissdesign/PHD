// Preloader
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.style.transition = 'opacity 1s ease-out';
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 1000);
  }
});

// Google Map
let map = '';
let center;

function initialize() {
  const mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(13.758468, 100.567481),
    scrollwheel: false
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addDomListener(map, 'idle', () => calculateCenter());
  google.maps.event.addDomListener(window, 'resize', () => map.setCenter(center));
}

function calculateCenter() {
  center = map.getCenter();
}

function loadGoogleMap() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initialize';
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  loadGoogleMap();

  // Isotope Filter
  const wrapper = document.querySelector('.iso-box-wrapper');
  if (wrapper && window.imagesLoaded && window.Isotope) {
    imagesLoaded(wrapper, () => {
      const iso = new Isotope(wrapper, {
        layoutMode: 'fitRows',
        itemSelector: '.iso-box'
      });

      const filterLinks = document.querySelectorAll('.filter-wrapper li a');
      filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const filter = link.getAttribute('data-filter');
          iso.arrange({ filter });

          // Remove existing selection
          filterLinks.forEach(l => l.classList.remove('selected'));
          link.classList.add('selected');
        });
      });
    });
  }

  // Sticky Navbar
  const nav = document.querySelector('.nav-container');
  let didScroll = false;
  const stickyOffset = 50;

  function scrollPage() {
    const sy = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) {
      nav.classList.toggle('sticky', sy >= stickyOffset);
    }
    didScroll = false;
  }

  window.addEventListener('scroll', () => {
    if (!didScroll) {
      didScroll = true;
      setTimeout(scrollPage, 50);
    }
  });

  // Clone menus + click handlers
  const menuContainers = document.querySelectorAll('.menu-container');
  menuContainers.forEach((container, index) => {
    const circle = container.querySelector('.circle');
    const listMenu = container.querySelector('.list-menu');
    if (circle && listMenu) {
      circle.setAttribute('menu-link', index);
      const clone = listMenu.cloneNode(true);
      clone.setAttribute('menu-link', index);
      document.body.appendChild(clone);
    }
  });

  const circles = document.querySelectorAll('.menu-container .circle');
  circles.forEach(circle => {
    circle.addEventListener('click', () => {
      const link = circle.getAttribute('menu-link');
      const linked = document.querySelectorAll(`.list-menu[menu-link="${link}"]`);
      linked.forEach(el => el.classList.toggle('reveal-modal'));
    });
  });

  const closeButtons = document.querySelectorAll('.close-iframe');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const listMenu = btn.closest('.list-menu');
      if (listMenu) listMenu.classList.toggle('reveal-modal');
    });
  });

  // WOW.js Init
  if (typeof WOW !== 'undefined') {
    new WOW({ mobile: false }).init();
  }
});
