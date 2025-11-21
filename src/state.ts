import { groupBits, System } from 'check2d'
import { FrontSide, Texture } from 'three'
import { DeviceDetector } from './detect'
import { Loader } from './loader'
import { Direction, GameState, Key } from './model'
import { Mouse } from './mouse'
import { queryParams } from './query-params'

export const minLevelHeight = 2

export const maxLevelHeight =
  'height' in queryParams ? Number(queryParams.height) : 10

export const waterZ = 0.5

export const doubleClickTime = 400

export const keys: Partial<Record<Key, boolean>> = {}

export const loadedTextures: Record<string, Texture> = {}

export const mouse = new Mouse()

export const physics = new System()

export const loader = new Loader()

export const floors = Array.from(
  { length: maxLevelHeight },
  (_: unknown, power) => groupBits(128 * Math.pow(2, power))
)

export const state: GameState = {
  keys,
  mouse,
  started: false,
  renderer: null as any,
  player: null as any,
  npcs: []
}

export const materialProps = {
  side: FrontSide
}

export const alphaMaterialProps = {
  ...materialProps,
  transparent: true,
  alphaTest: 1
}

export const directions: Direction[] = ['up', 'right', 'down', 'left']

export const Math_Half_PI = Math.PI * 0.5

export const Math_Double_PI = Math.PI * 2

export const defaultEnemiesCount =
  'limit' in queryParams
    ? Number(queryParams.limit)
    : DeviceDetector.HIGH_END
      ? 64
      : 16
