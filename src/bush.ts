import { Level } from './level'
import { Sprite } from './sprite'

export const bushProps = {
  textureName: 'bush'
}

export class Bush extends Sprite {
  constructor(level: Level, x?: number, y?: number) {
    super(bushProps, level, x, y)
  }
}
