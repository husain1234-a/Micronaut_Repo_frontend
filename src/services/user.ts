import { api } from "../utils/api"

interface Address {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  defaultAddress: boolean;
}

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
}

interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  // ...other fields if needed
}

export const userService = {
  /**
   * Fetch paginated users from backend. Returns { content, totalPages, totalElements, ... }
   * @param page Zero-based page number
   * @param size Page size
   */
  async getUsers(page = 0, size = 2) {
    try {
      const response = await api<PaginatedResponse<User>>(`/users?page=${page}&size=${size}`);
      // Defensive: If backend returns array, wrap in paginated structure
      if (Array.isArray(response)) {
        return {
          content: response,
          totalPages: 1,
          totalElements: response.length,
          size,
          number: page
        };
      }
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUserById(id: string) {
    try {
      return await api<User>(`/users/${id}`)
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  async updateProfile(userData: {
    firstName: string
    lastName: string
    phoneNumber: string
  }) {
    try {
      console.log("Updating user profile with data:", userData)
      const response = await api<User>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(userData)
      })
      console.log("Profile update response:", response)
      return response
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  async deleteUser(id: string) {
    try {
      return await api<void>(`/users/${id}`, {
        method: "DELETE"
      })
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },

  async createUser(userData: any) {
    try {
      console.log("=== USER CREATION DEBUG LOG ===")
      console.log("Raw user data received:", userData)
      console.log("Data type:", typeof userData)
      console.log("Is object:", typeof userData === 'object')
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'gender', 'role']
      const missingFields = requiredFields.filter(field => !userData[field])
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }
      
      // Log each field for debugging
      console.log("firstName:", userData.firstName, "Type:", typeof userData.firstName)
      console.log("lastName:", userData.lastName, "Type:", typeof userData.lastName)
      console.log("email:", userData.email, "Type:", typeof userData.email)
      console.log("password:", userData.password ? "***" : "MISSING", "Type:", typeof userData.password)
      console.log("dateOfBirth:", userData.dateOfBirth, "Type:", typeof userData.dateOfBirth)
      console.log("gender:", userData.gender, "Type:", typeof userData.gender)
      console.log("role:", userData.role, "Type:", typeof userData.role)
      console.log("phoneNumber:", userData.phoneNumber, "Type:", typeof userData.phoneNumber)
      console.log("address:", userData.address, "Type:", typeof userData.address)
      
      // Validate address if present
      if (userData.address) {
        console.log("Address validation:")
        console.log("  streetAddress:", userData.address.streetAddress || userData.address.street)
        console.log("  city:", userData.address.city)
        console.log("  state:", userData.address.state)
        console.log("  country:", userData.address.country)
        console.log("  postalCode:", userData.address.postalCode)
      }
      
      // Prepare the request payload
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        role: userData.role,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address ? {
          streetAddress: userData.address.streetAddress || userData.address.street,
          city: userData.address.city,
          state: userData.address.state,
          country: userData.address.country,
          postalCode: userData.address.postalCode,
          addressType: userData.address.addressType || 'HOME',
          defaultAddress: userData.address.defaultAddress || true
        } : null
      }
      
      console.log("Final payload being sent to backend:", JSON.stringify(payload, null, 2))
      
      const response = await api("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      
      console.log("User created successfully:", response)
      console.log("=== END USER CREATION DEBUG LOG ===")
      return response
    } catch (error) {
      console.error("=== USER CREATION ERROR ===")
      console.error("Error creating user:", error)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      
      // If it's a fetch error, try to get more details
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error constructor:", error.constructor.name)
      }
      
      console.error("=== END USER CREATION ERROR ===")
      throw error
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      console.log("=== USER UPDATE DEBUG LOG ===");
      console.log("Updating user with id:", id);
      console.log("User data:", userData);
      // Prepare the request payload (same as createUser)
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        role: userData.role,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address ? {
          streetAddress: userData.address.streetAddress || userData.address.street,
          city: userData.address.city,
          state: userData.address.state,
          country: userData.address.country,
          postalCode: userData.address.postalCode,
          addressType: userData.address.addressType || 'HOME',
          defaultAddress: userData.address.defaultAddress || true
        } : null
      };
      const apiUrl = `/users/${id}`;
      console.log("API URL:", apiUrl);
      const headers = {
        'Content-Type': 'application/json',
      };
      console.log("Request headers:", headers);
      console.log("Final payload for update:", JSON.stringify(payload, null, 2));
      const response = await api(apiUrl, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers,
      });
      console.log("User updated successfully:", response);
      console.log("=== END USER UPDATE DEBUG LOG ===");
      return response;
    } catch (error) {
      console.error("=== USER UPDATE ERROR ===");
      console.error("Error updating user:", error as any);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        try {
          // @ts-ignore
          const errorText = await (error as any).response.text();
          console.error("Raw error response text:", errorText);
        } catch (parseErr) {
          console.error("Could not parse error response text:", parseErr);
        }
      }
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      console.error("=== END USER UPDATE ERROR ===");
      throw error;
    }
  },

  async getPendingPasswordChangeRequests() {
    try {
      return await api<any[]>("/users/password-change-requests/pending")
    } catch (error) {
      console.error("Error fetching pending password change requests:", error as any)
      throw error
    }
  },

  async approveOrRejectPasswordChangeRequest(requestId: string, adminId: string, approved: boolean) {
    try {
      return await api(`/users/password-change-requests/${requestId}/approve`, {
        method: "PUT",
        body: JSON.stringify({ adminId, approved })
      })
    } catch (error) {
      console.error("Error approving/rejecting password change request:", error as any)
      throw error
    }
  },

  async requestPasswordChange(userId: string, oldPassword: string, newPassword: string) {
    try {
      return await api<void>(`/users/${userId}/change-password`, {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword })
      })
    } catch (error) {
      console.error("Error requesting password change:", error as any)
      throw error
    }
  }
} 
