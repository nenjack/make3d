import { Map } from 'rot-js'
import { maxLevelHeight, minLevelHeight, physics } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'

export abstract class AbstractLevel {
  static readonly STEP = 0.33
  static readonly COLS = DeviceDetector.HIGH_END ? 48 : 24
  static readonly ROWS = DeviceDetector.HIGH_END ? 48 : 24

  static zToStep(z = 0) {
    return Math.round(z / AbstractLevel.STEP)
  }

  static reducer(input: number[][], heights: number[][]) {
    return heights.map(
      (column: number[], x: number) =>
        column.map((value, y) => (input[x]?.[y] || 0) + value),
      []
    )
  }

  static createMatrix({
    min = 0,
    max = 1,
    iterations = AbstractLevel.ITERATIONS,
    fill = AbstractLevel.FILL,
    cols = AbstractLevel.COLS,
    rows = AbstractLevel.ROWS
  }) {
    return Array.from({ length: max }, () => {
      const map = new Map.Cellular(cols, rows)

      map.randomize(fill)
      for (let i = 0; i < iterations; i++) {
        map.create()
      }

      return map._map
    })
      .reduce(AbstractLevel.reducer, [])
      .map((arrays) =>
        arrays.map((value) => Math.max(0, value - min) * AbstractLevel.STEP)
      )
  }

  protected static readonly FILL = 0.5
  protected static readonly ITERATIONS = 4

  protected readonly heights: number[][] = []

  constructor() {
    this.heights = AbstractLevel.createMatrix({
      min: minLevelHeight,
      max: maxLevelHeight
    })
  }

  getZ(x: number, y: number) {
    const posX = Math.floor(x + AbstractLevel.COLS / 2)
    const posY = Math.floor(y + AbstractLevel.ROWS / 2)

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

  protected getXY(col: number, row: number) {
    return {
      x: col - AbstractLevel.COLS / 2,
      y: row - AbstractLevel.ROWS / 2
    }
  }

  protected createCollider(col: number, row: number, z: number) {
    const { x, y } = this.getXY(col, row)
    return physics.createBox({ x, y }, 1, 1, {
      isStatic: true,
      userData: { step: AbstractLevel.zToStep(z) }
    })
  }
}
