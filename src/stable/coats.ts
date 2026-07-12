import type { SpriteKey } from './sprites'

// Per-breed coat: which base silhouette to use and how to color its palette
// slots. Recognizable over photoreal — Friesian solid black, Akhal-Teke
// metallic gold, Haflinger chestnut with flaxen mane, and so on. A coat that
// wants no white marking simply maps slot 3 back to its body color.
//
// `spots` adds a deterministic procedural speckle in the marking color over
// body pixels at render time (Appaloosa spots, pinto patches).

export interface Coat {
  sprite: SpriteKey
  /** Palette slot -> hex color. Must cover every slot the sprite uses. */
  palette: Record<number, string>
  spots?: boolean
}

// Sprite assignment: Draft category gets the draft sheet except the Fjord,
// which is draft-category but pony-sized (13.1-14.3hh); ponies plus the
// small gaited/feral breeds get the pony sheet; everything else is `horse`.
export const coats: Record<string, Coat> = {
  arabian: {
    sprite: 'horse',
    palette: { 1: '#dcd9d4', 2: '#8a8580', 3: '#f8f6f2', 4: '#4a4440' },
  },
  thoroughbred: {
    sprite: 'horse',
    palette: { 1: '#9c5a33', 2: '#2e2420', 3: '#f7f3ec', 4: '#3a2c1e' },
  },
  'quarter-horse': {
    sprite: 'horse',
    palette: { 1: '#a55b32', 2: '#7c4023', 3: '#f7f3ec', 4: '#4a2f1a' },
  },
  appaloosa: {
    sprite: 'horse',
    palette: { 1: '#efe9df', 2: '#57493d', 3: '#5b4638', 4: '#3f342a' },
    spots: true,
  },
  friesian: {
    sprite: 'horse',
    palette: { 1: '#232028', 2: '#16141a', 3: '#232028', 4: '#0c0b0e' },
  },
  andalusian: {
    sprite: 'horse',
    palette: { 1: '#d8d8dc', 2: '#b9b9c2', 3: '#f8f8fa', 4: '#55555e' },
  },
  lipizzaner: {
    sprite: 'horse',
    palette: { 1: '#f0efe9', 2: '#d8d6cd', 3: '#fbfaf6', 4: '#6b6960' },
  },
  'akhal-teke': {
    sprite: 'horse',
    palette: { 1: '#e3b04b', 2: '#3a2c14', 3: '#f7ead0', 4: '#5c431c' },
  },
  clydesdale: {
    sprite: 'draft',
    palette: { 1: '#7a4526', 2: '#241a12', 3: '#f7f3ec', 4: '#2e2014' },
  },
  shire: {
    sprite: 'draft',
    palette: { 1: '#2b2731', 2: '#17141d', 3: '#f2efe9', 4: '#0e0c12' },
  },
  percheron: {
    sprite: 'draft',
    palette: { 1: '#b9bcc2', 2: '#6e737c', 3: '#b9bcc2', 4: '#4d525b' },
  },
  'gypsy-vanner': {
    sprite: 'draft',
    palette: { 1: '#2f2b33', 2: '#f4f2ee', 3: '#f4f2ee', 4: '#121016' },
    spots: true,
  },
  icelandic: {
    sprite: 'pony',
    palette: { 1: '#4a3a2e', 2: '#2c211a', 3: '#ece5d8', 4: '#1c1510' },
  },
  fjord: {
    sprite: 'pony',
    palette: { 1: '#c9a06a', 2: '#3f3428', 3: '#ede0c4', 4: '#57452c' },
  },
  haflinger: {
    sprite: 'pony',
    palette: { 1: '#b56a35', 2: '#f2e3bd', 3: '#f8f1e2', 4: '#5c3517' },
  },
  'tennessee-walker': {
    sprite: 'horse',
    palette: { 1: '#6b3d22', 2: '#241a12', 3: '#f5f0e6', 4: '#2a1c10' },
  },
  shetland: {
    sprite: 'pony',
    palette: { 1: '#7a4a2b', 2: '#38271a', 3: '#f5efe4', 4: '#2c1d11' },
  },
  welsh: {
    sprite: 'pony',
    palette: { 1: '#e3e1dc', 2: '#c2beb6', 3: '#f9f8f4', 4: '#6d685f' },
  },
  mustang: {
    sprite: 'horse',
    palette: { 1: '#8d7355', 2: '#33291d', 3: '#e9decb', 4: '#3d3223' },
  },
  chincoteague: {
    sprite: 'pony',
    palette: { 1: '#a06a3f', 2: '#6b4426', 3: '#f4ecdd', 4: '#46311c' },
    spots: true,
  },
}
