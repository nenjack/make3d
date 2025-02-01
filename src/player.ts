import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { renderer, state } from './state';
import { TexturedBillboard } from './textured-billboard';

export class Player extends TexturedBillboard {
  static readonly cameraLerpRatio = 0.0025;

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

    camera.updatePosition(
      this.state.direction,
      this.body.x,
      this.body.y,
      ms * Player.cameraLerpRatio
    );
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
