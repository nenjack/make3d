import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Vector3
} from 'three'
import { StaticBody } from '../body/static-body'
import { Camera } from '../core/camera'
import { type Level } from '../level'
import { BaseLevel } from '../level/base-level'
import { BaseBody, BillboardProps, Direction, DirectionsToRows } from '../model'
import { directions, state } from '../state'
import {
  createMaterial,
  getTextureName,
  loadTextures,
  normalizeAngle
} from '../utils/view-utils'

export interface BillboardCreateProps extends Omit<
  BillboardProps,
  'textureName' | 'level'
> {
  texture: string
}

export class Billboard {
  static async create<T = Billboard>(
    level: Level,
    { texture, ...props }: BillboardCreateProps,
    Class: any = Billboard
  ) {
    await loadTextures([texture])
    const textureName = getTextureName(texture)
    return new Class({ level, textureName, ...props }) as T
  }

  protected static compensateGroupZ = 0.2
  protected static tempVector = new Vector3()

  mesh: Mesh | Object3D
  body!: BaseBody

  protected frame = 0
  protected direction: Direction = 'up'
  protected directionsToRows: DirectionsToRows
  protected cols: number
  protected rows: number
  protected totalFrames: number
  protected frameDuration: number
  protected invCols: number
  protected invRows: number
  protected invFrameDuration: number
  protected centerOffset: number
  protected scaleX: number
  protected scaleY: number
  protected level?: Level

  constructor({
    level,
    x,
    y,
    scaleX,
    scaleY,
    cols = 1,
    rows = 1,
    totalFrames = 1,
    scale = 1,
    frameDuration = 120,
    textureName,
    ...props
  }: BillboardProps) {
    this.cols = cols
    this.rows = rows
    this.invCols = 1 / this.cols
    this.invRows = 1 / this.rows
    this.frameDuration = frameDuration || 120
    this.invFrameDuration = 1 / this.frameDuration
    this.totalFrames = totalFrames || 1
    this.directionsToRows = props.directionsToRows || { default: 0 }

    this.scaleX = (scaleX || scale) / 2
    this.scaleY = (scaleY || scale) / 2
    this.centerOffset = -0.2 + this.scaleY / 3
    this.mesh = this.createMesh(textureName)

    this.spawn(level, x, y)
    state.renderer.add(this)
  }

  update(_ms: number): void {
    this.direction = this.getDirection()
    this.mesh.position.set(
      this.body.x,
      this.body.z + this.centerOffset,
      this.body.y
    )

    const playerPos = state.player?.mesh.position

    if (!playerPos) {
      return
    }

    const cameraPos = state.renderer.camera.position
    const x = cameraPos.x - (playerPos.x - cameraPos.x) * 2
    const z = cameraPos.z - (playerPos.z - cameraPos.z) * 2

    this.mesh.lookAt(Billboard.tempVector.set(x, cameraPos.y, z))

    if (this.totalFrames > 1) {
      this.updateTexture()
    }
  }

  getWorldX() {
    return this.getProjection()?.x || 0
  }

  getWorldY() {
    return -(this.getProjection()?.y || 0)
  }

  protected getProjection() {
    if (state.renderer?.camera) {
      this.mesh.getWorldPosition(Camera.projection)
      Camera.projection.project(state.renderer.camera)

      return Camera.projection
    }
  }

  protected createMesh(textureName: string) {
    try {
      const material = createMaterial(textureName, this.cols, this.rows)
      const image = material.map!.image as { width: number; height: number }
      const w = image.width / this.cols
      const h = image.height / this.rows
      const max = Math.max(w, h)
      const width = (this.scaleX * w) / max
      const height = (this.scaleY * h) / max

      return new Mesh(new PlaneGeometry(width, height), material)
    } catch (materialError) {
      console.error({ textureName, materialError })

      return new Object3D()
    }
  }

  protected createBody(x: number, y: number, level: Level) {
    return new StaticBody(x, y, level)
  }

  protected spawn(
    level: Level,
    x = (Math.random() - 0.5) * (BaseLevel.COLS * 0.5),
    y = (Math.random() - 0.5) * (BaseLevel.ROWS * 0.5)
  ) {
    this.body = this.createBody(x, y, level)
    this.mesh.position.set(x, this.body.z, y)
  }

  protected updateTexture() {
    if (this.mesh instanceof Mesh) {
      const frameIndex = Math.floor(this.frame)
      const row = this.getRow(this.direction)
      const x = frameIndex % this.cols
      const y = Math.floor(frameIndex * this.invCols) + row
      const materials = Array.isArray(this.mesh.material)
        ? this.mesh.material
        : [this.mesh.material]

      materials.forEach((material) => {
        if (material instanceof MeshBasicMaterial) {
          material.map?.offset.set(x * this.invCols, y * this.invRows)
        }
      })
    }
  }

  protected getDirection() {
    const cameraAngle =
      state.player?.body.angle || state.renderer.camera.rotation.y
    const angle = normalizeAngle(this.body.angle - cameraAngle)
    const directionIndex = Math.floor((2 * angle) / Math.PI)

    return directions[directionIndex]
  }

  protected getRow(direction: Direction) {
    return (
      this.rows -
      this.totalFrames * this.invCols -
      ((this.directionsToRows[direction] ?? this.directionsToRows.default) || 0)
    )
  }
}
