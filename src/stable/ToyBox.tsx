import { useEffect, useRef } from 'react'
import { artSize, items, type ItemKind, type ToyItem } from './items'
import { drawPixelArt } from './render'
import type { ToyBoxState } from './toybox'

/** Crisp canvas rendering of an item's pixel art at an integer zoom. */
export function PixelIcon({ item, zoom = 3 }: { item: ToyItem; zoom?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { w, h } = artSize(item)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false
    drawPixelArt(ctx, item, item.anchor.x * zoom, item.anchor.y * zoom, zoom)
  }, [item, zoom])

  return (
    <canvas
      ref={ref}
      width={w * zoom}
      height={h * zoom}
      aria-hidden="true"
      className="max-h-full max-w-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

const SECTIONS: { kind: ItemKind[]; label: string }[] = [
  { kind: ['hat', 'saddle'], label: 'Hats & saddles' },
  { kind: ['decoration'], label: 'Decorations' },
  { kind: ['treat'], label: 'Treats' },
]

export function ToyBox({
  state,
  selectedId,
  onSelect,
}: {
  state: ToyBoxState
  selectedId: string | null
  onSelect: (itemId: string | null) => void
}) {
  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🧸 Toy box</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {state.discovered.length} of {items.length} toys discovered
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        New toys turn up at random while you click around the paddock. Pick a toy, then click a
        horse (hats &amp; saddles) or a spot in the grass (decorations &amp; treats).
      </p>

      {SECTIONS.map((section) => (
        <div key={section.label} className="mt-4">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
            {section.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items
              .filter((item) => section.kind.includes(item.kind))
              .map((item) => {
                const found = state.discovered.includes(item.id)
                const selected = selectedId === item.id
                if (!found) {
                  return (
                    <div
                      key={item.id}
                      aria-label="Undiscovered toy"
                      title="Not discovered yet — keep clicking around the paddock!"
                      className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xl text-gray-300 dark:border-gray-700 dark:text-gray-700"
                    >
                      ?
                    </div>
                  )
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(selected ? null : item.id)}
                    aria-pressed={selected}
                    aria-label={item.name}
                    title={item.name}
                    className={
                      selected
                        ? 'flex h-14 w-14 items-center justify-center rounded-lg border-2 border-red-500 bg-red-50 p-1 dark:bg-red-950'
                        : 'flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-1 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-500'
                    }
                  >
                    <PixelIcon item={item} />
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </section>
  )
}
