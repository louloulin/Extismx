import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl">
            Extism Registry
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/packages" className="text-sm font-medium hover:text-primary">
              Packages
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary">
              Documentation
            </Link>
            <Link href="/community" className="text-sm font-medium hover:text-primary">
              Community
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/publish">Publish</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
