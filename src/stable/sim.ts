import type { Breed } from '../data/types'
import { scaleFor } from './scale'

// Pure herd simulation: no canvas, no DOM, no Math.random. All randomness
// comes through an injected rng so tests can run it deterministically.

export interface Bounds {
  width: number
  height: number
  /** Highest y an agent's baseline (hoof line) may occupy — keeps horses off the fence/sky. */
  top: number
  /** Margin from the left/right edges — sized so the widest sprite stays fully visible. */
  inset: number
  /** Margin from the bottom edge; defaults to `inset`. */
  bottomInset?: number
}

export type AgentState = 'walk' | 'idle' | 'graze'

export interface HorseAgent {
  breedId: string
  /** Baseline anchor, logical pixels: x is sprite center, y is the hoof line. */
  x: number
  y: number
  facing: 1 | -1
  state: AgentState
  /** Seconds spent in the current state. */
  stateT: number
  /** How long the current graze/idle lasts before walking again. */
  stateDur: number
  target?: { x: number; y: number }
  frame: number
  scale: number
}

/** Deterministic PRNG for tests, spawn seeds, and procedural coat spots. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Big horses amble, ponies scurry: walking speed shrinks as scale grows.
function speedFor(scale: number): number {
  return 9 / scale
}

// Walk frames advance slower for bigger horses, matching their gait.
export function walkFrameDuration(scale: number): number {
  return 0.13 + 0.07 * scale
}

function randomPoint(bounds: Bounds, rng: () => number): { x: number; y: number } {
  const bottom = bounds.bottomInset ?? bounds.inset
  return {
    x: bounds.inset + rng() * (bounds.width - 2 * bounds.inset),
    y: bounds.top + rng() * (bounds.height - bottom - bounds.top),
  }
}

function clampToBounds(agent: HorseAgent, bounds: Bounds): void {
  const bottom = bounds.bottomInset ?? bounds.inset
  agent.x = Math.min(bounds.width - bounds.inset, Math.max(bounds.inset, agent.x))
  agent.y = Math.min(bounds.height - bottom, Math.max(bounds.top, agent.y))
}

function startWalk(agent: HorseAgent, bounds: Bounds, rng: () => number): void {
  const target = randomPoint(bounds, rng)
  agent.state = 'walk'
  agent.stateT = 0
  agent.stateDur = 0
  agent.target = target
  agent.frame = 0
  if (Math.abs(target.x - agent.x) > 1) agent.facing = target.x > agent.x ? 1 : -1
}

function startRest(agent: HorseAgent, rng: () => number): void {
  const graze = rng() < 0.6
  agent.state = graze ? 'graze' : 'idle'
  agent.stateT = 0
  agent.stateDur = graze ? 3 + rng() * 5 : 1 + rng() * 3
  agent.target = undefined
  agent.frame = 0
}

export function spawn(breeds: Breed[], bounds: Bounds, rng: () => number): HorseAgent[] {
  return breeds.map((breed) => {
    const point = randomPoint(bounds, rng)
    const agent: HorseAgent = {
      breedId: breed.id,
      x: point.x,
      y: point.y,
      facing: rng() < 0.5 ? -1 : 1,
      state: 'idle',
      stateT: 0,
      stateDur: 0,
      frame: 0,
      scale: scaleFor(breed.heightHands),
    }
    if (rng() < 0.5) {
      startWalk(agent, bounds, rng)
    } else {
      startRest(agent, rng)
    }
    return agent
  })
}

export function tick(
  agents: HorseAgent[],
  dt: number,
  bounds: Bounds,
  rng: () => number,
): HorseAgent[] {
  return agents.map((prev) => {
    const agent: HorseAgent = { ...prev, stateT: prev.stateT + dt }

    if (agent.state === 'walk' && agent.target) {
      const dx = agent.target.x - agent.x
      const dy = agent.target.y - agent.y
      const dist = Math.hypot(dx, dy)
      const step = speedFor(agent.scale) * dt
      if (dist <= Math.max(step, 0.75)) {
        agent.x = agent.target.x
        agent.y = agent.target.y
        startRest(agent, rng)
      } else {
        agent.x += (dx / dist) * step
        agent.y += (dy / dist) * step
        if (Math.abs(dx) > 0.5) agent.facing = dx > 0 ? 1 : -1
        agent.frame = Math.floor(agent.stateT / walkFrameDuration(agent.scale)) % 4
      }
    } else if (agent.stateT >= agent.stateDur) {
      startWalk(agent, bounds, rng)
    }

    clampToBounds(agent, bounds)
    return agent
  })
}
