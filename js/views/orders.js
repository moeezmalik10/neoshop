import { loadAllOrders, getOrdersByStatus, updateOrderStatus, getOrderStats } from '../store/orderStore.js';
import { formatPKR } from '../utils/currency.js';
import { openModal } from '../ui/modal.js';

export function renderOrdersView(root) {
  root.innerHTML = `
    <section class="container">
      <div class="orders-header">
        <h2 style="margin:0;">Order Management</h2>
        <div class="order-stats" id="order-stats"></div>
      </div>
      
      <div class="orders-controls">
        <div class="filter-controls">
          <select id="status-filter" class="filter-select">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input id="search-orders" placeholder="Search orders..." class="search-input" />
        </div>
        <button id="refresh-orders" class="btn">Refresh</button>
      </div>
      
      <div class="orders-table-container">
        <table class="orders-table" id="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="orders-tbody">
            <tr>
              <td colspan="7" class="loading">Loading orders...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  const statusFilter = document.getElementById('status-filter');
  const searchInput = document.getElementById('search-orders');
  const refreshBtn = document.getElementById('refresh-orders');
  const ordersTable = document.getElementById('orders-tbody');
  const statsContainer = document.getElementById('order-stats');

  let allOrders = [];
  let filteredOrders = [];

  async function loadOrders() {
    try {
      allOrders = await loadAllOrders();
      filteredOrders = allOrders;
      renderOrders();
      renderStats();
    } catch (error) {
      ordersTable.innerHTML = `
        <tr>
          <td colspan="7" class="error">
            Error loading orders: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  function renderStats() {
    const stats = getOrderStats();
    statsContainer.innerHTML = `
      <div class="stat-item">
        <span class="stat-number">${stats.total}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-item pending">
        <span class="stat-number">${stats.pending}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-item completed">
        <span class="stat-number">${stats.completed}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-item cancelled">
        <span class="stat-number">${stats.cancelled}</span>
        <span class="stat-label">Cancelled</span>
      </div>
    `;
  }

  function renderOrders() {
    if (filteredOrders.length === 0) {
      ordersTable.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No orders found</td>
        </tr>
      `;
      return;
    }

    ordersTable.innerHTML = filteredOrders.map(order => orderRowTemplate(order)).join('');
  }

  function orderRowTemplate(order) {
    const date = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusClass = `status-${order.status}`;
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);

    return `
      <tr data-order-id="${order.id}">
        <td><strong>#${order.id}</strong></td>
        <td>
          <div class="customer-info">
            <span class="customer-email">${order.user_email}</span>
            <small class="customer-id">ID: ${order.user_id}</small>
          </div>
        </td>
        <td>
          <div class="order-items-summary">
            <span class="item-count">${order.items.length} item${order.items.length !== 1 ? 's' : ''}</span>
            <button class="view-items-btn" data-view-items="${order.id}">View Details</button>
          </div>
        </td>
        <td><strong>${formatPKR(order.total_price)}</strong></td>
        <td>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>${date}</td>
        <td>
          <div class="order-actions">
            ${order.status === 'pending' ? `
              <button class="btn small success" data-complete="${order.id}">Complete</button>
              <button class="btn small danger" data-cancel="${order.id}">Cancel</button>
            ` : ''}
            ${order.status === 'pending' ? `
              <button class="btn small" data-edit="${order.id}">Edit</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  function filterOrders() {
    const status = statusFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    filteredOrders = allOrders.filter(order => {
      const statusMatch = status === 'all' || order.status === status;
      const searchMatch = !searchTerm || 
        order.id.toString().includes(searchTerm) ||
        order.user_email.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.product_name.toLowerCase().includes(searchTerm));
      
      return statusMatch && searchMatch;
    });

    renderOrders();
  }

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Update local state and re-render
        const order = allOrders.find(o => o.id === parseInt(orderId));
        if (order) {
          order.status = newStatus;
        }
        renderOrders();
        renderStats();
        
        // Show success message
        showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
      } else {
        showNotification(`Failed to update order: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification(`Error updating order: ${error.message}`, 'error');
    }
  }

  function showOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === parseInt(orderId));
    if (!order) return;

    const modalContent = `
      <div class="order-detail-modal">
        <h3>Order #${order.id} Details</h3>
        <div class="order-info">
          <div class="info-row">
            <span class="label">Customer:</span>
            <span class="value">${order.user_email} (ID: ${order.user_id})</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Total:</span>
            <span class="value"><strong>${formatPKR(order.total_price)}</strong></span>
          </div>
        </div>
        
        <h4>Order Items</h4>
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.product_name}" class="item-image" />
              <div class="item-details">
                <strong>${item.product_name}</strong>
                <div class="item-meta">
                  <span>Qty: ${item.quantity}</span>
                  <span>Price: ${formatPKR(item.price)}</span>
                  <span>Subtotal: ${formatPKR(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    openModal(modalContent);
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Event listeners
  statusFilter.addEventListener('change', filterOrders);
  searchInput.addEventListener('input', filterOrders);
  refreshBtn.addEventListener('click', loadOrders);

  ordersTable.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.matches('[data-complete]')) {
      const orderId = target.getAttribute('data-complete');
      handleStatusUpdate(orderId, 'completed');
    } else if (target.matches('[data-cancel]')) {
      const orderId = target.getAttribute('data-cancel');
      handleStatusUpdate(orderId, 'cancelled');
    } else if (target.matches('[data-view-items]')) {
      const orderId = target.getAttribute('data-view-items');
      showOrderDetails(orderId);
    } else if (target.matches('[data-edit]')) {
      const orderId = target.getAttribute('data-edit');
      // TODO: Implement edit functionality
      showNotification('Edit functionality coming soon!', 'info');
    }
  });

  // Initial load
  loadOrders();
}
