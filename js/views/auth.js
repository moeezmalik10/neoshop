import { useAuthStore } from '../store/authStore.js';

export function createAuthView() {
  const container = document.createElement('div');
  container.className = 'auth-container';
  
  let isLoginMode = true;
  
  function render() {
    container.innerHTML = `
      <div class="auth-back-btn">
        <button onclick="window.location.hash = '#/home'" class="back-to-home">
          ← Back to Home
        </button>
      </div>
      <div class="auth-card">
        <div class="auth-header">
          <h2>${isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
          <p>${isLoginMode ? 'Sign in to your account' : 'Join us and start shopping'}</p>
        </div>
        
        <div class="auth-tabs">
          <button class="auth-tab ${isLoginMode ? 'active' : ''}" data-action="login">
            Sign In
          </button>
          <button class="auth-tab ${!isLoginMode ? 'active' : ''}" data-action="register">
            Sign Up
          </button>
        </div>
        
        <form class="auth-form" id="auth-form">
          ${!isLoginMode ? `
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required placeholder="Enter your full name">
            </div>
          ` : ''}
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-field" style="position: relative; display: flex; align-items: center;">
              <input type="password" id="password" name="password" required placeholder="Enter your password" style="flex:1; padding-right: 44px;">
              <button type="button" id="toggle-password" aria-label="Show password" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:#7aa2ff; cursor:pointer; font-weight:600;">Show</button>
            </div>
          </div>

          <div class="form-group" style="display:inline-flex; align-items:center; gap:6px; flex-wrap:nowrap; white-space:nowrap; margin:8px 0 0;">
            <input type="checkbox" id="accept-terms" name="acceptTerms" required style="margin:0; inline-size:auto; block-size:auto; vertical-align:middle;">
            <label for="accept-terms" style="margin:0; line-height:1; white-space:nowrap; display:inline-flex; align-items:center;">
              Accept <a href="javascript:void(0)" onclick="window.showTermsModal && window.showTermsModal()">Terms and Conditions</a>
            </label>
          </div>
          
          <button type="submit" class="auth-submit" id="submit-btn">
            ${isLoginMode ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>
            ${isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button class="auth-toggle" data-action="${isLoginMode ? 'register' : 'login'}">
              ${isLoginMode ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
        
        <div class="auth-error" id="auth-error" style="display: none;"></div>
      </div>
    `;
    
    attachEventListeners();
  }
  
  function attachEventListeners() {
    // Tab switching
    container.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'login') {
          isLoginMode = true;
        } else {
          isLoginMode = false;
        }
        render();
      });
    });
    
    // Toggle between login/register
    container.querySelectorAll('.auth-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'login') {
          isLoginMode = true;
        } else {
          isLoginMode = false;
        }
        render();
      });
    });
    
    // Form submission
    const form = container.querySelector('#auth-form');
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
    const errorDiv = container.querySelector('#auth-error');
    const formData = new FormData(e.target);
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      const authStore = useAuthStore();
      
      if (isLoginMode) {
        // Enforce Terms acceptance on login
        const terms = container.querySelector('#accept-terms');
        if (terms && !terms.checked) {
          throw new Error('Please accept the Terms and Conditions to continue.');
        }
        // Login
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Check if this is an admin login attempt
        if (email === 'admin@gmail.com' && password === 'admin123') {
          // Update button text for admin login
          submitBtn.textContent = 'Logging in as Admin...';
          
          // Handle admin login directly
          try {
            const response = await fetch('./backend/public/admin.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'login', email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Admin login failed');
            }
            
            // Store admin token
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            
            // Update button text for success
            submitBtn.textContent = 'Admin Login Successful!';
            
            // Redirect to admin dashboard
            setTimeout(() => {
              window.location.hash = '#/admin/dashboard';
            }, 1000);
            return;
            
          } catch (error) {
            throw new Error('Admin login failed: ' + error.message);
          }
        }
        
        await authStore.login(email, password);
        
        // Reset cart and wishlist after successful login
        if (typeof window.resetCartAndWishlist === 'function') {
          window.resetCartAndWishlist();
        }
        
        // Ensure base layout is restored before navigating
        const appRootAfterLogin = document.getElementById('app');
        if (appRootAfterLogin) {
          appRootAfterLogin.innerHTML = `\n      <!-- Views render here -->\n      <section class="view" id="view-root" aria-live="polite"></section>\n    `;
        }
        // Redirect to home page on successful login
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('/home');
        } else {
          window.location.hash = '#/home';
        }
        // Update navigation
        if (window.updateAuthNavigation) {
          window.updateAuthNavigation();
        }
        // Force immediate view mount in case hashchange is missed
        if (window.dispatchEvent && typeof window.Event === 'function') {
          window.dispatchEvent(new Event('hashchange'));
        }
        if (typeof window.mountView === 'function') {
          try { window.mountView(); } catch {}
        }
        
      } else {
        // Register
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        // Enforce Terms acceptance on signup as well
        const terms = container.querySelector('#accept-terms');
        if (terms && !terms.checked) {
          throw new Error('Please accept the Terms and Conditions to continue.');
        }
        
        await authStore.register(name, email, password);
        
        // Reset cart and wishlist after successful registration
        if (typeof window.resetCartAndWishlist === 'function') {
          window.resetCartAndWishlist();
        }
        
        // Ensure base layout is restored before navigating
        const appRootAfterSignup = document.getElementById('app');
        if (appRootAfterSignup) {
          appRootAfterSignup.innerHTML = `\n      <!-- Views render here -->\n      <section class="view" id="view-root" aria-live="polite"></section>\n    `;
        }
        // Redirect to home page on successful registration
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('/home');
        } else {
          window.location.hash = '#/home';
        }
        // Update navigation
        if (window.updateAuthNavigation) {
          window.updateAuthNavigation();
        }
        // Force immediate view mount in case hashchange is missed
        if (window.dispatchEvent && typeof window.Event === 'function') {
          window.dispatchEvent(new Event('hashchange'));
        }
        if (typeof window.mountView === 'function') {
          try { window.mountView(); } catch {}
        }
      }
      
    } catch (error) {
      // Show error message
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    }
  }
  
  // Initial render
  render();
  
  return container;
}
