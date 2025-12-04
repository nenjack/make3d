import { Level } from '../level'
import { AbstractLevel } from '../level/abstract-level'
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

  protected static readonly MAX_SPEED = 0
  protected static readonly MAX_ROTATION = 100

  protected speed = NPC.MAX_SPEED
  protected rotation = NPC.MAX_ROTATION
  protected props = {
    SLOW_SPEED: 0.1,
    SPIN_CHANCE: (0.5 + Math.random()) * 0.5,
    JUMP_CHANCE: (0.5 + Math.random()) * 0.5
  }

  update(scale: number) {
    super.update(scale)

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

      // Reset kierunków bocznych (bez tworzenia tablicy)
      this.state.keys.left = false
      this.state.keys.right = false

      // Losowa zmiana kierunku
      if (Math.random() < scale * this.props.SPIN_CHANCE) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true
      }
    }

    if (this.speed < 0) {
      this.speed = NPC.MAX_SPEED

      // 90% szansy na ruch w górę
      this.state.keys.up = Math.random() < 0.9
    }

    // Skok (uniknięcie podwójnego `Math.random`)
    const jumpChance = scale * this.props.JUMP_CHANCE
    this.state.keys.space = Math.random() < jumpChance
  }
}
