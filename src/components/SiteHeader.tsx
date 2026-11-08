import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { User } from "@/lib/auth";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-3xl tracking-tight ${className}`}>
      weekndr<span className="text-stamp">.</span>
    </Link>
  );
}

const link = "font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft transition hover:text-stamp";

export default function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b border-navy/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Logo />
        <nav className="flex items-center gap-4 sm:gap-8">
          {user ? (
            <>
              <Link href="/dashboard" className={`${link} hidden sm:inline`}>My plans</Link>
              {!user.is_paid && <Link href="/pricing" className={`${link} !text-stamp`}>Upgrade</Link>}
              <Link href="/plan/new" className={link}>New plan</Link>
              <form action={logout}>
                <button className={link}>Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className={`${link} hidden md:inline`}>How it works</Link>
              <Link href="/pricing" className={`${link} hidden md:inline`}>Pricing</Link>
              <Link href="/login" className={link}>Log in</Link>
              <Link href="/signup" className="btn-primary !px-5 !py-2.5">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
