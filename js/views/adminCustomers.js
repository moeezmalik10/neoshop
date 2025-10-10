import { formatPKR } from '../utils/currency.js';

export function createAdminCustomersView() {
  const container = document.createElement('div');
  container.className = 'admin-customers';
  
  let customers = [];
  let currentPage = 1;
  const customersPerPage = 10;
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <div class="nav-breadcrumb">
            <a href="#/admin/dashboard">Dashboard</a> / Customers
          </div>
          <div class="admin-actions">
            <button class="btn primary" onclick="refreshCustomers()">Refresh</button>
            <button class="btn" onclick="exportCustomers()">Export</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/products" class="nav-link">Products</a>
          <a href="#/admin/orders" class="nav-link">Orders</a>
          <a href="#/admin/customers" class="nav-link active">Customers</a>
          <a href="#/admin/security" class="nav-link">Security</a>
          <a href="#/admin/marketing" class="nav-link">Marketing</a>
        </div>
      </div>
      
      <div class="admin-content">
        <div class="customers-header">
          <h2>Customer Management</h2>
          <div class="customers-stats">
            <div class="stat-card">
              <div class="stat-value">${customers.length}</div>
              <div class="stat-label">Total Customers</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${customers.filter(c => c.is_active).length}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${customers.filter(c => c.orders_count > 0).length}</div>
              <div class="stat-label">With Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${formatPKR(customers.reduce((sum, c) => sum + (c.total_spent || 0), 0))}</div>
              <div class="stat-label">Total Spent</div>
            </div>
          </div>
        </div>
        
        <div class="customers-controls">
          <div class="search-filter">
            <input type="text" id="customer-search" placeholder="Search customers..." class="search-input">
            <select id="status-filter" class="filter-select">
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="with-orders">With Orders</option>
              <option value="new">New (Last 30 days)</option>
            </select>
            <select id="sort-filter" class="filter-select">
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="created_at">Sort by Join Date</option>
              <option value="total_spent">Sort by Total Spent</option>
              <option value="orders_count">Sort by Orders</option>
            </select>
          </div>
        </div>
        
        <div class="customers-table-container">
          <table class="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="customers-tbody">
              ${renderCustomersTable()}
            </tbody>
          </table>
        </div>
        
        <div class="pagination">
          <button class="btn" onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span class="page-info">Page ${currentPage} of ${Math.ceil(customers.length / customersPerPage)}</span>
          <button class="btn" onclick="nextPage()" ${currentPage === Math.ceil(customers.length / customersPerPage) ? 'disabled' : ''}>Next</button>
        </div>
      </div>
      
      <!-- Customer Details Modal -->
      <div id="customer-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Customer Details</h3>
            <button class="close-btn" onclick="closeCustomerModal()">&times;</button>
          </div>
          <div class="modal-body" id="customer-details">
            <!-- Customer details will be loaded here -->
          </div>
        </div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function renderCustomersTable() {
    const filteredCustomers = getFilteredCustomers();
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const pageCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    if (pageCustomers.length === 0) {
      return `
        <tr>
          <td colspan="7" class="no-customers">
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h3>No customers found</h3>
              <p>No customers match your current filters</p>
            </div>
          </td>
        </tr>
      `;
    }
    
    return pageCustomers.map(customer => `
      <tr>
        <td>
          <div class="customer-info">
            <div class="customer-avatar">
              ${customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div class="customer-details">
              <div class="customer-name">${customer.name || 'Unknown'}</div>
              <div class="customer-id">ID: ${customer.id}</div>
            </div>
          </div>
        </td>
        <td>${customer.email || 'No email'}</td>
        <td>${formatDate(customer.created_at)}</td>
        <td>
          <span class="orders-count">${customer.orders_count || 0}</span>
        </td>
        <td><strong>${formatPKR(customer.total_spent || 0)}</strong></td>
        <td>
          <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
            ${customer.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn small" onclick="viewCustomerDetails(${customer.id})">View</button>
            <button class="btn small secondary" onclick="editCustomer(${customer.id})">Edit</button>
            <button class="btn small ${customer.is_active ? 'danger' : 'success'}" onclick="toggleCustomerStatus(${customer.id})">
              ${customer.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  function getFilteredCustomers() {
    let filtered = [...customers];
    
    // Search filter
    const searchTerm = document.getElementById('customer-search')?.value.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.id.toString().includes(searchTerm)
      );
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    if (statusFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(customer => {
        switch (statusFilter) {
          case 'active':
            return customer.is_active;
          case 'inactive':
            return !customer.is_active;
          case 'with-orders':
            return customer.orders_count > 0;
          case 'new':
            return new Date(customer.created_at) >= thirtyDaysAgo;
          default:
            return true;
        }
      });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sort-filter')?.value || 'name';
    filtered.sort((a, b) => {
      switch (sortFilter) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'total_spent':
          return (b.total_spent || 0) - (a.total_spent || 0);
        case 'orders_count':
          return (b.orders_count || 0) - (a.orders_count || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function attachEventListeners() {
    // Search input
    const searchInput = container.querySelector('#customer-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        render();
      });
    }
    
    // Status filter
    const statusFilter = container.querySelector('#status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        currentPage = 1;
        render();
      });
    }
    
    // Sort filter
    const sortFilter = container.querySelector('#sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        currentPage = 1;
        render();
      });
    }
  }
  
  async function loadCustomers() {
    try {
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_customers' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        customers = data.customers || [];
        render();
      } else {
        console.error('Failed to load customers:', data.error);
        // Load sample data for demo
        loadSampleCustomers();
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      loadSampleCustomers();
    }
  }
  
  function loadSampleCustomers() {
    customers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        orders_count: 5,
        total_spent: 1299.95,
        last_order: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        orders_count: 3,
        total_spent: 449.97,
        last_order: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: false,
        orders_count: 1,
        total_spent: 89.99,
        last_order: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        orders_count: 0,
        total_spent: 0,
        last_order: null
      }
    ];
    render();
  }
  
  // Global functions
  window.refreshCustomers = loadCustomers;
  window.previousPage = () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  };
  
  window.nextPage = () => {
    const totalPages = Math.ceil(customers.length / customersPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  };
  
  window.viewCustomerDetails = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customer-modal');
    const details = document.getElementById('customer-details');
    
    details.innerHTML = `
      <div class="customer-details-content">
        <div class="customer-profile">
          <div class="customer-avatar-large">
            ${customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div class="customer-info">
            <h4>${customer.name || 'Unknown'}</h4>
            <p>${customer.email || 'No email'}</p>
            <p>Customer ID: ${customer.id}</p>
          </div>
        </div>
        
        <div class="customer-stats">
          <div class="stat-item">
            <div class="stat-label">Join Date</div>
            <div class="stat-value">${formatDate(customer.created_at)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">${customer.orders_count || 0}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Spent</div>
            <div class="stat-value">${formatPKR(customer.total_spent || 0)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Order</div>
            <div class="stat-value">${customer.last_order ? formatDate(customer.last_order) : 'Never'}</div>
          </div>
        </div>
        
        <div class="customer-actions">
          <button class="btn primary" onclick="editCustomer(${customer.id})">Edit Customer</button>
          <button class="btn ${customer.is_active ? 'danger' : 'success'}" onclick="toggleCustomerStatus(${customer.id})">
            ${customer.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  };
  
  window.editCustomer = (customerId) => {
    // Placeholder for edit functionality
    alert('Edit customer functionality coming soon!');
  };
  
  window.toggleCustomerStatus = async (customerId) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;
      
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle_customer_status', 
          customer_id: customerId,
          is_active: !customer.is_active
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        customer.is_active = !customer.is_active;
        render();
      } else {
        console.error('Failed to toggle customer status:', data.error);
        alert('Failed to update customer status');
      }
    } catch (error) {
      console.error('Error toggling customer status:', error);
      alert('Error updating customer status');
    }
  };
  
  window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    modal.style.display = 'none';
  };
  
  window.exportCustomers = () => {
    // Placeholder for export functionality
    alert('Export customers functionality coming soon!');
  };
  
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadCustomers();
  
  return container;
}
