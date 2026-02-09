import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-bold text-lg tracking-tight">
          MochaChoco&apos;s DevBlog
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/posts" className="text-muted-foreground hover:text-foreground transition-colors">
            Posts
          </Link>
          <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
            Tags
          </Link>
          <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
            Search
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
