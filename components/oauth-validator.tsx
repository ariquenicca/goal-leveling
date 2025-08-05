"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"

interface ValidationResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export function OAuthValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const validateConfiguration = async () => {
    setIsValidating(true)
    const results: ValidationResult[] = []

    try {
      // Check if environment variables are accessible
      const response = await fetch("/api/auth/validate", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        results.push(...data.results)
      } else {
        results.push({
          name: "API Validation",
          status: "error",
          message: "Failed to validate configuration",
          details: `HTTP ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error) {
      results.push({
        name: "Network Connection",
        status: "error",
        message: "Failed to connect to validation endpoint",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Client-side validations
    results.push({
      name: "NextAuth URL",
      status: typeof window !== "undefined" ? "success" : "warning",
      message:
        typeof window !== "undefined"
          ? `Running on: ${window.location.origin}`
          : "Server-side rendering - URL will be available on client",
    })

    setValidationResults(results)
    setIsValidating(false)
  }

  useEffect(() => {
    validateConfiguration()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return null
    }
  }

  const hasErrors = validationResults.some((result) => result.status === "error")
  const hasWarnings = validationResults.some((result) => result.status === "warning")

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Google OAuth Configuration Validator
              {!isValidating && !hasErrors && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {!isValidating && hasErrors && <XCircle className="h-5 w-5 text-red-500" />}
            </CardTitle>
            <CardDescription>Verify your Google OAuth setup and environment variables</CardDescription>
          </div>
          <Button onClick={validateConfiguration} disabled={isValidating} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
            {isValidating ? "Validating..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {!isValidating && (
          <Alert
            className={
              hasErrors
                ? "border-red-200 bg-red-50"
                : hasWarnings
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-green-200 bg-green-50"
            }
          >
            <AlertDescription>
              {hasErrors
                ? "❌ Configuration has errors that need to be fixed"
                : hasWarnings
                  ? "⚠️ Configuration is mostly valid but has some warnings"
                  : "✅ Configuration looks good! You should be able to sign in with Google"}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Results */}
        <div className="space-y-3">
          {validationResults.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{result.name}</span>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.details && showDetails && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">{result.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Details */}
        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide" : "Show"} Technical Details
        </Button>

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              Go to{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                Google Cloud Console <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Create a new OAuth 2.0 Client ID (Web application)</li>
            <li>
              Add authorized redirect URI:{" "}
              <code className="bg-white px-1 rounded">
                {typeof window !== "undefined" ? window.location.origin : "[YOUR_DOMAIN]"}/api/auth/callback/google
              </code>
            </li>
            <li>Copy the Client ID and Client Secret to your environment variables</li>
            <li>Set NEXTAUTH_SECRET to a random string</li>
          </ol>
        </div>

        {/* Environment Variables Template */}
        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
          <h4 className="font-semibold mb-2">Environment Variables Template:</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            {`GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
