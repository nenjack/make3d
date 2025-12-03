import { Circle } from 'check2d'
import { Level } from '../level'
import { BaseBody, BodyUserData } from '../model'
import { floors, Math_Double_PI } from '../state'
import { AbstractBody } from './abstract-body'

export class DynamicBody extends Circle<BodyUserData> implements BaseBody {
  protected static readonly RADIUS = 0.2
  protected static readonly PADDING = 0.1
  protected static readonly SEPARATION_DYNAMIC = 0.33
  protected static readonly SEPARATION_STATIC = 1

  z = 0
  angle = Math.random() * Math_Double_PI
  userData!: BodyUserData

  constructor(
    x: number,
    y: number,
    level: Level,
    radius: number = DynamicBody.RADIUS,
    padding: number = DynamicBody.PADDING
  ) {
    super({ x, y }, radius, { group: floors[0], padding, userData: { level } })
  }

  setPosition(x: number, y: number, updateNow?: boolean) {
    super.setPosition(x, y, updateNow)
    AbstractBody.onSetPosition(this)

    return this
  }

  separate(timeScale: number = 1, onCollide?: () => void) {
    const separationDynamic = timeScale * DynamicBody.SEPARATION_DYNAMIC
    const separationStatic = timeScale * DynamicBody.SEPARATION_STATIC

    this.system?.checkOne(this, ({ b, overlapV: { x, y } }) => {
      if (b.isStatic) {
        this.setPosition(
          this.x - x * separationStatic,
          this.y - y * separationStatic
        )
      } else {
        const dx = x * separationDynamic
        const dy = y * separationDynamic

        this.setPosition(this.x - dx, this.y - dy)
        b.setPosition(b.x + dx * 2, b.y + dy * 2)
      }

      if (
        b.isStatic &&
        AbstractBody.getFloor(this, b.x, b.y) / 2 - this.z <= 0.5
      ) {
        onCollide?.()
      }
    })
  }
}
