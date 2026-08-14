  // ---- Loupe magnifier: cursor becomes a jeweler's loupe over any [data-loupe] stage ----
  document.querySelectorAll('[data-loupe]').forEach(stage => {
    const lens = document.createElement('div');
    lens.className = 'loupe-lens';
    const svgSource = stage.querySelector('svg');
    const clone = svgSource.cloneNode(true);
    lens.appendChild(clone);
    stage.appendChild(lens);

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lensSize = lens.offsetWidth;

      lens.style.left = (x - lensSize / 2) + 'px';
      lens.style.top = (y - lensSize / 2) + 'px';

      // Zoomed clone tracks the same relative position, scaled up 2.6x
      const scale = 2.6;
      const cloneEl = lens.querySelector('svg');
      const offsetX = -(x * scale - lensSize / 2);
      const offsetY = -(y * scale - lensSize / 2);
      cloneEl.style.width = (rect.width * scale) + 'px';
      cloneEl.style.height = (rect.height * scale) + 'px';
      cloneEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  });

  // ---- Photo magnifier: same loupe idea, adapted for real photos (cards + craft) ----
  document.querySelectorAll('[data-loupe-photo]').forEach(stage => {
    const photoUrl = stage.getAttribute('data-loupe-photo');
    const lens = document.createElement('div');
    lens.className = 'loupe-lens loupe-lens-photo';
    lens.style.backgroundImage = `url('${photoUrl}')`;
    stage.appendChild(lens);

    const zoom = 2.2; // how far the lens zooms in versus the base photo

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lensSize = lens.offsetWidth;

      lens.style.left = (x - lensSize / 2) + 'px';
      lens.style.top = (y - lensSize / 2) + 'px';

      lens.style.backgroundSize = (rect.width * zoom) + 'px ' + (rect.height * zoom) + 'px';
      lens.style.backgroundPosition =
        `-${x * zoom - lensSize / 2}px -${y * zoom - lensSize / 2}px`;
    });
  });

  // ---- Nav: transparent over the hero photo, opaque once scrolled past it ----
  const siteNav = document.getElementById('siteNav');
  function updateNavState(){
    if (window.scrollY > 40) siteNav.classList.add('nav-scrolled');
    else siteNav.classList.remove('nav-scrolled');
  }
  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();

  // ---- Theme toggle (light / dark), gradual crossfade handled in CSS ----
  const rootEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function hexToRgb(hex){
    const clean = hex.trim().replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  function currentGoldRGB(){
    const val = getComputedStyle(rootEl).getPropertyValue('--sparkle-color');
    return hexToRgb(val || '#9c7a3e');
  }

  themeToggle.addEventListener('click', () => {
    const isDark = rootEl.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    rootEl.setAttribute('data-theme', next);
    themeToggle.setAttribute('aria-checked', String(next === 'dark'));
    themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    // retarget the sparkle field's gold tone; it eases toward this each frame below
    sparkleGoldTarget = currentGoldRGB();
  });

  // ---- Ambient sparkle field (kept in both themes, tinted with the live gold token) ----
  const canvas = document.getElementById('sparkle-canvas');
  const ctx = canvas.getContext('2d');
  let sparkles = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sparkleGoldTarget = currentGoldRGB();
  let sparkleGoldCurrent = { ...sparkleGoldTarget };

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function initSparkles(){
    sparkles = Array.from({length: 46}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.006
    }));
  }
  initSparkles();

  function drawSparkles(t){
    // ease the sparkle tint toward whichever theme's gold token is active,
    // so the ambient field crossfades in step with the rest of the page
    sparkleGoldCurrent.r += (sparkleGoldTarget.r - sparkleGoldCurrent.r) * 0.04;
    sparkleGoldCurrent.g += (sparkleGoldTarget.g - sparkleGoldCurrent.g) * 0.04;
    sparkleGoldCurrent.b += (sparkleGoldTarget.b - sparkleGoldCurrent.b) * 0.04;
    const { r, g, b } = sparkleGoldCurrent;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach(s => {
      const twinkle = (Math.sin(t * s.speed + s.phase) + 1) / 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.22 + twinkle * 0.58})`;
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(drawSparkles);
  }
  requestAnimationFrame(drawSparkles);

  // ---- Scroll reveal ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- Search: hover/focus opens the flyout, typing filters the collection live ----
  const searchWrap = document.getElementById('searchWrap');
  const searchTrigger = document.getElementById('searchTrigger');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchEmpty = document.getElementById('searchEmpty');
  const pieceCards = Array.from(document.querySelectorAll('.piece-card'));

  function setSearchOpen(open){
    searchWrap.classList.toggle('search-open', open);
    searchTrigger.setAttribute('aria-expanded', String(open));
  }

  // Click/tap toggles it too, so it works without a hover-capable pointer
  searchTrigger.addEventListener('click', () => {
    const nowOpen = !searchWrap.classList.contains('search-open');
    setSearchOpen(nowOpen);
    if (nowOpen) setTimeout(() => searchInput.focus(), 200);
  });

  searchForm.addEventListener('submit', (e) => e.preventDefault());

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (e.key === 'Escape'){
      searchInput.value = '';
      runSearch('');
      setSearchOpen(false);
      searchTrigger.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) setSearchOpen(false);
  });

  function runSearch(query){
    const q = query.trim().toLowerCase();
    let anyVisible = false;
    pieceCards.forEach(card => {
      const match = !q || card.textContent.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    searchEmpty.hidden = anyVisible;
  }

  searchInput.addEventListener('input', () => runSearch(searchInput.value));

  // ---- Cart: add-to-bag buttons feed a slide-in bag panel on the right ----
  const cart = [];
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartClose');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsEl = document.getElementById('cartItems');
  const cartSubtotalEl = document.getElementById('cartSubtotal');

  function money(n){ return '$' + n.toLocaleString('en-US'); }

  function renderCart(){
    cartItemsEl.innerHTML = '';

    if (cart.length === 0){
      const empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'Your bag is empty — browse the collection and add a piece.';
      cartItemsEl.appendChild(empty);
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
          <div class="cart-row-img" style="background-image:url('${item.image}')"></div>
          <div class="cart-row-body">
            <div class="cart-row-top">
              <h4>${item.name}</h4>
              <button class="cart-row-remove" data-id="${item.id}" aria-label="Remove ${item.name}">&times;</button>
            </div>
            <span class="cart-row-material">${item.material}</span>
            <div class="cart-row-bottom">
              <div class="cart-qty">
                <button class="qty-btn" data-id="${item.id}" data-dir="-1" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-id="${item.id}" data-dir="1" aria-label="Increase quantity">+</button>
              </div>
              <span class="cart-row-price">${money(item.price * item.qty)}</span>
            </div>
          </div>`;
        cartItemsEl.appendChild(row);
      });
    }

    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    cartBadge.hidden = count === 0;
    cartBadge.textContent = String(count);

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    cartSubtotalEl.textContent = money(subtotal);
  }

  function addToCart(item){
    const existing = cart.find(i => i.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    renderCart();
    openCart();
  }

  function openCart(){
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeCart(){
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartTrigger.setAttribute('aria-expanded', 'false');
  }

  cartTrigger.addEventListener('click', () => {
    cartPanel.classList.contains('open') ? closeCart() : openCart();
  });
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  cartItemsEl.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.cart-row-remove');
    if (removeBtn){
      const idx = cart.findIndex(i => i.id === removeBtn.dataset.id);
      if (idx > -1) cart.splice(idx, 1);
      renderCart();
      return;
    }
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn){
      const item = cart.find(i => i.id === qtyBtn.dataset.id);
      if (item){
        item.qty += Number(qtyBtn.dataset.dir);
        if (item.qty <= 0){
          const idx = cart.findIndex(i => i.id === item.id);
          cart.splice(idx, 1);
        }
      }
      renderCart();
    }
  });

  document.querySelectorAll('.piece-add').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        material: btn.dataset.material,
        image: btn.dataset.image
      });
    });
  });

  renderCart();
