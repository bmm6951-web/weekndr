import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Logo } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Logo className="mb-10" />
      <div className="ticket w-full max-w-md">
        <div className="flex items-center justify-between bg-navy px-8 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-cream">
          <span>Boarding pass</span>
          <span>weekndr</span>
        </div>
        <div className="px-8 pb-10 pt-8">
          <h1 className="font-serif text-4xl font-medium">Welcome back.</h1>
          <p className="mb-8 mt-2 font-light text-navy-soft">Log in to see your semester plans.</p>
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
