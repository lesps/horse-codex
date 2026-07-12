import type { Breed } from '../data/types'
import { buildLiveSearchUrl, youtubeEmbedUrl } from '../lib/stream'

export function StreamSection({ breed }: { breed: Breed }) {
  if (breed.liveStreamId) {
    return (
      <div>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            className="h-full w-full"
            src={youtubeEmbedUrl(breed.liveStreamId)}
            title={`Live cam: ${breed.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <a
          href={buildLiveSearchUrl(breed.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Stream offline? Search live cams on YouTube
        </a>
      </div>
    )
  }

  return (
    <a
      href={buildLiveSearchUrl(breed.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
    >
      Watch live on YouTube
    </a>
  )
}
