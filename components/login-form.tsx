"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, AlertCircle, Zap, Shield, Cloud, Smartphone } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      })

      if (result?.error) {
        setError(`Sign in failed: ${result.error}`)
        console.error("Sign in error:", result.error)
      } else if (result?.ok) {
        // Redirect manually on success
        window.location.href = result.url || "/"
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Zap className="h-12 w-12 text-indigo-500" />
                <div className="absolute inset-0 bg-indigo-400 opacity-30 blur-lg rounded-full"></div>
              </div>
              <div className="text-6xl drop-shadow-sm">🎯</div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Goal Leveling
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg leading-relaxed">
              Transform your dreams into achievements. Sign in with Google to start your leveling journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-12 pb-12 space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl py-6 text-lg font-semibold"
              size="lg"
            >
              <Chrome className="h-6 w-6 mr-3" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-500">Secure authentication powered by Google</p>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700 text-center">Why Goal Leveling?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Cloud Sync</p>
                <p className="text-sm text-slate-500">Access your goals from any device</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Secure & Private</p>
                <p className="text-sm text-slate-500">Your data is encrypted and protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Mobile Friendly</p>
                <p className="text-sm text-slate-500">Track progress on the go</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
