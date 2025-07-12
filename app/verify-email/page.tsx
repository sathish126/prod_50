"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import CosmicBackground from "@/components/cosmic-background"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage("Email verified successfully! You can now log in.")
        } else {
          setStatus("error")
          setMessage(data.error.message || "Email verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CosmicBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="backdrop-blur-xl bg-slate-900/40 border border-purple-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl -z-10" />

          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
              <p className="text-gray-300">Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Back to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
