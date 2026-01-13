import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          DevBlog
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/posts" className="hover:text-primary transition-colors">
            Posts
          </Link>
          <Link href="/tags" className="hover:text-primary transition-colors">
            Tags
          </Link>
          <Link href="/search" className="hover:text-primary transition-colors">
            Search
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
