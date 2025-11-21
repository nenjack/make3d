import { Texture } from 'three'
import { Ocean } from './ocean'
import { Skybox, SkyboxProps } from './skybox'
import { loadTextures, mapCubeTextures } from './utils'
import { ViewLevel } from './view-level'

export type CubeLevelTextures = 'floor' | 'sides' | 'ocean'

export interface CubeLevelProps<TTextures = string, TSkybox = TTextures>
  extends Record<CubeLevelTextures, TTextures> {
  skybox?: SkyboxProps<TSkybox>
}

export class CubeLevel extends ViewLevel {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CubeLevelProps} props
   * @returns {Promise<CubeLevel>}
   */
  static async create(
    canvas: HTMLCanvasElement,
    { skybox, ...props }: CubeLevelProps = {
      sides: 'sides.webp',
      floor: 'floor.webp',
      ocean: 'ocean.webp'
    }
  ) {
    const textures: string[] = [props.sides, props.floor, props.ocean]
    const [sides, floor, ocean] = await loadTextures(textures)
    return new CubeLevel(canvas, { sides, floor, ocean, skybox })
  }

  constructor(
    canvas: HTMLCanvasElement,
    { floor, sides, ocean, skybox }: CubeLevelProps<Texture, string>
  ) {
    super(
      mapCubeTextures({
        up: floor,
        down: floor,
        left: sides,
        right: sides,
        front: sides,
        back: sides
      }),
      {
        ocean: () => new Ocean(ocean),
        skybox: () => new Skybox(skybox),
        canvas
      }
    )
  }
}
