```ts
import {
  addEventListeners,
  Enemy,
  init,
  Player,
  state,
  textures,
  ViewLevel
} from 'engine25d';

const props = {
  materialName: 'elf',
  totalFrames: 6,
  frameDuration: 120,
  animationsOrder: {
    down: 4,
    up: 2,
    default: 0
  }
};

addEventListeners();

export const start = async (enemies = 64) => {
  await init();

  const level = new ViewLevel([
    textures.groundE,
    textures.groundW,
    textures.groundN,
    textures.groundS,
    textures.grass,
    textures.grass
  ]);

  state.player = new Player(level, props);

  for (let i = 0; i < enemies; i++) {
    new Enemy(level, props);
  }
};
```
