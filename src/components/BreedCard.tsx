import type { Breed } from '../data/types'

export function BreedCard({ breed, onClick }: { breed: Breed; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-700">
        {breed.image.url ? (
          <img
            src={breed.image.url}
            alt={breed.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image yet
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {breed.category}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{breed.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{breed.origin}</p>
      </div>
    </button>
  )
}
