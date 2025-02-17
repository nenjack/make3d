import { Texture, Vector3 } from 'three';
import { Box } from './box';
import { Level } from './level';
import { floors, physics } from './state';
import { getMatrix } from './utils';
import { Cactus } from './cactus';

export class ViewLevel extends Level {
  static readonly cactusChance = 0.2;

  mesh: Box;

  constructor(textures: Texture[]) {
    super();

    this.mesh = this.createMesh(textures);
  }

  createBox(x: number, y: number, height: number) {
    for (let floor = 0; floor < height; floor++) {
      physics.createBox({ x, y }, 1, 1, {
        isStatic: true,
        group: floors[floor]
      });
    }
  }

  createMesh(textures: Texture[]) {
    const mesh = new Box(textures, Level.cols, Level.rows);

    this.heights.forEach((row: number[], x: number) => {
      row.forEach((height: number, y: number) => {
        if (height) {
          mesh.setMatrixAt(
            y * Level.rows + x,
            getMatrix(
              new Vector3(x, height / 4 - 0.75, y),
              new Vector3(1, height / 2, 1)
            )
          );

          const realX = x - Level.cols / 2;
          const realY = y - Level.rows / 2;
          this.createBox(realX, realY, height);
          if (Math.random() < ViewLevel.cactusChance) {
            new Cactus(this, realX + 0.5, realY + 0.5);
          }
        }
      });
    });

    mesh.position.set(-Level.cols / 2, 0, -Level.rows / 2);

    return mesh;
  }
}
