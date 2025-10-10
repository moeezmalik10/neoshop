import { loadAllProducts } from '../store/productStore.js';
import { addToCart } from '../store/cartStore.js';
import { openModal } from '../ui/modal.js';
import { addToWishlist, removeFromWishlist, getWishlist } from '../store/wishlistStore.js';
// Compare removed
import { formatPKR } from '../utils/currency.js';
import { useAuthStore } from '../store/authStore.js';

export function renderProductsView(root, onCartChanged){
  const authStore = useAuthStore();
  
  root.innerHTML = `
    <section class="container">
      <div class="row" style="justify-content:space-between; margin-bottom:12px;">
        <h2 style="margin:0;">Products</h2>
        <div>
          <input id="search" placeholder="Search products" style="height:40px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:var(--panel); color:var(--text); padding:0 12px;" />
        </div>
      </div>

      <div class="products" id="product-list"></div>
    </section>
  `;

  const listEl = document.getElementById('product-list');
  const searchEl = document.getElementById('search');
  let products = [];

  function renderList(items){
    if(!listEl) return;
    listEl.innerHTML = items.map(p => cardTemplate(p)).join('');
  }
  loadAllProducts().then((all) => {
    products = all;
    renderList(products);
  });

  listEl?.addEventListener('click', (e) => {
    if(!(e.target instanceof Element)) return;
    const btn = e.target.closest('[data-add]');
    if(btn){
      const id = btn.getAttribute('data-add');
      addToCart(id);
      onCartChanged?.();
    }
    const wish = e.target.closest('[data-wish]');
    if(wish){
      const id = wish.getAttribute('data-wish');
      const current = getWishlist();
      if(current.includes(id)){
        removeFromWishlist(id);
        wish.textContent = 'Wishlist';
      } else {
        addToWishlist(id);
        wish.textContent = 'Wishlisted';
      }
    }
    // Compare removed
    const detail = e.target.closest('[data-detail]');
    if(detail){
      const id = detail.getAttribute('data-detail');
      const product = products.find(x => x.id === id);
      if(product){ openModal(detailTemplate(product)); }
    }
  });

  searchEl?.addEventListener('input', () => {
    const q = searchEl.value.toLowerCase();
    const filtered = products.filter(p => `${p.title} ${p.category}`.toLowerCase().includes(q));
    renderList(filtered);
  });
}

function cardTemplate(p){
  const wished = getWishlist().includes(p.id);
  return `
    <article class="card" tabindex="0">
      <div class="card-media" data-detail="${p.id}">
        <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" />
      </div>
      <div class="card-body">
        <div class="row">
          <strong>${p.title}</strong>
          <span class="price">${formatPKR(p.price)}</span>
        </div>
        <div class="row">
          <small class="muted">${p.category}</small>
          <div style="display:flex; gap:6px;">
            <button class="add-btn" data-add="${p.id}">
              Add to cart
            </button>
            <button class="add-btn" data-wish="${p.id}">${wished ? 'Wishlisted' : 'Wishlist'}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function detailTemplate(p){
  return `
    <div class="product-detail">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; align-items:start;">
        <img src="${p.image}" alt="${p.title}" style="width:100%; border-radius:12px;" />
        <div>
          <h3 id="modal-title" style="margin-top:0;">${p.title}</h3>
          <div class="product-tabs">
            <div class="tab-buttons">
              <button class="tab-btn active" data-tab="description">Description</button>
              <button class="tab-btn" data-tab="specs">Specifications</button>
              <button class="tab-btn" data-tab="reviews">Reviews</button>
            </div>
            <div class="tab-content">
              <div class="tab-panel active" data-tab="description">
                <p style="color:var(--muted); margin-bottom: 16px;">${p.description}</p>
                <div class="product-features">
                  <h4>Key Features:</h4>
                  <ul>
                    <li>High-quality materials and construction</li>
                    <li>Modern design with premium finish</li>
                    <li>Reliable performance and durability</li>
                    <li>Customer satisfaction guaranteed</li>
                  </ul>
                </div>
              </div>
              <div class="tab-panel" data-tab="specs">
                <div class="specs-grid">
                  <div class="spec-item">
                    <span class="spec-label">Category:</span>
                    <span class="spec-value">${p.category}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Brand:</span>
                    <span class="spec-value">NeoShop</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Warranty:</span>
                    <span class="spec-value">1 Year</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Availability:</span>
                    <span class="spec-value">In Stock</span>
                  </div>
                </div>
              </div>
              <div class="tab-panel" data-tab="reviews">
                <div class="reviews-section">
                  <div class="rating-summary">
                    <div class="stars">★★★★☆</div>
                    <span class="rating-text">4.2 out of 5</span>
                    <span class="review-count">(24 reviews)</span>
                  </div>
                  <div class="review-item">
                    <div class="review-header">
                      <span class="reviewer-name">Sarah M.</span>
                      <span class="review-stars">★★★★★</span>
                    </div>
                    <p class="review-text">"Excellent quality and fast delivery. Highly recommend!"</p>
                  </div>
                  <div class="review-item">
                    <div class="review-header">
                      <span class="reviewer-name">Mike R.</span>
                      <span class="review-stars">★★★★☆</span>
                    </div>
                    <p class="review-text">"Great product, exactly as described. Very satisfied with my purchase."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row" style="margin-top:16px;">
            <span class="price">${formatPKR(p.price)}</span>
            <button class="btn primary" data-add="${p.id}">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}


