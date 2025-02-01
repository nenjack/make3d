import { Map } from 'rot-js';
import Cellular from 'rot-js/lib/map/cellular';
import { renderer } from './state';

export class Level {
  static readonly fill = 0.5;
  static readonly maxHeight = 10;
  static readonly waterLevel = 3;
  static readonly cols = 32;
  static readonly rows = 32;

  heights: number[][] = [];
  map!: Cellular;

  constructor(idle = false) {
    this.heights = Array.from({ length: Level.maxHeight }, () =>
      this.createMap()
    )
      .reduce(
        (arrays, array) =>
          array.map(
            (column, x) =>
              column.map(
                (value, y) => (arrays[x]?.[y] ?? -Level.waterLevel) + value
              ),
            []
          ),
        []
      )
      .map((arrays) => arrays.map((value) => Math.max(0, value)));

    if (!idle) {
      renderer.camera.setLevel(this);
    }
  }

  getFloor(x: number, y: number) {
    return this.heights[Math.floor(x)]?.[Math.floor(y)] || 0;
  }

  protected createMap(fill = Level.fill, iterations = Level.maxHeight) {
    const map = new Map.Cellular(Level.cols, Level.rows);

    map.randomize(fill);
    for (let i = 0; i < iterations; i++) {
      map.create();
    }

    const { _map: heights } = map;

    return heights;
  }
}
