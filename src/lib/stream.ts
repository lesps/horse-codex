export function buildLiveSearchUrl(breedName: string): string {
  const hasEquineWord = /\b(horse|pony)\b/i.test(breedName)
  const terms = hasEquineWord ? `${breedName} live` : `${breedName} horse live`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(terms)}`
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
