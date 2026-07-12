import type { Breed } from '../data/types'
import { buildLiveSearchUrl } from '../lib/stream'

export function BreedLiveList({ breeds }: { breeds: Breed[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {breeds.map((breed) => (
        <li key={breed.id}>
          <a
            href={buildLiveSearchUrl(breed.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-700 dark:hover:text-red-400"
          >
            {breed.name}
          </a>
        </li>
      ))}
    </ul>
  )
}
