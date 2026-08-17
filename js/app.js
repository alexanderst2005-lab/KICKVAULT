// KICKVAULT - Lógica de Aplicación, Persistencia Robusta y Gestión de Estado

// Local Storage Keys
const CART_STORAGE_KEY = 'kickvault_cart_v1';
const FAV_STORAGE_KEY = 'kickvault_favs_v1';

// Safe Local Storage Loaders to prevent any initialization black screen crashes
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("KICKVAULT: Error al leer el carrito de localStorage, reiniciando:", e);
    return [];
  }
}

function loadFavsFromStorage() {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    console.warn("KICKVAULT: Error al leer favoritos de localStorage, reiniciando:", e);
    return new Set();
  }
}

// Global State
let cart = loadCartFromStorage();
let favorites = loadFavsFromStorage();

// Quiz State
let quizCurrentStep = 1;
let quizAnswers = {
  purpose: null,
  budget: null,
  color: null
};

// Modal Selected Product State
let currentSelectedProduct = null;
let currentSelectedSize = 41;

// Currency Formatter: $699.900 COP
function formatCOP(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0 COP';
  return `$${amount.toLocaleString('es-CO')} COP`;
}

// App Initialization with Defensive Error Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Ensure body scroll is unlocked on reload
  document.body.style.overflow = '';
  document.body.style.display = 'block';

  // Ensure modals/drawers are closed on fresh reload
  document.querySelectorAll('.modal-overlay, .drawer-overlay').forEach(el => {
    el.classList.remove('active');
  });

  // Safe Section Initializations
  runSafely(initCountdowns, "Contador de Lanzamiento");
  runSafely(renderNewDrops, "Nuevos Lanzamientos");
  runSafely(renderTrending, "Más Buscadas");
  runSafely(renderCultureSection, "Sección Cultura");
  runSafely(updateHeaderCounters, "Contadores del Encabezado");
  runSafely(setupQuiz, "Test Encuentra tu Zapatilla");
  runSafely(setupSearch, "Buscador");
});

function runSafely(fn, label) {
  try {
    fn();
  } catch (err) {
    console.error(`KICKVAULT: Error en ${label}:`, err);
  }
}

/* ==========================================================================
   STATE PERSISTENCE & HEADERS
   ========================================================================== */
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Error guardando carrito en localStorage:", e);
  }
  updateHeaderCounters();
}

function saveFavorites() {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch (e) {
    console.error("Error guardando favoritos en localStorage:", e);
  }
  updateHeaderCounters();
}

function updateHeaderCounters() {
  const cartCounters = document.querySelectorAll('.cart-count');
  const favCounters = document.querySelectorAll('.fav-count');

  const totalCartItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const totalFavItems = favorites.size;

  cartCounters.forEach(el => {
    el.textContent = totalCartItems;
    el.style.display = totalCartItems > 0 ? 'flex' : 'none';
  });

  favCounters.forEach(el => {
    el.textContent = totalFavItems;
    el.style.display = totalFavItems > 0 ? 'flex' : 'none';
  });
}

function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b7ff00" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

/* ==========================================================================
   PRODUCT RENDERING & CARDS
   ========================================================================== */
function createProductCardHTML(product) {
  if (!product) return '';
  const isFav = favorites.has(product.id);
  const badgesHTML = (product.badges || []).map(b => {
    const isNeon = b.includes("EDICIÓN") || b.includes("NUEV") || b.includes("EXCLUSIVO");
    return `<span class="badge ${isNeon ? 'badge-neon' : ''}">${b}</span>`;
  }).join('');

  const displayPrice = product.formattedPrice || formatCOP(product.price);

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-media">
        <div class="card-badges">${badgesHTML}</div>
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${product.id}', event)" title="Favorito">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#ff2a5f' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'">
        <div class="hover-overlay">
          <button class="btn btn-primary" onclick="openProductModal('${product.id}')">VER PRODUCTO →</button>
        </div>
      </div>
      <div class="product-info" onclick="openProductModal('${product.id}')" style="cursor: pointer;">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-color">${product.color}</p>
        <div class="product-footer">
          <span class="product-price">${displayPrice}</span>
          <button class="btn-add-cart-icon" onclick="quickAddToCart('${product.id}', event)" title="Agregar al Carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderNewDrops() {
  const container = document.getElementById('new-drops-grid');
  if (!container) return;
  if (typeof KICKVAULT_PRODUCTS === 'undefined' || !Array.isArray(KICKVAULT_PRODUCTS)) {
    container.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">Cargando catálogo KICKVAULT...</p>`;
    return;
  }

  const newProducts = KICKVAULT_PRODUCTS.filter(p => p.isNew || p.id === 'kv-01' || p.id === 'kv-03' || p.id === 'kv-05' || p.id === 'kv-06');
  container.innerHTML = newProducts.map(p => createProductCardHTML(p)).join('');
}

