// Path: lib/auth/auth-utils.ts
import { auth } from "@/auth"; // Uvezite vašu NextAuth.js konfiguraciju
import { UserRole } from "@prisma/client"; // Uvezite UserRole enum iz Prisme

/**
 * Dohvata trenutnu ulogu ulogovanog korisnika.
 * @returns Uloga korisnika (ADMIN, MANAGER, AGENT, USER) ili null ako korisnik nije ulogovan.
 */
export const getUserRole = async (): Promise<UserRole | null> => {
  const session = await auth(); // Dohvatite trenutnu sesiju

  // Vratite ulogu korisnika iz sesije, ili null ako sesija ili korisnik ne postoje
  // Pretpostavljamo da je uloga sačuvana u session.user.role
  return session?.user?.role as UserRole | null ?? null;
};

// Možete dodati i druge pomoćne funkcije vezane za autentifikaciju ovde, npr:
// export const getCurrentUser = async () => { ... }
// export const isAuthenticated = async () => { ... }
