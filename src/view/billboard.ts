import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Vector3
} from 'three'
import { StaticBody } from '../body/static-body'
import { type Level } from '../level'
import { BaseLevel } from '../level/base-level'
import { BaseBody, BillboardProps, Direction, DirectionsToRows } from '../model'
import { directions, floors, state } from '../state'
import { createMaterial, normalizeAngle } from '../utils/view-utils'

export class Billboard {
  static compensateGroupZ = 0.2

  protected static tempVector = new Vector3()
  protected static tempVectorDivide = new Vector3(2, 2, 2)

  frame = 0
  direction: Direction = 'up'
  directionsToRows: DirectionsToRows
  mesh: Mesh | Object3D
  body!: BaseBody
  cols: number
  rows: number
  totalFrames: number
  frameDuration: number
  invCols: number
  invRows: number
  invFrameDuration: number
  centerOffset: number
  scaleX: number
  scaleY: number
  level?: Level

  get z() {
    return this._z
  }

  set z(z: number) {
    this._z = z
    this.updateGroup()
  }

  protected _z = 0

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

    this.mesh.position.set(this.body.x, this.z + this.centerOffset, this.body.y)
    this.mesh.lookAt(
      Billboard.tempVector.set(
        state.renderer.camera.position.x,
        this.mesh.position.y,
        state.renderer.camera.position.z
      )
    )

    if (this.totalFrames > 1) {
      this.updateTexture()
    }
  }

  getScreenPosition() {
    return state.renderer.camera.getScreenPosition(this.mesh)
  }

  createMesh(textureName: string) {
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

  protected updateGroup() {
    this.body.group =
      floors[Math.round((this.z - Billboard.compensateGroupZ) * 2)]
  }

  protected createBody(x: number, y: number) {
    return new StaticBody(x, y)
  }

  protected spawn(
    level: Level,
    x = (Math.random() - 0.5) * (BaseLevel.COLS * 0.5),
    y = (Math.random() - 0.5) * (BaseLevel.ROWS * 0.5)
  ) {
    this.level = level
    this.body = this.createBody(x, y)
    this.z = this.getFloorZ()
    this.mesh.position.set(x, this.z, y)
  }

  protected getFloorZ({ x, y } = this.body) {
    return this.level ? this.level.getFloor(x, y) / 2 : 0
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
