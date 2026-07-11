import { useState } from 'react'
import { breeds } from './data/breeds'
import type { Breed, BreedCategory } from './data/types'
import { Filters } from './components/Filters'
import { BreedGrid } from './components/BreedGrid'
import { BreedDetail } from './components/BreedDetail'

function App() {
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<BreedCategory[]>([])
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null)

  function toggleCategory(category: BreedCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🐴 Horse Breeds Explorer</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Browse breeds, learn what makes each one special, and catch a live cam where one exists.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <Filters
            query={query}
            onQueryChange={setQuery}
            selectedCategories={categories}
            onToggleCategory={toggleCategory}
          />
        </div>

        <BreedGrid breeds={breeds} query={query} categories={categories} onSelect={setSelectedBreed} />
      </main>

      {selectedBreed && <BreedDetail breed={selectedBreed} onClose={() => setSelectedBreed(null)} />}
    </div>
  )
}

export default App
