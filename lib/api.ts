// API service layer for making HTTP requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Add JWT token if available
    const token = localStorage.getItem("token")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // User endpoints
  async getUsers() {
    return this.request("/users")
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async getUserByEmail(email: string) {
    return this.request(`/users/email/${email}`)
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Password change endpoints
  async requestPasswordChange(userId: string, oldPassword: string, newPassword: string) {
    return this.request(`/users/${userId}/change-password`, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  async approvePasswordChange(userId: string, adminId: string, approved: boolean) {
    return this.request(`/users/${userId}/approve-password-change`, {
      method: "PUT",
      body: JSON.stringify({ adminId, approved }),
    })
  }

  // Address endpoints
  async getAddresses() {
    return this.request("/addresses")
  }

  async getAddress(id: string) {
    return this.request(`/addresses/${id}`)
  }

  async createAddress(addressData: any) {
    return this.request("/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    })
  }

  async updateAddress(id: string, addressData: any) {
    return this.request(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    })
  }

  async deleteAddress(id: string) {
    return this.request(`/addresses/${id}`, {
      method: "DELETE",
    })
  }

  // Notification endpoints
  async getNotifications() {
    return this.request("/notifications")
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify({ read: true }),
    })
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()

export async function api(url: string, options: RequestInit & { requiresAuth?: boolean } = {}) {
  const headers = options.headers || {};
  if (options.requiresAuth) {
    // Example: get token from localStorage or cookies
    const token = localStorage.getItem('token');
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json ? res.json() : res;
}
