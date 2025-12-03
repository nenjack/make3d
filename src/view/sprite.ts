import { AbstractBody } from '../body/abstract-body'
import { DynamicBody } from '../body/dynamic-body'
import { Mouse } from '../core/mouse'
import { Level } from '../level'
import { BillboardProps, SpriteState } from '../model'
import { physics } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { normalizeAngle } from '../utils/view-utils'
import { Billboard, BillboardCreateProps } from './billboard'

export class Sprite extends Billboard {
  static async create<T = Sprite>(
    level: Level,
    props: BillboardCreateProps,
    Class: any = Sprite
  ) {
    return Billboard.create<T>(level, props, Class)
  }

  static readonly ROTATE_SPEED = DeviceDetector.HIGH_END ? 3 : 1.5
  static readonly MOVE_SPEED = 0.05
  static readonly JUMP_SPEED = 0.075
  static readonly GRAVITY = 0.005
  static readonly CLICK_PREVENT = 600
  static readonly CLICK_DURATION = 200

  declare readonly body: DynamicBody

  clickTime = 0

  protected clickTimeout = 0
  protected velocity = 0
  protected state: SpriteState

  constructor(
    props: BillboardProps,
    state: SpriteState = { keys: {}, mouse: new Mouse() }
  ) {
    super(props)
    this.state = state
    this.spawn(props.level)
  }

  update(ms: number) {
    const deltaTime = ms * 0.001
    const speed = this.getSpeed()

    this.updateAngle(deltaTime)
    this.processMovement(deltaTime, speed * Sprite.MOVE_SPEED)
    this.handleFrameUpdate(ms, speed)

    super.update(ms)
  }

  getSpeed() {
    if (this.state.keys.up) return 1

    if (this.state.keys.down) return -1

    if (this.state.mouseDown) return -this.state.mouse.y

    return 0
  }

  jump() {
    if (Date.now() - this.clickTime > Sprite.CLICK_PREVENT) {
      this.jumpStart().then(() => {
        this.jumpEnd()
      })
    }
  }

  jumpStart() {
    return new Promise<void>((resolve) => {
      this.clickTime = Date.now()
      this.state.keys.space = true

      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout)
      }

      this.clickTimeout = setTimeout(() => {
        resolve()
      }, Sprite.CLICK_DURATION)
    })
  }

  jumpEnd() {
    this.state.keys.space = false
  }

  protected onCollide() {
    if (this.getSpeed()) {
      this.jump()
    }
  }

  protected processMovement(deltaTime: number, moveSpeed: number) {
    let timeLeft = deltaTime * 60
    while (timeLeft > 0) {
      const timeScale = Math.min(1, timeLeft)

      this.body.move(moveSpeed * timeScale)
      this.body.separate(timeScale, this.onCollide.bind(this))
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
    const floorZ = AbstractBody.getFloor(this.body) / 2
    const isOnGround = this.body.z === floorZ || this.velocity === 0
    const isJumping = isOnGround && this.state.keys.space

    if (isJumping) this.velocity = Sprite.JUMP_SPEED

    if (isJumping || this.body.z > floorZ) {
      this.body.z += this.velocity * timeScale
      this.velocity -= timeScale * Sprite.GRAVITY
    }

    if (this.body.z < floorZ) {
      this.body.z = floorZ
      this.velocity = 0
    }

    this.body.group = AbstractBody.getGroup(this.body)
  }

  protected updateAngle(deltaTime: number) {
    const scaleX =
      this.state.keys.left || this.state.keys.right
        ? this.state.keys.left
          ? -1
          : 1
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

  protected createBody(x: number, y: number, level: Level) {
    const body = new DynamicBody(x, y, level)
    physics.insert(body)
    return body
  }

  protected spawn(level: Level, x?: number, y?: number) {
    super.spawn(level, x, y)
    this.body.separate()
  }
}
