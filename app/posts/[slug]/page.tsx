import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

const components = {
  // Simple Override for Pre to include Copy Button
  pre: ({ children, className, ...props }: any) => (
    <div className="relative group">
      <pre
        className={cn(
          "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-4 my-4 text-sm leading-6",
          className
        )}
        {...props}
      >
        {children}
      </pre>
      <CopyButton
        text=""
        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  ),
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto py-10">
      <div className="space-y-4 mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {post.frontmatter.title}
        </h1>
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          {post.frontmatter.tags?.map((tag) => (
            <span key={tag} className="bg-secondary px-2 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="prose max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm dark:prose-invert">
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: "one-dark-pro",
                    keepBackground: true,
                  },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  );
}
