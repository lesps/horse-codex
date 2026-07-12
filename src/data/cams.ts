export interface LiveCam {
  id: string
  label: string
  url: string
  description: string
  breedId?: string
}

export const cams: LiveCam[] = [
  {
    id: 'ncpa-barn',
    label: 'NCPA Pony Barn Cam',
    url: 'https://www.pony-chincoteague.org/',
    description: 'Live barn cam of Chincoteague ponies — mares, foals, stallions.',
    breedId: 'chincoteague',
  },
  {
    id: 'explore-kentucky',
    label: 'Kentucky Horse Cam (Explore.org)',
    url: 'https://explore.org/livecams/kentucky-equine-horses/kentucky-equine-horses',
    description: "Live horse cam in Kentucky on Explore.org's cam network.",
    breedId: 'thoroughbred',
  },
  {
    id: 'explore-directory',
    label: 'Explore.org Live Animal Cams',
    url: 'https://explore.org/livecams',
    description: 'Directory of live animal cams; the farm section often has horses.',
  },
]
