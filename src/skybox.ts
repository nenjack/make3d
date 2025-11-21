import * as THREE from 'three'
import { loader as loadingManager, state } from './state'
import { mapCubeTextures, pixelate } from './utils'
import { CubeDirections } from './model'

/**
 * {
 *   up: 'skybox/posz.webp',
 *   down: 'skybox/negz.webp',
 *   left: 'skybox/negx.webp',
 *   right: 'skybox/posx.webp',
 *   front: 'skybox/posy.webp',
 *   back: 'skybox/negy.webp'
 * }
 */
export type SkyboxProps<T = string> = Record<CubeDirections, T>

export class Skybox {
  constructor(
    textures: SkyboxProps = {
      up: 'skybox/posz.webp',
      down: 'skybox/negz.webp',
      left: 'skybox/negx.webp',
      right: 'skybox/posx.webp',
      front: 'skybox/posy.webp',
      back: 'skybox/negy.webp'
    }
  ) {
    const loader = new THREE.CubeTextureLoader(loadingManager)
    const skyboxTextures = mapCubeTextures(textures)
    const skyBox = loader.load(skyboxTextures, () => {
      pixelate(skyBox)
      state.renderer.scene.background = skyBox
    })
  }
}
