/**
 * Public playlist to ingest. YouTube exposes an unauthenticated Atom feed
 * for any public playlist — no API key required, capped at ~15 entries.
 */
const PLAYLIST_ID = "PLIVygM9eDeWjCm1TEyD6A1qy50TR2Xr64";
const PLAYLIST_FEED_URL = "https://www.youtube.com/feeds/videos.xml";

export interface VideoItem {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
  channel: string;
  date: string;
}

function getTag(entry: string, tag: string): string {
  return entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]?.trim() ?? "";
}

function getAttribute(entry: string, tag: string, attribute: string): string {
  return entry.match(new RegExp(`<${tag}[^>]+${attribute}=["']([^"']+)["']`, "i"))?.[1] ?? "";
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function parsePlaylist(xml: string): VideoItem[] {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
    .map((match) => {
      const entry = match[0];
      const id = getTag(entry, "yt:videoId");
      const mediaGroup = getTag(entry, "media:group");

      return {
        id,
        title: decodeXml(getTag(entry, "title")),
        href: getAttribute(entry, "link", "href") || `https://www.youtube.com/watch?v=${id}`,
        thumbnail: getAttribute(mediaGroup, "media:thumbnail", "url"),
        channel: decodeXml(getTag(entry, "name")),
        date: new Date(getTag(entry, "published")).toISOString().slice(0, 10),
      };
    })
    .filter((video) => video.id && video.title);
}

export async function getPlaylistVideos(
  playlistId: string = PLAYLIST_ID,
  limit = 6,
): Promise<VideoItem[]> {
  if (!playlistId) return [];

  try {
    const url = `${PLAYLIST_FEED_URL}?playlist_id=${encodeURIComponent(playlistId)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": "emptythrone-youtube/1.0 (+https://emptythrone.viatk.com)",
      },
    });
    if (!response.ok) throw new Error(`Playlist feed returned ${response.status}`);

    const videos = parsePlaylist(await response.text());
    if (!videos.length) throw new Error("Playlist feed contained no usable entries");
    return videos.slice(0, limit);
  } catch (error) {
    console.warn(`Could not fetch YouTube playlist ${playlistId}; video section will be empty.`, error);
    return [];
  }
}
