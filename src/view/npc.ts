import { Level } from '../level'
import { BaseLevel } from '../level/base-level'
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
  protected static readonly JUMP_CHANCE = 0.001
  protected static readonly ROTATE_CHANCE = 0.03

  protected speed = NPC.MAX_SPEED
  protected rotation = NPC.MAX_ROTATION

  update(ms = 0) {
    super.update(ms)

    const dx = this.mesh.position.x
    const dy = this.mesh.position.z
    const radius = (BaseLevel.COLS + BaseLevel.ROWS) / 2
    const diff = Math.sqrt(dx * dx + dy * dy) - radius

    if (diff > 0 && Math.random() < diff / radius) {
      this.body.angle = Math.atan2(-dy, -dx)
    }

    this.speed -= ms
    this.rotation -= ms

    if (this.rotation < 0) {
      this.rotation = NPC.MAX_ROTATION

      // Reset kierunków bocznych (bez tworzenia tablicy)
      this.state.keys.left = false
      this.state.keys.right = false

      // Losowa zmiana kierunku
      if (Math.random() < ms * NPC.ROTATE_CHANCE) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true
      }
    }

    if (this.speed < 0) {
      this.speed = NPC.MAX_SPEED

      // 90% szansy na ruch w górę
      this.state.keys.up = Math.random() < 0.9
    }

    // Skok (uniknięcie podwójnego `Math.random`)
    const jumpChance = ms * NPC.JUMP_CHANCE
    this.state.keys.space = Math.random() < jumpChance
  }
}
