import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/lib/posts";
import { withBasePath } from "@/lib/base-path";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostMeta }) {
  const defaultCover = withBasePath("/images/default-blog-cover.png");
  const coverImage = post.frontmatter.coverImage
    ? withBasePath(post.frontmatter.coverImage)
    : defaultCover;

  return (
    <Link href={`/posts/${post.slug}`} className="group">
      <article className="relative overflow-hidden border-b border-r border-border/40 bg-transparent p-0 transition-colors hover:bg-muted/40 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border/40 after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-border/40">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <time className="text-sm text-muted-foreground">
            {formatDate(post.frontmatter.date)}
          </time>
          <h2 className="text-lg font-semibold tracking-tight group-hover:underline">
            {post.frontmatter.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.frontmatter.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
