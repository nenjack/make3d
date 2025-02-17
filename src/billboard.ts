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
  static billboards: Billboard[] = [];

  protected static tempVector = new Vector3();
  protected static tempVectorDivide = new Vector3(2, 2, 2);

  frame = 0;
  direction: Direction = 'up';
  directionsToRows: DirectionsToRows;
  material: Material;
  mesh: Mesh;
  body!: BodyLike;
  cols: number;
  rows: number;
  totalFrames: number;
  frameDuration: number;
  invCols: number;
  invRows: number;
  invFrameDuration: number;
  centerOffset: number;
  scaleX: number;
  scaleY: number;
  level?: Level;

  get z() {
    return this._z;
  }

  set z(z: number) {
    this._z = z;
    this.body.group = floors[Math.round(z * 2)];
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

    const scale = props.scale || 1;
    this.scaleX = (props.scaleX || scale) / 2;
    this.scaleY = (props.scaleY || scale) / 2;
    this.centerOffset = -0.2 + this.scaleY / 3; // this.scale / 4;
    this.material = createMaterial(props.textureName, props.cols, props.rows);
    const w = this.material.map!.image.width / this.cols;
    const h = this.material.map!.image.height / this.rows;
    const m = Math.max(w, h);
    this.mesh = new Mesh(
      new PlaneGeometry((this.scaleX * w) / m, (this.scaleY * h) / m),
      this.material
    );

    renderer.scene.add(this.mesh);
    Billboard.billboards.push(this);
  }

  update(_ms: number): void {
    this.direction = this.getDirection();

    this.mesh.position.set(
      this.body.x,
      this.z + this.centerOffset,
      this.body.y
    );

    this.mesh.lookAt(
      Billboard.tempVector.set(
        renderer.camera.position.x,
        this.mesh.position.y,
        renderer.camera.position.z
      )
    );

    if (this.totalFrames > 1) {
      this.updateTexture();
    }
  }

  getScreenPosition() {
    return renderer.camera.getScreenPosition(this.mesh);
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
    const cameraAngle = state.player?.body.angle || renderer.camera.rotation.y;
    const angle = normalizeAngle(this.body.angle - cameraAngle);
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
