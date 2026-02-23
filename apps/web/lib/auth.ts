import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const emailLower = credentials.email.trim().toLowerCase();
        const rows = await prisma.$queryRaw<
          Array<{ id: string; email: string; password_hash: string; name: string | null }>
        >`
          SELECT id, email, password_hash, name FROM "User"
          WHERE LOWER(TRIM(email)) = LOWER(TRIM(${emailLower}))
          LIMIT 1
        `;
        const user = rows[0];
        if (!user?.password_hash) return null;
        const ok = await compare(credentials.password, user.password_hash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.sub!;
      return session;
    },
  },
  pages: { signIn: "/signin" },
};

declare module "next-auth" {
  interface Session {
    user: { id: string; email?: string | null; name?: string | null };
  }
  interface NextAuthOptions {
    trustHost?: boolean;
  }
}
