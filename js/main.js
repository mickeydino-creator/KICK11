(function () {
  'use strict';

  var STATUS_LABELS = {
    'available': 'זמינה',
    'coming-soon': 'בקרוב',
    'last': 'אחרון!'
  };

  var WHATSAPP_NUMBER = '972553068678';
  var PRODUCTS_URL = 'data/products.json';

  /* ===== Mobile hamburger menu ===== */
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    setTimeout(function () {
      if (hamburgerBtn.getAttribute('aria-expanded') === 'false') mobileNav.hidden = true;
    }, 300);
  }

  function toggleMobileNav() {
    var isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      mobileNav.hidden = false;
      requestAnimationFrame(function () {
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileNav.classList.add('open');
      });
    }
  }

  hamburgerBtn.addEventListener('click', toggleMobileNav);

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ===== Contact modal ===== */
  var modal = document.getElementById('dm-modal');
  var modalBox = document.getElementById('modal-box');
  var modalCloseBtn = document.getElementById('modal-close-btn');
  var modalWhatsappLink = document.getElementById('modal-whatsapp-link');
  var lastFocusedEl = null;

  function buildWhatsappUrl(productName, season) {
    var message = productName
      ? 'היי KICK11, אני מתעניין בחולצת ' + productName + (season ? ', עונה ' + season : '') + '. אפשר לקבל פרטים?'
      : 'היי KICK11, אני מחפש חולצה מסוימת. אפשר לקבל פרטים?';
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function openModal(whatsappUrl) {
    lastFocusedEl = document.activeElement;
    modalWhatsappLink.href = whatsappUrl || buildWhatsappUrl(null, null);
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

  var ctaModalBtn = document.getElementById('open-cta-modal');
  var heroModalBtn = document.getElementById('open-hero-modal');
  if (ctaModalBtn) {
    ctaModalBtn.addEventListener('click', function () {
      openModal(buildWhatsappUrl(null, null));
    });
  }
  if (heroModalBtn) {
    heroModalBtn.addEventListener('click', function () {
      openModal(buildWhatsappUrl(null, null));
    });
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  /* ===== Render product cards from data/products.json ===== */
  var track = document.getElementById('carousel-track');
  var carouselWrap = document.querySelector('.carousel-wrap');
  var dotsWrap = document.getElementById('carousel-dots');
  var catalogGrid = document.getElementById('catalog-grid');

  function renderProduct(product) {
    var li = document.createElement('li');
    li.className = 'product-card';

    var badge = document.createElement('span');
    badge.className = 'badge badge-' + product.status;
    badge.textContent = STATUS_LABELS[product.status] || '';
    li.appendChild(badge);

    var image = document.createElement('div');
    image.className = 'product-image';
    image.setAttribute('aria-hidden', 'true');
    if (product.image) {
      var img = document.createElement('img');
      img.src = product.image;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', function () {
        img.remove();
        image.classList.add('product-image-placeholder');
      });
      image.appendChild(img);
    } else {
      image.classList.add('product-image-placeholder');
    }
    li.appendChild(image);

    var name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;
    li.appendChild(name);

    var season = document.createElement('p');
    season.className = 'product-season';
    season.textContent = 'עונה ' + product.season;
    li.appendChild(season);

    if (product.stock) {
      var stock = document.createElement('p');
      stock.className = 'product-stock';
      stock.textContent = product.stock;
      li.appendChild(stock);
    }

    var price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.price;
    li.appendChild(price);

    var btn = document.createElement('button');
    btn.className = 'btn btn-dm';
    btn.type = 'button';
    if (product.status === 'coming-soon') {
      btn.textContent = 'בקרוב';
      btn.disabled = true;
    } else {
      btn.textContent = 'שליחת הודעה';
      btn.addEventListener('click', function () {
        openModal(buildWhatsappUrl(product.name, product.season));
      });
    }
    li.appendChild(btn);

    return li;
  }

  function showProductsError(container) {
    container.hidden = true;
    var message = document.createElement('p');
    message.className = 'products-error';
    message.textContent = 'לא הצלחנו לטעון את החולצות כרגע. נסו לרענן את הדף.';
    container.parentNode.insertBefore(message, container.nextSibling);
  }

  if (track) {
    fetch(PRODUCTS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(function (products) {
        if (!Array.isArray(products) || !products.length) throw new Error('Empty product list');
        var featured = products.filter(function (p) { return p.featured; });
        var homeProducts = featured.length ? featured : products.slice(0, 8);
        homeProducts.forEach(function (product) {
          track.appendChild(renderProduct(product));
        });
        initCarousel();
      })
      .catch(function () {
        showProductsError(carouselWrap);
      });
  }

  if (catalogGrid) {
    fetch(PRODUCTS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(function (products) {
        if (!Array.isArray(products) || !products.length) throw new Error('Empty product list');
        products.forEach(function (product) {
          catalogGrid.appendChild(renderProduct(product));
        });
      })
      .catch(function () {
        showProductsError(catalogGrid);
      });
  }

  /* ===== Carousel ===== */
  function initCarousel() {
    var carousel = document.getElementById('carousel');
    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    var cards = Array.prototype.slice.call(track.children);

    cards.forEach(function (card, index) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'מעבר לחולצה מספר ' + (index + 1));
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
  }

})();
