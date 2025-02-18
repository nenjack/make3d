import { Level } from './level';
import { Direction, TexturedBillboardProps } from './model';
import { MovingBillboard } from './moving-billboard';
import { renderer, state } from './state';
import { ViewLevel } from './view-level';

export class Player extends MovingBillboard {
  static readonly DIRECTIONS: Direction[] = ['left', 'right', 'down', 'up'];

  readonly isPlayer = true;
  readonly state = state;

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props, state);
    this.spawn(level);

    if (level instanceof ViewLevel) {
      renderer.camera.ready({ level, ref: this });
      renderer.scene.add(level.mesh);
    }
  }

  update(ms: number) {
    state.mouse.updateMouseXY();
    super.update(ms);
  }

  protected getDirection() {
    return (
      Player.DIRECTIONS.find((direction) => !!this.state.keys[direction]) ||
      (this.state.mouseDown
        ? Math.abs(this.state.mouse.x) > Math.abs(this.state.mouse.y)
          ? this.state.mouse.x > 0
            ? 'right'
            : 'left'
          : this.state.mouse.y > 0
            ? 'down'
            : 'up'
        : this.direction)
    );
  }
}
