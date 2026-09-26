// State management
const state = {
  jwt: null,
  user: null,
  apiKeys: [],
  selectedApiKey: null
};

// DOM elements
const elements = {
  healthBtn: document.getElementById('check-health-btn'),
  healthResult: document.getElementById('health-result'),
  
  tabSignup: document.getElementById('tab-signup'),
  tabLogin: document.getElementById('tab-login'),
  signupFormContainer: document.getElementById('signup-form-container'),
  loginFormContainer: document.getElementById('login-form-container'),
  signupForm: document.getElementById('signup-form'),
  loginForm: document.getElementById('login-form'),
  
  loggedOutView: document.getElementById('logged-out-view'),
  loggedInView: document.getElementById('logged-in-view'),
  userEmail: document.getElementById('user-email'),
  logoutBtn: document.getElementById('logout-btn'),
  authResult: document.getElementById('auth-result'),
  
  apiKeysSection: document.getElementById('api-keys-section'),
  createKeyForm: document.getElementById('create-key-form'),
  newKeyAlert: document.getElementById('new-key-alert'),
  newKeyValue: document.getElementById('new-key-value'),
  copyKeyBtn: document.getElementById('copy-key-btn'),
  refreshKeysBtn: document.getElementById('refresh-keys-btn'),
  keysContainer: document.getElementById('keys-container'),
  apiKeysResult: document.getElementById('api-keys-result'),
  
  protectedSection: document.getElementById('protected-section'),
  testJwtBtn: document.getElementById('test-jwt-btn'),
  testApiKeyBtn: document.getElementById('test-api-key-btn'),
  apiKeyInput: document.getElementById('api-key-input'),
  testCustomKeyBtn: document.getElementById('test-custom-key-btn'),
  protectedResult: document.getElementById('protected-result'),
  
  toast: document.getElementById('toast')
};

