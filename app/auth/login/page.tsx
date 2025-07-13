"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppContext } from "@/app/providers"
import { useToast } from "@/hooks/use-toast"
import { login as apiLogin } from "@/src/services/auth"
import { handleLoginResponse } from "@/src/utils/auth"
import Cookies from 'js-cookie'
import "./login.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { dispatch } = useAppContext()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔑 Login form submitted');
    setLoading(true)
    setError("")

    try {
      console.log('📡 Sending login request to API...');
      const response = await apiLogin({ email, password })
      console.log('✅ Login response received:', response)
      
      // Handle login response and store data
      console.log('🔄 Processing login response...');
      const userData = handleLoginResponse(response);
      console.log('✅ Login response processed successfully');

      // Update app context
      console.log('🔄 Updating application context...');
      dispatch({
        type: "SET_USER",
        payload: userData
      })
      console.log('✅ Application context updated');

      toast({
        title: "Login Successful",
        description: "Welcome back! You are now signed in.",
        variant: "default",
      })

      console.log('🚀 Redirecting to dashboard...');
      router.push("/dashboard")
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || "Invalid email or password")
    } finally {
      console.log('🏁 Login process completed');
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md card-glow animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2 form-element">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 form-element">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-sm text-center space-y-2">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </Link>
              <div>
                {"Don't have an account? "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
