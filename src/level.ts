import { Map } from 'rot-js';
import { maxLevelHeight, minLevelHeight } from './state';

export class Level {
  static readonly fill = 0.5;
  static readonly mapIterations = 4;
  static readonly cols = 24;
  static readonly rows = 24;

  heights: number[][] = [];

  constructor() {
    this.heights = Array.from({ length: maxLevelHeight + minLevelHeight }, () =>
      this.createMap()
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

  getFloor(x: number, y: number) {
    return (
      this.heights[Math.floor(x + Level.cols / 2)]?.[
        Math.floor(y + Level.rows / 2)
      ] || 0
    );
  }

  protected createMap(fill = Level.fill, iterations = Level.mapIterations) {
    const map = new Map.Cellular(Level.cols, Level.rows);

    map.randomize(fill);
    for (let i = 0; i < iterations; i++) {
      map.create();
    }

    const { _map: heights } = map;

    return heights;
  }
}
