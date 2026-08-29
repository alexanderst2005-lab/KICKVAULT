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

// Disable browser scroll memory on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function resetScrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Reset scroll instantly before DOM load
resetScrollToTop();

// App Initialization with Defensive Error Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Always force scroll to top on reload
  resetScrollToTop();
  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
  }

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

window.addEventListener('load', resetScrollToTop);
window.addEventListener('pageshow', resetScrollToTop);

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

function showSizeGuideToast(e) {
  if (e) e.preventDefault();
  openSizeGuideModal(e);
}

function openSizeGuideModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('size-guide-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    showToast("📐 Tabla de Tallas KICKVAULT: 38 (24.5cm) · 39 (25cm) · 40 (25.5cm) · 41 (26.5cm) · 42 (27cm) · 43 (28cm) · 44 (28.5cm)");
  }
}

function closeSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

const PRODUCTS_STORAGE_KEY = 'kickvault_custom_products_v1';

function getActiveProductsCatalog() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("KICKVAULT: Error al leer catálogo de localStorage:", e);
  }
  return (typeof KICKVAULT_PRODUCTS !== 'undefined') ? KICKVAULT_PRODUCTS : [];
}

function saveActiveProductsCatalog(productsList) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsList));
  } catch (e) {
    console.error("KICKVAULT: Error guardando catálogo en localStorage:", e);
  }
}

function createProductCardHTML(product) {
  if (!product) return '';
  const isFav = favorites.has(product.id);
  const isSoldOut = product.isSoldOut || product.stock === 0;

  // If sold out, ONLY show AGOTADO badge. Hide all other badges!
  let badgesArr = [];
  if (isSoldOut) {
    badgesArr = ["AGOTADO"];
  } else {
    badgesArr = [...(product.badges || [])];
  }

  const badgesHTML = badgesArr.map(b => {
    const isSoldOutBadge = b.includes("AGOTADO");
    const isNeon = b.includes("EDICIÓN") || b.includes("NUEV") || b.includes("EXCLUSIVO") || b.includes("TENDENCIA");
    return `<span class="badge ${isSoldOutBadge ? 'badge-soldout' : (isNeon ? 'badge-neon' : '')}" style="${isSoldOutBadge ? 'background: #ff2a5f; color: #fff;' : ''}">${b}</span>`;
  }).join('');

  const displayPrice = product.formattedPrice || formatCOP(product.price);

  return `
    <div class="product-card ${isSoldOut ? 'sold-out' : ''}" data-id="${product.id}" onclick="openProductModal('${product.id}', 'view')" style="cursor: pointer;">
      <div class="product-media">
        <div class="card-badges">${badgesHTML}</div>
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${product.id}', event)" title="Guardar en favoritos">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#ff2a5f' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img src="${(product.images && product.images[0]) ? product.images[0] : 'https://via.placeholder.com/400'}" alt="${product.name}" loading="lazy" decoding="async" fetchpriority="high">
        <div class="hover-overlay">
          <button class="btn btn-primary" onclick="openProductModal('${product.id}', 'view'); event.stopPropagation();">${isSoldOut ? 'VER DETALLES' : 'VER MODELO →'}</button>
        </div>
      </div>

      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-color">${product.color}</p>
        
        <div class="product-footer">
          <span class="product-price">${displayPrice}</span>
          <button class="btn btn-secondary" style="padding: 8px 14px; font-size: 0.78rem; font-weight: 700; ${isSoldOut ? 'border-color: #ff2a5f; color: #ff2a5f;' : ''}" onclick="openProductModal('${product.id}', 'size'); event.stopPropagation();">
            ${isSoldOut ? 'AGOTADO ❌' : 'VER TALLAS →'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   PURE IMAGE VIEWER (SOLO MUESTRA IMÁGENES DE LOS MODELOS)
   ========================================================================== */
function openPureImageViewer(productId) {
  const products = getActiveProductsCatalog();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('pure-image-viewer-modal');
  if (!modal) return;

  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"];

  const brandEl = document.getElementById('piv-brand');
  if (brandEl) brandEl.textContent = product.brand || 'KICKVAULT';

  const titleEl = document.getElementById('piv-title');
  if (titleEl) titleEl.textContent = product.name || 'FOTOS DEL MODELO';

  const mainImg = document.getElementById('piv-main-img');
  if (mainImg) mainImg.src = images[0];

  const thumbsBar = document.getElementById('piv-thumbs-bar');
  if (thumbsBar) {
    thumbsBar.innerHTML = images.map((imgUrl, idx) => `
      <img src="${imgUrl}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="switchPureImg('${imgUrl}', this)" alt="Vista ${idx + 1}" style="width: 110px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--neon-green)' : 'transparent'}; flex-shrink: 0;">
    `).join('');
  }

  // Force explicit active visibility to guarantee instant rendering
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  modal.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}

function switchPureImg(imgUrl, thumbEl) {
  const mainImg = document.getElementById('piv-main-img');
  if (mainImg) mainImg.src = imgUrl;

  const bar = document.getElementById('piv-thumbs-bar');
  if (bar) {
    bar.querySelectorAll('img').forEach(el => el.style.borderColor = 'transparent');
  }
  if (thumbEl) thumbEl.style.borderColor = 'var(--neon-green)';
}

function closePureImageViewer() {
  const modal = document.getElementById('pure-image-viewer-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = '';
    modal.style.opacity = '';
    modal.style.visibility = '';
    modal.style.pointerEvents = '';
  }
  document.body.style.overflow = '';
}

function renderNewDrops() {
  const container = document.getElementById('new-drops-grid');
  if (!container) return;
  const products = getActiveProductsCatalog();
  const newProducts = products.filter(p => p.isNew || p.id === 'kv-01' || p.id === 'kv-03' || p.id === 'kv-05' || p.id === 'kv-06');
  container.innerHTML = newProducts.map(p => createProductCardHTML(p)).join('');
}

function renderTrending() {
  const container = document.getElementById('trending-carousel');
  if (!container) return;
  const products = getActiveProductsCatalog();
  const trendingProducts = products.filter(p => p.isTrending || p.rating >= 4.8);
  container.innerHTML = trendingProducts.map(p => createProductCardHTML(p)).join('');
}

function renderCultureSection() {
  const container = document.getElementById('culture-grid');
  if (!container) return;
  if (typeof KICKVAULT_CULTURE === 'undefined') return;

  container.innerHTML = KICKVAULT_CULTURE.map(item => `
    <div class="culture-card">
      <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
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
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openProductModal('${product.id}'); closeFavoritesDrawer();">VER TALLAS</button>
          <button style="color: #ff4444; font-size: 0.75rem; text-decoration: underline;" onclick="toggleFavorite('${product.id}')">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   CART MANAGEMENT
   ========================================================================== */
