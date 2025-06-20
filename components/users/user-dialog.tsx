"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppContext } from "@/app/providers"
import { useToast } from "@/hooks/use-toast"
import { userService } from "../../src/services/user"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  user?: any
}

export function UserDialog({ open, onOpenChange, mode, user }: UserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "USER" as "ADMIN" | "USER",
    password: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
    phoneNumber: "",
    address: {
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      addressType: "HOME" as "HOME" | "WORK" | "OTHER",
      defaultAddress: true,
    },
  })
  const [loading, setLoading] = useState(false)

  const { dispatch } = useAppContext()
  const { toast } = useToast()

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "MALE",
        phoneNumber: user.phoneNumber || "",
        address: {
          streetAddress: user.address?.streetAddress || user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          country: user.address?.country || "",
          postalCode: user.address?.postalCode || "",
          addressType: user.address?.addressType || "HOME",
          defaultAddress: user.address?.defaultAddress || true,
        },
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "USER",
        password: "",
        dateOfBirth: "",
        gender: "MALE",
        phoneNumber: "",
        address: {
          streetAddress: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          addressType: "HOME",
          defaultAddress: true,
        },
      })
    }
  }, [mode, user, open])

  // Password generator function
  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
    let password = ""
    while (true) {
      password = Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join("")
      // Must have at least one lowercase, one uppercase, one number, one special char
      if (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)
      ) {
        break
      }
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "create") {
        console.log("=== FORM SUBMISSION DEBUG ===")
        console.log("Form data before submission:", formData)
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'gender', 'role']
        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
        
        if (missingFields.length > 0) {
          console.error("Missing required fields in form:", missingFields)
          toast({
            title: "Validation Error",
            description: `Missing required fields: ${missingFields.join(', ')}`,
            variant: "destructive",
          })
          return
        }
        
        // Validate address fields
        const requiredAddressFields = ['streetAddress', 'city', 'country', 'postalCode']
        const missingAddressFields = requiredAddressFields.filter(field => !formData.address[field as keyof typeof formData.address])
        
        if (missingAddressFields.length > 0) {
          console.error("Missing required address fields:", missingAddressFields)
          toast({
            title: "Validation Error",
            description: `Missing required address fields: ${missingAddressFields.join(', ')}`,
            variant: "destructive",
          })
          return
        }
        
        console.log("All validations passed, calling userService.createUser")
        const createdUser = await userService.createUser(formData)
        dispatch({ type: "ADD_USER", payload: createdUser as any })
        toast({
          title: "User created",
          description: "The user has been successfully created.",
        })
      } else {
        // Update user via backend API
        const updatedUser = await userService.updateUser(user.id, formData)
        dispatch({ type: "UPDATE_USER", payload: updatedUser })
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("User creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string, nested = false) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new user to the system." : "Make changes to the user information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="10 digits"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
                <span className="text-xs text-gray-500">Min 8 chars, upper, lower, number, special char</span>
              </div>
            )}
            
            {/* Address Fields */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.address.streetAddress}
                  onChange={(e) => handleChange("streetAddress", e.target.value, true)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleChange("city", e.target.value, true)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleChange("state", e.target.value, true)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleChange("country", e.target.value, true)}
                    placeholder="2-letter ISO code (e.g., US)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value, true)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addressType">Address Type</Label>
                <Select value={formData.address.addressType} onValueChange={(value) => handleChange("addressType", value, true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">Home</SelectItem>
                    <SelectItem value="WORK">Work</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
