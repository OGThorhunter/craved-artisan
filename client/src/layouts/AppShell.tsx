import { Link } from "wouter";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-border">
        <div className="container-page h-14 flex items-center justify-between">
          <Link href="/">
            <a className="font-semibold">Craved Artisan</a>
          </Link>
          <nav className="flex items-center gap-4">
            <a href="/marketplace" className="px-3 py-1.5 rounded-xl hover:bg-offwhite">
              Marketplace
            </a>
            <a href="/vendors" className="px-3 py-1.5 rounded-xl hover:bg-offwhite">
              Vendors
            </a>
            <a href="/events" className="px-3 py-1.5 rounded-xl hover:bg-offwhite">
              Events
            </a>
            <a href="/signup" className="px-3 py-1.5 rounded-xl bg-accent text-white">
              Join
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="pb-16">{children}</main>

      {/* Footer (green, used sparingly) */}
      <footer className="mt-16 bg-accent text-white">
        <div className="container-page py-8 text-sm">
          © {new Date().getFullYear()} Craved Artisan
        </div>
      </footer>
    </div>
  );
}

