"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Re-fetch session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetch session when window is focused
      refetchOnWindowFocus={true}
      // Base path for NextAuth
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
