# Changelog

## 0.3.0

- The stable is now the app's default view: `#/` (and any unrecognized
  hash) opens the paddock, and the breed catalogue moved to `#/breeds`.
  Old `#/stable` links still land on the stable.
- Added pixel stable view: an animated pixel-art paddock where
  all 20 breeds wander, graze, and idle, each with a recognizable
  palette-swapped coat (Friesian solid black, Akhal-Teke gold, Appaloosa
  spots, Clydesdale white feathering, piebald Gypsy Vanner, …) and sized by
  real height in hands — the drafts visibly dwarf the Shetland.
- Sprites are hand-authored palette-index grids in TypeScript
  (`src/stable/sprites.ts`), not image assets; per-breed coats live in
  `src/stable/coats.ts` and are test-guarded against the breed roster.
- Clicking a horse opens its breed detail modal; hovering (or tapping) shows
  its name. A "New herd" button reshuffles the paddock. The simulation is
  pure and deterministic under test, pauses while the tab is hidden, and
  stays static under `prefers-reduced-motion`.

## 0.2.0

- Added Live streams page (`#/live`), collecting all live-horse-viewing
  options in one place: embedded 24/7 cams for breeds with a verified
  `liveStreamId`, curated outbound cam links (`src/data/cams.ts`) seeded
  with the NCPA Pony Barn Cam, Explore.org's Kentucky Horse Cam, and the
  Explore.org live-animal-cams directory, and a per-breed YouTube
  live-search link list.
- Added lightweight hash-based routing (`#/` and `#/live`) with a header
  nav — no react-router, since GitHub Pages' subpath deployment and a
  refresh on `#/live` both "just work" under hash routing with no extra
  configuration.

## 0.1.0 — Initial release

- Seed catalogue of 20 horse breeds, each with origin, category, height
  range, temperament, description, and common uses.
- Breed photos sourced from Wikimedia Commons via `Special:FilePath` links,
  with credit and license shown in the detail view, for the 12 breeds whose
  Commons file could be confirmed (Thoroughbred, Appaloosa, Lipizzaner,
  Shire, Percheron, Gypsy Vanner, Icelandic Horse, Norwegian Fjord,
  Haflinger, Shetland Pony, Welsh Pony & Cob, Mustang). The remaining 8
  breeds (Arabian, American Quarter Horse, Friesian, Andalusian, Akhal-Teke,
  Clydesdale, Tennessee Walking Horse, Chincoteague Pony) ship with the
  built-in placeholder pending a confirmed Commons file — see "Needs image"
  below.
- Two-tier live-stream strategy: a breed can carry a verified 24/7 YouTube
  `liveStreamId` for an embedded cam; every other breed falls back to a
  "Watch live on YouTube" link filtered to live results.
- Category filter chips and free-text search (name/origin) on the landing
  grid.
- Keyboard-accessible, focus-trapped breed detail modal (Esc to close).
- Static, client-only build deployed to GitHub Pages via GitHub Actions.

### Needs image

Commons access was rate/bot-limited during this pass, so these 8 breeds
ship with the placeholder pending a manually-confirmed filename: `arabian`,
`quarter-horse`, `friesian`, `andalusian`, `akhal-teke`, `clydesdale`,
`tennessee-walker`, `chincoteague`.
