import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';
import { Math_Half_PI } from './state';
import { ViewLevel } from './view-level';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.3;
  static readonly height = 0.75;
  static readonly lerpRatio = 0.005;

  protected static targetVector = new Vector3();
  protected static lookAtVector = new Vector3();
  protected static tempQuaternion = new Quaternion();
  protected static tempEuler = new Euler();

  static fov = 90;
  static near = 0.001;
  static far = 20;

  offsetX = 0;
  offsetY = 0;
  ref?: Player;
  distance = Camera.distance;

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
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
    this.distance = Camera.distance / this.aspect;
    this.updateProjectionMatrix();
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
    const gear = this.ref.gear || 1;
    const angle = -body.angle + Math_Half_PI;
    const cameraX = body.x - Math.sin(angle) * this.distance * gear;
    const cameraY = body.y - Math.cos(angle) * this.distance * gear;
    const cameraHeight = this.getFloor(cameraX, cameraY) / 2;
    const cameraZ = Math.max(cameraHeight, z) + Camera.height;

    const targetPosition = Camera.targetVector.set(cameraX, cameraZ, cameraY);
    const lookAtPosition = Camera.lookAtVector.set(body.x, (z + 1) / 4, body.y);

    Camera.tempEuler.copy(this.rotation);

    if (ms) {
      const distance = this.getDistanceTo(targetPosition);
      const lerp = ms * Camera.lerpRatio;
      this.position.lerp(targetPosition, lerp * distance);
      Camera.tempQuaternion.setFromEuler(Camera.tempEuler);
      Camera.tempQuaternion.slerp(mesh.quaternion, lerp);
      this.rotation.setFromQuaternion(Camera.tempQuaternion);
    } else {
      this.position.copy(targetPosition);
      this.rotation.copy(Camera.tempEuler);
    }

    this.lookAt(lookAtPosition);
  }

  protected getDistanceTo(position: Vector3) {
    const x = this.ref!.body.x - position.x;
    const y = this.ref!.body.y - position.z;

    return x * x + y * y;
  }
}
