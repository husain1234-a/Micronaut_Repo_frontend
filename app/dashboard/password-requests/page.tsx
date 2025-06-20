"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userService } from "../../../src/services/user"
import { useToast } from "@/hooks/use-toast"

interface PasswordChangeRequest {
  id: string
  userId: string
  newPassword: string
  status: string
  adminId?: string
  createdAt: string
  updatedAt?: string
  userFirstName?: string
  userLastName?: string
  userEmail?: string
}

export default function PasswordRequestsPage() {
  const { state } = useAppContext()
  const { toast } = useToast()
  const [requests, setRequests] = useState<PasswordChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (state.user?.role === "ADMIN") {
      fetchRequests()
    }
  }, [state.user])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await userService.getPendingPasswordChangeRequests()
      setRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch password change requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, approved: boolean) => {
    if (!state.user?.id) return
    setActionLoading(requestId)
    try {
      await userService.approveOrRejectPasswordChangeRequest(requestId, state.user.id, approved)
      toast({
        title: "Success",
        description: approved ? "Request approved" : "Request rejected"
      })
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (state.user?.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Password Change Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500">No pending password change requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {req.userFirstName} {req.userLastName} <span className="text-xs text-gray-400">({req.userEmail})</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Requested at: {new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{req.status}</Badge>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, true)}
                    >
                      {actionLoading === req.id ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, false)}
                    >
                      {actionLoading === req.id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 