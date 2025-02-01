import { PerspectiveCamera, Vector3 } from 'three';
import { Level } from './level';
import { state } from './state';
import { Player } from './player';

export class Camera extends PerspectiveCamera {
  distance: number;
  levelSize: number;
  targetX!: number;
  targetY!: number;
  level?: Level;
  player?: Player;

  constructor(levelSize = 32) {
    super(70, innerWidth / innerHeight, 0.2, levelSize * 1.33);

    this.levelSize = levelSize;
    this.updateDistance();
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

    const player = this.player ? this.player.mesh.position.z : 0;
    const level = this.level
      ? this.level.getFloor(this.targetX, this.targetY) / 2
      : 0;

    return new Vector3(
      Math.max(1, Math.min(this.levelSize - 2, this.targetX)),
      Math.max(1, Math.min(this.levelSize - 2, this.targetY)),
      1 / this.distance + Math.max(player, level)
    );
  }

  updateDistance() {
    this.distance = innerHeight / innerWidth;
  }

  updatePosition(targetX = this.targetX, targetY = this.targetY) {
    const { x, y, z } = this.getPosition(targetX, targetY);

    this.position.set(x, y, z);
    this.lookAt(this.targetX, this.targetY, 0);
    this.up = new Vector3(0, 0, 1);
  }
}
