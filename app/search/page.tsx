import { getAllPosts } from "@/lib/posts";
import { SearchClient } from "@/components/search-client";

export const metadata = {
  title: "Search",
  description: "Search for articles.",
};

export default async function SearchPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Search
        </h1>
        <p className="text-xl text-muted-foreground">
          Find posts by title, description, or tags.
        </p>
      </div>
      <hr />
      <SearchClient posts={posts} />
    </div>
  );
}