function addToCart(product, size, qty = 1) {
  if (!product) return;
  if (product.isSoldOut || product.stock === 0) {
    showToast("⚠️ Este producto está actualmente AGOTADO y no se puede agregar al carrito.");
    return;
  }
  const existingIndex = cart.findIndex(item => item.productId === product.id && item.size === size);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: (product.images && product.images[0]) ? product.images[0] : '',
      size: size,
      qty: qty
    });
  }

  saveCart();
  showToast(`¡${product.name} (Talla ${size} EUR) agregado al carrito! 🛒`);
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
          <p style="font-size: 0.8rem; color: var(--neon-green); font-weight: 700; margin-bottom: 6px;">Talla: ${item.size} EUR</p>
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

  const headerTitle = document.querySelector('#cart-drawer-overlay .drawer-header h3');
  if (headerTitle) headerTitle.textContent = 'TU CARRITO DE COMPRAS';

  const footer = document.querySelector('#cart-drawer-overlay .drawer-footer');
  if (footer) footer.style.display = 'block';
}

function openCheckoutInDrawer() {
  if (cart.length === 0) {
    showToast("⚠️ Tu carrito de compras está vacío. Agrega una zapatilla primero.");
    return;
  }
  const container = document.getElementById('cart-items-container');
  const footer = document.querySelector('#cart-drawer-overlay .drawer-footer');
  const headerTitle = document.querySelector('#cart-drawer-overlay .drawer-header h3');

  if (headerTitle) headerTitle.textContent = 'DATOS DE ENVÍO 🚚';

  if (container) {
    container.innerHTML = `
      <div style="background: rgba(183, 255, 0, 0.05); border: 1.5px solid var(--border-active); padding: 14px; border-radius: var(--radius-md); margin-bottom: 14px;">
        <span class="badge badge-neon" style="margin-bottom: 4px;">COMPRA REAL KICKVAULT</span>
        <h4 style="font-size: 1.1rem; color: #fff; margin: 4px 0 6px 0;">INGRESA TUS DATOS DE ENTREGA 🚚</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Escribe tu información completa para registrar tu pedido en el sistema.</p>
      </div>

      <form id="drawer-checkout-form" onsubmit="submitDrawerCheckoutOrder(event)" style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">NOMBRE COMPLETO *</label>
          <input type="text" id="drawer-checkout-name" class="search-input-field" placeholder="Escribe tu nombre y apellido" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">TELÉFONO / WHATSAPP *</label>
            <input type="tel" id="drawer-checkout-phone" class="search-input-field" placeholder="Número de contacto" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">CORREO ELECTRÓNICO *</label>
            <input type="email" id="drawer-checkout-email" class="search-input-field" placeholder="tu@email.com" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">CIUDAD / MUNICIPIO *</label>
            <input type="text" id="drawer-checkout-city" class="search-input-field" placeholder="Ej. Bogotá, Medellín" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">BARRIO *</label>
            <input type="text" id="drawer-checkout-neighborhood" class="search-input-field" placeholder="Ej. Chapinero" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">DIRECCIÓN EXACTA (CASA / APTO) *</label>
          <input type="text" id="drawer-checkout-address" class="search-input-field" placeholder="Ej. Calle 100 #15-32 Apto 402" value="" required style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: #ccc;">NOTAS ADICIONALES (OPCIONAL)</label>
          <input type="text" id="drawer-checkout-notes" class="search-input-field" placeholder="Ej. Dejar en portería..." value="" style="font-size: 0.9rem; padding: 10px; width: 100%; box-sizing: border-box;">
        </div>

        <button type="submit" class="btn btn-primary btn-block" style="font-size: 1rem; padding: 14px; margin-top: 6px;">
          CONFIRMAR PEDIDO Y ENVIAR 🚀
        </button>

        <button type="button" class="btn btn-secondary btn-block" onclick="renderCartDrawer()" style="font-size: 0.85rem; padding: 10px; border-color: #555;">
          ← Volver a ver el carrito
        </button>
      </form>
    `;
  }

  if (footer) {
    footer.style.display = 'none';
  }
}

