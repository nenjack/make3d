import { Euler, Mesh, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Level } from './level';
import { Player } from './player';
import { Math_Half_PI } from './state';
import { ViewLevel } from './view-level';
import { DeviceDetector } from './detect';

export class Camera extends PerspectiveCamera {
  static readonly distance = 1.5;
  static readonly height = 0.75;
  static readonly lerpRatio = 0.0033;

  protected static targetVector = new Vector3();
  protected static lookAtVector = new Vector3();
  protected static tempQuaternion = new Quaternion();
  protected static tempEuler = new Euler();

  static fov = 85;
  static near = 0.1;
  static far = DeviceDetector.isHighEnd ? 32 : 24;

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

    // Przesunięcie kamery względem gracza
    const offsetX = Math.sin(angle) * this.distance;
    const offsetY = Math.cos(angle) * this.distance;
    const cameraX = body.x - offsetX;
    const cameraY = body.y - offsetY;

    // Wyliczenie wysokości kamery
    const cameraHeight = this.getFloor(cameraX, cameraY) / 2;
    const cameraZ = Math.max(cameraHeight, z);

    // Pozycja docelowa kamery
    const targetPosition = Camera.targetVector.set(
      cameraX,
      Camera.height + cameraZ,
      cameraY
    );

    // Punkt, na który kamera patrzy (trochę niżej niż środek gracza)
    const lookAtPosition = Camera.lookAtVector.set(
      body.x,
      Camera.height + z * 0.5,
      body.y
    );

    Camera.tempEuler.copy(this.rotation);

    if (ms) {
      const distance = this.getDistanceTo(targetPosition);
      const lerpFactor = Math.min(1, ms * Camera.lerpRatio * distance);

      // Płynne przesunięcie pozycji kamery
      this.position.lerp(targetPosition, lerpFactor);

      // Płynna interpolacja rotacji
      Camera.tempQuaternion.setFromEuler(Camera.tempEuler);
      Camera.tempQuaternion.slerp(mesh.quaternion, lerpFactor);
      this.rotation.setFromQuaternion(Camera.tempQuaternion);
    } else {
      this.position.copy(targetPosition);
      this.rotation.copy(Camera.tempEuler);
    }

    // Ustawienie kierunku patrzenia kamery
    this.lookAt(lookAtPosition);
  }

  getScreenPosition(target: Mesh) {
    // Pobranie pozycji gracza w świecie
    target.getWorldPosition(Camera.targetVector);

    // Przekształcenie na współrzędne NDC (od -1 do 1)
    Camera.targetVector.project(this);

    // Przekształcenie na współrzędne ekranu (piksele)
    const halfWidth = innerWidth / 2;
    const halfHeight = innerHeight / 2;

    const screenX = Camera.targetVector.x * halfWidth + halfWidth;
    const screenY = -Camera.targetVector.y * halfHeight + halfHeight; // Inwersja Y, bo w WebGL (0,0) jest w środku

    return { x: screenX, y: screenY };
  }

  protected getDistanceTo(position: Vector3) {
    const x = this.position.x - position.x;
    const y = this.position.z - position.z;

    return x * x + y * y;
  }
}
