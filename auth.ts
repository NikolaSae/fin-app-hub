// auth.ts
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
      // Initial sign in - add user details to token
      if (user) {
        console.log("[JWT] Initial sign in, adding user details to token");
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
      }

      // If user details are missing from token, fetch them
      if (token.id && (!token.role || !token.name || !token.image)) {
        console.log("[JWT] User details missing from token, fetching from DB");
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { 
            role: true, 
            name: true, 
            image: true 
          }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }

      // Handle session updates (e.g., profile changes)
      if (trigger === "update" && session) {
        console.log("[JWT] Updating token from session update");
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.role) token.role = session.role;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add additional user details to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
      }
      
      console.log("[SESSION] Session created:", {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userName: session.user?.name,
        userImage: session.user?.image,
        userRole: session.user?.role
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
              isActive: true,
              name: true,       // Added
              image: true       // Added
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
              role: user.role,
              name: user.name,   // Added
              image: user.image  // Added
            });
            
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              name: user.name,   // Added
              image: user.image  // Added
            };
          }
        }
        
        console.log("[AUTH] Authorization failed");
        return null;
      }
    })
  ],
});