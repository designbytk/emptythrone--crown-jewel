const FEED_URL = "https://deskoftk.fyi/feed/feed.xml";
const FEED_IMAGE_BASE = "https://deskoftk.fyi/img/og-images";

export interface FeedPost {
  slug: string;
  title: string;
  date: string;
  dek: string;
  href: string;
  image: string;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function textFromHtml(value: string): string {
  return decodeXml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(entry: string, tag: string): string {
  return entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]?.trim() ?? "";
}

function getAttribute(entry: string, tag: string, attribute: string): string {
  return (
    entry.match(new RegExp(`<${tag}[^>]+${attribute}=["']([^"']+)["']`, "i"))?.[1] ?? ""
  );
}

function paragraphsFromHtml(value: string): string[] {
  const html = decodeXml(value);
  const paragraphs = [...html.matchAll(/<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/gi)]
    .map((match) => textFromHtml(match[1]))
    .filter(Boolean);

  return paragraphs.length ? paragraphs : [textFromHtml(html)].filter(Boolean);
}

function parseFeed(xml: string): FeedPost[] {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
    .map((match) => {
      const entry = match[0];
      const href = getAttribute(entry, "link", "href");
      const slug = new URL(href).pathname.split("/").filter(Boolean).pop() ?? "entry";
      const content = decodeXml(getTag(entry, "content"));
      const paragraphs = paragraphsFromHtml(content);
      const htmlTitle = content.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
      const title = textFromHtml(getTag(entry, "title")) || textFromHtml(htmlTitle ?? slug);

      return {
        slug,
        title,
        date: new Date(getTag(entry, "updated")).toISOString().slice(0, 10),
        dek: paragraphs[0] ?? title,
        href,
        image: `${FEED_IMAGE_BASE}/og-${slug}.png`,
      };
    })
    .filter((post) => post.href && post.title);
}

export async function getFeedPosts(): Promise<FeedPost[]> {
  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);

    const posts = parseFeed(await response.text());
    if (!posts.length) throw new Error("Feed contained no usable entries");
    return posts;
  } catch (error) {
    console.warn(`Could not fetch ${FEED_URL}; feed section will be empty.`, error);
    return [];
  }
}