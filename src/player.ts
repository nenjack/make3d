import { Level } from './level'
import { Direction } from './model'
import { MovingSprite, MovingSpriteProps } from './moving-sprite'
import { state } from './state'
import { getTextureName, loadTextures } from './utils'
import { ViewLevel } from './view-level'

export const playerProps = {
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

export interface LevelProps
  extends Omit<MovingSpriteProps, 'level' | 'textureName'> {
  texture: string
}

export class Player extends MovingSprite {
  static readonly DIRECTIONS: Direction[] = ['left', 'right', 'down', 'up']

  readonly isPlayer = true
  readonly state = state

  /**
   *
   * @param {Level} level
   * @param {LevelProps} props
   * @returns
   */
  static async create(
    level: Level,
    { texture, ...props }: LevelProps = { texture: 'player.webp' }
  ) {
    await loadTextures([texture])
    const textureName = getTextureName(texture)
    return new Player({ level, textureName, ...props })
  }

  constructor({ level, ...props }: MovingSpriteProps) {
    super({ level, ...playerProps, ...props }, state)

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