// Utility functions
function showToast(message, type = 'success') {
  const toast = elements.toast;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showResult(element, data, isError = false) {
  element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  element.classList.add('show');
  if (isError) {
    element.style.borderLeft = '4px solid var(--danger)';
  } else {
    element.style.borderLeft = '4px solid var(--success)';
  }
}

function hideResult(element) {
  element.classList.remove('show');
}

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth functions
function updateAuthUI() {
  if (state.jwt && state.user) {
    elements.loggedOutView.style.display = 'none';
    elements.loggedInView.style.display = 'block';
    elements.userEmail.textContent = state.user.email;
    elements.apiKeysSection.style.display = 'block';
    elements.protectedSection.style.display = 'block';
    loadApiKeys();
  } else {
    elements.loggedOutView.style.display = 'block';
    elements.loggedInView.style.display = 'none';
    elements.apiKeysSection.style.display = 'none';
    elements.protectedSection.style.display = 'none';
  }
}

function saveSession() {
  if (state.jwt && state.user) {
    sessionStorage.setItem('jwt', state.jwt);
    sessionStorage.setItem('user', JSON.stringify(state.user));
  }
}

function loadSession() {
  const jwt = sessionStorage.getItem('jwt');
  const userJson = sessionStorage.getItem('user');
  
  if (jwt && userJson) {
    state.jwt = jwt;
    state.user = JSON.parse(userJson);
    updateAuthUI();
  }
}

function clearSession() {
  state.jwt = null;
  state.user = null;
  state.apiKeys = [];
  state.selectedApiKey = null;
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('user');
  updateAuthUI();
}

// Event handlers
async function handleCheckHealth() {
  try {
    const data = await apiCall('/health');
    showResult(elements.healthResult, data);
  } catch (error) {
    showResult(elements.healthResult, error, true);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  hideResult(elements.authResult);
  
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  try {
    const data = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    state.jwt = data.accessToken;
    state.user = data.user;
    saveSession();
    updateAuthUI();
    
    showToast('Account created successfully!');
    e.target.reset();
  } catch (error) {
    showResult(elements.authResult, error, true);
    showToast(error.message || 'Signup failed', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  hideResult(elements.authResult);
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    state.jwt = data.accessToken;
    state.user = data.user;
    saveSession();
    updateAuthUI();
    
    showToast('Logged in successfully!');
    e.target.reset();
  } catch (error) {
    showResult(elements.authResult, error, true);
    showToast(error.message || 'Login failed', 'error');
  }
}

function handleLogout() {
  clearSession();
  showToast('Logged out successfully');
}

async function handleCreateApiKey(e) {
  e.preventDefault();
  hideResult(elements.apiKeysResult);
  elements.newKeyAlert.style.display = 'none';
  
  const name = document.getElementById('key-name').value;
  
  try {
    const data = await apiCall('/api-keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.jwt}`
      },
      body: JSON.stringify({ name })
    });
    
    elements.newKeyValue.textContent = data.key;
    elements.newKeyAlert.style.display = 'block';
    
    showToast('API key created successfully!');
    e.target.reset();
    
    await loadApiKeys();
    
    state.selectedApiKey = data.key;
    elements.testApiKeyBtn.disabled = false;
  } catch (error) {
    showResult(elements.apiKeysResult, error, true);
    showToast(error.message || 'Failed to create API key', 'error');
  }
}

async function loadApiKeys() {
  try {
    const keys = await apiCall('/api-keys', {
      headers: {
        'Authorization': `Bearer ${state.jwt}`
      }
    });
    
    state.apiKeys = keys;
    renderApiKeys();
  } catch (error) {
    showResult(elements.apiKeysResult, error, true);
  }
}

function renderApiKeys() {
  if (state.apiKeys.length === 0) {
    elements.keysContainer.innerHTML = '<p style="color: var(--text-secondary); margin-top: 1rem;">No API keys yet. Create your first one above.</p>';
    return;
  }
  
  elements.keysContainer.innerHTML = state.apiKeys.map(key => `
    <div class="key-item">
      <div class="key-info">
        <h4>${escapeHtml(key.name)}</h4>
        <div class="key-meta">
          <div><strong>Prefix:</strong> <code>${escapeHtml(key.keyPrefix)}</code></div>
          <div><strong>Created:</strong> ${new Date(key.createdAt).toLocaleString()}</div>
          ${key.lastUsedAt ? `<div><strong>Last used:</strong> ${new Date(key.lastUsedAt).toLocaleString()}</div>` : '<div><strong>Last used:</strong> Never</div>'}
        </div>
      </div>
      <button class="btn btn-danger btn-small" onclick="handleRevokeKey('${key.id}')">Revoke</button>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleRevokeKey(keyId) {
  if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
    return;
  }
  
  try {
    await apiCall(`/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.jwt}`
      }
    });
    
    showToast('API key revoked successfully');
    await loadApiKeys();
    
    if (state.apiKeys.length === 0) {
      state.selectedApiKey = null;
      elements.testApiKeyBtn.disabled = true;
    }
  } catch (error) {
    showResult(elements.apiKeysResult, error, true);
    showToast(error.message || 'Failed to revoke API key', 'error');
  }
}

async function handleTestJwt() {
  hideResult(elements.protectedResult);
  
  try {
    const data = await apiCall('/protected/profile', {
      headers: {
        'Authorization': `Bearer ${state.jwt}`
      }
    });
    
    showResult(elements.protectedResult, data);
  } catch (error) {
    showResult(elements.protectedResult, error, true);
  }
}

async function handleTestApiKey() {
  hideResult(elements.protectedResult);
  
  if (!state.selectedApiKey) {
    showToast('No API key selected. Create one first or enter manually below.', 'error');
    return;
  }
  
  try {
    const data = await apiCall('/protected/profile', {
      headers: {
        'X-API-Key': state.selectedApiKey
      }
    });
    
    showResult(elements.protectedResult, data);
  } catch (error) {
    showResult(elements.protectedResult, error, true);
  }
}

async function handleTestCustomKey() {
  hideResult(elements.protectedResult);
  
  const apiKey = elements.apiKeyInput.value.trim();
  
  if (!apiKey) {
    showToast('Please enter an API key', 'error');
    return;
  }
  
  try {
    const data = await apiCall('/protected/profile', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    
    showResult(elements.protectedResult, data);
  } catch (error) {
    showResult(elements.protectedResult, error, true);
  }
}

function handleCopyKey() {
  const keyValue = elements.newKeyValue.textContent;
  navigator.clipboard.writeText(keyValue).then(() => {
    showToast('API key copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy. Please select and copy manually.', 'error');
  });
}

function switchTab(tab) {
  if (tab === 'signup') {
    elements.tabSignup.classList.add('active');
    elements.tabLogin.classList.remove('active');
    elements.signupFormContainer.style.display = 'block';
    elements.loginFormContainer.style.display = 'none';
  } else {
    elements.tabLogin.classList.add('active');
    elements.tabSignup.classList.remove('active');
    elements.loginFormContainer.style.display = 'block';
    elements.signupFormContainer.style.display = 'none';
  }
}

// Event listeners
elements.healthBtn.addEventListener('click', handleCheckHealth);
elements.signupForm.addEventListener('submit', handleSignup);
elements.loginForm.addEventListener('submit', handleLogin);
elements.logoutBtn.addEventListener('click', handleLogout);
elements.createKeyForm.addEventListener('submit', handleCreateApiKey);
elements.refreshKeysBtn.addEventListener('click', loadApiKeys);
elements.copyKeyBtn.addEventListener('click', handleCopyKey);
elements.testJwtBtn.addEventListener('click', handleTestJwt);
elements.testApiKeyBtn.addEventListener('click', handleTestApiKey);
elements.testCustomKeyBtn.addEventListener('click', handleTestCustomKey);
elements.tabSignup.addEventListener('click', () => switchTab('signup'));
elements.tabLogin.addEventListener('click', () => switchTab('login'));

// Make handleRevokeKey globally accessible
window.handleRevokeKey = handleRevokeKey;

// Initialize
loadSession();
handleCheckHealth();
