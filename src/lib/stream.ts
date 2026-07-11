const LIVE_SEARCH_FILTER = 'EgJAAQ%3D%3D'

export function buildLiveSearchUrl(breedName: string): string {
  const query = encodeURIComponent(`${breedName} horse live`)
  return `https://www.youtube.com/results?search_query=${query}&sp=${LIVE_SEARCH_FILTER}`
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
