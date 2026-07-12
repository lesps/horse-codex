// Display names can carry qualifiers that read as noise terms in YouTube
// search ("Andalusian (PRE)", "Welsh Pony & Cob"), so the name is reduced
// to plain words before building the query.
function liveSearchTerms(breedName: string): string {
  const cleaned = breedName
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}'-]+/gu, ' ')
    .trim()
  const base = cleaned || breedName.trim()
  const hasEquineWord = /\b(horse|pony|cob)\b/i.test(base)
  return hasEquineWord ? `${base} live` : `${base} horse live`
}

export function buildLiveSearchUrl(breedName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(liveSearchTerms(breedName))}`
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
