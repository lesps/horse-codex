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
2. Otherwise, the breed gets a "Watch live on YouTube" button linking to
   YouTube's own live-filtered search results
   (`youtube.com/results?search_query={breed}+horse+live&sp=EgJAAQ%3D%3D`),
   opened in a new tab. This costs nothing, needs no key, and always works.

`liveStreamId` is deliberately sparse: it should only ever be set for a
stream someone actually watched and confirmed live at the time it was added.
As shipped, no breed has a verified 24/7 cam — `chincoteague` and `mustang`
were checked (as the most plausible candidates) but no confirmed, embeddable
24/7 live cam could be found for either, so every breed currently uses the
search-link fallback.

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
  YouTube's own "stream offline" state inside the iframe. When in doubt,
  prefer leaving `liveStreamId` unset.
- **No YouTube Data API** — deliberate, to keep the app keyless and
  backend-free (see above).

## Non-goals

Favoriting/accounts, i18n, any backend, exhaustive breed coverage,
auto-discovery of live streams.
