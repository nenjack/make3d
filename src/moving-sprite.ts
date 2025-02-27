import { Level } from './level';
import { BillboardProps, State } from './model';
import { MovingBillboard } from './moving-billboard';

export class MovingSprite extends MovingBillboard {
  constructor(
    { level, ...props }: BillboardProps & { level: Level },
    state?: State
  ) {
    super(props, state);
    this.spawn(level);
  }
}
