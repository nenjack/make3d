import { Texture, Vector3 } from 'three'
import { Box } from './box'
import { Bush, bushProps } from './bush'
import { Events } from './events'
import { Level } from './level'
import { Renderer, RendererProps } from './renderer'
import { loadedTextures } from './state'
import { Tree, treeProps } from './tree'
import { getMatrix } from './utils'

export class ViewLevel extends Level {
  static readonly BUSHES_FILL = Level.FILL * 0.9
  static readonly BUSHES_ITERATIONS = 1
  static readonly BUSH_CHANCE = 0.25
  static readonly TREE_CHANCE = 0.1
  static readonly TREE_HEIGHT_START = 3

  mesh: Box
  bushesHeights = this.createHeights(
    Level.COLS * 2,
    Level.ROWS * 2,
    ViewLevel.BUSHES_FILL,
    ViewLevel.BUSHES_ITERATIONS
  )

  constructor(textures: Texture[], props: RendererProps) {
    super()
    this.mesh = this.createMesh(textures)

    setTimeout(() => {
      Renderer.create(props)
      Events.addEventListeners()
    })
  }

  createBoxMesh(textures: Texture[]) {
    const box = new Box(textures, Level.COLS, Level.ROWS)
    box.position.set(-Level.COLS / 2, 0, -Level.ROWS / 2)

    return box
  }

  setLevelMesh(mesh: Box) {
    this.forEachHeight(this.heights, (col, row, height) => {
      this.setLevelAt(col, row, height, mesh)
      this.setColliderAt(col, row, height)
    })
  }

  createTrees() {
    if (treeProps.textureName in loadedTextures) {
      this.forEachHeight(this.heights, (col, row) => {
        const height = this.heights[Math.floor(col / 2)][Math.floor(row / 2)]
        if (
          height >= ViewLevel.TREE_HEIGHT_START &&
          Math.random() < ViewLevel.TREE_CHANCE
        ) {
          const { x, y } = this.getXY(col, row)
          new Tree(this, x + 0.5, y + 0.5)
        }
      })
    }
  }

  createBushes() {
    if (bushProps.textureName in loadedTextures) {
      this.forEachHeight(this.bushesHeights, (col, row, chance) => {
        const height = this.heights[Math.floor(col / 2)][Math.floor(row / 2)]
        if (
          height &&
          Math.sqrt(chance * height) < ViewLevel.TREE_HEIGHT_START &&
          Math.random() < ViewLevel.BUSH_CHANCE
        ) {
          const x = col / 2 - Level.COLS / 2 + 0.25
          const y = row / 2 - Level.ROWS / 2 + 0.25
          new Bush(this, x, y)
        }
      })
    }
  }

  createMesh(textures: Texture[]) {
    const mesh = this.createBoxMesh(textures)
    this.setLevelMesh(mesh)
    this.createBushes()
    return mesh
  }

  setLevelAt(col: number, row: number, height: number, mesh: Box) {
    const matrix = getMatrix(
      new Vector3(col, height / 4 - 0.75, row),
      new Vector3(1, height / 2, 1)
    )

    mesh.setMatrixAt(row * Level.ROWS + col, matrix)
  }
}
