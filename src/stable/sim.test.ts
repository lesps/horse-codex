import { describe, expect, it } from 'vitest'
import { breeds } from '../data/breeds'
import { mulberry32, spawn, tick, type Bounds, type HorseAgent } from './sim'

const bounds: Bounds = { width: 320, height: 180, top: 78, inset: 10 }

function inBounds(agent: HorseAgent): boolean {
  return (
    agent.x >= bounds.inset &&
    agent.x <= bounds.width - bounds.inset &&
    agent.y >= bounds.top &&
    agent.y <= bounds.height - bounds.inset
  )
}

describe('spawn', () => {
  it('places one agent per breed, inside the paddock, with valid state', () => {
    const agents = spawn(breeds, bounds, mulberry32(42))
    expect(agents).toHaveLength(breeds.length)
    const breedIds = new Set(breeds.map((b) => b.id))
    for (const agent of agents) {
      expect(breedIds.has(agent.breedId)).toBe(true)
      expect(inBounds(agent)).toBe(true)
      expect(['walk', 'idle', 'graze']).toContain(agent.state)
      if (agent.state === 'walk') expect(agent.target).toBeDefined()
      expect(agent.scale).toBeGreaterThan(0)
    }
  })

  it('is deterministic under a fixed seed', () => {
    expect(spawn(breeds, bounds, mulberry32(7))).toEqual(spawn(breeds, bounds, mulberry32(7)))
  })
})

describe('tick', () => {
  it('never moves an agent outside the paddock inset', () => {
    let agents = spawn(breeds, bounds, mulberry32(1))
    const rng = mulberry32(2)
    for (let i = 0; i < 2000; i++) {
      agents = tick(agents, 0.05, bounds, rng)
      for (const agent of agents) {
        expect(inBounds(agent)).toBe(true)
      }
    }
  })

  it('moves walking agents toward their target', () => {
    const agent: HorseAgent = {
      breedId: 'arabian',
      x: 50,
      y: 100,
      facing: -1,
      state: 'walk',
      stateT: 0,
      stateDur: 0,
      target: { x: 200, y: 140 },
      frame: 0,
      scale: 1,
    }
    const before = Math.hypot(200 - agent.x, 140 - agent.y)
    const [moved] = tick([agent], 0.1, bounds, mulberry32(3))
    const after = Math.hypot(200 - moved.x, 140 - moved.y)
    expect(after).toBeLessThan(before)
    expect(moved.facing).toBe(1)
    expect(moved.state).toBe('walk')
  })

  it('transitions walk -> graze/idle on arrival, then back to walk when the rest is over', () => {
    const agent: HorseAgent = {
      breedId: 'shetland',
      x: 100,
      y: 100,
      facing: 1,
      state: 'walk',
      stateT: 0,
      stateDur: 0,
      target: { x: 100.2, y: 100 },
      frame: 2,
      scale: 0.65,
    }
    const [arrived] = tick([agent], 0.1, bounds, mulberry32(4))
    expect(['graze', 'idle']).toContain(arrived.state)
    expect(arrived.target).toBeUndefined()
    expect(arrived.frame).toBe(0)
    expect(arrived.stateDur).toBeGreaterThan(0)

    const [resting] = tick([arrived], arrived.stateDur - 0.01, bounds, mulberry32(5))
    expect(resting.state).toBe(arrived.state)
    const [walking] = tick([resting], 1, bounds, mulberry32(6))
    expect(walking.state).toBe('walk')
    expect(walking.target).toBeDefined()
  })

  it('is fully deterministic: same seed and dt sequence give identical states', () => {
    const run = () => {
      let agents = spawn(breeds, bounds, mulberry32(99))
      const rng = mulberry32(100)
      for (let i = 0; i < 500; i++) {
        agents = tick(agents, i % 2 === 0 ? 0.016 : 0.033, bounds, rng)
      }
      return agents
    }
    expect(run()).toEqual(run())
  })

  it('advances walk frames over time', () => {
    const agent: HorseAgent = {
      breedId: 'mustang',
      x: 20,
      y: 100,
      facing: 1,
      state: 'walk',
      stateT: 0,
      stateDur: 0,
      target: { x: 300, y: 100 },
      frame: 0,
      scale: 1,
    }
    let agents = [agent]
    const rng = mulberry32(8)
    const seen = new Set<number>()
    for (let i = 0; i < 60; i++) {
      agents = tick(agents, 0.05, bounds, rng)
      seen.add(agents[0].frame)
    }
    expect(seen.size).toBeGreaterThan(1)
  })
})
