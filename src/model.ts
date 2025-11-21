import { type Mouse } from './mouse'
import { type NPC } from './npc'
import { type Player } from './player'
import { type Renderer } from './renderer'

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
  cols?: number
  rows?: number
  totalFrames?: number
  frameDuration?: number
  directionsToRows?: DirectionsToRows
  scale?: number
  scaleX?: number
  scaleY?: number
}
