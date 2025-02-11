import { MeshBasicMaterial } from 'three';
import { Billboard } from './billboard';
import {
  Direction,
  DirectionsToRows,
  Material,
  TexturedBillboardProps
} from './model';
import { createMaterial } from './utils';

export class TexturedBillboard extends Billboard {
  readonly isPlayer: boolean = false;

  frame = 0;
  frameDuration: number;
  totalFrames: number;
  cols: number;
  rows: number;
  directionsToRows: DirectionsToRows;

  static createMaterial(textureName: string, cols: number, rows: number) {
    const material = createMaterial(textureName);

    material.map?.repeat.set(1 / cols, 1 / rows);

    return material;
  }

  constructor({
    textureName = '',
    frameDuration = 120,
    totalFrames = 6,
    cols = 3,
    rows = 6,
    directionsToRows = {}
  }: TexturedBillboardProps) {
    super(TexturedBillboard.createMaterial(textureName, cols, rows));

    this.frameDuration = frameDuration;
    this.totalFrames = totalFrames;
    this.cols = cols;
    this.rows = rows;
    this.directionsToRows = directionsToRows;
  }

  protected getRow(direction: Direction) {
    return (
      this.rows -
      this.totalFrames / this.cols -
      ((this.directionsToRows[direction] ?? this.directionsToRows.default) || 0)
    );
  }

  protected update(ms: number) {
    super.update(ms);

    if (Object.values(this.state.keys).some(Boolean)) {
      this.frame = (this.frame + ms / this.frameDuration) % this.totalFrames;
    }

    const frame = Math.floor(this.frame);
    const row = this.getRow(this.direction);
    const x = frame % this.cols;
    const y = Math.floor(frame / this.cols) + row;

    const material = this.mesh.material as Material;
    if (material instanceof MeshBasicMaterial) {
      material.map?.offset.set(x / this.cols, y / this.rows);

      this.scale.x =
        (this.direction === 'left' ? -1 : 1) * Math.abs(this.scale.x);
    }
  }
}
