export type View = 'breeds' | 'live'

export function parseHash(hash: string): View {
  return hash === '#/live' ? 'live' : 'breeds'
}
