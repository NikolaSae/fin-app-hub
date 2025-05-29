import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfoirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  basePath: "/api/auth", // Eksplicitno definišite basePath
  host: process.env.NEXTAUTH_URL,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
  async signIn({ user, account }) {
    // Allow OAuth without email verification
    if (account?.provider !== "credentials") return true;
    if (user && user.id) {
      const existingUser = await getUserById(user.id);
      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfoirmationByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }
    }
    return true;
  },
  async session({ session, token }) {
    console.log("[AUTH_SESSION] Token data:", {
      tokenSub: token.sub,
      tokenRole: token.role,
      tokenIsTwoFactor: token.isTwoFactorEnabled
    });
    
    if (token.sub && session.user) {
      session.user.id = token.sub;
    }
    if (token.role && session.user) {
      session.user.role = token.role;
    }
    if (token.isTwoFactorEnabled && session.user) {
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
    }
    if (!session.user.id && token.sub) {
      session.user.id = token.sub;
    }
    if (session.user) {
      session.user.name = token.name;
      session.user.email = token.email as string;
      session.user.isOAuth = token.isOAuth as boolean;
    }
    
    console.log("[AUTH_SESSION] Final session user:", {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email
    });
    
    return session;
  },
  async jwt({ token, user }) {
    console.log("[AUTH_JWT] Initial token:", { tokenSub: token.sub });
    
    // Add user ID to JWT token
    if (user) {
      token.sub = user.id; // Ensure this line is present
    }
    if (!token.sub) return token;
    
    const existingUser = await getUserById(token.sub);
    if (!existingUser) return token;
    
    const existingAccount = await getAccountByUserId(existingUser.id);
    token.isOAuth = !!existingAccount;
    token.name = existingUser.name;
    token.email = existingUser.email;
    token.role = existingUser.role; // Ova linija je ključna!
    token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
    
    console.log("[AUTH_JWT] Final token:", {
      sub: token.sub,
      role: token.role,
      email: token.email
    });
    
    return token;
  },
},
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
