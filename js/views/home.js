import { loadAllProducts } from '../store/productStore.js';
import { addToCart } from '../store/cartStore.js';
import { openModal } from '../ui/modal.js';
import { addToWishlist, removeFromWishlist, getWishlist } from '../store/wishlistStore.js';
// Compare removed
import { formatPKR } from '../utils/currency.js';
import { useAuthStore } from '../store/authStore.js';
// 3D scene is lazy-loaded via dynamic import

export function renderHomeView(root, onCartChanged){
  const authStore = useAuthStore();
  
  root.innerHTML = `
    <section class="hero container" style=" margin-left: 185px; margin-right: 40px;" >
      <div class="hero-copy">
        <div class="eyebrow">Next-gen shopping</div>
        <h1>3D products, silky UI, zero backend.</h1>
        <p>Explore a front-end only eCommerce demo with immersive 3D, responsive design, and smooth interactions. Built using HTML, CSS and JavaScript.</p>
        <div class="hero-cta">
          <a class="btn primary" href="#/products">Shop now</a>
          <a class="btn" href="#/cart">View cart</a>
        </div>
      </div>
      <div class="hero-3d">
        <canvas class="hero-canvas" id="hero-canvas" aria-label="Decorative 3D scene"></canvas>
      </div>
    </section>

    <section class="section container">
      <h2>Featured</h2>

      <div class="products" id="home-products"></div>
    </section>
  `;

  const canvas = document.getElementById('hero-canvas');
  if(canvas instanceof HTMLCanvasElement){
    const io = new IntersectionObserver((entries) => {
      if(entries.some(e => e.isIntersecting)){
        import('../webgl/heroScene.js').then(m => m.createHeroScene(canvas));
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(canvas);
  }

  const listEl = document.getElementById('home-products');
  loadAllProducts().then((all) => {
    const products = all.slice(0, 8);
    if(!listEl) return;
    listEl.innerHTML = products.map(p => cardTemplate(p)).join('');
    listEl.addEventListener('click', (e) => {
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
        if(product){ openModal(detailTemplate(product, onCartChanged)); }
      }
    });
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
          <div style=\"display:flex; gap:6px;\">
            <button class="add-btn" data-add="${p.id}">Add to cart</button>
            <button class="add-btn" data-wish="${p.id}">${wished ? 'Wishlisted' : 'Wishlist'}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function detailTemplate(p, onCartChanged){
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


