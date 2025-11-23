import { Billboard } from './billboard'
import { DynamicBody } from './billboard-body'
import { Level } from './level'
import { BillboardProps, State } from './model'
import { Mouse } from './mouse'
import { physics } from './state'
import { normalizeAngle } from './utils'

export class Sprite extends Billboard {
  static readonly MOVE_SPEED = 0.05
  static readonly ROTATE_SPEED = 3
  static readonly GRAVITY = 0.005
  static readonly JUMP_SPEED = 0.075

  velocity = 0
  state: State
  declare body: DynamicBody

  constructor(
    props: BillboardProps,
    state: State = { keys: {}, mouse: new Mouse() }
  ) {
    super(props)
    this.state = state
    this.spawn(props.level)
  }

  update(ms: number) {
    const deltaTime = ms * 0.001
    const mouseGear = this.getMouseGear()
    const moveSpeed = mouseGear * Sprite.MOVE_SPEED

    this.updateAngle(deltaTime)
    this.processMovement(deltaTime, moveSpeed)
    this.handleFrameUpdate(ms, mouseGear)

    super.update(ms)
  }

  getMouseGear() {
    if (this.state.keys.up || this.state.keys.down) {
      const mouseY = this.state.keys.up ? 0 : innerHeight
      const centerY = this.state.mouse.getCenterY()
      const multiply = this.state.mouse.getMultiply()

      return -this.state.mouse.clampY(mouseY - centerY, multiply)
    }

    return this.state.mouseDown ? -this.state.mouse.y : 0
  }

  protected processMovement(deltaTime: number, moveSpeed: number) {
    let timeLeft = deltaTime * 60
    while (timeLeft > 0) {
      const timeScale = Math.min(1, timeLeft)
      this.body.move(moveSpeed * timeScale)
      this.body.separate(timeScale)
      this.updateZ(timeScale)
      timeLeft -= timeScale
    }
  }

  protected handleFrameUpdate(ms: number, mouseGear: number) {
    if (mouseGear || Object.values(this.state.keys).some(Boolean)) {
      this.updateFrame(ms)
    }
  }

  protected updateZ(timeScale: number) {
    const floorZ = this.getFloorZ()
    const isOnGround = this.z === floorZ || this.velocity === 0
    const isJumping = isOnGround && this.state.keys.space

    if (isJumping) this.velocity = Sprite.JUMP_SPEED

    if (isJumping || this.z > floorZ) {
      this.z += this.velocity * timeScale
      this.velocity -= timeScale * Sprite.GRAVITY
    }

    if (this.z < floorZ) {
      this.z = floorZ
      this.velocity = 0
    }
  }

  protected updateAngle(deltaTime: number) {
    const scaleX =
      this.state.keys.left || this.state.keys.right
        ? this.state.mouse.clampX(
            (this.state.keys.left ? -0.5 : 0.5) * innerWidth,
            this.state.mouse.getMultiply()
          )
        : this.state.mouseDown
          ? this.state.mouse.x
          : 0

    if (scaleX !== 0) {
      this.body.angle = normalizeAngle(
        this.body.angle + Sprite.ROTATE_SPEED * deltaTime * scaleX
      )
    }
  }

  protected updateFrame(ms: number) {
    this.frame = (this.frame + ms * this.invFrameDuration) % this.totalFrames
  }

  protected updateTexture() {
    super.updateTexture()

    const hasLeft = 'left' in this.directionsToRows
    const hasRight = 'right' in this.directionsToRows
    if (hasLeft && hasRight) return

    const oldScaleX = Math.sign(this.mesh.scale.x)
    const direction = this.getDirection()
    const directionX = hasLeft ? -1 : 1
    const newScaleX =
      direction === 'left'
        ? -directionX
        : direction === 'right'
          ? directionX
          : 0

    if (newScaleX && oldScaleX !== newScaleX) {
      this.mesh.scale.set(newScaleX, 1, 1)
    }
  }

  protected createBody(x: number, y: number) {
    const body = new DynamicBody(x, y)
    physics.insert(body)
    return body
  }

  protected spawn(level: Level, x?: number, y?: number) {
    super.spawn(level, x, y)
    this.body.separate()
  }
}
