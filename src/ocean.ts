import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Texture
} from 'three';
import { Level } from './level';
import { meshProps, renderer } from './state';

export class Ocean extends Mesh {
  constructor(texture: Texture) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(Level.cols / 4, Level.rows / 4); // Powtarzanie 5x5

    // Stworzenie płaskiej powierzchni (siatki)
    const geometry = new PlaneGeometry(Level.cols, Level.rows); // 10x10 jednostek
    const material = new MeshBasicMaterial({
      ...meshProps,
      map: texture,
      opacity: 0.7
    });

    super(geometry, material);

    this.position.set(Level.cols / 2, Level.rows / 2, 0);
    this.renderOrder = 1;

    renderer.scene.add(this);
  }
}
