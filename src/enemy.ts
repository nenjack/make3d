import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { TexturedBillboard } from './textured-billboard';

export class Enemy extends TexturedBillboard {
  static readonly maxSpeed = 1000;
  static readonly maxRotation = 100;

  readonly isPlayer = false;

  speed = Enemy.maxSpeed;
  rotation = Enemy.maxRotation;

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);
    this.spawn(level);
  }

  protected update(ms: number) {
    super.update(ms);

    this.speed -= ms;
    this.rotation -= ms;

    if (this.rotation < 0) {
      this.rotation = Enemy.maxRotation;

      ['left', 'right'].forEach((key) => {
        this.state.keys[key] = false;
      });

      if (Math.random() < ms / 100) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true;
      }
    }

    if (this.speed < 0) {
      this.speed = Enemy.maxSpeed;

      ['up', 'down'].forEach((key) => {
        this.state.keys[key] = false;
      });

      this.state.keys[Math.random() < 0.9 ? 'up' : 'down'] = true;
    }

    this.state.keys.space = Math.random() < ms / 200;
  }
}
