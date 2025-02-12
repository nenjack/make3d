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
  scaleChanged = true;
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
    renderer.animations.push((ms: number) => {
      this.update(ms);
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
    const directionIndex = Math.round((2 * radians) / Math.PI); // Poprawione zaokrąglanie

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

  protected update(ms: number) {
    const deltaTime = ms / 1000;
    const floorZ = this.getFloorZ(); // Obliczamy raz
    const gear = this.gear;

    let moveSpeed = gear * Billboard.moveSpeed * deltaTime;
    if (this.z < waterZ) moveSpeed *= 0.5; // Optymalizacja: zamiast /= 2

    if (this.z > floorZ) {
      this.velocity -= Billboard.gravity * deltaTime;
    } else {
      this.velocity = this.state.keys.space ? Billboard.jumpSpeed : 0;
    }

    if (this.velocity !== 0 || this.z !== floorZ) {
      this.z = Math.max(
        this.z + deltaTime * Billboard.jumpSpeed * this.velocity,
        floorZ,
        0
      );
    }

    this.body.group = floors[Math.floor(this.z * 2 + 0.5)];

    this.updateDirectionFromKeys();

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
            (gear || 1) * Billboard.rotateSpeed * deltaTime * scale
        );
      }
    }

    if (moveSpeed !== 0) {
      this.body.move(moveSpeed);
      if (this.body.system) this.body.system.separateBody(this.body);
    }

    this.mesh.position.set(this.body.x, this.z, this.body.y);
    this.mesh.quaternion.copy(renderer.camera.quaternion);
    this.mesh.up = renderer.camera.up;

    // Aktualizujemy skalę tylko wtedy, gdy się zmieniła
    this.scaleChanged = this.mesh.scale.x !== this.scale.x;
    if (this.scaleChanged) {
      this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
      this.scaleChanged = false;
    }
  }
}
