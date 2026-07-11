import type { DefaultSession } from "next-auth";

// Module augmentation — auth.config.ts's `authorize` returns the
// Sanity customer's `_id` as `id`, and the `jwt`/`session` callbacks
// carry it through onto the session object. Without this
// augmentation, `session.user.id` / `token.id` don't type-check —
// the default next-auth types don't know about the extra field.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
