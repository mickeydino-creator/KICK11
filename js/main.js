(function () {
  'use strict';

  /* ===== Mobile hamburger menu ===== */
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    mobileNav.hidden = true;
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileNav() {
    var isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      mobileNav.hidden = false;
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
  }

  hamburgerBtn.addEventListener('click', toggleMobileNav);

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ===== Carousel ===== */
  var carousel = document.getElementById('carousel');
  var track = document.getElementById('carousel-track');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var dotsWrap = document.getElementById('carousel-dots');
  var cards = Array.prototype.slice.call(track.children);

  cards.forEach(function (card, index) {
    var dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'מעבר למוצר מספר ' + (index + 1));
    dot.addEventListener('click', function () {
      scrollToCard(index);
    });
    dotsWrap.appendChild(dot);
  });

  var dots = Array.prototype.slice.call(dotsWrap.children);

  function scrollToCard(index) {
    var card = cards[index];
    if (!card) return;
    carousel.scrollTo({
      left: card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth'
    });
  }

  function currentIndex() {
    var center = carousel.scrollLeft + carousel.clientWidth / 2;
    var closest = 0;
    var closestDist = Infinity;
    cards.forEach(function (card, i) {
      var cardCenter = card.offsetLeft + card.clientWidth / 2;
      var dist = Math.abs(cardCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function updateDots() {
    var idx = currentIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
    });
  }

  var scrollTimeout;
  carousel.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateDots, 100);
  });

  prevBtn.addEventListener('click', function () {
    scrollToCard(Math.max(0, currentIndex() - 1));
  });
  nextBtn.addEventListener('click', function () {
    scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
  });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToCard(Math.max(0, currentIndex() - 1));
    }
  });

  updateDots();

  /* ===== DM Modal ===== */
  var modal = document.getElementById('dm-modal');
  var modalBox = document.getElementById('modal-box');
  var modalCloseBtn = document.getElementById('modal-close-btn');
  var modalProductLine = document.getElementById('modal-product-line');
  var modalWhatsappLink = document.getElementById('modal-whatsapp-link');
  var lastFocusedEl = null;
  var WHATSAPP_NUMBER = '972501234567';

  function buildWhatsappUrl(productLabel) {
    var message = productLabel
      ? 'היי, אשמח לשמוע פרטים נוספים על "' + productLabel + '"'
      : 'היי, אשמח לשמוע פרטים נוספים על האוסף שלכם';
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function openModal(productLabel) {
    lastFocusedEl = document.activeElement;
    if (productLabel) {
      modalProductLine.textContent = 'לגבי: ' + productLabel;
      modalProductLine.hidden = false;
    } else {
      modalProductLine.textContent = '';
      modalProductLine.hidden = true;
    }
    modalWhatsappLink.href = buildWhatsappUrl(productLabel);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
    document.addEventListener('keydown', handleModalKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      var focusable = modalBox.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.querySelectorAll('.btn-dm').forEach(function (btn) {
    if (btn.disabled) return;
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-product'));
    });
  });

  document.getElementById('open-cta-modal').addEventListener('click', function () {
    openModal(null);
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

})();
