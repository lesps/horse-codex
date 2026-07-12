# CLAUDE.md

Architecture notes for Horse Breeds Explorer.

## Constraints

- **No backend, ever.** Vite + React + TypeScript + Tailwind, built to static
  files, deployed to GitHub Pages. No server, no database, no API keys in the
  client bundle.
- **Data is code.** Breed content is a hand-curated `Breed[]` array in
  `src/data/breeds.ts`, typed by `src/data/types.ts`, bundled at build time.
  There is no runtime fetch of breed data — everything is known at build
  time, so there's nothing to fail at runtime except image loads.

## Live streams: why no YouTube Data API

There is no reliable breed → livestream mapping, and no keyless way to query
YouTube's live search results from the browser. Integrating the YouTube Data
API would require exposing an API key client-side, which is a non-starter
for a 100% static, no-backend app — the key would be trivially scrapeable
and abusable.

Instead, a **two-tier** approach:

1. If a breed's data has a verified `liveStreamId` (a YouTube video id we
   confirmed, by hand, to be a real embeddable 24/7 live cam), the app embeds
   it via an `<iframe src="https://www.youtube-nocookie.com/embed/{id}">`.
2. Otherwise, the breed gets a "Watch live on YouTube" button linking to a
   broad, live-biased YouTube search
   (`youtube.com/results?search_query={breed}+horse+live`), opened in a new
   tab. It deliberately does not use YouTube's `sp=EgJAAQ%3D%3D` "currently
   live" filter — that filter is over-constrained and frequently returns zero
   results for a given breed. Biasing via the "live" search term instead
   surfaces live streams when they exist and falls back to regular videos
   when they don't, so the button is never a dead end. This costs nothing,
   needs no key, and always works. The breed's display name is sanitized
   before it becomes a query — parenthetical qualifiers and punctuation like
   `&` are stripped ("Andalusian (PRE)" searches as "Andalusian",
   "Welsh Pony & Cob" as "Welsh Pony Cob") because YouTube treats them as
   noise terms that degrade results — and "horse" is only appended when the
   name doesn't already contain an equine word (horse/pony/cob).

Tier-1 embeds also render the tier-2 search link underneath the iframe: a
cam can go offline at any time with no client-side way to detect it, so the
link keeps a dead embed from being a dead end.

`liveStreamId` is deliberately sparse: it should only ever be set for a
stream someone actually watched and confirmed live at the time it was added.
As shipped, no breed has a verified 24/7 cam — `chincoteague` and `mustang`
were checked (as the most plausible candidates) but no confirmed, embeddable
24/7 live cam could be found for either, so every breed currently uses the
search-link fallback.

## Navigation: hash routing, not react-router

The app has three views — Stable (`#/`, no hash, or any unrecognized hash;
it's the default view), breeds (`#/breeds`), and Live (`#/live`) — switched
via `src/lib/route.ts#parseHash` and a `hashchange` listener in `App`.
`#/stable` also resolves to the stable via the fallback, so older deep links
keep working. This is deliberately not `react-router`: three views don't
justify a routing dependency, and hash routing needs no `BASE_URL`/basename
handling to work under GitHub Pages' subpath deployment, and survives a hard
refresh on any view's hash without server-side rewrite rules (there is no
server).

## Live cams page

`src/data/cams.ts` is the curation point for third-party live cam links
shown on the Live page (`src/components/LivePage.tsx`), separate from
`Breed.liveStreamId`. A `LiveCam` optionally carries a `breedId`, which
`src/data/cams.test.ts` cross-checks against `src/data/breeds.ts` as a
referential-integrity guard.

**External cams are never iframed** — they're third-party pages with
unknown frame policies (and, per the constraints above, this app doesn't
control what they embed). They render as outbound link cards
(`target="_blank" rel="noopener noreferrer"`) via `CamCard`. The only true
embedded player on the Live page is for breeds with a verified
`liveStreamId`, using the same `youtube-nocookie.com` iframe pattern as the
breed detail modal.

As with `liveStreamId`, cam liveness is unverifiable client-side — a listed
cam can go offline at any time with no way for the app to detect it. The
Live page says so explicitly instead of showing a fake "LIVE" indicator.

## Stable view: sprites are data, not assets

