import type { Breed } from '../data/types'
import type { LiveCam } from '../data/cams'

export function CamCard({
  cam,
  breed,
  onViewBreed,
}: {
  cam: LiveCam
  breed?: Breed
  onViewBreed?: (breed: Breed) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{cam.label}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{cam.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <a
          href={cam.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Watch
        </a>
        {breed && onViewBreed && (
          <button
            type="button"
            onClick={() => onViewBreed(breed)}
            className="text-sm text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            View breed
          </button>
        )}
      </div>
    </div>
  )
}
