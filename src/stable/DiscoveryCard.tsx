import type { ToyItem } from './items'
import { PixelIcon } from './ToyBox'

const KIND_LABEL: Record<ToyItem['kind'], string> = {
  hat: 'Hat',
  saddle: 'Saddle',
  decoration: 'Decoration',
  treat: 'Treat',
}

const SPARKLES = [
  { top: '-14px', left: '10%', delay: '0s' },
  { top: '-10px', right: '12%', delay: '0.15s' },
  { bottom: '-12px', left: '20%', delay: '0.3s' },
  { bottom: '-8px', right: '18%', delay: '0.45s' },
]

/** Celebration overlay shown when a new toy is found. */
export function DiscoveryCard({ item, onClose }: { item: ToyItem; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/40 p-4"
      role="dialog"
      aria-label={`New discovery: ${item.name}`}
    >
      <div className="toy-pop relative w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-gray-900">
        {SPARKLES.map((pos, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="toy-sparkle absolute text-xl"
            style={{ ...pos, animationDelay: pos.delay }}
          >
            ✨
          </span>
        ))}
        <p className="text-xs font-semibold tracking-widest text-red-500 uppercase">
          New discovery!
        </p>
        <div className="toy-bounce mx-auto mt-3 flex h-24 items-center justify-center">
          <PixelIcon item={item} zoom={7} />
        </div>
        <h4 className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-100">{item.name}</h4>
        <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
          {KIND_LABEL[item.kind]}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.blurb}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Add to toy box
        </button>
      </div>
    </div>
  )
}
