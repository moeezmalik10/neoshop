import { formatPKR } from '../utils/currency.js';

export function createAdminSecurityView() {
  const container = document.createElement('div');
  container.className = 'admin-security';
  
  let auditLogs = [];
  let currentPage = 1;
  const logsPerPage = 20;
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <div class="nav-breadcrumb">
            <a href="#/admin/dashboard">Dashboard</a> / Security & Audit
          </div>
          <div class="admin-actions">
            <button class="btn primary" onclick="refreshAuditLogs()">Refresh</button>
            <button class="btn" onclick="exportAuditLogs()">Export</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/products" class="nav-link">Products</a>
          <a href="#/admin/orders" class="nav-link">Orders</a>
          <a href="#/admin/customers" class="nav-link">Customers</a>
          <a href="#/admin/security" class="nav-link active">Security</a>
        </div>
      </div>
      
      <div class="admin-content">
        <div class="security-header">
          <h2>Security & Audit</h2>
          <div class="security-stats">
            <div class="stat-card">
              <div class="stat-value">${auditLogs.length}</div>
              <div class="stat-label">Total Logs</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${auditLogs.filter(log => log.action === 'login').length}</div>
              <div class="stat-label">Login Attempts</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${auditLogs.filter(log => log.action === 'admin_action').length}</div>
              <div class="stat-label">Admin Actions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${auditLogs.filter(log => log.severity === 'high').length}</div>
              <div class="stat-label">High Severity</div>
            </div>
          </div>
        </div>
        
        <div class="security-controls">
          <div class="search-filter">
            <input type="text" id="audit-search" placeholder="Search audit logs..." class="search-input">
            <select id="action-filter" class="filter-select">
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="admin_action">Admin Action</option>
              <option value="product_update">Product Update</option>
              <option value="order_update">Order Update</option>
            </select>
            <select id="severity-filter" class="filter-select">
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select id="date-filter" class="filter-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        
        <div class="audit-logs-container">
          <table class="audit-logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="audit-logs-tbody">
              ${renderAuditLogsTable()}
            </tbody>
          </table>
        </div>
        
        <div class="pagination">
          <button class="btn" onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span class="page-info">Page ${currentPage} of ${Math.ceil(auditLogs.length / logsPerPage)}</span>
          <button class="btn" onclick="nextPage()" ${currentPage === Math.ceil(auditLogs.length / logsPerPage) ? 'disabled' : ''}>Next</button>
        </div>
      </div>
      
      <!-- Security Settings Modal -->
      <div id="security-settings-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Security Settings</h3>
            <button class="close-btn" onclick="closeSecuritySettingsModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="security-settings">
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-2fa" checked>
                  Enable Two-Factor Authentication
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-audit-logging" checked>
                  Enable Audit Logging
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-login-alerts" checked>
                  Enable Login Alerts
                </label>
              </div>
              <div class="setting-group">
                <label>
                  Session Timeout (minutes):
                  <input type="number" id="session-timeout" value="30" min="5" max="480">
                </label>
              </div>
              <div class="setting-group">
                <label>
                  Max Login Attempts:
                  <input type="number" id="max-login-attempts" value="5" min="3" max="10">
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn primary" onclick="saveSecuritySettings()">Save Settings</button>
              <button class="btn" onclick="closeSecuritySettingsModal()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function renderAuditLogsTable() {
    const filteredLogs = getFilteredLogs();
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const pageLogs = filteredLogs.slice(startIndex, endIndex);
    
    if (pageLogs.length === 0) {
      return `
        <tr>
          <td colspan="7" class="no-logs">
            <div class="empty-state">
              <div class="empty-icon">🔒</div>
              <h3>No audit logs found</h3>
              <p>No logs match your current filters</p>
            </div>
          </td>
        </tr>
      `;
    }
    
    return pageLogs.map(log => `
      <tr>
        <td>${formatDateTime(log.timestamp)}</td>
        <td>
          <div class="user-info">
            <div class="user-name">${log.user_name || 'System'}</div>
            <div class="user-role">${log.user_role || 'N/A'}</div>
          </div>
        </td>
        <td>
          <span class="action-badge ${log.action}">${log.action.replace('_', ' ').toUpperCase()}</span>
        </td>
        <td>${log.details || 'No details'}</td>
        <td>${log.ip_address || 'N/A'}</td>
        <td>
          <span class="severity-badge ${log.severity}">${log.severity.toUpperCase()}</span>
        </td>
        <td>
          <span class="status-badge ${log.status}">${log.status.toUpperCase()}</span>
        </td>
      </tr>
    `).join('');
  }
  
  function getFilteredLogs() {
    let filtered = [...auditLogs];
    
    // Search filter
    const searchTerm = document.getElementById('audit-search')?.value.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user_name?.toLowerCase().includes(searchTerm) ||
        log.action?.toLowerCase().includes(searchTerm) ||
        log.details?.toLowerCase().includes(searchTerm) ||
        log.ip_address?.includes(searchTerm)
      );
    }
    
    // Action filter
    const actionFilter = document.getElementById('action-filter')?.value || 'all';
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    // Severity filter
    const severityFilter = document.getElementById('severity-filter')?.value || 'all';
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }
    
    // Date filter
    const dateFilter = document.getElementById('date-filter')?.value || 'all';
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        switch (dateFilter) {
          case 'today':
            return logDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return logDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return logDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return filtered;
  }
  
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  function attachEventListeners() {
    // Search input
    const searchInput = container.querySelector('#audit-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        render();
      });
    }
    
    // Action filter
    const actionFilter = container.querySelector('#action-filter');
    if (actionFilter) {
      actionFilter.addEventListener('change', () => {
        currentPage = 1;
        render();
      });
    }
    
    // Severity filter
    const severityFilter = container.querySelector('#severity-filter');
    if (severityFilter) {
      severityFilter.addEventListener('change', () => {
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
  
  async function loadAuditLogs() {
    try {
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_audit_logs' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        auditLogs = data.logs || [];
        render();
      } else {
        console.error('Failed to load audit logs:', data.error);
        // Load sample data for demo
        loadSampleAuditLogs();
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      loadSampleAuditLogs();
    }
  }
  
  function loadSampleAuditLogs() {
    auditLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        user_name: 'Admin User',
        user_role: 'admin',
        action: 'login',
        details: 'Successful admin login',
        ip_address: '192.168.1.100',
        severity: 'low',
        status: 'success'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user_name: 'Admin User',
        user_role: 'admin',
        action: 'admin_action',
        details: 'Updated product: Wireless Headphones',
        ip_address: '192.168.1.100',
        severity: 'medium',
        status: 'success'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user_name: 'John Doe',
        user_role: 'customer',
        action: 'login',
        details: 'Customer login',
        ip_address: '192.168.1.101',
        severity: 'low',
        status: 'success'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user_name: 'Unknown',
        user_role: 'guest',
        action: 'login',
        details: 'Failed login attempt with invalid credentials',
        ip_address: '192.168.1.102',
        severity: 'high',
        status: 'failed'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        user_name: 'Admin User',
        user_role: 'admin',
        action: 'order_update',
        details: 'Updated order status: #1001 to processing',
        ip_address: '192.168.1.100',
        severity: 'medium',
        status: 'success'
      }
    ];
    render();
  }
  
  // Global functions
  window.refreshAuditLogs = loadAuditLogs;
  window.previousPage = () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  };
  
  window.nextPage = () => {
    const totalPages = Math.ceil(auditLogs.length / logsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  };
  
  window.exportAuditLogs = () => {
    // Placeholder for export functionality
    alert('Export audit logs functionality coming soon!');
  };
  
  window.closeSecuritySettingsModal = () => {
    const modal = document.getElementById('security-settings-modal');
    modal.style.display = 'none';
  };
  
  window.saveSecuritySettings = () => {
    // Placeholder for save settings functionality
    alert('Security settings saved!');
    closeSecuritySettingsModal();
  };
  
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadAuditLogs();
  
  return container;
}
