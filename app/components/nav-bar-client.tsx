'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rankings/ncaa', label: 'Rankings' },
];

export default function NavBarClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-between h-14">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-primary text-lg">
            Fanteasy
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden md:inline-block text-sm transition-colors ${
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: desktop controls + mobile hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {children}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border py-3 space-y-1 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-2 py-2 rounded-md text-sm transition-colors ${
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'text-foreground font-medium bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-2 pt-2 border-t border-border mt-2">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
