"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/app/providers"
import { AddressDialog } from "@/components/addresses/address-dialog"
import { DeleteAddressDialog } from "@/components/addresses/delete-address-dialog"
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react"

export default function AddressesPage() {
  const { state } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredAddresses = state.addresses.filter(
    (address) =>
      address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUserName = (userId: string) => {
    const user = state.users.find((u) => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User"
  }

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address)
    setIsEditDialogOpen(true)
  }

  const handleDeleteAddress = (address: any) => {
    setSelectedAddress(address)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Addresses</h1>
          <p className="text-gray-600">Manage user addresses and locations</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Address Management</CardTitle>
          <CardDescription>View and manage all addresses in the system</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAddresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{address.street}</h3>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-xs text-gray-400">Owner: {getUserName(address.userId)}</p>
                  </div>
                  <Badge
                    variant={address.type === "home" ? "default" : address.type === "work" ? "secondary" : "outline"}
                  >
                    {address.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddressDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />

      <AddressDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} mode="edit" address={selectedAddress} />

      <DeleteAddressDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} address={selectedAddress} />
    </div>
  )
}
