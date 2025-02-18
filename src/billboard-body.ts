import { Circle } from 'detect-collisions';
import { floors, Math_Double_PI } from './state';

export interface BodyLike {
  x: number;
  y: number;
  group: number;
  angle: number;
  setPosition: (x: number, y: number) => void;
}

export class StaticBody implements BodyLike {
  x!: number;
  y!: number;
  group = floors[0];
  angle = 0;

  constructor(x: number, y: number) {
    this.setPosition(x, y);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class DynamicBody extends Circle {
  static readonly RADIUS = 0.2;
  static readonly PADDING = 0.1;
  static readonly SEPARATE = 0.3;

  angle = Math.random() * Math_Double_PI;

  constructor(
    x: number,
    y: number,
    radius = DynamicBody.RADIUS,
    padding = DynamicBody.PADDING
  ) {
    super({ x, y }, radius, { group: floors[0], padding });
  }

  separate(timeScale = 1) {
    const multiply = DynamicBody.SEPARATE * timeScale;
    this.system?.separateBody(this, ({ b: body, overlapV: { x, y } }) => {
      if (!body.isStatic) {
        const offsetX = x * multiply;
        const offsetY = y * multiply;

        this.setPosition(this.x - offsetX, this.y - offsetY);
        body.setPosition(body.x + offsetX * 2, body.y + offsetY * 2);
      }

      return body.isStatic;
    });
  }
}
