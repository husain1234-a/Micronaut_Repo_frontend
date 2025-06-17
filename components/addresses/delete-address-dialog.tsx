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

interface DeleteAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: any
}

export function DeleteAddressDialog({ open, onOpenChange, address }: DeleteAddressDialogProps) {
  const [loading, setLoading] = useState(false)
  const { dispatch } = useAppContext()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!address) return

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      dispatch({ type: "DELETE_ADDRESS", payload: address.id })

      toast({
        title: "Address deleted",
        description: "The address has been successfully deleted.",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
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
          <DialogTitle>Delete Address</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this address at {address?.street}? This action cannot be undone.
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
