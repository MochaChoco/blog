import { getAllPosts } from "@/lib/posts";
import { MetadataRoute } from "next";

export const dynamic = "force-static";

// Define your base URL here.
const BASE_URL = "https://mochachoco.github.io/my-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postsUrls = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/tags`,
      lastModified: new Date(),
    },
    ...postsUrls,
  ];
}
