import { Level } from '../level'
import { DefaultBillboardProps } from '../model'
import { Billboard } from './billboard'

export class Bush extends Billboard {
  static readonly DEFAULT_PROPS: DefaultBillboardProps = {
    textureName: 'bush',
    scale: 1
  }

  constructor(level: Level, x?: number, y?: number) {
    super({ ...Bush.DEFAULT_PROPS, level, x, y })
  }
}
