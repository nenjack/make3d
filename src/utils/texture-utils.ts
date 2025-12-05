import {
  FrontSide,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  NearestFilter,
  NearestMipMapLinearFilter,
  Texture
} from 'three'
import { Loader } from '../loader'
import { CubeDirections } from '../model'

export class TextureUtils {
  static readonly loader = new Loader()
  static readonly textures: Record<string, Texture> = {}
  static readonly materials: Record<string, MeshBasicMaterial> = {}

  static readonly PROPS: MeshBasicMaterialParameters = {
    side: FrontSide
  }

  static readonly ALPHA_PROPS: MeshBasicMaterialParameters = {
    ...TextureUtils.PROPS,
    transparent: true,
    alphaTest: 1
  }

  static hasTexture(textureName: string) {
    return !!TextureUtils.textures[textureName]
  }

  static async load(texturePaths: string[]) {
    const promises = texturePaths.map((tex) => TextureUtils.loader.load(tex))
    const resolved = await Promise.all(promises)

    texturePaths.forEach((texturePath, index) => {
      const textureName = TextureUtils.getName(texturePath)
      const texture = resolved[index]

      TextureUtils.pixelate(texture)
      TextureUtils.textures[textureName] = texture
    })

    return resolved
  }

  static createMaterial(map: Texture, props = TextureUtils.ALPHA_PROPS) {
    return new MeshBasicMaterial({
      ...props,
      map
    })
  }

  static getMaterial(textureName: string, cols = 1, rows = 1) {
    const texture = TextureUtils.textures[textureName]

    if (cols === 1 && rows === 1) {
      if (!TextureUtils.materials[textureName]) {
        TextureUtils.materials[textureName] =
          TextureUtils.createMaterial(texture)
      }

      return TextureUtils.materials[textureName]
    } else {
      const map = texture.clone()
      map.repeat.set(1 / cols, 1 / rows)

      return TextureUtils.createMaterial(map)
    }
  }

  static getName(texturePath: string) {
    const fileName = texturePath.split('/').pop()?.split('.')[0]
    if (!fileName) {
      return ''
    }

    return fileName
      .split(/[-_]+/)
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('')
  }

  static pixelate(texture: Texture) {
    texture.anisotropy = 1
    texture.unpackAlignment = 1
    texture.matrixAutoUpdate = false
    texture.magFilter = NearestFilter
    texture.minFilter = NearestMipMapLinearFilter
  }

  static mapToCube<T = Texture>({
    left,
    right,
    up,
    down,
    front,
    back
  }: Record<CubeDirections, T>): T[] {
    return [left, right, up, down, front, back]
  }
}
