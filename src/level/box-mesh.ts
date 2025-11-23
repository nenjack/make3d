import { BoxGeometry, InstancedMesh, MeshBasicMaterial, Texture } from 'three'
import { materialProps } from '../state'

export class BoxMesh extends InstancedMesh {
  constructor(textures: Texture[], cols: number, rows = cols) {
    const geometry = new BoxGeometry(1, 1, 1)
    const materials = textures.map(
      (texture) =>
        new MeshBasicMaterial({
          ...materialProps,
          map: texture
        })
    )

    super(geometry, materials, cols * rows)
    this.renderOrder = 0
  }
}
