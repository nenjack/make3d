import { Map } from 'rot-js';
import Cellular from 'rot-js/lib/map/cellular';
import { renderer } from './state';

export class Level {
  static readonly iterations = 4;
  static readonly wallHeight = Level.iterations + 2;

  readonly size: number;

  heights: number[][] = [];
  map!: Cellular;

  constructor(levelSize = 32, idle = false) {
    this.size = levelSize;
    this.createMap();

    if (!idle) {
      renderer.camera.setLevel(this);
    }
  }

  getFloor(x: number, y: number) {
    try {
      return this.heights[Math.floor(x)][Math.floor(y)];
    } catch (_oob) {
      return Level.wallHeight;
    }
  }

  protected createMap() {
    this.map = new Map.Cellular(this.size, this.size);
    this.map.randomize(0.6);

    for (let i = Level.iterations; i > 0; i--) {
      this.map.create((x: number, y: number, value: number) => {
        this.heights[x] = this.heights[x] || [];
        this.heights[x][y] = this.heights[x][y] || Level.iterations;

        if (x !== 0 && y !== 0 && x !== this.size - 1 && y !== this.size - 1) {
          this.heights[x][y] -= value;
        } else {
          this.heights[x][y] = Level.wallHeight;
        }
      });
    }
  }
}
