import { Map } from 'rot-js'
import { floors, maxLevelHeight, minLevelHeight, physics } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'

export abstract class BaseLevel {
  static readonly COLS = DeviceDetector.HIGH_END ? 48 : 24
  static readonly ROWS = DeviceDetector.HIGH_END ? 48 : 24

  static heightReducer(input: number[][], heights: number[][]) {
    return heights.map(
      (column: number[], x: number) =>
        column.map(
          (value, y) => (input[x]?.[y] ?? BaseLevel.BASE_HEIGHT) + value
        ),
      []
    )
  }

  protected static readonly FILL = 0.5
  protected static readonly ITERATIONS = 4
  protected static readonly BASE_HEIGHT = -minLevelHeight * 2

  protected readonly heights: number[][] = []

  constructor() {
    const length = maxLevelHeight + minLevelHeight
    this.heights = Array.from({ length }, () => this.createHeights())
      .reduce(BaseLevel.heightReducer, [])
      .map((arrays) => arrays.map((value) => Math.max(0, value)))
  }

  getFloor(x: number, y: number) {
    const posX = Math.floor(x + BaseLevel.COLS / 2)
    const posY = Math.floor(y + BaseLevel.ROWS / 2)

    return this.heights[posX]?.[posY] || 0
  }

  protected forEachHeight(
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

  protected createHeights(
    cols = BaseLevel.COLS,
    rows = BaseLevel.ROWS,
    fill = BaseLevel.FILL,
    iterations = BaseLevel.ITERATIONS
  ) {
    const map = new Map.Cellular(cols, rows)

    map.randomize(fill)
    for (let i = 0; i < iterations; i++) {
      map.create()
    }

    const { _map: heights } = map

    return heights
  }

  protected getXY(col: number, row: number) {
    return {
      x: col - BaseLevel.COLS / 2,
      y: row - BaseLevel.ROWS / 2
    }
  }

  protected setColliderAt(col: number, row: number, height: number) {
    const { x, y } = this.getXY(col, row)
    for (let floor = 0; floor < height; floor++) {
      physics.createBox({ x, y }, 1, 1, {
        isStatic: true,
        group: floors[floor]
      })
    }
  }
}
