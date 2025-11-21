import { Texture } from 'three'
import { bushProps } from './bush'
import { Ocean } from './ocean'
import { Skybox, SkyboxProps } from './skybox'
import { treeProps } from './tree'
import { loadTextures, mapCubeTextures } from './utils'
import { ViewLevel } from './view-level'

export type CubeLevelTextures = 'floor' | 'sides' | 'ocean'

export interface CubeLevelProps<T = string>
  extends Record<CubeLevelTextures, T> {
  skybox?: SkyboxProps
}

export class CubeLevel extends ViewLevel {
  static readonly SIDES = 'sides.webp'
  static readonly FLOOR = 'floor.webp'
  static readonly OCEAN = 'ocean.webp'

  static async create(
    canvas: HTMLCanvasElement,
    skybox: SkyboxProps
  ): Promise<CubeLevel> {
    const [sides, floor, ocean] = await loadTextures([
      'sides.webp',
      'floor.webp',
      'ocean.webp',
      `${treeProps.textureName}.webp`,
      `${bushProps.textureName}.webp`
    ])
    return new CubeLevel(canvas, { sides, floor, ocean, skybox })
  }

  constructor(
    canvas: HTMLCanvasElement,
    { sides, floor, ocean, skybox }: CubeLevelProps<Texture>
  ) {
    super({
      ocean: ocean ? () => new Ocean(ocean) : undefined,
      skybox: skybox ? () => skybox && new Skybox(skybox) : undefined,
      canvas,
      textures: mapCubeTextures({
        up: floor,
        down: floor,
        left: sides,
        right: sides,
        front: sides,
        back: sides
      })
    })
  }
}
