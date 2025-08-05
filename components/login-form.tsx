"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, AlertCircle, Settings, ExternalLink, User } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OAuthValidator } from "@/components/oauth-validator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface LoginFormProps {
  onUseSimpleAuth?: () => void
}

export function LoginForm({ onUseSimpleAuth }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showValidator, setShowValidator] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First, let's validate the configuration
      const validationResponse = await fetch("/api/auth/validate")
      if (validationResponse.ok) {
        const validation = await validationResponse.json()
        const hasErrors = validation.results.some((result: any) => result.status === "error")

        if (hasErrors) {
          setError("OAuth configuration has errors. Please check your environment variables.")
          setShowValidator(true)
          return
        }
      }

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
      setError("An unexpected error occurred. Please check your configuration.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to Goal Quest
            </CardTitle>
            <CardDescription>Sign in with Google to start tracking your goals and level up your life</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              size="lg"
            >
              <Chrome className="h-5 w-5 mr-2" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {onUseSimpleAuth && (
              <Button onClick={onUseSimpleAuth} variant="outline" className="w-full bg-transparent">
                <User className="h-4 w-4 mr-2" />
                Use Simple Authentication
              </Button>
            )}

            <Dialog open={showValidator} onOpenChange={setShowValidator}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Check OAuth Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>OAuth Configuration Validator</DialogTitle>
                </DialogHeader>
                <OAuthValidator />
              </DialogContent>
            </Dialog>

            <p className="text-xs text-muted-foreground text-center">
              Your progress will be saved to your Google account
            </p>
          </CardContent>
        </Card>

        {/* Environment Variables Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">🔐 Google Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <p>Sign in with your Google account to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sync your goals across devices</li>
              <li>Never lose your progress</li>
              <li>Access from anywhere</li>
              <li>Secure cloud storage</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
              <p className="font-medium">Need to set up OAuth?</p>
              <p>
                Create credentials in{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
