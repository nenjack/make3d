import { Circle } from 'detect-collisions';
import { floors } from './state';

export class BillboardBody extends Circle {
  constructor(radius = 0.25) {
    super({}, radius, { group: floors[0] });
  }
}
