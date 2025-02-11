import { PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { cos, sin } from './fast-math';
import { Level } from './level';
import { Player } from './player';
import { renderer } from './state';
import { ViewLevel } from './view-level';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.3;
  static readonly height = 2 / 3;
  static readonly lerpRatio = 0.003;

  static fov = 95;
  static near = 0.05;
  static far = 16;

  ref?: Player;

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far);

    this.up = new Vector3(0, 1, 0);
  }

  ready({ level, ref }: { level: ViewLevel; ref: Player }) {
    this.setLevel(level);
    this.setRef(ref);
    this.onCameraUpdate();
    renderer.animations.push((ms: number) => {
      renderer.camera.onCameraUpdate(ms * Camera.lerpRatio);
    });
  }

  getFloor(_x: number, _y: number) {
    return 0;
  }

  setLevel(level: Level) {
    this.getFloor = (x, y) => level.getFloor(x, y);
  }

  setRef(ref: Player) {
    this.ref = ref;
  }

  onCameraUpdate(lerp = 0) {
    if (!this.ref) return;

    const gear = this.ref.gear || 1;
    const scale = (Camera.distance * gear) / this.aspect;
    const angle = -this.ref.body.angle + Math.PI / 2;
    const offsetX = sin(angle) * scale;
    const offsetY = cos(angle) * scale;
    const cameraX = this.ref.body.x - offsetX;
    const cameraY = this.ref.body.y - offsetY;
    const cameraHeight = this.getFloor(cameraX, cameraY);
    const cameraZ = Camera.height + Math.max(cameraHeight / 2, this.ref.z);

    const { position: lookAt, quaternion: targetQuaterion } = this.ref.mesh;
    const targetPosition = new Vector3(cameraX, cameraZ, cameraY);

    if (lerp) {
      this.position.lerp(targetPosition, lerp);
      this.rotation.setFromQuaternion(
        new Quaternion()
          .setFromEuler(this.rotation)
          .slerp(targetQuaterion, lerp)
      );
    } else {
      this.position.copy(targetPosition);
      this.rotation.setFromQuaternion(targetQuaterion);
    }

    this.lookAt(new Vector3(0, 0.25, 0).add(lookAt));
  }
}
