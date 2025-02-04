import * as THREE from 'three';
import { renderer } from './state';

export class Skybox {
  constructor() {
    // Ładowanie cubemap z poprawioną orientacją
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      'skybox/posz.webp', // right 
      'skybox/negz.webp', // left 
      'skybox/negx.webp', // back
      'skybox/negy.webp', // down
      'skybox/posx.webp', // front
      'skybox/posy.webp'  // up
    ]);

    // Ustawienie skyboxa jako tła sceny
    renderer.scene.background = texture;
  }
}
