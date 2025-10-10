import { getCartItems, getCartTotals, clearCart } from '../store/cartStore.js';
import { formatPKR } from '../utils/currency.js';
import { useAuthStore } from '../store/authStore.js';
import { sendOrderConfirmationEmail } from '../utils/emailConfirmation.js';

export function renderCheckoutView(root, onCartChanged) {
  const authStore = useAuthStore();
  const { items } = getCartItems();
  const totals = getCartTotals();

  if (items.length === 0) {
    root.innerHTML = `
      <section class="container">
        <div class="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checkout.</p>
          <a href="#/products" class="btn primary">Continue Shopping</a>
        </div>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    <section class="container checkout">
      <h1>Checkout</h1>
      
      <div class="checkout-grid">
        <!-- Checkout Form -->
        <div class="checkout-form">
          <form id="checkout-form">
            <!-- Shipping Information -->
            <div class="form-section">
              <h3>Shipping Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name *</label>
                  <input type="text" id="firstName" name="firstName" required />
                </div>
                <div class="form-group">
                  <label for="lastName">Last Name *</label>
                  <input type="text" id="lastName" name="lastName" required />
                </div>
              </div>
              
              <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" value="${authStore.user?.email || ''}" required />
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" />
              </div>
              
              <div class="form-group">
                <label for="address">Street Address *</label>
                <input type="text" id="address" name="address" required />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="city">City *</label>
                  <input type="text" id="city" name="city" required />
                </div>
                <div class="form-group">
                  <label for="state">State/Province *</label>
                  <input type="text" id="state" name="state" required />
                </div>
              </div>
              
              <div class="form-group">
                <label for="zipCode">ZIP/Postal Code *</label>
                <input type="text" id="zipCode" name="zipCode" required />
              </div>
            </div>

            <!-- Payment Method -->
            <div class="form-section">
              <h3>Payment Method</h3>
              <div class="payment-options">
                <label class="payment-option">
                  <input type="radio" name="paymentMethod" value="card" checked />
                  <div class="option-content">
                    <span class="option-name">Credit/Debit Card</span>
                    <span class="option-description">Visa, MasterCard, American Express</span>
                  </div>
                </label>
                
                <label class="payment-option">
                  <input type="radio" name="paymentMethod" value="cod" />
                  <div class="option-content">
                    <span class="option-name">Cash on Delivery</span>
                    <span class="option-description">Pay when you receive your order</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="form-section" id="card-payment-section">
              <h3>Payment Information</h3>
              <div class="form-group">
                <label for="cardNumber">Card Number *</label>
                <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="expiryDate">Expiry Date *</label>
                  <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" />
                </div>
                <div class="form-group">
                  <label for="cvv">CVV *</label>
                  <input type="text" id="cvv" name="cvv" placeholder="123" />
                </div>
              </div>
              
              <div class="form-group">
                <label for="cardholderName">Cardholder Name *</label>
                <input type="text" id="cardholderName" name="cardholderName" />
              </div>
            </div>

            <!-- Shipping Method removed -->

            <!-- Terms and Conditions -->
            <div class="form-section">
              <label class="checkbox-label">
                <input type="checkbox" id="termsAccepted" name="termsAccepted" required />
                <span>I agree to the <a href="javascript:void(0)" onclick="window.showTermsModal && window.showTermsModal()">Terms and Conditions</a> and <a href="javascript:void(0)" onclick="window.showPrivacyModal && window.showPrivacyModal()">Privacy Policy</a> *</span>
              </label>
            </div>

            <button type="submit" class="btn primary checkout-btn" id="place-order-btn">
              Place Order
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          
          <div class="order-items-compact">
            ${items.map(item => `
              <div class="order-item-compact">
                <img src="${item.product.image}" alt="${item.product.title}" />
                <div class="item-details-compact">
                  <h4>${item.product.title}</h4>
                  <p class="item-category">${item.product.category}</p>
                  <p class="item-price">${formatPKR(item.product.price)} × ${item.quantity}</p>
                </div>
                <div class="item-total">
                  <strong>${formatPKR(item.product.price * item.quantity)}</strong>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatPKR(totals.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax (8%):</span>
              <span>${formatPKR(totals.tax)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span id="shipping-cost">${formatPKR(totals.shipping)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span id="total-cost">${formatPKR(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Safety: remove any residual Shipping Method section if present (from cached markup)
  try {
    const shippingOptions = root.querySelector('.shipping-options');
    if (shippingOptions) {
      const section = shippingOptions.closest('.form-section') || shippingOptions.parentElement;
      section?.remove();
    }
    const sections = root.querySelectorAll('.form-section');
    sections.forEach(sec => {
      const h = sec.querySelector('h3');
      if (h && h.textContent && h.textContent.trim().toLowerCase() === 'shipping method') {
        sec.remove();
      }
    });
  } catch {}

  // Add event listeners
  const form = document.getElementById('checkout-form');
  // Shipping options removed
  const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const cardPaymentSection = document.getElementById('card-payment-section');

  // Shipping cost dynamic update removed

  // Handle payment method changes
  paymentOptions.forEach(option => {
    option.addEventListener('change', updatePaymentMethod);
  });

  // Handle form submission
  form.addEventListener('submit', handleCheckout);

  // updateShippingCost removed

  function updatePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (selectedMethod === 'card') {
      cardPaymentSection.style.display = 'block';
      // Make card fields required
      document.getElementById('cardNumber').required = true;
      document.getElementById('expiryDate').required = true;
      document.getElementById('cvv').required = true;
      document.getElementById('cardholderName').required = true;
    } else {
      cardPaymentSection.style.display = 'none';
      // Remove required from card fields
      document.getElementById('cardNumber').required = false;
      document.getElementById('expiryDate').required = false;
      document.getElementById('cvv').required = false;
      document.getElementById('cardholderName').required = false;
    }
  }

  function handleCheckout(e) {
    e.preventDefault();
    
    if (!document.getElementById('termsAccepted').checked) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }

    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Validate card payment if selected
    if (selectedPaymentMethod === 'card') {
      const cardNumber = document.getElementById('cardNumber').value;
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      const cardholderName = document.getElementById('cardholderName').value;
      
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        alert('Please fill in all card payment details.');
        return;
      }
    }

    // Disable submit button to prevent double submission
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing...';

    // Collect form data
    const formData = new FormData(form);
    const checkoutData = {
      customer: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone')
      },
      shipping: {
        street: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode')
      },
      payment: {
        method: selectedPaymentMethod,
        cardNumber: formData.get('cardNumber'),
        expiryDate: formData.get('expiryDate'),
        cvv: formData.get('cvv'),
        cardholderName: formData.get('cardholderName')
      },
      items: items,
      totals: totals
    };

    // Simulate order processing
    setTimeout(() => {
      processOrder(checkoutData);
    }, 2000);
  }

  function processOrder(checkoutData) {
    // Generate order data
    const orderNumber = generateOrderNumber();
    const order = {
      orderNumber: orderNumber,
      orderDate: new Date().toISOString(),
      status: 'Confirmed',
      paymentStatus: checkoutData.payment.method === 'cod' ? 'Pending' : 'Paid',
      paymentMethod: checkoutData.payment.method === 'cod' ? 'Cash on Delivery' : 'Credit Card',
      transactionId: checkoutData.payment.method === 'cod' ? null : generateTransactionId(),
      customerName: `${checkoutData.customer.firstName} ${checkoutData.customer.lastName}`,
      customerEmail: checkoutData.customer.email,
      customerPhone: checkoutData.customer.phone,
      shippingAddress: checkoutData.shipping,
      estimatedDelivery: getEstimatedDelivery('standard'),
      trackingNumber: orderNumber
    };

         // Clear cart after successful order
     clearCart();
     onCartChanged?.();

     // Send order confirmation email
     sendOrderConfirmationEmail({ order, items, totals });

     // Redirect to order confirmation
     const orderData = { order, items, totals };
     localStorage.setItem('lastOrder', JSON.stringify(orderData));
     window.location.hash = '#/order-confirmation';
  }

  function generateOrderNumber() {
    return 'NS' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  function generateTransactionId() {
    return 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // getShippingMethodName removed

  function getEstimatedDelivery(method) {
    const today = new Date();
    const delivery = new Date(today);
    
    switch(method) {
      case 'overnight':
        delivery.setDate(today.getDate() + 1);
        break;
      case 'express':
        delivery.setDate(today.getDate() + 3);
        break;
      default:
        delivery.setDate(today.getDate() + 7);
    }
    
    return delivery.toLocaleDateString();
  }
}
