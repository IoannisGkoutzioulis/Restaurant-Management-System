document.addEventListener('DOMContentLoaded', () => {
  const adminAuth = new AdminAuthManager();
  adminAuth.initialize();
});


class AdminAuthManager {
  static API_BASE_URL = 'http://localhost:5000/admin';
  static DASHBOARD_URL = 'admin_dashboard.html';
  static HOME_URL = 'homepage.html';
  
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
  }
  
  
    //Cache DOM elements
  
  cacheElements() {
    this.loginForm = document.getElementById('adminLoginForm');
    this.signupForm = document.getElementById('adminSignupForm');
    this.toggleButtons = document.querySelectorAll('#toggleAdminForms');
    
    // Login form elements
    this.loginUsername = document.getElementById('adminLoginUsername');
    this.loginPassword = document.getElementById('adminLoginPassword');
    this.loginSubmitButton = document.getElementById('adminLoginSubmit');
    
    // Signup form elements
    this.signupUsername = document.getElementById('adminSignupUsername');
    this.signupPassword = document.getElementById('adminSignupPassword');
    this.signupSubmitButton = document.getElementById('adminSignupSubmit');
    
    // Navigation buttons
    this.backButtons = document.querySelectorAll('.backToHome');
  }
  

  setupEventListeners() {
    this.toggleButtons.forEach(btn => {
      btn.addEventListener('click', this.toggleForms.bind(this));
    });
    
    this.loginSubmitButton.addEventListener('click', this.handleLogin.bind(this));
    this.signupSubmitButton.addEventListener('click', this.handleSignup.bind(this));
    
    // Navigation
    this.backButtons.forEach(btn => {
      btn.addEventListener('click', this.navigateToHome.bind(this));
    });
  }
  

 //Toggle between login and signup forms

  toggleForms() {
    const loginVisible = this.loginForm.style.display !== 'none';
    
    this.loginForm.style.display = loginVisible ? 'none' : 'block';
    this.signupForm.style.display = loginVisible ? 'block' : 'none';
  }
  
  
    //Navigate to home page
   
  navigateToHome() {
    window.location.href = AdminAuthManager.HOME_URL;
  }
  
  /**
   * @param {Event} e 
   */
  async handleLogin(e) {
    e.preventDefault();
    
    const username = this.loginUsername.value.trim();
    const password = this.loginPassword.value;
    
    if (!this.validateCredentials(username, password)) {
      return;
    }
    
    try {
      const response = await this.sendRequest('/login', { username, password });
      
      if (response.token) {
        this.saveAuthToken(response.token);
        this.showSuccess('Admin login successful!');
        this.navigateToDashboard();
      } else {
        this.showError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      this.showError('Server error during login. Please try again later.');
    }
  }
  
  /**
   * @param {Event} e 
   */
  async handleSignup(e) {
    e.preventDefault();
    const username = this.signupUsername.value.trim();
    const password = this.signupPassword.value;
    
    if (!this.validateCredentials(username, password)) {
      return;
    }
    
    try {
      const response = await this.sendRequest('/signup', { username, password });
      this.showSuccess(response.message || 'Signup successful!');
      
      // Clear form
      this.signupUsername.value = '';
      this.signupPassword.value = '';
    } catch (error) {
      console.error('Admin signup error:', error);
      this.showError('Server error during sign-up. Please try again later.');
    }
  }
  
  /**
   * @param {string} username 
   * @param {string} password 
   * @returns {boolean} 
   */
  validateCredentials(username, password) {
    if (!username) {
      this.showError('Username is required.');
      return false;
    }
    
    if (!password) {
      this.showError('Password is required.');
      return false;
    }
    return true;
  }
  
  /**
   * Send API request
   * @param {string} endpoint 
   * @param {Object} data 
   * @returns {Promise<Object>} 
   */
  async sendRequest(endpoint, data) {
    const url = `${AdminAuthManager.API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  }
  
  /**
   * Save authentication token
   * @param {string} token 
   */
  saveAuthToken(token) {
    sessionStorage.setItem('adminToken', token);
  }
  
  navigateToDashboard() {
    window.location.href = AdminAuthManager.DASHBOARD_URL;
  }
  
  /**
   * @param {string} message 
   */
  showSuccess(message) {
    alert(message);
  }
  
  /**
   * @param {string} message 
   */
  showError(message) {
    alert(message);
  }
}