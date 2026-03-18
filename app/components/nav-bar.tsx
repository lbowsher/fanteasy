import AuthButtonServer from '../auth-button-server';
import ThemeToggle from '../theme-toggle';
import NavBarClient from './nav-bar-client';

export default function NavBar() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <NavBarClient />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButtonServer />
          </div>
        </div>
      </div>
    </nav>
  );
}
