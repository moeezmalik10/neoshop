import { formatPKR } from '../utils/currency.js';

export function createAdminProductsView() {
  const container = document.createElement('div');
  container.className = 'admin-products';
  
  let products = [];
  
  function render() {
    container.innerHTML = `
      <div class="admin-header">
        <div class="admin-nav">
          <div class="nav-breadcrumb">
            <a href="#/admin/dashboard">Dashboard</a> / Products
          </div>
          <div class="admin-actions">
            <button class="btn primary" onclick="showAddProductModal()">Add Product</button>
            <button class="btn" onclick="refreshProducts()">Refresh</button>
            <button class="btn" onclick="logoutAdmin()">Logout</button>
          </div>
        </div>
        <div class="admin-navigation">
          <a href="#/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="#/admin/products" class="nav-link active">Products</a>
          <a href="#/admin/orders" class="nav-link">Orders</a>
          <a href="#/admin/customers" class="nav-link">Customers</a>
          <a href="#/admin/security" class="nav-link">Security</a>
          <a href="#/admin/marketing" class="nav-link">Marketing</a>
        </div>
      </div>
      
      <div class="admin-content">
        <div class="content-header">
          <h1>Product Management</h1>
          <p>Manage your product inventory and listings</p>
        </div>
        
        <div class="products-table-container">
          <div class="table-header">
            <div class="table-actions">
              <input type="text" id="search-products" placeholder="Search products..." class="search-input">
              <select id="category-filter" class="filter-select">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>
          
          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="products-table-body">
                ${renderProductsTable()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Add/Edit Product Modal -->
      <div id="product-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Add Product</h2>
            <button class="modal-close" onclick="closeProductModal()">&times;</button>
          </div>
          <form id="product-form" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label for="product-name">Product Name</label>
                <input type="text" id="product-name" name="name" required>
              </div>
              <div class="form-group">
                <label for="product-category">Category</label>
                <select id="product-category" name="category" required>
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="product-price">Price</label>
                <input type="number" id="product-price" name="price" step="0.01" required>
              </div>
              <div class="form-group">
                <label for="product-stock">Stock Quantity</label>
                <input type="number" id="product-stock" name="stock" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="product-description">Description</label>
              <textarea id="product-description" name="description" rows="4"></textarea>
            </div>
            
            <div class="form-group">
              <label for="product-image">Image URL</label>
              <input type="url" id="product-image" name="image">
            </div>
            
            <div class="form-group">
              <label for="product-status">Status</label>
              <select id="product-status" name="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </form>
          <div class="modal-footer">
            <button type="button" class="btn" onclick="closeProductModal()">Cancel</button>
            <button type="submit" form="product-form" class="btn primary">Save Product</button>
          </div>
        </div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function renderProductsTable() {
    if (products.length === 0) {
      return `
        <tr>
          <td colspan="7" class="no-data">Loading products...</td>
        </tr>
      `;
    }
    
    return products.map(product => `
      <tr>
        <td>
          <div class="product-image">
            <img src="${product.image || '/placeholder.jpg'}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
          </div>
        </td>
        <td>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-id">ID: ${product.id}</div>
          </div>
        </td>
        <td>
          <span class="category-badge">${product.category}</span>
        </td>
        <td>
          <span class="price">${formatPKR(product.price)}</span>
        </td>
        <td>
          <span class="stock ${product.stock < 10 ? 'low-stock' : ''}">${product.stock}</span>
        </td>
        <td>
          <span class="status-badge status-${product.status || 'active'}">${product.status || 'active'}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" onclick="editProduct('${product.id}')" title="Edit">
              ✏️
            </button>
            <button class="btn-icon" onclick="deleteProduct('${product.id}')" title="Delete">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  function attachEventListeners() {
    // Search functionality
    const searchInput = container.querySelector('#search-products');
    if (searchInput) {
      searchInput.addEventListener('input', filterProducts);
    }
    
    // Category filter
    const categoryFilter = container.querySelector('#category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Product form submission
    const productForm = container.querySelector('#product-form');
    if (productForm) {
      productForm.addEventListener('submit', handleProductSubmit);
    }
  }
  
  function filterProducts() {
    const searchTerm = container.querySelector('#search-products').value.toLowerCase();
    const categoryFilter = container.querySelector('#category-filter').value;
    
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    
    // Re-render table with filtered products
    const tbody = container.querySelector('#products-table-body');
    if (tbody) {
      tbody.innerHTML = filteredProducts.map(product => `
        <tr>
          <td>
            <div class="product-image">
              <img src="${product.image || '/placeholder.jpg'}" alt="${product.name}" onerror="this.src='/placeholder.jpg'">
            </div>
          </td>
          <td>
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-id">ID: ${product.id}</div>
            </div>
          </td>
          <td>
            <span class="category-badge">${product.category}</span>
          </td>
          <td>
            <span class="price">${formatPKR(product.price)}</span>
          </td>
          <td>
            <span class="stock ${product.stock < 10 ? 'low-stock' : ''}">${product.stock}</span>
          </td>
          <td>
            <span class="status-badge status-${product.status || 'active'}">${product.status || 'active'}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" onclick="editProduct('${product.id}')" title="Edit">
                ✏️
              </button>
              <button class="btn-icon" onclick="deleteProduct('${product.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }
  
  async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    
    try {
      const token = localStorage.getItem('admin_token');
      const action = document.getElementById('modal-title').textContent === 'Add Product' ? 'create_product' : 'update_product';
      
      const response = await fetch('http://localhost/E-Commerce/backend/public/admin.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: action,
          product: productData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }
      
      closeProductModal();
      loadProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    }
  }
  
  async function loadProducts() {
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
        body: JSON.stringify({ action: 'get_products' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load products');
      }
      
      products = data.products || [];
      render();
      
    } catch (error) {
      console.error('Error loading products:', error);
      products = [];
      render();
    }
  }
  
  // Global functions
  window.showAddProductModal = () => {
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').style.display = 'flex';
  };
  
  window.closeProductModal = () => {
    document.getElementById('product-modal').style.display = 'none';
  };
  
  window.editProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      document.getElementById('modal-title').textContent = 'Edit Product';
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-stock').value = product.stock || 0;
      document.getElementById('product-description').value = product.description || '';
      document.getElementById('product-image').value = product.image || '';
      document.getElementById('product-status').value = product.status || 'active';
      document.getElementById('product-modal').style.display = 'flex';
    }
  };
  
  window.deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('http://localhost/E-Commerce/backend/public/admin.php', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            action: 'delete_product',
            product_id: productId
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete product');
        }
        
        loadProducts();
        
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
      }
    }
  };
  
  window.refreshProducts = loadProducts;
  window.logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/login';
  };
  
  // Initial render and data load
  render();
  loadProducts();
  
  return container;
}
