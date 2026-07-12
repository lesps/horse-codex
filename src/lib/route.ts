export type View = 'breeds' | 'live' | 'stable'

export function parseHash(hash: string): View {
  if (hash === '#/live') return 'live'
  if (hash === '#/stable') return 'stable'
  return 'breeds'
}
