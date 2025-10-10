import { formatPKR } from '../utils/currency.js';

export function createAdminOrdersView() {
  const container = document.createElement('div');
  container.className = 'admin-orders';
  
  let orders = [];
  let currentFilter = 'all';
  let currentPage = 1;
  const ordersPerPage = 10;
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <div class="nav-breadcrumb">
            <a href="#/admin/dashboard">Dashboard</a> / Orders
          </div>
          <div class="admin-actions">
            <button class="btn primary" onclick="refreshOrders()">Refresh</button>
            <button class="btn" onclick="exportOrders()">Export</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/products" class="nav-link">Products</a>
          <a href="#/admin/orders" class="nav-link active">Orders</a>
          <a href="#/admin/customers" class="nav-link">Customers</a>
          <a href="#/admin/security" class="nav-link">Security</a>
          <a href="#/admin/marketing" class="nav-link">Marketing</a>
        </div>
      </div>
      
      <div class="admin-content">
        <div class="orders-header">
          <h2>Order Management</h2>
          <div class="orders-stats">
            <div class="stat-card">
              <div class="stat-value">${orders.length}</div>
              <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${orders.filter(o => o.status === 'pending').length}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${orders.filter(o => o.status === 'completed').length}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${formatPKR(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>
        
        <div class="orders-controls">
          <div class="search-filter">
            <input type="text" id="order-search" placeholder="Search orders..." class="search-input">
            <select id="status-filter" class="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select id="date-filter" class="filter-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="orders-tbody">
              ${renderOrdersTable()}
            </tbody>
          </table>
        </div>
        
        <div class="pagination">
          <button class="btn" onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span class="page-info">Page ${currentPage} of ${Math.ceil(orders.length / ordersPerPage)}</span>
          <button class="btn" onclick="nextPage()" ${currentPage === Math.ceil(orders.length / ordersPerPage) ? 'disabled' : ''}>Next</button>
        </div>
      </div>
      
      <!-- Order Details Modal -->
      <div id="order-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Order Details</h3>
            <button class="close-btn" onclick="closeOrderModal()">&times;</button>
          </div>
          <div class="modal-body" id="order-details">
            <!-- Order details will be loaded here -->
          </div>
        </div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function renderOrdersTable() {
    const filteredOrders = getFilteredOrders();
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    if (pageOrders.length === 0) {
      return `
        <tr>
          <td colspan="7" class="no-orders">
            <div class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>No orders match your current filters</p>
            </div>
          </td>
        </tr>
      `;
    }
    
    return pageOrders.map(order => `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>
          <div class="customer-info">
            <div class="customer-name">${order.customer || 'Unknown'}</div>
            <div class="customer-email">${order.email || 'No email'}</div>
          </div>
        </td>
        <td>${order.date}</td>
        <td>
          <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td><strong>${formatPKR(order.total || 0)}</strong></td>
        <td>
          <span class="payment-status pending">
            Pending
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn small" onclick="viewOrderDetails('${order.id}')">View</button>
            <button class="btn small secondary" onclick="editOrder('${order.id}')">Edit</button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  function getFilteredOrders() {
    let filtered = [...orders];
    
    // Status filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(order => order.status === currentFilter);
    }
    
    // Search filter
    const searchTerm = document.getElementById('order-search')?.value.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().toLowerCase().includes(searchTerm) ||
        order.customer?.toLowerCase().includes(searchTerm) ||
        order.email?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Date filter
    const dateFilter = document.getElementById('date-filter')?.value || 'all';
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function attachEventListeners() {
    // Search input
    const searchInput = container.querySelector('#order-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        render();
      });
    }
    
    // Status filter
    const statusFilter = container.querySelector('#status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        currentPage = 1;
        render();
      });
    }
    
    // Date filter
    const dateFilter = container.querySelector('#date-filter');
    if (dateFilter) {
      dateFilter.addEventListener('change', () => {
        currentPage = 1;
        render();
      });
    }
  }
  
  async function loadOrders() {
    try {
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_orders' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        orders = data.orders || [];
        render();
      } else {
        console.error('Failed to load orders:', data.error);
        // Load sample data for demo
        loadSampleOrders();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      loadSampleOrders();
    }
  }
  
  function loadSampleOrders() {
    orders = [
      {
        id: 1001,
        customer: { name: 'John Doe', email: 'john@example.com' },
        created_at: new Date().toISOString(),
        status: 'pending',
        total: 299.99,
        payment_status: 'pending',
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 199.99 },
          { name: 'Phone Case', quantity: 2, price: 50.00 }
        ]
      },
      {
        id: 1002,
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'processing',
        total: 149.99,
        payment_status: 'paid',
        items: [
          { name: 'Smart Watch', quantity: 1, price: 149.99 }
        ]
      },
      {
        id: 1003,
        customer: { name: 'Bob Johnson', email: 'bob@example.com' },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered',
        total: 89.99,
        payment_status: 'paid',
        items: [
          { name: 'Bluetooth Speaker', quantity: 1, price: 89.99 }
        ]
      }
    ];
    render();
  }
  
  // Global functions
  window.refreshOrders = loadOrders;
  window.previousPage = () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  };
  
  window.nextPage = () => {
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  };
  
  window.updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_order_status', 
          order_id: orderId, 
          status: newStatus 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local order
        const order = orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
          render();
        }
      } else {
        console.error('Failed to update order status:', data.error);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };
  
  window.viewOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('order-modal');
    const details = document.getElementById('order-details');
    
    details.innerHTML = `
      <div class="order-details-content">
        <div class="order-info">
          <h4>Order ${order.id}</h4>
          <p><strong>Customer:</strong> ${order.customer || 'Unknown'}</p>
          <p><strong>Email:</strong> ${order.email || 'No email'}</p>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
          <p><strong>Items:</strong> ${order.items || 0}</p>
        </div>
        
        <div class="order-total">
          <h4>Total: ${formatPKR(order.total || 0)}</h4>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  };
  
  window.editOrder = (orderId) => {
    // Placeholder for edit functionality
    alert('Edit order functionality coming soon!');
  };
  
  window.closeOrderModal = () => {
    const modal = document.getElementById('order-modal');
    modal.style.display = 'none';
  };
  
  window.exportOrders = () => {
    // Placeholder for export functionality
    alert('Export orders functionality coming soon!');
  };
  
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadOrders();
  
  return container;
}
