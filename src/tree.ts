import { Billboard } from './billboard'
import { Level } from './level'

export const treeProps = {
  textureName: 'tree',
  scale: 3
}

export class Tree extends Billboard {
  constructor(level: Level, x?: number, y?: number) {
    super({ ...treeProps, level, x, y })
  }
}
