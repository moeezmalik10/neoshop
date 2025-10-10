// Entry: SPA-like front-end with simulated data/state and basic 3D hero

import { renderHomeView } from './views/home.js?v=20250121';
import { renderProductsView } from './views/products.js?v=20250121';
import { renderCartView } from './views/cart.js';
import { renderCheckoutView } from './views/checkout.js?v=20250123';
import { renderOrderConfirmationView } from './views/orderConfirmation.js?v=20250123';
import { renderWelcomeView } from './views/welcome.js';
import { createAuthView } from './views/auth.js?v=20250122';
import { createAdminLoginView } from './views/adminLogin.js';
import { createAdminDashboardView } from './views/adminDashboard.js';
import { createAdminProductsView } from './views/adminProducts.js';
import { createAdminOrdersView } from './views/adminOrders.js';
import { createAdminCustomersView } from './views/adminCustomers.js';
import { createAdminSecurityView } from './views/adminSecurity.js';
import { createAdminMarketingView } from './views/adminMarketing.js';
import { getCartCount, initCartStore, clearCartOnLogout, clearCart } from './store/cartStore.js';
import { clearWishlist } from './store/wishlistStore.js';
import { getWishlist, removeFromWishlist } from './store/wishlistStore.js?v=20250122';
import { useAuthStore } from './store/authStore.js';
import { initModal } from './ui/modal.js';
import { initFooter } from './utils/footer.js?v=20250122';
import { addToCart } from './store/cartStore.js';

// Note: do not hold a stale reference to view root; always query fresh in mountView
const yearEl = document.getElementById('year');
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const cartCountEls = document.querySelectorAll('[data-cart-count]');
const wishlistCountEls = document.querySelectorAll('[data-wishlist-count]');

function updateYear(){
  const y = new Date().getFullYear();
  if(yearEl) yearEl.textContent = String(y);
}

function updateCartCount(){
  const count = getCartCount();
  cartCountEls.forEach(el => el.textContent = String(count));
}

function updateWishlistCount(){
  const count = getWishlist().length;
  wishlistCountEls.forEach(el => el.textContent = String(count));
}

function restoreAppLayout(){
  const appRoot = document.getElementById('app');
  if (appRoot && !appRoot.querySelector('.view')) {
    // Restore the normal app layout
    appRoot.innerHTML = `
      <!-- Views render here -->
      <section class="view" id="view-root" aria-live="polite"></section>
    `;
  }
}

function mountView(){
  const hash = location.hash || '#/welcome';
  const route = hash.replace('#','');
  
  // Ensure normal app layout exists (auth page temporarily replaces it)
  restoreAppLayout();
  
  // Always fetch a fresh view root after potential restore
  const currentViewRoot = document.getElementById('view-root');
  if(!currentViewRoot) {
    console.error('view-root not found, restoring layout...');
    restoreAppLayout();
    const retryViewRoot = document.getElementById('view-root');
    if(!retryViewRoot) {
      console.error('Failed to create view-root');
      return;
    }
  }

  // Check authentication for protected routes
  const authStore = useAuthStore();
  const protectedRoutes = ['/orders', '/checkout']; // Cart is now accessible without login
  
  if (protectedRoutes.includes(route) && !authStore.isAuthenticated) {
    // Redirect to auth page if trying to access protected route
    window.location.hash = '#/auth';
    return;
  }
  
  // Scroll to top on route change
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  switch(route){
    case '/welcome':
      renderWelcomeView(document.getElementById('view-root'));
      break;
    case '/home':
      renderHomeView(document.getElementById('view-root'), updateCartCount);
      break;
    case '/products':
      renderProductsView(document.getElementById('view-root'), updateCartCount);
      break;
    case '/cart':
      renderCartView(document.getElementById('view-root'), updateCartCount);
      break;
    case '/checkout':
      renderCheckoutView(document.getElementById('view-root'), updateCartCount);
      break;
    case '/order-confirmation':
      const lastOrder = localStorage.getItem('lastOrder');
      const orderData = lastOrder ? JSON.parse(lastOrder) : null;
      renderOrderConfirmationView(document.getElementById('view-root'), orderData);
      break;
    case '/auth':
    case '/login':
      const authView = createAuthView();
      // Clear the entire app root and replace with auth view
      const appRoot = document.getElementById('app');
      appRoot.innerHTML = '';
      appRoot.appendChild(authView);
      break;
    case '/admin/login':
      const adminLoginView = createAdminLoginView();
      // Clear the entire app root and replace with admin login view
      const adminAppRoot = document.getElementById('app');
      adminAppRoot.innerHTML = '';
      adminAppRoot.appendChild(adminLoginView);
      break;
    case '/admin/dashboard':
      const adminDashboardView = createAdminDashboardView();
      // Clear the entire app root and replace with admin dashboard view
      const adminDashboardRoot = document.getElementById('app');
      adminDashboardRoot.innerHTML = '';
      adminDashboardRoot.appendChild(adminDashboardView);
      break;
    case '/admin/products':
      const adminProductsView = createAdminProductsView();
      // Clear the entire app root and replace with admin products view
      const adminProductsRoot = document.getElementById('app');
      adminProductsRoot.innerHTML = '';
      adminProductsRoot.appendChild(adminProductsView);
      break;
    case '/admin/orders':
      const adminOrdersView = createAdminOrdersView();
      // Clear the entire app root and replace with admin orders view
      const adminOrdersRoot = document.getElementById('app');
      adminOrdersRoot.innerHTML = '';
      adminOrdersRoot.appendChild(adminOrdersView);
      break;
    case '/admin/customers':
      const adminCustomersView = createAdminCustomersView();
      // Clear the entire app root and replace with admin customers view
      const adminCustomersRoot = document.getElementById('app');
      adminCustomersRoot.innerHTML = '';
      adminCustomersRoot.appendChild(adminCustomersView);
      break;
    case '/admin/security':
      const adminSecurityView = createAdminSecurityView();
      // Clear the entire app root and replace with admin security view
      const adminSecurityRoot = document.getElementById('app');
      adminSecurityRoot.innerHTML = '';
      adminSecurityRoot.appendChild(adminSecurityView);
      break;
    case '/admin/marketing':
      const adminMarketingView = createAdminMarketingView();
      // Clear the entire app root and replace with admin marketing view
      const adminMarketingRoot = document.getElementById('app');
      adminMarketingRoot.innerHTML = '';
      adminMarketingRoot.appendChild(adminMarketingView);
      break;
    default:
      renderWelcomeView(document.getElementById('view-root'));
  }
  initRevealAnimations();
  highlightActiveNav(route);
  updateWishlistCount();
}

