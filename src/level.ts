import { Map } from 'rot-js'
import { floors, maxLevelHeight, minLevelHeight, physics } from './state'
import { DeviceDetector } from './detect'

export class Level {
  static readonly FILL = 0.44
  static readonly ITERATIONS = 6
  static readonly COLS = DeviceDetector.HIGH_END ? 48 : 24
  static readonly ROWS = DeviceDetector.HIGH_END ? 48 : 24

  heights: number[][] = []

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
      .map((arrays) => arrays.map((value) => Math.max(0, value)))
  }

  getXY(col: number, row: number) {
    return {
      x: col - Level.COLS / 2,
      y: row - Level.ROWS / 2
    }
  }

  setColliderAt(col: number, row: number, height: number) {
    const { x, y } = this.getXY(col, row)
    for (let floor = 0; floor < height; floor++) {
      physics.createBox({ x, y }, 1, 1, {
        isStatic: true,
        group: floors[floor]
      })
    }
  }

  forEachHeight(
    heights = this.heights,
    iterator: (col: number, row: number, height: number) => void
  ) {
    heights.forEach((rows: number[], col: number) => {
      rows.forEach((height: number, row: number) => {
        if (height) {
          iterator(col, row, height)
        }
      })
    })
  }

  getFloor(x: number, y: number) {
    const posX = Math.floor(x + Level.COLS / 2)
    const posY = Math.floor(y + Level.ROWS / 2)

    return this.heights[posX]?.[posY] || 0
  }

  protected createHeights(
    cols = Level.COLS,
    rows = Level.ROWS,
    fill = Level.FILL,
    iterations = Level.ITERATIONS
  ) {
    const map = new Map.Cellular(cols, rows)

    map.randomize(fill)
    for (let i = 0; i < iterations; i++) {
      map.create()
    }

    const { _map: heights } = map

    return heights
  }
}
