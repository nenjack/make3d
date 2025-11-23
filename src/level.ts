import { Texture, Vector3 } from 'three'
import { AbstractLevel } from './abstract-level'
import { Box } from './box'
import { Bush, bushProps } from './bush'
import { Events } from './events'
import { Renderer } from './renderer'
import { SkyboxProps } from './skybox'
import { loadedTextures } from './state'
import { Tree, treeProps } from './tree'
import { getMatrix, loadTextures, mapCubeTextures } from './utils'

export interface LevelProps<T = Texture> {
  textures: Texture[]
  canvas?: HTMLCanvasElement
  skybox?: SkyboxProps
  ocean?: T
  floor?: T
  sides?: T
}

export class Level extends AbstractLevel {
  static readonly BUSHES_FILL = Level.FILL * 0.9
  static readonly BUSHES_ITERATIONS = 1
  static readonly BUSH_CHANCE = 0.25
  static readonly TREE_CHANCE = 0.1
  static readonly TREE_HEIGHT_START = 3

  mesh: Box
  bushesHeights = this.createHeights(
    Level.COLS * 2,
    Level.ROWS * 2,
    Level.BUSHES_FILL,
    Level.BUSHES_ITERATIONS
  )
  static readonly SIDES = 'sides.webp'
  static readonly FLOOR = 'floor.webp'
  static readonly OCEAN = 'ocean.webp'

  static async create(canvas?: HTMLCanvasElement): Promise<Level> {
    const [sides, floor, ocean] = await loadTextures([
      'sides.webp',
      'floor.webp',
      'ocean.webp',
      `${treeProps.textureName}.webp`,
      `${bushProps.textureName}.webp`
    ])
    const textures = mapCubeTextures({
      up: floor,
      down: floor,
      left: sides,
      right: sides,
      front: sides,
      back: sides
    })
    return new Level({ textures, canvas, ocean })
  }

  constructor({ textures, canvas, ocean, skybox }: LevelProps) {
    super()
    Renderer.create({ canvas, ocean, skybox })
    Events.addEventListeners()
    this.mesh = this.createMesh(textures)
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
          height >= Level.TREE_HEIGHT_START &&
          Math.random() < Level.TREE_CHANCE
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
          Math.sqrt(chance * height) < Level.TREE_HEIGHT_START &&
          Math.random() < Level.BUSH_CHANCE
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
    this.createTrees()
    // this.createBushes()
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
