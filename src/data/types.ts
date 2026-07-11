export type BreedCategory =
  | 'Light / Riding'
  | 'Stock'
  | 'Draft'
  | 'Baroque'
  | 'Pony'
  | 'Gaited'
  | 'Feral / Wild'

export interface Breed {
  id: string
  name: string
  origin: string
  category: BreedCategory
  heightHands: [number, number]
  temperament: string
  description: string
  uses: string[]
  image: {
    url: string
    credit: string
    license: string
  }
  liveStreamId?: string
}
