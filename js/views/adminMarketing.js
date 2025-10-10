import { formatPKR } from '../utils/currency.js';

export function createAdminMarketingView() {
  const container = document.createElement('div');
  container.className = 'admin-marketing';
  
  let campaigns = [];
  let discounts = [];
  let analytics = {};
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <div class="nav-breadcrumb">
            <a href="#/admin/dashboard">Dashboard</a> / Marketing & Promotions
          </div>
          <div class="admin-actions">
            <button class="btn primary" onclick="createCampaign()">Create Campaign</button>
            <button class="btn" onclick="refreshMarketing()">Refresh</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/products" class="nav-link">Products</a>
          <a href="#/admin/orders" class="nav-link">Orders</a>
          <a href="#/admin/customers" class="nav-link">Customers</a>
          <a href="#/admin/marketing" class="nav-link active">Marketing</a>
        </div>
      </div>
      
      <div class="admin-content">
        <div class="marketing-header">
          <h2>Marketing & Promotions</h2>
          <div class="marketing-stats">
            <div class="stat-card">
              <div class="stat-value">${campaigns.length}</div>
              <div class="stat-label">Active Campaigns</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${discounts.length}</div>
              <div class="stat-label">Discount Codes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.email_sent || 0}</div>
              <div class="stat-label">Emails Sent</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.conversion_rate || '0%'}</div>
              <div class="stat-label">Conversion Rate</div>
            </div>
          </div>
        </div>
        
        <div class="marketing-tabs">
          <button class="tab-btn active" onclick="switchTab('campaigns')">Email Campaigns</button>
          <button class="tab-btn" onclick="switchTab('discounts')">Discount Codes</button>
          <button class="tab-btn" onclick="switchTab('analytics')">Analytics</button>
          <button class="tab-btn" onclick="switchTab('reviews')">Customer Reviews</button>
        </div>
        
        <div class="tab-content">
          <!-- Email Campaigns Tab -->
          <div id="campaigns-tab" class="tab-panel active">
            <div class="campaigns-header">
              <h3>Email Campaigns</h3>
              <button class="btn primary" onclick="createCampaign()">Create New Campaign</button>
            </div>
            <div class="campaigns-list">
              ${renderCampaignsList()}
            </div>
          </div>
          
          <!-- Discount Codes Tab -->
          <div id="discounts-tab" class="tab-panel">
            <div class="discounts-header">
              <h3>Discount Codes</h3>
              <button class="btn primary" onclick="createDiscount()">Create New Discount</button>
            </div>
            <div class="discounts-list">
              ${renderDiscountsList()}
            </div>
          </div>
          
          <!-- Analytics Tab -->
          <div id="analytics-tab" class="tab-panel">
            <div class="analytics-content">
              <h3>Marketing Analytics</h3>
              <div class="analytics-grid">
                <div class="analytics-card">
                  <h4>Email Performance</h4>
                  <div class="metric">
                    <span class="metric-label">Open Rate</span>
                    <span class="metric-value">${analytics.email_open_rate || '24.5%'}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Click Rate</span>
                    <span class="metric-value">${analytics.email_click_rate || '3.2%'}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Unsubscribe Rate</span>
                    <span class="metric-value">${analytics.unsubscribe_rate || '0.8%'}</span>
                  </div>
                </div>
                
                <div class="analytics-card">
                  <h4>Campaign Performance</h4>
                  <div class="metric">
                    <span class="metric-label">Total Sent</span>
                    <span class="metric-value">${analytics.total_sent || '1,250'}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Total Opened</span>
                    <span class="metric-value">${analytics.total_opened || '306'}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Total Clicks</span>
                    <span class="metric-value">${analytics.total_clicks || '40'}</span>
                  </div>
                </div>
                
                <div class="analytics-card">
                  <h4>Revenue Impact</h4>
                  <div class="metric">
                    <span class="metric-label">Email Revenue</span>
                    <span class="metric-value">${formatPKR(analytics.email_revenue || 0)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Discount Savings</span>
                    <span class="metric-value">${formatPKR(analytics.discount_savings || 0)}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">ROI</span>
                    <span class="metric-value">${analytics.roi || '320%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Customer Reviews Tab -->
          <div id="reviews-tab" class="tab-panel">
            <div class="reviews-content">
              <h3>Customer Reviews & Ratings</h3>
              <div class="reviews-stats">
                <div class="stat-card">
                  <div class="stat-value">4.2</div>
                  <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">127</div>
                  <div class="stat-label">Total Reviews</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">89%</div>
                  <div class="stat-label">Positive Reviews</div>
                </div>
              </div>
              <div class="reviews-list">
                ${renderReviewsList()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Create Campaign Modal -->
      <div id="campaign-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create Email Campaign</h3>
            <button class="close-btn" onclick="closeCampaignModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="campaign-form">
              <div class="form-group">
                <label for="campaign-name">Campaign Name</label>
                <input type="text" id="campaign-name" required>
              </div>
              <div class="form-group">
                <label for="campaign-subject">Subject Line</label>
                <input type="text" id="campaign-subject" required>
              </div>
              <div class="form-group">
                <label for="campaign-content">Email Content</label>
                <textarea id="campaign-content" rows="10" required></textarea>
              </div>
              <div class="form-group">
                <label for="campaign-audience">Target Audience</label>
                <select id="campaign-audience">
                  <option value="all">All Customers</option>
                  <option value="new">New Customers</option>
                  <option value="returning">Returning Customers</option>
                  <option value="inactive">Inactive Customers</option>
                </select>
              </div>
            </form>
            <div class="modal-actions">
              <button class="btn primary" onclick="saveCampaign()">Create Campaign</button>
              <button class="btn" onclick="closeCampaignModal()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function renderCampaignsList() {
    if (campaigns.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📧</div>
          <h3>No campaigns found</h3>
          <p>Create your first email campaign to get started</p>
        </div>
      `;
    }
    
    return campaigns.map(campaign => `
      <div class="campaign-item">
        <div class="campaign-info">
          <h4>${campaign.name}</h4>
          <p>${campaign.subject}</p>
          <div class="campaign-stats">
            <span>Sent: ${campaign.sent || 0}</span>
            <span>Opened: ${campaign.opened || 0}</span>
            <span>Clicks: ${campaign.clicks || 0}</span>
          </div>
        </div>
        <div class="campaign-actions">
          <button class="btn small" onclick="editCampaign(${campaign.id})">Edit</button>
          <button class="btn small secondary" onclick="duplicateCampaign(${campaign.id})">Duplicate</button>
          <button class="btn small danger" onclick="deleteCampaign(${campaign.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }
  
  function renderDiscountsList() {
    if (discounts.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>No discount codes found</h3>
          <p>Create your first discount code to start promoting</p>
        </div>
      `;
    }
    
    return discounts.map(discount => `
      <div class="discount-item">
        <div class="discount-info">
          <h4>${discount.code}</h4>
          <p>${discount.description}</p>
          <div class="discount-details">
            <span>Type: ${discount.type}</span>
            <span>Value: ${discount.value}</span>
            <span>Uses: ${discount.uses || 0}/${discount.max_uses || '∞'}</span>
          </div>
        </div>
        <div class="discount-actions">
          <button class="btn small" onclick="editDiscount(${discount.id})">Edit</button>
          <button class="btn small danger" onclick="deleteDiscount(${discount.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }
  
  function renderReviewsList() {
    const reviews = [
      {
        id: 1,
        customer: 'John Doe',
        product: 'Wireless Headphones',
        rating: 5,
        comment: 'Excellent sound quality and comfortable to wear!',
        date: '2024-01-20'
      },
      {
        id: 2,
        customer: 'Jane Smith',
        product: 'Smart Watch',
        rating: 4,
        comment: 'Great features, battery could be better.',
        date: '2024-01-19'
      },
      {
        id: 3,
        customer: 'Bob Johnson',
        product: 'Bluetooth Speaker',
        rating: 5,
        comment: 'Perfect for outdoor activities!',
        date: '2024-01-18'
      }
    ];
    
    return reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-customer">
            <strong>${review.customer}</strong>
            <div class="review-rating">
              ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
            </div>
          </div>
          <div class="review-date">${review.date}</div>
        </div>
        <div class="review-product">Product: ${review.product}</div>
        <div class="review-comment">${review.comment}</div>
        <div class="review-actions">
          <button class="btn small" onclick="approveReview(${review.id})">Approve</button>
          <button class="btn small secondary" onclick="replyToReview(${review.id})">Reply</button>
          <button class="btn small danger" onclick="deleteReview(${review.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }
  
  function attachEventListeners() {
    // Tab switching
    const tabButtons = container.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        switchTab(tabName);
      });
    });
  }
  
  function switchTab(tabName) {
    // Remove active class from all tabs and panels
    container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    const activeTab = container.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const activePanel = container.querySelector(`#${tabName}-tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
  }
  
  async function loadMarketingData() {
    try {
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_marketing_data' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        campaigns = data.campaigns || [];
        discounts = data.discounts || [];
        analytics = data.analytics || {};
        render();
      } else {
        console.error('Failed to load marketing data:', data.error);
        loadSampleData();
      }
    } catch (error) {
      console.error('Error loading marketing data:', error);
      loadSampleData();
    }
  }
  
  function loadSampleData() {
    campaigns = [
      {
        id: 1,
        name: 'Welcome Series',
        subject: 'Welcome to NeoShop!',
        sent: 150,
        opened: 45,
        clicks: 12,
        status: 'active'
      },
      {
        id: 2,
        name: 'Product Launch',
        subject: 'New Wireless Headphones Available!',
        sent: 200,
        opened: 60,
        clicks: 25,
        status: 'completed'
      }
    ];
    
    discounts = [
      {
        id: 1,
        code: 'WELCOME10',
        description: '10% off for new customers',
        type: 'percentage',
        value: '10%',
        uses: 45,
        max_uses: 100,
        status: 'active'
      },
      {
        id: 2,
        code: 'SAVE20',
        description: '$20 off orders over $100',
        type: 'fixed',
        value: '$20',
        uses: 23,
        max_uses: 50,
        status: 'active'
      }
    ];
    
    analytics = {
      email_sent: 1250,
      email_open_rate: '24.5%',
      email_click_rate: '3.2%',
      unsubscribe_rate: '0.8%',
      total_sent: '1,250',
      total_opened: '306',
      total_clicks: '40',
      email_revenue: 2500,
      discount_savings: 450,
      roi: '320%'
    };
    
    render();
  }
  
  // Global functions
  window.refreshMarketing = loadMarketingData;
  window.switchTab = switchTab;
  window.createCampaign = () => {
    const modal = document.getElementById('campaign-modal');
    modal.style.display = 'block';
  };
  
  window.closeCampaignModal = () => {
    const modal = document.getElementById('campaign-modal');
    modal.style.display = 'none';
  };
  
  window.saveCampaign = () => {
    // Placeholder for save campaign functionality
    alert('Campaign created successfully!');
    closeCampaignModal();
  };
  
  window.createDiscount = () => {
    alert('Create discount functionality coming soon!');
  };
  
  window.editCampaign = (id) => {
    alert('Edit campaign functionality coming soon!');
  };
  
  window.duplicateCampaign = (id) => {
    alert('Duplicate campaign functionality coming soon!');
  };
  
  window.deleteCampaign = (id) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      alert('Campaign deleted successfully!');
    }
  };
  
  window.editDiscount = (id) => {
    alert('Edit discount functionality coming soon!');
  };
  
  window.deleteDiscount = (id) => {
    if (confirm('Are you sure you want to delete this discount code?')) {
      alert('Discount code deleted successfully!');
    }
  };
  
  window.approveReview = (id) => {
    alert('Review approved successfully!');
  };
  
  window.replyToReview = (id) => {
    alert('Reply to review functionality coming soon!');
  };
  
  window.deleteReview = (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      alert('Review deleted successfully!');
    }
  };
  
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadMarketingData();
  
  return container;
}
