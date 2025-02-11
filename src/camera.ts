import { Euler, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1;
  static readonly lerpRatio = 0.0025;

  static fov = 90;
  static near = 0.1;
  static far = 100;

  ref?: Player;

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far);

    this.up = new Vector3(0, 1, 0);
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
    if (!this.ref) {
      return;
    }

    const scale = 1 / this.aspect;
    const angle = -this.ref.body.angle + Math.PI / 2;
    const offsetX = Math.sin(angle) * scale;
    const offsetY = Math.cos(angle) * scale;
    const cameraX = this.ref.body.x - offsetX;
    const cameraY = this.ref.body.y - offsetY;
    const cameraHeight = this.getFloor(cameraX, cameraY);
    const cameraZ = 0.25 + Math.max(cameraHeight / 2, this.ref.z);

    const { position, rotation } = this.ref.mesh;

    if (lerp) {
      this.position.lerp(new Vector3(cameraX, cameraZ, cameraY), lerp);

      const targetRotation = new Quaternion().setFromEuler(this.rotation);
      const endRotation = new Quaternion().setFromEuler(
        new Euler(rotation.x, rotation.y, rotation.z)
      );

      this.rotation.setFromQuaternion(targetRotation.slerp(endRotation, lerp));
    } else {
      this.position.set(cameraX, cameraZ, cameraY);
      this.rotation.setFromVector3(
        new Vector3(rotation.x, rotation.y, rotation.z)
      );
    }

    this.lookAt(new Vector3(position.x, position.y, position.z));
  }
}
