"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowUpRight, Cloud } from "lucide-react";

/* The org's Salesforce entry point. Falls back to the generic login
   host so the button is never dead if the env var isn't set. */
const SALESFORCE_LOGIN_URL =
  process.env.NEXT_PUBLIC_SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/customer/dashboard");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-white/20 bg-black p-10 text-white">
      <h2 className="mb-8 text-2xl font-light">
        Sign In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="mb-2 block text-sm text-white/70">Email</label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-black px-4 py-3 text-white placeholder:text-white/35 focus:border-white focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Password</label>

          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-black px-4 py-3 text-white placeholder:text-white/35 focus:border-white focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <MagneticButton
          type="submit"
          disabled={loading}
          variant="primary-dark"
          size="lg"
          className="w-full"
        >
          {loading ? "Signing In..." : "Sign In"}
        </MagneticButton>
      </form>

      {/* ---- Sales team ----------------------------------------------
          Separate route in, below a rule, because this is not the same
          thing as the form above: the form authenticates a CUSTOMER
          against the Sanity `customer` collection, while this hands the
          sales team straight to the CRM. Deliberately a plain outbound
          link rather than an auth provider — signing in through
          Salesforce here would mint a portal session with no Sanity
          customer `_id`, and every /customer/* page reads
          `session.user.id` to find "this customer's records", so those
          users would land on a dashboard that queries nothing.

          Point NEXT_PUBLIC_SALESFORCE_LOGIN_URL at the org's My Domain
          (e.g. https://pacific.my.salesforce.com) to skip the generic
          login page. */}
      <div className="mt-8 border-t border-white/20 pt-8">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/60">
          Pacific sales team
        </p>

        <a
          href={SALESFORCE_LOGIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/40 bg-transparent px-4 py-3.5 text-sm font-light text-white transition-colors hover:bg-white hover:text-black"
        >
          <Cloud className="h-4 w-4 shrink-0" aria-hidden="true" />
          Continue with Salesforce
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </a>

        <p className="mt-3 text-xs font-light leading-relaxed text-white/55">
          Opens the Salesforce CRM in a new tab. Use your Pacific
          Salesforce credentials, not your portal login.
        </p>
      </div>
    </div>
  );
}
