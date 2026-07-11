import { useEffect, useRef } from 'react'
import type { Breed } from '../data/types'
import { StreamSection } from './StreamSection'

export function BreedDetail({ breed, onClose }: { breed: Breed; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, iframe, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="breed-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="breed-detail-title" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {breed.name}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-3 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {breed.image.url ? (
            <img src={breed.image.url} alt={breed.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No image yet
            </div>
          )}
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Photo credit: {breed.image.credit} · {breed.image.license}
        </p>

        <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Origin</dt>
            <dd className="text-gray-900 dark:text-gray-100">{breed.origin}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Category</dt>
            <dd className="text-gray-900 dark:text-gray-100">{breed.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Height</dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {breed.heightHands[0].toFixed(1)}–{breed.heightHands[1].toFixed(1)} hh
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Temperament</dt>
            <dd className="text-gray-900 dark:text-gray-100">{breed.temperament}</dd>
          </div>
        </dl>

        <p className="mb-4 text-gray-700 dark:text-gray-300">{breed.description}</p>

        <div className="mb-4">
          <dt className="mb-1 font-medium text-gray-500 dark:text-gray-400">Common uses</dt>
          <dd className="flex flex-wrap gap-2">
            {breed.uses.map((use) => (
              <span
                key={use}
                className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                {use}
              </span>
            ))}
          </dd>
        </div>

        <StreamSection breed={breed} />
      </div>
    </div>
  )
}
