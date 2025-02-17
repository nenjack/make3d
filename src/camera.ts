import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';
import { Math_Half_PI } from './state';
import { ViewLevel } from './view-level';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.4;
  static readonly height = 0.8;
  static readonly lerpRatio = 0.003;

  protected static targetVector = new Vector3();
  protected static lookAtVector = new Vector3();
  protected static tempQuaternion = new Quaternion();
  protected static tempEuler = new Euler();
  protected static invFullHD = 1 / Math.hypot(1440, 1080);

  static fov = 90;
  static near = 0.001;
  static far = 40;

  ref?: Player;

  protected normalizedDistance!: number;

  static getFar() {
    return Camera.far * Math.hypot(innerWidth, innerHeight) * Camera.invFullHD;
  }

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.getFar()) {
    super(fov, innerWidth / innerHeight, near, far);

    this.up = new Vector3(0, 1, 0);
  }

  ready({ level, ref }: { level: ViewLevel; ref: Player }) {
    this.setLevel(level);
    this.setRef(ref);
    this.update();
  }

  onResize(width: number, height: number) {
    this.aspect = width / height;
    this.normalizedDistance = Camera.distance / this.aspect;
    this.updateProjectionMatrix();
    this.far = Camera.getFar();
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
    const angle = -body.angle + Math_Half_PI;
    const offsetX = Math.sin(angle) * this.normalizedDistance;
    const offsetY = Math.cos(angle) * this.normalizedDistance;
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
      const lerp = ms * Camera.lerpRatio;
      this.position.lerp(targetPosition, lerp);
      Camera.tempQuaternion.setFromEuler(Camera.tempEuler);
      Camera.tempQuaternion.slerp(mesh.quaternion, lerp);
      this.rotation.setFromQuaternion(Camera.tempQuaternion);
    } else {
      this.position.copy(targetPosition);
      this.rotation.copy(Camera.tempEuler);
    }

    this.lookAt(lookAtPosition);
  }
}
