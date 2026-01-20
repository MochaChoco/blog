import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export type Post = {
  slug: string;
  frontmatter: {
    title: string;
    description: string;
    date: string;
    tags: string[];
    [key: string]: any;
  };
  content: string; // Raw MDX content for search/rendering
};

export type PostMeta = Omit<Post, 'content'>;

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      frontmatter: data as Post['frontmatter'],
      content,
    };
  } catch (e) {
    return null;
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const files = fs.readdirSync(postsDirectory);
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        frontmatter: data as Post['frontmatter'],
      };
    });

  // Sort posts by date (descending) internally, even if we don't show it
  return posts.sort((a, b) => {
    if (a.frontmatter.date < b.frontmatter.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.frontmatter.tags?.includes(tag));
}

export async function getPostAdjacent(slug: string): Promise<{
  prev: PostMeta | null;
  next: PostMeta | null;
}> {
  const posts = await getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  // posts are sorted by date desc (Newest first)
  // next: index - 1 (Newer)
  // prev: index + 1 (Older)
  const next = index > 0 ? posts[index - 1] : null;
  const prev = index < posts.length - 1 ? posts[index + 1] : null;

  return { prev, next };
}

export async function getRelatedPosts(
  slug: string,
  tags: string[] = [],
  limit: number = 3
): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  
  if (tags.length === 0) return [];

  const relatedPosts = posts
    .filter((post) => {
      // Exclude current post
      if (post.slug === slug) return false;
      
      // Check for tag intersection
      const postTags = post.frontmatter.tags || [];
      return tags.some((tag) => postTags.includes(tag));
    })
    .map((post) => {
      // Calculate relevance score (number of matching tags)
      const postTags = post.frontmatter.tags || [];
      const matchingTags = postTags.filter((tag) => tags.includes(tag)).length;
      return { ...post, relevance: matchingTags };
    })
    .sort((a, b) => {
      // Sort by relevance (desc) then by date (desc)
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return a.frontmatter.date < b.frontmatter.date ? 1 : -1;
    })
    .slice(0, limit);

  // Remove the temporary relevance property before returning
  return relatedPosts.map(({ relevance, ...post }) => post);
}