function submitDrawerCheckoutOrder(e) {
  if (e) e.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('drawer-checkout-name')?.value.trim() || "";
  const phone = document.getElementById('drawer-checkout-phone')?.value.trim() || "";
  const email = document.getElementById('drawer-checkout-email')?.value.trim() || "";
  const city = document.getElementById('drawer-checkout-city')?.value.trim() || "";
  const neighborhood = document.getElementById('drawer-checkout-neighborhood')?.value.trim() || "";
  const address = document.getElementById('drawer-checkout-address')?.value.trim() || "";
  const notes = document.getElementById('drawer-checkout-notes')?.value.trim() || "";

  if (!name || !phone || !email || !city || !address) {
    showToast("Por favor completa todos los campos requeridos para enviar tu pedido");
    return;
  }

  const orderNum = 'KV-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const fullAddressStr = `${address}${neighborhood ? ' (' + neighborhood + ')' : ''}, ${city}`;

  const newOrder = {
    orderId: orderNum,
    customer: name,
    phone: phone,
    email: email,
    city: city,
    neighborhood: neighborhood,
    address: fullAddressStr,
    notes: notes,
    date: dateStr,
    statusStep: 1,
    statusText: "Pedido recibido y confirmado en sistema KICKVAULT",
    trackingCarrier: "Servientrega Express",
    totalPrice: formatCOP(totalAmount),
    totalPriceNum: totalAmount,
    items: cart.map(item => ({
      name: item.name,
      size: item.size || 41,
      price: formatCOP(item.price),
      qty: item.qty || 1
    }))
  };

  // Save to persistent storage for Admin Panel
  const allOrders = loadAllOrders();
  allOrders.unshift(newOrder);
  saveAllOrders(allOrders);

  // Clear cart & reset drawer
  cart = [];
  saveCart();
  closeCartDrawer();
  renderCartDrawer();

  showToast(`¡Pedido ${orderNum} registrado con éxito! 🔥`);

  // Open Order Tracking Timeline Modal
  openTrackingModal();
  const inputEl = document.getElementById('tracking-input');
  if (inputEl) inputEl.value = orderNum;
  searchOrderTracking();
}