function renderTrending() {
  const container = document.getElementById('trending-carousel');
  if (!container) return;
  if (typeof KICKVAULT_PRODUCTS === 'undefined' || !Array.isArray(KICKVAULT_PRODUCTS)) return;

  const trendingProducts = KICKVAULT_PRODUCTS.filter(p => p.isTrending || p.rating >= 4.8);
  container.innerHTML = trendingProducts.map(p => createProductCardHTML(p)).join('');
}

function renderCultureSection() {
  const container = document.getElementById('culture-grid');
  if (!container) return;
  if (typeof KICKVAULT_CULTURE === 'undefined') return;

  container.innerHTML = KICKVAULT_CULTURE.map(item => `
    <div class="culture-card">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="culture-overlay">
        <span class="badge badge-neon" style="width: fit-content; margin-bottom: 8px;">${item.subtitle}</span>
        <h3 style="font-family: var(--font-heading); font-size: 2rem; margin-bottom: 8px;">${item.title}</h3>
        <p style="font-size: 0.88rem; color: #ccc;">${item.desc}</p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   FAVORITES MANAGEMENT
   ========================================================================== */
function toggleFavorite(productId, event) {
  if (event) event.stopPropagation();
  if (favorites.has(productId)) {
    favorites.delete(productId);
    showToast('Producto eliminado de tus favoritos');
  } else {
    favorites.add(productId);
    showToast('¡Agregado a tus favoritos! ❤️');
  }
  saveFavorites();
  
  // Refresh card fav icons
  document.querySelectorAll(`.product-card[data-id="${productId}"] .btn-fav`).forEach(btn => {
    const active = favorites.has(productId);
    btn.classList.toggle('active', active);
    btn.querySelector('svg').setAttribute('fill', active ? '#ff2a5f' : 'none');
  });

  renderFavoritesDrawer();
}

function renderFavoritesDrawer() {
  const container = document.getElementById('fav-items-container');
  if (!container) return;

  if (favorites.size === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5" style="margin-bottom: 16px;">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 20px;">Todavía no tienes zapatillas guardadas en tus favoritas.</p>
        <button class="btn btn-primary" onclick="closeFavoritesDrawer(); scrollToSection('lanzamientos');">EXPLORAR COLECCIÓN</button>
      </div>
    `;
    return;
  }

  const favProducts = KICKVAULT_PRODUCTS.filter(p => favorites.has(p.id));
  container.innerHTML = favProducts.map(product => `
    <div class="cart-item">
      <img src="${product.images[0]}" alt="${product.name}" class="cart-item-img">
      <div style="flex-grow: 1;">
        <h4 style="font-size: 0.95rem; margin-bottom: 4px;">${product.name}</h4>
        <p style="color: var(--neon-green); font-weight: 700; font-size: 0.9rem;">${formatCOP(product.price)}</p>
        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="quickAddToCart('${product.id}')">AGREGAR</button>
          <button style="color: #ff4444; font-size: 0.75rem; text-decoration: underline;" onclick="toggleFavorite('${product.id}')">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   CART MANAGEMENT
   ========================================================================== */
function quickAddToCart(productId, event) {
  if (event) event.stopPropagation();
  const product = KICKVAULT_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  addToCart(product, 41, 1);
}

function addToCart(product, size, qty = 1) {
  const existingIndex = cart.findIndex(item => item.productId === product.id && item.size === size);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: size,
      qty: qty
    });
  }

  saveCart();
  showToast(`¡${product.name} (Talla ${size}) agregado al carrito! 🛒`);
  renderCartDrawer();
  openCartDrawer();
}

function updateCartQty(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    renderCartDrawer();
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5" style="margin-bottom: 16px;">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 20px;">Tu carrito de compras está vacío.</p>
        <button class="btn btn-primary" onclick="closeCartDrawer(); scrollToSection('lanzamientos');">DESCUBRIR ZAPATILLAS</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatCOP(0);
    if (totalEl) totalEl.textContent = formatCOP(0);
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div style="flex-grow: 1;">
          <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${item.name}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">Talla: ${item.size}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="qty-control">
              <button onclick="updateCartQty(${index}, -1)">−</button>
              <span style="font-weight: 700; font-size: 0.9rem;">${item.qty}</span>
              <button onclick="updateCartQty(${index}, 1)">+</button>
            </div>
            <span style="font-weight: 700; color: var(--neon-green); font-size: 0.95rem;">${formatCOP(itemTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
  if (totalEl) totalEl.textContent = formatCOP(subtotal);
}

/* ==========================================================================
   PRODUCT DETAIL MODAL
   ========================================================================== */
function openProductModal(productId) {
  const product = KICKVAULT_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentSelectedProduct = product;
  currentSelectedSize = (product.sizes && product.sizes[0]) || 41;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  // Render Thumbnails
  const thumbsContainer = document.getElementById('modal-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = (product.images || []).map((img, idx) => `
      <img src="${img}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="switchModalMainImage('${img}', this)" alt="Vista ${idx + 1}">
    `).join('');
  }

  // Render Sizes
  const sizeContainer = document.getElementById('modal-size-selector');
  if (sizeContainer) {
    sizeContainer.innerHTML = (product.sizes || [38,39,40,41,42,43,44]).map(size => `
      <button class="size-chip ${size === currentSelectedSize ? 'selected' : ''}" onclick="selectModalSize(${size}, this)">${size}</button>
    `).join('');
  }

  const mainImg = document.getElementById('modal-main-img');
  if (mainImg) mainImg.src = product.images[0];
  
  const brandEl = document.getElementById('modal-brand');
  if (brandEl) brandEl.textContent = product.brand;

  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.getElementById('modal-price');
  if (priceEl) priceEl.textContent = formatCOP(product.price);

  const colorEl = document.getElementById('modal-color');
  if (colorEl) colorEl.textContent = product.color;

  const descEl = document.getElementById('modal-desc');
  if (descEl) descEl.textContent = product.description;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function switchModalMainImage(imgUrl, thumbEl) {
  const mainImg = document.getElementById('modal-main-img');
  if (mainImg) mainImg.src = imgUrl;
  document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

function selectModalSize(size, chipEl) {
  currentSelectedSize = size;
  document.querySelectorAll('.size-chip').forEach(el => el.classList.remove('selected'));
  if (chipEl) chipEl.classList.add('selected');
}

function addCurrentModalToCart() {
  if (!currentSelectedProduct) return;
  addToCart(currentSelectedProduct, currentSelectedSize, 1);
  closeProductModal();
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   DRAWER INTERACTION CONTROLLERS
   ========================================================================== */
function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cart-drawer-overlay');
  if (drawer) drawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer-overlay');
  if (drawer) drawer.classList.remove('active');
  document.body.style.overflow = '';
}

function openFavoritesDrawer() {
  renderFavoritesDrawer();
  const drawer = document.getElementById('fav-drawer-overlay');
  if (drawer) drawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFavoritesDrawer() {
  const drawer = document.getElementById('fav-drawer-overlay');
  if (drawer) drawer.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   COUNTDOWN TIMER (LIMITED DROP)
   ========================================================================== */
function initCountdowns() {
  let seconds = 3 * 3600 + 18 * 60 + 42; // 03:18:42
  const timerHours = document.getElementById('timer-hours');
  const timerMins = document.getElementById('timer-mins');
  const timerSecs = document.getElementById('timer-secs');

  if (!timerHours || !timerMins || !timerSecs) return;

  setInterval(() => {
    if (seconds > 0) seconds--;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    timerHours.textContent = String(h).padStart(2, '0');
    timerMins.textContent = String(m).padStart(2, '0');
    timerSecs.textContent = String(s).padStart(2, '0');
  }, 1000);
}

/* ==========================================================================
   QUIZ "ENCUENTRA TU ZAPATILLA" WIZARD
   ========================================================================== */
const QUIZ_QUESTIONS = [
  {
    step: 1,
    title: "01 — ¿PARA QUÉ LAS QUIERES?",
    field: "purpose",
    options: [
      { label: "Urbano", desc: "Para destacar en las calles de la ciudad" },
      { label: "Deporte", desc: "Rendimiento y máxima comodidad física" },
      { label: "Uso diario", desc: "Para llevar cómodamente todo el día" },
      { label: "Salir", desc: "Eventos, noche y momentos exclusivos" }
    ]
  },
  {
    step: 2,
    title: "02 — ¿CUÁL ES TU PRESUPUESTO?",
    field: "budget",
    options: [
      { label: "Hasta $500.000 COP", max: 500000 },
      { label: "$500.000 - $700.000 COP", min: 500000, max: 700000 },
      { label: "$700.000 - $850.000 COP", min: 700000, max: 850000 },
      { label: "Más de $850.000 COP", min: 850000 }
    ]
  },
  {
    step: 3,
    title: "03 — ¿QUÉ COLOR PREFIERES?",
    field: "color",
    options: [
      { label: "⚫ Negro", val: "negro" },
      { label: "⚪ Blanco", val: "blanco" },
      { label: "🟢 Verde Neón", val: "verde" },
      { label: "🔴 Rojo", val: "rojo" }
    ]
  }
];

function setupQuiz() {
  renderQuizStep();
}

function renderQuizStep() {
  const container = document.getElementById('quiz-step-content');
  const dot1 = document.getElementById('quiz-dot-1');
  const dot2 = document.getElementById('quiz-dot-2');
  const dot3 = document.getElementById('quiz-dot-3');

  if (!container) return;

  [dot1, dot2, dot3].forEach((dot, idx) => {
    if (dot) {
      dot.classList.toggle('active', idx + 1 === quizCurrentStep);
      dot.classList.toggle('completed', idx + 1 < quizCurrentStep);
    }
  });

  if (quizCurrentStep > 3) {
    renderQuizResults();
    return;
  }

  const q = QUIZ_QUESTIONS[quizCurrentStep - 1];
  const currentValue = quizAnswers[q.field];

  container.innerHTML = `
    <h3 class="quiz-question-title">${q.title}</h3>
    <div class="quiz-options-grid">
      ${q.options.map((opt) => {
        const isSelected = currentValue === (opt.val || opt.label);
        return `
          <button class="quiz-opt-btn ${isSelected ? 'selected' : ''}" onclick="selectQuizOption('${q.field}', '${opt.val || opt.label}')">
            <span>${opt.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        `;
      }).join('')}
    </div>
    <div class="quiz-nav-btns">
      ${quizCurrentStep > 1 ? `<button class="btn btn-secondary" onclick="quizPrevStep()">← Anterior</button>` : '<div></div>'}
      <button class="btn btn-primary" onclick="quizNextStep()" ${!quizAnswers[q.field] ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Siguiente →</button>
    </div>
  `;
}

function selectQuizOption(field, value) {
  quizAnswers[field] = value;
  renderQuizStep();
}

function quizNextStep() {
  if (quizCurrentStep <= 3) {
    quizCurrentStep++;
    renderQuizStep();
  }
}

function quizPrevStep() {
  if (quizCurrentStep > 1) {
    quizCurrentStep--;
    renderQuizStep();
  }
}

function renderQuizResults() {
  const container = document.getElementById('quiz-step-content');
  
  let results = (KICKVAULT_PRODUCTS || []).filter(p => {
    if (quizAnswers.color && p.colorCategory === quizAnswers.color) return true;
    if (quizAnswers.purpose && p.purpose === quizAnswers.purpose) return true;
    return true;
  }).slice(0, 3);

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge badge-neon" style="margin-bottom: 10px;">¡COMBINACIÓN ENCONTRADA!</span>
      <h3 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 8px;">ENCONTRAMOS TU ESTILO PERFECTO</h3>
      <p style="color: var(--text-muted);">Estas son las 3 zapatillas recomendadas para tus preferencias de estilo:</p>
    </div>
    <div class="product-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
      ${results.map(p => createProductCardHTML(p)).join('')}
    </div>
    <div style="text-align: center;">
      <button class="btn btn-secondary" onclick="resetQuiz()">REPETIR TEST 🔄</button>
    </div>
  `;
}

function resetQuiz() {
  quizCurrentStep = 1;
  quizAnswers = { purpose: null, budget: null, color: null };
  renderQuizStep();
}

/* ==========================================================================
   SEARCH & FILTERS OVERLAY
   ========================================================================== */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });
  }
}

