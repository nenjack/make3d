import { Circle } from 'detect-collisions';
import { floors, Math_Double_PI } from './state';

export interface BodyLike {
  x: number;
  y: number;
  group: number;
  setPosition: (x: number, y: number) => void;
}

export class StaticBody implements BodyLike {
  x!: number;
  y!: number;
  group = floors[0];

  constructor(x: number, y: number) {
    this.setPosition(x, y);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class DynamicBody extends Circle {
  static readonly radius = 0.25;
  static readonly padding = 0.1;

  angle = Math.random() * Math_Double_PI;

  constructor(
    x: number,
    y: number,
    radius = DynamicBody.radius,
    padding = DynamicBody.padding
  ) {
    super({ x, y }, radius, { group: floors[0], padding });
  }
}
