import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts";

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "";
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${post.title}</title>
      <link>${post.kind === "link" ? post.href : `${base}${post.url}`}</link>
      <guid isPermaLink="false">${base}/posts/${post.slug}/</guid>
      <description>${post.dek}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Emptythrone</title>
    <link>${base}/</link>
    <description>A personal record of essays, notes, and things worth keeping.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
