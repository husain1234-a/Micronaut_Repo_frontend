import { api } from "../utils/api"

interface User {
  id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const userService = {
  async getUsers() {
    try {
      return await api<User[]>("/users")
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
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
  }
} 