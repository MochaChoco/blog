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

/**
 * 현재 포스트와 연관된 포스트 목록을 가져옵니다.
 * @param slug 현재 포스트의 슬러그 (추천에서 제외하기 위함)
 * @param tags 현재 포스트의 태그 목록
 * @param limit 가져올 최대 개수
 */
export async function getRelatedPosts(
  slug: string,
  tags: string[] = [],
  limit: number = 3
): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  
  if (tags.length === 0) return [];

  const relatedPosts = posts
    .filter((post) => {
      // 현재 읽고 있는 글은 제외
      if (post.slug === slug) return false;
      
      // 태그가 하나라도 겹치는 글만 필터링
      const postTags = post.frontmatter.tags || [];
      return tags.some((tag) => postTags.includes(tag));
    })
    .map((post) => {
      // 연관도 점수 계산: 겹치는 태그의 개수
      const postTags = post.frontmatter.tags || [];
      const matchingTags = postTags.filter((tag) => tags.includes(tag)).length;
      return { ...post, relevance: matchingTags };
    })
    .sort((a, b) => {
      // 1순위: 겹치는 태그가 많은 순 (연관도 내림차순)
      // 2순위: 최신순 (날짜 내림차순)
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return a.frontmatter.date < b.frontmatter.date ? 1 : -1;
    })
    .slice(0, limit);

  // 계산을 위해 임시로 추가했던 relevance 속성 제거 후 반환
  return relatedPosts.map(({ relevance, ...post }) => post);
}
