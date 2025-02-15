import { MeshBasicMaterial } from 'three';
import { Billboard } from './billboard';
import { Direction, DirectionsToRows, TexturedBillboardProps } from './model';
import { createMaterial } from './utils';

export class TexturedBillboard extends Billboard {
  readonly isPlayer: boolean = false;

  frame = 0;
  invFrameDuration: number;
  totalFrames: number;
  cols: number;
  rows: number;
  directionsToRows: DirectionsToRows;

  protected invCols: number;
  protected invRows: number;

  constructor({
    textureName = '',
    frameDuration = 120,
    totalFrames = 6,
    cols = 3,
    rows = 6,
    directionsToRows = {}
  }: TexturedBillboardProps) {
    super(createMaterial(textureName, cols, rows));

    this.invFrameDuration = 1 / frameDuration;
    this.totalFrames = totalFrames;
    this.cols = cols;
    this.rows = rows;
    this.invCols = 1 / cols;
    this.invRows = 1 / rows;
    this.directionsToRows = directionsToRows;
  }

  protected getRow(direction: Direction) {
    return (
      this.rows -
      this.totalFrames * this.invCols -
      ((this.directionsToRows[direction] ?? this.directionsToRows.default) || 0)
    );
  }

  protected update(ms = 0) {
    // Sprawdzamy, czy jakikolwiek klawisz jest aktywny (wydajniejsza metoda)
    for (const key in this.state.keys) {
      if (this.state.keys[key]) {
        this.frame =
          (this.frame + ms * this.invFrameDuration) % this.totalFrames;
        break; // Nie musimy dalej sprawdzać
      }
    }

    const frameIndex = Math.floor(this.frame);
    const row = this.getRow(this.direction);
    const x = frameIndex % this.cols;
    const y = Math.floor(frameIndex * this.invCols) + row;
    const { material } = this.mesh;

    if (!(material instanceof MeshBasicMaterial)) return;

    material.map?.offset.set(x * this.invCols, y * this.invRows);

    if (this.direction === 'left') {
      this.scale.x = -Math.abs(this.scale.x);
    }

    if (this.direction === 'right') {
      this.scale.x = Math.abs(this.scale.x);
    }

    super.update(ms);
  }
}