function updateModalSizeDisplay() {
  if (!currentSelectedProduct) return;

  const labelEl = document.getElementById('selected-size-label');
  if (labelEl) {
    labelEl.textContent = `${currentSelectedSize} EUR`;
  }

  const chipsContainer = document.getElementById('modal-size-selector');
  if (chipsContainer) {
    const availableSizes = currentSelectedProduct.sizes || [38, 39, 40, 41, 42, 43, 44];
    chipsContainer.innerHTML = availableSizes.map(sz => `
      <button class="size-chip ${sz === currentSelectedSize ? 'selected' : ''}" onclick="selectModalSize(${sz}, this)" style="padding: 10px 14px; font-size: 0.9rem; font-weight: 700; border-radius: 8px; border: 1.5px solid ${sz === currentSelectedSize ? 'var(--neon-green)' : '#333'}; background: ${sz === currentSelectedSize ? 'var(--neon-green)' : '#1a1a1a'}; color: ${sz === currentSelectedSize ? '#000' : '#fff'}; cursor: pointer;">
        ${sz}
      </button>
    `).join('');
  }
}

function selectModalSize(size, chipEl) {
  currentSelectedSize = size;
  if (currentSelectedProduct) {
    currentSelectedProduct._selectedSize = size;
  }
  updateModalSizeDisplay();
}

function switchModalToSizeMode() {
  const sizeBox = document.getElementById('modal-size-box');
  const openSizesBtn = document.getElementById('modal-open-sizes-btn');
  const addCartBtn = document.getElementById('modal-add-cart-btn');

  if (sizeBox) sizeBox.style.display = 'block';
  if (openSizesBtn) openSizesBtn.style.display = 'none';
  if (addCartBtn) addCartBtn.style.display = 'block';

  updateModalSizeDisplay();
}

/* ==========================================================================
   PRODUCT DETAIL MODAL (PROMINENT SIZE SELECTION)
   ========================================================================== */
