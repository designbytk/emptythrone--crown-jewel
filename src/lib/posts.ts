import rawPosts from "../data/posts.json";

/**
 * A "post" is anything worth recording: a long essay, a short note,
 * or a pointer to something written elsewhere. `kind` is real
 * editorial metadata, not decoration — it changes how the entry is
 * summarized and whether it links out or to a permalink.
 */
export type PostKind = "essay" | "note" | "link";

interface RawPost {
  slug: string;
  title: string;
  kind: PostKind;
  date: string;
  dek: string;
  href?: string;
  body?: string[];
}

export interface Post extends RawPost {
  /** Estimated minutes to read `dek` + `body`, ~200wpm. */
  readingTime: number;
  /** Where this entry's title should link to. */
  url: string;
}

function estimateReadingMinutes(post: RawPost): number {
  const words = [post.dek, ...(post.body ?? [])].join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function hydrate(post: RawPost): Post {
  return {
    ...post,
    readingTime: estimateReadingMinutes(post),
    url: post.kind === "link" ? post.href! : `/posts/${post.slug}/`,
  };
}

const posts: Post[] = (rawPosts as RawPost[])
  .map(hydrate)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getAllPosts(): Post[] {
  return posts;
}

export function getFeaturedPost(): Post {
  return posts[0];
}

export function getSecondaryPosts(count: number): Post[] {
  return posts.slice(1, 1 + count);
}

export function getArchivePosts(offset: number): Post[] {
  return posts.slice(offset);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
