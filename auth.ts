// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/schemas/auth";
import { getToken } from "next-auth/jwt";

// Glavni NextAuth handler
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
      }

      if (token.id && (!token.role || !token.name || !token.image)) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            name: true,
            image: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.role) token.role = session.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
      }

      return session;
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
            name: true,
            image: true,
          },
        });

        if (!user || !user.password || !user.isActive) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
});

// Poseban auth za Edge Middleware — bez Prisma
export async function authMiddlewareSafe(req: Request) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) return null;

  return {
    user: {
      id: token.id as string,
      role: token.role as string,
      name: token.name as string | null,
      image: token.image as string | null,
    },
  };
}
