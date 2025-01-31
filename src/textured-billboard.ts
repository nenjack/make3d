import { MeshBasicMaterial } from 'three';
import { Billboard } from './billboard';
import { Material } from './model';
import { renderer } from './state';
import { createMaterial } from './utils';

export type Direction = 'down' | 'right' | 'up' | 'left';

export type directionsToRows = Partial<Record<Direction | 'default', number>>;

export interface TexturedBillboardProps {
  textureName: string;
  frameDuration?: number;
  totalFrames?: number;
  directionsToRows?: directionsToRows;
}

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
  directionsToRows: directionsToRows;

  constructor({
    textureName = '',
    frameDuration = 60,
    totalFrames = 1,
    directionsToRows = {}
  }: TexturedBillboardProps) {
    super(createMaterial(textureName));

    this.frameDuration = frameDuration;
    this.directionsToRows = directionsToRows;
    this.totalFrames = totalFrames;
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
      (this.directionsToRows[direction] ?? this.directionsToRows.default) || 0
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
    const x = (frame % 3) / 3;
    const y = (Math.floor(frame / 3) + row) / this.totalFrames;

    const material = this.mesh.material as Material;
    if (material instanceof MeshBasicMaterial) {
      material.map?.offset.set(x, y);
      this.scale.x = (direction === 'left' ? -1 : 1) * Math.abs(this.scale.x);
    }
  }
}
