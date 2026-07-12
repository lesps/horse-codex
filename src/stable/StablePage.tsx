import { useEffect, useRef, useState } from 'react'
import type { Breed } from '../data/types'
import { ConfirmDialog } from './ConfirmDialog'
import { DiscoveryCard } from './DiscoveryCard'
import { itemById, type ToyItem } from './items'
import {
  LOGICAL_H,
  LOGICAL_W,
  PADDOCK_TOP,
  buildBackground,
  buildCoatFrames,
  decorationAt,
  drawScene,
  hitTest,
  treatAt,
} from './render'
import {
  MAX_TREATS,
  spawn,
  tickWorld,
  type Bounds,
  type HorseAgent,
  type World,
} from './sim'
import { ToyBox } from './ToyBox'
import {
  CLICK_FIND_CHANCE,
  OPEN_FIND_CHANCE,
  TIDY_TOOL,
  addDiscovery,
  loadToyBox,
  placeDecoration,
  putAwayAll,
  recordMiss,
  removeDecoration,
  rollDiscovery,
  saveToyBox,
  toggleAccessory,
  unequipAll,
  type ToyBoxState,
} from './toybox'

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

function selectionHint(item: ToyItem | null, tidying: boolean): string {
  if (tidying) {
    return 'Tidying up: click a horse to take off its hat and saddle, a decoration to pick it up, or a treat to clear it.'
  }
  if (!item) {
    return 'Click a horse to open its breed — and keep clicking around the grass, there are toys hiding out there.'
  }
  switch (item.kind) {
    case 'hat':
    case 'saddle':
      return `Click a horse to put on the ${item.name} — click a horse already wearing it to take it off.`
    case 'decoration':
      return `Click the paddock to place the ${item.name} — click a placed decoration to pick it back up.`
    case 'treat':
      return `Click the paddock to drop the ${item.name} — nearby horses will wander over for a snack.`
  }
}

