import { Level } from './level';
import { TexturedBillboardProps } from './model';
import { MovingBillboard } from './moving-billboard';

export class Enemy extends MovingBillboard {
  static readonly MAX_SPEED = 0;
  static readonly MAX_ROTATION = 100;
  static readonly JUMP_CHANCE = 0.001;
  static readonly ROTATE_CHANCE = 0.03;

  readonly isPlayer = false;

  speed = Enemy.MAX_SPEED;
  rotation = Enemy.MAX_ROTATION;

  constructor(level: Level, props: TexturedBillboardProps) {
    super(props);
    this.spawn(level);
  }

  update(ms = 0) {
    super.update(ms);

    this.speed -= ms;
    this.rotation -= ms;

    if (this.rotation < 0) {
      this.rotation = Enemy.MAX_ROTATION;

      // Reset kierunków bocznych (bez tworzenia tablicy)
      this.state.keys.left = false;
      this.state.keys.right = false;

      // Losowa zmiana kierunku
      if (Math.random() < ms * Enemy.ROTATE_CHANCE) {
        this.state.keys[Math.random() < 0.5 ? 'left' : 'right'] = true;
      }
    }

    if (this.speed < 0) {
      this.speed = Enemy.MAX_SPEED;

      // 90% szansy na ruch w górę
      this.state.keys.up = Math.random() < 0.9;
    }

    // Skok (uniknięcie podwójnego `Math.random`)
    const jumpChance = ms * Enemy.JUMP_CHANCE;
    this.state.keys.space = Math.random() < jumpChance;
  }
}
