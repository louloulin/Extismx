import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Extism Registry</h3>
            <p className="text-sm text-muted-foreground">
              Discover, publish, and manage WebAssembly plugins for the Extism runtime.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/installation-guide" className="text-sm text-muted-foreground hover:text-foreground">
                  Installation Guide
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-sm text-muted-foreground hover:text-foreground">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-sm text-muted-foreground hover:text-foreground">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/extism" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://discord.gg/extism" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://twitter.com/extismplugins" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
                  Community Portal
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="text-sm text-muted-foreground hover:text-foreground">
                  Licenses
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Extism Registry. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://github.com/extism" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                <path d="M9 18c-4.51 2-5-2-7-2"></path>
              </svg>
            </a>
            <a href="https://twitter.com/extismplugins" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="https://discord.gg/extism" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <path d="M7.5 7.5c3.5-1 5.5-1 9 0"></path>
                <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
                <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"></path>
                <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 