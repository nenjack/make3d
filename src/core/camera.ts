import { PerspectiveCamera, Vector3 } from 'three'
import { Math_Half_PI, maxLevelHeight, state } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { Sprite } from '../view/sprite'
import { AbstractBody } from '../body/abstract-body'

const MIN_HEIGHT = maxLevelHeight / 2

export class Camera extends PerspectiveCamera {
  static getFar() {
    return state.renderer.camera.far / Camera.FAR
  }

  static readonly HEIGHT = 0.75
  static readonly DISTANCE = 2
  static readonly LERP_RATIO = 0.004
  static readonly FOV = 75
  static readonly NEAR = 0.01
  static readonly FAR = DeviceDetector.HIGH_END ? 32 : 16
  static readonly cameraGoal = new Vector3(0, MIN_HEIGHT + Camera.HEIGHT, 0)
  static readonly cameraLookAt = new Vector3(0, MIN_HEIGHT, 0)
  static readonly projection = new Vector3()

  target?: Sprite

  protected distance = Camera.DISTANCE

  constructor(fov = Camera.FOV, near = Camera.NEAR, far = Camera.FAR) {
    super(fov, innerWidth / innerHeight, near, far)

    this.position.copy(Camera.cameraGoal)
    this.lookAt(Camera.cameraLookAt)
  }

  onResize(width: number, height: number) {
    this.aspect = width / height
    this.distance = Camera.DISTANCE / this.aspect
    this.updateProjectionMatrix()
  }

  update(ms = 0) {
    if (!ms) return

    this.updateGoal()
    this.lerpToGoal(ms)
    this.updateLookAt()
    this.lookAt(Camera.cameraLookAt)
  }

  setTarget(target: Sprite) {
    this.target = target
  }

  protected getPositionBehind({ x = 0, y = 0, angle = 0 } = {}) {
    const adjustedAngle = Math_Half_PI - angle
    const offsetX = Math.sin(adjustedAngle) * this.distance
    const offsetY = Math.cos(adjustedAngle) * this.distance
    const cameraX = x - offsetX
    const cameraY = y - offsetY

    return [cameraX, cameraY]
  }

  protected updateLookAt() {
    if (this.target) {
      Camera.cameraLookAt.set(
        this.target.body.x,
        this.target.body.z + Camera.HEIGHT,
        this.target.body.y
      )
    }
  }

  protected updateGoal() {
    if (this.target) {
      const [x, y] = this.getPositionBehind(this.target.body)
      const from = AbstractBody.getFloor(this.target.body, x, y) / 2
      const z = Math.max(from, this.target.body.z) + Camera.HEIGHT

      Camera.cameraGoal.set(x, z, y)
    }
  }

  protected lerpToGoal(ms: number) {
    this.position.lerp(Camera.cameraGoal, ms * Camera.LERP_RATIO)
  }
}
