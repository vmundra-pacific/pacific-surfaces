import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  // Verbose Auth.js request/response logging — useful while wiring
  // this up, but it's chatty and shouldn't run in production.
  debug: process.env.NODE_ENV !== "production",
});