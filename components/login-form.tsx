"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail } from "lucide-react"

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store access token
        localStorage.setItem("accessToken", data.data.accessToken)
        localStorage.setItem("user", JSON.stringify(data.data.user))

        // Redirect or show success message
        alert("Login successful!")
        console.log("User:", data.data.user)
      } else {
        alert(data.error.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="backdrop-blur-xl bg-slate-900/40 border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl -z-10" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Login</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200 font-medium">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                required
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Signing in...
              </div>
            ) : (
              "Login"
            )}
          </Button>

          {/* Additional Links */}
          <div className="flex justify-between items-center text-sm">
            <button type="button" className="text-purple-300 hover:text-purple-200 transition-colors">
              Reset Password
            </button>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              New User Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
