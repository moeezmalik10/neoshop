import { formatPKR } from '../utils/currency.js';

export function createAdminDashboardView() {
  const container = document.createElement('div');
  container.className = 'admin-dashboard';
  
  let dashboardData = null;
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <h1>Admin Dashboard</h1>
          <div class="admin-actions">
            <button class="btn" onclick="refreshDashboard()">Refresh</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link active">Dashboard</a>
          <a href="#/admin/products" class="nav-link">Products</a>
          <a href="#/admin/orders" class="nav-link">Orders</a>
          <a href="#/admin/customers" class="nav-link">Customers</a>
          <a href="#/admin/security" class="nav-link">Security</a>
          <a href="#/admin/marketing" class="nav-link">Marketing</a>
        </div>
      </div>
      
      <div class="dashboard-content">
        <!-- Sales Overview -->
        <section class="dashboard-section">
          <h2>Sales Overview</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.sales?.total_revenue ? formatPKR(dashboardData.sales.total_revenue) : '₨0'}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.sales?.monthly_revenue ? formatPKR(dashboardData.sales.monthly_revenue) : '₨0'}</div>
              <div class="metric-label">Monthly Revenue</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.sales?.daily_revenue ? formatPKR(dashboardData.sales.daily_revenue) : '₨0'}</div>
              <div class="metric-label">Daily Revenue</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.sales?.revenue_growth ? '+' + dashboardData.sales.revenue_growth + '%' : '0%'}</div>
              <div class="metric-label">Growth Rate</div>
            </div>
          </div>
          
          <div class="top-products">
            <h3>Top Selling Products</h3>
            <div class="products-list">
              ${dashboardData?.sales?.top_products && dashboardData.sales.top_products.length > 0 ? dashboardData.sales.top_products.map(product => `
                <div class="product-item">
                  <span class="product-name">${product.name}</span>
                  <span class="product-sales">${product.sales} sold</span>
                  <span class="product-revenue">${formatPKR(product.revenue)}</span>
                </div>
              `).join('') : '<div class="empty-state">No sales data available yet</div>'}
            </div>
          </div>
        </section>
        
        <!-- Order Activity -->
        <section class="dashboard-section">
          <h2>Order Activity</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.orders?.total_orders || 0}</div>
              <div class="metric-label">Total Orders</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.orders?.completed_orders || 0}</div>
              <div class="metric-label">Completed</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.orders?.pending_orders || 0}</div>
              <div class="metric-label">Pending</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.orders?.abandoned_carts || 0}</div>
              <div class="metric-label">Abandoned Carts</div>
            </div>
          </div>
        </section>
        
        <!-- Customer Insights -->
        <section class="dashboard-section">
          <h2>Customer Insights</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.customers?.total_customers || 0}</div>
              <div class="metric-label">Total Customers</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.customers?.new_customers || 0}</div>
              <div class="metric-label">New This Month</div>
            </div>
          </div>
          
          <div class="top-customers">
            <h3>Top Customers</h3>
            <div class="customers-list">
              ${dashboardData?.customers?.top_customers && dashboardData.customers.top_customers.length > 0 ? dashboardData.customers.top_customers.map(customer => `
                <div class="customer-item">
                  <div class="customer-info">
                    <span class="customer-name">${customer.name}</span>
                    <span class="customer-email">${customer.email}</span>
                  </div>
                  <div class="customer-stats">
                    <span class="customer-orders">${customer.orders} orders</span>
                    <span class="customer-spent">${formatPKR(customer.total_spent)}</span>
                  </div>
                </div>
              `).join('') : '<div class="empty-state">No customer data available yet</div>'}
            </div>
          </div>
        </section>
        
        <!-- Visitor Insights -->
        <section class="dashboard-section">
          <h2>Visitor Insights</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.visitors?.total_visitors || 0}</div>
              <div class="metric-label">Total Visitors</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.visitors?.page_views || 0}</div>
              <div class="metric-label">Page Views</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.visitors?.conversion_rate || 0}%</div>
              <div class="metric-label">Conversion Rate</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${dashboardData?.visitors?.bounce_rate || 0}%</div>
              <div class="metric-label">Bounce Rate</div>
            </div>
          </div>
        </section>
        
        <!-- Quick Actions -->
        <section class="dashboard-section">
          <h2>Quick Actions</h2>
          <div class="quick-actions">
            <a href="#/admin/products" class="action-card">
              <div class="action-icon">📦</div>
              <div class="action-title">Manage Products</div>
              <div class="action-desc">Add, edit, or remove products</div>
            </a>
            <a href="#/admin/orders" class="action-card">
              <div class="action-icon">📋</div>
              <div class="action-title">Manage Orders</div>
              <div class="action-desc">View and update order status</div>
            </a>
            <a href="#/admin/customers" class="action-card">
              <div class="action-icon">👥</div>
              <div class="action-title">Manage Customers</div>
              <div class="action-desc">View customer information</div>
            </a>
            <a href="#/admin/analytics" class="action-card">
              <div class="action-icon">📊</div>
              <div class="action-title">Analytics</div>
              <div class="action-desc">Detailed reports and insights</div>
            </a>
          </div>
        </section>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function attachEventListeners() {
    // Add any specific event listeners here
  }
  
  async function loadDashboardData() {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.hash = '#/admin/login';
        return;
      }
      
      const response = await fetch('http://localhost/E-Commerce/backend/public/admin.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'get_dashboard_data' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard data');
      }
      
      dashboardData = data.data;
      render(); // Re-render with data
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Show error state
      dashboardData = null;
      render();
    }
  }
  
  // Global functions for the dashboard
  window.refreshDashboard = loadDashboardData;
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadDashboardData();
  
  return container;
}
