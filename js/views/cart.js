import { getCartItems, incrementItem, decrementItem, removeItem, getCartTotals, clearCart, canCheckout } from '../store/cartStore.js';
import { formatPKR } from '../utils/currency.js';
import { useAuthStore } from '../store/authStore.js';

export function renderCartView(root, onCartChanged){
  const authStore = useAuthStore();
  const { items } = getCartItems();
  const totals = getCartTotals();

  // If cart is empty, show empty state
  if (items.length === 0) {
    root.innerHTML = `
      <section class="container cart">
        <div>
          <h2 style="margin-top:0;">Your cart</h2>
          <div class="cart-items" id="cart-items">
            ${emptyState()}
          </div>
          <div class="row" style="margin-top:12px;">
            <a class="btn" href="#/products">Continue shopping</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    <section class="container cart">
      <div>
        <h2 style="margin-top:0;">Your cart</h2>
        <div class="cart-items" id="cart-items">
          ${items.length ? items.map(cartItemTemplate).join('') : emptyState()}
        </div>
        <div class="row" style="margin-top:12px;">
          <button class="btn" id="clear">Clear cart</button>
          <a class="btn" href="#/products">Continue shopping</a>
          ${items.length > 0 && authStore.isAuthenticated ? `<a href="#/checkout" class="btn primary">Checkout</a>` : ''}
        </div>
      </div>
      <aside class="cart-summary">
        <h3 style="margin-top:4px;">Summary</h3>
        <div class="row"><span>Subtotal</span><strong>${formatPKR(totals.subtotal)}</strong></div>
        <div class="row"><span>Tax (8%)</span><strong>${formatPKR(totals.tax)}</strong></div>
        <div class="row"><span>Shipping</span><strong>${formatPKR(totals.shipping)}</strong></div>
        <hr style="border-color:rgba(255,255,255,.08);" />
        <div class="row"><span>Total</span><strong>${formatPKR(totals.total)}</strong></div>
        ${!authStore.isAuthenticated ? `
          <div class="checkout-login-prompt">
            <p style="color: var(--muted); font-size: 14px; margin: 8px 0;">Please login to checkout</p>
            <a href="#/auth" class="btn primary" style="width:100%; margin-top:8px;">Login to Checkout</a>
          </div>
        ` : `
          <a href="#/checkout" class="btn primary" style="width:100%; margin-top:12px; text-align:center; text-decoration:none;">Proceed to Checkout</a>
        `}
      </aside>
    </section>
  `;

  const listEl = document.getElementById('cart-items');
  const clearEl = document.getElementById('clear');

  listEl?.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const del = e.target.closest('[data-del]');
    if(inc){ 
      const success = incrementItem(inc.getAttribute('data-inc')); 
      if (success) rerender(); 
    }
    if(dec){ 
      const success = decrementItem(dec.getAttribute('data-dec')); 
      if (success) rerender(); 
    }
    if(del){ 
      const success = removeItem(del.getAttribute('data-del')); 
      if (success) rerender(); 
    }
  });
  clearEl?.addEventListener('click', () => { 
    const success = clearCart(); 
    if (success) rerender(); 
  });

  function rerender(){
    renderCartView(root, onCartChanged);
    onCartChanged?.();
  }
}

function cartItemTemplate(ci){
  const { product, quantity } = ci;
  return `
    <div class="cart-item">
      <img src="${product.image}" alt="${product.title}" />
      <div>
        <strong>${product.title}</strong>
        <div style="color:var(--muted); font-size:14px;">${formatPKR(product.price)} • ${product.category}</div>
      </div>
      <div class="qty">
        <button data-dec="${product.id}">-</button>
        <span>${quantity}</span>
        <button data-inc="${product.id}">+</button>
        <button data-del="${product.id}" style="margin-left:8px; background:var(--danger); border-color:transparent;">×</button>
      </div>
    </div>
  `;
}

function emptyState(){
  return `
    <div style="text-align:center; color:var(--muted); padding:24px; background:var(--panel); border-radius:12px;">Your cart is empty.</div>
  `;
}


