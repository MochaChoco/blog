"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";
import { PostCard } from "./post-card";
import { Suspense } from "react";

interface FilterablePostListProps {
  posts: PostMeta[];
  basePath?: string;
}

function FilterablePostListInner({ posts, basePath = "/" }: FilterablePostListProps) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") || undefined;

  const filteredPosts = activeTag
    ? posts.filter((post) => post.frontmatter.tags?.includes(activeTag))
    : posts;

  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={basePath}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            !activeTag
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
          <span className={cn(
            "text-xs",
            !activeTag ? "text-background/70" : "text-muted-foreground/70"
          )}>
            {posts.length}
          </span>
        </Link>
        {sortedTags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`${basePath}?tag=${encodeURIComponent(tag)}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              activeTag === tag
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tag}
            <span className={cn(
              "text-xs",
              activeTag === tag ? "text-background/70" : "text-muted-foreground/70"
            )}>
              {count}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No posts found for this tag.
        </p>
      )}
    </div>
  );
}

export function FilterablePostList(props: FilterablePostListProps) {
  return (
    <Suspense fallback={
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {props.posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    }>
      <FilterablePostListInner {...props} />
    </Suspense>
  );
}