export function StablePage({
  breeds,
  onSelectBreed,
  initialAgents,
  initialToyBox,
  discoveryRng = Math.random,
}: {
  breeds: Breed[]
  onSelectBreed: (breed: Breed) => void
  /** Test hook: start from known agent positions instead of a random spawn. */
  initialAgents?: HorseAgent[]
  /** Test hook: start from a known toy box instead of localStorage. */
  initialToyBox?: ToyBoxState
  /** Test hook: rng driving discovery rolls. */
  discoveryRng?: () => number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<World>({
    agents: initialAgents ?? spawn(breeds, BOUNDS, Math.random),
    treats: [],
  })
  const treatSeq = useRef(0)
  const rolledOnOpen = useRef(false)
  const [toybox, setToybox] = useState<ToyBoxState>(() => initialToyBox ?? loadToyBox())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [discovery, setDiscovery] = useState<ToyItem | null>(null)
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null)
  const [confirmingPutAway, setConfirmingPutAway] = useState(false)
  const breedById = useRef(new Map(breeds.map((b) => [b.id, b])))
  // RAF-visible mirror of the persisted toy box (equipped + decorations).
  const sceneStateRef = useRef(toybox)

  useEffect(() => {
    breedById.current = new Map(breeds.map((b) => [b.id, b]))
  }, [breeds])

  useEffect(() => {
    sceneStateRef.current = toybox
    saveToyBox(toybox)
  }, [toybox])

  function tryDiscover(chance: number) {
    const state = sceneStateRef.current
    const found = rollDiscovery(state, discoveryRng, chance)
    if (found) {
      setDiscovery(found)
      setToybox(addDiscovery(state, found.id))
    } else {
      setToybox(recordMiss(state))
    }
  }

  // One roll per stable visit, so opening the app can turn up a toy.
  useEffect(() => {
    if (rolledOnOpen.current) return
    rolledOnOpen.current = true
    tryDiscover(OPEN_FIND_CHANCE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

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
        worldRef.current = tickWorld(worldRef.current, dt, BOUNDS, Math.random)
      }
      if (ctx && coatFrames) {
        drawScene(ctx, background, coatFrames, {
          agents: worldRef.current.agents,
          treats: worldRef.current.treats,
          decorations: sceneStateRef.current.decorations,
          equipped: sceneStateRef.current.equipped,
        })
      }
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
    const hit = p && hitTest(worldRef.current.agents, p.x, p.y)
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

  function dropTreat(item: ToyItem, x: number, y: number) {
    const treats = worldRef.current.treats
    if (treats.length >= MAX_TREATS) return
    const bottom = BOUNDS.bottomInset ?? BOUNDS.inset
    const treat = {
      id: `treat-${treatSeq.current++}`,
      itemId: item.id,
      x: Math.min(BOUNDS.width - BOUNDS.inset, Math.max(BOUNDS.inset, x)),
      y: Math.min(BOUNDS.height - bottom, Math.max(BOUNDS.top, y)),
      bites: item.feedSeconds ?? 5,
      maxBites: item.feedSeconds ?? 5,
    }
    worldRef.current = { ...worldRef.current, treats: [...treats, treat] }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const p = logicalPoint(e)
    if (!p) return
    const selected = selectedId ? (itemById.get(selectedId) ?? null) : null
    const hit = hitTest(worldRef.current.agents, p.x, p.y)

    if (selectedId === TIDY_TOOL) {
      if (hit) {
        setToybox((state) => unequipAll(state, hit.breedId))
        return
      }
      const deco = decorationAt(toybox.decorations, p.x, p.y)
      if (deco) {
        setToybox((state) => removeDecoration(state, deco.id))
        return
      }
      const treat = treatAt(worldRef.current.treats, p.x, p.y)
      if (treat) {
        worldRef.current = {
          ...worldRef.current,
          treats: worldRef.current.treats.filter((t) => t.id !== treat.id),
        }
        return
      }
      tryDiscover(CLICK_FIND_CHANCE)
      return
    }

    if (selected?.kind === 'hat' || selected?.kind === 'saddle') {
      if (hit) {
        setToybox((state) => toggleAccessory(state, hit.breedId, selected.id))
      } else {
        tryDiscover(CLICK_FIND_CHANCE)
      }
      return
    }

    if (selected?.kind === 'decoration') {
      const existing = decorationAt(toybox.decorations, p.x, p.y)
      if (existing) {
        setToybox((state) => removeDecoration(state, existing.id))
      } else {
        const x = Math.min(LOGICAL_W - 8, Math.max(8, p.x))
        const y = Math.min(LOGICAL_H - 4, Math.max(64, p.y))
        setToybox((state) => placeDecoration(state, selected.id, x, y))
      }
      return
    }

    if (selected?.kind === 'treat') {
      dropTreat(selected, p.x, p.y)
      return
    }

    if (hit) {
      const breed = breedById.current.get(hit.breedId)
      if (breed) onSelectBreed(breed)
    } else {
      tryDiscover(CLICK_FIND_CHANCE)
    }
  }

  function putAway() {
    setToybox((state) => putAwayAll(state))
    worldRef.current = { ...worldRef.current, treats: [] }
    setSelectedId(null)
    setConfirmingPutAway(false)
  }

  function newHerd() {
    worldRef.current = {
      agents: spawn(breeds, BOUNDS, Math.random),
      treats: worldRef.current.treats,
    }
    setHover(null)
    tryDiscover(CLICK_FIND_CHANCE)
  }

  const selectedItem = selectedId ? (itemById.get(selectedId) ?? null) : null

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
          style={{
            imageRendering: 'pixelated',
            cursor: hover || selectedId ? 'pointer' : 'default',
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
          onClick={handleClick}
        />
        {hover && !discovery && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded bg-gray-900/85 px-2 py-0.5 text-xs font-medium text-white"
            style={{ left: hover.x, top: Math.max(0, hover.y - 26) }}
          >
            {hover.name}
          </div>
        )}
        {discovery && <DiscoveryCard item={discovery} onClose={() => setDiscovery(null)} />}
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {selectionHint(selectedItem, selectedId === TIDY_TOOL)}
      </p>

      <ToyBox
        state={toybox}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPutAway={() => setConfirmingPutAway(true)}
      />

      {confirmingPutAway && (
        <ConfirmDialog
          title="Put everything away?"
          body="Every horse gets undressed and all decorations and treats are cleared. Your discovered toys stay in the toy box."
          confirmLabel="Put it all away"
          cancelLabel="Keep playing"
          onConfirm={putAway}
          onCancel={() => setConfirmingPutAway(false)}
        />
      )}
    </div>
  )
}
