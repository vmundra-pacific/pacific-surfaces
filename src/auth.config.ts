import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { callCustomerDoor } from "@/cms/forms";

/** The shape of every CMS id (a UUID). */
const CMS_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The mark a session gets when the customer signs in through the CMS. A
 * session made before the move carries a Sanity id instead, which the
 * CMS knows nothing of, and no mark; the id alone cannot tell, since
 * Sanity Studio also made ids shaped like a CMS id.
 */
const SIGNED_IN_THROUGH_CMS = "cms";

/** What the CMS's sign-in door answers for a right password. */
type SignedIn = {
  ok: true;
  customer: { id: string | number; name: string; email: string };
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

        // Never log the email, the password or the answer here.
        // The CMS checks the password against the stored hash; the hash
        // never leaves the CMS. A wrong password, an unknown, locked or
        // inactive account all answer `{"ok": false}`.
        const answer = await callCustomerDoor("sign-in", { email, password });
        if (!answer.ok) return null;
        const { customer } = answer as SignedIn;
        if (!customer || customer.id === undefined || customer.id === null) {
          return null;
        }

        return {
          id: String(customer.id),
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
    // Carry the CMS customer id (set as `id` in `authorize` above)
    // from the JWT onto the session object — without this,
    // session.user.id is undefined and every page/route that needs
    // "this logged-in customer's record in the CMS" (dashboard stats,
    // grievance list/create, profile) has nothing to ask for.
    // A session without the mark, or whose id is not a CMS id, was made
    // before the move to the CMS: end it (null clears the cookie), so the
    // customer is sent to sign in again instead of seeing empty pages.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.src = SIGNED_IN_THROUGH_CMS;
      }
      if (token.src !== SIGNED_IN_THROUGH_CMS) return null;
      if (typeof token.id !== "string" || !CMS_ID.test(token.id)) return null;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
