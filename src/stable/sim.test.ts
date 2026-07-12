import { describe, expect, it } from 'vitest'
import { breeds } from '../data/breeds'
import {
  mulberry32,
  spawn,
  tick,
  tickWorld,
  type Bounds,
  type HorseAgent,
  type Treat,
  type World,
} from './sim'

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

describe('tickWorld: treats', () => {
  function makeAgent(overrides: Partial<HorseAgent> = {}): HorseAgent {
    return {
      breedId: 'arabian',
      x: 100,
      y: 120,
      facing: -1,
      state: 'idle',
      stateT: 0,
      stateDur: 60,
      frame: 0,
      scale: 1,
      ...overrides,
    }
  }

  function makeTreat(overrides: Partial<Treat> = {}): Treat {
    return { id: 't1', itemId: 'hay-bale', x: 150, y: 120, bites: 10, maxBites: 10, ...overrides }
  }

  it('attracts a nearby idle horse, which walks over and starts munching', () => {
    let world: World = { agents: [makeAgent()], treats: [makeTreat()] }
    const rng = mulberry32(21)

    world = tickWorld(world, 0.05, bounds, rng)
    expect(world.agents[0].treatId).toBe('t1')
    expect(world.agents[0].state).toBe('walk')
    expect(world.agents[0].facing).toBe(1)

    for (let i = 0; i < 400 && world.agents[0].state !== 'graze'; i++) {
      world = tickWorld(world, 0.05, bounds, rng)
    }
    expect(world.agents[0].state).toBe('graze')
    expect(Math.hypot(world.agents[0].x - 150, world.agents[0].y - 120)).toBeLessThan(15)
  })

  it('ignores treats beyond the attraction radius', () => {
    const world: World = {
      agents: [makeAgent({ x: 30, y: 170 })],
      treats: [makeTreat({ x: 290, y: 80 })],
    }
    const next = tickWorld(world, 0.05, bounds, mulberry32(22))
    expect(next.agents[0].treatId).toBeUndefined()
  })

  it('eating consumes the treat until it disappears, then the horse moves on', () => {
    let world: World = {
      agents: [makeAgent({ x: 150, y: 122, state: 'graze', treatId: 't1', stateDur: 1 })],
      treats: [makeTreat({ bites: 0.5, maxBites: 10 })],
    }
    const rng = mulberry32(23)

    world = tickWorld(world, 0.3, bounds, rng)
    expect(world.treats[0].bites).toBeCloseTo(0.2)

    world = tickWorld(world, 0.3, bounds, rng)
    expect(world.treats).toHaveLength(0)

    let cleared = tickWorld(world, 0.05, bounds, rng)
    expect(cleared.agents[0].treatId).toBeUndefined()
    for (let i = 0; i < 40 && cleared.agents[0].state === 'graze'; i++) {
      cleared = tickWorld(cleared, 0.05, bounds, rng)
    }
    expect(cleared.agents[0].state).toBe('walk')
  })

  it('shares one treat between several eaters and stays deterministic', () => {
    const run = () => {
      let world: World = {
        agents: [
          makeAgent({ x: 120, y: 110 }),
          makeAgent({ breedId: 'welsh', x: 180, y: 130, scale: 0.9 }),
          makeAgent({ breedId: 'shire', x: 150, y: 150, scale: 1.45 }),
        ],
        treats: [makeTreat()],
      }
      const rng = mulberry32(24)
      for (let i = 0; i < 800; i++) {
        world = tickWorld(world, 0.05, bounds, rng)
      }
      return world
    }
    const a = run()
    expect(a.treats).toHaveLength(0)
    expect(a).toEqual(run())
  })

  it('keeps every agent inside bounds while chasing treats', () => {
    let world: World = {
      agents: spawn(breeds, bounds, mulberry32(25)),
      treats: [makeTreat({ x: 25, y: 80 }), makeTreat({ id: 't2', x: 295, y: 170 })],
    }
    const rng = mulberry32(26)
    for (let i = 0; i < 600; i++) {
      world = tickWorld(world, 0.05, bounds, rng)
      for (const agent of world.agents) {
        expect(inBounds(agent)).toBe(true)
      }
    }
  })
})