The stable (`src/stable/`, the default view) is a pixel-art paddock where every breed wanders,
grazes, and idles on one low-resolution canvas (320×180 logical pixels,
scaled up with `image-rendering: pixelated`, nearest-neighbor only).

- **Sprites are 2D palette-index arrays, not image files.** The three base
  silhouettes (`pony` 20×14, `horse` 24×16, `draft` 28×18) live in
  `src/stable/sprites.ts` as ASCII grids parsed at module load. There is no
  asset pipeline; the art stays diffable, palette-swappable, and
  test-guarded. **Sprite polish is a data edit**, not a code change: tweak
  the ASCII rows, look at the result, commit.
- **Palette slots are semantic:** `0` transparent, `1` body, `2` mane/tail,
  `3` marking (blaze, feathering, spots), `4` outline/hoof.
  `src/stable/coats.ts` maps each breed id to a sprite key plus a slot→hex
  palette; a coat that wants no marking maps slot 3 back to its body color
  (Friesian), and the draft sheet's hoof feathering uses slot 3 so it renders
  white on Clydesdale/Shire but body-colored on Percheron. `spots: true`
  adds a deterministic (breed-id-seeded) blotch mask over body pixels —
  Appaloosa blanket, Gypsy Vanner/Chincoteague pinto patches.
- **Size is the punchline.** `src/stable/scale.ts#scaleFor` maps mean height
  in hands to a draw scale — 9hh → 0.65×, 17.5hh → 1.5×, linear, clamped —
  applied on top of the base silhouette's size, so a Shire lands at roughly
  2.5× the on-screen area of a Shetland. Keep that invariant when tuning:
  drafts must visibly dwarf ponies at a glance.
- **Simulation is pure** (`src/stable/sim.ts`): no canvas, no DOM, no
  `Math.random` — randomness is an injected rng, so tests run it
  deterministically. Rendering (`src/stable/render.ts`) degrades gracefully
  where no 2D context exists (jsdom). Agents are y-sorted at draw time so
  nearer horses occlude farther ones; walk speed and frame cadence scale
  with size so drafts amble and ponies scurry.
- **Spawn count:** all 20 breeds spawn at once — at 320×180 the herd is
  cozy but readable, and it keeps "every breed, one paddock" true. A
  "New herd" button reshuffles positions. If the roster grows much past 20,
  switch to a random subset per shuffle instead.
- The view skips simulation under `prefers-reduced-motion` (static herd,
  still clickable) and stops advancing while the tab is hidden.

## Images

Breed photos are referenced by Wikimedia Commons filename, turned into a URL
via `Special:FilePath`:
`https://commons.wikimedia.org/wiki/Special:FilePath/{filename}`. This
redirects to the current, renamed-safe version of the file, which is far
more durable than linking a raw hashed `upload.wikimedia.org` path directly.

Every breed's `image` also carries `credit` and `license`, shown in the
detail view. If a Commons file couldn't be confirmed to exist, `image.url`
is left as `''` and the UI shows a placeholder instead of guessing a URL.

## Guard rail: the data-integrity test

`src/data/breeds.test.ts` is the contract for anything added to
`src/data/breeds.ts`: unique kebab-case ids, non-empty required fields, a
valid `BreedCategory`, a sane `heightHands` tuple, non-empty image credit and
license, an `image.url` that's either empty or a real Commons
`Special:FilePath` URL, and (if present) a well-formed 11-character
`liveStreamId`. Any new breed must pass this test — it's the only thing
stopping the data file from silently rotting.

## Known limitations

- **Image liveness is unchecked.** `Special:FilePath` follows Commons
  renames, so it rots far less than a raw upload URL, but the data-integrity
  test only checks the URL's *shape* — it doesn't verify the file actually
  exists. A missing image is a data edit (fix the filename, or clear
  `image.url` back to placeholder), not a code bug.
- **Stream coverage is sparse by design.** Most breeds only get the
  search-link fallback. An embedded cam can go offline at any time; the app
  has no way to detect that client-side, so a stale `liveStreamId` will show
  YouTube's own "stream offline" state inside the iframe (with the search
  link below it as an escape hatch). When in doubt, prefer leaving
  `liveStreamId` unset.
- **No YouTube Data API** — deliberate, to keep the app keyless and
  backend-free (see above).

## Non-goals

Favoriting/accounts, i18n, any backend, exhaustive breed coverage,
auto-discovery of live streams.
