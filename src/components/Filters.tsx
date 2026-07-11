import type { BreedCategory } from '../data/types'

const CATEGORIES: BreedCategory[] = [
  'Light / Riding',
  'Stock',
  'Draft',
  'Baroque',
  'Pony',
  'Gaited',
  'Feral / Wild',
]

interface FiltersProps {
  query: string
  onQueryChange: (query: string) => void
  selectedCategories: BreedCategory[]
  onToggleCategory: (category: BreedCategory) => void
}

export function Filters({ query, onQueryChange, selectedCategories, onToggleCategory }: FiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search by name or origin…"
        aria-label="Search breeds"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
      />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const selected = selectedCategories.includes(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                selected
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}
