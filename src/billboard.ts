import { Mesh, PlaneGeometry, Vector2, Vector3 } from 'three';
import { Level } from './level';
import { Material, State } from './model';
import { floors, physics, renderer, waterZ } from './state';
import { BillboardBody } from './billboard-body';

export class Billboard {
  static readonly moveSpeed = 2.5;
  static readonly rotateSpeed = 3;
  static readonly gravity = 9.1;
  static readonly jumpSpeed = 2.1;

  readonly isPlayer: boolean = false;

  body = new BillboardBody();
  mesh: Mesh;
  scale: Vector3;
  state: State = {
    keys: {},
    mouse: new Vector2(),
    direction: Math.random() * 2 * Math.PI
  };

  level?: Level;
  z = 0;
  velocity = 0;

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

  protected get gear() {
    let gear = 0;

    if (this.state.keys.up) {
      gear++;
    }

    if (this.state.keys.down) {
      gear--;
    }

    if (this.z < waterZ) {
      gear /= 2;
    }

    return gear;
  }

  protected spawn(level: Level) {
    const x = Math.random() * (Level.cols - 2) + 1;
    const y = Math.random() * (Level.rows - 2) + 1;

    this.level = level;
    this.body.setPosition(x, y);
    this.z = this.getFloorZ();
    this.mesh.position.set(x, this.z, y);

    physics.insert(this.body);
  }

  protected normalize(angle: number) {
    return (2 * Math.PI + angle) % (2 * Math.PI);
  }

  protected getFloorZ({ x, y } = this.body) {
    return this.level ? this.level.getFloor(x, y) / 2 : 0;
  }

  protected updateDirection(deltaTime: number) {
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

      this.state.direction +=
        rotateGear * Billboard.rotateSpeed * deltaTime * scale;
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
    const moveSpeed = this.gear * Billboard.moveSpeed * deltaTime;
    const floorZ = this.getFloorZ();

    this.updateVelocity(floorZ, deltaTime);
    this.updateZ(floorZ, deltaTime);
    this.updateGroup();
    this.updateDirection(deltaTime);

    this.body.angle = this.state.direction + Math.PI / 2;
    this.body.move(moveSpeed);
    this.body.system?.separateBody(this.body);

    this.mesh.position.set(this.body.x, this.z, this.body.y);
    this.mesh.lookAt(renderer.camera.position);
    this.mesh.up = renderer.camera.up;
    this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
  }
}
