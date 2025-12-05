import { Level } from '../level'
import { AbstractLevel } from '../level/abstract-level'
import { DeviceDetector } from '../utils/detect-mobile'
import { queryParams } from '../utils/query-params'
import { BillboardCreateProps } from './billboard'
import { Sprite } from './sprite'

export class NPC extends Sprite {
  static async create<T = NPC>(
    level: Level,
    props: BillboardCreateProps,
    Class: any = NPC
  ) {
    return Sprite.create<T>(level, props, Class)
  }

  static randomProp() {
    return (1 + Math.random()) * 0.1
  }

  static readonly MAX_SPEED = 0
  static readonly MAX_ROTATION = 100
  static readonly DEFAULT_COUNT =
    'limit' in queryParams
      ? Number(queryParams.limit)
      : DeviceDetector.HIGH_END
        ? 64
        : 48

  protected speed = NPC.MAX_SPEED
  protected rotation = NPC.MAX_ROTATION
  protected props = {
    SLOW_SPEED: NPC.randomProp(),
    SPIN_CHANCE: NPC.randomProp(),
    JUMP_CHANCE: NPC.randomProp() * 0.2
  }

  update(scale: number) {
    const dx = this.mesh.position.x
    const dy = this.mesh.position.z
    const radius = (AbstractLevel.COLS + AbstractLevel.ROWS) / 2
    const diff = Math.sqrt(dx * dx + dy * dy) - radius

    if (diff > 0 && Math.random() < diff / radius) {
      this.body.angle = Math.atan2(-dy, -dx)
    }

    this.speed -= scale * this.props.SLOW_SPEED
    this.rotation -= scale * this.props.SLOW_SPEED

    if (this.rotation < 0) {
      this.rotation = NPC.MAX_ROTATION
      this.state.keys.left = false
      this.state.keys.right = false

      if (Math.random() < scale * this.props.SPIN_CHANCE) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true
      }
    }

    if (this.speed < 0) {
      this.speed = NPC.MAX_SPEED
      this.state.keys.up = Math.random() < 0.9
    }

    this.state.keys.space = Math.random() < scale * this.props.JUMP_CHANCE

    // last
    super.update(scale)
  }
}
