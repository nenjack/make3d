import { Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { Level } from '../level'
import { Math_Half_PI } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { Billboard } from '../view/billboard'

export class Camera extends PerspectiveCamera {
  static readonly DISTANCE = 1.5
  static readonly HEIGHT = 0.75
  static readonly LERP_RATIO = 0.0033

  protected static targetVector = new Vector3(0, Camera.HEIGHT, 0)
  protected static lookAtVector = new Vector3(0, Camera.HEIGHT, 0)
  protected static tempQuaternion = new Quaternion()

  static fov = 85
  static near = 0.1
  static far = DeviceDetector.HIGH_END ? 32 : 24

  distance = Camera.DISTANCE
  target?: Billboard

  constructor(fov = Camera.fov, near = Camera.near, far = Camera.far) {
    super(fov, innerWidth / innerHeight, near, far)
    this.position.copy(Camera.targetVector)
    this.quaternion.copy(Camera.tempQuaternion)
    this.lookAt(Camera.lookAtVector)
  }

  setLevelFloor(level: Level) {
    this.getFloor = (x, y) => level.getFloor(x, y)
  }

  setTarget(target: Billboard) {
    this.target = target
  }

  onResize(width: number, height: number) {
    this.aspect = width / height
    this.distance = Camera.DISTANCE / this.aspect
    this.updateProjectionMatrix()
  }

  getFloor(_x: number, _y: number) {
    return 0
  }

  getCameraPosition({ x = 0, y = 0, angle = 0 } = {}, z = 0) {
    const adjustedAngle = -angle + Math_Half_PI
    const offsetX = Math.sin(adjustedAngle) * this.distance
    const offsetY = Math.cos(adjustedAngle) * this.distance

    const cameraX = x - offsetX
    const cameraY = y - offsetY
    const height = Math.max(z, this.getFloor(cameraX, cameraY) / 2)

    return {
      x: cameraX,
      y: cameraY,
      height
    }
  }

  getTargetPosition() {
    if (!this.target) return

    const { body } = this.target
    const { x, y, height } = this.getCameraPosition(body, this.target.z)
    const lookHeight = height / 2 + Camera.HEIGHT
    const quaternion = this.target.mesh.quaternion
    const position = Camera.targetVector.set(x, height + Camera.HEIGHT, y)
    const lookAt = Camera.lookAtVector.set(body.x, lookHeight, body.y)

    return { quaternion, position, lookAt }
  }

  update(ms = 0) {
    const target = this.getTargetPosition()
    if (!target) return

    if (ms) {
      const lerpFactor = ms * Camera.LERP_RATIO
      this.position.lerp(target.position, lerpFactor)

      Camera.tempQuaternion.copy(this.quaternion)
      Camera.tempQuaternion.slerp(target.quaternion, lerpFactor)
      this.rotation.setFromQuaternion(Camera.tempQuaternion)
    } else {
      this.position.copy(target.position)
      this.quaternion.copy(target.quaternion)
    }

    this.lookAt(target.lookAt)
  }

  getScreenPosition(target: Object3D) {
    target.getWorldPosition(Camera.targetVector)
    Camera.targetVector.project(this)

    const halfWidth = innerWidth / 2
    const halfHeight = innerHeight / 2

    const screenX = Camera.targetVector.x * halfWidth + halfWidth
    const screenY = -Camera.targetVector.y * halfHeight + halfHeight

    return { x: screenX, y: screenY }
  }

  protected getDistanceTo(position: Vector3) {
    const x = this.position.x - position.x
    const y = this.position.z - position.z

    return x * x + y * y
  }
}
