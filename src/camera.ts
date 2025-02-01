import { PerspectiveCamera, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';

export class Camera extends PerspectiveCamera {
  static readonly distance = 2;

  levelSize: number;
  targetX!: number;
  targetY!: number;
  level?: Level;
  player?: Player;

  constructor(levelSize = 32, fov = 60) {
    super(fov, innerWidth / innerHeight, 0.2, levelSize * 1.33);

    this.levelSize = levelSize;
    this.updatePosition();
  }

  setLevel(level: Level) {
    this.level = level;
  }

  setPlayer(player: Player) {
    this.player = player;
  }

  getPosition(targetX = this.levelSize / 2, targetY = this.levelSize / 2) {
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

  updatePosition(targetX = this.targetX, targetY = this.targetY) {
    const { x, y, z } = this.getPosition(targetX, targetY);

    this.position.set(x, y, z);
    this.lookAt(this.targetX, this.targetY, 0);
    this.up = new Vector3(0, 0, 1);
  }
}