function openProductModal(productId, mode = 'size') {
  const products = getActiveProductsCatalog();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentSelectedProduct = product;
  currentSelectedSize = product._selectedSize || (product.sizes && product.sizes[0]) || 41;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  const container = modal.querySelector('.modal-container');
  if (container) container.scrollTop = 0;

  const isSoldOut = product.isSoldOut || product.stock === 0;

  // Render Thumbnails
  const thumbsContainer = document.getElementById('modal-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = (product.images || []).map((img, idx) => `
      <img src="${img}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="switchModalMainImage('${img}', this)" alt="Vista ${idx + 1}">
    `).join('');
  }

  const mainImg = document.getElementById('modal-main-img');
  if (mainImg) mainImg.src = (product.images && product.images[0]) ? product.images[0] : '';
  
  const brandEl = document.getElementById('modal-brand');
  if (brandEl) brandEl.textContent = product.brand || 'EDICIÓN KICKVAULT';

  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = product.name || 'ZAPATILLA KICKVAULT';

  const priceEl = document.getElementById('modal-price');
  if (priceEl) {
    priceEl.innerHTML = `${formatCOP(product.price)} ${isSoldOut ? '<span class="badge badge-soldout" style="background: #ff2a5f; color: #fff; margin-left: 8px;">AGOTADO</span>' : ''}`;
  }

  const colorEl = document.getElementById('modal-color');
  if (colorEl) colorEl.textContent = product.color || 'EDICIÓN ESPECIAL';

  const descEl = document.getElementById('modal-desc');
  if (descEl) descEl.textContent = product.description || 'Diseño de alto rendimiento urbano.';

  // ALWAYS Show size box & Add to Cart button
  switchModalToSizeMode();

  const addCartBtn = document.getElementById('modal-add-cart-btn');
  if (addCartBtn) {
    if (isSoldOut) {
      addCartBtn.disabled = true;
      addCartBtn.textContent = 'PRODUCTO AGOTADO (SIN STOCK) ❌';
      addCartBtn.style.background = '#2b2b2b';
      addCartBtn.style.color = '#777';
      addCartBtn.style.cursor = 'not-allowed';
      addCartBtn.style.pointerEvents = 'none';
    } else {
      addCartBtn.disabled = false;
      addCartBtn.textContent = 'AGREGAR AL CARRITO +';
      addCartBtn.style.background = '';
      addCartBtn.style.color = '';
      addCartBtn.style.cursor = '';
      addCartBtn.style.pointerEvents = '';
    }
  }

  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  modal.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}

function switchModalToSizeMode() {
  if (currentSelectedProduct) {
    openProductModal(currentSelectedProduct.id, 'size');
  }
}

function updateModalSizeDisplay() {
  if (!currentSelectedProduct) return;
  
  const sizeLabelEl = document.getElementById('selected-size-label');
  if (sizeLabelEl) {
    sizeLabelEl.textContent = `${currentSelectedSize} EUR`;
  }

  const sizeContainer = document.getElementById('modal-size-selector');
  if (sizeContainer) {
    sizeContainer.innerHTML = (currentSelectedProduct.sizes || [38,39,40,41,42,43,44]).map(size => `
      <button class="size-chip ${size === currentSelectedSize ? 'selected' : ''}" onclick="selectModalSize(${size}, this)">
        ${size}
      </button>
    `).join('');
  }
}

function switchModalMainImage(imgUrl, thumbEl) {
  const mainImg = document.getElementById('modal-main-img');
  if (mainImg) mainImg.src = imgUrl;
  document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

function selectModalSize(size, chipEl) {
  currentSelectedSize = size;
  if (currentSelectedProduct) {
    currentSelectedProduct._selectedSize = size;
  }
  updateModalSizeDisplay();
}

function addCurrentModalToCart() {
  if (!currentSelectedProduct) return;
  if (currentSelectedProduct.isSoldOut || currentSelectedProduct.stock === 0) {
    showToast("⚠️ Este modelo se encuentra AGOTADO y no se puede comprar.");
    return;
  }
  addToCart(currentSelectedProduct, currentSelectedSize, 1);
  closeProductModal();
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = '';
    modal.style.opacity = '';
    modal.style.visibility = '';
    modal.style.pointerEvents = '';
  }
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
  const sizeMatch = q.match(/\b(3[6-9]|4[0-6])\b/);
  const targetSize = sizeMatch ? parseInt(sizeMatch[1], 10) : null;

  // Update active pill state
  document.querySelectorAll('.search-filter-pills .filter-pill').forEach(pill => {
    const pillText = pill.textContent.toLowerCase().trim();
    if (pillText === q || (q === '' && pillText === 'todas') || (targetSize && pillText.includes(targetSize.toString()))) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  const products = getActiveProductsCatalog();
  const filtered = products.filter(p => {
    const matchesText = 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      (p.style && p.style.toLowerCase().includes(q));

    const matchesSize = targetSize ? (Array.isArray(p.sizes) && p.sizes.includes(targetSize)) : false;

    return matchesText || matchesSize;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No se encontraron resultados para "${query}". Pruebe con una talla (ej. 39, 41, 42) o modelo ("Air Max", "Cyber").</p>`;
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

/* ==========================================================================
   ORDERS MANAGEMENT & ADMIN DASHBOARD
   ========================================================================== */
const ORDERS_STORAGE_KEY = 'kickvault_all_orders_v1';

function loadAllOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    let stored = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stored)) stored = [];
    
    // Merge sample orders if not present
    const sampleKeys = Object.keys(SAMPLE_ORDERS || {});
    sampleKeys.forEach(k => {
      if (!stored.some(o => o.orderId === k)) {
        stored.push(SAMPLE_ORDERS[k]);
      }
    });
    
    return stored;
  } catch (e) {
    console.warn("KICKVAULT: Error leyendo historial de pedidos:", e);
    return [];
  }
}

function saveAllOrders(ordersList) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersList));
  } catch (e) {
    console.error("Error guardando historial de pedidos:", e);
  }
}

