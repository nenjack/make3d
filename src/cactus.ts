import { Billboard } from './billboard';
import { Level } from './level';

const props = {
  textureName: 'cactus',
  scale: 1
};

export class Cactus extends Billboard {
  constructor(level: Level, x?: number, y?: number) {
    super(props);
    this.spawn(level, x, y);
  }
}
