import { BoxGeometry, InstancedMesh, MeshBasicMaterial, Texture } from 'three';
import { meshProps } from './state';

export class Box extends InstancedMesh {
  constructor(textures: Texture[], cols: number, rows = cols) {
    const geometry = new BoxGeometry(1, 1, 1);
    const materials = textures.map(
      (texture) =>
        new MeshBasicMaterial({
          ...meshProps,
          map: texture
        })
    );

    super(geometry, materials, cols * rows);
  }
}
