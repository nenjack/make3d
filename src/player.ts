import { Camera } from './camera';
import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { renderer, state } from './state';
import { TexturedBillboard } from './textured-billboard';
import { ViewLevel } from './view-level';

export class Player extends TexturedBillboard {
  readonly isPlayer = true;
  readonly state = state;

  protected direction = 'up';

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);

    this.spawn(level);

    renderer.camera.setLevel(level);
    renderer.camera.setRef(this);

    if (level instanceof ViewLevel) {
      renderer.scene.add(level.mesh);

      setTimeout(() => {
        // necessary evil
        renderer.camera.onCameraUpdate();
        renderer.animations.push((ms: number) => {
          renderer.camera.onCameraUpdate(ms * Camera.lerpRatio);
        });
      }, 100);
    }
  }

  protected update(ms: number) {
    super.update(ms);

    this.setDirection();
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
