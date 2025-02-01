import { PerspectiveCamera, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1;
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
    this.updatePosition(
      this.player.state.direction,
      this.player.body.x,
      this.player.body.y
    );
  }

  getFloor() {
    const playerFloor = this.player ? 2 * this.player.mesh.position.z : 0;

    return playerFloor < 0
      ? playerFloor
      : Math.max(
          playerFloor,
          this.level?.getFloor(this.position.x, this.position.y) || -Infinity
        );
  }

  updatePosition(
    direction: number,
    targetX?: number,
    targetY?: number,
    lerp = 0
  ) {
    if (typeof targetX !== 'undefined' && typeof targetY !== 'undefined') {
      this.targetX = targetX;
      this.targetY = targetY;
    }

    const scale = 1 / this.aspect;
    const offsetX = Math.sin(-direction) * scale;
    const offsetY = Math.cos(-direction) * scale;
    const x = this.targetX - offsetX;
    const y = this.targetY - offsetY;
    const z = 1 + this.getFloor() / 2;

    if (lerp) {
      this.position.lerp(new Vector3(x, y, z), lerp);
    } else {
      this.position.set(x, y, z);
    }

    this.lookAt(this.targetX, this.targetY, this.position.z - 0.5);
    this.up = new Vector3(0, 0, 1);
  }
}
