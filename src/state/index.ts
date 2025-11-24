import { groupBits, System } from 'check2d'
import { FrontSide, Texture } from 'three'
import { Mouse } from '../core/mouse'
import { Loader } from '../loader'
import { AppState, Direction, Key } from '../model'
import { DeviceDetector } from '../utils/detect-mobile'
import { queryParams } from '../utils/query-params'

export const minLevelHeight = DeviceDetector.HIGH_END ? 2 : 1

export const maxLevelHeight =
  'height' in queryParams ? Number(queryParams.height) : 8

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

export const state: AppState = {
  keys,
  mouse,
  renderer: null,
  player: null,
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

export const defaultNPCsCount =
  'limit' in queryParams
    ? Number(queryParams.limit)
    : DeviceDetector.HIGH_END
      ? 64
      : 24
