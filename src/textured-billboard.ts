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

  constructor({
    textureName = '',
    frameDuration = 120,
    totalFrames = 6,
    cols = 3,
    rows = 6,
    directionsToRows = {}
  }: TexturedBillboardProps) {
    super(createMaterial(textureName, cols, rows));

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

    // Sprawdzamy, czy jakikolwiek klawisz jest aktywny (wydajniejsza metoda)
    for (const key in this.state.keys) {
      if (this.state.keys[key]) {
        this.frame = (this.frame + ms / this.frameDuration) % this.totalFrames;
        break; // Nie musimy dalej sprawdzać
      }
    }

    const frameIndex = Math.floor(this.frame);
    const row = this.getRow(this.direction);
    const x = frameIndex % this.cols;
    const y = Math.floor(frameIndex / this.cols) + row;

    const material = this.mesh.material as Material;
    if (!(material instanceof MeshBasicMaterial)) return;

    material.map?.offset.set(x / this.cols, y / this.rows);

    // Optymalizacja operacji na skali (tylko jeśli wartość się zmienia)
    const newScaleX =
      (this.direction === 'left' ? -1 : 1) * Math.abs(this.scale.x);
    if (this.scale.x !== newScaleX) {
      this.scale.x = newScaleX;
    }
  }
}
