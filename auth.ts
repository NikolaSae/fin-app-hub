// auth.ts - Update your NextAuth configuration
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/schemas/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add role to token
      if (user) {
        console.log("[JWT] Initial sign in, adding role to token");
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, id: true, email: true }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }

      // If role is missing from token, fetch it
      if (token.id && !token.role) {
        console.log("[JWT] Role missing from token, fetching from DB");
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      // Handle session updates (if you implement role changes)
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add role to session
      if (token.role && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      
      console.log("[SESSION] Session created with role:", {
        userEmail: session.user?.email,
        userRole: (session.user as any)?.role,
        userId: (session.user as any)?.id
      });
      
      return session;
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[AUTH] Attempting to authorize user");
        
        const validatedFields = loginSchema.safeParse(credentials);
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { 
              id: true, 
              email: true, 
              password: true, 
              role: true,
              isActive: true 
            }
          });
          
          if (!user || !user.password || !user.isActive) {
            console.log("[AUTH] User not found or inactive");
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) {
            console.log("[AUTH] Password match, user authorized:", {
              id: user.id,
              email: user.email,
              role: user.role
            });
            
            return {
              id: user.id,
              email: user.email,
              role: user.role, // Include role in the returned user object
            };
          }
        }
        
        console.log("[AUTH] Authorization failed");
        return null;
      }
    })
  ],
});