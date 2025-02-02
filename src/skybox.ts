import { CubeTextureLoader } from 'three';
import { renderer } from './state';
import { pixelate } from './utils';

export class Skybox {
  constructor() {
    const loader = new CubeTextureLoader();
    const skyBox = loader.load(
      Array.from(
        { length: 6 },
        (_: unknown, index: number) => `skybox/skybox-${index + 1}.webp`
      )
    );

    pixelate(skyBox);
    renderer.scene.background = skyBox;
  }
}
