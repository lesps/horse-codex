import { useEffect, useRef, useState } from 'react'
import type { Breed } from '../data/types'
import {
  LOGICAL_H,
  LOGICAL_W,
  PADDOCK_TOP,
  buildBackground,
  buildCoatFrames,
  drawScene,
  hitTest,
} from './render'
import { spawn, tick, type Bounds, type HorseAgent } from './sim'

// Side inset covers half the widest scaled sprite (draft 28px * 1.5 / 2) so
// no horse ever spawns or walks half off-screen.
const BOUNDS: Bounds = {
  width: LOGICAL_W,
  height: LOGICAL_H,
  top: PADDOCK_TOP,
  inset: 22,
  bottomInset: 6,
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function StablePage({
  breeds,
  onSelectBreed,
  initialAgents,
}: {
  breeds: Breed[]
  onSelectBreed: (breed: Breed) => void
  /** Test hook: start from known agent positions instead of a random spawn. */
  initialAgents?: HorseAgent[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const agentsRef = useRef<HorseAgent[]>(initialAgents ?? spawn(breeds, BOUNDS, Math.random))
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null)
  const breedById = useRef(new Map(breeds.map((b) => [b.id, b])))

  useEffect(() => {
    breedById.current = new Map(breeds.map((b) => [b.id, b]))
  }, [breeds])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const background = buildBackground()
    const coatFrames = buildCoatFrames(breeds.map((b) => b.id))
    const reduced = prefersReducedMotion()

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (document.visibilityState !== 'visible') return
      if (!reduced) {
        agentsRef.current = tick(agentsRef.current, dt, BOUNDS, Math.random)
      }
      if (ctx && coatFrames) drawScene(ctx, background, coatFrames, agentsRef.current)
    }
    raf = requestAnimationFrame(loop)

    const onVisible = () => {
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [breeds])

  function logicalPoint(e: { clientX: number; clientY: number }): { x: number; y: number } | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return {
      x: ((e.clientX - rect.left) * LOGICAL_W) / rect.width,
      y: ((e.clientY - rect.top) * LOGICAL_H) / rect.height,
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const p = logicalPoint(e)
    const hit = p && hitTest(agentsRef.current, p.x, p.y)
    if (hit) {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      setHover({
        name: breedById.current.get(hit.breedId)?.name ?? hit.breedId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    } else {
      setHover(null)
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const p = logicalPoint(e)
    const hit = p && hitTest(agentsRef.current, p.x, p.y)
    if (!hit) return
    const breed = breedById.current.get(hit.breedId)
    if (breed) onSelectBreed(breed)
  }

  function newHerd() {
    agentsRef.current = spawn(breeds, BOUNDS, Math.random)
    setHover(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stable</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Every breed at its real relative size — the Shire really is that big next to a
            Shetland. Click a horse to learn about its breed.
          </p>
        </div>
        <button
          type="button"
          onClick={newHerd}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          🔀 New herd
        </button>
      </div>

      <div className="relative mt-6 w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
        <canvas
          ref={canvasRef}
          width={LOGICAL_W}
          height={LOGICAL_H}
          role="img"
          aria-label="Pixel-art paddock where every horse breed wanders, grazes, and idles at its real relative size"
          className="block aspect-video w-full"
          style={{ imageRendering: 'pixelated', cursor: hover ? 'pointer' : 'default' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
          onClick={handleClick}
        />
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded bg-gray-900/85 px-2 py-0.5 text-xs font-medium text-white"
            style={{ left: hover.x, top: Math.max(0, hover.y - 26) }}
          >
            {hover.name}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {breeds.length} breeds are out grazing. Sprites are palette-swapped pixel art — spot the
        Appaloosa by its blanket and the Clydesdale by its white feathering.
      </p>
    </div>
  )
}
