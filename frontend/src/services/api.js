// API Client Service for TrustPay Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('access_token');
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Parse JSON response
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Handle 401 Unauthorized - only redirect if not on login/register endpoints
        if (response.status === 401 && !endpoint.includes('/auth/')) {
          this.clearAuth();
          window.location.href = '/'; // Redirect to login
        }
        
        throw new Error(data?.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ============ Authentication APIs ============

  async register(userData) {
    const response = await this.post('/api/v1/auth/register', userData);
    return response;
  }

  async login(email, password) {
    console.log('API: Attempting login for:', email);
    try {
      const response = await this.post('/api/v1/auth/login', { email, password });
      console.log('API: Login response:', response);
      if (response.access_token) {
        this.setToken(response.access_token);
        console.log('API: Token saved successfully');
      } else {
        console.error('API: No access_token in response');
      }
      return response;
    } catch (error) {
      console.error('API: Login failed with error:', error);
      throw error;
    }
  }

  logout() {
    this.clearAuth();
  }

  // ============ User APIs ============

  async getCurrentUser() {
    return this.get('/api/v1/users/me');
  }

  async updateUser(userData) {
    return this.put('/api/v1/users/me', userData);
  }

  // ============ Escrow APIs ============

  async createEscrow(escrowData) {
    return this.post('/api/v1/escrows/create', escrowData);
  }

  async getEscrow(escrowId) {
    return this.get(`/api/v1/escrows/${escrowId}`);
  }

  async listEscrows() {
    return this.get('/api/v1/escrows/');
  }

  async confirmEscrow(escrowId) {
    return this.post(`/api/v1/escrows/${escrowId}/confirm`, {});
  }

  async raiseDispute(escrowId, reason) {
    return this.post(`/api/v1/escrows/${escrowId}/dispute`, { reason });
  }

  async getPaymentStatus(escrowId) {
    return this.get(`/api/v1/escrows/${escrowId}/payment-status`);
  }

  async cancelEscrow(escrowId, reason) {
    return this.post(`/api/v1/escrows/${escrowId}/cancel`, { reason });
  }

  // ============ Health Check ============

  async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
