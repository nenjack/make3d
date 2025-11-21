import { Level } from './level'
import { BillboardProps, State } from './model'
import { MovingBillboard } from './moving-billboard'

export interface MovingSpriteProps extends BillboardProps {
  level: Level
}

export class MovingSprite extends MovingBillboard {
  constructor({ level, ...props }: MovingSpriteProps, state?: State) {
    super(props, state)
    this.spawn(level)
  }
}
