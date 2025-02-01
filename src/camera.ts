import { PerspectiveCamera, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';

export class Camera extends PerspectiveCamera {
  static readonly distance = 2;
  static fov = 90;
  static near = 0.1;
  static far = 100;

  targetX = 0;
  targetY = 0;
  level?: Level;
  player?: Player;

  get idle() {
    return !this.level || !this.player;
  }

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far);
  }

  setLevel(level: Level) {
    this.level = level;
  }

  setPlayer(player: Player) {
    this.player = player;
    this.updatePosition(this.player.body.x, this.player.body.y);
  }

  getPosition(targetX?: number, targetY?: number) {
    if (typeof targetX !== 'undefined' && typeof targetY !== 'undefined') {
      this.targetX = targetX;
      this.targetY = targetY;
    }

    const playerFloor = this.player ? 2 * this.player.mesh.position.z : 0;
    const levelFloor = this.level
      ? this.level.getFloor(this.targetX, this.targetY)
      : 0;

    return new Vector3(
      this.targetX,
      this.targetY,
      1 + Math.max(playerFloor, levelFloor) / 2
    );
  }

  updatePosition(targetX?: number, targetY?: number) {
    const { x, y, z } = this.getPosition(targetX, targetY);

    this.position.set(x, y, z);
    this.lookAt(this.targetX, this.targetY, 0);
    this.up = new Vector3(0, 0, 1);
  }
}
