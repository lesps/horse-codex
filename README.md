# Horse Breeds Explorer

A browser-only, no-backend web app cataloguing horse breeds with photos, breed
info, and — where a verified stream exists — an embedded live cam, falling
back to a YouTube live-search link otherwise. It opens on a pixel-art
Stable view — the default tab — where every breed wanders a paddock at its
real relative size; click a horse to open its breed detail. The breed
catalogue lives at `#/breeds`.

The stable doubles as a toy box: clicking around the paddock turns up
random discoveries — hats and saddles to dress horses in, decorations to
personalize the paddock, and hay bales, carrots, and other treats the herd
will wander over and eat. Finds persist in your browser's localStorage.

100% client-side: no server, no database, no secret keys. Deployed as static
files on GitHub Pages.

## Live site

Once deployed: `https://<user>.github.io/horse-codex/`

## Getting started

```bash
pnpm install
pnpm dev          # start the dev server
pnpm test         # run the test suite
pnpm typecheck    # tsc --noEmit
pnpm build        # production build to dist/
pnpm preview      # preview the production build locally
```

## Deploying to GitHub Pages

This repo ships a GitHub Actions workflow at `.github/workflows/deploy.yml`
that builds, tests, and publishes to Pages on every push to `main`.

**One-time manual step (cannot be done from code):** in the repository, go to
**Settings → Pages → Build and deployment → Source** and set it to
**"GitHub Actions"**. Until that toggle is flipped once, the workflow's
deploy job will fail — that's expected and not a code bug.

After that, the site is available at `https://<user>.github.io/horse-codex/`.

## How to add a breed

Breed data lives entirely in `src/data/breeds.ts`, typed by
`src/data/types.ts`. To add a breed, append an object matching the `Breed`
interface:

- `image.url` should be a Wikimedia Commons `Special:FilePath` URL
  (`https://commons.wikimedia.org/wiki/Special:FilePath/{filename}`) for a
  file you've confirmed exists — not a raw `upload.wikimedia.org` path. If you
  can't confirm a real Commons file, leave `image.url` as `''` so the app
  shows the built-in placeholder.
- `liveStreamId` should only be set if you've personally verified a specific
  YouTube video ID is a real, embeddable 24/7 live cam for that breed right
  now. Otherwise omit it — the app automatically falls back to a
  "Watch live on YouTube" search link.
- Run `pnpm test` after editing — `src/data/breeds.test.ts` enforces the data
  shape (unique kebab-case ids, non-empty required fields, valid categories,
  a sane height range, and a well-formed `liveStreamId` if present).

## How to add a live cam

Curated live cams for the `#/live` page live in `src/data/cams.ts`. To add
one, append an object matching the `LiveCam` interface:

- `url` should be the cam's own page (`https://...`). It's always rendered
  as an outbound link, never embedded in an iframe — third-party pages have
  unknown frame policies.
- `breedId`, if set, must match an existing id in `src/data/breeds.ts`; the
  Live page uses it to show a "View breed" link, and the referential-integrity
  test in `src/data/cams.test.ts` enforces the match.
- Run `pnpm test` after editing — it checks unique kebab-case ids, non-empty
  label/description, an `https://` url, and (if present) a valid `breedId`.

## How to add a toy

Toy box items (hats, saddles, decorations, treats) live in
`src/stable/items.ts` as ASCII pixel art with a per-item color map and an
anchor pixel — see the comments there for anchor semantics per kind. New
items are discoverable automatically; treats need a `feedSeconds`. Run
`pnpm test` after: `src/stable/items.test.ts` validates the art, colors,
and anchors.

## How to tweak a coat

Each breed's pixel-stable appearance lives in `src/stable/coats.ts`: pick a
base silhouette (`pony` / `horse` / `draft`) and map the palette slots
(1 body, 2 mane/tail, 3 marking, 4 outline/hoof) to hex colors; set
`spots: true` for Appaloosa-style blotches. The silhouettes themselves are
ASCII grids in `src/stable/sprites.ts` — editing a frame is a data edit.
Run `pnpm test` after: `src/stable/coats.test.ts` enforces that every breed
has a coat covering exactly the slots its sprite uses.

## Architecture

See `CLAUDE.md` for the full architecture rundown, including why there's no
YouTube Data API integration and how the Stable view's sprites-as-data
approach works.
