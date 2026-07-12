import type { Breed } from '../data/types'
import type { LiveCam } from '../data/cams'
import { cams as defaultCams } from '../data/cams'
import { youtubeEmbedUrl } from '../lib/stream'
import { CamCard } from './CamCard'
import { BreedLiveList } from './BreedLiveList'

export function LivePage({
  breeds,
  cams = defaultCams,
  onSelectBreed,
}: {
  breeds: Breed[]
  cams?: LiveCam[]
  onSelectBreed: (breed: Breed) => void
}) {
  const breedById = new Map(breeds.map((breed) => [breed.id, breed]))
  const liveBreeds = breeds.filter((breed) => breed.liveStreamId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Live</h2>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        These cameras are run by third parties and may occasionally be offline.
      </p>

      {liveBreeds.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Live now (embedded)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {liveBreeds.map((breed) => (
              <div key={breed.id} className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  className="h-full w-full"
                  src={youtubeEmbedUrl(breed.liveStreamId as string)}
                  title={`Live cam: ${breed.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Horse cams around the web
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cams.map((cam) => (
            <CamCard
              key={cam.id}
              cam={cam}
              breed={cam.breedId ? breedById.get(cam.breedId) : undefined}
              onViewBreed={onSelectBreed}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Search YouTube by breed
        </h3>
        <BreedLiveList breeds={breeds} />
      </section>
    </div>
  )
}
