import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { freshClient } from "@/sanity/lib/client";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Sign-in attempts were unlimited, so a password could be guessed at
 * whatever speed the server answers. Two windows of 15 minutes: 8 tries
 * for one account from one address (a person mistyping), and 30 from one
 * address across accounts (one script trying many). Keyed on the address
 * as well as the account so nobody can lock a customer out by guessing
 * at their email from elsewhere. In memory per server instance, like the
 * other limits (lib/rate-limit): it slows guessing, it is not a lock.
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** As lib/rate-limit's getClientIp, for the plain Request Auth.js passes. */
function clientIp(request: Request): string {
  const header =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";
  return header.split(",").pop()?.trim() || "unknown";
}

// Compared against when no account matches, so that answer takes as long
// as a wrong password and does not reveal which emails have an account.
// (The bcrypt hash of a random string thrown away when this was written:
// it matches no password. A constant, so nothing is hashed at start-up.)
const DUMMY_HASH =
  "$2b$10$qCxkAzAGvDChHdTss.En6O9pjWU78ow3cF3KFbPkCyGCFKgSjFr6W";

type Customer = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  active: boolean;
};

export default {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials, request) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        // bcrypt reads only the first 72 bytes; longer input is not a
        // password, it is a way to keep the server busy.
        if (email.length > 320 || password.length > 200) return null;

        const ip = clientIp(request);
        if (
          !rateLimit(`login-ip:${ip}`, 30, LOGIN_WINDOW_MS).allowed ||
          !rateLimit(`login:${ip}:${email.toLowerCase()}`, 8, LOGIN_WINDOW_MS)
            .allowed
        ) {
          return null;
        }

        // Never log the email, the customer record, or the
        // password-valid result here — this ran on every login
        // attempt and was writing the customer's passwordHash
        // straight into server logs.
        const customer = await freshClient.fetch<Customer | null>(
          `*[
            _type == "customer" &&
            email == $email &&
            active == true
          ][0]`,
          { email }
        );

        const valid = await bcrypt.compare(
          password,
          customer?.passwordHash || DUMMY_HASH
        );
        if (!customer?.passwordHash || !valid) return null;

        return {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/customer/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Consumed by src/middleware.ts — this is what actually decides
    // whether a request to a matched /customer/* route gets through
    // or gets redirected to `pages.signIn` above. Doing the gate here
    // (rather than a redirect() call inside the customer layout) is
    // what keeps /customer/login itself from ever being blocked: the
    // middleware matcher simply doesn't match it (see middleware.ts),
    // so `authorized` is never even consulted for that route — no
    // risk of it redirecting to itself.
    authorized({ auth }) {
      return !!auth?.user;
    },
    // Carry the Sanity customer _id (set as `id` in `authorize` above)
    // from the JWT onto the session object — without this,
    // session.user.id is undefined and every page/route that needs
    // "this logged-in customer's Sanity doc" (dashboard stats,
    // grievance list/create, profile) has nothing to query on.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
