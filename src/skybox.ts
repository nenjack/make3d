import * as THREE from 'three';
import { loader as loadingManager, renderer } from './state';
import { mapCubeTextures, pixelate } from './utils';

export class Skybox {
  constructor() {
    const loader = new THREE.CubeTextureLoader(loadingManager);
    const textures = mapCubeTextures({
      left: 'skybox/left.webp',
      right: 'skybox/right.webp',
      up: 'skybox/up.webp',
      down: 'skybox/down.webp',
      front: 'skybox/front.webp',
      back: 'skybox/back.webp'
    });

    const skyBox = loader.load(textures, () => {
      pixelate(skyBox);
      renderer.scene.background = skyBox;
    });
  }
}
