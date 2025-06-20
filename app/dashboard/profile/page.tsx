"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userService } from "../../../src/services/user"

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
]

const addressTypeOptions = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
]

export default function ProfilePage() {
  const { state } = useAppContext()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!state.user?.id) return
      setLoading(true)
      try {
        const user = await userService.getUserById(state.user.id)
        setFormData({
          ...user,
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth : "",
          gender: user.gender || "",
          address: user.address || {
            streetAddress: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            addressType: "HOME",
            defaultAddress: true
          }
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user profile.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [state.user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name.startsWith("address.")) {
      const addrField = name.replace("address.", "")
      setFormData((prev: any) => ({
        ...prev,
        address: {
          ...prev.address,
          [addrField]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userService.updateUser(formData.id, {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        address: {
          ...formData.address,
          defaultAddress: !!formData.address?.defaultAddress
        }
      })
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading || !formData) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Gender</option>
                {genderOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* Address Fields */}
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="address.streetAddress"
                  placeholder="Street Address"
                  value={formData.address?.streetAddress || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <Input
                  name="address.city"
                  placeholder="City"
                  value={formData.address?.city || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <Input
                  name="address.state"
                  placeholder="State"
                  value={formData.address?.state || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <Input
                  name="address.postalCode"
                  placeholder="Postal Code"
                  value={formData.address?.postalCode || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <Input
                  name="address.country"
                  placeholder="Country (2-letter code)"
                  value={formData.address?.country || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <select
                  name="address.addressType"
                  value={formData.address?.addressType || "HOME"}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded px-2 py-2"
                >
                  {addressTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <label className="flex items-center col-span-2">
                  <input
                    type="checkbox"
                    name="address.defaultAddress"
                    checked={!!formData.address?.defaultAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  Default Address
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 