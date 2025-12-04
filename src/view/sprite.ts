import { AbstractBody } from '../body/abstract-body'
import { DynamicBody } from '../body/dynamic-body'
import { Mouse } from '../core/mouse'
import { Level } from '../level'
import { AbstractLevel } from '../level/abstract-level'
import { BaseBody, BillboardProps, SpriteState } from '../model'
import { physics } from '../state'
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

  static readonly JUMP_SPEED = 3 * AbstractLevel.STEP
  static readonly ANIM_SPEED = 0.002
  static readonly SPIN_SPEED = 0.06
  static readonly MOVE_SPEED = 0.1
  static readonly FALL_SPEED = 0.13

  static readonly CLICK_DURATION = 100
  static readonly CLICK_PREVENT = 500

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
  }

  update(scale: number) {
    this.updateFall(scale)

    const gear = this.getGear()
    const { left, right } = this.state.keys
    if (gear || left || right) {
      this.updateAngle(scale)
      this.updateMove(scale * gear)
      this.updateAnimation(scale)
    }

    // update mesh
    super.update(scale)
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
    const gear = this.getGear()
    if (!gear) return

    this.jump()
  }

  protected getGear() {
    if (this.state.keys.up) return 1
    if (this.state.keys.down) return -1
    if (this.state.mouseDown) return -this.state.mouse.y
    return 0
  }

  protected updateAngle(scale: number) {
    const speed = Sprite.SPIN_SPEED * scale
    const scaleX =
      this.state.keys.left || this.state.keys.right
        ? this.state.keys.left
          ? -1
          : 1
        : this.state.mouseDown
          ? this.state.mouse.x
          : 0

    if (scaleX !== 0) {
      this.body.angle = normalizeAngle(this.body.angle + speed * scaleX)
    }
  }

  protected updateFall(scale: number) {
    const floor = AbstractBody.getZ(this.body)
    const isOnGround = this.body.z === floor || this.velocity === 0
    const isJumping = isOnGround && this.state.keys.space

    if (isJumping) this.velocity = Sprite.JUMP_SPEED

    if (isJumping || floor < this.body.z) {
      const speed = Sprite.FALL_SPEED * scale
      this.velocity -= speed
      this.body.z += this.velocity * speed
    }

    if (this.body.z < floor) {
      this.velocity = 0
      this.body.z = floor
    }
  }

  protected updateMove(scale: number) {
    const speed = scale * Sprite.MOVE_SPEED
    this.body.move(speed)

    const diffs = this.body.separate(scale)
    if (diffs.find((z) => z - AbstractLevel.STEP < 0.1)) {
      this.onCollide()
    }
  }

  protected updateAnimation(scale: number) {
    const speed = scale * Sprite.ANIM_SPEED
    this.frame = (this.frame + speed * this.frameDuration) % this.totalFrames
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

  protected createBody(x: number, y: number, level: Level): BaseBody {
    const body = new DynamicBody(x, y, level)
    physics.insert(body)
    return body
  }
}
