import { Texture, Vector3 } from 'three'
import { Renderer } from '../core/renderer'
import { Events } from '../events'
import { loadedTextures } from '../state'
import { getMatrix, loadTextures, mapCubeTextures } from '../utils/view-utils'
import { Bush } from '../view/bush'
import { SkyboxProps } from '../view/skybox'
import { Tree } from '../view/tree'
import { BaseLevel } from './base-level'
import { BoxMesh } from './box-mesh'

export type LevelPropsKeys = 'ocean' | 'floor' | 'sides'

export type LevelCreateProps<T = string> = Partial<Record<LevelPropsKeys, T>>

export interface LevelProps<T = Texture> extends LevelCreateProps<T> {
  textures: Texture[]
  canvas?: HTMLCanvasElement
  skybox?: SkyboxProps
}

export class Level extends BaseLevel {
  static TREE_TEXTURE = Tree.DEFAULT_PROPS.textureName
  static BUSH_TEXTURE = Bush.DEFAULT_PROPS.textureName

  protected static readonly SIDES = 'sides.webp'
  protected static readonly FLOOR = 'floor.webp'
  protected static readonly OCEAN = 'ocean.webp'
  protected static readonly TREE_FILL = 0.5
  protected static readonly TREE_CHANCE = 0.25
  protected static readonly TREE_HEIGHT_START = 2
  protected static readonly TREE_ITERATIONS = 2
  protected static readonly BUSH_FILL = 0.35
  protected static readonly BUSH_CHANCE = 0.6
  protected static readonly BUSH_HEIGHT_START = 1
  protected static readonly BUSH_ITERATIONS = 1

  mesh: BoxMesh

  protected readonly treeHeights = this.createHeights(
    Level.COLS,
    Level.ROWS,
    Level.TREE_FILL,
    Level.TREE_ITERATIONS
  )

  protected readonly bushesHeights = this.createHeights(
    Level.COLS * 2,
    Level.ROWS * 2,
    Level.BUSH_FILL,
    Level.BUSH_ITERATIONS
  )

  static async create(
    canvas?: HTMLCanvasElement,
    props?: LevelCreateProps
  ): Promise<Level> {
    const [sides, floor, ocean] = await loadTextures([
      props?.sides || 'sides.webp',
      props?.floor || 'floor.webp',
      props?.ocean || 'ocean.webp',
      `${Level.TREE_TEXTURE}.webp`,
      `${Level.BUSH_TEXTURE}.webp`
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

  protected createBoxMesh(textures: Texture[]) {
    const box = new BoxMesh(textures, Level.COLS, Level.ROWS)
    box.position.set(-Level.COLS / 2, 0, -Level.ROWS / 2)
    return box
  }

  protected createMesh(textures: Texture[]) {
    const mesh = this.createBoxMesh(textures)
    this.setLevelMesh(mesh)
    this.createTrees()
    this.createBushes()
    return mesh
  }

  protected createTrees() {
    if (Level.TREE_TEXTURE in loadedTextures) {
      this.forEachHeight(this.heights, (col, row, height) => {
        const allow = this.treeHeights[col][row]
        if (
          allow &&
          height >= Level.TREE_HEIGHT_START &&
          Math.random() < Level.TREE_CHANCE
        ) {
          const { x, y } = this.getXY(col, row)
          new Tree(this, x + 0.5, y + 0.5)
        }
      })
    }
  }

  protected createBushes() {
    if (Level.BUSH_TEXTURE in loadedTextures) {
      this.forEachHeight(this.bushesHeights, (col, row, allow) => {
        const height = this.heights[Math.floor(col / 2)][Math.floor(row / 2)]
        if (
          allow &&
          height >= Level.BUSH_HEIGHT_START &&
          Math.random() < Level.BUSH_CHANCE
        ) {
          const x = col / 2 - Level.COLS / 2 + 0.25
          const y = row / 2 - Level.ROWS / 2 + 0.25
          new Bush(this, x, y)
        }
      })
    }
  }

  protected setLevelMesh(mesh: BoxMesh) {
    this.forEachHeight(this.heights, (col, row, height) => {
      this.setLevelAt(col, row, height, mesh)
      this.setColliderAt(col, row, height)
    })
  }

  protected setLevelAt(
    col: number,
    row: number,
    height: number,
    mesh: BoxMesh
  ) {
    const matrix = getMatrix(
      new Vector3(col, height / 4 - 0.75, row),
      new Vector3(1, height / 2, 1)
    )

    mesh.setMatrixAt(row * Level.ROWS + col, matrix)
  }
}
