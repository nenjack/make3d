import { mouse } from '../core/mouse'
import { Level } from '../level'
import {
  BillboardProps,
  DefaultBillboardProps,
  Direction,
  SpriteState
} from '../model'
import { state } from '../state'
import { BillboardCreateProps } from './billboard'
import { Sprite } from './sprite'

export class Player extends Sprite {
  static async create<T = Player>(
    level: Level,
    props: BillboardCreateProps = { texture: 'player.webp' },
    Class: any = Player
  ) {
    return Sprite.create<T>(level, props, Class)
  }

  static readonly DIRECTIONS: Direction[] = ['left', 'right', 'down', 'up']
  static readonly DEFAULT_PROPS: DefaultBillboardProps = {
    textureName: 'player',
    scale: 1.25,
    totalFrames: 3,
    cols: 3,
    rows: 4,
    directionsToRows: {
      down: 0,
      left: 1,
      up: 2,
      right: 3
    }
  }

  declare readonly state: SpriteState

  constructor({ level, ...props }: BillboardProps, setTarget = true) {
    super({ ...Player.DEFAULT_PROPS, level, ...props }, state)

    if (setTarget) {
      state.mouse = mouse
      state.player = this
      state.renderer.setTarget(this)
    }
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
