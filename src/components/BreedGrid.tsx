import type { Breed, BreedCategory } from '../data/types'
import { BreedCard } from './BreedCard'

export function filterBreeds(breeds: Breed[], query: string, categories: BreedCategory[]): Breed[] {
  const normalizedQuery = query.trim().toLowerCase()
  return breeds.filter((breed) => {
    const matchesQuery =
      normalizedQuery === '' ||
      breed.name.toLowerCase().includes(normalizedQuery) ||
      breed.origin.toLowerCase().includes(normalizedQuery)
    const matchesCategory = categories.length === 0 || categories.includes(breed.category)
    return matchesQuery && matchesCategory
  })
}

interface BreedGridProps {
  breeds: Breed[]
  query: string
  categories: BreedCategory[]
  onSelect: (breed: Breed) => void
}

export function BreedGrid({ breeds, query, categories, onSelect }: BreedGridProps) {
  const filtered = filterBreeds(breeds, query, categories)

  if (filtered.length === 0) {
    return <p className="py-12 text-center text-gray-500">No breeds match your search.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((breed) => (
        <BreedCard key={breed.id} breed={breed} onClick={() => onSelect(breed)} />
      ))}
    </div>
  )
}