function searchOrderTracking() {
  const inputEl = document.getElementById('tracking-input');
  const input = inputEl ? inputEl.value.trim().toUpperCase() : 'KV-1048';
  const resultBox = document.getElementById('tracking-result-box');
  if (!resultBox) return;

  const allOrders = loadAllOrders();
  const orderData = allOrders.find(o => o.orderId === input) || {
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
        <span class="badge badge-neon">${orderData.trackingCarrier || 'KICKVAULT Express'}</span>
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

function processCheckout() {
  if (cart.length === 0) return;
  closeCartDrawer();
  openCheckoutModal();
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-form-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-form-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function submitCheckoutOrder(e) {
  if (e) e.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('checkout-name')?.value.trim() || "";
  const phone = document.getElementById('checkout-phone')?.value.trim() || "";
  const email = document.getElementById('checkout-email')?.value.trim() || "";
  const city = document.getElementById('checkout-city')?.value.trim() || "";
  const neighborhood = document.getElementById('checkout-neighborhood')?.value.trim() || "";
  const address = document.getElementById('checkout-address')?.value.trim() || "";
  const notes = document.getElementById('checkout-notes')?.value.trim() || "";

  if (!name || !phone || !email || !city || !address) {
    showToast("Por favor completa todos los campos requeridos para enviar tu pedido");
    return;
  }

  const orderNum = 'KV-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const fullAddressStr = `${address}${neighborhood ? ' (' + neighborhood + ')' : ''}, ${city}`;

  const newOrder = {
    orderId: orderNum,
    customer: name,
    phone: phone,
    email: email,
    city: city,
    neighborhood: neighborhood,
    address: fullAddressStr,
    notes: notes,
    date: dateStr,
    statusStep: 1,
    statusText: "Pedido recibido y confirmado en sistema KICKVAULT",
    trackingCarrier: "Servientrega Express",
    totalPrice: formatCOP(totalAmount),
    totalPriceNum: totalAmount,
    items: cart.map(item => ({
      name: item.name,
      size: item.size || 41,
      price: formatCOP(item.price),
      qty: item.qty || 1
    }))
  };

  // Save to persistent storage for Admin
  const allOrders = loadAllOrders();
  allOrders.unshift(newOrder);
  saveAllOrders(allOrders);

  // Clear cart & reset form
  cart = [];
  saveCart();
  closeCheckoutModal();

  const formEl = document.getElementById('checkout-form');
  if (formEl) formEl.reset();

  showToast(`¡Pedido ${orderNum} registrado con éxito! 🔥`);

  // Open Order Tracking Modal for Customer
  openTrackingModal();
  const inputEl = document.getElementById('tracking-input');
  if (inputEl) inputEl.value = orderNum;
  searchOrderTracking();
}

function openAdminOrdersModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('admin-orders-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderAdminOrdersList();
  }
}

function closeAdminOrdersModal() {
  const modal = document.getElementById('admin-orders-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

const ORDERS_STORAGE_KEY = 'kickvault_all_orders_v1';

function getInitialSampleOrders() {
  return [
    {
      orderId: "KV-8921",
      customer: "Mateo Alexander",
      phone: "3001234567",
      email: "mateo@kickvault.co",
      city: "Bogotá",
      neighborhood: "Chapinero Alto",
      address: "Calle 67 #12-45 Apto 502 (Chapinero Alto), Bogotá",
      notes: "Timbrar en la portería principal",
      date: "28 de agosto, 2026 - 22:30",
      statusStep: 1,
      statusText: "Pedido recibido y confirmado en sistema KICKVAULT",
      trackingCarrier: "Servientrega Express",
      totalPrice: "$1.599.800 COP",
      totalPriceNum: 1599800,
      items: [
        { name: "CYBER FORCE HIGH ED. 01", size: 38, price: "$899.900 COP", qty: 1 },
        { name: "AIR MAX URBAN X", size: 42, price: "$699.900 COP", qty: 1 }
      ]
    }
  ];
}

function loadAllOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      const sample = getInitialSampleOrders();
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error loading orders from localStorage:", e);
    return getInitialSampleOrders();
  }
}

function saveAllOrders(ordersArray) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersArray));
  } catch (e) {
    console.error("Error saving orders to localStorage:", e);
  }
}

