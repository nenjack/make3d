import { Map } from 'rot-js';
import { floors, maxLevelHeight, minLevelHeight, physics } from './state';

export class Level {
  static readonly fill = 0.5;
  static readonly mapIterations = 4;
  static readonly cols = 24;
  static readonly rows = 24;

  heights: number[][] = [];

  constructor() {
    this.heights = Array.from({ length: maxLevelHeight + minLevelHeight }, () =>
      this.createHeights()
    )
      .reduce(
        (arrays, array) =>
          array.map(
            (column, x) =>
              column.map(
                (value, y) => (arrays[x]?.[y] ?? -minLevelHeight) + value
              ),
            []
          ),
        []
      )
      .map((arrays) => arrays.map((value) => Math.max(0, value)));
  }

  createBoxCollider(x: number, y: number, height: number) {
    for (let floor = 0; floor < height; floor++) {
      physics.createBox({ x, y }, 1, 1, {
        isStatic: true,
        group: floors[floor]
      });
    }
  }

  forEachHeight(
    heights = this.heights,
    iterator: ({ col, row, height }: Record<string, number>) => void
  ) {
    heights.forEach((rows: number[], col: number) => {
      rows.forEach((height: number, row: number) => {
        if (height) {
          iterator({ col, row, height });
        }
      });
    });
  }

  getFloor(x: number, y: number) {
    const posX = Math.floor(x + Level.cols / 2);
    const posY = Math.floor(y + Level.rows / 2);

    return this.heights[posX]?.[posY] || 0;
  }

  protected createHeights(
    cols = Level.cols,
    rows = Level.rows,
    fill = Level.fill,
    iterations = Level.mapIterations
  ) {
    const map = new Map.Cellular(cols, rows);

    map.randomize(fill);
    for (let i = 0; i < iterations; i++) {
      map.create();
    }

    const { _map: heights } = map;

    return heights;
  }
}
