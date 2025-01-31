import { MeshBasicMaterial } from 'three';
import { Billboard } from './billboard';
import {
  Direction,
  DirectionsToRows,
  Material,
  TexturedBillboardProps
} from './model';
import { renderer } from './state';
import { createMaterial } from './utils';

export class TexturedBillboard extends Billboard {
  static directions: Direction[] = ['down', 'right', 'up', 'left'];
  static reverseDirections: Direction[] = ['up', 'left', 'down', 'right'];

  static findByAngle =
    (angle: number) => (_animation: unknown, index: number) =>
      angle >= (Math.PI / 2) * index && angle < (Math.PI / 2) * (index + 1);

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
    const material = createMaterial(textureName);
    material.map?.repeat.set(1 / cols, 1 / rows);

    super(material);

    this.frameDuration = frameDuration;
    this.totalFrames = totalFrames;
    this.cols = cols;
    this.rows = rows;
    this.directionsToRows = directionsToRows;
  }

  protected getDirection() {
    const characterAngle = this.normalize(this.body.angle);
    const cameraAngle = this.normalize(
      renderer.camera.rotation.z - Math.PI / 2
    );
    const angle = this.normalize(characterAngle - cameraAngle + Math.PI / 4);
    const findByAngle = TexturedBillboard.findByAngle(angle);
    const direction =
      TexturedBillboard.directions.find(findByAngle) ||
      TexturedBillboard.directions[0];

    return this.gear === -1
      ? TexturedBillboard.reverseDirections[direction]
      : direction;
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
    const direction = this.getDirection();
    const row = this.getRow(direction);
    const x = frame % this.cols;
    const y = Math.floor(frame / this.cols) + row;

    const material = this.mesh.material as Material;
    if (material instanceof MeshBasicMaterial) {
      material.map?.offset.set(x / this.cols, y / this.rows);

      this.scale.x = (direction === 'left' ? -1 : 1) * Math.abs(this.scale.x);
    }
  }
}
