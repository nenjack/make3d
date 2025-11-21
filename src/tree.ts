import { Level } from './level'
import { Sprite } from './sprite'

export const treeProps = {
  textureName: 'tree',
  scale: 3
}

export class Tree extends Sprite {
  constructor(level: Level, x?: number, y?: number) {
    super(treeProps, level, x, y)
  }
}
