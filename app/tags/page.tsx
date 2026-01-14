import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/tags");

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Tags
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Browse posts by topic.
        </p>
      </div>
      <hr />
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="rounded-lg bg-secondary px-3 py-1.5 text-base font-medium transition-colors hover:bg-secondary/80 sm:px-4 sm:py-2 sm:text-lg"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
