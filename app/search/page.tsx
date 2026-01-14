import { getAllPosts } from "@/lib/posts";
import { SearchClient } from "@/components/search-client";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/search");

export default async function SearchPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Search
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Find posts by title, description, or tags.
        </p>
      </div>
      <hr />
      <SearchClient posts={posts} />
    </div>
  );
}
