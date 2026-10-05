"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

/* The portal has no self-service reset or sign-up: customer accounts are
   created by Pacific. Both requests go to the team by email instead. */
const TEAM_EMAIL = "info@thepacific.group";
const RESET_HREF = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent("Customer Care Portal: password reset")}`;
const ACCESS_HREF = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent("Customer Care Portal: account request")}`;

/**
 * The sign-in form on the white card of the Customer Care Portal login
 * (customer/login/page.tsx). Authenticates a customer against the Sanity
 * `customer` collection through next-auth credentials.
 */
export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const field =
    "h-14 w-full border border-black/40 bg-white px-3.5 text-[15px] text-[#14140f] placeholder:italic placeholder:text-black/40 focus:border-black focus:outline-none";

  return (
    <div className="px-6 pb-10 pt-8 sm:px-24">
      {/* Weight set inline: the site skin pins every h1–h3 to 400 with an
          unlayered rule that outranks Tailwind's font-weight classes. */}
      <h1
        style={{ fontVariationSettings: "'wght' 600, 'wdth' 100" }}
        className="text-center text-[22px] tracking-[-0.01em]"
      >
        Sign in with your email address
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="portal-email" className="mb-2 block text-[15px] font-medium">
            Email address
          </label>
          <input
            id="portal-email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="portal-password" className="mb-2 block text-[15px] font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="portal-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${field} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <a href={RESET_HREF} className="inline-block text-[15px] underline underline-offset-2">
          Forgot your password?
        </a>

        {error && (
          <p role="alert" className="border border-black/25 bg-[#f4f3f0] px-3.5 py-2.5 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full bg-[#1d1d1b] text-[15px] text-white shadow-[0_6px_14px_rgba(0,0,0,0.25)] transition-colors hover:bg-black disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-[15px] text-black/60">
        Don&apos;t have an account?{" "}
        <a href={ACCESS_HREF} className="underline underline-offset-2">
          Request access
        </a>
      </p>
    </div>
  );
}
