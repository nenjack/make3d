import { type Mouse } from './core/mouse'
import { type Renderer } from './core/renderer'
import { type Level } from './level'
import { type NPC } from './view/npc'
import { type Player } from './view/player'

export type Direction = 'down' | 'right' | 'up' | 'left'

export type DirectionsToRows = Partial<Record<Direction | 'default', number>>

export type Key = Direction | 'space'

export type CubeDirections = Direction | 'front' | 'back'

export interface State extends Record<string, any> {
  keys: Record<string, boolean>
  mouse: Mouse
  mouseDown?: boolean
}

export interface GameState extends State {
  started: boolean
  renderer: Renderer
  player: Player
  npcs: NPC[]
}

export interface BillboardProps {
  textureName: string
  level: Level
  x?: number
  y?: number
  cols?: number
  rows?: number
  totalFrames?: number
  frameDuration?: number
  directionsToRows?: DirectionsToRows
  scale?: number
  scaleX?: number
  scaleY?: number
}

export interface BaseBody {
  x: number
  y: number
  group: number
  angle: number
  setPosition: (x: number, y: number) => void
}
