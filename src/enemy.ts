import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { TexturedBillboard } from './textured-billboard';

export class Enemy extends TexturedBillboard {
  static readonly maxSpeed = 0;
  static readonly maxRotation = 100;
  static readonly jumpChance = 0.001;
  static readonly rotateChance = 0.03;

  readonly isPlayer = false;

  speed = Enemy.maxSpeed;
  rotation = Enemy.maxRotation;

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);
    this.spawn(level);
  }

  protected update(ms = 0) {
    super.update(ms);

    this.speed -= ms;
    this.rotation -= ms;

    if (this.rotation < 0) {
      this.rotation = Enemy.maxRotation;

      // Reset kierunków bocznych (bez tworzenia tablicy)
      this.state.keys.left = false;
      this.state.keys.right = false;

      // Losowa zmiana kierunku
      if (Math.random() < ms * Enemy.rotateChance) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true;
      }
    }

    if (this.speed < 0) {
      this.speed = Enemy.maxSpeed;

      // 90% szansy na ruch w górę
      this.state.keys.up = Math.random() < 0.9;
    }

    // Skok (uniknięcie podwójnego `Math.random`)
    const jumpChance = ms * Enemy.jumpChance;
    this.state.keys.space = Math.random() < jumpChance;
  }
}
