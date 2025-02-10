import { Texture, Vector3 } from 'three';
import { Box } from './box';
import { Level } from './level';
import { floors, physics } from './state';
import { getMatrix } from './utils';

export class ViewLevel extends Level {
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

          this.createBox(x, y, height);
        }
      });
    });

    return mesh;
  }
}
