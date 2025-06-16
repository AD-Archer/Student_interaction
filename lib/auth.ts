import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null
        // Ensure id is a string
        return { id: String(user.id), email: user.email, name: user.firstName + ' ' + user.lastName }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token) {
        session.user = {
          id: token.sub as string,
          email: token.email as string,
          name: token.name as string
        }
      }
      return session
    },
    async jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    }
  },
  pages: {
    signIn: "/login"
  }
}

export default NextAuth(authOptions)