function initNav(){
  if(!hamburger || !navList) return;
  hamburger.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navList.addEventListener('click', (e) => {
    if(e.target instanceof HTMLAnchorElement){
      navList.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Header wishlist button opens wishlist modal via footer util
  document.getElementById('wishlist-header-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const evt = new Event('click');
    document.getElementById('wishlist-btn')?.dispatchEvent(evt);
  });

  // Update wishlist count on change
  window.addEventListener('wishlist:changed', updateWishlistCount);

  // Allow removing items directly from wishlist modal
  window.addEventListener('wishlist:remove', (e) => {
    const id = e.detail?.id;
    if(!id) return;
    removeFromWishlist(id);
    updateWishlistCount();
    // Reopen modal to refresh list
    document.getElementById('wishlist-btn')?.click();
  });
}

function initRouter(){
  window.addEventListener('hashchange', mountView);
}

// Modal helpers (used by product cards)
// modal now initialized via ui/modal

function initRevealAnimations(){
  const elements = document.querySelectorAll('.card, .section h2, .hero-copy, .cart-item');
  elements.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(el => io.observe(el));
}

function highlightActiveNav(route){
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    const match = href.replace('#','') === route;
    a.style.opacity = match ? '1' : '';
    a.style.textDecoration = match ? 'underline' : '';
  });
}

function updateAuthNavigation() {
  const authStore = useAuthStore();
  const authNavItem = document.getElementById('auth-nav-item');
  
  if (authNavItem) {
    if (authStore.isAuthenticated) {
      authNavItem.innerHTML = `
        <div class="user-menu">
          <button class="logout-btn" onclick="window.logout()">Logout</button>
        </div>
      `;
    } else {
      authNavItem.innerHTML = `
        <a href="#/auth" class="nav-link auth-link">Login</a>
      `;
    }
  }
}

function initGlobalCartEvents(){
  window.addEventListener('cart:add', (e) => {
    const id = e.detail?.id;
    if(!id) return;
    
    addToCart(id);
    updateCartCount();
    updateWishlistCount();
    // also close modal (if open)
    const modal = document.getElementById('product-modal');
    if(modal && modal.getAttribute('aria-hidden') === 'false'){
      const content = document.getElementById('modal-content');
      if(content) content.innerHTML = '';
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

// Make functions globally available
// Function to reset cart and wishlist
function resetCartAndWishlist() {
  clearCart();
  clearWishlist();
  updateCartCount();
  updateWishlistCount();
}

window.logout = () => {
  const authStore = useAuthStore();
  authStore.logout();
  
  // Clear cart and wishlist when user logs out
  resetCartAndWishlist();
  
  updateAuthNavigation();
  window.location.hash = '#/login';
};

window.updateAuthNavigation = updateAuthNavigation;
window.resetCartAndWishlist = resetCartAndWishlist;
// Expose mount to allow views to force a re-render after programmatic navigation
window.mountView = mountView;

// Simple programmatic navigation helper used by auth view
window.navigateTo = (route) => {
  if (!route.startsWith('/')) route = '/' + route.replace(/^#?\/?/, '');
  window.location.hash = '#' + route;
  try { mountView(); } catch {}
};

// Init
initCartStore();
useAuthStore().checkAuth(); // Check for existing auth token
updateYear();
updateCartCount();
initNav();
initModal();
initFooter();
initGlobalCartEvents();
initRouter();
mountView();
updateAuthNavigation(); // Initial auth navigation update


