"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import CosmicBackground from "@/components/cosmic-background"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<"login" | "signup">("login")

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CosmicBackground />

      {/* Menu Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          size="icon"
          className="rounded-full bg-purple-600/80 hover:bg-purple-500/80 backdrop-blur-sm border border-purple-400/30"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {currentView === "login" ? (
          <LoginForm onSwitchToSignup={() => setCurrentView("signup")} />
        ) : (
          <SignupForm onSwitchToLogin={() => setCurrentView("login")} />
        )}
      </div>
    </div>
  )
}
