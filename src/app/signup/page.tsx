import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Logo } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Logo className="mb-10" />
      <div className="ticket w-full max-w-md">
        <div className="flex items-center justify-between bg-navy px-8 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-cream">
          <span>New passport</span>
          <span>weekndr</span>
        </div>
        <div className="px-8 pb-10 pt-8">
          <h1 className="font-serif text-4xl font-medium">Start planning.</h1>
          <p className="mb-8 mt-2 font-light text-navy-soft">Create a free account and build your first semester plan in minutes.</p>
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
}
