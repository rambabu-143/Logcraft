import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // repo scope needed to create webhooks + read commits
          scope: 'read:user user:email repo admin:repo_hook',
        },
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      // Persist GitHub access token after user is created/found in DB
      if (account?.provider === 'github' && account.access_token && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { githubAccessToken: account.access_token },
        })
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id
      if (account?.provider === 'github' && account.access_token) {
        token.githubAccessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        })
        session.user.plan = dbUser?.plan ?? 'FREE'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}
