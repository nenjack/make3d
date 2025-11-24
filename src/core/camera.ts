import { Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { Level } from '../level'
import { Math_Half_PI, state } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { Billboard } from '../view/billboard'

export class Camera extends PerspectiveCamera {
  static readonly DISTANCE = 1.5
  static readonly FAR = DeviceDetector.HIGH_END ? 32 : 16

  protected static readonly HEIGHT = 0.75
  protected static readonly LERP_RATIO = 0.0033
  protected static readonly FOV = 85
  protected static readonly NEAR = 0.1
  protected static readonly targetVector = new Vector3(0, Camera.HEIGHT, 0)
  protected static readonly lookAtVector = new Vector3(0, Camera.HEIGHT, 0)
  protected static readonly tempQuaternion = new Quaternion()

  static getFar() {
    return state.renderer.camera.far / Camera.FAR
  }

  target?: Billboard

  protected distance = Camera.DISTANCE

  constructor(fov = Camera.FOV, near = Camera.NEAR, far = Camera.FAR) {
    super(fov, innerWidth / innerHeight, near, far)
    this.position.copy(Camera.targetVector)
    this.quaternion.copy(Camera.tempQuaternion)
    this.lookAt(Camera.lookAtVector)
  }

  onResize(width: number, height: number) {
    this.aspect = width / height
    this.distance = Camera.DISTANCE / this.aspect
    this.updateProjectionMatrix()
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

  setLevel(level: Level) {
    this.getFloor = (x, y) => level.getFloor(x, y)
  }

  setTarget(target: Billboard) {
    this.target = target
  }

  protected getFloor(_x: number, _y: number) {
    return 0
  }

  protected getCameraPosition({ x = 0, y = 0, angle = 0 } = {}, height = 0) {
    const adjustedAngle = -angle + Math_Half_PI
    const offsetX = Math.sin(adjustedAngle) * this.distance
    const offsetY = Math.cos(adjustedAngle) * this.distance
    const cameraX = x - offsetX
    const cameraY = y - offsetY

    return {
      x: cameraX,
      y: cameraY,
      height
    }
  }

  protected getTargetPosition() {
    if (!this.target) return

    const { body } = this.target
    const { x, y, height } = this.getCameraPosition(body, this.target.z)

    const floorHeight = this.getFloor(x, y) / 2
    const positionHeight = Math.max(floorHeight, height) + Camera.HEIGHT
    const position = Camera.targetVector.set(x, positionHeight, y)

    const lookHeight = height / 2 + Camera.HEIGHT
    const lookAt = Camera.lookAtVector.set(body.x, lookHeight, body.y)

    const quaternion = this.target.mesh.quaternion

    return { position, lookAt, quaternion }
  }
}
