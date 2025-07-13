"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/app/providers"
import { UserDialog } from "@/components/users/user-dialog"
import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { userService } from "../../../src/services/user"

type UserType = {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  firstname?: string
  lastname?: string
  [key: string]: any
}
interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export default function UsersPage() {
  const { state } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // Pagination state
  const [page, setPage] = useState(0) // 0-based for backend
  const [size, setSize] = useState(3) // page size
  const [usersPage, setUsersPage] = useState<PaginatedResponse<UserType> | null>(null)

  useEffect(() => {
    userService.getUsers(page, size).then(res => setUsersPage(res))
  }, [page, size])

  const filteredUsers = (usersPage?.content ?? []).filter(
    (user) =>
      (user.firstName || user.firstname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || user.lastname || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user: UserType) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {(user.firstName || user.firstname || "")[0]}
                    {(user.lastName || user.lastname || "")[0]}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {(user.firstName || user.firstname) + " " + (user.lastName || user.lastname)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="flex justify-center items-center gap-4 py-4">
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page + 1} of {usersPage?.totalPages ?? 1}</span>
          <Button
            // disabled={page + 1 >= (usersPage?.totalPages ?? 1)}
            onClick={() => {setPage(page + 1); console.log("Next page:",  page)}}
          >Next</Button>
        </div>
      </Card>

      <UserDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />
      <UserDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} mode="edit" user={selectedUser} />
      <DeleteUserDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} user={selectedUser} />
    </div>
  )
}