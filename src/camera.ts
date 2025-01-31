import { PerspectiveCamera, Vector3 } from 'three';

export class Camera extends PerspectiveCamera {
  distance: number;
  levelSize: number;
  targetX!: number;
  targetY!: number;

  constructor(levelSize = 32) {
    super(70, innerWidth / innerHeight, 0.2, levelSize * 1.33);

    this.levelSize = levelSize;
    this.setDistance();
    this.setPosition();
  }

  getPosition(targetX = this.levelSize / 2, targetY = this.levelSize / 2) {
    if (typeof targetX !== 'undefined' && typeof targetY !== 'undefined') {
      this.targetX = targetX;
      this.targetY = targetY;
    }

    return new Vector3(
      Math.max(1, Math.min(this.levelSize - 2, this.targetX)),
      Math.max(1, Math.min(this.levelSize - 2, this.targetY)),
      (this.distance + 1) / 2
    );
  }

  setDistance(distance = innerHeight / 300) {
    this.distance = distance;
  }

  setPosition(targetX = this.targetX, targetY = this.targetY) {
    const { x, y, z } = this.getPosition(targetX, targetY);

    this.position.set(x, y, z);
    this.lookAt(this.targetX, this.targetY, 0);
    this.up = new Vector3(0, 0, 1);
  }
}
