import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';
import { Math_Half_PI } from './state';
import { ViewLevel } from './view-level';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.3;
  static readonly height = 0.75;
  static readonly lerpRatio = 0.0033;

  protected static targetVector = new Vector3();
  protected static lookAtVector = new Vector3();
  protected static tempQuaternion = new Quaternion();
  protected static tempEuler = new Euler();

  static fov = 90;
  static near = 0.01;
  static far = 25;

  offsetX = 0;
  offsetY = 0;
  ref?: Player;
  distance = Camera.distance;

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far);
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
    const angle = -body.angle + Math_Half_PI;
    const cameraX = body.x - Math.sin(angle) * this.distance;
    const cameraY = body.y - Math.cos(angle) * this.distance;
    const cameraHeight = this.getFloor(cameraX, cameraY) / 3;
    const cameraZ = Math.max(cameraHeight, z);

    const targetPosition = Camera.targetVector.set(
      cameraX,
      Camera.height + cameraZ,
      cameraY
    );
    const lookAtPosition = Camera.lookAtVector.set(
      body.x,
      Camera.height + z * 0.5,
      body.y
    );

    Camera.tempEuler.copy(this.rotation);

    if (ms) {
      const distance = this.getDistanceTo(targetPosition);
      const lerp = ms * Camera.lerpRatio;
      this.position.lerp(targetPosition, Math.min(1, lerp * distance));
      Camera.tempQuaternion.setFromEuler(Camera.tempEuler);
      Camera.tempQuaternion.slerp(mesh.quaternion, Math.min(1, lerp));
      this.rotation.setFromQuaternion(Camera.tempQuaternion);
    } else {
      this.position.copy(targetPosition);
      this.rotation.copy(Camera.tempEuler);
    }

    this.lookAt(lookAtPosition);
  }

  protected getDistanceTo(position: Vector3) {
    const x = this.position.x - position.x;
    const y = this.position.z - position.z;

    return x * x + y * y;
  }
}
