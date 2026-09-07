(function () {
  'use strict';

  var STATUS_LABELS = {
    'available': 'זמינה',
    'coming-soon': 'בקרוב',
    'last': 'אחרון!'
  };

  var WHATSAPP_NUMBER = '972553068678';
  var PRODUCTS_URL = 'data/products.json';
  var SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  var TYPE_LABELS = { home: 'בית', away: 'חוץ', third: 'שלישית' };

  function parseVariant(id) {
    var m = /^(.+)-(home|away|third)-worldcup2026$/.exec(id);
    if (!m) return null;
    return { base: m[1], type: m[2] };
  }

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

  function buildWhatsappUrl(productName, season, size) {
    var message = productName
      ? 'היי KICK11, אני מתעניין בחולצת ' + productName + (season ? ', עונה ' + season : '') + (size ? ', מידה ' + size : '') + '. אפשר לקבל פרטים?'
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
    li.className = 'product-card reveal';

    var badge = document.createElement('span');
    badge.className = 'badge badge-' + product.status;
    badge.textContent = STATUS_LABELS[product.status] || '';
    li.appendChild(badge);

    var imageLink = document.createElement('a');
    imageLink.className = 'product-image-link';
    imageLink.href = 'product.html?id=' + encodeURIComponent(product.id);
    imageLink.setAttribute('aria-label', product.name);

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
    imageLink.appendChild(image);
    li.appendChild(imageLink);

    var name = document.createElement('h3');
    name.className = 'product-name';
    var nameLink = document.createElement('a');
    nameLink.href = 'product.html?id=' + encodeURIComponent(product.id);
    nameLink.textContent = product.name;
    name.appendChild(nameLink);
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
        initScrollReveal();
      })
      .catch(function () {
        showProductsError(carouselWrap);
      });
  }

  if (catalogGrid) {
    var catalogSearch = document.getElementById('catalog-search');
    var catalogFilters = document.querySelectorAll('.filter-chip');
    var catalogEmpty = document.getElementById('catalog-empty');
    var allProducts = [];
    var activeStatus = 'all';

    function renderCatalog() {
      var query = (catalogSearch.value || '').trim().toLowerCase();
      var filtered = allProducts.filter(function (product) {
        var matchesStatus = activeStatus === 'all' || product.status === activeStatus;
        var matchesQuery = !query || product.name.toLowerCase().indexOf(query) !== -1;
        return matchesStatus && matchesQuery;
      });

      catalogGrid.innerHTML = '';
      filtered.forEach(function (product) {
        catalogGrid.appendChild(renderProduct(product));
      });
      catalogEmpty.hidden = filtered.length > 0;
      initScrollReveal();
    }

    catalogSearch.addEventListener('input', renderCatalog);
    catalogFilters.forEach(function (chip) {
      chip.addEventListener('click', function () {
        catalogFilters.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeStatus = chip.getAttribute('data-status');
        renderCatalog();
      });
    });

    fetch(PRODUCTS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(function (products) {
        if (!Array.isArray(products) || !products.length) throw new Error('Empty product list');
        allProducts = products;
        renderCatalog();
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

  /* ===== Product detail page ===== */
  var productDetail = document.getElementById('product-detail');
  if (productDetail) {
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    var loadingEl = document.getElementById('product-loading');
    var notFoundEl = document.getElementById('product-not-found');

    fetch(PRODUCTS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(function (products) {
        var product = products.filter(function (p) { return p.id === productId; })[0];
        loadingEl.hidden = true;
        if (!product) {
          notFoundEl.hidden = false;
          return;
        }
        renderProductDetail(product, products);
      })
      .catch(function () {
        loadingEl.hidden = true;
        notFoundEl.hidden = false;
      });
  }

  function renderProductDetail(product, allProducts) {
    document.title = product.name + ' | KICK11';
    document.getElementById('product-breadcrumb-current').textContent = product.name;

    var badge = document.getElementById('product-badge');
    badge.className = 'badge badge-' + product.status;
    badge.textContent = STATUS_LABELS[product.status] || '';

    var imageWrap = document.getElementById('product-detail-image');
    if (product.image) {
      var img = document.createElement('img');
      img.src = product.image;
      img.alt = product.name;
      img.addEventListener('error', function () {
        img.remove();
        imageWrap.classList.add('product-image-placeholder');
      });
      imageWrap.appendChild(img);
    } else {
      imageWrap.classList.add('product-image-placeholder');
    }

    document.getElementById('product-detail-title').textContent = product.name;
    document.getElementById('product-detail-season').textContent = 'עונה ' + product.season;
    document.getElementById('product-detail-price').textContent = product.price;

    var stockEl = document.getElementById('product-detail-stock');
    if (product.stock) {
      stockEl.textContent = product.stock;
      stockEl.hidden = false;
    }

    var selectedSize = null;
    var sizeOptions = document.getElementById('product-size-options');
    SIZES.forEach(function (size) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'product-option';
      btn.textContent = size;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        sizeOptions.querySelectorAll('.product-option').forEach(function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        selectedSize = size;
      });
      sizeOptions.appendChild(btn);
    });

    var variant = parseVariant(product.id);
    if (variant) {
      var siblings = allProducts.filter(function (p) {
        var v = parseVariant(p.id);
        return v && v.base === variant.base;
      });
      if (siblings.length > 1) {
        var typeGroup = document.getElementById('product-type-group');
        var typeOptions = document.getElementById('product-type-options');
        typeGroup.hidden = false;
        siblings.forEach(function (sibling) {
          var siblingVariant = parseVariant(sibling.id);
          var btn = document.createElement('a');
          btn.className = 'product-option';
          btn.href = 'product.html?id=' + encodeURIComponent(sibling.id);
          btn.textContent = TYPE_LABELS[siblingVariant.type] || siblingVariant.type;
          if (sibling.id === product.id) {
            btn.classList.add('selected');
            btn.setAttribute('aria-current', 'true');
          }
          typeOptions.appendChild(btn);
        });
      }
    }

    var dmBtn = document.getElementById('product-dm-btn');
    if (product.status === 'coming-soon') {
      dmBtn.textContent = 'בקרוב';
      dmBtn.disabled = true;
    } else {
      dmBtn.addEventListener('click', function () {
        openModal(buildWhatsappUrl(product.name, product.season, selectedSize));
      });
    }

    productDetail.hidden = false;
    initScrollReveal();
  }

  /* ===== Scroll reveal (mobile-friendly, respects reduced motion) ===== */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal:not(.reveal-ready)');
    if (!elements.length) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elements.forEach(function (el) { el.classList.add('reveal-ready'); });

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach(function (el) { el.classList.add('reveal-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  initScrollReveal();

})();
