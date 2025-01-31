import { PerspectiveCamera, Vector3 } from 'three';

export class Camera extends PerspectiveCamera {
  distance: number;

  constructor(levelSize = 32, distance = 3) {
    super(70, innerWidth / innerHeight, 0.2, levelSize * 1.33);

    this.distance = distance;
    this.position.set(
      levelSize / 2,
      levelSize / 2 - distance,
      0.5 + distance * 0.67
    );

    this.lookAt(levelSize / 2, levelSize / 2, 0);
    this.up = new Vector3(0, 0, 1);
  }
}
