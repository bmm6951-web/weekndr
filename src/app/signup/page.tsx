import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Logo } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Logo className="mb-10" />
      <div className="w-full max-w-md rounded-sm border border-navy/15 bg-white/50">
        <div className="px-8 pb-10 pt-8">
          <h1 className="mb-8 font-serif text-5xl">start planning</h1>
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
}
