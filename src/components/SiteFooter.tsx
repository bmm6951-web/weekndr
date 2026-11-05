import { Logo } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="bg-cream-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-navy-soft">Your semester abroad, all in one place.</p>
        </div>
        <div className="text-sm text-navy-soft md:text-right">
          <p>
            Created by <span className="font-medium text-navy">Bhavya Mudduluri</span>
          </p>
          <p className="mt-1">Penn State · &copy; {new Date().getFullYear()} Weekndr</p>
        </div>
      </div>
    </footer>
  );
}
