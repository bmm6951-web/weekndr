import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { User } from "@/lib/auth";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-3xl font-semibold tracking-tight ${className}`}>
      weekndr<span className="text-stamp">.</span>
    </Link>
  );
}

export default function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6 md:px-10">
      <Logo />
      {user ? (
        <nav className="flex items-center gap-3 text-sm sm:gap-6">
          <Link href="/dashboard" className="hidden text-navy-soft hover:text-navy sm:inline">
            My plans
          </Link>
          {!user.is_paid && (
            <Link href="/pricing" className="hidden font-medium text-stamp hover:underline sm:inline">
              Upgrade
            </Link>
          )}
          <Link href="/plan/new" className="btn-primary !px-5 !py-2.5">
            New plan
          </Link>
          <form action={logout}>
            <button className="text-navy-soft hover:text-navy">Log out</button>
          </form>
        </nav>
      ) : (
        <nav className="flex items-center gap-3 text-sm sm:gap-8">
          <Link href="/#how-it-works" className="hidden text-navy-soft hover:text-navy md:inline">
            How it works
          </Link>
          <Link href="/pricing" className="hidden text-navy-soft hover:text-navy md:inline">
            Pricing
          </Link>
          <Link href="/login" className="text-navy-soft hover:text-navy">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary !px-5 !py-2.5">
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