function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  performSearch('');
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function performSearch(query) {
  const container = document.getElementById('search-results-grid');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();
  const filtered = (KICKVAULT_PRODUCTS || []).filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.color.toLowerCase().includes(q) ||
    p.style.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No se encontraron resultados para "${query}". Pruebe con "Air Max", "Cyber" o "Negro".</p>`;
  } else {
    container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
  }
}

/* ==========================================================================
   ORDER TRACKING SYSTEM
   ========================================================================== */
function setupOrderTracking() {}

function openTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function searchOrderTracking() {
  const inputEl = document.getElementById('tracking-input');
  const input = inputEl ? inputEl.value.trim().toUpperCase() : 'KV-1048';
  const resultBox = document.getElementById('tracking-result-box');
  if (!resultBox) return;

  const orderData = (typeof SAMPLE_ORDERS !== 'undefined' && SAMPLE_ORDERS[input]) || {
    orderId: input || "KV-1048",
    customer: "Cliente KICKVAULT",
    date: "Hoy",
    statusStep: 2,
    statusText: "Pedido procesado en centro de distribución principal",
    trackingCarrier: "Servientrega Express",
    items: [{ name: "AIR MAX URBAN X", size: 41, price: "$699.900 COP", qty: 1 }],
    address: "Dirección registrada"
  };

  const steps = [
    { num: 1, title: "Pedido confirmado", icon: "✓" },
    { num: 2, title: "Preparando pedido", icon: "✓" },
    { num: 3, title: "Pedido enviado", icon: "●" },
    { num: 4, title: "Pedido entregado", icon: "○" }
  ];

  resultBox.innerHTML = `
    <div style="background: #141414; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--neon-green);">Nº ${orderData.orderId}</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Cliente: ${orderData.customer} · ${orderData.date}</p>
        </div>
        <span class="badge badge-neon">${orderData.trackingCarrier}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; margin: 30px 0;">
        ${steps.map(step => {
          const isDone = step.num <= orderData.statusStep;
          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 34px; height: 34px; border-radius: 50%; background: ${isDone ? 'var(--neon-green)' : '#222'}; color: ${isDone ? '#000' : '#888'}; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                ${isDone ? step.icon : step.num}
              </div>
              <span style="font-size: 0.75rem; color: ${isDone ? '#fff' : '#666'}; font-weight: 600;">${step.title}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #090909; padding: 16px; border-radius: var(--radius-sm); font-size: 0.9rem; color: #ccc;">
        📍 <strong>Estado actual:</strong> ${orderData.statusText}<br>
        🏠 <strong>Destino:</strong> ${orderData.address}
      </div>
    </div>
  `;
}

/* ==========================================================================
   CHECKOUT SIMULATION
   ========================================================================== */
function processCheckout() {
  if (cart.length === 0) return;

  const orderNum = 'KV-' + Math.floor(1000 + Math.random() * 9000);
  
  cart = [];
  saveCart();
  closeCartDrawer();

  showToast(`¡Pedido ${orderNum} realizado con éxito! 🔥`);
  
  // Show Receipt Tracker
  openTrackingModal();
  const inputEl = document.getElementById('tracking-input');
  if (inputEl) inputEl.value = orderNum;
  searchOrderTracking();
}

/* ==========================================================================
   SMOOTH SCROLL HELPER
   ========================================================================== */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
