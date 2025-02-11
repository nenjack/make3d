import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';
import { renderer } from './state';
import { ViewLevel } from './view-level';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.4;
  static readonly height = 0.8;
  static readonly lerpRatio = 0.003;

  protected static targetVector = new Vector3();
  protected static lookAtVector = new Vector3();
  protected static tempQuaternion = new Quaternion();
  protected static tempEuler = new Euler();

  static fov = 90;
  static near = 0.01;
  static far = 32;

  ref?: Player;

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far);

    this.up = new Vector3(0, 1, 0);
  }

  ready({ level, ref }: { level: ViewLevel; ref: Player }) {
    this.setLevel(level);
    this.setRef(ref);
    this.update();

    renderer.animations.push((ms: number) => {
      this.update(ms * Camera.lerpRatio);
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

  update(ms = 0) {
    if (!this.ref) return;

    const { body, z, mesh } = this.ref;

    // Przechowujemy wartości, żeby nie obliczać ich co klatkę
    const scale = Camera.distance / this.aspect;
    const angle = -body.angle + Math.PI / 2;
    const offsetX = Math.sin(angle) * scale;
    const offsetY = Math.cos(angle) * scale;
    const cameraX = body.x - offsetX;
    const cameraY = body.y - offsetY;
    const cameraHeight = this.getFloor(cameraX, cameraY);
    const cameraZ = Camera.height + Math.max(cameraHeight / 2, z);

    const targetPosition = Camera.targetVector.set(cameraX, cameraZ, cameraY);
    const lookAtPosition = Camera.lookAtVector
      .set(0, 0.25, 0)
      .add(mesh.position);

    Camera.tempEuler.copy(this.rotation);

    if (ms) {
      this.position.lerp(targetPosition, ms);

      Camera.tempQuaternion.setFromEuler(Camera.tempEuler);
      Camera.tempQuaternion.slerp(mesh.quaternion, ms);

      this.rotation.setFromQuaternion(Camera.tempQuaternion);
    } else {
      this.position.copy(targetPosition);
      this.rotation.copy(Camera.tempEuler);
    }

    this.lookAt(lookAtPosition);
  }
}
