import { Texture, Vector3 } from 'three'
import { Box } from './box'
import { Cactus } from './cactus'
import { Level } from './level'
import { Ocean } from './ocean'
import { Palm } from './palm'
import { Skybox } from './skybox'
import { getMatrix } from './utils'
import { Renderer } from './renderer'
import { state } from './state'

export interface ViewLevelProps {
  canvas: HTMLCanvasElement
  ocean?: () => Ocean
  skybox?: () => Skybox
}

export class ViewLevel extends Level {
  static readonly FLORA_FILL = Level.FILL * 0.9
  static readonly FLORA_ITERATIONS = 1
  static readonly CACTUS_CHANCE = 0.25
  static readonly PALM_CHANCE = 0.1
  static readonly PALM_HEIGHT_START = 3

  mesh: Box

  constructor(textures: Texture[], { canvas, ocean, skybox }: ViewLevelProps) {
    super()

    state.renderer = new Renderer(canvas)
    state.renderer.ocean = ocean?.()
    state.renderer.skybox = skybox?.()

    this.mesh = this.createMesh(textures)
  }

  createBox(textures: Texture[]) {
    const box = new Box(textures, Level.COLS, Level.ROWS)
    box.position.set(-Level.COLS / 2, 0, -Level.ROWS / 2)

    return box
  }

  createMesh(textures: Texture[]) {
    const box = this.createBox(textures)

    this.forEachHeight(this.heights, (col, row, height) => {
      box.setMatrixAt(
        row * Level.ROWS + col,
        getMatrix(
          new Vector3(col, height / 4 - 0.75, row),
          new Vector3(1, height / 2, 1)
        )
      )

      const x = col - Level.COLS / 2
      const y = row - Level.ROWS / 2
      this.createBoxCollider(x, y, height)

      if (
        height >= ViewLevel.PALM_HEIGHT_START &&
        Math.random() < ViewLevel.PALM_CHANCE
      ) {
        new Palm(this, x + 0.5, y + 0.5)
      }
    })

    const flora = this.createFloraHeights()
    this.forEachHeight(flora, (col, row, chance) => {
      const height = this.heights[Math.floor(col / 2)][Math.floor(row / 2)]

      if (
        height &&
        Math.sqrt(chance * height) < ViewLevel.PALM_HEIGHT_START &&
        Math.random() < ViewLevel.CACTUS_CHANCE
      ) {
        const x = col / 2 - Level.COLS / 2 + 0.25
        const y = row / 2 - Level.ROWS / 2 + 0.25
        new Cactus(this, x, y)
      }
    })

    return box
  }

  createFloraHeights() {
    return this.createHeights(
      Level.COLS * 2,
      Level.ROWS * 2,
      ViewLevel.FLORA_FILL,
      ViewLevel.FLORA_ITERATIONS
    )
  }
}