function renderAdminOrdersList() {
  const listEl = document.getElementById('admin-orders-list');
  const countEl = document.getElementById('admin-total-orders-count');
  const salesEl = document.getElementById('admin-total-sales-sum');
  const pendingEl = document.getElementById('admin-pending-orders-count');
  if (!listEl) return;

  const orders = loadAllOrders();

  let totalSales = 0;
  let pendingCount = 0;

  orders.forEach(o => {
    if (o.totalPriceNum) totalSales += o.totalPriceNum;
    if (o.statusStep < 4) pendingCount++;
  });

  if (countEl) countEl.textContent = orders.length;
  if (salesEl) salesEl.textContent = formatCOP(totalSales);
  if (pendingEl) pendingEl.textContent = pendingCount;

  if (orders.length === 0) {
    listEl.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px;">No hay pedidos registrados en el sistema.</p>`;
    return;
  }

  listEl.innerHTML = orders.map(order => `
    <div style="background: #141414; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <div>
          <span style="color: var(--neon-green); font-family: var(--font-heading); font-size: 1.4rem;">Nº ${order.orderId}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 10px;">${order.date}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <select onchange="updateOrderStatus('${order.orderId}', this.value)" style="background: #222; color: var(--neon-green); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">
            <option value="1" ${order.statusStep == 1 ? 'selected' : ''}>1. Confirmado</option>
            <option value="2" ${order.statusStep == 2 ? 'selected' : ''}>2. En Preparación</option>
            <option value="3" ${order.statusStep == 3 ? 'selected' : ''}>3. En Camino</option>
            <option value="4" ${order.statusStep == 4 ? 'selected' : ''}>4. Entregado</option>
          </select>
          <button onclick="deleteOrderAdmin('${order.orderId}')" style="color: #ff4444; font-size: 0.8rem; text-decoration: underline; background: none; border: none; cursor: pointer;">Eliminar</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 0.88rem;">
        <div>
          <p style="color: #fff; font-weight: 700;">👤 Cliente: ${order.customer}</p>
          <p style="color: #bbb;">📱 Teléfono: ${order.phone || 'No registrado'}</p>
          <p style="color: #bbb;">🏠 Dirección: ${order.address}</p>
        </div>
        <div>
          <p style="color: var(--neon-green); font-weight: 800; font-size: 1.1rem;">Total: ${order.totalPrice || '$0 COP'}</p>
          <p style="color: #aaa; font-size: 0.82rem;">📍 Estado: ${order.statusText}</p>
        </div>
      </div>

      <div style="background: #090909; padding: 10px; border-radius: var(--radius-sm); font-size: 0.85rem;">
        <span style="font-weight: 700; color: var(--neon-green);">Productos comprados:</span>
        <ul style="margin-left: 18px; color: #ddd; margin-top: 4px;">
          ${(order.items || []).map(i => `<li>${i.name} — <strong>Talla ${i.size} EUR</strong> (x${i.qty || 1}) - ${i.price}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function updateOrderStatus(orderId, newStep) {
  const orders = loadAllOrders();
  const target = orders.find(o => o.orderId === orderId);
  if (!target) return;

  const step = parseInt(newStep, 10);
  target.statusStep = step;

  const statusTexts = {
    1: "Pedido recibido y confirmado en sistema KICKVAULT",
    2: "Preparando pedido en bodega principal KICKVAULT",
    3: "En tránsito - Pedido enviado con la transportadora",
    4: "Pedido entregado satisfactoriamente al cliente"
  };

  target.statusText = statusTexts[step] || target.statusText;
  saveAllOrders(orders);
  renderAdminOrdersList();
  showToast(`Estado del pedido ${orderId} actualizado`);
}

function deleteOrderAdmin(orderId) {
  let orders = loadAllOrders();
  orders = orders.filter(o => o.orderId !== orderId);
  saveAllOrders(orders);
  renderAdminOrdersList();
  showToast(`Pedido ${orderId} eliminado`);
}

function clearTestOrders() {
  saveAllOrders([]);
  renderAdminOrdersList();
  showToast("Historial de pedidos limpiado");
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
