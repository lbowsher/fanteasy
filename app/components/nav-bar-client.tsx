'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rankings/ncaa', label: 'Rankings' },
];

export default function NavBarClient() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6">
      <Link href="/" className="font-bold text-primary text-lg mr-4">
        Fanteasy
      </Link>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm transition-colors ${
            pathname === link.href || pathname?.startsWith(link.href + '/')
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
