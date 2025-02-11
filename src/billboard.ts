import { Mesh, PlaneGeometry, Vector2, Vector3 } from 'three';
import { BillboardBody } from './billboard-body';
import { Level } from './level';
import { Direction, Material, State } from './model';
import {
  directions,
  floors,
  physics,
  renderer,
  reverseDirections,
  state,
  waterZ
} from './state';
import { normalizeAngle } from './utils';

export class Billboard {
  static readonly moveSpeed = 3;
  static readonly rotateSpeed = 4;
  static readonly gravity = 9.1;
  static readonly jumpSpeed = 2.1;

  readonly isPlayer: boolean = false;

  z = 0;
  velocity = 0;
  body = new BillboardBody();
  direction: Direction = 'up';
  state: State = {
    keys: {},
    mouse: new Vector2()
  };

  mesh: Mesh;
  scale: Vector3;
  level?: Level;

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

  constructor(material: Material) {
    this.mesh = new Mesh(new PlaneGeometry(1, 1, 1, 1), material);
    this.scale = material.scale ? material.scale.clone() : new Vector3(1, 1, 1);

    if (material.size) {
      this.scale.x *= material.size.x / 64;
      this.scale.y *= material.size.y / 64;
    }

    renderer.scene.add(this.mesh);
    renderer.animations.push((time: number) => {
      this.update(time);
    });
  }

  protected spawn(level: Level) {
    const x = Math.random() * (Level.cols / 2 - 2) + 1;
    const y = Math.random() * (Level.rows / 2 - 2) + 1;

    this.level = level;
    this.body.setPosition(x, y);
    this.z = this.getFloorZ();
    this.mesh.position.set(x, this.z, y);

    physics.insert(this.body);
  }

  protected getFloorZ({ x, y } = this.body) {
    return this.level ? this.level.getFloor(x, y) / 2 : 0;
  }

  protected getDirection(): Direction {
    const gear = this.gear;
    if (!gear) {
      return this.direction;
    }

    const angle = this.body.angle - state.player.body.angle;
    const radians = normalizeAngle(gear * angle);
    const directionIndex = Math.floor((2 * radians) / Math.PI);

    return gear > 0
      ? directions[directionIndex]
      : reverseDirections[directionIndex];
  }

  protected updateDirectionFromKeys() {
    this.direction = this.getDirection();

    directions.forEach((direction) => {
      if (this.state.keys[direction]) {
        this.direction = direction;
      }
    });
  }

  protected updateAngle(deltaTime = 0) {
    const rotateGear = this.gear || 1;

    if (
      this.state.keys.left ||
      this.state.keys.right ||
      (this.state.mouseDown && this.state.mouse.x)
    ) {
      const scale = this.state.keys.left
        ? -1
        : this.state.keys.right
          ? 1
          : this.state.mouse.x;

      this.body.angle = normalizeAngle(
        this.body.angle + rotateGear * Billboard.rotateSpeed * deltaTime * scale
      );
    }
  }

  updateVelocity(floorZ: number, deltaTime = 0) {
    if (this.z > floorZ) {
      this.velocity -= Billboard.gravity * deltaTime;
    }

    if (this.z === floorZ) {
      this.velocity = this.state.keys.space ? Billboard.jumpSpeed : 0;
    }
  }

  updateZ(floorZ: number, deltaTime = 0) {
    const jump = deltaTime * Billboard.jumpSpeed * this.velocity;

    this.z = Math.max(this.z + jump, floorZ, 0);
  }

  updateGroup() {
    const floor = Math.floor(this.z * 2 + 0.5);

    this.body.group = floors[floor];
  }

  protected update(ms: number) {
    const deltaTime = ms / 1000;
    const floorZ = this.getFloorZ();

    let moveSpeed = this.gear * Billboard.moveSpeed * deltaTime;
    if (this.z < waterZ) {
      moveSpeed /= 2;
    }

    this.updateVelocity(floorZ, deltaTime);
    this.updateZ(floorZ, deltaTime);
    this.updateGroup();
    this.updateDirectionFromKeys();
    this.updateAngle(deltaTime);

    this.body.move(moveSpeed);
    this.body.system?.separateBody(this.body);

    this.mesh.position.set(this.body.x, this.z, this.body.y);
    this.mesh.lookAt(renderer.camera.position);
    this.mesh.up = new Vector3(0, 1, 0);
    this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
  }
}
