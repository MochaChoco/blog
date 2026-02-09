import { getAllPosts } from "@/lib/posts";
import { buildPageMetadata } from "@/lib/metadata";
import { ScrollToTop } from "@/components/scroll-to-top";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { FilterablePostList } from "@/components/tag-filter";

export const metadata = buildPageMetadata("/");

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b">
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
          squareSize={4}
          gridGap={6}
          color="rgb(0, 0, 0)"
          maxOpacity={0.15}
          flickerChance={0.1}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24">
          <h1 className="text-4xl font-medium tracking-tighter md:text-5xl">
            Latest Posts
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Writing about technology, coding, and everything in between.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <FilterablePostList posts={posts} basePath="/" />
      </div>
      <ScrollToTop />
    </div>
  );
}
