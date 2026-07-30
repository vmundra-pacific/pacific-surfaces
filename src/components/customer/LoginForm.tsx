"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";

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
    <div className="rounded-3xl border border-white/10 bg-white/[.02] p-10">
      <h2 className="mb-8 text-2xl font-light">
        Sign In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="mb-2 block text-sm text-pacific-mid">Email</label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-pacific-dark px-4 py-3 text-white placeholder:text-pacific-mid/60 focus:border-white/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-pacific-mid">Password</label>

          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-pacific-dark px-4 py-3 text-white placeholder:text-pacific-mid/60 focus:border-white/40 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-white" role="alert">
            {error}
          </p>
        )}

        <MagneticButton
          type="submit"
          disabled={loading}
          variant="outline-dark"
          size="lg"
          className="w-full"
        >
          {loading ? "Signing In..." : "Sign In"}
        </MagneticButton>
      </form>
    </div>
  );
}
