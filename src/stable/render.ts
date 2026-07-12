import { coats, type Coat } from './coats'
import { artSize, itemById, type ToyItem } from './items'
import { mulberry32, type HorseAgent, type Treat } from './sim'
import { attachPoints, sprites, type Grid, type SpriteSheet } from './sprites'
import type { PlacedDecoration, ToyBoxState } from './toybox'

// Canvas-facing helpers for the stable view. Everything here degrades
// gracefully when a 2D context is unavailable (jsdom in tests).

export const LOGICAL_W = 320
export const LOGICAL_H = 180

export interface CoatFrames {
  sheet: SpriteSheet
  /** Frame canvases in order: walk 0-3, idle, graze. */
  frames: HTMLCanvasElement[]
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Deterministic blotches for spotted coats: seed pixels over the barrel/rump
// expanded to 3x3 patches, recolored to the marking slot wherever the frame
// has a body pixel. Same positions on every frame, so spots don't crawl.
function spotMask(sheet: SpriteSheet, breedId: string): Set<string> {
  const rng = mulberry32(hashString(breedId))
  const mask = new Set<string>()
  const idle = sheet.idle
  for (let y = 0; y < sheet.height; y++) {
    for (let x = 0; x < Math.floor(sheet.width * 0.62); x++) {
      if (idle[y][x] === 1 && rng() < 0.07) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            mask.add(`${x + dx},${y + dy}`)
          }
        }
      }
    }
  }
  return mask
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function paintFrame(
  frame: Grid,
  coat: Coat,
  sheet: SpriteSheet,
  spots: Set<string> | null,
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = sheet.width
  canvas.height = sheet.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const img = ctx.createImageData(sheet.width, sheet.height)
  for (let y = 0; y < sheet.height; y++) {
    for (let x = 0; x < sheet.width; x++) {
      let slot = frame[y][x]
      if (slot === 0) continue
      if (slot === 1 && spots?.has(`${x},${y}`)) slot = 3
      const [r, g, b] = hexToRgb(coat.palette[slot])
      const i = (y * sheet.width + x) * 4
      img.data[i] = r
      img.data[i + 1] = g
      img.data[i + 2] = b
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Pre-renders every breed's coat onto its sprite frames. Null in test envs without canvas. */
export function buildCoatFrames(breedIds: string[]): Map<string, CoatFrames> | null {
  const map = new Map<string, CoatFrames>()
  for (const breedId of breedIds) {
    const coat = coats[breedId]
    if (!coat) continue
    const sheet = sprites[coat.sprite]
    const spots = coat.spots ? spotMask(sheet, breedId) : null
    const frames: HTMLCanvasElement[] = []
    for (const frame of [...sheet.walk, sheet.idle, sheet.graze]) {
      const painted = paintFrame(frame, coat, sheet, spots)
      if (!painted) return null
      frames.push(painted)
    }
    map.set(breedId, { sheet, frames })
  }
  return map
}

export function frameIndexFor(agent: HorseAgent): number {
  if (agent.state === 'walk') return agent.frame % 4
  return agent.state === 'idle' ? 4 : 5
}

/** Draw rect of an agent in logical pixels: x is bottom-center, y the hoof line. */
export function agentRect(agent: HorseAgent): { x: number; y: number; w: number; h: number } {
  const sheet = sprites[coats[agent.breedId].sprite]
  const w = sheet.width * agent.scale
  const h = sheet.height * agent.scale
  return { x: agent.x - w / 2, y: agent.y - h, w, h }
}

/** Topmost agent (largest y = drawn last) whose sprite box contains the point. */
export function hitTest(agents: HorseAgent[], x: number, y: number): HorseAgent | null {
  const pad = 1
  let best: HorseAgent | null = null
  for (const agent of agents) {
    const r = agentRect(agent)
    const hit =
      x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad
    if (hit && (!best || agent.y >= best.y)) best = agent
  }
  return best
}

export const PADDOCK_TOP = 78

/** Paints the static paddock backdrop once to an offscreen canvas. */
export function buildBackground(): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = LOGICAL_W
  canvas.height = LOGICAL_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const rng = mulberry32(20260712)

  // Sky with a lighter band at the horizon and a few clouds.
  ctx.fillStyle = '#b7dff0'
  ctx.fillRect(0, 0, LOGICAL_W, 52)
  ctx.fillStyle = '#cfeaf6'
  ctx.fillRect(0, 36, LOGICAL_W, 16)
  ctx.fillStyle = '#f4fafd'
  for (const [cx, cy, cw] of [
    [34, 12, 26],
    [130, 20, 34],
    [226, 9, 22],
    [284, 24, 18],
  ]) {
    ctx.fillRect(cx, cy, cw, 4)
    ctx.fillRect(cx + 4, cy - 3, cw - 10, 3)
  }

  // Distant treeline.
  ctx.fillStyle = '#4f8a44'
  ctx.fillRect(0, 46, LOGICAL_W, 6)
  ctx.fillStyle = '#5e9a4e'
  for (let x = 0; x < LOGICAL_W; x += 7) {
    const h = 3 + Math.floor(rng() * 5)
    ctx.fillRect(x, 46 - h, 7, h)
  }

  // Grass with dithered speckles.
  ctx.fillStyle = '#7cb85c'
  ctx.fillRect(0, 52, LOGICAL_W, LOGICAL_H - 52)
  for (let i = 0; i < 700; i++) {
    const x = Math.floor(rng() * LOGICAL_W)
    const y = 52 + Math.floor(rng() * (LOGICAL_H - 52))
    ctx.fillStyle = rng() < 0.5 ? '#6faa50' : '#8ac46b'
    ctx.fillRect(x, y, 1, 1)
  }

  // Fence along the back of the paddock.
  ctx.fillStyle = '#9a7748'
  ctx.fillRect(0, 58, LOGICAL_W, 2)
  ctx.fillRect(0, 66, LOGICAL_W, 2)
  ctx.fillStyle = '#5e4526'
  ctx.fillRect(0, 60, LOGICAL_W, 1)
  ctx.fillRect(0, 68, LOGICAL_W, 1)
  for (let x = 6; x < LOGICAL_W; x += 34) {
    ctx.fillStyle = '#8a6238'
    ctx.fillRect(x, 54, 3, 20)
    ctx.fillStyle = '#5e4526'
    ctx.fillRect(x, 73, 3, 1)
  }

  // Grass tufts and tiny flowers in the paddock itself.
  for (let i = 0; i < 26; i++) {
    const x = 4 + Math.floor(rng() * (LOGICAL_W - 8))
    const y = 82 + Math.floor(rng() * (LOGICAL_H - 92))
    ctx.fillStyle = '#5c9648'
    ctx.fillRect(x, y, 1, 2)
    ctx.fillRect(x + 2, y + 1, 1, 1)
    ctx.fillRect(x - 1, y + 1, 1, 1)
  }
  for (let i = 0; i < 10; i++) {
    const x = 6 + Math.floor(rng() * (LOGICAL_W - 12))
    const y = 84 + Math.floor(rng() * (LOGICAL_H - 96))
    ctx.fillStyle = rng() < 0.5 ? '#f5f2e8' : '#f0d264'
    ctx.fillRect(x, y, 1, 1)
  }

  return canvas
}

/**
 * Draws an item's pixel art with its anchor pixel landing on (x, y),
 * at `scale` logical pixels per art pixel.
 */
export function drawPixelArt(
  ctx: CanvasRenderingContext2D,
  item: ToyItem,
  x: number,
  y: number,
  scale: number,
): void {
  const ox = x - item.anchor.x * scale
  const oy = y - item.anchor.y * scale
  for (let row = 0; row < item.rows.length; row++) {
    const line = item.rows[row]
    for (let col = 0; col < line.length; col++) {
      const color = item.colors[line[col]]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(ox + col * scale, oy + row * scale, scale, scale)
    }
  }
}

/** Bounding rect of a placed decoration (anchor is bottom-center), for removal hit-testing. */
export function decorationRect(deco: PlacedDecoration): {
  x: number
  y: number
  w: number
  h: number
} | null {
  const item = itemById.get(deco.itemId)
  if (!item) return null
  const { w, h } = artSize(item)
  return { x: deco.x - item.anchor.x, y: deco.y - item.anchor.y, w, h }
}

/** Topmost placed decoration under the point, or null. */
export function decorationAt(
  decorations: PlacedDecoration[],
  x: number,
  y: number,
): PlacedDecoration | null {
  for (let i = decorations.length - 1; i >= 0; i--) {
    const rect = decorationRect(decorations[i])
    if (!rect) continue
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      return decorations[i]
    }
  }
  return null
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  itemId: string | undefined,
  agent: HorseAgent,
  spriteX: number,
  spriteY: number,
): void {
  if (!itemId) return
  const item = itemById.get(itemId)
  if (!item) return
  const points = attachPoints[coats[agent.breedId].sprite]
  const attach =
    item.kind === 'saddle'
      ? points.saddle
      : agent.state === 'graze'
        ? points.hatDown
        : points.hatUp
  drawPixelArt(
    ctx,
    item,
    spriteX + attach.x * agent.scale + agent.scale / 2,
    spriteY + attach.y * agent.scale,
    agent.scale,
  )
}

export interface Scene {
  agents: HorseAgent[]
  treats: Treat[]
  decorations: PlacedDecoration[]
  equipped: ToyBoxState['equipped']
}

/** Draws one full scene frame: backdrop, then decorations/treats/agents y-sorted. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  background: HTMLCanvasElement | null,
  coatFrames: Map<string, CoatFrames>,
  scene: Scene,
): void {
  ctx.imageSmoothingEnabled = false
  if (background) {
    ctx.drawImage(background, 0, 0)
  } else {
    ctx.fillStyle = '#7cb85c'
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)
  }

  type Drawable = { y: number; draw: () => void }
  const drawables: Drawable[] = []

  for (const deco of scene.decorations) {
    const item = itemById.get(deco.itemId)
    if (!item) continue
    drawables.push({ y: deco.y, draw: () => drawPixelArt(ctx, item, deco.x, deco.y, 1) })
  }

  for (const treat of scene.treats) {
    const item = itemById.get(treat.itemId)
    if (!item) continue
    // Treats shrink as they're eaten.
    const scale = 0.55 + 0.45 * Math.max(0, Math.min(1, treat.bites / treat.maxBites))
    drawables.push({ y: treat.y, draw: () => drawPixelArt(ctx, item, treat.x, treat.y, scale) })
  }

  for (const agent of scene.agents) {
    const coat = coatFrames.get(agent.breedId)
    if (!coat) continue
    drawables.push({
      y: agent.y,
      draw: () => {
        const rect = agentRect(agent)
        const worn = scene.equipped[agent.breedId]

        ctx.fillStyle = 'rgba(30, 50, 20, 0.18)'
        ctx.beginPath()
        ctx.ellipse(
          agent.x,
          agent.y - 0.5,
          rect.w * 0.32,
          Math.max(1.5, rect.h * 0.08),
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        const frame = coat.frames[frameIndexFor(agent)]
        if (agent.facing === -1) {
          ctx.save()
          ctx.translate(agent.x, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(frame, -rect.w / 2, rect.y, rect.w, rect.h)
          drawAccessory(ctx, worn?.saddle, agent, -rect.w / 2, rect.y)
          drawAccessory(ctx, worn?.hat, agent, -rect.w / 2, rect.y)
          ctx.restore()
        } else {
          ctx.drawImage(frame, rect.x, rect.y, rect.w, rect.h)
          drawAccessory(ctx, worn?.saddle, agent, rect.x, rect.y)
          drawAccessory(ctx, worn?.hat, agent, rect.x, rect.y)
        }
      },
    })
  }

  drawables.sort((a, b) => a.y - b.y)
  for (const drawable of drawables) drawable.draw()
}
