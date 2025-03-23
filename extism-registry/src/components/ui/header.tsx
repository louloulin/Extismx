import Link from 'next/link';
import { Button } from './button';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">Extism Registry</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/packages" className="text-sm font-medium transition-colors hover:text-primary">
              Packages
            </Link>
            <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
              Documentation
            </Link>
            <Link href="/community" className="text-sm font-medium transition-colors hover:text-primary">
              Community
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/publish">
            <Button size="sm">
              Publish
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
