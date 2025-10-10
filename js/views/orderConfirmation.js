import { formatPKR } from '../utils/currency.js';
import { useAuthStore } from '../store/authStore.js';

export function renderOrderConfirmationView(root, orderData) {
  const authStore = useAuthStore();
  
  if (!orderData) {
    root.innerHTML = `
      <section class="container">
        <div class="order-not-found">
          <h2>Order Not Found</h2>
          <p>We couldn't find the order you're looking for.</p>
          <a href="#/orders" class="btn primary">View All Orders</a>
        </div>
      </section>
    `;
    return;
  }

  const { order, items, totals } = orderData;
  
  root.innerHTML = `
    <section class="container order-confirmation">
      <div class="confirmation-header">
        <div class="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div class="order-details-grid">
        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="order-info">
            <div class="info-row">
              <span>Order Number:</span>
              <strong>#${order.orderNumber}</strong>
            </div>
            <div class="info-row">
              <span>Order Date:</span>
              <strong>${new Date(order.orderDate).toLocaleDateString()}</strong>
            </div>
            <div class="info-row">
              <span>Order Status:</span>
              <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="info-row">
              <span>Payment Method:</span>
              <strong>${order.paymentMethod}</strong>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-info">
          <h3>Customer Information</h3>
          <div class="info-content">
            <p><strong>${order.customerName}</strong></p>
            <p>${order.customerEmail}</p>
            <p>${order.customerPhone || 'Not provided'}</p>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="shipping-address">
          <h3>Shipping Address</h3>
          <div class="address-content">
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
          </div>
        </div>

                 <!-- Payment Details -->
         <div class="payment-details">
           <h3>Payment Details</h3>
           <div class="payment-content">
             <p><strong>Payment Status:</strong> <span class="status-badge ${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span></p>
             <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
             ${order.transactionId ? `<p><strong>Transaction ID:</strong> ${order.transactionId}</p>` : ''}
             ${order.paymentMethod === 'Credit Card' ? '<p><strong>Company Name on Statement:</strong> NeoShop</p>' : ''}
           </div>
         </div>
      </div>

             <!-- Purchased Items -->
       <div class="purchased-items">
         <h3>Items Purchased</h3>
         <div class="items-list-compact">
           ${items.map(item => `
             <div class="item-row-compact">
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
       </div>

      <!-- Order Totals -->
      <div class="order-totals">
        <h3>Order Totals</h3>
        <div class="totals-grid">
          <div class="total-row">
            <span>Subtotal:</span>
            <strong>${formatPKR(totals.subtotal)}</strong>
          </div>
          <div class="total-row">
            <span>Tax (8%):</span>
            <strong>${formatPKR(totals.tax)}</strong>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <strong>${formatPKR(totals.shipping)}</strong>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <strong>${formatPKR(totals.total)}</strong>
          </div>
        </div>
      </div>

      <!-- Delivery Information -->
      <div class="delivery-info">
        <h3>Delivery Information</h3>
        <div class="delivery-content">
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>
          <p><strong>Tracking Number:</strong> ${order.orderNumber}</p>
        </div>
      </div>

      <!-- Customer Service -->
      <div class="customer-service">
        <h3>Need Help?</h3>
        <div class="service-content">
          <p>If you have any questions about your order, please contact our customer service team:</p>
          <div class="contact-info">
            <p><strong>Email:</strong> <a href="mailto:support@neoshop.com">support@neoshop.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+1-800-NEOSHOP">+1-800-NEOSHOP</a></p>
            <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="confirmation-actions">
        <a href="#/orders" class="btn">View All Orders</a>
        <a href="#/products" class="btn primary">Continue Shopping</a>
        <button class="btn" onclick="window.print()">Print Order</button>
      </div>
    </section>
  `;
}
