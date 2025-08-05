import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Validate environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!googleClientId) {
  console.error("❌ GOOGLE_CLIENT_ID is not set")
}

if (!googleClientSecret) {
  console.error("❌ GOOGLE_CLIENT_SECRET is not set")
}

if (!nextAuthSecret) {
  console.error("❌ NEXTAUTH_SECRET is not set")
}

// Create NextAuth configuration
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId || "dummy-client-id",
      clientSecret: googleClientSecret || "dummy-client-secret",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Only allow sign in if we have proper credentials
      if (!googleClientId || !googleClientSecret) {
        console.error("Cannot sign in: Missing Google OAuth credentials")
        return false
      }
      return true
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: nextAuthSecret || "fallback-secret-for-development-only",
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
