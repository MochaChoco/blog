"use client";

import { useState } from "react";
import { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Search } from "lucide-react";

export function SearchClient({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const searchContent = `${post.frontmatter.title} ${post.frontmatter.description} ${post.frontmatter.tags?.join(" ")}`.toLowerCase();
    return searchContent.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-10">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No posts found matching "{query}".
          </p>
        )}
      </div>
    </div>
  );
}
