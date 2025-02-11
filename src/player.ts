import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { renderer, state } from './state';
import { TexturedBillboard } from './textured-billboard';
import { ViewLevel } from './view-level';

export class Player extends TexturedBillboard {
  readonly isPlayer = true;
  readonly state = state;

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);

    this.spawn(level);

    if (level instanceof ViewLevel) {
      renderer.camera.ready({ level, ref: this });
      renderer.scene.add(level.mesh);
    }
  }
}
