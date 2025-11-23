import { Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { DeviceDetector } from './detect'
import { Level } from './level'
import { Player } from './player'
import { Math_Half_PI } from './state'

export class Camera extends PerspectiveCamera {
  static readonly DISTANCE = 1.5
  static readonly HEIGHT = 0.75
  static readonly LERP_RATIO = 0.0033

  protected static targetVector = new Vector3()
  protected static lookAtVector = new Vector3()
  protected static tempQuaternion = new Quaternion()

  static fov = 85
  static near = 0.1
  static far = DeviceDetector.HIGH_END ? 32 : 24

  ref?: Player
  distance = Camera.DISTANCE

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far)
  }

  ready({ level, ref }: { level: Level; ref: Player }) {
    this.setLevel(level)
    this.setRef(ref)
    this.update()
  }

  onResize(width: number, height: number) {
    this.aspect = width / height
    this.distance = Camera.DISTANCE / this.aspect
    this.updateProjectionMatrix()
  }

  getFloor(_x: number, _y: number) {
    return 0
  }

  setLevel(level: Level) {
    this.getFloor = (x, y) => level.getFloor(x, y)
  }

  setRef(ref: Player) {
    this.ref = ref
  }

  update(ms = 0) {
    if (!this.ref) return
    const { body, z, mesh } = this.ref
    const angle = -body.angle + Math_Half_PI

    // Przesunięcie kamery względem gracza
    const offsetX = Math.sin(angle) * this.distance
    const offsetY = Math.cos(angle) * this.distance
    const cameraX = body.x - offsetX
    const cameraY = body.y - offsetY

    // Wyliczenie wysokości kamery
    const cameraHeight = this.getFloor(cameraX, cameraY) / 2
    const cameraZ = Math.max(cameraHeight, z)

    // Pozycja docelowa kamery
    const targetPosition = Camera.targetVector.set(
      cameraX,
      Camera.HEIGHT + cameraZ,
      cameraY
    )

    // Punkt, na który kamera patrzy (trochę niżej niż środek gracza)
    const lookAtPosition = Camera.lookAtVector.set(
      body.x,
      Camera.HEIGHT + z * 0.5,
      body.y
    )

    if (ms) {
      const lerpFactor = ms * Camera.LERP_RATIO
      // Płynne przesunięcie pozycji kamery
      this.position.lerp(targetPosition, lerpFactor)

      // Płynna interpolacja rotacji
      Camera.tempQuaternion.copy(this.quaternion)
      Camera.tempQuaternion.slerp(mesh.quaternion, lerpFactor)
      this.rotation.setFromQuaternion(Camera.tempQuaternion)
    } else {
      this.position.copy(targetPosition)
      this.quaternion.copy(mesh.quaternion)
    }

    // Ustawienie kierunku patrzenia kamery
    this.lookAt(lookAtPosition)
  }

  getScreenPosition(target: Object3D) {
    // Pobranie pozycji gracza w świecie
    target.getWorldPosition(Camera.targetVector)

    // Przekształcenie na współrzędne NDC (od -1 do 1)
    Camera.targetVector.project(this)

    // Przekształcenie na współrzędne ekranu (piksele)
    const halfWidth = innerWidth / 2
    const halfHeight = innerHeight / 2

    const screenX = Camera.targetVector.x * halfWidth + halfWidth
    const screenY = -Camera.targetVector.y * halfHeight + halfHeight // Inwersja Y, bo w WebGL (0,0) jest w środku

    return { x: screenX, y: screenY }
  }

  protected getDistanceTo(position: Vector3) {
    const x = this.position.x - position.x
    const y = this.position.z - position.z

    return x * x + y * y
  }
}
