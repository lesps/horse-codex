export type View = 'breeds' | 'live' | 'stable'

// The stable is the default view: empty, root, `#/stable`, and unrecognized
// hashes all land there. Breeds and Live have explicit hashes.
export function parseHash(hash: string): View {
  if (hash === '#/breeds') return 'breeds'
  if (hash === '#/live') return 'live'
  return 'stable'
}
