import Link from "next/link";
import { PostMeta } from "@/lib/posts";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group relative flex flex-col space-y-2">
      <h2 className="text-2xl font-bold tracking-tight">
        <Link href={`/posts/${post.slug}`} className="hover:text-primary transition-colors">
          {post.frontmatter.title}
        </Link>
      </h2>
      <div className="flex gap-2 text-sm text-muted-foreground">
        {post.frontmatter.tags?.map((tag) => (
          <span key={tag} className="bg-secondary px-2 py-1 rounded-md">
            #{tag}
          </span>
        ))}
      </div>
      <p className="text-muted-foreground line-clamp-3">
        {post.frontmatter.description}
      </p>
      <Link
        href={`/posts/${post.slug}`}
        className="text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        Read more →
      </Link>
    </article>
  );
}
