import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { freshClient } from "@/sanity/lib/client";

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

      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

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

        if (!customer?.passwordHash) return null;

        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) return null;

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