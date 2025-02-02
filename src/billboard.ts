import { Circle } from 'detect-collisions';
import { Mesh, PlaneGeometry, Vector2, Vector3 } from 'three';
import { Level } from './level';
import { Material, State } from './model';
import { floors, physics, renderer, waterFloor } from './state';

export class Billboard {
  static readonly offsetZ = 0.25;
  static readonly moveSpeed = 2.5;
  static readonly rotateSpeed = 3;
  static readonly jumpSpeed = 2;

  readonly tireRate = 0.008;
  readonly isPlayer: boolean = false;

  z = -Infinity;
  velocity = 0;
  level?: Level;
  mesh: Mesh;
  body: Circle;
  scale: Vector3;
  state: State = {
    keys: {},
    mouse: new Vector2(),
    direction: Math.random() * 2 * Math.PI
  };

  constructor(material: Material) {
    this.body = physics.createCircle({}, 0.25, { group: floors[0] });
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

    if (this.z === waterFloor) {
      gear /= 2;
    }

    return gear;
  }

  protected init(level: Level) {
    const x = Math.random() * (Level.cols - 2) + 1;
    const y = Math.random() * (Level.rows - 2) + 1;
    const floor = level.getFloor(x, y);

    this.level = level;
    this.body.setPosition(x, y);
    this.z = floor / 2;
    this.mesh.position.set(this.body.x, this.body.y, this.z + 0.25);
  }

  protected normalize(angle: number) {
    return (2 * Math.PI + angle) % (2 * Math.PI);
  }

  protected update(ms: number) {
    const deltaTime = ms / 1000;
    const rotateGear = this.gear || 1;
    const moveSpeed = this.gear * Billboard.moveSpeed * deltaTime;

    if (
      this.state.keys.left ||
      this.state.keys.right ||
      (this.state.mouseDown && this.state.mouse.x)
    ) {
      const scale = this.state.keys.left
        ? 1
        : this.state.keys.right
          ? -1
          : -this.state.mouse.x;

      this.state.direction +=
        rotateGear * Billboard.rotateSpeed * deltaTime * scale;
    }

    const jump = deltaTime * Billboard.jumpSpeed * this.velocity;
    const levelFloorHeight = this.level
      ? this.level.getFloor(this.body.x, this.body.y) / 2
      : 0;

    if (this.z === levelFloorHeight || this.z === waterFloor) {
      this.velocity = this.state.keys.space ? Billboard.jumpSpeed : -0.1;
    } else {
      this.velocity -= this.tireRate * ms;
    }

    this.z =
      levelFloorHeight && this.z > -waterFloor
        ? Math.max(levelFloorHeight, this.z + jump)
        : Math.max(waterFloor, this.z + jump);

    const playerFloor = Math.floor((this.z + 0.25) * 2);

    this.body.group = floors[playerFloor];
    this.body.angle = this.state.direction + Math.PI / 2;
    this.body.move(moveSpeed);
    this.body.system?.separateBody(this.body);

    this.mesh.position.set(
      this.body.x,
      this.body.y,
      this.z + Billboard.offsetZ
    );
    this.mesh.lookAt(renderer.camera.position);
    this.mesh.up = renderer.camera.up;
    this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
  }
}
