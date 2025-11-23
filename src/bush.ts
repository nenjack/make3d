import { Billboard } from './billboard'
import { Level } from './level'

export const bushProps = {
  textureName: 'bush'
}

export class Bush extends Billboard {
  constructor(level: Level, x?: number, y?: number) {
    super({ ...bushProps, level, x, y })
  }
}
