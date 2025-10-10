import { useAuthStore } from '../store/authStore.js';

export function createAdminLoginView() {
  const container = document.createElement('div');
  container.className = 'admin-login-container';
  
  function render() {
    container.innerHTML = `
      <div class="admin-login-card">
        <div class="admin-login-header">
          <h2>Admin Login</h2>
          <p>Access the admin dashboard</p>
        </div>
        
        <form class="admin-login-form" id="admin-login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter admin email">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-field" style="position: relative; display: flex; align-items: center;">
              <input type="password" id="password" name="password" required placeholder="Enter admin password" style="flex:1; padding-right: 44px;">
              <button type="button" id="toggle-password" aria-label="Show password" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:#7aa2ff; cursor:pointer; font-weight:600;">Show</button>
            </div>
          </div>
          
          <button type="submit" class="admin-login-submit" id="submit-btn">
            Login to Admin Panel
          </button>
        </form>
        
        <div class="admin-login-footer">
          <a href="#/home" class="back-to-site">← Back to Site</a>
        </div>
        
        <div class="admin-login-error" id="admin-login-error" style="display: none;"></div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function attachEventListeners() {
    // Form submission
    const form = container.querySelector('#admin-login-form');
    form.addEventListener('submit', handleSubmit);

    // Password visibility toggle
    const toggleBtn = container.querySelector('#toggle-password');
    const passwordInput = container.querySelector('#password');
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isHidden ? 'text' : 'password');
        toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    }
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = container.querySelector('#submit-btn');
    const errorDiv = container.querySelector('#admin-login-error');
    const formData = new FormData(e.target);
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
      const email = formData.get('email');
      const password = formData.get('password');
      
      console.log('Attempting admin login with:', { email, password });
      
      const response = await fetch('./backend/public/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store admin token
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      // Redirect to admin dashboard
      window.location.hash = '#/admin/dashboard';
      
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Show error message with debug info
      let errorMessage = error.message;
      if (error.message.includes('debug')) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.error + ' (Check console for debug info)';
        } catch (e) {
          // Keep original error message
        }
      }
      
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = 'block';
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login to Admin Panel';
    }
  }
  
  // Initial render
  render();
  
  return container;
}
