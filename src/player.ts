import { Level } from './level'
import { Direction } from './model'
import { MovingSprite, MovingSpriteProps } from './moving-sprite'
import { state } from './state'
import { ViewLevel } from './view-level'

export class Player extends MovingSprite {
  static readonly DIRECTIONS: Direction[] = ['left', 'right', 'down', 'up']

  readonly isPlayer = true
  readonly state = state

  constructor({ level, ...props }: MovingSpriteProps) {
    super({ level, ...props }, state)

    if (level instanceof ViewLevel) {
      state.renderer.camera.ready({ level, ref: this })
      state.renderer.scene.add(level.mesh)
    }
  }

  update(ms: number) {
    state.mouse.updateMouseXY()
    super.update(ms)
  }

  protected spawn(level: Level) {
    super.spawn(level, 0, 0)
  }

  protected getDirection() {
    return (
      Player.DIRECTIONS.find((direction) => !!this.state.keys[direction]) ||
      (this.state.mouseDown
        ? Math.abs(this.state.mouse.x) > Math.abs(this.state.mouse.y)
          ? this.state.mouse.x > 0
            ? 'right'
            : 'left'
          : this.state.mouse.y > 0
            ? 'down'
            : 'up'
        : this.direction)
    )
  }
}
