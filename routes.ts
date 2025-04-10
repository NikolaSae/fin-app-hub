/**_
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/dashboard/", "/auth/new-verification"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];
/**
 * Rute koje su dostupne samo korisnicima sa admin ulogom
 * @type {string[]}
 */
export const adminRoutes = [
  "/admin",
  "/complaints/admin",
];
/**
* Rute koje su dostupne samo autentifikovanim korisnicima
 * @type {string[]}
 */
export const protectedRoutes = [
  "/settings",
  "/server",
  "/client",
  "/admin",
  "/complaints",
  "/complaints/new",
  "/complaints/admin",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
// Glavna putanja
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
