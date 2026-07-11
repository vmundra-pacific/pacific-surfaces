import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/customer/LoginForm";

export default async function CustomerLoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/customer/dashboard");
  }

  return (
    <main className="min-h-screen bg-pacific-dark text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 lg:px-12">
        <div className="grid w-full grid-cols-1 gap-20 lg:grid-cols-2">

          {/* Left */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-pacific-mid">
              Pacific Surfaces
            </p>

            <h1 className="text-5xl font-light leading-tight">
              Customer
              <br />
              Care Portal
            </h1>

            <p className="mt-8 max-w-md text-pacific-mid leading-relaxed">
              Access your customer portal to raise grievances, track support
              requests and manage your relationship with Pacific Surfaces.
            </p>
          </div>

          {/* Right */}
          <LoginForm />

        </div>
      </div>
    </main>
  );
}