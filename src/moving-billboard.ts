import { Vector2 } from 'three';
import { Billboard } from './billboard';
import { DynamicBody } from './billboard-body';
import { State, TexturedBillboardProps } from './model';
import { physics } from './state';
import { normalizeAngle } from './utils';

export class MovingBillboard extends Billboard {
  static readonly moveSpeed = 3;
  static readonly rotateSpeed = 4;
  static readonly gravity = 9.1;
  static readonly jumpSpeed = 2.1;

  velocity = 0;
  state: State;
  declare body: DynamicBody;

  get gear() {
    let gear = 0;

    if (this.state.keys.up) {
      gear++;
    }

    if (this.state.keys.down) {
      gear--;
    }

    return gear;
  }

  constructor(
    props: TexturedBillboardProps,
    state: State = {
      keys: {},
      mouse: new Vector2()
    }
  ) {
    super(props);
    this.state = state;
  }

  update(ms: number): void {
    const deltaTime = ms * 0.001;
    const floorZ = this.getFloorZ();
    const gear = this.gear;

    if (this.z > floorZ) {
      this.velocity -= MovingBillboard.gravity * deltaTime;
    } else {
      this.velocity = this.state.keys.space ? MovingBillboard.jumpSpeed : 0;
    }

    if (this.velocity !== 0 || this.z !== floorZ) {
      this.z = Math.max(
        this.z + deltaTime * MovingBillboard.jumpSpeed * this.velocity,
        floorZ,
        0
      );
    }

    if (
      this.state.keys.left ||
      this.state.keys.right ||
      (this.state.mouseDown && this.state.mouse.x !== 0)
    ) {
      const scale = this.state.keys.left
        ? -1
        : this.state.keys.right
          ? 1
          : this.state.mouse.x;
      if (scale !== 0) {
        this.body.angle = normalizeAngle(
          this.body.angle +
            (gear || 1) * MovingBillboard.rotateSpeed * deltaTime * scale
        );
      }
    }

    const moveSpeed = gear * MovingBillboard.moveSpeed * deltaTime;
    if (moveSpeed) {
      this.body.move(moveSpeed);
      this.body.system?.separateBody(this.body);
    }

    for (const key in this.state.keys) {
      if (this.state.keys[key]) {
        this.frame =
          (this.frame + ms * this.invFrameDuration) % this.totalFrames;
        break;
      }
    }

    super.update(ms);
  }

  protected createBody(x: number, y: number) {
    const body = new DynamicBody(x, y);
    physics.insert(body);
    return body;
  }

  protected updateTexture() {
    super.updateTexture();

    const noLeft = !('left' in this.directionsToRows);
    const noRight = !('right' in this.directionsToRows);
    if (!noLeft && !noRight) return;

    const sign = Math.sign(this.mesh.scale.x);
    if (this.direction === 'left' && sign > 0) {
      this.mesh.scale.set(
        noLeft ? -this.scale : this.scale,
        this.scale,
        this.scale
      );
    } else if (this.direction === 'right' && sign < 0) {
      this.mesh.scale.set(
        noLeft ? this.scale : -this.scale,
        this.scale,
        this.scale
      );
    }
  }

  protected getAngle() {
    return this.body.angle;
  }
}
