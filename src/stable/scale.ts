// Maps a breed's real height (hands) to an on-screen draw scale, so drafts
// read as giants next to ponies. Applied on top of the base sprite's own
// silhouette size (pony < horse < draft sheets).
export const MIN_HANDS = 9
export const MAX_HANDS = 17.5
export const MIN_SCALE = 0.65
export const MAX_SCALE = 1.5

export function scaleFor(heightHands: [number, number]): number {
  const h = (heightHands[0] + heightHands[1]) / 2
  const t = MIN_SCALE + ((h - MIN_HANDS) * (MAX_SCALE - MIN_SCALE)) / (MAX_HANDS - MIN_HANDS)
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, t))
}
