import { Vector3 } from 'three';
import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { renderer, state } from './state';
import { TexturedBillboard } from './textured-billboard';

export class Player extends TexturedBillboard {
  readonly isPlayer = true;
  readonly state = state;

  protected direction = 'up';

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);
    this.init(level);
  }

  protected update(ms: number) {
    super.update(ms);

    this.setDirection();

    const x = Math.sin(-state.direction) * renderer.camera.distance;
    const y = Math.cos(-state.direction) * renderer.camera.distance;

    renderer.camera.position.lerp(
      new Vector3(
        Math.max(1, Math.min(this.level.size - 2, this.body.x - x)),
        Math.max(1, Math.min(this.level.size - 2, this.body.y - y)),
        0.5 + renderer.camera.distance * 0.67
      ),
      ms / 250
    );

    const position = new Vector3(this.body.x, this.body.y, this.z).add(
      new Vector3(0, 0, 1)
    );

    renderer.camera.lookAt(position);
  }

  protected setDirection() {
    TexturedBillboard.directions.some((direction) => {
      if (this.state.keys[direction]) {
        this.direction = direction;

        return true;
      }
    });
  }

  protected getDirection() {
    return this.direction;
  }
}
