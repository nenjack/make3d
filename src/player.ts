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

    renderer.camera.setPlayer(this);
  }

  protected update(ms: number) {
    super.update(ms);

    this.setDirection();

    const { camera } = renderer;
    const targetX = this.body.x - Math.sin(-state.direction) * camera.distance;
    const targetY = this.body.y - Math.cos(-state.direction) * camera.distance;

    camera.position.lerp(camera.getPosition(targetX, targetY), ms / 250);
    camera.lookAt(new Vector3(this.body.x, this.body.y, this.z + 1));
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
