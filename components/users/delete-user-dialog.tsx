"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const { dispatch } = useAppContext()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Call backend API to delete user
      await userService.deleteUser(user.id)
      dispatch({ type: "DELETE_USER", payload: user.id })
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            {user
              ? `Are you sure you want to delete ${user.firstName || user.email || 'this user'}${user.lastName ? ' ' + user.lastName : ''}? This action cannot be undone.`
              : 'Are you sure you want to delete this user? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
