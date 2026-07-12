import { useEffect, useState, type ReactNode } from 'react'
import { breeds } from './data/breeds'
import type { Breed, BreedCategory } from './data/types'
import { Filters } from './components/Filters'
import { BreedGrid } from './components/BreedGrid'
import { BreedDetail } from './components/BreedDetail'
import { LivePage } from './components/LivePage'
import { StablePage } from './stable/StablePage'
import { parseHash, type View } from './lib/route'

const VIEW_HREF: Record<View, string> = { breeds: '#/breeds', live: '#/live', stable: '#/' }

function NavLink({ view, current, onNavigate, children }: {
  view: View
  current: View
  onNavigate: (view: View) => void
  children: ReactNode
}) {
  const isActive = view === current
  return (
    <a
      href={VIEW_HREF[view]}
      onClick={() => onNavigate(view)}
      aria-current={isActive ? 'page' : undefined}
      className={
        isActive
          ? 'rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white'
          : 'rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }
    >
      {children}
    </a>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<BreedCategory[]>([])
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null)
  const [view, setView] = useState<View>(() => parseHash(window.location.hash))

  useEffect(() => {
    function handleHashChange() {
      setView(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function toggleCategory(category: BreedCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🐴 Horse Breeds Explorer</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Browse breeds, learn what makes each one special, and catch a live cam where one exists.
            </p>
          </div>
          <nav className="flex gap-1">
            <NavLink view="stable" current={view} onNavigate={setView}>
              Stable
            </NavLink>
            <NavLink view="breeds" current={view} onNavigate={setView}>
              Breeds
            </NavLink>
            <NavLink view="live" current={view} onNavigate={setView}>
              Live
            </NavLink>
          </nav>
        </div>
      </header>

      {view === 'live' ? (
        <LivePage breeds={breeds} onSelectBreed={setSelectedBreed} />
      ) : view === 'stable' ? (
        <StablePage breeds={breeds} onSelectBreed={setSelectedBreed} />
      ) : (
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
      )}

      {selectedBreed && <BreedDetail breed={selectedBreed} onClose={() => setSelectedBreed(null)} />}
    </div>
  )
}

export default App
