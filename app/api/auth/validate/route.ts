import { NextResponse } from "next/server"

interface ValidationResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export async function GET() {
  const results: ValidationResult[] = []

  try {
    // Check GOOGLE_CLIENT_ID
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    if (!googleClientId) {
      results.push({
        name: "GOOGLE_CLIENT_ID",
        status: "error",
        message: "Missing GOOGLE_CLIENT_ID environment variable",
        details: "This should be your Google OAuth 2.0 Client ID from Google Cloud Console",
      })
    } else if (googleClientId === "dummy-client-id") {
      results.push({
        name: "GOOGLE_CLIENT_ID",
        status: "error",
        message: "GOOGLE_CLIENT_ID is set to dummy value",
        details: "Please replace with your actual Google Client ID",
      })
    } else if (googleClientId.length < 50) {
      results.push({
        name: "GOOGLE_CLIENT_ID",
        status: "warning",
        message: "GOOGLE_CLIENT_ID seems too short",
        details: `Current length: ${googleClientId.length} characters. Google Client IDs are typically 70+ characters long.`,
      })
    } else if (!googleClientId.endsWith(".apps.googleusercontent.com")) {
      results.push({
        name: "GOOGLE_CLIENT_ID",
        status: "warning",
        message: "GOOGLE_CLIENT_ID format looks unusual",
        details: "Google Client IDs typically end with '.apps.googleusercontent.com'",
      })
    } else {
      results.push({
        name: "GOOGLE_CLIENT_ID",
        status: "success",
        message: "GOOGLE_CLIENT_ID is present and looks valid",
        details: `Length: ${googleClientId.length} characters, Format: Valid`,
      })
    }

    // Check GOOGLE_CLIENT_SECRET
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!googleClientSecret) {
      results.push({
        name: "GOOGLE_CLIENT_SECRET",
        status: "error",
        message: "Missing GOOGLE_CLIENT_SECRET environment variable",
        details: "This should be your Google OAuth 2.0 Client Secret from Google Cloud Console",
      })
    } else if (googleClientSecret === "dummy-client-secret") {
      results.push({
        name: "GOOGLE_CLIENT_SECRET",
        status: "error",
        message: "GOOGLE_CLIENT_SECRET is set to dummy value",
        details: "Please replace with your actual Google Client Secret",
      })
    } else if (googleClientSecret.length < 20) {
      results.push({
        name: "GOOGLE_CLIENT_SECRET",
        status: "warning",
        message: "GOOGLE_CLIENT_SECRET seems too short",
        details: `Current length: ${googleClientSecret.length} characters. Google Client Secrets are typically 24+ characters long.`,
      })
    } else {
      results.push({
        name: "GOOGLE_CLIENT_SECRET",
        status: "success",
        message: "GOOGLE_CLIENT_SECRET is present and looks valid",
        details: `Length: ${googleClientSecret.length} characters`,
      })
    }

    // Check NEXTAUTH_SECRET
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    if (!nextAuthSecret) {
      results.push({
        name: "NEXTAUTH_SECRET",
        status: "error",
        message: "Missing NEXTAUTH_SECRET environment variable",
        details: "This should be a random string used to encrypt JWT tokens",
      })
    } else if (nextAuthSecret === "fallback-secret-for-development-only") {
      results.push({
        name: "NEXTAUTH_SECRET",
        status: "warning",
        message: "Using fallback NEXTAUTH_SECRET",
        details: "Please set a proper NEXTAUTH_SECRET for production use",
      })
    } else if (nextAuthSecret.length < 32) {
      results.push({
        name: "NEXTAUTH_SECRET",
        status: "warning",
        message: "NEXTAUTH_SECRET should be longer for better security",
        details: `Current length: ${nextAuthSecret.length} characters. Recommended: 32+ characters`,
      })
    } else {
      results.push({
        name: "NEXTAUTH_SECRET",
        status: "success",
        message: "NEXTAUTH_SECRET is present and secure",
        details: `Length: ${nextAuthSecret.length} characters`,
      })
    }

    // Check NEXTAUTH_URL
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (!nextAuthUrl) {
      results.push({
        name: "NEXTAUTH_URL",
        status: "warning",
        message: "NEXTAUTH_URL not set (optional in development)",
        details: "NextAuth will auto-detect the URL, but setting it explicitly is recommended for production",
      })
    } else {
      try {
        const url = new URL(nextAuthUrl)
        results.push({
          name: "NEXTAUTH_URL",
          status: "success",
          message: "NEXTAUTH_URL is set and valid",
          details: `URL: ${nextAuthUrl}, Protocol: ${url.protocol}, Host: ${url.host}`,
        })
      } catch (error) {
        results.push({
          name: "NEXTAUTH_URL",
          status: "error",
          message: "NEXTAUTH_URL is not a valid URL",
          details: `Current value: ${nextAuthUrl}`,
        })
      }
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json(
      {
        results: [
          {
            name: "Validation Error",
            status: "error",
            message: "Failed to validate configuration",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      },
      { status: 500 },
    )
  }
}
