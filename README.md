# Emptythrone

Emptythrone is a small Astro site for a personal curration of articles, websites, etc. 
Content is stored in a typed JSON data file
and rendered into the homepage, filtered archive pages, permalink pages, and an
RSS feed.

## Stack

- Astro 7
- TypeScript
- PNPM 11
- Node 22.12 or newer
- Plain Astro components and global CSS

## Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/       Shared Astro components
│   ├── data/posts.json   Source content for essays, notes, and links
│   ├── layouts/          Base document layout and metadata
│   ├── lib/              Post hydration, sorting, lookup, and formatting
│   ├── pages/            Routes and RSS feed endpoint
│   └── styles/           Global design tokens and page styles
├── svg/                  Source logo/mark SVG assets
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Routes

- `/` shows the newest post as the lead item, two more recent posts in a side
  rail, and the remaining archive.
- `/essays/`, `/notes/`, and `/links/` filter the archive by post kind.
- `/posts/[slug]/` renders permalinks for essays and notes.
- `/about/` explains the site.
- `/feed.xml` generates an RSS feed from the same post data.

Link posts point directly to their external `href` in lists and in RSS. They do
not generate local permalink pages.

## Content

All entries live in `src/data/posts.json`.

Each post has this shape:

```json
{
  "slug": "example-post",
  "title": "Example Post",
  "kind": "essay",
  "date": "2026-09-08",
  "dek": "A short summary shown in lists and feeds.",
  "body": ["Optional paragraph text for local permalink pages."],
  "href": "https://example.com/only-required-for-link-posts"
}
```

Supported `kind` values are:

- `essay`
- `note`
- `link`

`src/lib/posts.ts` hydrates the raw JSON into typed posts, sorts entries newest
first, estimates reading time from `dek` and `body`, and decides whether a title
links to `/posts/{slug}/` or an external URL.

## Development

Install dependencies:

```sh
pnpm install
```

Start the Astro dev server:

```sh
astro dev --background
```

Manage the background server:

```sh
astro dev status
astro dev logs
astro dev stop
```

Other useful commands:

```sh
pnpm build
pnpm preview
pnpm astro check
```

The production site URL is configured in `astro.config.mjs` as
`https://emptythrone.viatk.com`, which is used when generating absolute RSS
links.

## Styling And Assets

The site uses `src/styles/global.css` for design tokens, layout, typography,
dark-mode colors, responsive behavior, and shared post/archive styles. Fonts are
loaded in `src/layouts/BaseLayout.astro` from Google Fonts:

- Fraunces for display and body prose
- Archivo for interface text

Logo and mark components are in `src/components/Logo.astro` and
`src/components/Mark.astro`, with source SVG files kept under `svg/`.
