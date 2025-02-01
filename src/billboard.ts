import { Circle } from 'detect-collisions';
import { Mesh, PlaneGeometry, Vector3 } from 'three';
import { Level } from './level';
import { Material, State } from './model';
import { floors, physics, renderer } from './state';

export class Billboard {
  static readonly offsetZ = 0.25;
  static readonly moveSpeed = 2.5;
  static readonly rotateSpeed = 3;
  static readonly jumpSpeed = 2.1;

  readonly tireRate = 0.0075;
  readonly isPlayer: boolean = false;

  z = 0;
  velocity = 0;
  level?: Level;
  mesh: Mesh;
  body: Circle;
  scale: Vector3;
  state: State = {
    direction: Math.random() * 2 * Math.PI,
    keys: {},
    mouse: {}
  };

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

  protected init(level: Level) {
    let x: number;
    let y: number;

    do {
      x = Math.random() * (level.size - 2) + 1;
      y = Math.random() * (level.size - 2) + 1;
    } while (level.getFloor(x, y) > 0);

    const height = level.getFloor(x, y) / 2;

    this.level = level;
    this.body.setPosition(x, y);
    this.z = height;
    this.mesh.position.set(this.body.x, this.body.y, this.z + 0.25);
  }

  protected normalize(angle: number) {
    return (2 * Math.PI + angle) % (2 * Math.PI);
  }

  protected update(ms: number) {
    const deltaTime = ms / 1000;
    const rotateGear = this.gear || 1;
    const moveSpeed = this.gear * Billboard.moveSpeed * deltaTime;

    if (this.state.keys.right) {
      this.state.direction -= rotateGear * Billboard.rotateSpeed * deltaTime;
    }

    if (this.state.keys.left) {
      this.state.direction += rotateGear * Billboard.rotateSpeed * deltaTime;
    }

    const playerFloor = Math.floor((this.z + 0.25) * 2);
    if (this.z === playerFloor / 2) {
      this.velocity = this.state.keys.space ? Billboard.jumpSpeed : -0.1;
    } else {
      this.velocity -= this.tireRate * ms;
    }

    const levelFloorHeight = this.level.getFloor(this.body.x, this.body.y) / 2;
    this.z = Math.max(
      levelFloorHeight,
      this.z + deltaTime * Billboard.jumpSpeed * this.velocity
    );

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
    this.mesh.up = new Vector3(0, 0, 1);
    this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
  }
}
