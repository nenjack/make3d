import { Mesh, PlaneGeometry, Vector3 } from 'three';
import { BodyLike, StaticBody } from './billboard-body';
import { Level } from './level';
import {
  Direction,
  DirectionsToRows,
  Material,
  TexturedBillboardProps
} from './model';
import { directions, floors, renderer, state } from './state';
import { createMaterial, normalizeAngle } from './utils';

export class Billboard {
  protected static tempVector = new Vector3();
  protected static tempVectorDivide = new Vector3(2, 2, 2);

  frame = 0;
  direction: Direction = 'up';
  material: Material;
  mesh: Mesh;
  body!: BodyLike;
  scale: number;
  cols: number;
  rows: number;
  frameDuration: number;
  invCols: number;
  invRows: number;
  invFrameDuration: number;
  totalFrames: number;
  centerOffset: number;
  directionsToRows: DirectionsToRows;
  level?: Level;

  get z() {
    return this._z;
  }

  set z(z: number) {
    this._z = z;
    this.body.group = floors[Math.floor(z * 2 + 0.5)];
  }

  protected _z = 0;

  constructor(props: TexturedBillboardProps) {
    this.cols = props.cols || 1;
    this.rows = props.rows || 1;
    this.frameDuration = props.frameDuration || 120;
    this.invCols = 1 / this.cols;
    this.invRows = 1 / this.rows;
    this.invFrameDuration = 1 / this.frameDuration;
    this.totalFrames = props.totalFrames || 1;
    this.directionsToRows = props.directionsToRows || { default: 0 };

    this.scale = (props.scale || 1) / 2;
    this.centerOffset = -0.2 + this.scale / 3; // this.scale / 4;
    this.material = createMaterial(props.textureName, props.cols, props.rows);
    const w = this.material.map!.image.width / this.cols;
    const h = this.material.map!.image.height / this.rows;
    const m = Math.max(w, h);
    this.mesh = new Mesh(new PlaneGeometry(w / m, h / m), this.material);
    this.mesh.scale.set(this.scale, this.scale, this.scale);

    renderer.scene.add(this.mesh);
    renderer.animations.push((ms: number) => {
      this.update(ms);
    });
  }

  update(_ms: number): void {
    this.direction = this.getDirection();

    this.mesh.position.set(
      this.body.x,
      this.z + this.centerOffset,
      this.body.y
    );

    this.mesh.lookAt(
      Billboard.tempVector
        .copy(renderer.camera.position)
        .add(this.mesh.position)
        .divide(Billboard.tempVectorDivide)
    );

    if (this.totalFrames > 1) {
      this.updateTexture();
    }
  }

  protected createBody(x: number, y: number) {
    return new StaticBody(x, y);
  }

  protected spawn(
    level: Level,
    x = (Math.random() * Level.cols) / 2,
    y = (Math.random() * Level.rows) / 2
  ) {
    this.body = this.createBody(x, y);
    this.level = level;
    this.z = this.getFloorZ();
    this.mesh.position.set(x, this.z, y);
  }

  protected getFloorZ({ x, y } = this.body) {
    return this.level ? this.level.getFloor(x, y) / 2 : 0;
  }

  protected updateTexture() {
    const frameIndex = Math.floor(this.frame);
    const row = this.getRow(this.direction);
    const x = frameIndex % this.cols;
    const y = Math.floor(frameIndex * this.invCols) + row;
    const { map } = this.mesh.material as any;

    map?.offset.set(x * this.invCols, y * this.invRows);
  }

  protected getDirection() {
    const angle = normalizeAngle(this.body.angle - state.player.body.angle);
    const directionIndex = Math.floor((2 * angle) / Math.PI);

    return directions[directionIndex];
  }

  protected getRow(direction: Direction) {
    return (
      this.rows -
      this.totalFrames * this.invCols -
      ((this.directionsToRows[direction] ?? this.directionsToRows.default) || 0)
    );
  }
}
